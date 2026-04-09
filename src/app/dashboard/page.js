'use client';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useSearchParams } from 'next/navigation';
import Nav from '@/components/Nav';
import Link from 'next/link';

const STATUSES = ['New', 'Applied', 'Interview', 'Offered', 'Rejected', 'Dismissed'];
const statusColors = { New: 'text-blue-600', Applied: 'text-yellow-600', Interview: 'text-green-600', Offered: 'text-purple-600', Rejected: 'text-red-500', Dismissed: 'text-gray-400' };

function scoreColor(s) {
  if (s >= 75) return 'text-green-600 bg-green-50';
  if (s >= 55) return 'text-yellow-600 bg-yellow-50';
  if (s >= 35) return 'text-orange-500 bg-orange-50';
  return 'text-red-500 bg-red-50';
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div><Nav /><div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin-slow" /></div></div>}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [freeTierLimit, setFreeTierLimit] = useState(2);
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [jobInput, setJobInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (searchParams.get('new') === '1') {
      if (!profile) router.push('/onboarding');
      else if (!profile.is_subscribed && (profile.analysis_count ?? 0) >= freeTierLimit) router.push('/upgrade');
      else setShowInput(true);
    }
  }, [searchParams, loading]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }

    const [{ data: prof }, { data: setting }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('app_settings').select('value').eq('key', 'free_tier_limit').single(),
    ]);
    setProfile(prof ?? null);
    setFreeTierLimit(parseInt(setting?.value ?? '2', 10));

    if (searchParams.get('new') === '1') {
      if (prof) setShowInput(true);
      else router.push('/onboarding');
    }

    // Load jobs
    const { data: jobData } = await supabase.from('jobs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setJobs(jobData || []);
    setLoading(false);
  }

  async function handleAnalyze() {
    if (!jobInput.trim()) { setError('Please paste a job description'); return; }
    setError(''); setAnalyzing(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jobInput }),
      });
      if (res.status === 402) {
        router.push('/upgrade');
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Check duplicate
      const dup = jobs.find(j =>
        j.title?.toLowerCase() === data.job?.title?.toLowerCase() &&
        j.company?.toLowerCase() === data.job?.company?.toLowerCase()
      );
      if (dup) {
        setError(`Already analysed: "${dup.title}" at ${dup.company}. Opening existing.`);
        setAnalyzing(false);
        router.push(`/job/${dup.id}`);
        return;
      }

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newJob, error: insertErr } = await supabase.from('jobs').insert({
        user_id: user.id,
        title: data.job.title,
        company: data.job.company,
        location: data.job.location,
        arrangement: data.job.arrangement,
        salary: data.job.salary,
        url: data.job.url,
        summary: data.job.summary,
        score: data.score,
        verdict: data.verdict,
        strengths: data.strengths,
        gaps: data.gaps,
        angle: data.angle,
        red_flags: data.redFlags,
        key_requirements: data.keyRequirements,
        status: 'New',
        raw_input: jobInput.substring(0, 2000),
      }).select().single();

      if (insertErr) throw new Error(insertErr.message);
      router.push(`/job/${newJob.id}`);
    } catch (e) {
      setError(e.message);
    }
    setAnalyzing(false);
  }

  async function updateStatus(id, status, currentAppliedDate) {
    const updates = { status };
    if (status === 'Applied' && !currentAppliedDate) {
      updates.applied_date = new Date().toISOString().split('T')[0];
    }
    await supabase.from('jobs').update(updates).eq('id', id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
  }

  async function deleteJob(id) {
    await supabase.from('jobs').delete().eq('id', id);
    setJobs(prev => prev.filter(j => j.id !== id));
  }

  const filteredJobs = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);
  const counts = {};
  STATUSES.forEach(s => { counts[s] = jobs.filter(j => j.status === s).length; });

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin-slow" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {!profile && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-700">
            Your profile isn't set up yet — <Link href="/onboarding" className="font-semibold underline">complete your profile</Link> to start analysing jobs.
          </div>
        )}

        {profile && !profile.is_subscribed && (profile.analysis_count ?? 0) >= freeTierLimit && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-blue-700">You've used all {freeTierLimit} free analyses.</p>
            <Link href="/upgrade" className="shrink-0 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
              Upgrade to Pro →
            </Link>
          </div>
        )}

        {profile && !profile.is_subscribed && (profile.analysis_count ?? 0) === freeTierLimit - 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 text-sm text-amber-700">
            1 free analysis remaining. <Link href="/upgrade" className="font-semibold underline">Upgrade to Pro</Link> for unlimited.
          </div>
        )}

        {searchParams.get('upgraded') === '1' && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-700">
            Welcome to JobFit Pro! Unlimited analyses unlocked.
          </div>
        )}

        {error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">{error}</div>
        )}

        {/* Job Input Panel */}
        {showInput && (
          <div className="mb-8 border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold mb-1">Paste a full job description</h2>
            <p className="text-sm text-gray-500 mb-4">Copy the complete listing from Seek, LinkedIn, or any job board.</p>
            <textarea
              value={jobInput} onChange={(e) => setJobInput(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full min-h-[160px] sm:min-h-[250px] bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-400 font-mono">
                {jobInput.trim() ? `${jobInput.trim().split(/\s+/).length} words` : ''}
              </span>
              <div className="flex gap-3">
                <button onClick={() => { setShowInput(false); setJobInput(''); setError(''); }}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAnalyze} disabled={analyzing || !jobInput.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
                  {analyzing ? 'Analysing...' : 'Analyse Fit →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing spinner */}
        {analyzing && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin-slow mx-auto mb-4" />
            <p className="text-sm text-gray-500">Parsing and scoring...</p>
            <p className="text-xs text-gray-400 font-mono mt-2">Usually 10–20 seconds</p>
          </div>
        )}

        {/* Filters */}
        {jobs.length > 0 && !showInput && !analyzing && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={() => setFilter('All')}
              className={`px-3 py-1 rounded-full text-xs font-mono border ${filter === 'All' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
              All ({jobs.length})
            </button>
            {STATUSES.map(s => counts[s] > 0 && (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-mono border ${filter === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500'}`}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {jobs.length === 0 && !showInput && !analyzing && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-base font-semibold mb-2">No jobs analysed yet</h2>
            <p className="text-sm text-gray-500 mb-6">Paste a full job description to get started.</p>
            <button onClick={() => {
                if (!profile) router.push('/onboarding');
                else if (!profile.is_subscribed && (profile.analysis_count ?? 0) >= freeTierLimit) router.push('/upgrade');
                else setShowInput(true);
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              + Analyse a Job
            </button>
          </div>
        )}

        {/* Job list */}
        {!showInput && !analyzing && filteredJobs.map(job => (
          <div key={job.id} className="border border-gray-200 rounded-xl p-4 mb-3 hover:border-blue-400 transition-colors">
            <div className="flex gap-4 items-start">
              <div className={`text-center min-w-[56px] px-2 py-2 rounded-lg ${scoreColor(job.score)}`}>
                <div className="text-xl font-bold font-mono leading-none">{job.score}</div>
                <div className="text-[9px] font-semibold mt-1 uppercase">{job.verdict?.split(' ')[0]}</div>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/job/${job.id}`} className="block hover:underline">
                  <div className="text-sm font-semibold">{job.title}</div>
                  <div className="text-xs text-gray-500">{[job.company, job.location].filter(Boolean).join(' · ')}</div>
                </Link>
                {job.salary && <div className="text-xs text-gray-400 mt-0.5">{job.salary}</div>}
                <div className="flex gap-2 items-center mt-2.5 flex-wrap">
                  <select value={job.status} onChange={(e) => updateStatus(job.id, e.target.value, job.applied_date)}
                    className={`px-2 py-1 rounded border border-gray-200 text-xs font-mono font-semibold ${statusColors[job.status]} bg-white cursor-pointer`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {job.status === 'Applied' && job.applied_date && (
                    <span className="text-[11px] text-yellow-600 font-mono">
                      {new Date(job.applied_date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  <Link href={`/job/${job.id}`} className="px-2 py-1 rounded border border-gray-200 text-[11px] font-mono text-gray-500 hover:bg-gray-50">
                    View →
                  </Link>
                  {job.resume && <span className="text-[11px] text-green-600 font-mono">✓ Resume</span>}
                  {job.cover_letter && <span className="text-[11px] text-green-600 font-mono">✓ Cover</span>}
                  <button onClick={() => { if (confirm('Delete this job?')) deleteJob(job.id); }}
                    className="ml-auto p-1 text-gray-300 hover:text-red-400 text-xs transition-colors">✕</button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!showInput && <div className="mt-12 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 font-mono">JobFit v1.0 · {jobs.length} job{jobs.length !== 1 ? 's' : ''} tracked</p>
        </div>}
      </div>
    </div>
  );
}
