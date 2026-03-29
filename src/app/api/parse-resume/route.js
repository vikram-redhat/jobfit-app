import Anthropic from '@anthropic-ai/sdk';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const formData = await request.formData();
    const file = formData.get('resume');
    if (!file) return new Response('No file uploaded', { status: 400 });
    if (file.type !== 'application/pdf') return new Response('Only PDF files are supported', { status: 400 });
    if (file.size > 5 * 1024 * 1024) return new Response('File too large (max 5MB)', { status: 400 });

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Extract information from this resume and return ONLY a valid JSON object with no markdown, no explanation, no code fences.

Schema:
{
  "full_name": "string",
  "email": "string",
  "location": "string (city, state/country)",
  "education": "string (e.g. Bachelor of Commerce — University of Queensland)",
  "experience": [
    {
      "title": "string (job title)",
      "company": "string (company name)",
      "dates": "string (e.g. Jan 2022 – Present)",
      "achievements": "string (key responsibilities and achievements as plain text, not bullet points)"
    }
  ],
  "skills": "string (comma-separated list)",
  "target_roles": "string (comma-separated, inferred from most recent roles)"
}

Rules:
- Only include information explicitly present in the resume — never invent anything
- List experience in reverse chronological order (most recent first)
- For education, combine degree and institution into one string
- Return valid JSON only`,
          },
        ],
      }],
    });

    const raw = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON if Claude wrapped it despite instructions
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return new Response('Failed to parse resume — try entering your profile manually', { status: 422 });
      parsed = JSON.parse(match[0]);
    }

    return Response.json(parsed);
  } catch (e) {
    console.error('parse-resume error:', e);
    return new Response(e.message || 'Something went wrong', { status: 500 });
  }
}
