import { NextResponse } from 'next/server';
import { CareerProfile } from '@/lib/career-types';
import { savePublishedPortfolio, slugifyName } from '@/lib/portfolio-store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profile = body.profile as CareerProfile | undefined;
    const requestedSlug = typeof body.slug === 'string' ? body.slug : '';

    if (!profile || !profile.fullName) {
      return NextResponse.json({ error: 'Invalid career profile' }, { status: 400 });
    }

    const slug = slugifyName(requestedSlug || profile.fullName);
    const saved = await savePublishedPortfolio(slug, profile);

    return NextResponse.json({
      slug: saved.slug,
      url: `/p/${saved.slug}`,
      publishedAt: saved.publishedAt,
    });
  } catch (err) {
    console.error('Publish portfolio error:', err);
    return NextResponse.json({ error: 'Failed to publish portfolio' }, { status: 500 });
  }
}
