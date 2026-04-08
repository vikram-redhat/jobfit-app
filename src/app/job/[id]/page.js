'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter, useParams } from 'next/navigation';
import Nav from '@/components/Nav';

const STATUSES = ['New', 'Applied', 'Interview', 'Offered', 'Rejected', 'Dismissed'];
const statusColors = { New: 'text-blue-600', Applied: 'text-yellow-600', Interview: 'text-green-600', Offered: 'text-purple-600', Rejected: 'text-red-500', Dismissed: 'text-gray-400' };

function scoreColor(s) {
  if (s >= 75) return 'text-green-600 bg-green-50';
  if (s >= 55) return 'text-yellow-600 bg-yellow-50';
  if (s >= 35) return 'text-orange-500 bg-orange-50';
  return 'text-red-500 bg-red-50';
}

function mdToHtml(md) {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr/>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.split('\n').map(line => {
    const t = line.trim();
    if (!t || t.startsWith('<h') || t.startsWith('<ul') || t.startsWith('<li') || t.startsWith('<hr') || t.startsWith('</')) return line;
    return `<p>${t}</p>`;
  }).join('\n');
  return html;
}

function downloadPdf(content, title, docType) {
  const htmlContent = mdToHtml(content);
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${docType}</title>
<style>@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
@page{margin:18mm 16mm;size:A4}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Sans',system-ui,sans-serif;color:#1a1a2e;font-size:11pt;line-height:1.55;max-width:720px;margin:0 auto;padding:24px}
h1{font-size:20pt;font-weight:700;margin:0 0 6pt}h2{font-size:13pt;font-weight:600;margin:18pt 0 6pt;color:#2563eb;border-bottom:1.5px solid #e1e4e8;padding-bottom:3pt}
h3{font-size:11.5pt;font-weight:600;margin:12pt 0 4pt}p{margin:0 0 6pt}ul{margin:2pt 0 8pt 18pt}li{margin:0 0 3pt}
strong{font-weight:600}em{font-style:italic;color:#4a4a5a}hr{border:none;border-top:1px solid #e1e4e8;margin:12pt 0}
@media print{body{padding:0}}</style></head><body>${htmlContent}
<script>window.onload=function(){setTimeout(function(){window.print()},400)};</script></body></html>`;
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docType}_${title?.replace(/[^a-zA-Z0-9]/g, '_')?.substring(0, 40) || 'document'}.html`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');
  const [view, setView] = useState('analysis'); // analysis | resume | cover
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => { loadJob(); }, [id]);

  async function loadJob() {
    const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (!data) { router.push('/dashboard'); return; }
    setJob(data);
    setLoading(false);
  }

  async function updateStatus(status) {
    const updates = { status };
    if (status === 'Applied' && !job.applied_date) {
      updates.applied_date = new Date().toISOString().split('T')[0];
    }
    await supabase.from('jobs').update(updates).eq('id', id);
    setJob(prev => ({ ...prev, ...updates }));
  }

  async function updateAppliedDate(date) {
    await supabase.from('jobs').update({ applied_date: date }).eq('id', id);
    setJob(prev => ({ ...prev, applied_date: date }));
  }

  async function generateDoc(type) {
    setError(''); setGenerating(type);
    try {
      const endpoint = type === 'resume' ? '/api/generate-resume' : '/api/generate-cover';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: id }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const field = type === 'resume' ? 'resume' : 'cover_letter';
      await supabase.from('jobs').update({ [field]: data.content }).eq('id', id);
      setJob(prev => ({ ...prev, [field]: data.content }));
      setView(type === 'resume' ? 'resume' : 'cover');
    } catch (e) { setError(e.message); }
    setGenerating('');
  }

  function startEdit() {
    const content = view === 'resume' ? job.resume : job.cover_letter;
    setEditText(content);
    setEditing(true);
  }

  async function saveEdit() {
    const field = view === 'resume' ? 'resume' : 'cover_letter';
    await supabase.from('jobs').update({ [field]: editText }).eq('id', id);
    setJob(prev => ({ ...prev, [field]: editText }));
    setEditing(false);
  }

  function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(''), 2000); });
  }

  if (loading) {
    return (
      <div><Nav />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin-slow" />
        </div>
      </div>
    );
  }

  const docContent = view === 'resume' ? job?.resume : job?.cover_letter;
  const docLabel = view === 'resume' ? 'Resume' : 'Cover Letter';

  return (
    <div>
      <Nav />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-600">{error}</div>}

        {generating && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin-slow mx-auto mb-4" />
            <p className="text-sm text-gray-500">Generating {generating}...</p>
            <p className="text-xs text-gray-400 font-mono mt-2">Usually 10–20 seconds</p>
          </div>
        )}

        {!generating && view === 'analysis' && (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-xl font-bold mb-1">{job.title}</h1>
                <p className="text-sm text-gray-500">{[job.company, job.location, job.arrangement].filter(Boolean).join(' · ')}</p>
                {job.salary && <p className="text-xs text-gray-400 mt-1">{job.salary}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <select value={job.status} onChange={(e) => updateStatus(e.target.value)}
                    className={`px-2 py-1 rounded border border-gray-200 text-sm font-mono font-semibold ${statusColors[job.status]} bg-white cursor-pointer`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {job.status === 'Applied' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 font-mono">Applied on</span>
                      <input
                        type="date"
                        value={job.applied_date || ''}
                        onChange={(e) => updateAppliedDate(e.target.value)}
                        className="px-2 py-1 border border-gray-200 rounded text-xs font-mono text-yellow-600 bg-white cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={`text-center min-w-[80px] px-4 py-3 rounded-xl ${scoreColor(job.score)}`}>
                <div className="text-3xl font-bold font-mono leading-none">{job.score}</div>
                <div className="text-[11px] font-semibold mt-1.5">{job.verdict}</div>
              </div>
            </div>

            {job.summary && (
              <p className="text-sm text-gray-500 leading-relaxed mb-6 px-4 py-3 bg-gray-50 rounded-lg border-l-3 border-gray-200">{job.summary}</p>
            )}

            {/* Positioning Angle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-1 font-mono">Positioning Angle</div>
              <p className="text-sm leading-relaxed">{job.angle}</p>
            </div>

            {/* Key Requirements */}
            {job.key_requirements?.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">Key Requirements</div>
                {job.key_requirements.map((r, i) => (
                  <div key={i} className={`flex gap-2.5 px-3 py-2 text-sm rounded ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <span className={`font-bold ${r.met ? 'text-green-600' : 'text-orange-500'}`}>{r.met ? '✓' : '✗'}</span>
                    <span><span className="font-medium">{r.requirement}</span>{r.evidence && <span className="text-gray-400 ml-1.5">— {r.evidence}</span>}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths / Gaps */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">Strengths</div>
                {job.strengths?.map((s, i) => (
                  <div key={i} className="text-sm leading-relaxed py-1 border-b border-gray-100">
                    <span className="text-green-600 font-bold mr-2">+</span>{s}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">Gaps</div>
                {job.gaps?.map((g, i) => (
                  <div key={i} className="text-sm leading-relaxed py-1 border-b border-gray-100">
                    <span className="text-orange-500 font-bold mr-2">−</span>{g}
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            {job.red_flags?.length > 0 && (
              <div className="mb-6">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 font-mono">Watch Out For</div>
                {job.red_flags.map((f, i) => (
                  <div key={i} className="text-sm leading-relaxed py-1"><span className="text-red-500 mr-2">⚠</span>{f}</div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-8">
              <button onClick={() => job.resume ? setView('resume') : generateDoc('resume')}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                {job.resume ? 'View Resume →' : 'Generate Resume →'}
              </button>
              <button onClick={() => job.cover_letter ? setView('cover') : generateDoc('cover')}
                className="flex-1 py-3 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                {job.cover_letter ? 'View Cover Letter →' : 'Generate Cover Letter →'}
              </button>
            </div>
            {(job.resume || job.cover_letter) && (
              <div className="flex gap-3 mt-2">
                {job.resume && <button onClick={() => generateDoc('resume')} className="flex-1 text-xs text-gray-400 hover:text-gray-600 font-mono py-1">↻ Regenerate resume</button>}
                {job.cover_letter && <button onClick={() => generateDoc('cover')} className="flex-1 text-xs text-gray-400 hover:text-gray-600 font-mono py-1">↻ Regenerate cover letter</button>}
              </div>
            )}
          </>
        )}

        {/* Document View (Resume or Cover Letter) */}
        {!generating && (view === 'resume' || view === 'cover') && docContent && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h2 className="text-base font-semibold">{docLabel} — {job.title} at {job.company}</h2>
              <div className="flex gap-2">
                {!editing && (
                  <>
                    <button onClick={startEdit} className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-mono text-blue-600 font-semibold hover:bg-gray-50">✎ Edit</button>
                    <button onClick={() => downloadPdf(docContent, job.title, docLabel.replace(' ', '_'))}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700">↓ PDF</button>
                    <button onClick={() => copyToClipboard(docContent, view)}
                      className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-mono text-gray-500 hover:bg-gray-50">
                      {copied === view ? 'Copied ✓' : 'Copy'}
                    </button>
                  </>
                )}
                {editing && (
                  <>
                    <button onClick={saveEdit} className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700">✓ Save</button>
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-gray-200 rounded-md text-xs text-gray-500 hover:bg-gray-50">Cancel</button>
                  </>
                )}
              </div>
            </div>

            {editing ? (
              <textarea value={editText} onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[500px] border-2 border-blue-500 rounded-lg p-5 text-sm leading-relaxed font-mono resize-y focus:outline-none" />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 text-sm leading-relaxed whitespace-pre-wrap">{docContent}</div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setView('analysis'); setEditing(false); }}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Analysis</button>
              {view === 'resume' ? (
                <button onClick={() => job.cover_letter ? (setView('cover'), setEditing(false)) : generateDoc('cover')}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  {job.cover_letter ? 'View Cover Letter →' : 'Generate Cover Letter →'}
                </button>
              ) : (
                <button onClick={() => job.resume ? (setView('resume'), setEditing(false)) : generateDoc('resume')}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  {job.resume ? 'View Resume →' : 'Generate Resume →'}
                </button>
              )}
            </div>
            {!editing && (
              <div className="text-center mt-2">
                <button onClick={() => generateDoc(view === 'resume' ? 'resume' : 'cover')}
                  className="text-xs text-gray-400 hover:text-gray-600 font-mono">↻ Regenerate {docLabel.toLowerCase()}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
