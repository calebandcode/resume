'use client';

import { Check, CheckCheck, CircleDashed, FileDiff, Search, X } from 'lucide-react';
import { PendingDiff } from '@/lib/career-types';

export interface TailorReport {
  roleTitle: string;
  matchScore: number;
  truthfulSummary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
}

interface TailorCanvasPanelProps {
  open: boolean;
  report: TailorReport | null;
  diffs: PendingDiff[];
  onClose: () => void;
  onAcceptDiff: (diff: PendingDiff) => void;
  onDiscardDiff: (diffId: string) => void;
  onAcceptAll: () => void;
}

export function TailorCanvasPanel({
  open,
  report,
  diffs,
  onClose,
  onAcceptDiff,
  onDiscardDiff,
  onAcceptAll,
}: TailorCanvasPanelProps) {
  if (!report) return null;

  return (
    <aside
      aria-hidden={!open}
      className={`no-print fixed top-11 bottom-0 left-0 z-30 w-full sm:w-[400px] border-r border-neutral-200/80 bg-[#fafafa]/95 backdrop-blur-xl flex flex-col transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        open ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200/70">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11.5px] font-semibold text-indigo-700 shrink-0">
            {report.matchScore}% Match
          </span>
          <span className="text-neutral-300">·</span>
          <span className="text-[12.5px] font-medium text-neutral-800 truncate">
            {report.roleTitle}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close canvas panel"
          className="p-1 text-neutral-400 hover:text-neutral-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Flat Editorial Stream (no boxed containers, hidden scrollbar, Lenis-safe scroll) */}
      <div
        data-lenis-prevent
        className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-5 text-[12.5px]"
      >
        {/* Summary */}
        <p className="text-neutral-700 leading-relaxed">{report.truthfulSummary}</p>

        {/* Matched Keywords */}
        {report.matchedKeywords.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11.5px] text-neutral-500">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-800">
                Matched {report.matchedKeywords.length} requirements
              </span>
            </div>
            <p className="pl-5 text-[11.5px] text-neutral-600 leading-relaxed">
              {report.matchedKeywords.join(' · ')}
            </p>
          </div>
        )}

        {/* Missing Requirements */}
        {report.missingKeywords.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11.5px] text-neutral-500">
              <CircleDashed className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="font-medium text-neutral-800">
                Missing requirements
              </span>
            </div>
            <p className="pl-5 text-[11.5px] text-amber-800 leading-relaxed">
              {report.missingKeywords.join(' · ')}
            </p>
          </div>
        )}

        {/* Grounded Diffs */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-[11.5px] text-neutral-500">
            <FileDiff className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-medium text-neutral-800">
              {diffs.length > 0
                ? `Proposed ${diffs.length} grounded ${diffs.length === 1 ? 'edit' : 'edits'}`
                : 'All suggestions applied'}
            </span>
          </div>

          {diffs.map((diff, idx) => (
            <div key={diff.id} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span className="font-mono">
                  Edit #{idx + 1} · {diff.targetType === 'summary' ? 'Summary' : 'Experience'}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onDiscardDiff(diff.id)}
                    className="text-neutral-400 hover:text-neutral-800 transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => onAcceptDiff(diff)}
                    className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:text-indigo-950 transition cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    Accept
                  </button>
                </div>
              </div>

              <div className="font-mono text-[11px] leading-[1.5]">
                {diff.originalText && (
                  <div className="bg-amber-50/65 text-neutral-600 px-2 py-1 flex gap-1.5">
                    <span className="text-amber-600 select-none">−</span>
                    <span>{diff.originalText}</span>
                  </div>
                )}
                <div className="bg-indigo-50/70 text-neutral-900 px-2 py-1 flex gap-1.5">
                  <span className="text-indigo-600 select-none">+</span>
                  <span>{diff.proposedText}</span>
                </div>
              </div>

              {diff.reason && (
                <p className="text-[11px] text-neutral-500 leading-snug">{diff.reason}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      {diffs.length > 0 && (
        <div className="px-4 py-2.5 border-t border-neutral-200/80 flex items-center justify-between text-[12px]">
          <span className="text-neutral-500">
            {diffs.length} pending {diffs.length === 1 ? 'edit' : 'edits'}
          </span>
          <button
            type="button"
            onClick={onAcceptAll}
            className="inline-flex items-center gap-1.5 font-medium text-neutral-800 hover:text-neutral-950 transition cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Accept all
          </button>
        </div>
      )}
    </aside>
  );
}
