# JobFit — Project Context

## What this is
AI-powered job application tool for young/casual job seekers (under 30).
Paste a job description, get a fit score, tailored resume, and cover letter.

## Tech Stack
- Next.js 14 on Vercel
- Supabase (PostgreSQL + Auth)
- Claude Haiku API for all AI operations
- Tailwind CSS

## Key Architecture Decisions
- API routes in src/app/api/ call Claude Haiku server-side
- Auth via Supabase email/password with middleware guard
- Row-level security on all tables (users only see own data)
- Anti-hallucination instructions appended to all AI prompts
- Stripe for payments: checkout, webhooks, billing portal, promo codes

## Important Rules
- Never fabricate metrics or achievements in generated resumes/cover letters
- Never mix achievements between different roles
- Use Claude Haiku (claude-haiku-4-5-20251001) for all API calls to keep costs low
- Target audience is young casual job seekers — keep copy friendly, not corporate

## File Structure
- src/app/page.js — Login/signup
- src/app/onboarding/page.js — 4-step profile wizard (or upload resume)
- src/app/dashboard/page.js — Job list with scores and status tracking
- src/app/upgrade/page.js — Paywall / Stripe checkout entry
- src/app/admin/page.js — Admin dashboard (stats, users, settings, promo codes)
- src/app/job/[id]/page.js — Job detail, resume, cover letter view/edit
- src/app/api/analyze/route.js — Parse JD + score fit (enforces paywall)
- src/app/api/generate-resume/route.js — Tailored resume generation
- src/app/api/generate-cover/route.js — Cover letter generation
- src/app/api/stripe/checkout/route.js — Create Stripe checkout session
- src/app/api/stripe/webhook/route.js — Handle Stripe events
- src/app/api/stripe/portal/route.js — Billing portal session
- src/app/api/admin/* — Admin-only API routes
- supabase-schema.sql — Initial database schema
- supabase-stripe-migration.sql — Billing migration (run after initial schema)

## Pricing Model
- Free: configurable limit (default 2 job analyses, set in app_settings table)
- Pro: $9.99/quarter, unlimited (via Stripe subscription)

## Required Env Vars
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY,
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID,
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (if needed client-side),
ADMIN_EMAIL (email address of the admin user)
