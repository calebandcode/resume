import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { CareerProfile } from '@/lib/career-types';

const ImportedProfileSchema = z.object({
  fullName: z.string(),
  headline: z.string().describe('Short professional title, e.g. Full-Stack Engineer'),
  location: z.string(),
  email: z.string(),
  website: z.string().optional(),
  github: z.string().optional(),
  summary: z.string(),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string(),
      period: z.string(),
      bullets: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      tagline: z.string(),
      tech: z.array(z.string()),
      link: z.string().optional(),
      highlights: z.array(z.string()),
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
      system:
        'You are an accurate CV parser. Extract all information faithfully from the uploaded PDF or image without inventing skills, metrics, or roles that are not present.',
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
          text: b,
          sourceEvidence: `Imported from ${file.name}`,
          verified: true,
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
          text: h,
          sourceEvidence: `Imported from ${file.name}`,
          verified: true,
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

