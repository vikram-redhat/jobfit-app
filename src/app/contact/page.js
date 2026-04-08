'use client';
import { useState } from 'react';
import Link from 'next/link';

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

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-3xl mb-4">✓</div>
          <h1 className="text-xl font-bold mb-2">Message sent</h1>
          <p className="text-sm text-gray-500 mb-6">We'll get back to you soon.</p>
          <Link href="/" className="text-sm text-blue-600 hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 font-mono">← JobFit</Link>
          <h1 className="text-2xl font-bold tracking-tight mt-4 mb-1">Get in touch</h1>
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
    </div>
  );
}
