import { CareerProfile, LinterDiagnostic, ResumeBullet } from './career-types';

const PASSIVE_PHRASES = [
  'worked on',
  'helped',
  'assisted',
  'responsible for',
  'participated in',
  'involved in',
  'tasked with',
  'can play an important role',
  'use bulleted lists',
  'start every bullet',
  'be consistent with',
  "you don't need to",
  'double-check your resume',
  'once you are sure',
  'name your resume',
  'congratulations!',
  'tailor your resume',
];

const DUTY_VERBS = [
  'managed',
  'maintained',
  'handled',
  'coordinated',
  'oversaw',
  'monitored',
  'administered',
  'supported',
  'conducted',
];

const VAGUE_MODIFIERS = [
  'various',
  'multiple',
  'several',
  'numerous',
  'significant',
  'successfully',
  'different',
  'etc.',
];

const OUTCOME_CONNECTORS =
  /\b(reducing|reduced|increasing|increased|improving|improved|saving|saved|cutting|cut|growing|grew|resulting in|leading to|by\s+\d|to\s+\d|from\s+\d|across\s+\d|for\s+\d|serving\s+\d|worth\s+)/i;

function hasConcreteMetric(text: string): boolean {
  // Match percentages, currency ($/₦/€/£), multipliers (2x), pluses (40+), or numbers with units/counts (excluding standalone 4-digit calendar years 1990-2039)
  if (/(\d+(\.\d+)?%|[₦$€£]\s*\d+|\b\d+\+|\b\d+(\.\d+)?x\b)/i.test(text)) {
    return true;
  }
  const withoutYears = text.replace(/\b(19[89]\d|20[0-3]\d)\b/g, '');
  return /\b\d+(\.\d+)?(\s*(k|m|b|ms|s|sec|mins?|hrs?|hours?|days?|weeks?|months?|yrs?|years?|users?|clients?|customers?|stakeholders?|engineers?|developers?|members?|people|teams?|projects?|hubs?|stores?|accounts?|endpoints?|services?|pipelines?|reports?|subsidiaries|cities|countries|regions?))?\b/i.test(
    withoutYears
  );
}

function getTopicSnippet(text: string): string {
  const cleaned = text.trim().replace(/[.!?]+$/, '');
  const words = cleaned.split(/\s+/);
  if (words.length <= 6) return `"${cleaned}"`;
  return `"${words.slice(0, 6).join(' ')}..."`;
}

function lintBullet(bullet: ResumeBullet): LinterDiagnostic[] {
  // 1. If an AI contextual diagnostic was attached during CV import and text hasn't changed, use it directly
  if (bullet.lintIssue && bullet.lintIssue.forText === bullet.text) {
    return [
      {
        id: `diag-ai-${bullet.id}`,
        targetId: bullet.id,
        severity: bullet.lintIssue.severity,
        title: bullet.lintIssue.title,
        message: bullet.lintIssue.message,
        suggestedAction: bullet.lintIssue.suggestedAction,
      },
    ];
  }

  const diagnostics: LinterDiagnostic[] = [];
  const trimmed = bullet.text.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const firstWord = (words[0] || '').toLowerCase().replace(/[^a-z]/g, '');
  const hasMetric = hasConcreteMetric(trimmed);
  const hasOutcome = OUTCOME_CONNECTORS.test(trimmed);

  // 2. Passive / weak phrasing or template instruction text
  const passiveMatch = PASSIVE_PHRASES.find((phrase) => lower.includes(phrase));
  if (passiveMatch) {
    diagnostics.push({
      id: `diag-weak-${bullet.id}`,
      targetId: bullet.id,
      severity: 'warning',
      title: 'Passive or template phrasing',
      message: `Uses "${passiveMatch}" in ${getTopicSnippet(trimmed)} — replace with a direct ownership verb (Built, Led, Reduced, Shipped) and your real outcome.`,
      suggestedAction: 'Highlight to Rewrite or defend in Mock Interview.',
    });
    return diagnostics;
  }

  // 3. Duty verb without an outcome or metric
  if (DUTY_VERBS.includes(firstWord) && !hasMetric && !hasOutcome) {
    diagnostics.push({
      id: `diag-duty-${bullet.id}`,
      targetId: bullet.id,
      severity: 'warning',
      title: 'Duty instead of outcome',
      message: `${getTopicSnippet(trimmed)} describes day-to-day responsibility rather than what improved, sped up, or changed as a result.`,
      suggestedAction: 'Add what changed or how many people/systems this impacted.',
    });
    return diagnostics;
  }

  // 4. Vague filler modifier when no concrete metric is present
  const vagueMatch = VAGUE_MODIFIERS.find((mod) =>
    new RegExp(`\\b${mod.replace('.', '\\.')}\\b`, 'i').test(trimmed)
  );
  if (vagueMatch && !hasMetric) {
    diagnostics.push({
      id: `diag-vague-${bullet.id}`,
      targetId: bullet.id,
      severity: 'info',
      title: `Vague scope ("${vagueMatch}")`,
      message: `Replacing "${vagueMatch}" in ${getTopicSnippet(trimmed)} with an exact count, scale, or business result makes this claim credible.`,
      suggestedAction: 'Replace the vague word with an exact number or scope.',
    });
    return diagnostics;
  }

  // 5. Very short bullet (< 8 words) with no metric or outcome
  if (words.length < 8 && !hasMetric && !hasOutcome) {
    diagnostics.push({
      id: `diag-short-${bullet.id}`,
      targetId: bullet.id,
      severity: 'info',
      title: 'Brief claim — add context',
      message: `${getTopicSnippet(trimmed)} is very brief. Add how you executed it (tools/approach) or the concrete result.`,
      suggestedAction: 'Click Quantify or expand with the outcome.',
    });
    return diagnostics;
  }

  // 6. Verified / strong claim
  if (bullet.verified && bullet.sourceEvidence && diagnostics.length === 0) {
    diagnostics.push({
      id: `diag-verified-${bullet.id}`,
      targetId: bullet.id,
      severity: 'verified',
      title: 'Grounded claim',
      message: `Backed by your input: "${bullet.sourceEvidence}"`,
    });
  }

  return diagnostics;
}

export function runCareerLinter(profile: CareerProfile): Record<string, LinterDiagnostic[]> {
  const byTarget: Record<string, LinterDiagnostic[]> = {};

  for (const exp of profile.experience) {
    for (const bullet of exp.bullets) {
      const results = lintBullet(bullet);
      if (results.length > 0) {
        byTarget[bullet.id] = results;
      }
    }
  }

  for (const proj of profile.projects) {
    for (const highlight of proj.highlights) {
      const results = lintBullet(highlight);
      if (results.length > 0) {
        byTarget[highlight.id] = results;
      }
    }
  }

  return byTarget;
}
