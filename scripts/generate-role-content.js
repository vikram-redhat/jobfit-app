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

// ---- prompt ---------------------------------------------------------------
const SYSTEM_PROMPT = `You are an expert resume coach writing reference content for a programmatic SEO page about a specific job role. Your output is read by job seekers (often new grads, casual job seekers, or career switchers under 30) and by AI search engines.

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
  const userMsg = `ROLE: ${role.title}\nCATEGORY: ${role.category}\n\nGenerate the JSON now for the resume reference page targeting "${role.title} resume" as the primary search query.`;
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
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
