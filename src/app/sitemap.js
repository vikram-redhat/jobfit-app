// src/app/sitemap.js
// Native Next.js 14 sitemap. Visited at /sitemap.xml.
// Add new public routes here as they ship (programmatic pages, blog posts, tools).

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

export default function sitemap() {
  const now = new Date();

  // Public, indexable routes only. Auth-gated routes are excluded by robots.js.
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ];

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
