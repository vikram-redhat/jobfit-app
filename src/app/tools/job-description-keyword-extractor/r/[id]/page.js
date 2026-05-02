// src/app/tools/job-description-keyword-extractor/r/[id]/page.js
// Shareable, indexable result page. Each /r/[id] is a unique URL with the
// real analysis content rendered server-side — that's what gets crawled.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import ToolPageLayout from '@/components/ToolPageLayout';
import KeywordsResult from '@/components/results/KeywordsResult';
import { createServerSupabase } from '@/lib/supabase-server';

async function getResult(id) {
  // Quick UUID sanity check before hitting the DB
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('tool_results')
    .select('id, tool, display_title, result, created_at, expires_at')
    .eq('id', id)
    .eq('tool', 'keywords')
    .gt('expires_at', new Date().toISOString())
    .single();
  return data || null;
}

export async function generateMetadata({ params }) {
  const row = await getResult(params.id);
  if (!row) {
    return { title: 'Result not found' };
  }
  const title = `Keywords for ${row.display_title} — JobFit`;
  const description = row.result?.summary
    ? row.result.summary.slice(0, 160)
    : `AI-extracted keywords for ${row.display_title}. See the must-have skills, nice-to-haves, and soft skills hiring managers look for.`;
  return {
    title,
    description,
    alternates: { canonical: `/tools/job-description-keyword-extractor/r/${row.id}` },
    openGraph: {
      title,
      description,
      url: `/tools/job-description-keyword-extractor/r/${row.id}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function KeywordResultPage({ params }) {
  const row = await getResult(params.id);
  if (!row) notFound();

  return (
    <ToolPageLayout
      eyebrow="Free tool · Shared result"
      title={`Keywords for ${row.display_title}`}
      subtitle="An AI-extracted breakdown of the must-haves, nice-to-haves, and soft skills hiring managers and ATS systems look for in this role."
    >
      <KeywordsResult result={row.result} />

      <div className="mt-12 p-6 rounded-2xl border border-blue-200 bg-blue-50">
        <p className="text-base font-semibold text-gray-900 mb-2">
          Want this analysis for your next job?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Try the same tool on any job description — or go full JobFit and get a fit score, tailored resume, and cover letter in 30 seconds.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/tools/job-description-keyword-extractor"
            className="inline-block px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Run on another JD
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
