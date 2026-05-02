// src/app/tools/resume-grader/r/[id]/page.js
// Shareable, indexable resume-grade result page.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';
import ResumeGradeResult from '@/components/results/ResumeGradeResult';
import { createServerSupabase } from '@/lib/supabase-server';

async function getResult(id) {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('tool_results')
    .select('id, tool, display_title, result, created_at, expires_at')
    .eq('id', id)
    .eq('tool', 'resume-grader')
    .gt('expires_at', new Date().toISOString())
    .single();
  return data || null;
}

export async function generateMetadata({ params }) {
  const row = await getResult(params.id);
  if (!row) {
    return { title: 'Result not found' };
  }
  const grade = row.result?.overallGrade || '—';
  const title = `Resume grade: ${grade} — ${row.display_title} | JobFit`;
  const description = row.result?.oneLineVerdict
    ? `Grade: ${grade}. ${row.result.oneLineVerdict}`
    : `An AI-graded resume review with a letter grade and three specific fixes.`;
  return {
    title,
    description,
    alternates: { canonical: `/tools/resume-grader/r/${row.id}` },
    openGraph: {
      title,
      description,
      url: `/tools/resume-grader/r/${row.id}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ResumeGradeResultPage({ params }) {
  const row = await getResult(params.id);
  if (!row) notFound();

  return (
    <ToolPageLayout
      eyebrow="Free tool · Shared result"
      title={`Resume grade — ${row.display_title}`}
      subtitle="An AI-graded resume review scored on clarity, impact, ATS-readiness, action verbs, and metrics, with three specific fixes."
    >
      <ResumeGradeResult result={row.result} />

      <div className="mt-12 p-6 rounded-2xl border border-blue-200 bg-blue-50">
        <p className="text-base font-semibold text-gray-900 mb-2">
          Want JobFit to fix the resume for you?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Paste any job description and get a fit score, a tailored resume, and a cover letter in 30 seconds.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tools/resume-grader"
            className="inline-block px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Grade another resume
          </Link>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Try full JobFit free →
          </Link>
        </div>
      </div>
    </ToolPageLayout>
  );
}
