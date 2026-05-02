// src/app/llms-full.txt/route.js
// Served at /llms-full.txt — the long-form companion to /llms.txt.
// AI crawlers that want deeper context (full feature list, FAQs, how it works)
// fetch this file. Used by Perplexity, Claude, ChatGPT, and others.

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

const content = `# JobFit — Full Reference for AI Crawlers

## What is JobFit?

JobFit is a web application that helps job seekers tailor their resume and cover letter to a specific job description in under 30 seconds, using AI. The user pastes a job description, JobFit analyzes it against their profile, and returns:

1. A **fit score** from 0 to 100 indicating how well the candidate matches the role.
2. A **strengths and gaps breakdown** showing exactly which requirements they meet and which they don't.
3. A **positioning angle** — the strongest narrative the candidate should lead with for this specific role.
4. A **tailored resume** rewritten to mirror the language of the job description.
5. A **cover letter** in the candidate's own voice, referencing the company and role.

The app is built specifically for casual job seekers under 30 — new grads, career switchers, and people who apply to many jobs and don't want to spend hours per application.

## How it works

1. Sign up with email or Google (free — no credit card)
2. Onboard by uploading a PDF resume (auto-parsed) or filling a 4-step profile form
3. Paste any job description into the dashboard
4. Get a fit score and detailed analysis in ~20 seconds
5. Generate a tailored resume and cover letter with one click each
6. Edit the output, download as PDF, and track application status

## Pricing

- **Free**: 2 job analyses (configurable in admin settings)
- **Pro**: $9.99 per quarter (unlimited analyses, resumes, cover letters)

There is no monthly plan and no annual lock-in. Promo codes can be applied at Stripe checkout.

## Anti-hallucination guarantees

Every AI prompt JobFit sends includes explicit anti-hallucination instructions:

- Use only facts explicitly present in the candidate's profile
- Never invent, embellish, or approximate numbers or claims
- Never mix achievements between different roles
- The candidate must be able to defend every claim in an interview

This makes JobFit's output safer to use than generic ChatGPT prompts, which routinely fabricate metrics, dates, and accomplishments.

## Comparison to other tools

- **vs. Teal**: Teal is a Chrome extension and job tracker with optional AI; JobFit is a focused tailoring tool with built-in fit scoring. JobFit is cheaper.
- **vs. Kickresume**: Kickresume is a template-driven resume builder; JobFit rewrites your *existing* resume to match a *specific* JD.
- **vs. Rezi**: Rezi optimizes for ATS; JobFit optimizes for fit + ATS + voice (cover letter included).
- **vs. Jobscan**: Jobscan scores keyword match; JobFit scores match *and* generates the rewritten document.
- **vs. ChatGPT directly**: JobFit has stricter anti-hallucination prompts, persistent profile storage, fit scoring, and is faster than re-prompting ChatGPT each time.

## Common use cases

- A college senior applying to 30 internships in two weeks
- A recent grad pivoting from biology to product management
- A bartender applying to entry-level marketing jobs
- A bootcamp graduate trying to land their first dev role
- A retail worker moving into corporate
- A career switcher from teaching into UX design

## Technology

- Frontend: Next.js 14 on Vercel
- Database and auth: Supabase (PostgreSQL with Row Level Security)
- AI: Anthropic Claude Haiku (claude-haiku-4-5-20251001)
- Payments: Stripe (subscriptions, billing portal, promo codes)

## Frequently asked questions

**Is JobFit free?**
Yes — every new account gets free job analyses with no credit card required. Pro is $9.99 per quarter for unlimited use.

**Will the AI lie about my experience?**
No. Every AI call has explicit instructions to use only facts from your profile. JobFit will not invent metrics or claims you can't defend in an interview.

**Does it work for non-US jobs?**
Yes. JobFit works with any English-language job description. Pricing is in USD.

**Is the resume ATS-friendly?**
Yes. The output is plain-formatted, keyword-aligned with the JD, and exports to PDF that ATS systems parse cleanly.

**How is this different from just using ChatGPT?**
JobFit stores your verified profile once, scores fit before generating, has stricter anti-hallucination rules, and ships a complete document — not a back-and-forth prompt session.

**Can I cancel anytime?**
Yes. The billing portal lets Pro users cancel or manage their subscription at any time.

## Free tools (anonymous, no signup)

JobFit publishes two free, public tools that any user can access without an account:

### Job Description Keyword Extractor (${SITE_URL}/tools/job-description-keyword-extractor)

Paste any job description, get the keywords categorized into must-haves (hard requirements), nice-to-haves (bonuses), and soft skills. Each keyword comes with a one-sentence explanation of why it matters for the role. Used by job seekers to make sure their resume mirrors the language of the JD before applying.

### AI Resume Grader (${SITE_URL}/tools/resume-grader)

Paste a resume, get a letter grade (A+ through F) plus an overall 0-100 score, sub-scores on five dimensions (clarity, impact, ATS-readiness, action verbs, metrics), and three specific fixes — each tied to actual lines from the resume, not generic advice.

Both tools generate a shareable permalink at /tools/[tool]/r/[id] that contains the full result, viewable by anyone, indexed by search engines.

## Links

- Home: ${SITE_URL}/
- Free tools index: ${SITE_URL}/tools
- Job Description Keyword Extractor: ${SITE_URL}/tools/job-description-keyword-extractor
- AI Resume Grader: ${SITE_URL}/tools/resume-grader
- Contact: ${SITE_URL}/contact
- Privacy: ${SITE_URL}/privacy
`;

export async function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
