'use client';
// src/components/AuthForm.js
// Shared auth form — used by the homepage (/) and the paid-traffic LP (/start).
// Pulled into its own component so the two pages can't drift apart on auth UX.

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import Link from 'next/link';

export default function AuthForm({
  // 'signup' starts the form in signup mode; 'signin' starts in sign-in mode.
  // Paid-traffic LPs default to 'signup'; the organic homepage usually does too.
  defaultMode = 'signup',
  // Compact removes the inner heading + intro paragraph for tight LPs.
  compact = false,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [signedUp, setSignedUp] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) setMessage(error.message);
        else setSignedUp(true);
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
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (signedUp) {
    return (
      <div className="text-center">
        <div className="text-3xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          We sent a confirmation link to <span className="font-medium text-gray-700">{email}</span>. Click it to activate your account.
        </p>
        <button
          onClick={() => { setSignedUp(false); setIsSignUp(false); setMessage(''); }}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <>
      {!compact && (
        <>
          <h2 className="text-xl font-bold mb-1">{isSignUp ? 'Create your account' : 'Sign in to JobFit'}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {isSignUp ? 'Free to start — no credit card needed.' : 'Welcome back to JobFit.'}
          </p>
        </>
      )}

      <button
        onClick={handleGoogleSignIn}
        type="button"
        className="w-full flex items-center justify-center gap-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-mono">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

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
          <div className="text-sm px-3 py-2 rounded-lg bg-red-50 text-red-600">
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
    </>
  );
}
