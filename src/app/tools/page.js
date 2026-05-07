// src/app/tools/page.js
// Index page for the free-tools surface. Server-rendered, indexable.
// Acts as a hub: introduces both tools, has prose + FAQ for SEO/GEO,
// links out to the resume guides, and contrasts itself with full JobFit.

import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

export const metadata = {
  title: 'Free Job-Search Tools — Resume Checker & JD Keyword Finder | JobFit',
  description:
    'Two free AI tools for job seekers, no signup required: an ATS resume checker that grades your resume in 30 seconds, and a job description keyword finder that pulls the must-haves hiring managers look for.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Free Job-Search Tools — JobFit',
    description: 'Free AI tools for job seekers: resume checker + JD keyword finder. No signup.',
    url: '/tools',
  },
};

const tools = [
  {
    href: '/tools/job-description-keyword-extractor',
    title: 'Job Description Keyword Finder',
    blurb: 'Paste any job description. Find the must-have, nice-to-have, and soft-skill keywords that hiring managers and ATS systems actually look for.',
    badge: 'Most popular',
  },
  {
    href: '/tools/resume-grader',
    title: 'Free Resume Checker & Grader',
    blurb: 'Paste your resume. Get an instant ATS score (0-100), a letter grade, and three specific fixes — clarity, impact, ATS-readiness, action verbs, and metrics.',
    badge: 'Free + unlimited',
  },
];

const faq = [
  {
    q: 'Are these tools really free?',
    a: 'Yes. Both tools are 100% free, with no signup, no email collection, and no credit card. Reasonable rate limits exist to prevent abuse, but a normal job seeker will never hit them. We make money from JobFit Pro ($9.99/quarter), not from these tools.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Paste your job description or resume, get the result. The shareable result link works for 30 days even without an account.',
  },
  {
    q: 'How are these different from JobFit itself?',
    a: 'These tools each do one focused thing — find ATS keywords, or grade a resume. The full JobFit (which does require a free account) goes further: it tailors your actual resume to a specific job description, drafts a matching cover letter, and tracks your application status. Use the tools for quick wins; sign up if you want the end-to-end flow.',
  },
  {
    q: 'How are these different from ChatGPT?',
    a: 'ChatGPT can do similar things if you write a careful prompt. These tools use prompts JobFit has tuned specifically for resumes and job descriptions, with explicit anti-hallucination rules so the AI never invents metrics or claims. The output is also structured (categorized keywords, numeric scores) instead of paragraph-form, which is faster to act on.',
  },
  {
    q: 'What kind of jobs do these work for?',
    a: 'Any job description in English: tech, healthcare, business, creative, service, retail, trades, education, internships, casual roles. The tools work especially well for casual and early-career job seekers who don\'t want to spend hours per application.',
  },
  {
    q: 'Will my resume or job description be stored?',
    a: 'We store the AI\'s output (so the result permalink works) plus a 200-character excerpt of your input. Full inputs are not stored. Results auto-delete after 30 days. Inputs are never used to train models.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

// ItemList JSON-LD so search engines understand /tools is a hub listing
// individual SoftwareApplications, not a single product page.
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: tools.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${SITE_URL}${t.href}`,
    name: t.title,
  })),
};

export default function ToolsIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ToolPageLayout
        eyebrow="Free tools · No signup"
        title="Free tools for job seekers"
        subtitle="Two focused AI tools, no signup required. Built on the same Claude-powered engine as full JobFit, but stripped down to one job each."
        faq={faq}
      >
        {/* Tool cards — primary CTAs */}
        <div className="grid gap-6 mb-14">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-xl font-bold group-hover:text-blue-700 transition-colors">{tool.title}</h2>
                {tool.badge && (
                  <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md whitespace-nowrap ml-3">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{tool.blurb}</p>
            </Link>
          ))}
        </div>

        {/* Why these exist — SEO prose, also useful for AI engine citation */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Why we made these free</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            Most job seekers don&apos;t need a full resume-rewriting suite. They need a quick answer to a specific question:{' '}
            <em>What keywords does this job description actually want? Is my resume any good?</em> Both questions can be
            answered in 30 seconds with the right AI prompt — no account, no template wizard, no payment.
          </p>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            These two tools cover the highest-value parts of resume preparation. The{' '}
            <Link href="/tools/job-description-keyword-extractor" className="text-blue-600 hover:underline">
              keyword finder
            </Link>{' '}
            tells you which exact phrases to mirror so an Applicant Tracking System (ATS) doesn&apos;t filter you out
            before a human ever sees your resume. The{' '}
            <Link href="/tools/resume-grader" className="text-blue-600 hover:underline">
              resume checker
            </Link>{' '}
            tells you, brutally and specifically, what&apos;s wrong with your resume right now and the three highest-impact
            fixes to make. Both tools generate a shareable link you can send to a friend, a mentor, or a career-services
            advisor for a second opinion.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            They&apos;re free because most of our users are early-career, casual job seekers, or career switchers — people
            who shouldn&apos;t have to pay $25/month to find out what an ATS wants. If you want the full JobFit flow —
            tailored resumes, cover letters, fit scores, and application tracking —{' '}
            <Link href="/" className="text-blue-600 hover:underline">that&apos;s available too</Link>, with two free
            analyses to start and Pro at $9.99 per quarter.
          </p>
        </section>

        {/* Comparison — common search intent: "free tools vs full app" */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Free tools vs. full JobFit</h2>
          <p className="text-sm text-gray-500 mb-6">
            When to use which.
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3">&nbsp;</th>
                  <th className="px-4 py-3">Free tools (<code>/tools</code>)</th>
                  <th className="px-4 py-3">Full JobFit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Account needed</td>
                  <td className="px-4 py-3 text-gray-600">No</td>
                  <td className="px-4 py-3 text-gray-600">Free signup</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">What you get</td>
                  <td className="px-4 py-3 text-gray-600">Keyword list, or a resume score</td>
                  <td className="px-4 py-3 text-gray-600">Fit score + tailored resume + cover letter</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Saves your profile</td>
                  <td className="px-4 py-3 text-gray-600">No</td>
                  <td className="px-4 py-3 text-gray-600">Yes — reuse across many jobs</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Tracks applications</td>
                  <td className="px-4 py-3 text-gray-600">No</td>
                  <td className="px-4 py-3 text-gray-600">Yes (Applied → Interview → Offered)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700">Cost</td>
                  <td className="px-4 py-3 text-gray-600">Free</td>
                  <td className="px-4 py-3 text-gray-600">Free for 2 jobs · $9.99/quarter unlimited</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Cross-link to /resume-for — internal-link SEO + topical reinforcement */}
        <section className="mb-14 p-6 rounded-2xl border border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold mb-2">Looking for role-specific advice?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Beyond the tools, JobFit publishes a free{' '}
            <Link href="/resume-for" className="text-blue-600 hover:underline">resume guide</Link> for 200+ job titles and
            life situations — top skills, sample bullets, common mistakes, and ATS keywords for each role.
          </p>
          <Link
            href="/resume-for"
            className="inline-block px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Browse 200+ resume guides →
          </Link>
        </section>
      </ToolPageLayout>
    </>
  );
}
