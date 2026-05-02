// src/app/robots.js
// Native Next.js 14 robots.txt. Visited at /robots.txt.
//
// Strategy:
// - Allow all major search bots and AI crawlers on public content.
// - Disallow auth-gated app surface (/dashboard, /admin, /onboarding, /job, etc.)
// - Disallow API routes — they're not useful to crawlers and can be expensive.
// - Explicitly call out AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
//   so we're on record allowing them. This matters for AI search citations.

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

const disallowedPaths = [
  '/api/',
  '/dashboard',
  '/admin',
  '/onboarding',
  '/job/',
  '/profile',
  '/account',
  '/upgrade',
  '/forgot-password',
  '/reset-password',
  '/auth/',
];

// Bots we want to give an explicit, generous policy to — primarily AI search.
// Keeping this list current matters: as new AI engines emerge they'll look
// for their bot name in robots.txt before crawling.
const aiBots = [
  'GPTBot',          // OpenAI / ChatGPT search index
  'OAI-SearchBot',   // OpenAI search
  'ChatGPT-User',    // ChatGPT browsing on behalf of a user
  'ClaudeBot',       // Anthropic Claude
  'Claude-Web',      // Anthropic Claude (legacy)
  'anthropic-ai',    // Anthropic crawler
  'PerplexityBot',   // Perplexity index
  'Perplexity-User', // Perplexity browsing on behalf of a user
  'Google-Extended', // Google Gemini / Bard training
  'Applebot-Extended', // Apple Intelligence
  'Bytespider',      // ByteDance / Doubao
  'CCBot',           // Common Crawl (feeds many models)
  'Diffbot',
  'cohere-ai',
  'YouBot',          // You.com
];

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      // Explicit allow rules for AI crawlers — same policy, but clearly logged
      // so we have on-record consent and so any future tightening is intentional.
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: '/',
        disallow: disallowedPaths,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
