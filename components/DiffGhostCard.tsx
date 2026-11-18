'use client';

import { Check, X } from 'lucide-react';
import { PendingDiff } from '@/lib/career-types';

interface DiffGhostCardProps {
  diff: PendingDiff;
  onAccept: (diff: PendingDiff) => void;
  onDiscard: (diffId: string) => void;
}

export function DiffGhostCard({ diff, onAccept, onDiscard }: DiffGhostCardProps) {
  const isAddition = diff.targetType === 'add_experience' || diff.targetType === 'add_project';

  return (
    <div className="no-print absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl border border-indigo-200/80 bg-white/95 backdrop-blur-xl shadow-[0_16px_44px_rgba(15,23,42,0.13)] overflow-hidden transition-all">
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-indigo-100/80 bg-indigo-50/40">
        <div className="flex items-center gap-2">
          {isAddition && (
            <span className="rounded-full bg-indigo-100/80 text-indigo-900 px-2.5 py-0.5 text-[10.5px] font-medium">
              New addition
            </span>
          )}
          {diff.sourceEvidence && (
            <span className="rounded-full bg-indigo-100/80 text-indigo-800 px-2.5 py-0.5 text-[10.5px] font-medium">
              Grounded
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDiscard(diff.id)}
          title="Dismiss"
          className="rounded-full p-1 text-neutral-400 hover:bg-indigo-100/60 hover:text-indigo-900 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Clean Body + Action Footer */}
      <div className="px-4 py-3.5">
        {!isAddition && diff.originalText && (
          <p className="text-[11.5px] leading-[1.6] text-neutral-500 mb-2">
            <span className="diff-amber-squiggle">{diff.originalText}</span>
          </p>
        )}
        <p className="text-[12.5px] leading-[1.6] text-neutral-800">{diff.proposedText}</p>
        {diff.reason && (
          <p className="text-[11px] text-neutral-400 mt-1.5 leading-snug">{diff.reason}</p>
        )}

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onDiscard(diff.id)}
            className="rounded-full px-3 py-1 text-[11.5px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => onAccept(diff)}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-100/80 hover:bg-indigo-200/80 text-indigo-950 px-3.5 py-1 text-[11.5px] font-medium transition cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
