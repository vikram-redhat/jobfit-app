'use client';
// src/components/ToolForm.js
// Client island used by both /tools/job-description-keyword-extractor and
// /tools/resume-grader. Keeps the form state, calls the API, and either
// inline-renders the result or routes to the shareable permalink.

import { useState } from 'react';
import Link from 'next/link';

export default function ToolForm({
  endpoint,        // e.g. '/api/tools/keywords'
  inputName,       // e.g. 'jd' — the JSON key the API expects
  placeholder,
  ctaLabel,        // e.g. 'Extract keywords →'
  loadingLabel,    // e.g. 'Reading the job description…'
  resultPathPrefix, // e.g. '/tools/job-description-keyword-extractor/r'
  renderResult,    // function(result) -> JSX
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [permalink, setPermalink] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setPermalink('');
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [inputName]: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setResult(data.result);
        if (data.id) setPermalink(`${resultPathPrefix}/${data.id}`);
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[260px] p-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          required
          minLength={80}
        />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400 font-mono">
            {text.length} characters · 100% free · no signup
          </span>
          <button
            type="submit"
            disabled={loading || text.trim().length < 80}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? loadingLabel : ctaLabel}
          </button>
        </div>
      </form>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {renderResult(result)}

          {/* Share + signup row, equally weighted */}
          <div className="grid sm:grid-cols-2 gap-4">
            <ShareCard permalink={permalink} />
            <SignupCard />
          </div>
        </div>
      )}
    </div>
  );
}

function ShareCard({ permalink }) {
  const [copied, setCopied] = useState(false);
  const fullUrl =
    permalink && typeof window !== 'undefined'
      ? `${window.location.origin}${permalink}`
      : '';

  function copy() {
    if (!fullUrl) return;
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm font-semibold text-gray-900 mb-1">Share this result</p>
      <p className="text-xs text-gray-500 mb-4">
        {permalink ? 'Permalink expires in 30 days' : 'Run again to get a shareable link'}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={!permalink}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        {permalink && (
          <>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check this out:')}&url=${encodeURIComponent(fullUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              Share on LinkedIn
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function SignupCard() {
  return (
    <div className="p-5 rounded-xl border border-blue-200 bg-blue-50">
      <p className="text-sm font-semibold text-gray-900 mb-1">Want the full thing?</p>
      <p className="text-xs text-gray-600 mb-4">
        JobFit gives you a fit score, tailored resume, and cover letter — in 30 seconds.
      </p>
      <Link
        href="/"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
      >
        Try JobFit free →
      </Link>
    </div>
  );
}
