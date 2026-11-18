'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditableField } from '@/components/EditableField';
import type { SelectionContext } from '@/components/FloatingSelectionPill';

interface ClassicTemplateProps {
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

export function EditorialTemplate({
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
}: ClassicTemplateProps) {
  return (
    <article className="print-sheet mx-auto max-w-[740px] py-8 sm:py-10 px-4 sm:px-10 text-neutral-800">
      {/* Header: Bold Uppercase Name + Dot-Separated Contact */}
      <header className={`pb-6 ${dimClass('header')}`}>
        <EditableField
          as="h1"
          value={profile.fullName}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, fullName: v }))}
          className="text-[22px] sm:text-[25px] font-bold uppercase tracking-[0.06em] text-[#1a1a1a] leading-tight"
        />
        <p className="text-[11px] text-neutral-500 mt-1 flex flex-wrap items-center gap-x-2">
          <EditableField
            value={profile.location}
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, location: v }))}
          />
          {profile.phone && (
            <>
              <span>•</span>
              <EditableField
                value={profile.phone}
                onCommit={(v) => onUpdateProfile((p) => ({ ...p, phone: v }))}
              />
            </>
          )}
          <span>•</span>
          <EditableField
            value={profile.email}
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, email: v }))}
          />
        </p>
      </header>

      {/* Professional Profile */}
      <section className={`relative mb-7 ${dimClass('summary')}`}>
        <h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a] pb-1.5 border-b-[1.5px] border-[#1a1a1a] mb-3">
          Professional Profile
        </h2>
        <EditableField
          as="p"
          value={profile.summary}
          dataEditableType="summary"
          dataTargetId="summary"
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, summary: v }))}
          className="text-[11px] leading-[1.65] text-neutral-600"
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

      {/* Work Experience */}
      <section className="mb-7">
        <h2
          className={`text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a] pb-1.5 border-b-[1.5px] border-[#1a1a1a] mb-3.5 ${dimClass(
            'exp-heading'
          )}`}
        >
          Work Experience
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
              <div className={`flex items-baseline justify-between gap-4 ${dimClass(exp.id)}`}>
                <div>
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
                    className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#1a1a1a]"
                  />
                  <div className="text-[11px] font-semibold text-neutral-800 mt-0.5 flex items-center gap-1">
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
                        <span>(</span>
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
                        <span>)</span>
                      </>
                    )}
                  </div>
                </div>
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
                  className="text-[10.5px] font-semibold text-neutral-800 shrink-0"
                />
              </div>

              <ul className="mt-2 space-y-1.5">
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
                          className="text-[11px] leading-[1.65] text-neutral-600 flex-1"
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
      <section className={`mb-7 ${dimClass('edu-heading')}`}>
        <h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a] pb-1.5 border-b-[1.5px] border-[#1a1a1a] mb-3.5">
          Education
        </h2>
        <div className="space-y-3.5">
          {profile.education.map((edu) => (
            <div
              key={edu.id}
              className={`flex items-baseline justify-between gap-4 ${dimClass(edu.id)}`}
            >
              <div>
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
                  className="text-[11px] font-bold text-[#1a1a1a]"
                />
                <EditableField
                  as="div"
                  value={edu.school}
                  onCommit={(v) =>
                    onUpdateProfile((p) => ({
                      ...p,
                      education: p.education.map((item) =>
                        item.id === edu.id ? { ...item, school: v } : item
                      ),
                    }))
                  }
                  className="text-[10.5px] text-neutral-600 mt-0.5"
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
                className="text-[10.5px] font-semibold text-neutral-800 shrink-0"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className={dimClass('skills')}>
        <h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a] pb-1.5 border-b-[1.5px] border-[#1a1a1a] mb-3">
          Skills
        </h2>
        <div className="space-y-1 text-[11px] leading-[1.6] text-neutral-600">
          {profile.skills.some((s) => s.includes(':')) ? (
            profile.skills.map((line, idx) => {
              const [label, ...rest] = line.split(':');
              return (
                <p key={`${idx}-${label}`}>
                  <span className="font-bold text-[#1a1a1a]">{label}:</span>
                  <EditableField
                    value={rest.join(':').trim()}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        skills: p.skills.map((s, i) => (i === idx ? `${label}: ${v}` : s)),
                      }))
                    }
                    className="ml-1"
                  />
                </p>
              );
            })
          ) : (
            <p>
              <span className="font-bold text-[#1a1a1a] mr-1.5">Skills:</span>
              <EditableField
                value={profile.skills.join(', ')}
                onCommit={(v) =>
                  onUpdateProfile((p) => ({
                    ...p,
                    skills: v
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </p>
          )}
        </div>
      </section>
    </article>
  );
}
