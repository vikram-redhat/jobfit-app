import Link from 'next/link';
import BuiltWithClaude from '@/components/BuiltWithClaude';

export const metadata = {
  title: 'Privacy Policy — JobFit',
  description: 'How JobFit handles your data — what we collect, how we use it, AI processing, storage, and your rights.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const contactEmail = 'help@jobfit.today';

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Standard nav so visitors landing here from search can discover the rest of the site. */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <Link href="/" className="text-xl font-bold tracking-tight">
          JobFit<span className="text-blue-600">.today</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5 text-sm text-gray-500">
          <Link href="/resume-for" className="hidden sm:inline hover:text-gray-800 transition-colors">Resume guides</Link>
          <Link href="/tools" className="hover:text-gray-800 transition-colors">Free tools</Link>
          <Link href="/contact" className="hover:text-gray-800 transition-colors">Contact</Link>
        </nav>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-400 font-mono">Last updated: 3 May 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">What we collect</h2>
            <p>
              When you create an account, we collect your email address and password (encrypted — we never see it in plain text).
              When you set up your profile, we collect information you provide such as your name, work history, and skills.
              When you analyse a job, we store the job description and the AI-generated fit score, resume, and cover letter.
              We do not collect any payment card details — those go directly to Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">How we use it</h2>
            <p>
              Your data is used solely to operate JobFit — to personalise AI-generated resumes and cover letters to your profile, and to manage your account and subscription.
              We do not sell your data, share it with advertisers, or use it to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">AI processing</h2>
            <p>
              Your profile and job descriptions are sent to Anthropic's Claude API to generate your resume and cover letter. Anthropic's{' '}
              <a href="https://www.anthropic.com/legal/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                privacy policy
              </a>{' '}
              applies to that processing. We do not use the API in a way that allows Anthropic to train models on your data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Storage and security</h2>
            <p>
              Your data is stored in Supabase (PostgreSQL), with row-level security so only you can access your own data.
              Passwords are managed by Supabase Auth and are never stored in plain text.
              All data is transmitted over HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Payments</h2>
            <p>
              Payments are handled by Stripe. We store your Stripe customer ID so we can manage your subscription, but we never see or store your card details.
              Stripe's{' '}
              <a href="https://stripe.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                privacy policy
              </a>{' '}
              applies to payment processing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Cookies</h2>
            <p>
              We use essential cookies only — specifically, a session cookie set by Supabase Auth to keep you logged in.
              We do not use tracking or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Your rights</h2>
            <p>
              You can delete your account at any time by contacting us. This will permanently remove all your data including your profile, job analyses, and generated documents.
              You can also export your data on request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href={`mailto:${contactEmail}`} className="text-blue-600 hover:underline">{contactEmail}</a>{' '}
              or use our <Link href="/contact" className="text-blue-600 hover:underline">contact form</Link>.
            </p>
          </section>
        </div>
        </div>
      </main>

      <footer className="px-6 py-6 border-t border-gray-100 max-w-3xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-400 font-mono">© {new Date().getFullYear()} JobFit</span>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/resume-for" className="hover:text-gray-600 transition-colors">Resume guides</Link>
            <Link href="/tools" className="hover:text-gray-600 transition-colors">Free tools</Link>
            <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-3 text-center sm:text-left">
          <BuiltWithClaude />
        </div>
      </footer>
    </div>
  );
}
