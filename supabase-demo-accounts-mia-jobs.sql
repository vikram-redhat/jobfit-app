-- Fix for Mia's jobs -- run this after supabase-demo-accounts.sql if it failed at Mia's jobs

INSERT INTO public.jobs (
  id, user_id, title, company, location, arrangement, salary,
  summary, score, verdict, strengths, gaps, angle, red_flags,
  key_requirements, status, applied_date, resume, cover_letter, raw_input
) VALUES
(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  '33333333-3333-3333-3333-333333333333',
  'Customer Success Associate',
  'HubSpot',
  'Melbourne, VIC',
  'Hybrid',
  '$62,000 – $68,000',
  'Entry-level customer success role supporting SMB clients through onboarding, product adoption, and retention. Heavy focus on relationship management and communication.',
  79,
  'Good Match',
  '["Exceptional customer service background with proven conflict resolution","Supervisory experience demonstrates leadership maturity","Google Workspace proficiency matches their internal tools","Friendly, communication-first background is core to the role"]'::jsonb,
  '["No SaaS or tech product experience","No CRM tool experience (HubSpot itself)","No formal customer success metrics experience (NPS, churn etc.)"]'::jsonb,
  'Your hospitality background is actually a strength here — customer success is fundamentally about making people feel looked after. Position your shift supervision and complaint resolution experience as evidence you can manage difficult client situations with grace.',
  '[]'::jsonb,
  '[{"requirement":"Customer-facing experience","met":true,"evidence":"5+ years in hospitality and supervision"},{"requirement":"Strong communication skills","met":true,"evidence":"Managed team of 5, handled function bookings, resolved complaints"},{"requirement":"CRM / HubSpot experience","met":false,"evidence":"No CRM tools mentioned"},{"requirement":"SaaS or tech background","met":false,"evidence":"No tech industry experience"},{"requirement":"Google Workspace","met":true,"evidence":"Listed in skills"}]'::jsonb,
  'Applied',
  '2026-03-22',
  'Mia Patel
Melbourne, VIC | mia@jobfit.today

OBJECTIVE
Customer-focused team leader with 5+ years in high-pressure service environments, seeking to apply proven relationship management skills in a customer success role.

EDUCATION
Certificate III in Business Administration — TAFE Victoria, 2022

EXPERIENCE

Senior Barista & Shift Supervisor — Café Mondello, Melbourne
Jun 2021 – Present
• Supervised a team of 5 staff across busy weekend shifts
• Managed supplier relationships, weekly stock orders, and inventory reconciliation
• Resolved customer complaints professionally, maintaining a 4.8-star Google rating
• Trained new front-of-house staff in service standards and POS systems

Waitress — The Continental Hotel, Melbourne
Jan 2020 – May 2021
• Coordinated large function bookings for up to 120 covers
• Processed payments and managed end-of-night cash and EFTPOS reconciliation
• Trained incoming staff and supported floor supervisors during peak service

SKILLS
Customer Relations: Conflict resolution, Client communication, Complaint handling
Admin: Microsoft Excel & Word, Google Workspace, Scheduling
Leadership: Team supervision, Staff training, Rostering',
  'Dear HubSpot Team,

I''ll be honest — I haven''t worked in tech before. But I''ve spent five years making sure people feel genuinely looked after, and I think that''s exactly what customer success is about.

As a shift supervisor at Café Mondello, I manage a team, handle difficult customers, and keep things running smoothly when the pressure is on. I''ve maintained a 4.8 Google rating not by accident, but by making every interaction count. That''s the same instinct I''d bring to supporting your clients.

I''ve completed my Certificate III in Business Administration, I''m comfortable with Google Workspace, and I''m a fast learner when it comes to new tools. I''m genuinely excited about the idea of building long-term relationships with clients in a role where my communication skills can really make a difference.

I''d love the opportunity to show you what I can do.

Warm regards,
Mia Patel',
  'Customer Success Associate at HubSpot Melbourne'
),
(
  'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
  '33333333-3333-3333-3333-333333333333',
  'Administration Assistant',
  'Medibank',
  'Melbourne, VIC',
  'On-site',
  '$55,000 – $60,000',
  'Admin support role within Medibank''s operations team, handling correspondence, scheduling, data entry, and general office coordination.',
  85,
  'Strong Match',
  '["Business Administration certification is a direct match","Excel and Word proficiency aligns with role requirements","Organisational skills demonstrated through stock management and scheduling","Reliable, on-site preference matches the role"]'::jsonb,
  '["No corporate office environment experience","No experience with health insurance or financial systems"]'::jsonb,
  'Your TAFE qualification and hands-on admin experience managing orders, rosters, and reconciliations make you a strong fit. Emphasise your reliability and attention to detail — qualities Medibank will value in an admin role.',
  '[]'::jsonb,
  '[{"requirement":"Business admin qualification","met":true,"evidence":"Cert III in Business Administration"},{"requirement":"Microsoft Office proficiency","met":true,"evidence":"Excel and Word listed in skills"},{"requirement":"Scheduling and coordination","met":true,"evidence":"Managed rosters and supplier scheduling at Café Mondello"},{"requirement":"Corporate office experience","met":false,"evidence":"All experience is in hospitality settings"}]'::jsonb,
  'Interview',
  '2026-03-10',
  null,
  null,
  'Administration Assistant at Medibank Melbourne'
),
(
  'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
  '33333333-3333-3333-3333-333333333333',
  'Office Coordinator',
  'CBRE',
  'Melbourne, VIC',
  'On-site',
  '$60,000 – $65,000',
  'Office coordination role supporting CBRE''s Melbourne property team with scheduling, vendor management, visitor reception, and general operations support.',
  77,
  'Good Match',
  '["Supplier and vendor coordination experience from café management","Front-of-house reception skills transferable to corporate reception","Strong multitasking and organisational ability","On-site preference is a plus"]'::jsonb,
  '["No formal property or corporate real estate exposure","No experience with office management software"]'::jsonb,
  'Your experience running the operational side of a busy café — suppliers, scheduling, stock, and people — maps well to an office coordinator role. Property is just the context; the skills are the same.',
  '[]'::jsonb,
  '[{"requirement":"Coordination and scheduling","met":true,"evidence":"Managed rosters, supplier orders, and bookings"},{"requirement":"Vendor / supplier management","met":true,"evidence":"Handled supplier relationships at Café Mondello"},{"requirement":"Professional communication","met":true,"evidence":"Managed client complaints and large event bookings"},{"requirement":"Property industry experience","met":false,"evidence":"No property background"}]'::jsonb,
  'New',
  null,
  null,
  null,
  'Office Coordinator at CBRE Melbourne'
);
