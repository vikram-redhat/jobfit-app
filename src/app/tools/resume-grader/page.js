// src/app/tools/resume-grader/page.js
// Server-rendered landing page. Form is a client island.

import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';
import ToolForm from '@/components/ToolForm';

export const metadata = {
  title: 'AI Resume Grader — Free Honest Resume Review',
  description:
    'Paste your resume and get a brutally honest AI grade plus three specific fixes. Scored on clarity, impact, ATS-readiness, action verbs, and metrics. Free, no signup.',
  alternates: { canonical: '/tools/resume-grader' },
  openGraph: {
    title: 'Free AI Resume Grader',
    description: 'Get a brutally honest letter grade and three specific fixes. Free, no signup.',
    url: '/tools/resume-grader',
  },
};

const faq = [
  {
    q: 'How is the grade calculated?',
    a: 'A senior-recruiter prompt scores your resume on five dimensions: clarity, impact, ATS-readiness, action verbs, and metrics. Each gets a 0-100 sub-score; the overall grade is a weighted blend.',
  },
  {
    q: 'Why does it feel harsh?',
    a: "It's intentional. Most resume tools flatter you. New grads, casual job seekers, and career switchers benefit much more from honest critique than from compliments. We'd rather you fix it than feel good about it.",
  },
  {
    q: 'Will it invent things to put on my resume?',
    a: 'No. The prompt explicitly tells the AI not to fabricate metrics, dates, or claims. If it suggests adding a metric, it frames it as "consider adding" — never as a fact.',
  },
  {
    q: 'Do you store my resume?',
    a: 'We store the grade and feedback (so you can share the result link), plus a 200-character excerpt of your resume. Results auto-delete after 30 days.',
  },
  {
    q: 'How does this compare to other resume graders?',
    a: 'Most graders are a checklist of generic rules ("use action verbs!"). This one references specific lines from your actual resume in its critique — because Claude Haiku reads the whole document.',
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

export default function ResumeGraderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ToolPageLayout
        eyebrow="Free tool · No signup"
        title="AI Resume Grader"
        subtitle="Paste your resume. Get a letter grade and three specific fixes — based on what hiring managers and ATS systems actually care about."
        faq={faq}
      >
        {/* Contextual cross-link to /resume-for — visitors are likely to want
            specific advice for their target role after seeing the grade. */}
        <div className="mb-6 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 flex items-center justify-between gap-3 flex-wrap">
          <span>Want resume tips for a specific role?</span>
          <Link href="/resume-for" className="text-blue-700 hover:underline font-semibold whitespace-nowrap">
            Browse 200+ resume guides →
          </Link>
        </div>

        <ToolForm
          endpoint="/api/tools/grade-resume"
          inputName="resume"
          placeholder="Paste your resume here (plain text — copy-paste from your doc)…"
          ctaLabel="Grade my resume →"
          loadingLabel="Reading your resume…"
          resultPathPrefix="/tools/resume-grader/r"
          tool="resume-grader"
        />
      </ToolPageLayout>
    </>
  );
}
