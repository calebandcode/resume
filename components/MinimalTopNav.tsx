'use client';

import { useState } from 'react';
import {
  FileText,
  Globe,
  Upload,
  Target,
  Download,
  ChevronDown,
  Check,
  X,
  SlidersHorizontal,
  Mic,
} from 'lucide-react';

interface MinimalTopNavProps {
  viewMode: 'resume' | 'portfolio';
  showLinter: boolean;
  issueCount: number;
  publishing: boolean;
  onChangeViewMode: (mode: 'resume' | 'portfolio') => void;
  onToggleLinter: () => void;
  onImportClick: () => void;
  onOpenTailor: () => void;
  onOpenInterview: () => void;
  onExportPdf: () => void;
  onPublishPortfolio: () => void;
}

export function MinimalTopNav({
  viewMode,
  showLinter,
  issueCount,
  publishing,
  onChangeViewMode,
  onToggleLinter,
  onImportClick,
  onOpenTailor,
  onOpenInterview,
  onExportPdf,
  onPublishPortfolio,
}: MinimalTopNavProps) {
  const [hidden, setHidden] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        title="Show toolbar"
        className="no-print fixed top-2.5 right-4 z-40 rounded-full border border-neutral-200/80 bg-white/90 backdrop-blur-md px-3 py-1 text-[11.5px] text-neutral-600 hover:text-neutral-900 shadow-sm transition cursor-pointer"
      >
        Toolbar
      </button>
    );
  }

  return (
    <nav className="no-print fixed top-0 inset-x-0 z-40 h-11 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between text-[12.5px] text-neutral-700">
      {/* Left Action Group */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {/* View Mode Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModeOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-800 transition cursor-pointer shrink-0"
          >
            {viewMode === 'resume' ? (
              <FileText className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
            )}
            <span>{viewMode === 'resume' ? 'Resume' : 'Portfolio'}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {modeOpen && (
            <div className="fixed top-12 left-3 z-50 w-40 rounded-xl border border-neutral-200/80 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  onChangeViewMode('resume');
                  setModeOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] hover:bg-neutral-100 cursor-pointer"
              >
                <span>Resume</span>
                {viewMode === 'resume' && <Check className="w-3.5 h-3.5 text-neutral-800" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeViewMode('portfolio');
                  setModeOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12.5px] hover:bg-neutral-100 cursor-pointer"
              >
                <span>Portfolio</span>
                {viewMode === 'portfolio' && <Check className="w-3.5 h-3.5 text-neutral-800" />}
              </button>
            </div>
          )}
        </div>

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

        <button
          type="button"
          disabled={publishing}
          onClick={onPublishPortfolio}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-neutral-100 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Globe className="w-3.5 h-3.5 text-neutral-600 stroke-[1.75]" />
          <span>{publishing ? 'Publishing...' : 'Publish'}</span>
        </button>
      </div>

      {/* Right Utility Group */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToggleLinter}
          title={showLinter ? 'Hide Truth Linter highlights' : 'Show Truth Linter highlights'}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-neutral-100 transition cursor-pointer ${
            showLinter ? 'text-neutral-900' : 'text-neutral-400'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
          {issueCount > 0 && showLinter && (
            <span className="text-[11px] text-neutral-500">{issueCount}</span>
          )}
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        <button
          type="button"
          onClick={() => setHidden(true)}
          title="Hide toolbar"
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[1.75]" />
        </button>
      </div>
    </nav>
  );
}
