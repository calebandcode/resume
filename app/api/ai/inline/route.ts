import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const InlineDiffSchema = z.object({
  proposedText: z.string().describe('The improved replacement text for the highlighted block.'),
  reason: z.string().describe('Short 1-sentence explanation of the improvement.'),
  sourceEvidence: z
    .string()
    .describe('What user-provided fact or original phrasing grounds this edit. Never invent metrics.'),
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
    const selectedText = (formData.get('selectedText') as string | null) || '';
    const targetType = (formData.get('targetType') as string | null) || 'experience_bullet';
    const parentId = (formData.get('parentId') as string | null) || undefined;
    const targetId = (formData.get('targetId') as string | null) || undefined;
    const action = (formData.get('action') as string | null) || 'rewrite';
    const instruction = (formData.get('instruction') as string | null) || '';
    const audioFile = formData.get('audio') as File | null;

    if (!selectedText.trim()) {
      return NextResponse.json({ error: 'No text selected' }, { status: 400 });
    }

    const actionGuides: Record<string, string> = {
      quantify:
        'Highlight measurable impact or scale using ONLY facts present in the text or voice note. If no number is provided, sharpen the concrete outcome without inventing numbers.',
      rewrite:
        'Rewrite for maximum clarity, strong past-tense action verbs, and ATS readability while staying 100% truthful.',
      punchy: 'Make this tighter and more concise (under 20 words) while keeping the core impact.',
      custom: `Apply the user's specific instruction: "${instruction}"`,
    };

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
      text: `Original text: "${selectedText}"
Goal: ${actionGuides[action] || actionGuides.rewrite}${
        audioFile && audioFile.size > 0
          ? '\nAlso incorporate the attached voice note into the rewrite.'
          : ''
      }`,
    });

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: InlineDiffSchema,
      system:
        'You are a precision inline resume editor. Return a single truthful replacement string. Never invent fake metrics or skills.',
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    return NextResponse.json({
      diff: {
        id: `diff-inline-${Date.now()}`,
        targetType,
        parentId,
        targetId,
        originalText: selectedText,
        proposedText: object.proposedText,
        reason: object.reason,
        sourceEvidence: object.sourceEvidence,
      },
    });
  } catch (err) {
    console.error('Inline AI error:', err);
    return NextResponse.json(
      { error: 'Failed to generate inline suggestion.' },
      { status: 500 }
    );
  }
}

