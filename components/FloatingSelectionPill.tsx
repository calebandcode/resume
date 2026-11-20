'use client';

import { Bold, Italic, Underline, Wand2, TrendingUp, Scissors } from 'lucide-react';

export interface SelectionContext {
  text: string;
  targetType: 'summary' | 'experience_bullet' | 'project_highlight';
  parentId?: string;
  targetId?: string;
  rect: { top: number; left: number };
}

interface FloatingSelectionPillProps {
  selection: SelectionContext;
  loading: boolean;
  onFormat: (cmd: 'bold' | 'italic' | 'underline') => void;
  onAiAction: (
    action: 'quantify' | 'rewrite' | 'punchy' | 'custom',
    options?: { instruction?: string; audio?: Blob }
  ) => void;
  onAttachToInput: (selection: SelectionContext) => void;
}

export function FloatingSelectionPill({
  selection,
  loading,
  onFormat,
  onAiAction,
  onAttachToInput,
}: FloatingSelectionPillProps) {
  return (
    <div
      style={{
        top: Math.max(16, selection.rect.top - 58),
        left: selection.rect.left,
      }}
      onMouseDown={(e) => e.preventDefault()}
      className="no-print fixed z-50 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/90 backdrop-blur-xl px-2 py-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.12),0_2px_6px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          onClick={() => onAttachToInput(selection)}
          className="px-2.5 py-1 rounded-full text-[12px] font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 transition cursor-pointer"
        >
          Ask AI
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        {/* Formatting controls with crisp dark shortcut tooltips */}
        <div className="flex items-center gap-0.5">
          <div className="relative group">
            <button
              type="button"
              onClick={() => onFormat('bold')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 text-white text-[11px] font-medium px-2 py-0.5 shadow-md">
              Bold ⌘B
            </span>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => onFormat('italic')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 text-white text-[11px] font-medium px-2 py-0.5 shadow-md">
              Italic ⌘I
            </span>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => onFormat('underline')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900 text-white text-[11px] font-medium px-2 py-0.5 shadow-md">
              Underline ⌘U
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        {/* Inline AI quick actions */}
        <button
          type="button"
          disabled={loading}
          onClick={() => onAiAction('rewrite')}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
        >
          <Wand2 className="w-3 h-3 text-purple-600" />
          Rewrite
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onAiAction('quantify')}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
        >
          <TrendingUp className="w-3 h-3 text-blue-600" />
          Quantify
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => onAiAction('punchy')}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-700 hover:bg-neutral-100 transition cursor-pointer disabled:opacity-50"
        >
          <Scissors className="w-3 h-3 text-pink-600" />
          Punchy
        </button>
      </div>
    </div>
  );
}
