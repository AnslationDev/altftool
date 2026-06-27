/**
 * Canonical slug utilities for the blog CMS.
 *
 * IMPORTANT: this matches the PUBLIC renderer's `slugify`
 * (altftoolweb/src/app/blogs/data/blogSeoDefaults.js) so admin-generated
 * slugs and public `/blogs/[slug]` URLs stay byte-for-byte consistent.
 */

export const SLUG_MIN = 3;
export const SLUG_MAX = 75;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Backward-compatible alias used by older components. */
export const normalizeBlogSlug = slugify;

export function isValidSlug(slug = "") {
  const s = String(slug || "");
  return s.length >= SLUG_MIN && s.length <= SLUG_MAX && SLUG_PATTERN.test(s);
}

/** Human-readable issues for a slug (empty array == valid). */
export function slugIssues(slug = "") {
  const s = String(slug || "");
  const issues = [];
  if (!s) {
    issues.push("Slug is empty.");
    return issues;
  }
  if (s.length < SLUG_MIN) issues.push(`Too short (min ${SLUG_MIN} chars).`);
  if (s.length > SLUG_MAX) issues.push(`Too long (max ${SLUG_MAX} chars).`);
  if (!SLUG_PATTERN.test(s)) issues.push("Use lowercase letters, numbers and single hyphens only.");
  return issues;
}

/**
 * Check a slug against existing blogs for collisions and propose a unique
 * suggestion (`slug-2`, `slug-3`, …). `currentId` is excluded from the check
 * so editing a blog never collides with itself.
 */
export function ensureUniqueSlug(slug, blogs = [], currentId = "") {
  const base = slugify(slug);
  const taken = new Set(
    blogs
      .filter((b) => b && b.id !== currentId)
      .map((b) => slugify(b.slug || b.heading || b.title || ""))
      .filter(Boolean),
  );

  if (!taken.has(base)) return { slug: base, unique: true, suggestion: base };

  let n = 2;
  let candidate = `${base}-${n}`;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return { slug: base, unique: false, suggestion: candidate };
}
