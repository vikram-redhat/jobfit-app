// src/app/sitemap.js
// Native Next.js 14 sitemap. Visited at /sitemap.xml.
// Add new public routes here as they ship (programmatic pages, blog posts, tools).

import { getBuildableRoles } from '@/lib/role-content';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

export default function sitemap() {
  const now = new Date();

  // Public, indexable routes only. Auth-gated routes are excluded by robots.js.
  // Tool result permalinks (/tools/*/r/[id]) are not enumerated here — they're
  // ephemeral (30-day TTL) and discovered via inbound shares + internal links.
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/resume-for', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/tools', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/tools/job-description-keyword-extractor', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/tools/resume-grader', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ];

  // Programmatic role-resume pages — only the ones that have cached content.
  // This keeps the sitemap honest: we only advertise URLs we can actually serve.
  const roleRoutes = getBuildableRoles().map((r) => ({
    path: `/resume-for/${r.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly',
  }));

  return [...staticRoutes, ...roleRoutes].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
