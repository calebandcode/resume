'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditableField } from '@/components/EditableField';
import type { SelectionContext } from '@/components/FloatingSelectionPill';

interface OliveraTemplateProps {
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

export function OliveraTemplate({
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
}: OliveraTemplateProps) {
  const firstRowSkills = profile.skills.slice(0, 5);
  const secondRowSkills = profile.skills.slice(5, 10);

  return (
    <article className="print-sheet mx-auto max-w-[740px] py-8 sm:py-10 px-4 sm:px-10 text-neutral-800">
      {/* Centered Serif Header + Thin-Bordered Contact Strip */}
      <header className={`text-center pb-5 ${dimClass('header')}`}>
        <EditableField
          as="h1"
          value={profile.fullName}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, fullName: v }))}
          className="font-serif text-[26px] sm:text-[30px] font-normal uppercase tracking-[0.22em] mr-[-0.22em] text-[#1a1a1a] leading-tight"
        />
        <EditableField
          as="p"
          value={profile.headline}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, headline: v }))}
          className="text-[10.5px] uppercase tracking-[0.24em] mr-[-0.24em] text-neutral-600 mt-1.5"
        />

        <div className="mt-4 border-y border-neutral-300/90 py-1.5 text-[10.5px] tracking-[0.06em] text-neutral-600 flex flex-wrap items-center justify-center gap-x-2.5">
          <EditableField
            value={profile.location}
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, location: v }))}
          />
          <span>·</span>
          <EditableField
            value={profile.email}
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, email: v }))}
          />
          {profile.phone && (
            <>
              <span>·</span>
              <EditableField
                value={profile.phone}
                onCommit={(v) => onUpdateProfile((p) => ({ ...p, phone: v }))}
              />
            </>
          )}
        </div>
      </header>

      {/* Summary + Centered Dot-Separated Expertise Rows */}
      <section className={`relative mb-7 ${dimClass('summary')}`}>
        <EditableField
          as="p"
          value={profile.summary}
          dataEditableType="summary"
          dataTargetId="summary"
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, summary: v }))}
          className="text-[10.5px] leading-[1.65] text-neutral-600"
        />

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

        {profile.skills.length > 0 && (
          <div className={`mt-5 space-y-1 text-center text-[10.5px] text-neutral-600 ${dimClass('skills')}`}>
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
              {firstRowSkills.map((skill, idx) => (
                <span key={`${idx}-${skill}`} className="inline-flex items-center gap-2.5">
                  {idx > 0 && <span className="text-neutral-400">·</span>}
                  <EditableField
                    value={skill}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        skills: p.skills.map((s, i) => (i === idx ? v : s)),
                      }))
                    }
                  />
                </span>
              ))}
            </div>
            {secondRowSkills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
                {secondRowSkills.map((skill, idx) => (
                  <span key={`${idx + 5}-${skill}`} className="inline-flex items-center gap-2.5">
                    {idx > 0 && <span className="text-neutral-400">·</span>}
                    <EditableField
                      value={skill}
                      onCommit={(v) =>
                        onUpdateProfile((p) => ({
                          ...p,
                          skills: p.skills.map((s, i) => (i === idx + 5 ? v : s)),
                        }))
                      }
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Work experience */}
      <section className="mb-7">
        <h2
          className={`font-serif text-[13.5px] font-semibold tracking-[0.04em] text-[#1a1a1a] pb-1.5 border-b border-neutral-300 mb-4 ${dimClass(
            'exp-heading'
          )}`}
        >
          Work experience
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
            <div key={exp.id} data-focus-id={exp.id}>
              <div className={dimClass(exp.id)}>
                <EditableField
                  as="div"
                  value={exp.role}
                  onCommit={(v) =>
                    onUpdateProfile((p) => ({
                      ...p,
                      experience: p.experience.map((item) =>
                        item.id === exp.id ? { ...item, role: v } : item
                      ),
                    }))
                  }
                  className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#1a1a1a]"
                />
                <div className="flex items-baseline justify-between gap-4 mt-0.5 text-[10.5px] text-neutral-700">
                  <span className="inline-flex items-center gap-1">
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
                        <span>/</span>
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
                  </span>
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
                    className="shrink-0"
                  />
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
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-[10.5px] text-neutral-700 select-none">•</span>
                        <EditableField
                          as="p"
                          value={bullet.text}
                          markClass={markClass}
                          dataEditableType="experience_bullet"
                          dataParentId={exp.id}
                          dataTargetId={bullet.id}
                          onClick={() => {
                            if (topDiag && window.getSelection()?.isCollapsed) {
                              onSetActiveDiagId(isDiagOpen ? null : bullet.id);
                            }
                          }}
                          onCommit={(updated) =>
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
                            }))
                          }
                          className="text-[10.5px] leading-[1.6] text-neutral-600 flex-1"
                        />
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
      <section className={dimClass('edu-heading')}>
        <h2 className="font-serif text-[13.5px] font-semibold tracking-[0.04em] text-[#1a1a1a] pb-1.5 border-b border-neutral-300 mb-3.5">
          Education
        </h2>
        <div className="space-y-3.5">
          {profile.education.map((edu) => (
            <div key={edu.id} className={dimClass(edu.id)}>
              <EditableField
                as="div"
                value={edu.degree}
                onCommit={(v) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    education: p.education.map((item) =>
                      item.id === edu.id ? { ...item, degree: v } : item
                    ),
                  }))
                }
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#1a1a1a]"
              />
              <div className="flex items-baseline justify-between gap-4 mt-0.5 text-[10.5px] text-neutral-700">
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
                />
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
                  className="shrink-0"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
