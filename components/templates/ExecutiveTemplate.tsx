'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditableField } from '@/components/EditableField';
import type { SelectionContext } from '@/components/FloatingSelectionPill';

interface ExecutiveTemplateProps {
  profile: CareerProfile;
  showLinter: boolean;
  diagnosticsByTarget: Record<string, LinterDiagnostic[]>;
  activeDiagId: string | null;
  pendingDiffs: PendingDiff[];
  dimClass: (targetId?: string) => string;
  onUpdateProfile: (updater: (prev: CareerProfile) => CareerProfile) => void;
  onSetActiveDiagId: (id: string | null) => void;
  onQuickRewrite: (sel: SelectionContext) => void;
  onAcceptDiff: (diff: PendingDiff) => void;
  onDiscardDiff: (diffId: string) => void;
}

export function ExecutiveTemplate({
  profile,
  showLinter,
  diagnosticsByTarget,
  activeDiagId,
  pendingDiffs,
  dimClass,
  onUpdateProfile,
  onSetActiveDiagId,
  onQuickRewrite,
  onAcceptDiff,
  onDiscardDiff,
}: ExecutiveTemplateProps) {
  const nameParts = profile.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const restName = nameParts.slice(1).join(' ');

  return (
    <article className="print-sheet mx-auto max-w-[740px] py-8 sm:py-10 px-4 sm:px-10 text-neutral-800">
      {/* Stacked Serif Name */}
      <header className={`pb-6 ${dimClass('header')}`}>
        <h1
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const next = e.currentTarget.textContent;
            if (next !== null) {
              onUpdateProfile((p) => ({ ...p, fullName: next.trim() || p.fullName }));
            }
          }}
          className="font-serif text-[30px] sm:text-[34px] font-normal uppercase tracking-[0.14em] leading-[1.12] text-[#1a1a1a] focus:outline-none"
        >
          <span className="block">{firstName}</span>
          {restName && <span className="block">{restName}</span>}
        </h1>

        {/* Gray Highlight Bar: Professional Title | Phone – Email – Location */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 bg-neutral-200/75 px-3 py-1.5 text-[10.5px]">
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const next = e.currentTarget.textContent;
              if (next !== null) {
                onUpdateProfile((p) => ({ ...p, headline: next || p.headline }));
              }
            }}
            className="font-bold uppercase tracking-[0.18em] text-[#1a1a1a] focus:outline-none"
          >
            {profile.headline}
          </span>
          <span className="w-[2px] h-3.5 bg-[#1a1a1a] inline-block" />
          <span className="font-semibold text-neutral-700 inline-flex flex-wrap items-center gap-x-2">
            {profile.phone && (
              <EditableField
                value={profile.phone}
                onCommit={(v) => onUpdateProfile((p) => ({ ...p, phone: v }))}
              />
            )}
            {profile.phone && <span>–</span>}
            <EditableField
              value={profile.email}
              onCommit={(v) => onUpdateProfile((p) => ({ ...p, email: v }))}
            />
            <span>–</span>
            <EditableField
              value={profile.location}
              onCommit={(v) => onUpdateProfile((p) => ({ ...p, location: v }))}
            />
          </span>
        </div>
      </header>

      {/* Profile Summary */}
      <section className={`pb-5 mb-5 border-b border-neutral-400/70 ${dimClass('summary')}`}>
        <h2 className="font-serif text-[13.5px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2">
          Profile Summary
        </h2>
        <p
          contentEditable
          suppressContentEditableWarning
          data-editable-type="summary"
          data-target-id="summary"
          onBlur={(e) => {
            const next = e.currentTarget.textContent;
            if (next !== null) {
              onUpdateProfile((p) => ({ ...p, summary: next || p.summary }));
            }
          }}
          className="text-[11px] leading-[1.65] text-neutral-600 focus:outline-none"
        >
          {profile.summary}
        </p>
        {pendingDiffs
          .filter((d) => d.targetType === 'summary')
          .map((d) => (
            <DiffGhostCard
              key={d.id}
              diff={d}
              onAccept={onAcceptDiff}
              onDiscard={onDiscardDiff}
            />
          ))}
      </section>

      {/* Work Experiences */}
      <section className="pb-5 mb-5 border-b border-neutral-400/70">
        <h2
          className={`font-serif text-[13.5px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] mb-3 ${dimClass(
            'exp-heading'
          )}`}
        >
          Work Experiences
        </h2>

        {pendingDiffs
          .filter((d) => d.targetType === 'add_experience')
          .map((d) => (
            <DiffGhostCard
              key={d.id}
              diff={d}
              onAccept={onAcceptDiff}
              onDiscard={onDiscardDiff}
            />
          ))}

        <div className="space-y-5">
          {profile.experience.map((exp) => (
            <div key={exp.id}>
              <div className={dimClass(exp.id)}>
                <div className="flex items-baseline justify-between gap-4">
                  <EditableField
                    value={exp.role}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        experience: p.experience.map((item) =>
                          item.id === exp.id ? { ...item, role: v } : item
                        ),
                      }))
                    }
                    className="text-[10.5px] font-bold uppercase tracking-[0.04em] text-[#1a1a1a]"
                  />
                  <EditableField
                    value={exp.period}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        experience: p.experience.map((item) =>
                          item.id === exp.id ? { ...item, period: v } : item
                        ),
                      }))
                    }
                    className="text-[10.5px] font-bold text-[#1a1a1a] shrink-0"
                  />
                </div>
                <div className="text-[10.5px] italic text-neutral-600 mt-0.5 flex items-center gap-1">
                  <EditableField
                    value={exp.company}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        experience: p.experience.map((item) =>
                          item.id === exp.id ? { ...item, company: v } : item
                        ),
                      }))
                    }
                  />
                  {exp.location && (
                    <>
                      <span>,</span>
                      <EditableField
                        value={exp.location}
                        onCommit={(v) =>
                          onUpdateProfile((p) => ({
                            ...p,
                            experience: p.experience.map((item) =>
                              item.id === exp.id ? { ...item, location: v } : item
                            ),
                          }))
                        }
                      />
                    </>
                  )}
                </div>
              </div>

              <ul className="mt-2 pl-4 space-y-1">
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
                    <li key={bullet.id} className={`relative ${dimClass(bullet.id)}`}>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] text-neutral-700 select-none">•</span>
                        <p
                          contentEditable
                          suppressContentEditableWarning
                          data-editable-type="experience_bullet"
                          data-parent-id={exp.id}
                          data-target-id={bullet.id}
                          onClick={() => {
                            if (topDiag && window.getSelection()?.isCollapsed) {
                              onSetActiveDiagId(isDiagOpen ? null : bullet.id);
                            }
                          }}
                          onBlur={(e) => {
                            const updated = e.currentTarget.textContent || bullet.text;
                            onUpdateProfile((p) => ({
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
                          className="text-[10.5px] leading-[1.6] text-neutral-600 flex-1 focus:outline-none"
                        >
                          <span className={markClass}>{bullet.text}</span>
                        </p>
                      </div>

                      {isDiagOpen && topDiag && (
                        <div className="no-print absolute left-4 top-full mt-1.5 z-30 w-72 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11.5px] font-semibold text-neutral-900">
                              {topDiag.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => onSetActiveDiagId(null)}
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
                              onSetActiveDiagId(null);
                              onQuickRewrite({
                                text: bullet.text,
                                targetType: 'experience_bullet',
                                parentId: exp.id,
                                targetId: bullet.id,
                                rect: { top: 220, left: window.innerWidth / 2 },
                              });
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
                            onAccept={onAcceptDiff}
                            onDiscard={onDiscardDiff}
                          />
                        ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className={`pb-5 mb-5 border-b border-neutral-400/70 ${dimClass('edu-heading')}`}>
        <h2 className="font-serif text-[13.5px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] mb-2.5">
          Education
        </h2>
        <div className="space-y-1.5">
          {profile.education.map((edu) => (
            <div
              key={edu.id}
              className={`flex items-baseline justify-between gap-4 text-[10.5px] ${dimClass(edu.id)}`}
            >
              <div>
                <EditableField
                  value={edu.degree}
                  onCommit={(v) =>
                    onUpdateProfile((p) => ({
                      ...p,
                      education: p.education.map((item) =>
                        item.id === edu.id ? { ...item, degree: v } : item
                      ),
                    }))
                  }
                  className="font-bold text-[#1a1a1a]"
                />
                <span className="text-neutral-400 mx-1.5">|</span>
                <EditableField
                  value={edu.school}
                  onCommit={(v) =>
                    onUpdateProfile((p) => ({
                      ...p,
                      education: p.education.map((item) =>
                        item.id === edu.id ? { ...item, school: v } : item
                      ),
                    }))
                  }
                  className="text-neutral-600"
                />
              </div>
              <EditableField
                value={edu.period}
                onCommit={(v) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    education: p.education.map((item) =>
                      item.id === edu.id ? { ...item, period: v } : item
                    ),
                  }))
                }
                className="font-bold text-[#1a1a1a] shrink-0"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Skills — 4-Column Grid */}
      <section className={dimClass('skills')}>
        <h2 className="font-serif text-[13.5px] font-semibold uppercase tracking-[0.1em] text-[#1a1a1a] mb-3">
          Skills
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1.5 text-[10.5px] text-neutral-600">
          {profile.skills.map((skill, idx) => (
            <EditableField
              key={`${idx}-${skill}`}
              as="div"
              value={skill}
              onCommit={(v) =>
                onUpdateProfile((p) => ({
                  ...p,
                  skills: p.skills.map((s, i) => (i === idx ? v : s)),
                }))
              }
            />
          ))}
        </div>
      </section>
    </article>
  );
}
