'use client';

import {
  Upload,
  Target,
  Download,
  Mic,
} from 'lucide-react';

interface MinimalTopNavProps {
  onImportClick: () => void;
  onOpenTailor: () => void;
  onOpenInterview: () => void;
  onExportPdf: () => void;
}

export function MinimalTopNav({
  onImportClick,
  onOpenTailor,
  onOpenInterview,
  onExportPdf,
}: MinimalTopNavProps) {
  return (
    <nav className="no-print fixed top-0 inset-x-0 z-40 h-11 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between text-[12.5px] text-neutral-700">
      {/* Left Action Group */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={onImportClick}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-neutral-100 transition cursor-pointer shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
          <span>Import CV</span>
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-1 shrink-0" />

        <button
          type="button"
          onClick={onOpenTailor}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-neutral-100 transition cursor-pointer shrink-0"
        >
          <Target className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
          <span>Tailor to Job</span>
        </button>

        <button
          type="button"
          onClick={onOpenInterview}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-neutral-100 transition cursor-pointer shrink-0"
        >
          <Mic className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
          <span>Mock Interview</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-neutral-100 transition cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
          <span>Export PDF</span>
        </button>
      </div>
    </nav>
  );
}
