import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CareerProfile } from '@/lib/career-types';

const ImportedBulletSchema = z.object({
  text: z.string(),
  evaluation: z
    .enum(['strong', 'warning', 'info'])
    .describe(
      '"strong" if specific and well-scoped; "warning" if passive, vague, or pure duty description; "info" if a good action bullet that is missing concrete scale, stack, or outcome.'
    ),
  diagnosticTitle: z
    .string()
    .describe(
      'Required specific 2-5 word title about THIS bullet (e.g. "Missing website traffic or stack", "Unclear API scale", "Duty instead of delivery outcome"). Do NOT use generic titles.'
    ),
  diagnosticMessage: z
    .string()
    .describe(
      'Required 1-sentence critique talking directly about the specific subject of THIS bullet (e.g. "You mention designing the organisation\'s public website, but not the tech stack used, launch timeline, or visitor impact."). NEVER reuse the same sentence template across bullets.'
    ),
  suggestedAction: z
    .string()
    .describe(
      'Specific follow-up question for THIS bullet (e.g. "What stack did you build it with, and what changed after launch?").'
    ),
});

const ImportedProfileSchema = z.object({
  fullName: z.string(),
  headline: z.string().describe('Short professional title, e.g. Full-Stack Engineer'),
  location: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  github: z.string().optional(),
  summary: z.string(),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      period: z.string(),
      bullets: z.array(ImportedBulletSchema),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      tagline: z.string(),
      tech: z.array(z.string()),
      link: z.string().optional(),
      highlights: z.array(ImportedBulletSchema),
    })
  ),
  education: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      period: z.string(),
    })
  ),
  skills: z.array(z.string()),
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
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a PDF or an image (PNG, JPG, WebP).' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const now = Date.now();

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: ImportedProfileSchema,
      system: `You are an accurate CV parser and Truth Linter.
1. Extract all information faithfully from the uploaded PDF or image without inventing skills, metrics, or roles that are not present.
2. For each experience bullet and project highlight, evaluate whether it has a genuine weakness:
   - "warning": Passive opener ("Responsible for", "Worked on", "Helped"), pure job-duty description with no outcome, or vague filler claims.
   - "info": Good action verb, but missing concrete scope, scale, or measurable result.
   - null: Already strong, specific, and well-scoped or quantified.
3. CRITICAL: Every lintIssue.message MUST be tailored to the exact topic of that bullet (e.g. "You mention building the payment API, but not the transaction volume or latency improvement"). NEVER repeat generic boilerplate across bullets.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: new Uint8Array(buffer),
              mediaType: file.type,
            },
            {
              type: 'text',
              text: 'Extract this CV into the structured CareerProfile schema. If a field like website or github is not present, omit it. If projects are not listed, return an empty array.',
            },
          ],
        },
      ],
    });

    const profile: CareerProfile = {
      fullName: object.fullName,
      headline: object.headline,
      location: object.location,
      email: object.email,
      phone: object.phone,
      linkedin: object.linkedin,
      website: object.website,
      github: object.github,
      summary: object.summary,
      summaryEvidence: `Imported from ${file.name}`,
      experience: object.experience.map((exp, idx) => ({
        id: `exp-${now}-${idx}`,
        role: exp.role,
        company: exp.company,
        location: exp.location,
        period: exp.period,
        bullets: exp.bullets.map((b, bIdx) => ({
          id: `b-${now}-${idx}-${bIdx}`,
          text: b.text,
          sourceEvidence: `Imported from ${file.name}`,
          verified: b.evaluation === 'strong',
          lintIssue: {
            severity:
              b.evaluation === 'strong'
                ? 'verified'
                : b.evaluation === 'warning'
                  ? 'warning'
                  : 'info',
            title: b.diagnosticTitle || (b.evaluation === 'strong' ? 'Grounded claim' : 'Needs concrete scope'),
            message: b.diagnosticMessage,
            suggestedAction: b.evaluation === 'strong' ? undefined : b.suggestedAction,
            forText: b.text,
          },
        })),
      })),
      projects: object.projects.map((proj, idx) => ({
        id: `proj-${now}-${idx}`,
        name: proj.name,
        tagline: proj.tagline,
        tech: proj.tech,
        link: proj.link,
        highlights: proj.highlights.map((h, hIdx) => ({
          id: `ph-${now}-${idx}-${hIdx}`,
          text: h.text,
          sourceEvidence: `Imported from ${file.name}`,
          verified: h.evaluation === 'strong',
          lintIssue: {
            severity:
              h.evaluation === 'strong'
                ? 'verified'
                : h.evaluation === 'warning'
                  ? 'warning'
                  : 'info',
            title: h.diagnosticTitle || (h.evaluation === 'strong' ? 'Grounded claim' : 'Needs concrete scope'),
            message: h.diagnosticMessage,
            suggestedAction: h.evaluation === 'strong' ? undefined : h.suggestedAction,
            forText: h.text,
          },
        })),
      })),
      education: object.education.map((edu, idx) => ({
        id: `edu-${now}-${idx}`,
        school: edu.school,
        degree: edu.degree,
        period: edu.period,
      })),
      skills: object.skills,
    };

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('CV import error:', err);
    return NextResponse.json(
      { error: 'Failed to parse CV. Make sure the file is readable and your API key is set.' },
      { status: 500 }
    );
  }
}

