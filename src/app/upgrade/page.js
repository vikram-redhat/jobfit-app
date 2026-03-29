'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Link from 'next/link';

export default function UpgradePage() {
  const [profile, setProfile] = useState(null);
  const [freeTierLimit, setFreeTierLimit] = useState(2);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const [{ data: prof }, { data: setting }] = await Promise.all([
        supabase.from('profiles').select('full_name, analysis_count, is_subscribed, stripe_customer_id').eq('user_id', user.id).single(),
        supabase.from('app_settings').select('value').eq('key', 'free_tier_limit').single(),
      ]);

      setProfile(prof);
      setFreeTierLimit(parseInt(setting?.value ?? '2', 10));
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpgrade() {
    setRedirecting(true);
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    if (!res.ok) { setRedirecting(false); return; }
    const { url } = await res.json();
    window.location.href = url;
  }

  async function handleManage() {
    setRedirecting(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    if (!res.ok) { setRedirecting(false); return; }
    const { url } = await res.json();
    window.location.href = url;
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

  if (profile?.is_subscribed) {
    return (
      <div><Nav />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-2">You're on JobFit Pro</h1>
          <p className="text-sm text-gray-500 mb-8">Unlimited job analyses, tailored resumes and cover letters.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleManage} disabled={redirecting}
              className="px-5 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors">
              {redirecting ? 'Loading...' : 'Manage Subscription'}
            </button>
            <Link href="/dashboard" className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const used = profile?.analysis_count ?? 0;

  return (
    <div><Nav />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Upgrade to JobFit Pro</h1>
          <p className="text-sm text-gray-500">
            You've used <span className="font-semibold text-gray-700">{used} of {freeTierLimit}</span> free analyses.
          </p>
        </div>

        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-8">
          {/* Free tier */}
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold">Free</span>
              <span className="text-sm font-mono text-gray-500">$0</span>
            </div>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li>✓ {freeTierLimit} job analyses</li>
              <li>✓ Fit score & verdict</li>
              <li>✓ Tailored resume & cover letter</li>
            </ul>
          </div>
          {/* Pro tier */}
          <div className="p-5 bg-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold">Pro</span>
              <span className="text-sm font-mono font-bold text-blue-600">$9.99 / quarter</span>
            </div>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li>✓ Unlimited job analyses</li>
              <li>✓ Fit score & verdict</li>
              <li>✓ Tailored resume & cover letter</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </div>

        <button onClick={handleUpgrade} disabled={redirecting}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
          {redirecting ? 'Redirecting to checkout...' : 'Upgrade for $9.99 / quarter →'}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">Secure checkout via Stripe. Cancel any time.</p>
        <div className="text-center mt-6">
          <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
