// src/lib/rate-limit.js
// Lightweight in-memory IP rate limiter for anonymous tool endpoints.
//
// Why this works for our scale:
// - Vercel keeps function instances warm for several minutes between calls,
//   so the in-memory Map persists across most user requests.
// - Cold starts reset the counter, which is fine — worst case a single user
//   gets a few extra calls. We're protecting against bulk abuse, not gaming.
// - Zero infra dependencies. We can swap in Upstash Redis later without
//   changing the call site if traffic warrants it.
//
// Limits are deliberately tight on the free tools to keep the anonymous
// AI-cost ceiling predictable. Real users will rarely hit them.

const buckets = new Map(); // ip -> { count, resetAt }

const DEFAULTS = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                  // 10 calls per IP per hour
};

/**
 * Returns { ok: true } or { ok: false, retryAfter: <seconds> }.
 * Call this at the very top of any anonymous API route.
 */
export function checkRateLimit(ip, opts = {}) {
  if (!ip) ip = 'unknown';
  const { windowMs, max } = { ...DEFAULTS, ...opts };
  const now = Date.now();

  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: max - bucket.count };
}

/**
 * Best-effort IP extraction. Vercel sets x-forwarded-for; localhost won't.
 */
export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
