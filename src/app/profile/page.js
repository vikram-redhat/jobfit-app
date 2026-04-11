'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';

const STEPS = ['basics', 'experience', 'skills', 'preferences'];

export default function ProfilePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef(null);
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (!prof) { router.push('/onboarding'); return; }

      setFullName(prof.full_name || '');
      setEmail(prof.email || '');
      setLocation(prof.location || '');
      setEducation(prof.education || '');
      setExperience(prof.experience?.length ? prof.experience : [{ title: '', company: '', dates: '', achievements: '' }]);
      setSkills(prof.skills || '');
      setTargetRoles(prof.target_roles || '');
      setWorkArrangement(prof.work_arrangement || 'Open to anything');
      setContractPerm(prof.contract_perm || 'Open to either');
      setSalaryFloor(prof.salary_floor || '');
      setIndustryPref(prof.industry_pref || '');
      setIsSubscribed(prof.is_subscribed ?? false);
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleResumeUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true); setParseError(''); setSaved(false);
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
      setStep(0);
      setSaved(false);
    } catch (e) {
      setParseError(e.message || 'Could not parse resume.');
    }
    setParsing(false);
    e.target.value = '';
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

  async function handleManageSubscription() {
    setPortalLoading(true);
    setError('');
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    if (!res.ok) {
      setError('Could not open billing portal. Please try again or contact support.');
      setPortalLoading(false);
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch('/api/account/delete', { method: 'POST' });
    if (!res.ok) {
      setDeleting(false);
      setDeleteConfirm(false);
      setError('Failed to delete account. Please try again.');
      return;
    }
    // Signed out by server — redirect to home
    window.location.href = '/';
  }

  const handleSave = useCallback(async () => {
    if (!fullName.trim()) { setError('Please enter your name'); return; }
    setSaving(true); setError(''); setSaved(false);
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
      setSaved(true);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }, [fullName, email, location, education, experience, skills, targetRoles, workArrangement, contractPerm, salaryFloor, industryPref, supabase]);

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono";

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
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Update your details any time — changes apply to future job analyses.</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
            className="shrink-0 ml-4 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {parsing ? 'Parsing...' : '↑ Upload Resume'}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleResumeUpload} />
        </div>
        {parseError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-600">{parseError}</div>}
        {parsing && <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">Reading your resume...</div>}

        {/* Step indicator */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-600">{error}</div>}
        {saved && <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5 text-sm text-green-700">Profile saved!</div>}

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
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-30 hover:bg-gray-50 transition-colors">
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={handleSave} disabled={!fullName.trim() || saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        {/* Subscription */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-base font-semibold mb-1">Subscription</h2>
          <p className="text-sm text-gray-500 mb-4">
            {isSubscribed ? 'You\'re on JobFit Pro — unlimited analyses.' : 'You\'re on the free plan.'}
          </p>
          {isSubscribed ? (
            <button onClick={handleManageSubscription} disabled={portalLoading}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">
              {portalLoading ? 'Loading...' : 'Manage / Cancel Subscription'}
            </button>
          ) : (
            <a href="/upgrade" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors inline-block">
              Upgrade to Pro →
            </a>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-10 pt-8 border-t border-red-100">
          <h2 className="text-base font-semibold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all your data. This cannot be undone.
            {isSubscribed && ' Your Pro subscription will be cancelled automatically.'}
          </p>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors">
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700 mb-3">Are you sure? All your jobs, resumes and cover letters will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-40 transition-colors">
                  {deleting ? 'Deleting...' : 'Yes, delete everything'}
                </button>
                <button onClick={() => setDeleteConfirm(false)} disabled={deleting}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
