'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

const features = [
  {
    icon: '⚡',
    title: 'Instant fit score',
    desc: 'See exactly how well you match a job before spending time applying.',
  },
  {
    icon: '📄',
    title: 'Tailored resume',
    desc: 'Your resume, rewritten to match the language of the job description.',
  },
  {
    icon: '✉️',
    title: 'Cover letter done',
    desc: 'A cover letter that sounds like you — not a template everyone else uses.',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setMessage(error.message);
      else setMessage('Check your email for a confirmation link. If you already have an account, try signing in instead.');
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', data.user.id)
          .single();
        window.location.href = profile ? '/dashboard' : '/onboarding';
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight">JobFit</span>
        <nav className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/contact" className="hover:text-gray-800 transition-colors">Contact</Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left — value prop */}
        <div className="order-2 lg:order-1 flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-0 max-w-2xl">
          <p className="text-xs font-mono text-blue-600 uppercase tracking-widest mb-4">Free to try · No credit card needed</p>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            Stop sending the<br className="hidden sm:block" /> same resume everywhere.
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Paste any job description. Get a fit score, a tailored resume,<br className="hidden md:block" /> and a cover letter — in under 30 seconds.
          </p>

          <div className="space-y-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 font-mono mt-10">
            Free: 2 job analyses &middot; Pro: $9.99 / quarter, unlimited
          </p>
        </div>

        {/* Right — auth form */}
        <div className="order-1 lg:order-2 lg:w-[420px] flex items-center justify-center px-6 py-12 lg:py-0 lg:border-l border-gray-100 bg-gray-50">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-bold mb-1">{isSignUp ? 'Create your account' : 'Sign in to JobFit'}</h2>
            <p className="text-sm text-gray-500 mb-6">
              {isSignUp ? 'Free to start — no credit card needed.' : 'Welcome back.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono">Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  placeholder="Min 6 characters"
                />
              </div>

              {message && (
                <div className={`text-sm px-3 py-2 rounded-lg ${message.includes('Check') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {message}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create free account →' : 'Sign in →'}
              </button>
            </form>

            {!isSignUp && (
              <div className="text-center mt-2">
                <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            )}

            <button
              onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
              className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">© {new Date().getFullYear()} JobFit</span>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-gray-600 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
