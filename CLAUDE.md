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
- No Stripe integration yet (free tier only for now)

## Important Rules
- Never fabricate metrics or achievements in generated resumes/cover letters
- Never mix achievements between different roles
- Use Claude Haiku (claude-haiku-4-5-20251001) for all API calls to keep costs low
- Target audience is young casual job seekers — keep copy friendly, not corporate

## File Structure
- src/app/page.js — Login/signup
- src/app/onboarding/page.js — 4-step profile wizard
- src/app/dashboard/page.js — Job list with scores and status tracking
- src/app/job/[id]/page.js — Job detail, resume, cover letter view/edit
- src/app/api/analyze/route.js — Parse JD + score fit
- src/app/api/generate-resume/route.js — Tailored resume generation
- src/app/api/generate-cover/route.js — Cover letter generation
- supabase-schema.sql — Database schema

## Pricing Model (planned)
- Free: 2 job analyses
- Paid: $9.99/quarter, unlimited
