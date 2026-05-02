// src/app/resume-for/page.js
// Index page for the entire programmatic SEO surface. Lists every role
// that has cached content, grouped by category. This is the hub that
// Google crawls to discover all the leaf pages.

import Link from 'next/link';
import { getRolesIndex, getBuildableRoles } from '@/lib/role-content';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

export const metadata = {
  title: 'Resume guides by job title — JobFit',
  description:
    'Free resume guides for 200+ job titles — software engineer, registered nurse, marketing coordinator, barista, and more. Each guide includes top skills, sample bullets, common mistakes, and ATS keywords.',
  alternates: { canonical: '/resume-for' },
  openGraph: {
    title: 'Resume guides by job title — JobFit',
    description: 'Free resume guides for 200+ job titles. Top skills, sample bullets, ATS keywords.',
    url: `${SITE_URL}/resume-for`,
  },
};

export default function ResumeForIndexPage() {
  const { categories } = getRolesIndex();
  const buildable = getBuildableRoles();

  // Group buildable roles by category, preserving the category order
  // defined in roles.json.
  const grouped = {};
  buildable.forEach((r) => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-xl font-bold tracking-tight">
          JobFit<span className="text-blue-600">.today</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/tools" className="hover:text-gray-800 transition-colors">Free tools</Link>
          <Link href="/" className="hover:text-gray-800 transition-colors">Sign in</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-12 lg:py-16 max-w-4xl mx-auto w-full">
        <p className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-3">
          Free guides · {buildable.length} roles
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
          Resume guides, by job title.
        </h1>
        <p className="text-lg text-gray-500 mb-12 leading-relaxed max-w-2xl">
          Pick your role. Each guide includes the top skills hiring managers look for, sample bullet rewrites (weak vs. strong), common mistakes to avoid, and the exact keywords ATS systems search for.
        </p>

        {/* Category sections */}
        <div className="space-y-12">
          {Object.entries(categories).map(([catKey, cat]) => {
            const items = grouped[catKey] || [];
            if (items.length === 0) return null;
            return (
              <section key={catKey}>
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-2xl font-bold">{cat.label}</h2>
                  <span className="text-xs font-mono text-gray-400">{items.length} guides</span>
                </div>
                {cat.description && (
                  <p className="text-sm text-gray-500 mb-5">{cat.description}</p>
                )}
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                  {items.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/resume-for/${r.slug}`}
                        className="block py-1.5 text-sm text-gray-700 hover:text-blue-700 transition-colors"
                      >
                        {r.title} resume <span className="text-gray-300">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-16 p-6 rounded-2xl border border-blue-200 bg-blue-50">
          <p className="text-base font-semibold text-gray-900 mb-2">
            Don't see your role?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            JobFit works on any job description, regardless of role. Paste a JD and we'll tailor your resume + cover letter in 30 seconds.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Try JobFit free →
          </Link>
        </div>
      </main>

      <footer className="px-6 py-6 border-t border-gray-100 flex items-center justify-between max-w-4xl mx-auto w-full">
        <span className="text-xs text-gray-400 font-mono">© {new Date().getFullYear()} JobFit</span>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/tools" className="hover:text-gray-600 transition-colors">Free tools</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
