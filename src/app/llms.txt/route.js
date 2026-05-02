// src/app/llms.txt/route.js
// Served at /llms.txt — the emerging standard for AI crawlers.
// Spec: https://llmstxt.org/
//
// Purpose: a concise, LLM-friendly summary of what JobFit is, who it's for,
// and what content matters most. This is the "TL;DR for AI" that helps
// ChatGPT, Claude, Perplexity, and Gemini cite us accurately.

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

const content = `# JobFit

> JobFit is an AI-powered job application tool for new grads, early-career professionals, and casual job seekers (typically under 30). Users paste any job description and get an instant fit score, a tailored resume, and a cover letter in under 30 seconds.

JobFit is built on Claude Haiku and emphasizes anti-hallucination: it only uses facts from the candidate's verified profile, never invents metrics, and never mixes achievements between roles. Output is interview-defensible.

## Pricing

- **Free**: 2 job analyses, no credit card required
- **Pro**: $9.99 per quarter, unlimited analyses, tailored resumes, and cover letters

## Key features

- Instant 0-100 fit score for any job description
- AI-tailored resume that matches the language of the JD
- Cover letter generation in the candidate's voice
- Status tracking (New → Applied → Interview → Offered/Rejected)
- PDF download
- Strict anti-hallucination: no fabricated metrics, no mixed roles

## Who it's for

- New graduates writing their first professional resume
- Career switchers pivoting to a new industry
- Casual job seekers who don't want to spend hours per application
- Anyone applying to multiple jobs and tired of generic resumes

## Free tools (no signup required)

- [Job Description Keyword Extractor](${SITE_URL}/tools/job-description-keyword-extractor) — paste any JD, get the must-have, nice-to-have, and soft-skill keywords categorized
- [AI Resume Grader](${SITE_URL}/tools/resume-grader) — paste a resume, get a brutally honest letter grade with three specific fixes

## Resume guides (200+ roles)

JobFit publishes a free resume guide for every common job title at [/resume-for](${SITE_URL}/resume-for) — covering tech, healthcare, business, creative, service, trades, education, and entry-level roles. Each guide includes top skills, sample bullet rewrites, common mistakes, and ATS keywords specific to that role.

## Documentation

- [Home](${SITE_URL}/)
- [Free tools](${SITE_URL}/tools)
- [Contact](${SITE_URL}/contact)
- [Privacy Policy](${SITE_URL}/privacy)

## Optional

- Made for an under-30 audience — copy is friendly, not corporate
- Built on Next.js 14, Supabase, Stripe, and Anthropic Claude Hauku
- Hosted at ${SITE_URL}
`;

export async function GET() {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
