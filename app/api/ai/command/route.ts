import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CareerProfile } from '@/lib/career-types';

const DiffSchema = z.object({
  assistantNote: z.string().describe('Short 1-sentence confirmation of what you understood and proposed.'),
  transcript: z.string().optional().describe('Verbatim summary of what the user said if audio was provided.'),
  diffs: z.array(
    z.object({
      targetType: z.enum([
        'summary',
        'experience_bullet',
        'project_highlight',
        'add_experience',
        'add_project',
      ]),
      parentId: z.string().optional(),
      targetId: z.string().optional(),
      originalText: z.string(),
      proposedText: z.string(),
      reason: z.string().describe('Brief explanation of why this edit improves the resume/portfolio.'),
      sourceEvidence: z
        .string()
        .describe('Exact fact or quote from the user input that grounds this edit. Never invent metrics.'),
      newExperience: z
        .object({
          role: z.string(),
          company: z.string(),
          location: z.string(),
          period: z.string(),
          bullets: z.array(z.string()),
        })
        .optional(),
      newProject: z
        .object({
          name: z.string(),
          tagline: z.string(),
          tech: z.array(z.string()),
          link: z.string().optional(),
          highlights: z.array(z.string()),
        })
        .optional(),
    })
  ),
  directPatch: z
    .object({
      fullName: z.string().optional(),
      headline: z.string().optional(),
      location: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      addSkills: z.array(z.string()).optional(),
      addBulletToExperience: z
        .object({
          experienceId: z.string(),
          bulletText: z.string(),
        })
        .optional(),
    })
    .optional()
    .describe(
      'Use for direct metadata/header updates (name, headline, email, phone, location), adding skills, or adding a brand-new bullet to an existing experience item.'
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
    const formData = await req.formData();
    const text = (formData.get('text') as string | null)?.trim() || '';
    const profileRaw = formData.get('profile') as string | null;
    const audioFile = formData.get('audio') as File | null;

    if (!profileRaw) {
      return NextResponse.json({ error: 'Missing profile payload' }, { status: 400 });
    }

    const profile: CareerProfile = JSON.parse(profileRaw);

    const systemPrompt = `You are an expert, strictly truthful Career Editor inside a tactile document canvas.
Given the user's current CareerProfile JSON and their new voice note or text instruction, propose surgical diffs to update their resume/portfolio.

RULES:
1. NEVER fabricate metrics, percentages, user counts, or technologies the user did not state.
2. If the user's input lacks a number, improve the action verb and clarity without inventing numbers.
3. For modifying existing items, match the exact \`targetId\` (bullet id, or "summary") and \`parentId\` (experience or project id) from the CareerProfile JSON.
4. For \`targetType: "summary"\`, either set \`originalText\` to the exact sentence/phrase being replaced, or include the full updated summary in \`proposedText\`.
5. For adding a new role or project, use \`targetType: "add_experience"\` or \`"add_project"\` and populate \`newExperience\` or \`newProject\`.
6. If the user asks to change their name, headline/title, email, phone, location, add skills, or add a new bullet to an existing experience role, populate \`directPatch\`.
7. Keep \`assistantNote\` under 18 words.

Current CareerProfile JSON:
${JSON.stringify(profile, null, 2)}`;

    const userContent: Array<
      | { type: 'text'; text: string }
      | { type: 'file'; data: Uint8Array; mediaType: string }
    > = [];

    if (audioFile && audioFile.size > 0) {
      const arrayBuffer = await audioFile.arrayBuffer();
      userContent.push({
        type: 'file',
        data: new Uint8Array(arrayBuffer),
        mediaType: audioFile.type || 'audio/webm',
      });
    }

    userContent.push({
      type: 'text',
      text: text
        ? `User instruction: "${text}"`
        : 'Listen to the attached voice note, transcribe the intent, and propose surgical diffs to the CareerProfile.',
    });

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: DiffSchema,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    const now = Date.now();
    const normalizedDiffs = object.diffs.map((d, idx) => {
      let resolvedParentId = d.parentId;
      let resolvedTargetId = d.targetType === 'summary' ? 'summary' : d.targetId;

      if (d.targetType === 'experience_bullet') {
        const allBullets = profile.experience.flatMap((exp) =>
          exp.bullets.map((b) => ({ expId: exp.id, bullet: b }))
        );
        const exactById = allBullets.find((item) => item.bullet.id === resolvedTargetId);
        if (exactById) {
          resolvedParentId = exactById.expId;
          resolvedTargetId = exactById.bullet.id;
        } else if (d.originalText) {
          const origLower = d.originalText.trim().toLowerCase();
          const byText = allBullets.find(
            (item) =>
              item.bullet.text.toLowerCase().includes(origLower) ||
              origLower.includes(item.bullet.text.toLowerCase())
          );
          if (byText) {
            resolvedParentId = byText.expId;
            resolvedTargetId = byText.bullet.id;
          }
        }
        if (!resolvedTargetId && resolvedParentId) {
          const parentExp = profile.experience.find((e) => e.id === resolvedParentId);
          if (parentExp?.bullets[0]) {
            resolvedTargetId = parentExp.bullets[0].id;
          }
        }
      }

      return {
        id: `diff-${now}-${idx}`,
        targetType: d.targetType,
        parentId: resolvedParentId,
        targetId: resolvedTargetId,
        originalText: d.originalText,
        proposedText: d.proposedText,
        reason: d.reason,
        sourceEvidence: d.sourceEvidence,
        newExperience: d.newExperience
          ? {
              id: `exp-${now}-${idx}`,
              role: d.newExperience.role,
              company: d.newExperience.company,
              location: d.newExperience.location,
              period: d.newExperience.period,
              bullets: d.newExperience.bullets.map((b, bIdx) => ({
                id: `b-${now}-${idx}-${bIdx}`,
                text: b,
                sourceEvidence: d.sourceEvidence,
                verified: true,
              })),
            }
          : undefined,
        newProject: d.newProject
          ? {
              id: `proj-${now}-${idx}`,
              name: d.newProject.name,
              tagline: d.newProject.tagline,
              tech: d.newProject.tech,
              link: d.newProject.link,
              highlights: d.newProject.highlights.map((h, hIdx) => ({
                id: `ph-${now}-${idx}-${hIdx}`,
                text: h,
                sourceEvidence: d.sourceEvidence,
                verified: true,
              })),
            }
          : undefined,
      };
    });

    return NextResponse.json({
      assistantNote: object.assistantNote,
      transcript: object.transcript,
      diffs: normalizedDiffs,
      directPatch: object.directPatch,
    });
  } catch (err) {
    console.error('AI command error:', err);
    return NextResponse.json(
      { error: 'Failed to process AI command. Check your API key and try again.' },
      { status: 500 }
    );
  }
}

