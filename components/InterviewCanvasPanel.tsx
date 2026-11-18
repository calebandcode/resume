'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Loader2, MessageSquareText, X } from 'lucide-react';
import { CareerProfile, PendingDiff } from '@/lib/career-types';
import { useGeminiLive } from '@/lib/use-gemini-live';

export interface InterviewTurn {
  id: string;
  role: 'interviewer' | 'candidate';
  text: string;
  feedback?: string;
  diff?: PendingDiff;
}

const VOICES = [
  { name: 'Aoede', subtitle: 'Warm & encouraging' },
  { name: 'Puck', subtitle: 'Direct & sharp' },
  { name: 'Kore', subtitle: 'Calm & analytical' },
  { name: 'Fenrir', subtitle: 'Executive & tough' },
] as const;

interface InterviewCanvasPanelProps {
  open: boolean;
  profile: CareerProfile;
  loading: boolean;
  done: boolean;
  turns: InterviewTurn[];
  onClose: () => void;
  onClearTurns: () => void;
  onAppendTurn: (turn: InterviewTurn) => void;
  onSubmitAnswer: (payload: { text?: string; audio?: Blob }) => Promise<void>;
  onAcceptDiff: (diff: PendingDiff) => void;
  onDismissDiff: (turnId: string) => void;
  onFocusSection: (targetId: string | null) => void;
}

export function InterviewCanvasPanel({
  open,
  profile,
  turns,
  onClose,
  onClearTurns,
  onAppendTurn,
  onAcceptDiff,
  onDismissDiff,
  onFocusSection,
}: InterviewCanvasPanelProps) {
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const selectedVoice = VOICES[voiceIdx];

  const matchSectionFromText = useCallback(
    (text: string) => {
      const lower = text.toLowerCase();
      const matchedExp = profile.experience.find(
        (exp) =>
          (exp.company && lower.includes(exp.company.toLowerCase())) ||
          (exp.role && lower.includes(exp.role.toLowerCase()))
      );
      if (matchedExp) {
        onFocusSection(matchedExp.id);
      } else if (lower.includes('summary') || lower.includes('profile')) {
        onFocusSection('summary');
      }
    },
    [onFocusSection, profile.experience]
  );

  const handlePartialTranscript = useCallback(
    (role: 'interviewer' | 'candidate', partialText: string) => {
      if (role === 'interviewer') {
        matchSectionFromText(partialText);
      }
    },
    [matchSectionFromText]
  );

  const handleTranscriptTurn = useCallback(
    (role: 'interviewer' | 'candidate', transcript: string) => {
      onAppendTurn({
        id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role,
        text: transcript,
      });

      if (role === 'interviewer') {
        matchSectionFromText(transcript);
      }
    },
    [onAppendTurn, matchSectionFromText]
  );

  const handleLiveDiff = useCallback(
    (diff: PendingDiff) => {
      onAppendTurn({
        id: `live-diff-${Date.now()}`,
        role: 'interviewer',
        text: 'Proposed a grounded update from your answer:',
        diff,
      });
    },
    [onAppendTurn]
  );

  const {
    status: liveStatus,
    errorMsg: liveError,
    aiSpeaking,
    connect: startLiveCall,
    disconnect: endLiveCall,
  } = useGeminiLive({
    profile,
    voiceName: selectedVoice.name,
    onTranscriptTurn: handleTranscriptTurn,
    onPartialTranscript: handlePartialTranscript,
    onProposeDiff: handleLiveDiff,
  });

  useEffect(() => {
    if (!open && liveStatus !== 'idle') {
      endLiveCall();
      onFocusSection(null);
    }
  }, [open, liveStatus, endLiveCall, onFocusSection]);

  const pendingLiveDiffs = turns.filter((t) => Boolean(t.diff));
  const latestInterviewerTurn = [...turns]
    .reverse()
    .find((t) => t.role === 'interviewer' && !t.diff);

  const latestQuestion = (() => {
    const raw = latestInterviewerTurn?.text?.trim();
    if (!raw) return null;
    const questions = raw.match(/[^.!?]*\?/g);
    if (questions && questions.length > 0) {
      return questions[questions.length - 1].trim();
    }
    return raw;
  })();

  return (
    <aside
      aria-hidden={!open}
      className={`no-print fixed top-11 bottom-0 left-0 z-30 w-full sm:w-[400px] border-r border-neutral-200/80 bg-white/95 backdrop-blur-xl flex flex-col justify-between transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open
          ? 'translate-x-0 opacity-100 pointer-events-auto'
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Minimal Controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition cursor-pointer ${
            showTranscript
              ? 'bg-neutral-100 text-neutral-900 font-medium'
              : 'text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>Transcript</span>
        </button>

        <button
          type="button"
          onClick={() => {
            endLiveCall();
            onClose();
          }}
          title="Close interview panel"
          className="p-1 text-neutral-400 hover:text-neutral-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Stage: 4-Pill Waveform + Voice Persona OR Transcript */}
      {showTranscript ? (
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 space-y-4 text-[12.5px]"
        >
          {turns.length === 0 ? (
            <p className="text-center text-neutral-400 text-[12px] pt-16">
              Start the voice interview to see live transcription here.
            </p>
          ) : (
            turns.map((turn) => (
              <div key={turn.id} className="space-y-1.5">
                {turn.role === 'interviewer' ? (
                  <p className="text-neutral-900 font-medium leading-relaxed">{turn.text}</p>
                ) : (
                  <p className="pl-3 border-l-2 border-neutral-200 text-neutral-600 leading-relaxed">
                    {turn.text}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* 4 Chunky Monochrome Pill Waveform */}
          <div className="h-28 flex items-center justify-center gap-1.5">
            {[
              { h: 'h-14', delay: '0ms' },
              { h: 'h-11', delay: '140ms' },
              { h: 'h-20', delay: '260ms' },
              { h: 'h-16', delay: '180ms' },
            ].map((bar, idx) => (
              <span
                key={idx}
                style={{
                  animationDelay: bar.delay,
                  animationDuration: aiSpeaking ? '0.6s' : '1.05s',
                }}
                className={`w-8 rounded-full bg-[#111111] transition-transform duration-300 ${bar.h} ${
                  liveStatus === 'live' ? 'voice-pill-active' : ''
                }`}
              />
            ))}
          </div>

          {/* Persona Name + Subtitle or Current Question */}
          <div className="mt-8 space-y-2 max-w-[300px]">
            <h3 className="text-[15px] font-semibold text-[#111111]">{selectedVoice.name}</h3>
            {liveStatus === 'live' ? (
              <p className="text-[13px] text-neutral-600 leading-relaxed line-clamp-4">
                {latestQuestion || (aiSpeaking ? 'Speaking...' : 'Listening...')}
              </p>
            ) : (
              <p className="text-[12.5px] text-neutral-400">
                {liveStatus === 'connecting' ? 'Connecting...' : selectedVoice.subtitle}
              </p>
            )}
          </div>

          {/* Voice Selector Dots (hidden during active call) */}
          {liveStatus !== 'live' && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {VOICES.map((v, idx) => (
                <button
                  key={v.name}
                  type="button"
                  disabled={liveStatus === 'connecting'}
                  onClick={() => setVoiceIdx(idx)}
                  title={`${v.name} — ${v.subtitle}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer disabled:cursor-default ${
                    idx === voiceIdx
                      ? 'bg-[#111111] scale-110'
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                />
              ))}
            </div>
          )}

          {liveError && (
            <p className="mt-4 text-[11.5px] text-rose-600 max-w-[260px]">{liveError}</p>
          )}
        </div>
      )}

      {/* Live Grounded Diffs (only shown when Gemini proposes an edit from your voice) */}
      {pendingLiveDiffs.length > 0 && (
        <div
          data-lenis-prevent
          className="max-h-44 overflow-y-auto no-scrollbar px-4 py-2.5 border-t border-neutral-100 space-y-2.5 bg-neutral-50/60"
        >
          {pendingLiveDiffs.map((turn) => {
            const diff = turn.diff!;
            return (
              <div key={turn.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-mono">
                    {diff.targetType === 'summary' ? 'Summary' : 'Experience'} upgrade
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onDismissDiff(turn.id)}
                      className="text-neutral-400 hover:text-neutral-800 transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAcceptDiff(diff);
                        onDismissDiff(turn.id);
                      }}
                      className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:text-indigo-950 transition cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Accept
                    </button>
                  </div>
                </div>
                <div className="font-mono text-[10.5px] leading-[1.45]">
                  {diff.originalText && (
                    <div className="bg-amber-50/70 text-neutral-600 px-2 py-1 flex gap-1.5">
                      <span className="text-amber-600 select-none">−</span>
                      <span className="line-clamp-2">{diff.originalText}</span>
                    </div>
                  )}
                  <div className="bg-indigo-50/75 text-neutral-900 px-2 py-1 flex gap-1.5">
                    <span className="text-indigo-600 select-none">+</span>
                    <span className="line-clamp-2">{diff.proposedText}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Disclaimer + Full-Width Black Pill CTA */}
      <div className="px-5 pb-6 pt-3 space-y-3 text-center">
        <p className="text-[11px] text-neutral-400">
          Voice answers stay grounded in your real experience.
        </p>

        {liveStatus === 'live' ? (
          <button
            type="button"
            onClick={() => {
              endLiveCall();
              onFocusSection(null);
            }}
            className="w-full rounded-full bg-[#111111] hover:bg-neutral-800 text-white py-3.5 text-[13.5px] font-medium transition cursor-pointer"
          >
            End voice interview
          </button>
        ) : (
          <button
            type="button"
            disabled={liveStatus === 'connecting'}
            onClick={() => {
              onClearTurns();
              startLiveCall();
            }}
            className="w-full rounded-full bg-[#111111] hover:bg-neutral-800 text-white py-3.5 text-[13.5px] font-medium transition cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {liveStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin" />}
            {liveStatus === 'connecting' ? 'Connecting...' : 'Start voice interview'}
          </button>
        )}
      </div>
    </aside>
  );
}
