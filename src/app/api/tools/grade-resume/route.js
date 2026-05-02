// src/app/api/tools/grade-resume/route.js
// Anonymous endpoint backing /tools/resume-grader.
// POST: accepts { resume: string }, returns { id, result, displayTitle }.

import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabase } from '@/lib/supabase-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/ai-guard';

const SYSTEM_PROMPT = `You are a brutally honest but fair resume reviewer. You critique resumes like a senior hiring manager would. You will return ONLY valid JSON (no prose, no markdown, no code fences) matching this exact shape:

{
  "displayTitle": "<8 words max — e.g. 'Software Engineer resume' or 'New grad marketing resume'>",
  "overallGrade": "<one of: A+, A, A-, B+, B, B-, C+, C, C-, D, F>",
  "overallScore": <integer 0-100>,
  "oneLineVerdict": "<one sentence — e.g. 'Strong on impact, weak on metrics.'>",
  "scores": {
    "clarity":        { "score": <0-100>, "note": "<one sentence>" },
    "impact":         { "score": <0-100>, "note": "<one sentence>" },
    "atsReadiness":   { "score": <0-100>, "note": "<one sentence>" },
    "actionVerbs":    { "score": <0-100>, "note": "<one sentence>" },
    "metrics":        { "score": <0-100>, "note": "<one sentence>" }
  },
  "topFixes": [
    { "title": "<short, imperative — e.g. 'Quantify your bullets'>", "detail": "<2-3 sentences explaining what to do, with an example based on the resume>" }
  ],
  "strengths": ["<short bullet>", "<short bullet>", "<short bullet>"]
}

RULES:
- Be honest. New grads, casual job seekers, and career switchers benefit MORE from real critique than from flattery. Don't soften scores below what's deserved.
- topFixes: 3 items. Each must reference something specific from THE ACTUAL resume — not generic advice.
- Do NOT invent metrics, dates, or claims that aren't in the resume. If you suggest adding a metric, frame it as "consider adding a metric like X" not "you achieved X".
- displayTitle: derive from the resume's most recent role or target role. Don't include the candidate's real name — privacy.
- Output JSON only.`;

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(ip, { max: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.ok) {
      return Response.json(
        { error: `Too many requests. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const guarded = sanitizeInput(body.resume, { kind: 'resume' });
    if (!guarded.ok) {
      return Response.json({ error: guarded.error }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `RESUME:\n\n${guarded.text}\n\nReturn the JSON now.` },
      ],
    });

    const raw = message.content.map((b) => b.text || '').join('');
    let parsed;
    try {
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Resume grader: bad JSON from model:', raw.slice(0, 400));
      return Response.json({ error: 'Could not parse the resume. Try again with cleaner text.' }, { status: 502 });
    }

    const supabase = createServerSupabase();
    const { data: row, error: dbError } = await supabase
      .from('tool_results')
      .insert({
        tool: 'resume-grader',
        display_title: parsed.displayTitle?.slice(0, 120) || 'Resume',
        result: parsed,
        input_excerpt: guarded.text.slice(0, 200),
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('Resume grader: DB insert failed:', dbError.message);
      return Response.json({ id: null, result: parsed, displayTitle: parsed.displayTitle });
    }

    return Response.json({ id: row.id, result: parsed, displayTitle: parsed.displayTitle });
  } catch (error) {
    console.error('Resume grader error:', error);
    return Response.json({ error: 'Something went wrong. Try again.' }, { status: 500 });
  }
}
