import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CareerProfile } from '@/lib/career-types';

const TailorResponseSchema = z.object({
  roleTitle: z.string().describe('Short target role & company if mentioned, e.g. "Product Designer · Stripe"'),
  matchScore: z.number().min(0).max(100).describe('Honest 0-100 ATS match score based strictly on existing experience.'),
  truthfulSummary: z.string().describe('One honest sentence explaining the fit and biggest gap.'),
  matchedKeywords: z.array(z.string()).max(8).describe('Keywords/skills from the JD that the candidate genuinely has.'),
  missingKeywords: z.array(z.string()).max(6).describe('Important requirements from the JD that are NOT in the candidate profile.'),
  diffs: z.array(
    z.object({
      targetType: z.enum(['summary', 'experience_bullet']),
      parentId: z.string().optional(),
      targetId: z.string().optional(),
      originalText: z.string(),
      proposedText: z.string(),
      reason: z.string().describe('Why this reframing aligns with the JD without fabricating anything.'),
      sourceEvidence: z.string().describe('Exact existing fact from the profile that grounds this rewrite.'),
    })
  ),
});

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const profile = body.profile as CareerProfile | undefined;
    const jobDescription = typeof body.jobDescription === 'string' ? body.jobDescription.trim() : '';

    if (!profile || jobDescription.length < 20) {
      return NextResponse.json(
        { error: 'Please paste a job description (at least 20 characters).' },
        { status: 400 }
      );
    }

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: TailorResponseSchema,
      system: `You are a strictly truthful ATS career coach.
Analyze how well the candidate's CareerProfile matches the Job Description.

STRICT RESPONSIBLE-AI RULES:
1. NEVER invent, add, or imply skills, tools, years of experience, or metrics that are NOT already in the CareerProfile.
2. Put genuine missing requirements in \`missingKeywords\`—do NOT sneak them into \`diffs\`.
3. Only propose \`diffs\` (up to 4 high-impact surgical edits) that reframe or emphasize EXISTING facts using relevant JD terminology.
4. For every diff, match the exact \`targetId\` (e.g. "summary" or bullet id) and \`parentId\` (experience id for bullets) from the CareerProfile JSON.`,
      prompt: `Job Description:
${jobDescription}

Candidate CareerProfile JSON:
${JSON.stringify(profile, null, 2)}`,
    });

    const now = Date.now();
    const diffs = object.diffs.map((d, idx) => ({
      id: `diff-tailor-${now}-${idx}`,
      targetType: d.targetType,
      parentId: d.parentId,
      targetId: d.targetType === 'summary' ? 'summary' : d.targetId,
      originalText: d.originalText,
      proposedText: d.proposedText,
      reason: d.reason,
      sourceEvidence: d.sourceEvidence,
    }));

    return NextResponse.json({
      report: {
        roleTitle: object.roleTitle,
        matchScore: Math.round(object.matchScore),
        truthfulSummary: object.truthfulSummary,
        matchedKeywords: object.matchedKeywords,
        missingKeywords: object.missingKeywords,
      },
      diffs,
    });
  } catch (err) {
    console.error('Tailor API error:', err);
    return NextResponse.json(
      { error: 'Failed to analyze job description. Please try again.' },
      { status: 500 }
    );
  }
}
