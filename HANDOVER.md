# JobFit — Handover Document

## What it is

AI-powered job application tool for young/casual job seekers (under 30). Users paste a job description and get a fit score, tailored resume, and cover letter in ~20 seconds. Monetised via a freemium subscription model.

**Production URL:** https://jobfit.today  
**Repo:** GitHub (deployed via Vercel — auto-deploys on push to `main`)  
**Admin email:** admin@craftgossip.com

---

## Pricing

| Plan | Price | Limit |
|---|---|---|
| Free | $0 | Configurable (default: 2 analyses) — set in `app_settings` table |
| Pro | $9.99 / quarter | Unlimited analyses |

Free tier limit is adjustable live from the Admin panel without a code deploy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + API routes | Next.js 14 (App Router), deployed on Vercel |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) via Anthropic API |
| Payments | Stripe (subscriptions, webhooks, billing portal, promo codes) |
| Styling | Tailwind CSS |
| Analytics | Vercel Analytics, Google Analytics 4, TikTok Pixel |

---

## Environment Variables

All set in Vercel project settings. Required:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
NEXT_PUBLIC_APP_URL=https://jobfit.today
ADMIN_EMAIL=admin@craftgossip.com
```

---

## Database Setup

Run SQL files in this order against your Supabase project (SQL Editor):

1. `supabase-schema.sql` — initial schema (profiles, jobs, app_settings)
2. `supabase-stripe-migration.sql` — adds Stripe billing fields to profiles
3. `supabase-applied-date-migration.sql` — adds applied_date to jobs
4. `supabase-deleted-accounts-migration.sql` — deleted_accounts table (prevents free tier abuse on re-signup)
5. `supabase-tool-results-migration.sql` — tool_results table for free SEO tools ✅ applied

Demo data (optional):
- `supabase-demo-accounts.sql`
- `supabase-demo-accounts-mia-jobs.sql`

---

## File Structure

```
src/app/
  page.js                        # Landing page + auth (email/password + Google OAuth)
  layout.js                      # Root layout — TikTok Pixel base script loaded here
  onboarding/page.js             # Profile setup: upload PDF resume or 4-step manual form
  dashboard/page.js              # Job list, status tracking, job analysis entry point
  upgrade/page.js                # Paywall / Stripe checkout entry
  job/[id]/page.js               # Job detail: fit score, resume, cover letter view/edit/download
  admin/page.js                  # Admin dashboard (stats, users, settings, promo codes)
  profile/page.js                # User profile editing
  account/page.js                # Account management
  forgot-password/page.js        # Password reset request
  reset-password/page.js         # Password reset confirmation
  contact/page.js                # Contact form
  privacy/page.js                # Privacy policy
  auth/callback/route.js         # Supabase OAuth + email confirmation callback

  api/analyze/route.js           # Parse JD + score fit (enforces paywall)
  api/generate-resume/route.js   # Tailored resume generation
  api/generate-cover/route.js    # Tailored cover letter generation
  api/parse-resume/route.js      # PDF resume upload → profile field extraction
  api/stripe/checkout/route.js   # Create Stripe checkout session
  api/stripe/webhook/route.js    # Handle Stripe events (subscription lifecycle)
  api/stripe/portal/route.js     # Billing portal session
  api/admin/stats/route.js       # Admin: overview stats
  api/admin/users/route.js       # Admin: user list
  api/admin/settings/route.js    # Admin: read/write app_settings
  api/admin/coupons/route.js     # Admin: create/list/deactivate Stripe coupons
  api/tools/keywords/route.js    # Anonymous: JD keyword extraction (rate-limited, no auth)
  api/tools/grade-resume/route.js # Anonymous: resume grader (rate-limited, no auth)

  tools/page.js                  # Free tools index (SEO landing, server-rendered)
  tools/job-description-keyword-extractor/page.js  # Keyword extractor tool page
  tools/job-description-keyword-extractor/r/[id]/page.js  # Shareable result permalink
  tools/resume-grader/page.js    # Resume grader tool page
  tools/resume-grader/r/[id]/page.js  # Shareable result permalink

  robots.js                      # /robots.txt — allows AI crawlers (GPTBot, ClaudeBot, etc.)
  sitemap.js                     # /sitemap.xml
  llms.txt/route.js              # /llms.txt — AI crawler summary (llmstxt.org standard)
  llms-full.txt/route.js         # /llms-full.txt — full AI crawler reference

src/components/Nav.js            # Shared navigation bar
src/components/ToolPageLayout.js # Shared layout for free tool pages
src/components/ToolForm.js       # Client island: form + result renderer for free tools
src/components/JsonLd.js         # JSON-LD structured data (Organization, SoftwareApplication, FAQ)
src/components/results/
  KeywordsResult.js              # Renders keyword extraction results
  ResumeGradeResult.js           # Renders resume grade results
src/lib/
  supabase-browser.js            # Client-side Supabase client
  supabase-server.js             # Server-side Supabase client (uses auth cookies)
  supabase-admin.js              # Admin Supabase client (service role, for webhooks)
  stripe.js                      # Stripe client singleton
  rate-limit.js                  # In-memory IP rate limiter for anonymous tool endpoints
  ai-guard.js                    # Input sanitization + prompt-injection defense
src/middleware.js                # Auth guard — /tools/* and /api/tools/* are public
```

---

## User Flow

```
Landing page (/) → Sign up / Google OAuth
  → Email confirmation (if email/password)
  → /onboarding — upload PDF resume or fill 4-step form
  → /dashboard — paste job description → AI analysis → fit score saved
  → /job/[id] — view score, strengths, gaps, angle, key requirements
              → generate tailored resume → edit → download PDF
              → generate cover letter → edit → download PDF
  → Track application status (New → Applied → Interview → Offered/Rejected/Dismissed)

Free limit hit → /upgrade → Stripe checkout → /dashboard?upgraded=1
```

---

## Stripe Integration

- **Checkout:** `/api/stripe/checkout` creates a session with promo code support. Creates a Stripe customer if one doesn't exist, stores `stripe_customer_id` on the profile.
- **Webhook:** `/api/stripe/webhook` handles:
  - `checkout.session.completed` → sets `is_subscribed: true`
  - `customer.subscription.updated` → syncs subscription status
  - `customer.subscription.deleted` → sets `is_subscribed: false`
- **Billing portal:** `/api/stripe/portal` — lets Pro users manage/cancel subscription
- **Promo codes:** Created and managed from the Admin panel, applied at Stripe checkout

Webhook secret must be set in both Vercel env vars and the Stripe dashboard (for the production endpoint `https://jobfit.today/api/stripe/webhook`).

---

## Analytics

### Google Analytics 4
Property ID: `G-X5XBCMDQJL` (loaded in `src/app/layout.js`)
Tracks all page views automatically. No custom events configured — standard GA4 behaviour.

---

## TikTok Pixel

Pixel ID: `D7C4H7RC77U3K3SH6I30` (loaded in `src/app/layout.js`)

| Event | File | Trigger |
|---|---|---|
| `page` | layout.js | Every page load |
| `CompleteRegistration` | onboarding/page.js | After profile saved |
| `InitiateCheckout` | upgrade/page.js | Upgrade button clicked |
| `Purchase` | dashboard/page.js | After successful Stripe subscription |

`CompleteRegistration` and `Purchase` both call `ttq.identify()` first with SHA-256 hashed email + user ID.

---

## Admin Panel

Access: `/admin` — protected by `ADMIN_EMAIL` env var (server-side check).

- **Overview:** total users, Pro subscribers, total analyses, users at free limit
- **Users:** full user table with plan status
- **Settings:** adjust the free tier analysis limit live (no deploy needed)
- **Promo Codes:** create Stripe coupons (percent or amount off, duration, max redemptions), deactivate existing ones

---

## AI Prompts

All AI calls use `claude-haiku-4-5-20251001` (cheapest, fastest). Every prompt includes anti-hallucination instructions:

> Only use facts explicitly present in the candidate profile. Do not invent, embellish, or approximate any numbers or claims. The candidate must be able to defend every claim in an interview.

**Approximate costs per action:**
- Job analysis: ~$0.01–0.02
- Resume generation: ~$0.02–0.04
- Cover letter generation: ~$0.02–0.04

---

## Paywall Logic

- `profiles.analysis_count` increments on each analysis and never decrements (even if jobs are deleted)
- `app_settings` table holds `free_tier_limit` (default: 2)
- Users who previously deleted their account and re-signed up are detected via `deleted_accounts` table and get 0 free analyses
- Paywall returns HTTP 402 → client redirects to `/upgrade`

---

## SEO / GEO

Full SEO and Generative Engine Optimization setup:

- **Metadata:** `layout.js` exports a full Next.js `metadata` object — title template, description, OG tags, Twitter card, robots directives, `og.png` social image
- **robots.txt** (`robots.js`): blocks auth-gated routes, explicitly allows 14 AI crawlers by name (GPTBot, ClaudeBot, PerplexityBot, etc.)
- **sitemap.xml** (`sitemap.js`): all public routes with priorities
- **llms.txt / llms-full.txt**: the emerging standard for AI search engines. Short version is a TL;DR; full version includes competitor comparison, FAQs, use cases — all written for accurate citation by ChatGPT/Perplexity/Claude/Gemini
- **JSON-LD** (`JsonLd.js`): `Organization`, `SoftwareApplication` (with Free + Pro `Offer` nodes), and `FAQPage` structured data on the landing page. Tool pages each have their own `FAQPage` block
- **Free tools** (`/tools`): two anonymous, no-signup tools (keyword extractor, resume grader) that generate shareable result permalinks at `/tools/[tool]/r/[id]` — server-rendered, individually indexed. Each result page has unique `<title>/<description>` generated from the actual AI output. Acts as top-of-funnel organic/AI search traffic with CTAs back to the main app
- **Anonymous tool endpoints** (`/api/tools/*`): rate-limited at 10 req/IP/hour, prompt-injection sanitized, degrade gracefully if DB insert fails

---

## Known Notes

- PDF download is implemented as a print-ready HTML file (not a true server-side PDF). The user opens it in the browser and uses Ctrl+P / Print to save as PDF.
- Google OAuth requires the callback URL `https://jobfit.today/auth/callback` to be configured in both Supabase (Authentication > URL Configuration) and Google Cloud Console.
- The demo GIF (`/public/demo.gif`) is shown on mobile only (hidden on desktop via Tailwind `lg:hidden`).
- `ToolForm` is a Client Component that imports result components directly — do not pass `renderResult` as a function prop from Server Component pages (Next.js App Router does not allow function props across the server/client boundary).
