'use client';
import Link from 'next/link';
import { OrganizationJsonLd, SoftwareApplicationJsonLd, FaqJsonLd } from '@/components/JsonLd';
import BuiltWithClaude from '@/components/BuiltWithClaude';
import AuthForm from '@/components/AuthForm';

// Feature list rendered in the value-prop column. Kept here (not in AuthForm)
// because /start uses a different, tighter proof-points layout.
const features = [
  {
    icon: '⚡',
    title: 'Instant fit score',
    desc: 'See exactly how well you match a job before spending time applying.',
  },
  {
    icon: '📄',
    title: 'Tailored resume',
    desc: 'Your resume, rewritten to match the language of the job description.',
  },
  {
    icon: '✉️',
    title: 'Cover letter done',
    desc: 'A cover letter that sounds like you — not a template everyone else uses.',
  },
];

// Smooth-scroll to the auth form. Used by the above-the-fold CTA on mobile
// where the form sits below the value prop.
function scrollToForm(e) {
  e.preventDefault();
  document.getElementById('auth-form')?.scrollIntoView({ behavior: 'smooth' });
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Structured data — picked up by Google, Bing, ChatGPT, Perplexity, Claude, Gemini */}
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <FaqJsonLd />

      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight">
          JobFit<span className="text-blue-600">.today</span>
        </span>
        <nav className="flex items-center gap-4 sm:gap-5 text-sm text-gray-500">
          <Link href="/resume-for" className="hidden sm:inline hover:text-gray-800 transition-colors">Resume guides</Link>
          <Link href="/tools" className="hover:text-gray-800 transition-colors">Free tools</Link>
          {/* Sign in is the auth form on this very page, so we don't link it.
              Contact stays accessible via the footer to keep the header to 2-3 items. */}
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left — value prop.
            Mobile order: this column comes FIRST (order-1) so cold organic
            traffic sees the pitch before being asked to sign up. The auth
            form lives below, anchored at #auth-form, with a prominent scroll
            CTA above the fold + the sticky bottom bar as a safety net.
            Desktop: this column moves to order-1 of a left-right split,
            with the auth form on the right (lg:order-2). */}
        <div className="order-1 lg:order-1 flex-1 flex flex-col justify-center px-6 sm:px-8 py-12 lg:px-16 lg:py-0 max-w-2xl">
          <p className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-4">Free to try · No credit card needed</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            Stop sending the<br className="hidden sm:block" /> same resume everywhere.
          </h1>
          <p className="text-lg text-gray-500 mb-3 leading-relaxed">
            Paste any job description. Get a fit score, a tailored resume,<br className="hidden md:block" /> and a cover letter — in under 30 seconds.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Or try a free tool — no signup:{' '}
            <Link href="/tools/job-description-keyword-extractor" className="text-blue-600 hover:underline">
              keyword extractor
            </Link>
            {' · '}
            <Link href="/tools/resume-grader" className="text-blue-600 hover:underline">
              resume grader
            </Link>
          </p>

          {/* Above-the-fold scroll-to-form CTA. Only shown on viewports where
              the form is below the value prop (i.e. below lg:). On lg+ the
              auth form is visible in the right rail, so a scroll-to-form
              button would just feel weird. */}
          <a
            href="#auth-form"
            onClick={scrollToForm}
            className="lg:hidden inline-flex items-center justify-center w-full sm:w-auto sm:self-start px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors mb-10"
          >
            Get started free →
          </a>

          <div className="space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl shadow-xl border border-gray-200 overflow-hidden lg:hidden">
            <img
              src="/demo.gif"
              alt="JobFit in action — fit score, tailored resume, and cover letter"
              className="w-full -mt-[85px]"
            />
          </div>

          {/* Free tools strip — for visitors not ready to sign up. Desktop + tablet only;
              mobile has its own sticky CTA bar below. */}
          <div className="hidden sm:grid grid-cols-2 gap-3 mt-10">
            <Link
              href="/tools/job-description-keyword-extractor"
              className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="text-xs font-mono text-blue-600 uppercase tracking-wider mb-1">Free tool</p>
              <p className="text-sm font-semibold mb-0.5 group-hover:text-blue-700 transition-colors">
                Keyword extractor →
              </p>
              <p className="text-xs text-gray-500">Pull the must-haves from any JD.</p>
            </Link>
            <Link
              href="/tools/resume-grader"
              className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <p className="text-xs font-mono text-blue-600 uppercase tracking-wider mb-1">Free tool</p>
              <p className="text-sm font-semibold mb-0.5 group-hover:text-blue-700 transition-colors">
                Resume grader →
              </p>
              <p className="text-xs text-gray-500">Brutally honest letter grade.</p>
            </Link>
          </div>

          <p className="text-xs text-gray-400 font-mono mt-6">
            Free: 2 job analyses &middot; Pro: $9.99 / quarter, unlimited
          </p>
        </div>

        {/* Right — auth form.
            Mobile: order-2 (below the value prop). Cold visitors get to
            read the pitch first, then arrive at the form ready to sign up.
            Desktop: order-2 of the left-right split, fixed-width right rail. */}
        <div id="auth-form" className="order-2 lg:order-2 lg:w-[420px] flex items-center justify-center px-6 py-12 lg:py-0 lg:border-l border-gray-100 bg-gray-50">
          <div className="w-full max-w-sm">
            <AuthForm defaultMode="signup" />
          </div>
        </div>
      </main>

      {/* Sticky mobile CTA — primary: signup; secondary: free tools off-ramp.
          Two buttons in a 2:1 ratio so signup stays the dominant action. */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-lg flex gap-2">
        <a
          href="#auth-form"
          onClick={scrollToForm}
          className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold text-center hover:bg-blue-700 transition-colors"
        >
          Get started free →
        </a>
        <Link
          href="/tools"
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold text-center hover:bg-gray-50 transition-colors"
        >
          Free tools
        </Link>
      </div>

      {/* Footer */}
      <footer className="px-6 pb-24 lg:pb-0 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-xs text-gray-400 font-mono">
          © {new Date().getFullYear()} JobFit · <BuiltWithClaude />
        </span>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/resume-for" className="hover:text-gray-600 transition-colors">Resume guides</Link>
          <Link href="/tools" className="hover:text-gray-600 transition-colors">Free tools</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
