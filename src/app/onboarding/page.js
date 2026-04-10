'use client';
import { useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const STEPS = ['basics', 'experience', 'skills', 'preferences'];

export default function OnboardingPage() {
  // phase: 'choose' | 'uploading' | 'form'
  const [phase, setPhase] = useState('choose');
  const [parsedFromResume, setParsedFromResume] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState([{ title: '', company: '', dates: '', achievements: '' }]);
  const [skills, setSkills] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [workArrangement, setWorkArrangement] = useState('Open to anything');
  const [contractPerm, setContractPerm] = useState('Open to either');
  const [salaryFloor, setSalaryFloor] = useState('');
  const [industryPref, setIndustryPref] = useState('');

  const fileInputRef = useRef(null);
  const supabase = createClient();
  const router = useRouter();

  const canSave = fullName.trim().length > 0 && !saving;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setLocation(data.location || '');
      setEducation(data.education || '');
      setExperience(data.experience?.length ? data.experience : [{ title: '', company: '', dates: '', achievements: '' }]);
      setSkills(data.skills || '');
      setTargetRoles(data.target_roles || '');

      setParsedFromResume(true);
      setStep(0);
      setPhase('form');
    } catch (e) {
      setParseError(e.message || 'Could not parse resume. Try entering your profile manually.');
    }
    setParsing(false);
  }

  function updateExp(i, field, value) {
    setExperience(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  }

  function addExp() {
    setExperience(prev => [...prev, { title: '', company: '', dates: '', achievements: '' }]);
  }

  function removeExp(i) {
    if (experience.length <= 1) return;
    setExperience(prev => prev.filter((_, idx) => idx !== i));
  }

  const handleSave = useCallback(async () => {
    if (!fullName.trim()) { setError('Please enter your name'); return; }
    setSaving(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated. Please log in again.');

      const { error: upsertErr } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        location: location.trim(),
        education: education.trim(),
        experience: experience.filter(e => e.title.trim() || e.company.trim()),
        skills: skills.trim(),
        target_roles: targetRoles.trim(),
        work_arrangement: workArrangement,
        contract_perm: contractPerm,
        salary_floor: salaryFloor.trim(),
        industry_pref: industryPref.trim(),
      }, { onConflict: 'user_id' });

      if (upsertErr) throw new Error(upsertErr.message);
      if (window.ttq) {
        const [hashedEmail, hashedId] = await Promise.all([
          sha256(email.trim().toLowerCase()),
          sha256(user.id),
        ]);
        window.ttq.identify({ email: hashedEmail, external_id: hashedId });
        window.ttq.track('CompleteRegistration', {});
      }
      router.push('/dashboard');
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }, [fullName, email, location, education, experience, skills, targetRoles, workArrangement, contractPerm, salaryFloor, industryPref, supabase, router]);

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono";

  // ── Choose screen ──────────────────────────────────────────────
  if (phase === 'choose') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight">Set up your profile</h1>
            <p className="text-sm text-gray-500 mt-2">Your profile powers the AI job matching. How would you like to get started?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-3xl">📄</span>
              <div>
                <div className="text-sm font-semibold">Upload Resume</div>
                <div className="text-xs text-gray-500 mt-0.5">PDF — we'll fill in your profile automatically</div>
              </div>
            </button>
            <button
              onClick={() => setPhase('form')}
              className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-3xl">✏️</span>
              <div>
                <div className="text-sm font-semibold">Enter Manually</div>
                <div className="text-xs text-gray-500 mt-0.5">Fill in your details step by step</div>
              </div>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => { setPhase('uploading'); handleFileChange(e); }}
          />
          <div className="text-center mt-8">
            <a href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              I'll do this later
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Uploading / parsing screen ─────────────────────────────────
  if (phase === 'uploading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {parsing ? (
            <>
              <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin-slow mx-auto mb-4" />
              <p className="text-sm font-medium">Reading your resume...</p>
              <p className="text-xs text-gray-400 font-mono mt-1">Usually just a few seconds</p>
            </>
          ) : parseError ? (
            <>
              <p className="text-sm text-red-600 mb-5">{parseError}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setParseError(''); fileInputRef.current?.click(); }}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Try another file
                </button>
                <button onClick={() => { setParseError(''); setPhase('form'); }}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                  Enter manually
                </button>
              </div>
            </>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Tell us about yourself</h1>
          <p className="text-sm text-gray-500 mt-1">This takes about 5 minutes. Your profile powers the AI matching.</p>
        </div>

        {parsedFromResume && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-700">
            Profile filled from your resume — review each section and make any changes before saving.
          </div>
        )}

        {/* Step indicator */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-600">{error}</div>}

        {/* Step 0: Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">The Basics</h2>
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Jane Smith" />
            </div>
            <div>
              <label className={labelCls}>Email (for your resume header)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="jane@email.com" />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="Brisbane, QLD" />
            </div>
            <div>
              <label className={labelCls}>Education</label>
              <input value={education} onChange={(e) => setEducation(e.target.value)} className={inputCls} placeholder="e.g. Bachelor of Science — UQ" />
            </div>
          </div>
        )}

        {/* Step 1: Experience */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-1">Work Experience</h2>
            <p className="text-sm text-gray-500 mb-4">Add your relevant roles. Even casual or part-time work counts.</p>
            {experience.map((exp, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-400">Role {i + 1}</span>
                  {experience.length > 1 && (
                    <button onClick={() => removeExp(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Job Title</label>
                  <input value={exp.title} onChange={(e) => updateExp(i, 'title', e.target.value)} className={inputCls} placeholder="e.g. Barista, Sales Assistant, Project Manager" />
                </div>
                <div>
                  <label className={labelCls}>Company</label>
                  <input value={exp.company} onChange={(e) => updateExp(i, 'company', e.target.value)} className={inputCls} placeholder="e.g. Coles, Canva, Freelance" />
                </div>
                <div>
                  <label className={labelCls}>Dates</label>
                  <input value={exp.dates} onChange={(e) => updateExp(i, 'dates', e.target.value)} className={inputCls} placeholder="e.g. Jan 2023 – Present" />
                </div>
                <div>
                  <label className={labelCls}>What did you do? (Key achievements)</label>
                  <textarea value={exp.achievements} onChange={(e) => updateExp(i, 'achievements', e.target.value)}
                    className={`${inputCls} min-h-[100px] resize-y`}
                    placeholder={"Describe what you did and any results.\nEven small things count — e.g. 'Trained 3 new staff' or 'Handled cash register during peak hours'."} />
                </div>
              </div>
            ))}
            <button onClick={addExp} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
              + Add another role
            </button>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-1">Skills</h2>
            <p className="text-sm text-gray-500 mb-4">List your key skills — tools, software, languages, certifications, anything relevant.</p>
            <div>
              <label className={labelCls}>Skills (comma-separated)</label>
              <textarea value={skills} onChange={(e) => setSkills(e.target.value)}
                className={`${inputCls} min-h-[120px] resize-y`}
                placeholder="e.g. Customer service, Microsoft Excel, Cash handling, Food safety cert, Social media, Forklift license, Python, Photoshop" />
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-1">What are you looking for?</h2>
            <p className="text-sm text-gray-500 mb-4">This helps us find the best matches and tailor your resume.</p>
            <div>
              <label className={labelCls}>Target Roles / Job Titles</label>
              <input value={targetRoles} onChange={(e) => setTargetRoles(e.target.value)} className={inputCls}
                placeholder="e.g. Sales Assistant, Barista, Admin Officer, Project Manager" />
            </div>
            <div>
              <label className={labelCls}>Work Arrangement</label>
              <select value={workArrangement} onChange={(e) => setWorkArrangement(e.target.value)} className={inputCls}>
                <option>Open to anything</option>
                <option>On-site only</option>
                <option>Remote only</option>
                <option>Hybrid preferred</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Contract or Permanent?</label>
              <select value={contractPerm} onChange={(e) => setContractPerm(e.target.value)} className={inputCls}>
                <option>Open to either</option>
                <option>Permanent only</option>
                <option>Contract/Casual only</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Minimum Salary (optional)</label>
              <input value={salaryFloor} onChange={(e) => setSalaryFloor(e.target.value)} className={inputCls}
                placeholder="e.g. $25/hour or $60K/year" />
            </div>
            <div>
              <label className={labelCls}>Preferred Industry (optional)</label>
              <input value={industryPref} onChange={(e) => setIndustryPref(e.target.value)} className={inputCls}
                placeholder="e.g. Retail, Tech, Hospitality, anything" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step === 0 ? setPhase('choose') : setStep(Math.max(0, step - 1))}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={handleSave} disabled={!canSave}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${canSave ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {saving ? 'Saving...' : 'Save & Start →'}
            </button>
          )}
        </div>

        {step === STEPS.length - 1 && !fullName.trim() && (
          <p className="text-xs text-orange-500 text-right mt-2">Please go back and enter your name to continue.</p>
        )}

        <div className="text-center mt-8">
          <a href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            I'll do this later
          </a>
        </div>
      </div>
    </div>
  );
}
