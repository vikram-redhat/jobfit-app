// src/app/tools/job-description-keyword-extractor/page.js
// Server-rendered landing page. Form is a client island.

import ToolPageLayout from '@/components/ToolPageLayout';
import ToolForm from '@/components/ToolForm';

export const metadata = {
  title: 'Job Description Keyword Extractor — Free AI Tool',
  description:
    'Paste any job description and instantly see the must-have skills, nice-to-haves, and soft skills that hiring managers and ATS systems look for. Free, no signup.',
  alternates: { canonical: '/tools/job-description-keyword-extractor' },
  openGraph: {
    title: 'Free Job Description Keyword Extractor',
    description: 'See the keywords hiring managers actually look for. Free, no signup.',
    url: '/tools/job-description-keyword-extractor',
  },
};

const faq = [
  {
    q: 'Why does keyword extraction matter for my job application?',
    a: "Most large companies use Applicant Tracking Systems (ATS) that filter resumes by keywords before a human ever sees them. If your resume doesn't mirror the language of the JD, you can be screened out even when you're a strong fit.",
  },
  {
    q: 'How is this different from doing it manually?',
    a: 'You can absolutely highlight a JD by hand. The AI version is faster, separates must-haves from nice-to-haves, and explains why each keyword matters — useful when you\'re applying to many jobs in a session.',
  },
  {
    q: 'Do you store my job description?',
    a: 'We store the AI\'s analysis (so you can share the result link) but only a 200-character excerpt of the original JD. Results auto-delete after 30 days.',
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
      <ToolPageLayout
        eyebrow="Free tool · No signup"
        title="Job Description Keyword Extractor"
        subtitle="Paste any job description. Get the keywords that ATS systems and hiring managers actually look for — categorized into must-haves, nice-to-haves, and soft skills."
        faq={faq}
      >
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
