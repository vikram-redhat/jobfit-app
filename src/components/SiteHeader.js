// src/components/SiteHeader.js
// Single source of truth for the public-page header.
// Used by every public page EXCEPT the homepage (which has a custom
// hero/auth-form layout that wraps its own header).
//
// Why one component: nav items have drifted across pages multiple times
// while we've been iterating. Centralizing here prevents that — change the
// nav once and every public page picks it up.
//
// The current page's link is rendered like any other (no "you are here"
// styling). That keeps the nav predictable for users and for crawlers; the
// "where am I" signal lives in the URL, page title, and breadcrumbs.

import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <Link href="/" className="text-xl font-bold tracking-tight">
        JobFit<span className="text-blue-600">.today</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-5 text-sm text-gray-500">
        <Link href="/resume-for" className="hidden sm:inline hover:text-gray-800 transition-colors">
          Resume guides
        </Link>
        <Link href="/tools" className="hover:text-gray-800 transition-colors">
          Free tools
        </Link>
        <Link href="/" className="hover:text-gray-800 transition-colors">
          Sign in
        </Link>
        {/* Contact lives in the footer of every page — keep header to 3 items
            so it doesn't crowd the wordmark and stays scannable. */}
      </nav>
    </header>
  );
}
