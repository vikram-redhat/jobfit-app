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
| Analytics | Vercel Analytics, TikTok Pixel |

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

src/components/Nav.js            # Shared navigation bar
src/lib/
  supabase-browser.js            # Client-side Supabase client
  supabase-server.js             # Server-side Supabase client (uses auth cookies)
  supabase-admin.js              # Admin Supabase client (service role, for webhooks)
  stripe.js                      # Stripe client singleton
src/middleware.js                # Auth guard — redirects unauthenticated users
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

## Known Notes

- PDF download is implemented as a print-ready HTML file (not a true server-side PDF). The user opens it in the browser and uses Ctrl+P / Print to save as PDF.
- Google OAuth requires the callback URL `https://jobfit.today/auth/callback` to be configured in both Supabase (Authentication > URL Configuration) and Google Cloud Console.
- The demo GIF (`/public/demo.gif`) is shown on mobile only (hidden on desktop via Tailwind `lg:hidden`).
