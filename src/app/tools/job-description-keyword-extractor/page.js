// src/app/tools/job-description-keyword-extractor/page.js
// Server-rendered landing page. Form is a client island.

import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';
import ToolForm from '@/components/ToolForm';
import { ToolSoftwareApplicationJsonLd } from '@/components/JsonLd';

export const metadata = {
  // Title targets the broader "finder" cluster (5x larger than "extractor")
  // while keeping "extractor" alive for the URL-slug query.
  title: 'Free Job Description Keyword Finder — ATS Keywords Tool | JobFit',
  description:
    'Paste any job description and instantly find the ATS keywords hiring managers look for — must-haves, nice-to-haves, and soft skills, all categorized. Free, no signup, no email.',
  alternates: { canonical: '/tools/job-description-keyword-extractor' },
  openGraph: {
    title: 'Free Job Description Keyword Finder',
    description: 'Find the ATS keywords hiring managers actually look for. Free, no signup.',
    url: '/tools/job-description-keyword-extractor',
  },
};

const faq = [
  {
    q: 'What keywords should I put on my resume from a job description?',
    a: "The keywords most worth mirroring are the must-haves: explicit skills, tools, certifications, years of experience, and degrees mentioned in the job description. Nice-to-haves (preferred or bonus skills) are worth including if you have them. Soft skills like communication or collaboration should be shown through bullets, not just listed. This tool categorizes all three for you in seconds.",
  },
  {
    q: 'Why does keyword extraction matter for my job application?',
    a: "Most large companies use Applicant Tracking Systems (ATS) that filter resumes by keywords before a human ever sees them. If your resume doesn't mirror the language of the JD, you can be screened out even when you're a strong fit. Matching the exact phrases the recruiter wrote is the cheapest, biggest win in any application.",
  },
  {
    q: 'How is this different from doing it manually?',
    a: 'You can absolutely highlight a JD by hand. The AI version is faster, separates must-haves from nice-to-haves, and explains why each keyword matters — useful when you\'re applying to many jobs in a session. It also catches phrases recruiters scan for that humans tend to miss.',
  },
  {
    q: 'Do you store my job description?',
    a: 'We store the AI\'s analysis (so you can share the result link) but only a 200-character excerpt of the original JD. Results auto-delete after 30 days, and we don\'t use your input to train models.',
  },
  {
    q: 'What\'s the catch?',
    a: 'No catch — this tool is free and unlimited within reasonable rate limits. We hope you\'ll like it enough to try the full JobFit, which actually rewrites your resume to match the JD.',
  },
  {
    q: 'Is this better than ChatGPT?',
    a: 'For this specific task, the structured output is sharper. ChatGPT will give you a paragraph; this gives you a categorized, ranked list with explanations — and a shareable link.',
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

export default function KeywordExtractorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ToolSoftwareApplicationJsonLd
        name="JobFit Job Description Keyword Finder"
        description="Free AI tool that reads any job description and returns the ATS keywords hiring managers look for, split into must-haves, nice-to-haves, and soft skills."
        path="/tools/job-description-keyword-extractor"
        featureList={[
          'Extracts must-have hard requirements from any job description',
          'Separates nice-to-have skills from dealbreakers',
          'Identifies the soft skills the posting emphasises',
          'Shareable result permalink',
          'No signup or email required',
        ]}
      />
      <ToolPageLayout
        eyebrow="Free tool · No signup"
        title="Free Job Description Keyword Finder"
        subtitle="Paste any job description. Find the ATS keywords hiring managers actually look for — categorized into must-haves, nice-to-haves, and soft skills, in under 30 seconds."
        faq={faq}
      >
        {/* Contextual cross-link to /resume-for — high-intent moment for visitors
            looking for role-specific guidance after extracting keywords. */}
        <div className="mb-6 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 flex items-center justify-between gap-3 flex-wrap">
          <span>Looking for role-specific resume tips?</span>
          <Link href="/resume-for" className="text-blue-700 hover:underline font-semibold whitespace-nowrap">
            Browse 200+ resume guides →
          </Link>
        </div>

        <ToolForm
          endpoint="/api/tools/keywords"
          inputName="jd"
          placeholder="Paste a job description here…"
          ctaLabel="Extract keywords →"
          loadingLabel="Reading the job description…"
          resultPathPrefix="/tools/job-description-keyword-extractor/r"
          tool="keywords"
        />
      </ToolPageLayout>
    </>
  );
}
