import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabase } from '@/lib/supabase-server';

const ANTI_HALLUCINATION = `
CRITICAL RULES:
- ONLY use facts, metrics, and achievements explicitly present in the candidate profile.
- Do NOT invent, embellish, inflate, or approximate any numbers, percentages, or claims.
- Do NOT mix up achievements between roles.
- If a metric or achievement is not in the profile, do NOT include it.
- The candidate must be able to defend every single claim in an interview.`;

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { jobDescription } = await request.json();
    if (!jobDescription?.trim()) return new Response('Job description required', { status: 400 });

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (!profile) return new Response('Profile not found. Complete onboarding first.', { status: 400 });

    // Paywall check
    const { data: setting } = await supabase.from('app_settings').select('value').eq('key', 'free_tier_limit').single();
    const freeTierLimit = parseInt(setting?.value ?? '2', 10);
    if (!profile.is_subscribed && (profile.analysis_count ?? 0) >= freeTierLimit) {
      return Response.json({ error: 'LIMIT_REACHED', limit: freeTierLimit }, { status: 402 });
    }

    const profileText = JSON.stringify(profile, null, 2);
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: `You are a job matching analyst. Extract job details from the provided job description and score the candidate's fit. Respond in valid JSON only, no markdown fences, no commentary. Structure:
{
  "job": { "title": "", "company": "", "location": "", "arrangement": "", "salary": "", "url": "", "summary": "" },
  "score": <0-100>,
  "verdict": "<Strong Match | Good Match | Moderate Match | Weak Match | Poor Match>",
  "strengths": ["<specific strength with evidence>"],
  "gaps": ["<specific gap>"],
  "angle": "<positioning strategy, 2-3 sentences>",
  "redFlags": ["<concerns>"],
  "keyRequirements": [{"requirement": "", "met": true/false, "evidence": ""}]
}
${ANTI_HALLUCINATION}`,
      messages: [{
        role: 'user',
        content: `CANDIDATE PROFILE:\n${profileText}\n\nFULL JOB DESCRIPTION:\n${jobDescription}`,
      }],
    });

    const raw = message.content.map(b => b.text || '').join('\n');
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Increment usage count
    await supabase.from('profiles').update({
      analysis_count: (profile.analysis_count ?? 0) + 1,
    }).eq('user_id', user.id);

    return Response.json(parsed);
  } catch (error) {
    console.error('Analyze error:', error);
    return new Response(error.message || 'Analysis failed', { status: 500 });
  }
}
