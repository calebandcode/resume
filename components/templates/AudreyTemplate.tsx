'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditableField } from '@/components/EditableField';
import type { SelectionContext } from '@/components/FloatingSelectionPill';

interface AudreyTemplateProps {
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

function SectionDivider({ title, dim = '' }: { title: string; dim?: string }) {
  return (
    <div className={`flex items-center gap-4 mb-3.5 ${dim}`}>
      <div className="flex-1 h-px bg-neutral-300" />
      <h2 className="font-serif text-[12.5px] font-semibold uppercase tracking-[0.22em] mr-[-0.22em] text-[#1e293b] shrink-0">
        {title}
      </h2>
      <div className="flex-1 h-px bg-neutral-300" />
    </div>
  );
}

export function AudreyTemplate({
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
}: AudreyTemplateProps) {
  return (
    <article className="print-sheet mx-auto max-w-[740px] py-4 sm:py-6 px-4 sm:px-8 text-neutral-800">
      {/* Top Navy Accent Bar */}
      <div className="h-[4px] w-full bg-[#1e293b] mb-7" />

      {/* Centered Serif Title-Case Header */}
      <header className={`text-center pb-5 ${dimClass('header')}`}>
        <EditableField
          as="h1"
          value={profile.fullName}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, fullName: v }))}
          className="font-serif text-[32px] sm:text-[36px] font-normal tracking-[0.04em] text-[#1e293b] leading-tight"
        />
        <EditableField
          as="p"
          value={profile.headline}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, headline: v }))}
          className="text-[10.5px] uppercase tracking-[0.26em] mr-[-0.26em] text-neutral-600 mt-1.5"
        />
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 text-[10px] text-neutral-500">
          {profile.phone && (
            <>
              <EditableField
                value={profile.phone}
                onCommit={(v) => onUpdateProfile((p) => ({ ...p, phone: v }))}
              />
              <span>|</span>
            </>
          )}
          <EditableField
            value={profile.email}
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, email: v }))}
          />
          <span>|</span>
          <EditableField
            value={profile.location}
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, location: v }))}
          />
          {profile.linkedin && (
            <>
              <span>|</span>
              <EditableField
                value={profile.linkedin}
                onCommit={(v) => onUpdateProfile((p) => ({ ...p, linkedin: v }))}
              />
            </>
          )}
        </div>
      </header>

      {/* Profile Summary */}
      <section className={`relative mb-6 ${dimClass('summary')}`}>
        <SectionDivider title="Profile Summary" />
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
      </section>

      {/* Skills */}
      <section className={`mb-6 ${dimClass('skills')}`}>
        <SectionDivider title="Skills" />
        <div className="space-y-1.5 text-[10.5px] leading-[1.6] text-neutral-600">
          {profile.skills.some((s) => s.includes(':')) ? (
            profile.skills.map((line, idx) => {
              const [label, ...rest] = line.split(':');
              return (
                <div key={`${idx}-${label}`} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                  <span className="w-40 shrink-0 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1e293b]">
                    {label}
                  </span>
                  <EditableField
                    value={rest.join(':').trim()}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        skills: p.skills.map((s, i) => (i === idx ? `${label}: ${v}` : s)),
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              );
            })
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="w-40 shrink-0 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1e293b]">
                Core Skills
              </span>
              <EditableField
                value={profile.skills.join(' | ')}
                onCommit={(v) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    skills: v
                      .split('|')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
                className="flex-1"
              />
            </div>
          )}
        </div>
      </section>

      {/* Work Experience */}
      <section className="mb-6">
        <SectionDivider title="Work Experience" dim={dimClass('exp-heading')} />

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
              <div className={`flex flex-wrap items-baseline justify-between gap-2 ${dimClass(exp.id)}`}>
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
                  className="text-[10.5px] font-bold uppercase tracking-[0.04em] text-[#1e293b]"
                />
                <span className="text-[10.5px] text-neutral-600 inline-flex flex-wrap items-center gap-x-1.5">
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
                      <span>|</span>
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
                  <span>|</span>
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
                  />
                </span>
              </div>

              <ul className="mt-1.5 pl-5 space-y-1">
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

      {/* Projects */}
      {profile.projects.length > 0 && (
        <section className={`mb-6 ${dimClass('proj-heading')}`}>
          <SectionDivider title="Projects" />
          <div className="space-y-3">
            {profile.projects.map((proj) => (
              <div key={proj.id} className={dimClass(proj.id)}>
                <div className="flex items-baseline justify-between gap-4">
                  <EditableField
                    value={proj.name}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        projects: p.projects.map((item) =>
                          item.id === proj.id ? { ...item, name: v } : item
                        ),
                      }))
                    }
                    className="text-[10.5px] font-bold uppercase tracking-[0.04em] text-[#1e293b]"
                  />
                  <span className="text-[10.5px] text-neutral-500 shrink-0">
                    {proj.tech.join(' · ')}
                  </span>
                </div>
                <div className="text-[10.5px] text-neutral-600 mt-0.5 flex flex-wrap items-center gap-x-1.5">
                  <EditableField
                    value={proj.tagline}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        projects: p.projects.map((item) =>
                          item.id === proj.id ? { ...item, tagline: v } : item
                        ),
                      }))
                    }
                  />
                  {proj.link && (
                    <>
                      <span>|</span>
                      <EditableField
                        value={proj.link}
                        onCommit={(v) =>
                          onUpdateProfile((p) => ({
                            ...p,
                            projects: p.projects.map((item) =>
                              item.id === proj.id ? { ...item, link: v } : item
                            ),
                          }))
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      <section className={`mb-8 ${dimClass('edu-heading')}`}>
        <SectionDivider title="Education" />
        <div className="space-y-2">
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
                  className="font-bold uppercase tracking-[0.04em] text-[#1e293b]"
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
                className="text-neutral-600 shrink-0"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navy Accent Bar */}
      <div className="h-[4px] w-full bg-[#1e293b]" />
    </article>
  );
}
