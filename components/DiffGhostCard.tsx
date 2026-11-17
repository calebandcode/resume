'use client';

import { Check, X, ShieldCheck } from 'lucide-react';
import { PendingDiff } from '@/lib/career-types';

interface DiffGhostCardProps {
  diff: PendingDiff;
  onAccept: (diff: PendingDiff) => void;
  onDiscard: (diffId: string) => void;
}

export function DiffGhostCard({ diff, onAccept, onDiscard }: DiffGhostCardProps) {
  const isAddition = diff.targetType === 'add_experience' || diff.targetType === 'add_project';

  return (
    <div className="no-print mt-2 mb-3 rounded-2xl border border-blue-200/80 bg-white/95 backdrop-blur-md p-3.5 shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              {isAddition ? 'New addition' : 'Suggested edit'}
            </span>
            <span className="text-[11px] text-neutral-500">{diff.reason}</span>
          </div>

          {!isAddition && diff.originalText && (
            <p className="text-[12.5px] text-rose-600/80 line-through decoration-rose-300 leading-relaxed">
              {diff.originalText}
            </p>
          )}

          <p className="text-[13px] text-emerald-800 bg-emerald-50/70 border border-emerald-100 rounded-xl px-2.5 py-1.5 leading-relaxed">
            {diff.proposedText}
          </p>

          {diff.sourceEvidence && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Grounded in: {diff.sourceEvidence}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onAccept(diff)}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 text-[11.5px] font-medium transition cursor-pointer"
          >
            <Check className="w-3 h-3" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => onDiscard(diff.id)}
            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1.5 text-[11.5px] font-medium transition cursor-pointer"
          >
            <X className="w-3 h-3" />
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

