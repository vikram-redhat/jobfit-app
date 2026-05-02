// src/app/tools/page.js
// Index page listing all free tools. Server-rendered, indexable.

import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';

export const metadata = {
  title: 'Free job-search tools — JobFit',
  description:
    'Free tools for job seekers: extract the keywords hiring managers look for in any job description, and grade your resume against ATS best practices. No signup, no email required.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'Free job-search tools — JobFit',
    description: 'AI-powered tools to read job descriptions and grade your resume. No signup.',
    url: '/tools',
  },
};

const tools = [
  {
    href: '/tools/job-description-keyword-extractor',
    title: 'Job Description Keyword Extractor',
    blurb: 'Paste any job description. Get the must-have, nice-to-have, and soft-skill keywords that hiring managers and ATS systems look for.',
    badge: 'Most popular',
  },
  {
    href: '/tools/resume-grader',
    title: 'AI Resume Grader',
    blurb: 'Paste your resume. Get a brutally honest letter grade plus three specific fixes — clarity, impact, ATS-readiness, action verbs, and metrics.',
    badge: 'New',
  },
];

export default function ToolsIndexPage() {
  return (
    <ToolPageLayout
      eyebrow="Free tools · No signup"
      title="Free tools for job seekers"
      subtitle="Built on the same AI that powers JobFit. No signup, no email required, no limits worth complaining about."
    >
      <div className="grid gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-xl font-bold group-hover:text-blue-700 transition-colors">{tool.title}</h2>
              {tool.badge && (
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{tool.blurb}</p>
          </Link>
        ))}
      </div>
    </ToolPageLayout>
  );
}
