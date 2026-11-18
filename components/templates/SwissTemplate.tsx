'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditableField } from '@/components/EditableField';
import type { SelectionContext } from '@/components/FloatingSelectionPill';

interface SwissTemplateProps {
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

export function SwissTemplate({
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
}: SwissTemplateProps) {
  return (
    <article className="print-sheet mx-auto max-w-[740px] py-8 sm:py-12 px-4 sm:px-8 text-neutral-800">
      {/* Centered Wide-Tracked Header */}
      <header className={`text-center pb-12 ${dimClass('header')}`}>
        <EditableField
          as="h1"
          value={profile.fullName}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, fullName: v }))}
          className="text-[24px] sm:text-[28px] font-semibold uppercase tracking-[0.28em] mr-[-0.28em] text-[#222222] leading-tight"
        />
        <EditableField
          as="p"
          value={profile.headline}
          onCommit={(v) => onUpdateProfile((p) => ({ ...p, headline: v }))}
          className="text-[10.5px] uppercase tracking-[0.26em] mr-[-0.26em] text-neutral-500 mt-2"
        />
      </header>

      {/* Asymmetric 2-Column Body: 195px Left Sidebar | Wide Right Work Experience */}
      <div className="grid grid-cols-1 md:grid-cols-[195px_1fr] gap-x-11 gap-y-10 items-start">
        {/* Left Sidebar: Contact, Education, Skills */}
        <aside className="space-y-9">
          <section className={dimClass('contact')}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#222222] mb-4">
              Contact
            </h2>
            <div className="space-y-3 text-[10.5px] leading-[1.55] text-neutral-500">
              <div>
                {profile.addressLine1 && (
                  <EditableField
                    as="div"
                    value={profile.addressLine1}
                    onCommit={(v) => onUpdateProfile((p) => ({ ...p, addressLine1: v }))}
                    className="font-medium text-neutral-700"
                  />
                )}
                <EditableField
                  as="div"
                  value={profile.location}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, location: v }))}
                  className="font-medium text-neutral-700"
                />
              </div>

              <div className="space-y-0.5">
                {profile.phone && (
                  <div>
                    <span className="font-semibold text-neutral-800 mr-1">t:</span>
                    <EditableField
                      value={profile.phone}
                      onCommit={(v) => onUpdateProfile((p) => ({ ...p, phone: v }))}
                    />
                  </div>
                )}
                <div className="break-all">
                  <span className="font-semibold text-neutral-800 mr-1">e:</span>
                  <EditableField
                    value={profile.email}
                    onCommit={(v) => onUpdateProfile((p) => ({ ...p, email: v }))}
                  />
                </div>
                {profile.website && (
                  <div>
                    <span className="font-semibold text-neutral-800 mr-1">w:</span>
                    <EditableField
                      value={profile.website}
                      onCommit={(v) => onUpdateProfile((p) => ({ ...p, website: v }))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-0.5">
                {profile.facebook && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-[2px] bg-neutral-700 text-white text-[8px] font-bold inline-flex items-center justify-center shrink-0">
                      f
                    </span>
                    <EditableField
                      value={profile.facebook}
                      onCommit={(v) => onUpdateProfile((p) => ({ ...p, facebook: v }))}
                      className="truncate"
                    />
                  </div>
                )}
                {profile.behance && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-[2px] bg-neutral-700 text-white text-[8px] font-bold inline-flex items-center justify-center shrink-0">
                      @
                    </span>
                    <EditableField
                      value={profile.behance}
                      onCommit={(v) => onUpdateProfile((p) => ({ ...p, behance: v }))}
                      className="truncate"
                    />
                  </div>
                )}
                {profile.linkedin && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-[2px] bg-neutral-700 text-white text-[8px] font-bold inline-flex items-center justify-center shrink-0">
                      in
                    </span>
                    <EditableField
                      value={profile.linkedin}
                      onCommit={(v) => onUpdateProfile((p) => ({ ...p, linkedin: v }))}
                      className="truncate"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={dimClass('edu-heading')}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#222222] mb-4">
              Education
            </h2>
            <div className="space-y-5">
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
                    className="text-[11.5px] font-bold text-[#222222] leading-snug"
                  />
                  <div className="text-[10.5px] font-semibold text-neutral-700 mt-1 flex flex-wrap items-center gap-x-1">
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
                    <span>/</span>
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
                    />
                  </div>
                  {edu.description && (
                    <EditableField
                      as="p"
                      value={edu.description}
                      onCommit={(v) =>
                        onUpdateProfile((p) => ({
                          ...p,
                          education: p.education.map((item) =>
                            item.id === edu.id ? { ...item, description: v } : item
                          ),
                        }))
                      }
                      className="text-[10.5px] leading-[1.55] text-neutral-500 mt-1.5"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={dimClass('skills')}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#222222] mb-4">
              Skills
            </h2>
            <ul className="space-y-1.5 text-[10.5px] text-neutral-500">
              {profile.skills.slice(0, 8).map((skill, idx) => (
                <li key={`${idx}-${skill}`}>
                  <EditableField
                    value={skill}
                    onCommit={(v) =>
                      onUpdateProfile((p) => ({
                        ...p,
                        skills: p.skills.map((s, i) => (i === idx ? v : s)),
                      }))
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* Right Main Column: Work Experience */}
        <section>
          <h2
            className={`text-[11px] font-semibold uppercase tracking-[0.3em] text-[#222222] mb-4 ${dimClass(
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

          <div className="space-y-7">
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
                    className="text-[12.5px] font-bold text-[#222222]"
                  />
                  <div className="text-[11px] font-semibold text-neutral-700 mt-1 flex flex-wrap items-center gap-x-1">
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
                    <span>/</span>
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
                  </div>
                </div>

                <div className="mt-2 space-y-2">
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
                          className="text-[11px] leading-[1.68] text-neutral-500"
                        />

                        {isDiagOpen && topDiag && (
                          <div className="no-print absolute left-0 top-full mt-1.5 z-30 w-72 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
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
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
