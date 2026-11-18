import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CareerProfile } from '@/lib/career-types';

const InterviewTurnSchema = z.object({
  transcript: z
    .string()
    .optional()
    .describe('Clean transcript of what the candidate said if an audio answer was provided.'),
  feedback: z
    .string()
    .optional()
    .describe('1-sentence direct coaching feedback on the candidate answer. Omit on the opening question.'),
  nextQuestion: z
    .string()
    .describe('A sharp, specific interview question challenging or probing a real claim on the resume, or a brief wrap-up if done is true.'),
  done: z
    .boolean()
    .describe('True only after the candidate has answered 3 questions.'),
  suggestedEdit: z
    .object({
      targetType: z.enum(['summary', 'experience_bullet']),
      parentId: z.string().optional(),
      targetId: z.string().optional(),
      originalText: z.string(),
      proposedText: z.string(),
      reason: z.string(),
      sourceEvidence: z.string().describe('Exact fact or metric the candidate just stated.'),
    })
    .optional()
    .describe('If the candidate revealed a concrete metric, tool, or outcome in their answer, propose a grounded upgrade to that exact resume line.'),
});

interface HistoryTurn {
  role: 'interviewer' | 'candidate';
  text: string;
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(
      { error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const profileRaw = formData.get('profile') as string | null;
    const historyRaw = formData.get('history') as string | null;
    const text = (formData.get('text') as string | null)?.trim() || '';
    const audioFile = formData.get('audio') as File | null;

    if (!profileRaw) {
      return NextResponse.json({ error: 'Missing profile payload' }, { status: 400 });
    }

    const profile: CareerProfile = JSON.parse(profileRaw);
    const history: HistoryTurn[] = historyRaw ? JSON.parse(historyRaw) : [];
    const candidateTurns = history.filter((h) => h.role === 'candidate').length + (text || audioFile ? 1 : 0);

    const systemPrompt = `You are a sharp, realistic hiring manager conducting a 3-question "Defend Your Resume" mock interview.
Your goal:
1. Ask specific, probing questions about actual claims, metrics, or vague bullets in the candidate's CareerProfile.
2. When the candidate answers (via voice or text), give 1 sentence of honest feedback.
3. If their answer reveals real, concrete details or metrics not yet captured clearly on the resume, propose a \`suggestedEdit\` matching the exact \`targetId\` (e.g. "summary" or bullet id) and \`parentId\` (experience id) from the CareerProfile JSON. NEVER invent facts they did not say.
4. Set \`done: true\` once the candidate has answered 3 questions (${candidateTurns}/3 answered so far).

Candidate CareerProfile JSON:
${JSON.stringify(profile, null, 2)}

Conversation so far:
${history.map((h) => `${h.role.toUpperCase()}: ${h.text}`).join('\n') || '(Opening turn — ask Question 1)'}`;

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
      text:
        history.length === 0
          ? 'Start the mock interview with Question 1, probing a specific claim or vague bullet on the resume.'
          : text
            ? `Candidate's answer: "${text}"`
            : 'Listen to the candidate’s spoken answer, transcribe it, give brief feedback, propose a grounded resume edit if warranted, and ask the next question (or wrap up if 3 questions are complete).',
    });

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: InterviewTurnSchema,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    });

    const suggestedDiff = object.suggestedEdit
      ? {
          id: `diff-interview-${Date.now()}`,
          targetType: object.suggestedEdit.targetType,
          parentId: object.suggestedEdit.parentId,
          targetId:
            object.suggestedEdit.targetType === 'summary'
              ? 'summary'
              : object.suggestedEdit.targetId,
          originalText: object.suggestedEdit.originalText,
          proposedText: object.suggestedEdit.proposedText,
          reason: object.suggestedEdit.reason,
          sourceEvidence: object.suggestedEdit.sourceEvidence,
        }
      : undefined;

    return NextResponse.json({
      transcript: object.transcript,
      feedback: object.feedback,
      nextQuestion: object.nextQuestion,
      done: object.done,
      suggestedDiff,
    });
  } catch (err) {
    console.error('Mock interview API error:', err);
    return NextResponse.json(
      { error: 'Failed to process interview turn. Please try again.' },
      { status: 500 }
    );
  }
}
