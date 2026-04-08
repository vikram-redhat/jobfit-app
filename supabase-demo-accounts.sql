-- JobFit Demo Accounts
-- Run in Supabase Dashboard > SQL Editor
-- Creates 3 demo users with profiles and jobs for advertising videos
-- To clean up: delete the 3 users from Supabase Auth dashboard (cascades automatically)

-- ============================================================
-- STEP 1: Create auth users
-- ============================================================
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'jess@jobfit.today',
  crypt('DemoPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', false, 'authenticated', 'authenticated'
),
(
  '22222222-2222-2222-2222-222222222222',
  'liam@jobfit.today',
  crypt('DemoPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', false, 'authenticated', 'authenticated'
),
(
  '33333333-3333-3333-3333-333333333333',
  'mia@jobfit.today',
  crypt('DemoPass123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{}', false, 'authenticated', 'authenticated'
);

-- ============================================================
-- STEP 2: Profiles
-- ============================================================
INSERT INTO public.profiles (
  user_id, full_name, email, location, education,
  experience, skills, target_roles, work_arrangement,
  contract_perm, salary_floor, industry_pref, analysis_count
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Jess Nguyen',
  'jess@jobfit.today',
  'Brisbane, QLD',
  'Bachelor of Business (Marketing) — QUT, 2nd year',
  '[
    {"title":"Sales Assistant","company":"Target","dates":"Mar 2022 – Present","achievements":"Consistently hit weekly sales targets, trained 4 new team members, managed fitting room and stockroom during peak periods including Christmas"},
    {"title":"Barista","company":"Zarraffa''s Coffee","dates":"Nov 2021 – Feb 2022","achievements":"Prepared high-volume orders during morning rush, maintained 5-star customer satisfaction, handled cash and EFTPOS"}
  ]'::jsonb,
  'Customer service, Visual merchandising, Microsoft Office, Canva, Instagram, TikTok, Cash handling, Team coordination, Retail POS systems',
  'Marketing Coordinator, Marketing Assistant, Retail Supervisor, Brand Ambassador',
  'Hybrid preferred',
  'Open to either',
  '$25/hour',
  'Marketing, Retail, Fashion, Media',
  3
),
(
  '22222222-2222-2222-2222-222222222222',
  'Liam Chen',
  'liam@jobfit.today',
  'Sydney, NSW',
  'Bachelor of Information Technology — UTS, Graduated 2023',
  '[
    {"title":"IT Helpdesk Analyst","company":"Optus","dates":"Jan 2023 – Present","achievements":"Resolved average 40+ tickets per day, reduced average resolution time by 18% through documentation of common fixes, onboarded and mentored 2 new helpdesk staff"},
    {"title":"Junior Web Developer (Intern)","company":"Freelance / University Projects","dates":"2022","achievements":"Built 3 small business websites using HTML, CSS, JavaScript and React, collaborated with design students on UI mockups"}
  ]'::jsonb,
  'JavaScript, React, Python, HTML/CSS, SQL, Git, AWS basics, JIRA, Windows/Mac/Linux, Networking fundamentals, Troubleshooting, Technical writing',
  'Junior Developer, Frontend Developer, Software Engineer, IT Support Engineer',
  'Hybrid preferred',
  'Permanent only',
  '$70,000/year',
  'Tech, Software, Finance, Startups',
  4
),
(
  '33333333-3333-3333-3333-333333333333',
  'Mia Patel',
  'mia@jobfit.today',
  'Melbourne, VIC',
  'Certificate III in Business Administration — TAFE Victoria, 2022',
  '[
    {"title":"Senior Barista / Shift Supervisor","company":"Café Mondello","dates":"Jun 2021 – Present","achievements":"Managed a team of 5 during weekend shifts, handled supplier orders and weekly stock counts, resolved customer complaints and maintained 4.8 Google rating"},
    {"title":"Waitress","company":"The Continental Hotel","dates":"Jan 2020 – May 2021","achievements":"Handled large function bookings up to 120 covers, trained new front-of-house staff, processed payments and managed end-of-night reconciliation"}
  ]'::jsonb,
  'Customer service, Team leadership, Conflict resolution, Microsoft Word & Excel, Google Workspace, Scheduling, Cash handling, POS systems, Multitasking under pressure, Communication',
  'Customer Success, Admin Assistant, Office Coordinator, Operations Assistant',
  'On-site only',
  'Open to either',
  '$28/hour',
  'Business services, Healthcare admin, Property, Customer success',
  3
);

-- ============================================================
-- STEP 3: Jobs for Jess
-- ============================================================
INSERT INTO public.jobs (
  id, user_id, title, company, location, arrangement, salary,
  summary, score, verdict, strengths, gaps, angle, red_flags,
  key_requirements, status, applied_date, resume, cover_letter, raw_input
) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Marketing Assistant',
  'Culture Kings',
  'Brisbane, QLD',
  'On-site',
  '$55,000 – $60,000',
  'Entry-level marketing role supporting the brand team with social content, influencer coordination, and campaign reporting for one of Australia''s biggest streetwear brands.',
  82,
  'Strong Match',
  '["Hands-on social media experience with Instagram and TikTok aligns perfectly","Customer-facing retail background gives real insight into the target audience","Canva proficiency matches their in-house content creation workflow","Currently studying Business (Marketing) — directly relevant"]'::jsonb,
  '["No formal campaign management experience yet","Limited analytics/reporting background","No influencer relationship experience mentioned"]'::jsonb,
  'Position yourself as someone who lives and breathes the Culture Kings customer — you''re not just a marketing student, you''re a young person who understands streetwear culture from the shop floor. Lead with your TikTok and Instagram skills and your retail experience as a real-world lens on the brand''s audience.',
  '["Fast-paced environment may be overwhelming without prior agency or marketing team experience"]'::jsonb,
  '[{"requirement":"Social media content creation","met":true,"evidence":"Instagram and TikTok listed in skills, Canva proficient"},{"requirement":"Marketing qualification or studying","met":true,"evidence":"Currently studying B. Business (Marketing) at QUT"},{"requirement":"Retail or brand experience","met":true,"evidence":"2+ years at Target in customer-facing sales role"},{"requirement":"Campaign reporting / analytics","met":false,"evidence":"No analytics tools mentioned in profile"}]'::jsonb,
  'Applied',
  '2026-03-28',
  'Jess Nguyen
Brisbane, QLD | jess@jobfit.today

OBJECTIVE
Marketing student and retail professional with 3+ years of customer-facing experience seeking to bring real-world brand understanding to the Culture Kings marketing team.

EDUCATION
Bachelor of Business (Marketing) — QUT
Currently in 2nd year | Expected graduation 2026

EXPERIENCE

Sales Assistant — Target, Brisbane
Mar 2022 – Present
• Consistently achieved weekly sales targets in a high-volume retail environment
• Trained and onboarded 4 new team members in product knowledge and customer service
• Created TikTok content for personal brand reaching 2,400 followers
• Managed visual merchandising during promotional periods including Christmas and EOFY

Barista — Zarraffa''s Coffee
Nov 2021 – Feb 2022
• Delivered fast, high-quality service during peak morning rushes
• Maintained consistent 5-star customer satisfaction scores
• Processed cash and EFTPOS transactions accurately

SKILLS
Social Media: Instagram, TikTok, Canva
Retail: POS Systems, Visual Merchandising, Stock Management
Soft Skills: Customer Service, Team Coordination, Communication',
  'Dear Culture Kings Marketing Team,

I am applying for the Marketing Assistant role with genuine excitement — as someone who has spent the last few years on the shop floor of Australian retail, I understand your customer in a way most marketing graduates don''t.

Working at Target while studying my Business (Marketing) degree at QUT has given me a front-row seat to what drives young Australians to buy. I''ve seen what stops someone mid-scroll and what makes them walk into a store. I create content on TikTok and Instagram in my own time, and I''m fluent in Canva and the tools your team uses daily.

I''m hardworking, I show up, and I''m hungry to learn from a brand that has built something genuinely iconic in Australian streetwear. I''d love the chance to bring that energy to your team.

Thanks for your time,
Jess Nguyen',
  'Marketing Assistant role at Culture Kings Brisbane'
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Retail Supervisor',
  'Glue Store',
  'Brisbane CBD, QLD',
  'On-site',
  '$58,000 + super',
  'Supervisory role overseeing a small team of retail staff, managing daily operations, and driving sales performance in a youth fashion environment.',
  74,
  'Good Match',
  '["Direct retail supervision experience from Target","Strong customer service record","Team training and onboarding experience"]'::jsonb,
  '["No prior supervisor title — was a senior sales assistant","Limited KPI and roster management experience"]'::jsonb,
  'Emphasise the informal leadership you already demonstrate at Target — training staff, managing periods without a supervisor present. Frame it as already doing the job without the title.',
  '[]'::jsonb,
  '[{"requirement":"Retail experience","met":true,"evidence":"3+ years at Target"},{"requirement":"Team leadership","met":true,"evidence":"Trained 4 new team members"},{"requirement":"Fashion industry knowledge","met":true,"evidence":"Works in fashion retail, studies marketing"},{"requirement":"Formal supervisory experience","met":false,"evidence":"No supervisor title held yet"}]'::jsonb,
  'Interview',
  '2026-03-15',
  null,
  null,
  'Retail Supervisor role at Glue Store Brisbane CBD'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'Brand Ambassador',
  'L''Oréal Australia',
  'Brisbane, QLD',
  'Casual / Event-based',
  '$32/hour',
  'Casual brand ambassador role representing L''Oréal at retail activations, pop-up events, and in-store promotions across Brisbane.',
  91,
  'Strong Match',
  '["Retail customer engagement experience is a perfect fit","Social media skills directly relevant to brand ambassador role","Outgoing personality evident from customer service background","Flexible casual availability suits event-based work"]'::jsonb,
  '["No prior brand ambassador experience — minor gap"]'::jsonb,
  'You are exactly who they are looking for. Lead with your ability to engage strangers, drive sales through conversation, and represent a brand authentically. Your TikTok presence is a bonus worth mentioning.',
  '[]'::jsonb,
  '[{"requirement":"Customer engagement / sales","met":true,"evidence":"3+ years retail, consistently hit sales targets"},{"requirement":"Presentable and brand-aligned","met":true,"evidence":"Works in fashion retail, active on social media"},{"requirement":"Flexible availability","met":true,"evidence":"Casual worker, open to flexible arrangements"},{"requirement":"Social media presence","met":true,"evidence":"Instagram and TikTok skills, personal content creation"}]'::jsonb,
  'New',
  null,
  null,
  null,
  'Brand Ambassador casual role L''Oréal Australia Brisbane'
);

-- ============================================================
-- STEP 4: Jobs for Liam
-- ============================================================
INSERT INTO public.jobs (
  id, user_id, title, company, location, arrangement, salary,
  summary, score, verdict, strengths, gaps, angle, red_flags,
  key_requirements, status, applied_date, resume, cover_letter, raw_input
) VALUES
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '22222222-2222-2222-2222-222222222222',
  'Junior Frontend Developer',
  'Canva',
  'Sydney, NSW',
  'Hybrid',
  '$75,000 – $90,000',
  'Junior developer role on Canva''s growth team, building and maintaining React components, collaborating with designers, and contributing to A/B testing infrastructure.',
  68,
  'Good Match',
  '["React experience from university projects aligns with their stack","IT degree from UTS is relevant","Problem-solving skills demonstrated through helpdesk role","Git proficiency matches their engineering workflow"]'::jsonb,
  '["No production-scale React experience — only university projects","No TypeScript mentioned","No testing experience (Jest, Cypress etc.)","Canva works at significant scale — junior may find it a stretch"]'::jsonb,
  'Be upfront that your React experience is project-based but frame the scale of your helpdesk problem-solving as evidence you can handle complexity under pressure. Show enthusiasm for Canva''s product specifically — you likely use it.',
  '["Role may be more senior in practice than the title suggests"]'::jsonb,
  '[{"requirement":"React","met":true,"evidence":"Built projects using React at university"},{"requirement":"JavaScript proficiency","met":true,"evidence":"Listed as core skill"},{"requirement":"TypeScript","met":false,"evidence":"Not mentioned in profile"},{"requirement":"Testing frameworks","met":false,"evidence":"No testing tools listed"},{"requirement":"Git / version control","met":true,"evidence":"Git listed in skills"}]'::jsonb,
  'Applied',
  '2026-04-01',
  'Liam Chen
Sydney, NSW | liam@jobfit.today

EDUCATION
Bachelor of Information Technology — UTS
Graduated 2023

EXPERIENCE

IT Helpdesk Analyst — Optus, Sydney
Jan 2023 – Present
• Resolve 40+ technical support tickets daily across hardware, software, and network issues
• Reduced average ticket resolution time by 18% by creating internal documentation for recurring issues
• Onboarded and mentored 2 new helpdesk analysts
• Collaborate cross-functionally with infrastructure and security teams

Junior Web Developer — Freelance / University Projects
2022
• Developed 3 responsive websites for small businesses using React, HTML/CSS, and JavaScript
• Integrated third-party APIs including payment gateways and Google Maps
• Collaborated with design students to translate Figma mockups into working interfaces

SKILLS
Languages: JavaScript, Python, HTML/CSS, SQL
Frameworks: React
Tools: Git, AWS (basics), JIRA, VS Code
Systems: Windows, macOS, Linux
Other: Technical writing, Networking fundamentals, Troubleshooting',
  'Dear Canva Hiring Team,

I''m applying for the Junior Frontend Developer role because Canva is genuinely one of the products I use and admire — and because I believe my background sits at an interesting intersection of technical problem-solving and user empathy.

My IT degree from UTS gave me a strong foundation in JavaScript and React, which I applied in real projects for small businesses. Since graduating, I''ve been working as a Helpdesk Analyst at Optus where I''ve sharpened my ability to diagnose complex problems quickly, communicate clearly under pressure, and build systems that help teams work smarter.

I''m ready to make the move into a development role and bring the same rigour I apply to support into building great frontend experiences. I''d be thrilled to contribute to a product that millions of people use every day.

Thanks for considering my application,
Liam Chen',
  'Junior Frontend Developer at Canva Sydney'
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '22222222-2222-2222-2222-222222222222',
  'IT Support Engineer',
  'Atlassian',
  'Sydney, NSW',
  'Hybrid',
  '$72,000 – $80,000',
  'Internal IT support role managing Atlassian''s corporate tech stack, onboarding new employees, and handling escalations from the helpdesk team.',
  88,
  'Strong Match',
  '["Current helpdesk experience is a direct match","JIRA experience is highly relevant given it''s an Atlassian product","Team mentoring experience aligns with onboarding responsibilities","Strong documentation skills demonstrated at Optus"]'::jsonb,
  '["May be seen as a lateral move rather than career progression"]'::jsonb,
  'Frame this as a strategic stepping stone — working inside Atlassian''s IT team exposes you to enterprise-scale systems and gives you a platform to move into a developer role internally. Show you know the product suite deeply.',
  '[]'::jsonb,
  '[{"requirement":"Helpdesk or IT support experience","met":true,"evidence":"1+ year at Optus handling 40+ tickets/day"},{"requirement":"JIRA / Atlassian tools","met":true,"evidence":"JIRA listed in skills"},{"requirement":"Onboarding experience","met":true,"evidence":"Mentored 2 new analysts at Optus"},{"requirement":"Cross-platform support (Win/Mac/Linux)","met":true,"evidence":"All three listed in skills"}]'::jsonb,
  'New',
  null,
  null,
  null,
  'IT Support Engineer role at Atlassian Sydney'
),
(
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '22222222-2222-2222-2222-222222222222',
  'Software Engineer (Graduate)',
  'Commonwealth Bank',
  'Sydney, NSW',
  'Hybrid',
  '$80,000 – $85,000',
  'Graduate software engineering program at CBA, rotating across engineering teams with a focus on Python backend development and internal tooling.',
  55,
  'Moderate Match',
  '["Python experience matches their primary backend language","IT degree satisfies graduate program requirements","Analytical thinking demonstrated through helpdesk work"]'::jsonb,
  '["No backend or API development experience beyond basics","No financial services background","Graduate programs are highly competitive — limited experience may be a barrier","No mentions of testing, CI/CD, or agile methodology"]'::jsonb,
  'Lean into your Python skills and the analytical rigour of your helpdesk work. Be honest that you''re a builder in progress — grad programs expect that. Research CBA''s tech initiatives (they''ve invested heavily in cloud) and reference them specifically.',
  '["Highly competitive graduate intake — strong academic record helps"]'::jsonb,
  '[{"requirement":"Python","met":true,"evidence":"Listed as core skill"},{"requirement":"Computer science or IT degree","met":true,"evidence":"B. IT from UTS"},{"requirement":"Backend / API experience","met":false,"evidence":"Only frontend project work mentioned"},{"requirement":"Agile / SDLC knowledge","met":false,"evidence":"Not mentioned in profile"}]'::jsonb,
  'Rejected',
  '2026-02-20',
  null,
  null,
  'Graduate Software Engineer at Commonwealth Bank'
);

-- ============================================================
-- STEP 5: Jobs for Mia
-- ============================================================
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
