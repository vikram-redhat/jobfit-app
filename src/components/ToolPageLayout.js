// src/components/ToolPageLayout.js
// Server component — wraps a tool page with consistent header, hero,
// breadcrumb, and footer. Pass children to render the form + result body.

import Link from 'next/link';
import BuiltWithClaude from '@/components/BuiltWithClaude';

export default function ToolPageLayout({
  eyebrow,    // e.g. "Free tool · No signup"
  title,      // e.g. "Job Description Keyword Extractor"
  subtitle,   // e.g. "Paste any job description..."
  children,
  faq,        // optional: array of {q, a}
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-xl font-bold tracking-tight">
          JobFit<span className="text-blue-600">.today</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5 text-sm text-gray-500">
          <Link href="/resume-for" className="hidden sm:inline hover:text-gray-800 transition-colors">Resume guides</Link>
          <Link href="/tools" className="hover:text-gray-800 transition-colors">Free tools</Link>
          <Link href="/" className="hover:text-gray-800 transition-colors">Sign in</Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 px-6 py-12 lg:py-16 max-w-3xl mx-auto w-full">
        <nav className="text-xs font-mono text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">·</span>
          <Link href="/tools" className="hover:text-gray-700">Free tools</Link>
        </nav>

        {eyebrow && (
          <p className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-4">{eyebrow}</p>
        )}
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">{subtitle}</p>
        )}

        {children}

        {/* FAQ */}
        {faq && faq.length > 0 && (
          <section className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold mb-6">Frequently asked</h2>
            <div className="space-y-6">
              {faq.map((item, i) => (
                <div key={i}>
                  <h3 className="text-base font-semibold mb-1">{item.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-gray-100 max-w-3xl mx-auto w-full flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-xs text-gray-400 font-mono">
          © {new Date().getFullYear()} JobFit · <BuiltWithClaude />
        </span>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/resume-for" className="hover:text-gray-600 transition-colors">Resume guides</Link>
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
