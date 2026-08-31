// src/app/tools/resume-grader/page.js
// Server-rendered landing page. Form is a client island.

import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';
import ToolForm from '@/components/ToolForm';
import { ToolSoftwareApplicationJsonLd } from '@/components/JsonLd';

export const metadata = {
  // Title targets the broader "checker" cluster (10x larger than "grader")
  // while keeping "grader" alive for the URL-slug query.
  title: 'Free Resume Checker & Grader — Get an ATS Score in 30 Seconds | JobFit',
  description:
    'Paste your resume and get an instant ATS score (0-100), a letter grade, and three specific fixes. Scored on clarity, impact, ATS-readiness, action verbs, and metrics. Free, no signup, no email.',
  alternates: { canonical: '/tools/resume-grader' },
  openGraph: {
    title: 'Free Resume Checker & Grader — Instant ATS Score',
    description: 'Get an ATS score, a letter grade, and three specific fixes. Free, no signup.',
    url: '/tools/resume-grader',
  },
};

const faq = [
  {
    q: 'What is a good ATS score for a resume?',
    a: 'An ATS score above 80 is generally considered strong — it means your resume mirrors the language hiring managers and ATS systems look for, uses clean formatting, has measurable impact bullets, and avoids obvious red flags. Scores of 60-80 are passable but improvable. Below 60 usually means real structural fixes are needed before applying.',
  },
  {
    q: 'How is the resume grade calculated?',
    a: 'A senior-recruiter prompt scores your resume on five dimensions: clarity, impact, ATS-readiness, action verbs, and metrics. Each gets a 0-100 sub-score; the overall grade is a weighted blend, expressed as both a letter (A+ through F) and a 0-100 number.',
  },
  {
    q: 'Why does it feel harsh?',
    a: "It's intentional. Most resume tools flatter you. New grads, casual job seekers, and career switchers benefit much more from honest critique than from compliments. We'd rather you fix it than feel good about it.",
  },
  {
    q: 'Will it invent things to put on my resume?',
    a: 'No. The prompt explicitly tells the AI not to fabricate metrics, dates, or claims. If it suggests adding a metric, it frames it as "consider adding" — never as a fact. Every suggestion is something you must be able to defend in an interview.',
  },
  {
    q: 'Do you store my resume?',
    a: 'We store the grade and feedback (so you can share the result link), plus a 200-character excerpt of your resume. Results auto-delete after 30 days, and we don\'t use your input to train models.',
  },
  {
    q: 'How does this compare to other resume checkers?',
    a: 'Most checkers are a checklist of generic rules ("use action verbs!"). This one references specific lines from your actual resume in its critique — because Claude Haiku reads the whole document. You also get a numeric ATS score and a letter grade, not just feedback.',
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
      <ToolSoftwareApplicationJsonLd
        name="JobFit Resume Checker & Grader"
        description="Free AI resume checker that returns an ATS score out of 100, a letter grade, and three specific fixes that cite lines from your actual resume."
        path="/tools/resume-grader"
        featureList={[
          'ATS score from 0 to 100',
          'Letter grade with plain-English reasoning',
          'Three specific fixes referencing your actual resume lines',
          'Shareable result permalink',
          'No signup or email required',
        ]}
      />
      <ToolPageLayout
        eyebrow="Free tool · No signup"
        title="Free Resume Checker & Grader"
        subtitle="Paste your resume. Get an instant ATS score (0-100), a letter grade, and three specific fixes — based on what hiring managers and ATS systems actually care about."
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
