import { CareerProfile, LinterDiagnostic, ResumeBullet } from './career-types';

const WEAK_PHRASES = [
  'worked on',
  'helped',
  'assisted',
  'responsible for',
  'participated in',
  'handled',
  'did',
  'can play an important role',
];

const HAS_METRIC_REGEX = /(\d+%|\$\d+|\d+\+|\d+x|\d+\s*(ms|s|sec|users|events|requests|hours|days|months|k|m))/i;

function lintBullet(bullet: ResumeBullet): LinterDiagnostic[] {
  const diagnostics: LinterDiagnostic[] = [];
  const lower = bullet.text.trim().toLowerCase();

  const weakMatch = WEAK_PHRASES.find((phrase) => lower.includes(phrase));
  if (weakMatch) {
    diagnostics.push({
      id: `diag-weak-${bullet.id}`,
      targetId: bullet.id,
      severity: 'warning',
      title: 'Passive phrasing',
      message: `Contains "${weakMatch}". Lead with a concrete action verb (Built, Reduced, Shipped, Designed).`,
      suggestedAction: 'Tap the orb and say what you specifically built or owned.',
    });
  }

  if (!HAS_METRIC_REGEX.test(bullet.text)) {
    diagnostics.push({
      id: `diag-metric-${bullet.id}`,
      targetId: bullet.id,
      severity: 'info',
      title: 'Missing measurable outcome',
      message: 'No scale, speed, or impact number detected. Adding a real metric makes this 2x stronger for ATS & recruiters.',
      suggestedAction: 'Speak 10s about the impact (users, %, time saved).',
    });
  }

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

