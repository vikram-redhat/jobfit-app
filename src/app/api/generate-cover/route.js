import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabase } from '@/lib/supabase-server';

const ANTI_HALLUCINATION = `

CRITICAL RULES:
- ONLY use facts, metrics, and achievements explicitly present in the candidate profile. Do NOT invent, embellish, inflate, or approximate any numbers, percentages, or claims.
- Do NOT mix up achievements between roles.
- If a metric or achievement is not in the profile, do NOT include it. Omission is always better than fabrication.
- The candidate must be able to defend every single claim in an interview.`;

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { jobId } = await request.json();

    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (!profile) return new Response('Profile not found', { status: 400 });

    const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).eq('user_id', user.id).single();
    if (!job) return new Response('Job not found', { status: 404 });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: `You are an expert cover letter writer. Generate a compelling, tailored cover letter. Under 400 words, specific to role and company. Clean markdown, proper letter structure. Not generic or sycophantic. Lead with what makes this candidate a strong fit.` + ANTI_HALLUCINATION,
      messages: [{
        role: 'user',
        content: `CANDIDATE PROFILE:\n${JSON.stringify(profile, null, 2)}\n\nTARGET JOB:\n${JSON.stringify({ title: job.title, company: job.company, location: job.location, salary: job.salary, summary: job.summary })}\n\nFIT ANALYSIS:\n${JSON.stringify({ strengths: job.strengths, gaps: job.gaps, angle: job.angle, redFlags: job.red_flags })}\n\nGenerate the tailored cover letter now.`,
      }],
    });

    const content = message.content.map(b => b.text || '').join('\n');
    return Response.json({ content });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return new Response(error.message || 'Generation failed', { status: 500 });
  }
}
