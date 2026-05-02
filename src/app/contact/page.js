'use client';
import { useState } from 'react';
import Link from 'next/link';
import BuiltWithClaude from '@/components/BuiltWithClaude';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? 'sent' : 'error');
  };

  // Shared nav so visitors landing on /contact from search can discover
  // the rest of the site. Matches the layout used by /resume-for and /tools.
  const Header = () => (
    <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <Link href="/" className="text-xl font-bold tracking-tight">
        JobFit<span className="text-blue-600">.today</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-5 text-sm text-gray-500">
        <Link href="/resume-for" className="hidden sm:inline hover:text-gray-800 transition-colors">Resume guides</Link>
        <Link href="/tools" className="hover:text-gray-800 transition-colors">Free tools</Link>
        <Link href="/" className="hover:text-gray-800 transition-colors">Sign in</Link>
      </nav>
    </header>
  );

  const Footer = () => (
    <footer className="px-6 py-6 border-t border-gray-100 max-w-3xl mx-auto w-full flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span className="text-xs text-gray-400 font-mono">
        © {new Date().getFullYear()} JobFit · <BuiltWithClaude />
      </span>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <Link href="/resume-for" className="hover:text-gray-600 transition-colors">Resume guides</Link>
        <Link href="/tools" className="hover:text-gray-600 transition-colors">Free tools</Link>
        <Link href="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
      </div>
    </footer>
  );

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <div className="text-3xl mb-4">✓</div>
            <h1 className="text-xl font-bold mb-2">Message sent</h1>
            <p className="text-sm text-gray-500 mb-6">We'll get back to you soon.</p>
            <Link href="/" className="text-sm text-blue-600 hover:underline">Back to home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1">Get in touch</h1>
            <p className="text-sm text-gray-500">Got a question or feedback? We'd love to hear from you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono">Name</label>
            <input
              name="name" type="text" value={form.name} onChange={handleChange} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono">Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide font-mono">Message</label>
            <textarea
              name="message" value={form.message} onChange={handleChange} required rows={5}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
              placeholder="What's on your mind?"
            />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              Something went wrong. Try emailing us directly.
            </p>
          )}

          <button
            type="submit" disabled={status === 'sending'}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
        </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
