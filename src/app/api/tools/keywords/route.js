// src/app/api/tools/keywords/route.js
// Anonymous endpoint backing /tools/job-description-keyword-extractor.
// POST: accepts { jd: string }, returns { id, result, displayTitle }.
//
// Strategy:
//   1. Rate-limit by IP — 10/hour, no auth required.
//   2. Sanitize input — strip prompt-injection lines, cap length.
//   3. Call Claude Haiku with a strict JSON-output prompt.
//   4. Persist result to tool_results so we get a shareable, indexable URL.

import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabase } from '@/lib/supabase-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/ai-guard';

const SYSTEM_PROMPT = `You are an expert recruiter extracting the keywords that hiring managers and ATS systems actually look for in a job description.

You will return ONLY valid JSON (no prose, no markdown, no code fences) matching this exact shape:

{
  "displayTitle": "<8 words max — e.g. 'Senior Marketing Coordinator at Spotify' or 'Backend Engineer (remote)'>",
  "company": "<company name if present, else null>",
  "role": "<role title>",
  "mustHave": [{ "keyword": "<term>", "why": "<one sentence>" }],
  "niceToHave": [{ "keyword": "<term>", "why": "<one sentence>" }],
  "softSkills": [{ "keyword": "<term>", "why": "<one sentence>" }],
  "summary": "<2-3 sentences capturing the role in plain English for a casual job seeker>"
}

RULES:
- mustHave: 5-8 items. The hard requirements — explicit skills, tools, years of experience, degrees.
- niceToHave: 3-6 items. Things mentioned as bonuses, preferred, or "would be great if".
- softSkills: 2-4 items. Communication, collaboration, leadership-style traits.
- "why" fields: explain why this matters for the role in plain English. ~12 words.
- Use the words from the JD verbatim where possible — these are the exact strings the candidate's resume should mirror.
- If something isn't in the JD, do not invent it. Better to return fewer items than to fabricate.
- Output JSON only. No markdown. No commentary.`;

export async function POST(request) {
  try {
    // 1. Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, { max: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return Response.json(
        { error: `Too many requests. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    // 2. Parse + sanitize
    const body = await request.json().catch(() => ({}));
    const guarded = sanitizeInput(body.jd, { kind: 'job description' });
    if (!guarded.ok) {
      return Response.json({ error: guarded.error }, { status: 400 });
    }

    // 3. Call Claude
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `JOB DESCRIPTION:\n\n${guarded.text}\n\nReturn the JSON now.` },
      ],
    });

    const raw = message.content.map((b) => b.text || '').join('');
    let parsed;
    try {
      // Be tolerant of stray ```json fences in case the model slips up
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Keyword extractor: bad JSON from model:', raw.slice(0, 400));
      return Response.json({ error: 'Could not parse the job description. Try again with cleaner text.' }, { status: 502 });
    }

    // 4. Persist (anon RLS allows insert; we don't store the full JD)
    const supabase = createServerSupabase();
    const { data: row, error: dbError } = await supabase
      .from('tool_results')
      .insert({
        tool: 'keywords',
        display_title: parsed.displayTitle?.slice(0, 120) || 'Job description',
        result: parsed,
        input_excerpt: guarded.text.slice(0, 200),
      })
      .select('id')
      .single();

    if (dbError) {
      // Don't fail the user — return the result without a permalink.
      console.error('Keyword extractor: DB insert failed:', dbError.message);
      return Response.json({ id: null, result: parsed, displayTitle: parsed.displayTitle });
    }

    return Response.json({ id: row.id, result: parsed, displayTitle: parsed.displayTitle });
  } catch (error) {
    console.error('Keyword extractor error:', error);
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
