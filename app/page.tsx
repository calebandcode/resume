'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Globe,
  Download,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  MapPin,
  Code2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  CareerProfile,
  INITIAL_PROFILE,
  CLASSIC_PROFILE,
  EXECUTIVE_PROFILE,
  MODERN_PROFILE,
  PendingDiff,
  LinterDiagnostic,
} from '@/lib/career-types';
import { runCareerLinter } from '@/lib/linter';
import { FloatingSelectionPill, SelectionContext } from '@/components/FloatingSelectionPill';
import { BottomOrbBar } from '@/components/BottomOrbBar';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditorialTemplate } from '@/components/templates/EditorialTemplate';
import { ExecutiveTemplate } from '@/components/templates/ExecutiveTemplate';
import { ModernTemplate } from '@/components/templates/ModernTemplate';

type ViewMode = 'resume' | 'portfolio';
type ResumeTemplate = 'minimalist' | 'editorial' | 'executive' | 'modern';

export default function CareerCanvasPage() {
  const [profile, setProfile] = useState<CareerProfile>(INITIAL_PROFILE);
  const [hasCustomProfile, setHasCustomProfile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('resume');
  const [resumeTemplate, setResumeTemplate] = useState<ResumeTemplate>('minimalist');
  const [showLinter, setShowLinter] = useState(true);
  const [activeDiagId, setActiveDiagId] = useState<string | null>(null);

  const [pendingDiffs, setPendingDiffs] = useState<PendingDiff[]>([]);
  const [selection, setSelection] = useState<SelectionContext | null>(null);
  const [attachedSelection, setAttachedSelection] = useState<SelectionContext | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const diagnosticsByTarget = useMemo(() => runCareerLinter(profile), [profile]);

  const issueCount = useMemo(() => {
    return Object.values(diagnosticsByTarget)
      .flat()
      .filter((d) => d.severity !== 'verified').length;
  }, [diagnosticsByTarget]);

  const showToast = useCallback((msg: string) => {
    setStatusNote(msg);
    setTimeout(() => {
      setStatusNote((prev) => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  const TEMPLATES: ResumeTemplate[] = ['minimalist', 'editorial', 'executive', 'modern'];

  const cycleTemplate = (dir: -1 | 1) => {
    const idx = TEMPLATES.indexOf(resumeTemplate);
    const nextTpl = TEMPLATES[(idx + dir + TEMPLATES.length) % TEMPLATES.length];
    setResumeTemplate(nextTpl);
    setSelection(null);
    setActiveDiagId(null);
    if (!hasCustomProfile) {
      const starterMap: Record<ResumeTemplate, CareerProfile> = {
        minimalist: INITIAL_PROFILE,
        editorial: CLASSIC_PROFILE,
        executive: EXECUTIVE_PROFILE,
        modern: MODERN_PROFILE,
      };
      setProfile(starterMap[nextTpl]);
    }
  };

  // Dismiss selection pill on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelection(null);
        setActiveDiagId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Global selection listener so dragging slightly outside a block or keyboard selection always works
  useEffect(() => {
    const syncSelection = () => {
      requestAnimationFrame(() => {
        const winSel = window.getSelection();
        if (!winSel || winSel.isCollapsed) {
          setSelection(null);
          return;
        }
        const text = winSel.toString().trim();
        if (text.length < 2) {
          setSelection(null);
          return;
        }

        const anchor = winSel.anchorNode;
        const anchorEl =
          anchor instanceof HTMLElement ? anchor : anchor?.parentElement || null;
        const editableEl = anchorEl?.closest<HTMLElement>('[data-editable-type]');
        if (!editableEl) {
          return;
        }

        const targetType = editableEl.dataset.editableType as
          | 'summary'
          | 'experience_bullet'
          | 'project_highlight';
        const parentId = editableEl.dataset.parentId || undefined;
        const targetId = editableEl.dataset.targetId || undefined;

        const range = winSel.getRangeAt(0);
        const rawRect = range.getBoundingClientRect();
        const rect = rawRect.width > 0 ? rawRect : editableEl.getBoundingClientRect();

        setSelection({
          text,
          targetType,
          parentId,
          targetId,
          rect: {
            top: rect.top,
            left: rect.left + rect.width / 2,
          },
        });
      });
    };

    document.addEventListener('mouseup', syncSelection);
    document.addEventListener('keyup', syncSelection);
    return () => {
      document.removeEventListener('mouseup', syncSelection);
      document.removeEventListener('keyup', syncSelection);
    };
  }, []);

  const handleFormat = (cmd: 'bold' | 'italic' | 'underline') => {
    document.execCommand(cmd, false);
  };

  // Inline AI action from FloatingSelectionPill
  const handleInlineAi = async (
    action: 'quantify' | 'rewrite' | 'punchy' | 'custom',
    options?: { instruction?: string; audio?: Blob }
  ) => {
    if (!selection) return;
    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('selectedText', selection.text);
      formData.append('targetType', selection.targetType);
      if (selection.parentId) formData.append('parentId', selection.parentId);
      if (selection.targetId) formData.append('targetId', selection.targetId);
      formData.append('action', action);
      if (options?.instruction) formData.append('instruction', options.instruction);
      if (options?.audio) formData.append('audio', options.audio, 'voice.webm');

      const res = await fetch('/api/ai/inline', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'AI request failed');
        return;
      }

      if (data.diff) {
        setPendingDiffs((prev) => [data.diff, ...prev]);
        setSelection(null);
        window.getSelection()?.removeAllRanges();
        showToast('Suggested edit ready — review inline');
      }
    } catch {
      showToast('Network error contacting AI');
    } finally {
      setAiLoading(false);
    }
  };

  // Bottom Orb voice or text command (routes to inline edit if a selection is attached)
  const handleGlobalCommand = async (payload: { text?: string; audio?: Blob }) => {
    if (attachedSelection) {
      setAiLoading(true);
      try {
        const formData = new FormData();
        formData.append('selectedText', attachedSelection.text);
        formData.append('targetType', attachedSelection.targetType);
        if (attachedSelection.parentId) formData.append('parentId', attachedSelection.parentId);
        if (attachedSelection.targetId) formData.append('targetId', attachedSelection.targetId);
        formData.append('action', 'custom');
        if (payload.text) formData.append('instruction', payload.text);
        if (payload.audio) formData.append('audio', payload.audio, 'voice.webm');

        const res = await fetch('/api/ai/inline', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          showToast(data.error || 'AI request failed');
          return;
        }

        if (data.diff) {
          setPendingDiffs((prev) => [data.diff, ...prev]);
          setAttachedSelection(null);
          showToast('Suggested edit ready — review inline');
        }
      } catch {
        showToast('Network error contacting AI');
      } finally {
        setAiLoading(false);
      }
      return;
    }

    setAiLoading(true);
    try {
      const formData = new FormData();
      formData.append('profile', JSON.stringify(profile));
      if (payload.text) formData.append('text', payload.text);
      if (payload.audio) formData.append('audio', payload.audio, 'command.webm');

      const res = await fetch('/api/ai/command', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'AI command failed');
        return;
      }

      if (data.diffs?.length) {
        setPendingDiffs((prev) => [...data.diffs, ...prev]);
      }
      showToast(data.assistantNote || 'Proposed updates ready on canvas');
    } catch {
      showToast('Network error contacting AI');
    } finally {
      setAiLoading(false);
    }
  };

  // Accept a proposed diff into CareerProfile
  const handleAcceptDiff = (diff: PendingDiff) => {
    setProfile((prev) => {
      if (diff.targetType === 'summary') {
        return {
          ...prev,
          summary: diff.proposedText,
          summaryEvidence: diff.sourceEvidence,
        };
      }

      if (diff.targetType === 'experience_bullet' && diff.parentId && diff.targetId) {
        return {
          ...prev,
          experience: prev.experience.map((exp) =>
            exp.id !== diff.parentId
              ? exp
              : {
                  ...exp,
                  bullets: exp.bullets.map((b) =>
                    b.id !== diff.targetId
                      ? b
                      : {
                          ...b,
                          text: diff.proposedText,
                          sourceEvidence: diff.sourceEvidence,
                          verified: true,
                        }
                  ),
                }
          ),
        };
      }

      if (diff.targetType === 'project_highlight' && diff.parentId && diff.targetId) {
        return {
          ...prev,
          projects: prev.projects.map((proj) =>
            proj.id !== diff.parentId
              ? proj
              : {
                  ...proj,
                  highlights: proj.highlights.map((h) =>
                    h.id !== diff.targetId
                      ? h
                      : {
                          ...h,
                          text: diff.proposedText,
                          sourceEvidence: diff.sourceEvidence,
                          verified: true,
                        }
                  ),
                }
          ),
        };
      }

      if (diff.targetType === 'add_experience' && diff.newExperience) {
        return {
          ...prev,
          experience: [diff.newExperience, ...prev.experience],
        };
      }

      if (diff.targetType === 'add_project' && diff.newProject) {
        return {
          ...prev,
          projects: [diff.newProject, ...prev.projects],
        };
      }

      return prev;
    });

    setPendingDiffs((prev) => prev.filter((d) => d.id !== diff.id));
  };

  const handleDiscardDiff = (diffId: string) => {
    setPendingDiffs((prev) => prev.filter((d) => d.id !== diffId));
  };

  const handleImportFile = async (file: File) => {
    setAiLoading(true);
    showToast(`Reading ${file.name} with Gemini...`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ai/import', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to import CV');
        return;
      }

      if (data.profile) {
        setProfile(data.profile);
        setHasCustomProfile(true);
        setPendingDiffs([]);
        setSelection(null);
        showToast('CV imported onto canvas — highlight any line or tap the orb to refine');
      }
    } catch {
      showToast('Network error importing CV');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublishPortfolio = async () => {
    setPublishing(true);
    try {
      const res = await fetch('/api/portfolio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to publish');
        return;
      }
      setPublishedUrl(data.url);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}${data.url}`).catch(() => {});
      }
      showToast(`Published live at ${data.url} (link copied)`);
    } catch {
      showToast('Network error publishing portfolio');
    } finally {
      setPublishing(false);
    }
  };

  // Dim non-selected blocks when user highlights text (matching reference inspo)
  const dimClass = (targetId?: string) => {
    if (!selection) return 'transition-opacity duration-200';
    return selection.targetId === targetId
      ? 'opacity-100 transition-opacity duration-200'
      : 'opacity-40 transition-opacity duration-200';
  };

  return (
    <main
      className="min-h-screen pb-32 pt-12 px-4 sm:px-8 relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleImportFile(file);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelection(null);
          setActiveDiagId(null);
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                setProfile((p) => ({ ...p, avatarUrl: reader.result as string }));
              }
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />

      {isDragging && (
        <div className="no-print fixed inset-0 z-50 bg-white/75 backdrop-blur-md flex items-center justify-center p-6 pointer-events-none">
          <div className="rounded-3xl border-2 border-dashed border-blue-400 bg-white/90 px-10 py-12 text-center shadow-2xl">
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-[15px] font-semibold text-neutral-900">
              Drop your PDF or CV photo
            </p>
            <p className="text-[12.5px] text-neutral-500 mt-1">
              Gemini will extract it cleanly onto the canvas
            </p>
          </div>
        </div>
      )}
      {/* Floating Selection Pill */}
      {selection && (
        <FloatingSelectionPill
          selection={selection}
          loading={aiLoading}
          onFormat={handleFormat}
          onAiAction={handleInlineAi}
          onAttachToInput={(sel) => {
            setAttachedSelection(sel);
            setSelection(null);
            window.getSelection()?.removeAllRanges();
          }}
        />
      )}

      {/* Floating Template Prev/Next Chevrons */}
      {viewMode === 'resume' && (
        <>
          <button
            type="button"
            onClick={() => cycleTemplate(-1)}
            title="Previous template"
            className="no-print fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-neutral-200/80 bg-white/85 backdrop-blur-md text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-[0_6px_20px_rgba(15,23,42,0.08)] flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.75]" />
          </button>
          <button
            type="button"
            onClick={() => cycleTemplate(1)}
            title="Next template"
            className="no-print fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-neutral-200/80 bg-white/85 backdrop-blur-md text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-[0_6px_20px_rgba(15,23,42,0.08)] flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.75]" />
          </button>
        </>
      )}

      {/* Centered Pure Document Canvas */}
      <div className="mx-auto max-w-[800px]">
        {viewMode === 'resume' && resumeTemplate === 'modern' ? (
          <ModernTemplate
            profile={profile}
            showLinter={showLinter}
            diagnosticsByTarget={diagnosticsByTarget}
            activeDiagId={activeDiagId}
            pendingDiffs={pendingDiffs}
            dimClass={dimClass}
            onUpdateProfile={setProfile}
            onSetActiveDiagId={setActiveDiagId}
            onQuickRewrite={(sel) => {
              setSelection(sel);
              handleInlineAi('rewrite');
            }}
            onAcceptDiff={handleAcceptDiff}
            onDiscardDiff={handleDiscardDiff}
          />
        ) : viewMode === 'resume' && resumeTemplate === 'executive' ? (
          <ExecutiveTemplate
            profile={profile}
            showLinter={showLinter}
            diagnosticsByTarget={diagnosticsByTarget}
            activeDiagId={activeDiagId}
            pendingDiffs={pendingDiffs}
            dimClass={dimClass}
            onUpdateProfile={setProfile}
            onSetActiveDiagId={setActiveDiagId}
            onQuickRewrite={(sel) => {
              setSelection(sel);
              handleInlineAi('rewrite');
            }}
            onAcceptDiff={handleAcceptDiff}
            onDiscardDiff={handleDiscardDiff}
          />
        ) : viewMode === 'resume' && resumeTemplate === 'editorial' ? (
          <EditorialTemplate
            profile={profile}
            showLinter={showLinter}
            diagnosticsByTarget={diagnosticsByTarget}
            activeDiagId={activeDiagId}
            pendingDiffs={pendingDiffs}
            dimClass={dimClass}
            onUpdateProfile={setProfile}
            onSetActiveDiagId={setActiveDiagId}
            onQuickRewrite={(sel) => {
              setSelection(sel);
              handleInlineAi('rewrite');
            }}
            onAcceptDiff={handleAcceptDiff}
            onDiscardDiff={handleDiscardDiff}
          />
        ) : viewMode === 'resume' ? (
          <article className="print-sheet py-4 sm:py-8 px-4 sm:px-10 text-neutral-800">
            {/* Top Charcoal Accent Bar */}
            <div className="h-[5px] w-full bg-[#2a2a2a] mb-9" />

            {/* 3-Column Header: Photo | Name + Role + Summary | Right-Aligned Contact */}
            <div className={`flex flex-col sm:flex-row gap-7 items-start pb-8 border-b border-neutral-300/70 ${dimClass('header')}`}>
              {/* Portrait Photo (Click to upload) */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                title="Click to upload headshot"
                className="w-[100px] h-[122px] shrink-0 bg-neutral-200 overflow-hidden flex items-center justify-center text-neutral-500 hover:opacity-90 transition cursor-pointer group relative"
              >
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                ) : (
                  <span className="text-xl font-semibold tracking-tight text-neutral-500">
                    {profile.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </button>

              {/* Center: Name, Role, Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h1
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const next = e.currentTarget.textContent;
                        if (next !== null) {
                          setProfile((p) => ({ ...p, fullName: next || p.fullName }));
                        }
                      }}
                      className="text-[26px] sm:text-[28px] font-medium tracking-tight text-neutral-900 leading-tight focus:outline-none"
                    >
                      {profile.fullName}
                    </h1>
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const next = e.currentTarget.textContent;
                        if (next !== null) {
                          setProfile((p) => ({ ...p, headline: next || p.headline }));
                        }
                      }}
                      className="text-[13px] italic text-neutral-500 mt-0.5 focus:outline-none"
                    >
                      {profile.headline}
                    </p>
                  </div>

                  {/* Right-aligned Contact Info */}
                  <div className="sm:text-right text-[10px] leading-[1.6] text-neutral-500 shrink-0 pt-1">
                    {profile.addressLine1 && <div>{profile.addressLine1}</div>}
                    <div>{profile.location}</div>
                    {profile.phone && <div>{profile.phone}</div>}
                    <div>{profile.email}</div>
                  </div>
                </div>

                {/* Summary directly beneath header */}
                <div className={`mt-3.5 ${dimClass('summary')}`}>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    data-editable-type="summary"
                    data-target-id="summary"
                    onBlur={(e) => {
                      const next = e.currentTarget.textContent;
                      if (next !== null) {
                        setProfile((p) => ({ ...p, summary: next || p.summary }));
                      }
                    }}
                    className="text-[11.5px] leading-[1.65] text-neutral-600 focus:outline-none"
                  >
                    {profile.summary}
                  </p>
                  {pendingDiffs
                    .filter((d) => d.targetType === 'summary')
                    .map((d) => (
                      <DiffGhostCard
                        key={d.id}
                        diff={d}
                        onAccept={handleAcceptDiff}
                        onDiscard={handleDiscardDiff}
                      />
                    ))}
                </div>
              </div>
            </div>

            {/* Upper 2-Column Grid: Experience (Left) & Education (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-7">
              {/* Left Column: Experience */}
              <section>
                <h2
                  className={`text-[15px] font-semibold text-neutral-900 mb-4 ${dimClass(
                    'exp-heading'
                  )}`}
                >
                  Experience
                </h2>

                {pendingDiffs
                  .filter((d) => d.targetType === 'add_experience')
                  .map((d) => (
                    <DiffGhostCard
                      key={d.id}
                      diff={d}
                      onAccept={handleAcceptDiff}
                      onDiscard={handleDiscardDiff}
                    />
                  ))}

                <div className="space-y-5">
                  {profile.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className={dimClass(exp.id)}>
                        <div className="text-[11.5px] leading-snug">
                          <span className="font-semibold text-neutral-900">{exp.role}</span>
                          <span className="text-neutral-600 ml-1.5">
                            {exp.company}
                            {exp.location ? `, ${exp.location}` : ''}
                          </span>
                        </div>
                        <div className="text-[10px] italic text-neutral-400 mt-0.5">
                          {exp.period}
                        </div>
                      </div>

                      <div className="mt-1.5 space-y-1.5">
                        {exp.bullets.map((bullet) => {
                          const diags = showLinter ? diagnosticsByTarget[bullet.id] || [] : [];
                          const topDiag = diags.find((d) => d.severity !== 'verified');
                          const markClass =
                            topDiag?.severity === 'warning'
                              ? 'linter-squiggle cursor-pointer'
                              : topDiag?.severity === 'info'
                                ? 'linter-marker cursor-pointer'
                                : '';
                          const isDiagOpen = activeDiagId === bullet.id && Boolean(topDiag);

                          return (
                            <div key={bullet.id} className={`relative ${dimClass(bullet.id)}`}>
                              <p
                                contentEditable
                                suppressContentEditableWarning
                                data-editable-type="experience_bullet"
                                data-parent-id={exp.id}
                                data-target-id={bullet.id}
                                onClick={() => {
                                  if (topDiag && window.getSelection()?.isCollapsed) {
                                    setActiveDiagId(isDiagOpen ? null : bullet.id);
                                  }
                                }}
                                onBlur={(e) => {
                                  const updated = e.currentTarget.textContent || bullet.text;
                                  setProfile((p) => ({
                                    ...p,
                                    experience: p.experience.map((item) =>
                                      item.id !== exp.id
                                        ? item
                                        : {
                                            ...item,
                                            bullets: item.bullets.map((b) =>
                                              b.id === bullet.id ? { ...b, text: updated } : b
                                            ),
                                          }
                                    ),
                                  }));
                                }}
                                className="text-[11px] leading-[1.65] text-neutral-600 focus:outline-none"
                              >
                                <span className={markClass}>{bullet.text}</span>
                              </p>

                              {isDiagOpen && topDiag && (
                                <div className="no-print absolute left-0 top-full mt-1.5 z-30 w-72 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11.5px] font-semibold text-neutral-900">
                                      {topDiag.title}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setActiveDiagId(null)}
                                      className="text-[11px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
                                    >
                                      Esc
                                    </button>
                                  </div>
                                  <p className="text-[11.5px] text-neutral-600 mt-1 leading-relaxed">
                                    {topDiag.message}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveDiagId(null);
                                      setSelection({
                                        text: bullet.text,
                                        targetType: 'experience_bullet',
                                        parentId: exp.id,
                                        targetId: bullet.id,
                                        rect: { top: 220, left: window.innerWidth / 2 },
                                      });
                                      handleInlineAi('rewrite');
                                    }}
                                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-2.5 py-1 text-[11px] font-medium hover:bg-neutral-800 cursor-pointer"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    Sharpen with AI
                                  </button>
                                </div>
                              )}

                              {pendingDiffs
                                .filter((d) => d.targetId === bullet.id)
                                .map((d) => (
                                  <DiffGhostCard
                                    key={d.id}
                                    diff={d}
                                    onAccept={handleAcceptDiff}
                                    onDiscard={handleDiscardDiff}
                                  />
                                ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Right Column: Education (+ Projects if present) */}
              <section>
                <h2
                  className={`text-[15px] font-semibold text-neutral-900 mb-4 ${dimClass(
                    'edu-heading'
                  )}`}
                >
                  Education
                </h2>

                <div className="space-y-5">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className={dimClass(edu.id)}>
                      <div className="text-[11.5px] leading-snug">
                        <span className="font-semibold text-neutral-900">{edu.degree}</span>
                        <span className="text-neutral-600 ml-1.5">{edu.school}</span>
                      </div>
                      <div className="text-[10px] italic text-neutral-400 mt-0.5">{edu.period}</div>
                      {edu.description && (
                        <p className="text-[11px] leading-[1.6] text-neutral-600 mt-1.5">
                          {edu.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

              </section>
            </div>

            {/* Lower 2-Column Grid: Skills (Left) & References (Right) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-9 ${dimClass('footer')}`}>
              {/* Skills in 2 vertical columns */}
              <section>
                <h2 className="text-[15px] font-semibold text-neutral-900 mb-3">Skills</h2>
                <div className="grid grid-cols-2 sm:grid-flow-col sm:grid-rows-8 gap-x-8 gap-y-1.5 text-[11px] text-neutral-600">
                  {profile.skills.map((skill) => (
                    <div key={skill}>{skill}</div>
                  ))}
                </div>
              </section>

              {/* References */}
              <section>
                <h2 className="text-[15px] font-semibold text-neutral-900 mb-3">References</h2>
                <div className="space-y-3">
                  {(profile.references && profile.references.length > 0
                    ? profile.references
                    : [
                        {
                          id: 'ref-default',
                          name: 'Available upon request',
                          title: '',
                          contact: '',
                        },
                      ]
                  ).map((ref) => (
                    <div key={ref.id}>
                      <div className="text-[11.5px]">
                        <span className="font-semibold text-neutral-900">{ref.name}</span>
                        {ref.title && (
                          <span className="text-neutral-600 ml-1.5">{ref.title}</span>
                        )}
                      </div>
                      {ref.contact && (
                        <div className="text-[10px] italic text-neutral-400 mt-0.5">
                          {ref.contact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Links + Tri-Tone Bottom Bar */}
            <div className={`mt-10 pt-5 border-t border-neutral-300/70 ${dimClass('links')}`}>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 text-[10.5px] text-neutral-600">
                {profile.website && (
                  <div>
                    <span className="font-semibold text-neutral-900">Website: </span>
                    {profile.website}
                  </div>
                )}
                {profile.linkedin && (
                  <div>
                    <span className="font-semibold text-neutral-900">
                      {profile.linkedin.split('/')[0]}
                    </span>
                    {profile.linkedin.includes('/')
                      ? `/${profile.linkedin.split('/').slice(1).join('/')}`
                      : ''}
                  </div>
                )}
                {profile.facebook && (
                  <div>
                    <span className="font-semibold text-neutral-900">
                      {profile.facebook.split('/')[0]}
                    </span>
                    {profile.facebook.includes('/')
                      ? `/${profile.facebook.split('/').slice(1).join('/')}`
                      : ''}
                  </div>
                )}
                {profile.behance && (
                  <div>
                    <span className="font-semibold text-neutral-900">
                      {profile.behance.split('/')[0]}
                    </span>
                    {profile.behance.includes('/')
                      ? `/${profile.behance.split('/').slice(1).join('/')}`
                      : ''}
                  </div>
                )}
              </div>

              <div className="mt-7 grid grid-cols-3 h-[5px] w-full">
                <div className="bg-neutral-300" />
                <div className="bg-neutral-400" />
                <div className="bg-[#2a2a2a]" />
              </div>
            </div>
          </article>
        ) : (
          /* Portfolio.web live view — monochrome-first editorial layout */
          <section className="mx-auto max-w-[600px] py-8 space-y-16">
            {/* Hero */}
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11.5px] font-medium text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Available for work
                </span>
                {publishedUrl && (
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition"
                  >
                    Live: {publishedUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                  {profile.fullName}
                </h1>
                <p className="text-[15px] text-muted-foreground mt-1">{profile.headline}</p>
              </div>

              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {profile.summary}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.skills.slice(0, 10).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Selected Work */}
            <div>
              <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
                Selected work
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors duration-300 hover:border-foreground/20 hover:bg-[#f0efed]"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-heading text-[15px] font-semibold text-foreground">
                        {proj.name}
                      </h3>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {proj.tagline}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      {proj.link || 'View case study'}
                      <span
                        aria-hidden
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
                Experience
              </p>
              <div className="space-y-6">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="border-t border-border pt-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-heading text-[14.5px] font-semibold text-foreground">
                        {exp.role} · <span className="font-normal text-muted-foreground">{exp.company}</span>
                      </span>
                      <span className="text-[12px] font-mono text-muted-foreground">{exp.period}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-muted-foreground mt-2">
                      {exp.bullets[0]?.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Bottom Gemini-Style Pill Bar */}
      <BottomOrbBar
        loading={aiLoading}
        statusNote={statusNote}
        viewMode={viewMode}
        showLinter={showLinter}
        issueCount={issueCount}
        publishing={publishing}
        attachedSelection={attachedSelection}
        onClearAttachedSelection={() => setAttachedSelection(null)}
        onChangeViewMode={setViewMode}
        onToggleLinter={() => setShowLinter((s) => !s)}
        onImportClick={() => fileInputRef.current?.click()}
        onExportPdf={() => window.print()}
        onPublishPortfolio={handlePublishPortfolio}
        onSubmitCommand={handleGlobalCommand}
      />
    </main>
  );
}
