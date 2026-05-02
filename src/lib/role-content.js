// src/lib/role-content.js
// Server-side helpers for loading role content from disk at build time.
//
// At build time, Next will call generateStaticParams + each role page,
// reading the cached JSON written by scripts/generate-role-content.js.
// If a cache file is missing the page is treated as not-found (so a
// half-populated cache deploys cleanly — only generated roles appear).

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'content', 'roles');
const ROLES_PATH = path.join(process.cwd(), 'content', 'roles.json');

let _rolesIndex = null;
function loadRolesIndex() {
  if (_rolesIndex) return _rolesIndex;
  const raw = JSON.parse(fs.readFileSync(ROLES_PATH, 'utf8'));
  _rolesIndex = {
    categories: raw.categories,
    roles: raw.roles.filter((r) => !r.deprecated),
  };
  return _rolesIndex;
}

/**
 * Returns the full role index (categories + role list).
 */
export function getRolesIndex() {
  return loadRolesIndex();
}

/**
 * Returns only the roles that have a cached content file. Used by
 * generateStaticParams so we don't try to render pages without data.
 */
export function getBuildableRoles() {
  const { roles } = loadRolesIndex();
  return roles.filter((r) => fs.existsSync(path.join(CACHE_DIR, `${r.slug}.json`)));
}

/**
 * Returns the full content for a single role, or null if not yet generated.
 */
export function getRoleContent(slug) {
  const file = path.join(CACHE_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Returns up to N other roles in the same category for the "Related roles" footer.
 */
export function getRelatedRoles(slug, limit = 6) {
  const { roles } = loadRolesIndex();
  const me = roles.find((r) => r.slug === slug);
  if (!me) return [];
  const peers = roles.filter((r) => r.slug !== slug && r.category === me.category);
  // Stable rotation based on slug — different from page to page but consistent
  const offset = Array.from(slug).reduce((s, c) => s + c.charCodeAt(0), 0) % Math.max(1, peers.length);
  return peers.slice(offset).concat(peers.slice(0, offset)).slice(0, limit);
}
