# JobFit — AI Job Application Tool

Paste a job description. Get a tailored resume and cover letter in seconds.

## Quick Start

### 1. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Authentication > Providers** and ensure Email is enabled
4. Go to **Settings > API** and copy your **Project URL** and **publishable** key (also shown as anon/public)

### 2. Anthropic API Key

1. Sign up at [platform.claude.com](https://platform.claude.com)
2. Create an API key and add credits ($5 is plenty for testing)

### 3. Local Development

```bash
# Clone the repo
git clone <your-repo-url>
cd jobfit-app

# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Anthropic credentials

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain, e.g. `https://jobfit-app.vercel.app`)
4. Deploy

### 5. Update Supabase Auth Redirect

After deploying, go to Supabase **Authentication > URL Configuration** and add your Vercel URL to:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## Architecture

```
User signs up → Creates profile (onboarding) → Pastes job description
  → API route calls Claude Haiku to parse + score
  → Results saved to Supabase
  → User generates resume/cover letter (also via Claude)
  → Edit, download PDF, track status
```

## Tech Stack

- **Frontend:** Next.js 14 (React) with Tailwind CSS
- **Backend:** Next.js API routes (serverless on Vercel)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Auth:** Supabase Auth (email/password)
- **AI:** Claude Haiku via Anthropic API

## Cost

- **Vercel:** Free (Hobby tier)
- **Supabase:** Free tier (50K rows, 500MB)
- **Anthropic API:** ~$0.01-0.02 per job analysis, ~$0.02-0.04 per document generation
- **Estimated monthly for light use:** $1-5

## Project Structure

```
src/
  app/
    page.js                 # Login/signup page
    layout.js               # Root layout
    globals.css             # Global styles
    auth/callback/route.js  # Email confirmation handler
    dashboard/page.js       # Main job dashboard
    onboarding/page.js      # Profile creation (4-step wizard)
    job/[id]/page.js        # Job detail, resume, cover letter
    api/
      analyze/route.js      # Parse JD + score fit
      generate-resume/route.js
      generate-cover/route.js
  components/
    Nav.js                  # Navigation bar
  lib/
    supabase-browser.js     # Client-side Supabase
    supabase-server.js      # Server-side Supabase
  middleware.js             # Auth guard
```

## Features

- Email/password authentication
- 4-step guided profile onboarding
- Job description paste → AI analysis with fit score (0-100)
- Strengths, gaps, red flags, and positioning angle
- Tailored resume generation
- Tailored cover letter generation
- Edit documents before downloading
- PDF download (via print-ready HTML)
- Status tracking (New → Applied → Interview → Offered → Rejected → Dismissed)
- Duplicate detection
- All data persisted in Supabase with row-level security
