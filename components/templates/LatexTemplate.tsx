'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
import { EditableField } from '@/components/EditableField';
import type { SelectionContext } from '@/components/FloatingSelectionPill';

interface LatexTemplateProps {
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

export function LatexTemplate({
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
}: LatexTemplateProps) {
  const hasSummary =
    Boolean(profile.summary?.trim()) || pendingDiffs.some((d) => d.targetType === 'summary');
  const hasColonSkills = profile.skills.some((s) => s.includes(':'));

  return (
    <article className="print-sheet mx-auto max-w-[740px] py-8 sm:py-10 px-5 sm:px-11 font-serif text-[#111111]">
      {/* 3-Column Academic LaTeX Header: Left (Phone/City/Email) | Center (Name) | Right (Blog/GitHub/LinkedIn) */}
      <header className={`pb-7 ${dimClass('header')}`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
          {/* Left Column: Phone, City, Email */}
          <div className="text-left text-[13px] leading-[1.45]">
            {profile.phone && (
              <div className="text-[#111111]">
                <EditableField
                  value={profile.phone}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, phone: v }))}
                />
              </div>
            )}
            {profile.location && (
              <div className="text-[#111111]">
                <EditableField
                  value={profile.location}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, location: v }))}
                />
              </div>
            )}
            {profile.email && (
              <div className="text-[#4a607a]">
                <EditableField
                  value={profile.email}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, email: v }))}
                />
              </div>
            )}
          </div>

          {/* Center Column: Name */}
          <div className="text-center">
            <EditableField
              as="h1"
              value={profile.fullName}
              onCommit={(v) => onUpdateProfile((p) => ({ ...p, fullName: v }))}
              className="text-[32px] sm:text-[36px] font-normal tracking-[0.01em] leading-[1.15] text-[#111111]"
            />
          </div>

          {/* Right Column: Website/Blog, GitHub, LinkedIn */}
          <div className="text-left sm:text-right text-[13px] leading-[1.45] text-[#4a607a]">
            {profile.website && (
              <div>
                <EditableField
                  value={profile.website}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, website: v }))}
                />
              </div>
            )}
            {profile.github && (
              <div>
                <span>GitHub: </span>
                <EditableField
                  value={profile.github}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, github: v }))}
                />
              </div>
            )}
            {profile.linkedin && (
              <div>
                <span>LinkedIn: </span>
                <EditableField
                  value={profile.linkedin}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, linkedin: v }))}
                />
              </div>
            )}
            {!profile.website && !profile.github && !profile.linkedin && profile.headline && (
              <div>
                <EditableField
                  value={profile.headline}
                  onCommit={(v) => onUpdateProfile((p) => ({ ...p, headline: v }))}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Optional Summary (when imported CV has a summary or summary diff is pending) */}
      {hasSummary && (
        <section className={`relative mb-6 ${dimClass('summary')}`}>
          <h2 className="[font-variant:small-caps] text-[15.5px] tracking-[0.06em] font-normal text-[#222222] mb-2">
            Summary
          </h2>
          <EditableField
            as="p"
            value={profile.summary}
            dataEditableType="summary"
            dataTargetId="summary"
            onCommit={(v) => onUpdateProfile((p) => ({ ...p, summary: v }))}
            className="text-[13px] leading-[1.55] text-[#111111]"
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
      )}

      {/* EDUCATION (First section in the LaTeX reference template) */}
      {profile.education.length > 0 && (
        <section className={`mb-6 ${dimClass('education')}`}>
          <h2 className="[font-variant:small-caps] text-[15.5px] tracking-[0.06em] font-normal text-[#222222] mb-2.5">
            Education
          </h2>
          <div className="space-y-3.5">
            {profile.education.map((edu) => {
              const descLines = edu.description
                ? edu.description.split('\n').filter(Boolean)
                : [];
              return (
                <div key={edu.id}>
                  {/* Row 1: Bold Degree (left) | Bold Period (right) */}
                  <div className="flex items-baseline justify-between gap-4 text-[13.5px] leading-[1.4]">
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
                      className="font-bold text-[#111111]"
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
                      className="font-bold text-right text-[#111111] shrink-0"
                    />
                  </div>

                  {/* Row 2: Italic School (left) | Italic Location (right) */}
                  <div className="flex items-baseline justify-between gap-4 text-[13px] italic leading-[1.4]">
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
                      className="italic text-[#111111]"
                    />
                    {edu.location && (
                      <EditableField
                        value={edu.location}
                        onCommit={(v) =>
                          onUpdateProfile((p) => ({
                            ...p,
                            education: p.education.map((item) =>
                              item.id === edu.id ? { ...item, location: v } : item
                            ),
                          }))
                        }
                        className="italic text-right text-[#111111] shrink-0"
                      />
                    )}
                  </div>

                  {descLines.length > 0 && (
                    <div className="mt-1 space-y-0.5 text-[13px] leading-[1.52] text-[#111111]">
                      {descLines.map((line, lIdx) => (
                        <div key={lIdx}>
                          <EditableField
                            value={line}
                            onCommit={(v) => {
                              const nextLines = [...descLines];
                              nextLines[lIdx] = v;
                              onUpdateProfile((p) => ({
                                ...p,
                                education: p.education.map((item) =>
                                  item.id === edu.id
                                    ? { ...item, description: nextLines.join('\n') }
                                    : item
                                ),
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* WORK EXPERIENCE */}
      <section className="mb-6">
        <h2
          className={`[font-variant:small-caps] text-[15.5px] tracking-[0.06em] font-normal text-[#222222] mb-2.5 ${dimClass(
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

        <div className="space-y-4">
          {profile.experience.map((exp) => (
            <div key={exp.id} data-focus-id={exp.id}>
              <div className={dimClass(exp.id)}>
                {/* Row 1: Bold Role (left) | Bold Period (right) */}
                <div className="flex items-baseline justify-between gap-4 text-[13.5px] leading-[1.4]">
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
                    className="font-bold text-[#111111]"
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
                    className="font-bold text-right text-[#111111] shrink-0"
                  />
                </div>

                {/* Row 2: Italic Company (left) | Italic Location (right) */}
                <div className="flex items-baseline justify-between gap-4 text-[13px] italic leading-[1.4] mb-1.5">
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
                    className="italic text-[#111111]"
                  />
                  {exp.location && (
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
                      className="italic text-right text-[#111111] shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Bullets */}
              <ul className="space-y-1 pl-3">
                {exp.bullets.map((bullet) => {
                  const diags = showLinter ? diagnosticsByTarget[bullet.id] || [] : [];
                  const topDiag = diags.find((d) => d.severity !== 'verified');
                  const isDiagOpen = activeDiagId === bullet.id;

                  const markClass = topDiag
                    ? topDiag.severity === 'warning'
                      ? 'linter-squiggle'
                      : 'linter-marker'
                    : '';

                  return (
                    <li key={bullet.id} className={`relative ${dimClass(bullet.id)}`}>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-[12px] text-[#111111] select-none">•</span>
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
                          className="text-[13px] leading-[1.52] text-[#111111] flex-1"
                        />
                      </div>

                      {isDiagOpen && topDiag && (
                        <div className="no-print absolute left-4 top-full mt-1.5 z-30 w-72 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-xl p-3 font-sans shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
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

      {/* PROJECT */}
      {(profile.projects.length > 0 ||
        pendingDiffs.some((d) => d.targetType === 'add_project')) && (
        <section className={`mb-6 ${dimClass('projects')}`}>
          <h2 className="[font-variant:small-caps] text-[15.5px] tracking-[0.06em] font-normal text-[#222222] mb-2.5">
            Project
          </h2>

          {pendingDiffs
            .filter((d) => d.targetType === 'add_project')
            .map((d) => (
              <DiffGhostCard
                key={d.id}
                diff={d}
                onAccept={onAcceptDiff}
                onDiscard={onDiscardDiff}
              />
            ))}

          <div className="space-y-3.5">
            {profile.projects.map((proj) => (
              <div key={proj.id}>
                {/* Row 1: Bold Name (left) | Bold Period/Tech (right) */}
                <div className="flex items-baseline justify-between gap-4 text-[13.5px] leading-[1.4]">
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
                    className="font-bold text-[#111111]"
                  />
                  {(proj.tech[0] || proj.link) && (
                    <span className="font-bold text-right text-[#111111] shrink-0">
                      {proj.tech.join(' · ') || proj.link}
                    </span>
                  )}
                </div>

                {/* Row 2: Italic Tagline */}
                <div className="text-[13px] italic leading-[1.4] mb-1.5">
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
                    className="italic text-[#111111]"
                  />
                </div>

                {proj.highlights.length > 0 && (
                  <ul className="space-y-1 pl-3">
                    {proj.highlights.map((h) => {
                      const diags = showLinter ? diagnosticsByTarget[h.id] || [] : [];
                      const topDiag = diags.find((d) => d.severity !== 'verified');
                      const isDiagOpen = activeDiagId === h.id;
                      const markClass = topDiag
                        ? topDiag.severity === 'warning'
                          ? 'linter-squiggle'
                          : 'linter-marker'
                        : '';

                      return (
                        <li key={h.id} className={`relative ${dimClass(h.id)}`}>
                          <div className="flex items-baseline gap-2.5">
                            <span className="text-[12px] text-[#111111] select-none">•</span>
                            <EditableField
                              as="p"
                              value={h.text}
                              markClass={markClass}
                              dataEditableType="project_highlight"
                              dataParentId={proj.id}
                              dataTargetId={h.id}
                              onClick={() => {
                                if (topDiag && window.getSelection()?.isCollapsed) {
                                  onSetActiveDiagId(isDiagOpen ? null : h.id);
                                }
                              }}
                              onCommit={(updated) =>
                                onUpdateProfile((p) => ({
                                  ...p,
                                  projects: p.projects.map((item) =>
                                    item.id !== proj.id
                                      ? item
                                      : {
                                          ...item,
                                          highlights: item.highlights.map((hl) =>
                                            hl.id === h.id ? { ...hl, text: updated } : hl
                                          ),
                                        }
                                  ),
                                }))
                              }
                              className="text-[13px] leading-[1.52] text-[#111111] flex-1"
                            />
                          </div>

                          {pendingDiffs
                            .filter((d) => d.targetId === h.id)
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
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS */}
      {profile.skills.length > 0 && (
        <section className={dimClass('skills')}>
          <h2 className="[font-variant:small-caps] text-[15.5px] tracking-[0.06em] font-normal text-[#222222] mb-2.5">
            Skills
          </h2>
          {hasColonSkills ? (
            <div className="space-y-2 text-[13px] leading-[1.52]">
              {profile.skills.map((skillRow, idx) => {
                const colonIdx = skillRow.indexOf(':');
                if (colonIdx === -1) {
                  return (
                    <div key={idx}>
                      <EditableField
                        value={skillRow}
                        onCommit={(v) =>
                          onUpdateProfile((p) => ({
                            ...p,
                            skills: p.skills.map((s, i) => (i === idx ? v : s)),
                          }))
                        }
                      />
                    </div>
                  );
                }
                const label = skillRow.slice(0, colonIdx).trim();
                const val = skillRow.slice(colonIdx + 1).trim();
                return (
                  <div key={idx} className="flex items-baseline gap-6">
                    <span className="w-40 shrink-0 font-bold text-[#111111]">{label}</span>
                    <EditableField
                      value={val}
                      onCommit={(v) =>
                        onUpdateProfile((p) => ({
                          ...p,
                          skills: p.skills.map((s, i) => (i === idx ? `${label}: ${v}` : s)),
                        }))
                      }
                      className="flex-1 text-[#111111]"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-baseline gap-6 text-[13px] leading-[1.52]">
              <span className="w-40 shrink-0 font-bold text-[#111111]">Technical & Core</span>
              <div className="flex-1 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[#111111]">
                {profile.skills.map((skill, idx) => (
                  <span key={`${skill}-${idx}`}>
                    <EditableField
                      value={skill}
                      onCommit={(v) =>
                        onUpdateProfile((p) => ({
                          ...p,
                          skills: p.skills.map((s, i) => (i === idx ? v : s)),
                        }))
                      }
                    />
                    {idx < profile.skills.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
