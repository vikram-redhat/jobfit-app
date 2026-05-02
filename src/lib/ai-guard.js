// src/lib/ai-guard.js
// Defense in depth for anonymous AI endpoints. Three jobs:
//  1. Cap input size — long inputs cost more, and pasted noise rarely helps.
//  2. Strip obvious prompt-injection attempts so they can't override our system prompt.
//  3. Reject inputs that are clearly not the expected content type (e.g.
//     someone pasting a recipe into the JD extractor).

const MAX_INPUT_CHARS = 12000; // ~3000 tokens, plenty for a JD or resume
const MIN_INPUT_CHARS = 80;    // anything shorter probably isn't real content

// Patterns that strongly suggest a prompt-injection attempt. We don't try to
// be clever here — if any of these appear, we strip the line and let the
// rest of the input through. Models are robust enough that this catches
// the lazy 90% without false-positiving real content.
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /you\s+are\s+now\s+a/i,
  /system\s*:\s*you\s+/i,
  /\bact\s+as\s+(if\s+)?(you|a)\b/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /print\s+(your\s+)?(system\s+)?prompt/i,
  /<\|im_start\|>/i,
  /<\|system\|>/i,
];

/**
 * Validate + sanitize. Returns { ok: true, text } or { ok: false, error }.
 */
export function sanitizeInput(raw, { kind = 'input' } = {}) {
  if (typeof raw !== 'string') {
    return { ok: false, error: `${kind} must be text.` };
  }

  let text = raw.trim();

  if (text.length < MIN_INPUT_CHARS) {
    return {
      ok: false,
      error: `That ${kind} is too short — paste at least ${MIN_INPUT_CHARS} characters.`,
    };
  }
  if (text.length > MAX_INPUT_CHARS) {
    text = text.slice(0, MAX_INPUT_CHARS);
  }

  // Strip lines that look like prompt-injection attempts. Keeping the
  // rest preserves long real inputs that happen to mention the patterns
  // (e.g. "act as a senior engineer" in a JD).
  text = text
    .split('\n')
    .filter((line) => !INJECTION_PATTERNS.some((re) => re.test(line)))
    .join('\n')
    .trim();

  if (text.length < MIN_INPUT_CHARS) {
    return {
      ok: false,
      error: `That ${kind} doesn't look right — please paste a real ${kind}.`,
    };
  }

  return { ok: true, text };
}
