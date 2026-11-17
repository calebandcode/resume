import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { getPublishedPortfolio } from '@/lib/portfolio-store';

async function PortfolioContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await getPublishedPortfolio(slug);

  if (!record) {
    notFound();
  }

  const { profile, publishedAt } = record;

  return (
    <div className="mx-auto max-w-[600px] space-y-16">
      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 hover:border-foreground/20 hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Aura Canvas
        </Link>
        <span>Updated {new Date(publishedAt).toLocaleDateString()}</span>
      </div>

      {/* Hero */}
      <section className="space-y-5">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            {profile.fullName}
          </h1>
          <p className="text-[15px] text-muted-foreground mt-1">{profile.headline}</p>
        </div>

        <p className="text-[15px] leading-relaxed text-muted-foreground">{profile.summary}</p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {profile.skills.slice(0, 10).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* Selected Work */}
      {profile.projects.length > 0 && (
        <section>
          <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
            Selected work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.projects.map((proj) => (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-colors duration-300 hover:border-foreground/20 hover:bg-[#f0efed]"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="font-heading text-[15px] font-semibold text-foreground">
                    {proj.name}
                  </h2>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {proj.tagline}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {proj.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-foreground">
                  {proj.link || 'View project'}
                  <span
                    aria-hidden
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {profile.experience.length > 0 && (
        <section>
          <p className="mb-6 text-xs uppercase tracking-widest text-muted-foreground">
            Experience
          </p>
          <div className="space-y-6">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="border-t border-border pt-4 space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading text-[14.5px] font-semibold text-foreground">
                    {exp.role} ·{' '}
                    <span className="font-normal text-muted-foreground">{exp.company}</span>
                  </span>
                  <span className="text-[12px] font-mono text-muted-foreground">{exp.period}</span>
                </div>
                <ul className="space-y-1.5">
                  {exp.bullets.map((b) => (
                    <li
                      key={b.id}
                      className="text-[13px] text-muted-foreground leading-relaxed flex items-start gap-1.5"
                    >
                      {b.verified && (
                        <span
                          title={b.sourceEvidence || 'Verified claim'}
                          className="mt-0.5 shrink-0"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </span>
                      )}
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function PublishedPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="min-h-screen py-16 px-6 md:px-8">
      <Suspense
        fallback={
          <div className="mx-auto max-w-[600px] py-16 text-center text-sm text-muted-foreground">
            Loading portfolio...
          </div>
        }
      >
        <PortfolioContent params={params} />
      </Suspense>
    </main>
  );
}
