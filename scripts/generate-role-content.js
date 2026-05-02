#!/usr/bin/env node
/**
 * scripts/generate-role-content.js
 *
 * Generates content/roles/<slug>.json for every role in content/roles.json
 * that doesn't already have a cache file.
 *
 * Idempotent: re-runs are free unless cache files are deleted.
 * Parallel: runs CONCURRENCY requests in flight at once (default 6).
 * Resumable: each role writes its own file, so a crash halfway leaves the
 *            partial state intact and the next run continues.
 *
 * Usage:
 *   node scripts/generate-role-content.js                # generate missing
 *   node scripts/generate-role-content.js --only=barista # generate one
 *   node scripts/generate-role-content.js --regenerate=software-engineer
 *   node scripts/generate-role-content.js --status       # show coverage
 *   node scripts/generate-role-content.js --limit=5      # smoke test
 *
 * Requires: ANTHROPIC_API_KEY in env (or .env.local).
 */

const fs = require('fs');
const path = require('path');

// Load .env.local manually so we don't need a dotenv dependency
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  });
}

const Anthropic = require('@anthropic-ai/sdk').default || require('@anthropic-ai/sdk');

const ROOT = path.join(__dirname, '..');
const ROLES_PATH = path.join(ROOT, 'content', 'roles.json');
const CACHE_DIR = path.join(ROOT, 'content', 'roles');
const MODEL = 'claude-haiku-4-5-20251001';
const CONCURRENCY = 6;

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2).reduce((acc, a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) acc[m[1]] = m[2] === undefined ? true : m[2];
  return acc;
}, {});

// ---- prompts --------------------------------------------------------------
// Two flavors of the system prompt:
//  - ROLE_SYSTEM_PROMPT: for job-title roles (software-engineer, barista, …).
//    Frames content around "what hiring managers look for in this role".
//  - SITUATION_SYSTEM_PROMPT: for life-situation guides (after-layoff,
//    first-job-no-experience, returning-to-work-after-kids, …). Frames
//    content around the *moment* and emotional reality of the searcher.
// Both produce the same JSON schema so the page template renders either.

const ROLE_SYSTEM_PROMPT = `You are an expert resume coach writing reference content for a programmatic SEO page about a specific job role. Your output is read by job seekers (often new grads, casual job seekers, or career switchers under 30) and by AI search engines.

You will return ONLY valid JSON (no prose, no markdown fences) matching this exact shape:

{
  "metaTitle": "<55-65 char title for the <title> tag — must include the role name and 'Resume'>",
  "metaDescription": "<145-160 char meta description that promises actionable resume help for this role>",
  "h1": "<the page's H1 — should match search intent for '<role> resume'>",
  "intro": "<2-3 sentence intro para that hooks the reader. Plain English, friendly tone.>",
  "audience": "<one sentence describing who's typically reading this — e.g. 'Recent grads applying to first dev jobs and career switchers from adjacent fields.'>",
  "topSkills": [
    { "name": "<skill or keyword>", "why": "<one sentence on why hiring managers look for this for this role>" }
    // 8-10 items, ordered by importance
  ],
  "sampleBullets": [
    { "weak": "<weak/generic version of a resume bullet for this role>", "strong": "<rewritten, metric-aware, action-verb version>", "lesson": "<one sentence on what made it stronger>" }
    // exactly 3 items
  ],
  "commonMistakes": [
    { "mistake": "<short heading>", "fix": "<one sentence on what to do instead>" }
    // 4-5 items, specific to this role
  ],
  "structureTips": [
    "<one tip on how to structure a resume for this role — e.g. lead with X, put Y above Z>"
    // 3-4 items
  ],
  "atsKeywords": ["<exact phrase 1>", "<exact phrase 2>"],
  "salarySignal": "<one sentence about typical salary range or compensation signal for this role in the US, vague enough to stay accurate (e.g. 'Entry-level US salaries typically range from $X to $Y in 2026.'). If unsure, say 'Salary varies widely by region and company.'>",
  "faq": [
    { "q": "<question phrased the way a job seeker would Google it>", "a": "<2-3 sentences, concrete>" }
    // 5 items
  ]
}

WRITING RULES:
- Friendly tone, not corporate. Audience is under-30 casual job seekers.
- Concrete > generic. Always reference the specific role; never write content that could apply to any job.
- No fabricated metrics. In sample bullets, you can use placeholder ranges like 'reduced page load by 30-50%' — phrasings that signal "fill in your real number" without inventing one.
- atsKeywords: 6-10 verbatim phrases hiring managers search for. Use the exact strings the candidate's resume should mirror.
- Output JSON ONLY. No markdown fences, no commentary.`;

const SITUATION_SYSTEM_PROMPT = `You are a compassionate, practical resume coach writing reference content for a programmatic SEO page about a specific *life situation* (not a job title) — for example "Your First Resume (No Experience)", "Returning to Work After Raising Kids", "After a Layoff", "Career Change at 50", "Veteran Transitioning to Civilian Work".

Your audience came here often anxious or self-doubting. They Googled their situation in plain words because most resume advice doesn't fit them. Your tone is warm, direct, never patronizing. Practical advice over generic encouragement.

You will return ONLY valid JSON (no prose, no markdown fences) matching this exact shape:

{
  "metaTitle": "<55-65 char title — should mirror how someone in this situation actually searches; include 'Resume' or 'Resume Tips'>",
  "metaDescription": "<145-160 char description that promises specific, situation-aware help>",
  "h1": "<the page's H1 — written for the searcher's exact moment>",
  "intro": "<2-3 sentence intro that names the reader's reality without sugar-coating, and promises something useful. Friendly tone.>",
  "audience": "<one sentence describing who's reading this — be specific. e.g. 'Parents stepping back into paid work after 5+ years at home.'>",
  "topSkills": [
    { "name": "<skill, asset, or angle to emphasize>", "why": "<one sentence on why this matters specifically for someone in this situation>" }
    // 8-10 items. For situations, these are TRANSFERABLE skills, life-experience-derived assets, or framing angles — not job-specific keywords.
  ],
  "sampleBullets": [
    { "weak": "<a typical mistake bullet someone in this situation might write>", "strong": "<rewritten to reframe the experience compellingly>", "lesson": "<one sentence on what made it stronger>" }
    // exactly 3 items. Examples should reflect the situation (e.g. for 'returning after kids', show how to credit volunteer/PTA work; for 'after layoff', show how to handle the recent end-date)
  ],
  "commonMistakes": [
    { "mistake": "<short heading>", "fix": "<one sentence on what to do instead>" }
    // 4-5 items. These should be situation-specific landmines — e.g. 'Apologizing for the gap in the summary', 'Listing every job from 30 years ago'.
  ],
  "structureTips": [
    "<one tip specific to this situation — e.g. 'Lead with a Skills Summary so the reader sees value before chronology', 'Use a functional or hybrid format if traditional reverse-chrono undersells you'>"
    // 3-4 items
  ],
  "atsKeywords": ["<exact phrase 1>", "<exact phrase 2>"],
  // For situations, atsKeywords should be the SEARCH PHRASES recruiters use to find people in this situation when employers want to hire them (e.g. 'returnship candidate', 'second-career', 'fair-chance hire'). 6-10 items.
  "salarySignal": "<one sentence about salary expectations relevant to this situation. Stay general and accurate. If salary varies wildly, say so plainly. Avoid invented numbers.>",
  "faq": [
    { "q": "<question phrased the way someone in this situation would Google it — anxiously, in plain English>", "a": "<2-3 sentences. Practical, direct, no false reassurance.>" }
    // 5 items. Address the real fears (gap explanations, age discrimination, lack of recent references, etc.)
  ]
}

WRITING RULES:
- Warm but direct. Never patronizing. Never overly upbeat. The reader can tell when they're being managed.
- Concrete > generic. Reference the specific situation in every section. A guide for "After a Layoff" should mention layoffs by name; a guide for "Career Change at 50" should address ageism explicitly.
- Validate before advising. The reader often feels behind, embarrassed, or scared. Acknowledge the situation in the intro before pivoting to action.
- No fabricated metrics. Sample bullets should show how to reframe REAL experience compellingly — not how to invent things.
- Address the elephant directly. If the situation has a stigma (gap years, fired, incarceration), the FAQ must address it head-on, not dance around it.
- Output JSON ONLY. No markdown fences, no commentary.`;

// ---- helpers --------------------------------------------------------------
function loadRoles() {
  return JSON.parse(fs.readFileSync(ROLES_PATH, 'utf8')).roles.filter((r) => !r.deprecated);
}

function cachePath(slug) {
  return path.join(CACHE_DIR, `${slug}.json`);
}

function hasCache(slug) {
  return fs.existsSync(cachePath(slug));
}

async function generateRole(client, role) {
  const isSituation = role.category === 'situation';
  const systemPrompt = isSituation ? SITUATION_SYSTEM_PROMPT : ROLE_SYSTEM_PROMPT;
  const userMsg = isSituation
    ? `SITUATION: ${role.title}\n\nGenerate the JSON now for a resume guide aimed at someone whose current situation is "${role.title}". Address them directly, with empathy and practical advice.`
    : `ROLE: ${role.title}\nCATEGORY: ${role.category}\n\nGenerate the JSON now for the resume reference page targeting "${role.title} resume" as the primary search query.`;
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMsg }],
  });
  const raw = message.content.map((b) => b.text || '').join('');
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

async function processRole(client, role, opts = {}) {
  const slug = role.slug;
  const force = opts.force === true;
  if (!force && hasCache(slug)) {
    return { slug, status: 'cached' };
  }
  try {
    const content = await generateRole(client, role);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const payload = {
      slug,
      title: role.title,
      category: role.category,
      generatedAt: new Date().toISOString(),
      model: MODEL,
      ...content,
    };
    fs.writeFileSync(cachePath(slug), JSON.stringify(payload, null, 2));
    return { slug, status: 'generated' };
  } catch (e) {
    return { slug, status: 'error', error: e.message };
  }
}

// Lightweight worker pool — keeps CONCURRENCY requests in flight at once.
async function pool(items, worker, concurrency) {
  const queue = items.slice();
  const results = [];
  let inFlight = 0;
  return new Promise((resolve, reject) => {
    function next() {
      if (queue.length === 0 && inFlight === 0) return resolve(results);
      while (inFlight < concurrency && queue.length > 0) {
        const item = queue.shift();
        inFlight += 1;
        Promise.resolve(worker(item))
          .then((r) => results.push(r))
          .catch(reject)
          .finally(() => {
            inFlight -= 1;
            next();
          });
      }
    }
    next();
  });
}

// ---- main -----------------------------------------------------------------
async function main() {
  const roles = loadRoles();

  if (args.status) {
    const cached = roles.filter((r) => hasCache(r.slug));
    const missing = roles.filter((r) => !hasCache(r.slug));
    console.log(`Coverage: ${cached.length}/${roles.length} roles have cached content.`);
    if (missing.length > 0 && missing.length <= 30) {
      console.log('Missing:', missing.map((r) => r.slug).join(', '));
    }
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY not set. Add it to .env.local or your shell.');
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let target = roles;
  let force = false;

  if (args.only) {
    target = roles.filter((r) => r.slug === args.only);
    if (target.length === 0) { console.error(`No role with slug "${args.only}"`); process.exit(1); }
  } else if (args.regenerate) {
    target = roles.filter((r) => r.slug === args.regenerate);
    if (target.length === 0) { console.error(`No role with slug "${args.regenerate}"`); process.exit(1); }
    force = true;
  } else {
    target = roles.filter((r) => !hasCache(r.slug));
  }

  if (args.limit) {
    target = target.slice(0, parseInt(args.limit, 10));
  }

  if (target.length === 0) {
    console.log('Nothing to do — all roles have cached content. Use --regenerate=<slug> to refresh one.');
    return;
  }

  console.log(`Generating content for ${target.length} role(s) at concurrency=${CONCURRENCY}...`);
  const start = Date.now();
  let done = 0;
  const results = await pool(
    target,
    async (role) => {
      const r = await processRole(client, role, { force });
      done += 1;
      const tag = r.status === 'generated' ? '✓' : r.status === 'cached' ? '·' : '✗';
      console.log(`  [${done}/${target.length}] ${tag} ${r.slug}${r.error ? ' — ' + r.error : ''}`);
      return r;
    },
    CONCURRENCY
  );

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const generated = results.filter((r) => r.status === 'generated').length;
  const errored   = results.filter((r) => r.status === 'error').length;
  const cached    = results.filter((r) => r.status === 'cached').length;

  console.log(`\nDone in ${elapsed}s. Generated: ${generated}, cached: ${cached}, errors: ${errored}.`);
  if (errored > 0) {
    console.log('Errors:');
    results.filter((r) => r.status === 'error').forEach((r) => console.log(`  ${r.slug}: ${r.error}`));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
