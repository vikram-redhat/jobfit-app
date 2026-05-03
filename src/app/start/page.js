// src/app/start/page.js
// Paid-traffic landing page (TikTok ads, Meta, Google Ads). Auth-first
// because visitors arrive pre-warmed by the ad creative — they want to act,
// not read another value prop.
//
// Differs from / in three ways:
//   1. Auth form is the FIRST thing on the page on every viewport.
//   2. Header is minimal (logo only, no nav) so there are no exits.
//   3. Page is robots-noindex so Google doesn't index it as a duplicate
//      homepage and dilute ranking. Don't add to sitemap.
//
// Anything we change about the auth flow happens in <AuthForm />, which
// keeps / and /start in sync.

import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Tailor your resume in 30 seconds — JobFit',
  description: 'Paste any job description. Get a fit score, a tailored resume, and a cover letter in under 30 seconds. Free to try.',
  // CRITICAL: noindex so Google doesn't see this as a duplicate of /.
  // We want / ranking organically; /start is a paid-only destination.
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Tailor your resume in 30 seconds — JobFit',
    description: 'Paste any JD, get a fit score + tailored resume + cover letter. Free.',
  },
};

const proofPoints = [
  { icon: '⚡', label: 'Fit score in seconds' },
  { icon: '📄', label: 'Resume rewritten to match the JD' },
  { icon: '✉️', label: 'Cover letter that sounds like you' },
];

export default function StartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Minimal header — logo only, no nav. Paid-LP best practice:
          remove every escape hatch except the one we want. */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-center sm:justify-start">
        <Link href="/" className="text-xl font-bold tracking-tight">
          JobFit<span className="text-blue-600">.today</span>
        </Link>
      </header>

      {/* Hero — form first */}
      <main className="flex-1 px-6 py-10 sm:py-14 max-w-md mx-auto w-full">
        <p className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-3 text-center">
          Free to try · No credit card
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3 text-center">
          Tailor your resume in 30 seconds.
        </h1>
        <p className="text-base text-gray-500 mb-8 leading-relaxed text-center">
          Paste any job description. Get a fit score, a tailored resume, and a cover letter — instantly.
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <AuthForm defaultMode="signup" />
        </div>

        {/* Proof — short, scannable. Visitors who hesitate scroll here, not
            into a long brochure. */}
        <div className="mt-10 grid gap-4">
          {proofPoints.map((p) => (
            <div key={p.label} className="flex items-center gap-3 text-sm text-gray-600">
              <span className="text-2xl">{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 font-mono mt-8 text-center">
          Free: 2 job analyses &middot; Pro: $9.99 / quarter, unlimited
        </p>
      </main>

      <footer className="px-6 py-6 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-400 font-mono">
          © {new Date().getFullYear()} JobFit ·{' '}
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          {' · '}
          <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
        </span>
      </footer>
    </div>
  );
}
