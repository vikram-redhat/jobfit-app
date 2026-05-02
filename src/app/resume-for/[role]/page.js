// src/app/resume-for/[role]/page.js
// Server component, statically generated at build time for every role with
// cached content. This is the heart of the programmatic SEO surface.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getBuildableRoles,
  getRoleContent,
  getRolesIndex,
  getRelatedRoles,
} from '@/lib/role-content';

export const dynamicParams = false; // 404 for any slug not in generateStaticParams

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

export function generateStaticParams() {
  return getBuildableRoles().map((r) => ({ role: r.slug }));
}

export async function generateMetadata({ params }) {
  const content = getRoleContent(params.role);
  if (!content) return { title: 'Role not found' };
  const url = `${SITE_URL}/resume-for/${params.role}`;
  return {
    title: content.metaTitle || `${content.title} Resume — JobFit`,
    description: content.metaDescription,
    alternates: { canonical: `/resume-for/${params.role}` },
    openGraph: {
      title: content.metaTitle || `${content.title} Resume — JobFit`,
      description: content.metaDescription,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.metaTitle || `${content.title} Resume — JobFit`,
      description: content.metaDescription,
    },
  };
}

export default function RoleResumePage({ params }) {
  const content = getRoleContent(params.role);
  if (!content) notFound();

  const { categories } = getRolesIndex();
  const categoryLabel = categories[content.category]?.label || 'Roles';
  const related = getRelatedRoles(params.role, 6);
  const url = `${SITE_URL}/resume-for/${params.role}`;

  // ----- structured data ---------------------------------------------------
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',         item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Resume guides', item: `${SITE_URL}/resume-for` },
      { '@type': 'ListItem', position: 3, name: content.title,  item: url },
    ],
  };
  const faqJsonLd = content.faq && content.faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null;
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.h1 || `${content.title} Resume`,
    description: content.metaDescription,
    author: { '@type': 'Organization', name: 'JobFit' },
    publisher: { '@type': 'Organization', name: 'JobFit', logo: { '@type': 'ImageObject', url: `${SITE_URL}/og.png` } },
    datePublished: content.generatedAt || new Date().toISOString(),
    dateModified:  content.generatedAt || new Date().toISOString(),
    mainEntityOfPage: url,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-xl font-bold tracking-tight">
          JobFit<span className="text-blue-600">.today</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/resume-for" className="hover:text-gray-800 transition-colors">Resume guides</Link>
          <Link href="/tools" className="hover:text-gray-800 transition-colors">Free tools</Link>
          <Link href="/" className="hover:text-gray-800 transition-colors">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12 lg:py-16 max-w-3xl mx-auto w-full">
        <nav className="text-xs font-mono text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">·</span>
          <Link href="/resume-for" className="hover:text-gray-700">Resume guides</Link>
          <span className="mx-2">·</span>
          <span className="text-gray-600">{content.title}</span>
        </nav>

        <p className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-3">
          {categoryLabel} · Resume guide
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5">
          {content.h1 || `${content.title} Resume`}
        </h1>
        {content.intro && (
          <p className="text-lg text-gray-600 leading-relaxed mb-3">{content.intro}</p>
        )}
        {content.audience && (
          <p className="text-sm text-gray-500 italic mb-10">Who this is for: {content.audience}</p>
        )}

        {/* Soft top CTA */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 mb-12 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Want this done in 30 seconds?</p>
            <p className="text-xs text-gray-600">Paste a {content.title} JD and JobFit will tailor your resume + cover letter.</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Try free →
          </Link>
        </div>

        {/* Top skills */}
        {content.topSkills && content.topSkills.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-2">Top skills hiring managers look for</h2>
            <p className="text-sm text-gray-500 mb-6">
              Cover these in your skills section and weave them into your bullets.
            </p>
            <ol className="space-y-3">
              {content.topSkills.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-md bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-sm text-gray-600">{s.why}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Sample bullets */}
        {content.sampleBullets && content.sampleBullets.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-2">Bullet rewrites: weak vs strong</h2>
            <p className="text-sm text-gray-500 mb-6">
              The same achievement, written two ways. Use the strong version as a template.
            </p>
            <div className="space-y-6">
              {content.sampleBullets.map((b, i) => (
                <div key={i} className="rounded-xl border border-gray-200 p-5">
                  <div className="text-xs font-mono text-gray-400 mb-3">Example {i + 1}</div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-mono text-rose-600 uppercase tracking-wider mb-1">Weak</p>
                      <p className="text-sm text-gray-700">{b.weak}</p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-emerald-600 uppercase tracking-wider mb-1">Strong</p>
                      <p className="text-sm text-gray-900 font-medium">{b.strong}</p>
                    </div>
                    {b.lesson && (
                      <p className="text-xs text-gray-500 italic pt-2 border-t border-gray-100">
                        Why it works: {b.lesson}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Common mistakes */}
        {content.commonMistakes && content.commonMistakes.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">
              Common mistakes on a {content.title.toLowerCase()} resume
            </h2>
            <ul className="space-y-4">
              {content.commonMistakes.map((m, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-rose-500" />
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{m.mistake}</p>
                    <p className="text-sm text-gray-600">{m.fix}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Structure tips */}
        {content.structureTips && content.structureTips.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-6">How to structure the page</h2>
            <ul className="space-y-3">
              {content.structureTips.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ATS keywords */}
        {content.atsKeywords && content.atsKeywords.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-2">Keywords ATS systems look for</h2>
            <p className="text-sm text-gray-500 mb-4">
              Your resume should mirror these phrases verbatim where they're true for you.
            </p>
            <div className="flex flex-wrap gap-2">
              {content.atsKeywords.map((k, i) => (
                <span key={i} className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 text-sm font-medium">
                  {k}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Salary signal */}
        {content.salarySignal && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-3">A note on salary</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{content.salarySignal}</p>
          </section>
        )}

        {/* FAQ */}
        {content.faq && content.faq.length > 0 && (
          <section className="mb-14 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Frequently asked</h2>
            <div className="space-y-6">
              {content.faq.map((f, i) => (
                <div key={i}>
                  <h3 className="text-base font-semibold mb-1">{f.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="mb-14 rounded-2xl border border-gray-200 p-8 bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-2xl font-bold mb-2">Skip the rewriting. Let JobFit do it.</h2>
          <p className="text-sm text-gray-600 mb-5 max-w-xl">
            Paste a {content.title} job description and JobFit returns a tailored resume + cover letter in 30 seconds — using only facts from your profile, never inventing anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Try JobFit free →
            </Link>
            <Link
              href="/tools/job-description-keyword-extractor"
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Extract keywords from a JD →
            </Link>
          </div>
        </section>

        {/* Related roles */}
        {related.length > 0 && (
          <section className="pt-10 border-t border-gray-100">
            <h2 className="text-lg font-bold mb-4">Other {categoryLabel.toLowerCase()} roles</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/resume-for/${r.slug}`}
                    className="block text-sm text-blue-700 hover:underline py-1"
                  >
                    {r.title} resume →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="px-6 py-6 border-t border-gray-100 flex items-center justify-between max-w-3xl mx-auto w-full">
        <span className="text-xs text-gray-400 font-mono">© {new Date().getFullYear()} JobFit</span>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/resume-for" className="hover:text-gray-600 transition-colors">All resume guides</Link>
          <Link href="/tools" className="hover:text-gray-600 transition-colors">Free tools</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
