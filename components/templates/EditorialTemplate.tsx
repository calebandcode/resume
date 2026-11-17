'use client';

import { Sparkles } from 'lucide-react';
import { CareerProfile, LinterDiagnostic, PendingDiff } from '@/lib/career-types';
import { DiffGhostCard } from '@/components/DiffGhostCard';
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
        <h1
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const next = e.currentTarget.textContent;
            if (next !== null) {
              onUpdateProfile((p) => ({ ...p, fullName: next || p.fullName }));
            }
          }}
          className="text-[22px] sm:text-[25px] font-bold uppercase tracking-[0.06em] text-[#1a1a1a] leading-tight focus:outline-none"
        >
          {profile.fullName}
        </h1>
        <p className="text-[11px] text-neutral-500 mt-1">
          {[profile.location, profile.phone, profile.email].filter(Boolean).join('  •  ')}
        </p>
      </header>

      {/* Professional Profile */}
      <section className={`mb-7 ${dimClass('summary')}`}>
        <h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a] pb-1.5 border-b-[1.5px] border-[#1a1a1a] mb-3">
          Professional Profile
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
            <div key={exp.id}>
              <div className={`flex items-baseline justify-between gap-4 ${dimClass(exp.id)}`}>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.03em] text-[#1a1a1a]">
                    {exp.role}
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-800 mt-0.5">
                    {exp.company}
                    {exp.location ? ` (${exp.location})` : ''}
                  </div>
                </div>
                <span className="text-[10.5px] font-semibold text-neutral-800 shrink-0">
                  {exp.period}
                </span>
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
                          className="text-[11px] leading-[1.65] text-neutral-600 flex-1 focus:outline-none"
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
                <div className="text-[11px] font-bold text-[#1a1a1a]">{edu.degree}</div>
                <div className="text-[10.5px] text-neutral-600 mt-0.5">{edu.school}</div>
              </div>
              <span className="text-[10.5px] font-semibold text-neutral-800 shrink-0">
                {edu.period}
              </span>
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
            profile.skills.map((line) => {
              const [label, ...rest] = line.split(':');
              return (
                <p key={line}>
                  <span className="font-bold text-[#1a1a1a]">{label}:</span>
                  {rest.join(':')}
                </p>
              );
            })
          ) : (
            <p>
              <span className="font-bold text-[#1a1a1a] mr-1.5">Skills:</span>
              {profile.skills.join(', ')}
            </p>
          )}
        </div>
      </section>
    </article>
  );
}
