'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Mic,
  Square,
  ArrowUp,
  ChevronDown,
  Loader2,
  Upload,
  Download,
  Globe,
  Check,
  X,
  CornerDownRight,
  Target,
} from 'lucide-react';
import type { SelectionContext } from './FloatingSelectionPill';

interface BottomOrbBarProps {
  loading: boolean;
  statusNote?: string | null;
  viewMode: 'resume' | 'portfolio';
  showLinter: boolean;
  issueCount: number;
  publishing: boolean;
  attachedSelection?: SelectionContext | null;
  tailorMode: boolean;
  shiftedForDrawer?: boolean;
  hideOnMobile?: boolean;
  onClearAttachedSelection: () => void;
  onClearTailorMode: () => void;
  onChangeViewMode: (mode: 'resume' | 'portfolio') => void;
  onToggleLinter: () => void;
  onImportClick: () => void;
  onOpenTailor: () => void;
  onExportPdf: () => void;
  onPublishPortfolio: () => void;
  onSubmitCommand: (payload: { text?: string; audio?: Blob }) => Promise<void>;
}

export function BottomOrbBar({
  loading,
  statusNote,
  viewMode,
  showLinter,
  issueCount,
  publishing,
  attachedSelection,
  tailorMode,
  shiftedForDrawer = false,
  hideOnMobile = false,
  onClearAttachedSelection,
  onClearTailorMode,
  onChangeViewMode,
  onToggleLinter,
  onImportClick,
  onOpenTailor,
  onExportPdf,
  onPublishPortfolio,
  onSubmitCommand,
}: BottomOrbBarProps) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (attachedSelection || tailorMode) {
      inputRef.current?.focus();
    }
  }, [attachedSelection, tailorMode]);

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size > 0) {
          await onSubmitCommand({ audio: blob, text: text.trim() || undefined });
          setText('');
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert('Microphone permission is required for voice notes. You can still type below!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    const msg = text.trim();
    setText('');
    await onSubmitCommand({ text: msg });
  };

  return (
    <div
      className={`no-print fixed bottom-6 -translate-x-1/2 z-40 flex-col items-center gap-2.5 w-full max-w-2xl px-4 transition-[left] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hideOnMobile ? 'hidden lg:flex' : 'flex'
      } ${shiftedForDrawer ? 'left-1/2 lg:left-[calc(50%+200px)]' : 'left-1/2'}`}
    >
      {statusNote && (
        <div className="rounded-full bg-neutral-900/90 backdrop-blur-md text-white text-[12px] px-3.5 py-1.5 shadow-lg">
          {statusNote}
        </div>
      )}

      <div className="relative w-full">
        {/* "+" Popover Menu */}
        <div
          aria-hidden={!plusOpen}
          className={`absolute bottom-16 left-2 z-50 w-56 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] origin-bottom-left transition-all duration-200 ease-out ${
            plusOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setPlusOpen(false);
              onImportClick();
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer text-left"
          >
            <Upload className="w-4 h-4 text-neutral-500" />
            Import PDF / Photo CV
          </button>

          <button
            type="button"
            onClick={() => {
              setPlusOpen(false);
              onOpenTailor();
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer text-left"
          >
            <Target className="w-4 h-4 text-indigo-600" />
            Tailor to Job
          </button>

          <button
            type="button"
            onClick={() => {
              setPlusOpen(false);
              onToggleLinter();
            }}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer text-left"
          >
            <span className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full ml-1 mr-1 ${
                  showLinter ? 'bg-neutral-800' : 'bg-neutral-300'
                }`}
              />
              Truth Linter
            </span>
            {issueCount > 0 && (
              <span className="text-[11px] font-medium text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                {issueCount}
              </span>
            )}
          </button>

          <div className="h-px bg-neutral-100 my-1" />

          <button
            type="button"
            onClick={() => {
              setPlusOpen(false);
              onExportPdf();
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer text-left"
          >
            <Download className="w-4 h-4 text-neutral-500" />
            Export PDF
          </button>

          <button
            type="button"
            disabled={publishing}
            onClick={() => {
              setPlusOpen(false);
              onPublishPortfolio();
            }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-100 transition cursor-pointer text-left disabled:opacity-50"
          >
            <Globe className="w-4 h-4 text-neutral-500" />
            {publishing ? 'Publishing...' : 'Publish Portfolio'}
          </button>
        </div>

        {/* Mode Selector Popover ("Resume" / "Portfolio") */}
        <div
          aria-hidden={!modeOpen}
          className={`absolute bottom-16 right-12 z-50 w-44 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] origin-bottom-right transition-all duration-200 ease-out ${
            modeOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onChangeViewMode('resume');
              setModeOpen(false);
            }}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-[13px] text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
          >
            <span>Resume</span>
            {viewMode === 'resume' && <Check className="w-3.5 h-3.5 text-neutral-900" />}
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeViewMode('portfolio');
              setModeOpen(false);
            }}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-[13px] text-neutral-800 hover:bg-neutral-100 transition cursor-pointer"
          >
            <span>Portfolio</span>
            {viewMode === 'portfolio' && <Check className="w-3.5 h-3.5 text-neutral-900" />}
          </button>
        </div>

        {/* Gemini-Style Input Card */}
        <form
          onSubmit={handleSubmit}
          className={`w-full flex flex-col bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] border border-neutral-200/60 transition-[border-radius] ${
            attachedSelection || tailorMode ? 'rounded-[28px] p-2.5' : 'rounded-full'
          }`}
        >
          {/* Quoted Selection (grey block inside the input) */}
          {attachedSelection && (
            <div className="group relative flex items-start gap-3 rounded-[20px] bg-[#f0f0f0] pl-3.5 pr-9 py-2.5 mb-1">
              <CornerDownRight className="w-4 h-4 mt-[3px] text-neutral-500 shrink-0 stroke-[1.75]" />
              <p className="line-clamp-3 text-[13.5px] leading-[1.5] text-neutral-700">
                {attachedSelection.text}
              </p>
              <button
                type="button"
                onClick={onClearAttachedSelection}
                className="absolute top-2 right-2 rounded-full p-1 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-neutral-200 hover:text-neutral-800 transition cursor-pointer"
                title="Remove selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {tailorMode ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => {
                  setPlusOpen(false);
                  setModeOpen(false);
                }}
                disabled={loading}
                placeholder="Paste the job description to tailor your resume..."
                className="w-full bg-transparent text-[15px] text-neutral-800 placeholder:text-neutral-500 focus:outline-none px-2.5 py-2"
              />
              <div className="w-full flex items-center justify-between gap-2 pt-1 px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setModeOpen(false);
                      setPlusOpen((v) => !v);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer shrink-0"
                    title="Import CV, Linter, Export & Publish"
                  >
                    <Plus
                      className={`w-5 h-5 stroke-[1.75] transition-transform duration-200 ease-out ${
                        plusOpen ? 'rotate-45' : 'rotate-0'
                      }`}
                    />
                  </button>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f0f0] px-3 py-1.5 text-[13px] font-medium text-neutral-800">
                    <Target className="w-3.5 h-3.5 text-neutral-700 stroke-[1.75]" />
                    <span>Tailor to Job</span>
                    <button
                      type="button"
                      onClick={onClearTailorMode}
                      className="ml-0.5 rounded-full p-0.5 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition cursor-pointer"
                      title="Exit Tailor mode"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPlusOpen(false);
                      setModeOpen((v) => !v);
                    }}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13.5px] font-medium text-neutral-700 hover:bg-neutral-100 transition cursor-pointer shrink-0"
                  >
                    <span>{viewMode === 'resume' ? 'Resume' : 'Portfolio'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center disabled:opacity-35 transition cursor-pointer shrink-0"
                    title="Analyze & Tailor"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
          <div className={`w-full flex items-center gap-2 ${attachedSelection ? 'h-12 px-1.5' : 'h-14 px-3.5'}`}>
          <button
            type="button"
            onClick={() => {
              setModeOpen(false);
              setPlusOpen((v) => !v);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition cursor-pointer shrink-0"
            title="Import CV, Linter, Export & Publish"
          >
            <Plus
              className={`w-5 h-5 stroke-[1.75] transition-transform duration-200 ease-out ${
                plusOpen ? 'rotate-45' : 'rotate-0'
              }`}
            />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => {
              setPlusOpen(false);
              setModeOpen(false);
            }}
            disabled={loading}
            placeholder={
              recording
                ? 'Listening... tap mic to finish'
                : attachedSelection
                  ? 'How should we refine this?'
                  : viewMode === 'portfolio'
                    ? 'Speak or ask to update your portfolio...'
                    : 'Speak or ask to update your resume...'
            }
            className="flex-1 bg-transparent text-[15px] text-neutral-800 placeholder:text-neutral-500 focus:outline-none px-1"
          />

          <button
            type="button"
            onClick={() => {
              setPlusOpen(false);
              setModeOpen((v) => !v);
            }}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13.5px] font-medium text-neutral-700 hover:bg-neutral-100 transition cursor-pointer shrink-0"
          >
            <span>{viewMode === 'resume' ? 'Resume' : 'Portfolio'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          </button>

          {text.trim() ? (
            <button
              type="submit"
              disabled={loading}
              className="w-9 h-9 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center disabled:opacity-40 transition cursor-pointer shrink-0"
              title="Send"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                recording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              title={recording ? 'Stop recording' : 'Voice input'}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : recording ? (
                <Square className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Mic className="w-[18px] h-[18px] stroke-[1.75]" />
              )}
            </button>
          )}
          </div>
          )}
        </form>
      </div>
    </div>
  );
}
