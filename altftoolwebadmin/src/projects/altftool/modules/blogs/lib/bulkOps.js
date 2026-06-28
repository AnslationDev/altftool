/**
 * Phase 3 — bulk operations planning (pure, dependency-free).
 *
 * The planner is intentionally free of React / Firestore / JSX imports so it
 * can be unit-tested and reused. The concrete patch builder (which depends on
 * the refresh kit) is injected by the caller.
 */

export const BULK_ACTIONS = [
  { key: "seo", label: "SEO pack", description: "Meta title/description + freshness review fields." },
  { key: "faq", label: "Add FAQ", description: "Append an FAQ block for rich results." },
  { key: "sources", label: "Sources", description: "Add source notes + citation scaffolding." },
  { key: "links", label: "Internal links", description: "Insert a recommended internal-link block." },
  { key: "review", label: "Mark reviewed", description: "Stamp reviewer + editorial trust fields." },
];

export function isBulkAction(key) {
  return BULK_ACTIONS.some((a) => a.key === key);
}

/** Each blog writes 2 ops (revision snapshot + update); keep < 500/commit. */
export const BATCH_BLOG_LIMIT = 200;

export function chunk(array = [], size = BATCH_BLOG_LIMIT) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

function patchHasChanges(patch) {
  return Boolean(patch) && Object.keys(patch).length > 0;
}

/**
 * Dry-run plan: which selected blogs would actually change under `buildPatch`.
 * @param blogs      array of blog docs
 * @param buildPatch (blog) => patchObject
 * @returns { items: [{ id, heading, patch, changed }], summary }
 */
export function planBulkJob(blogs = [], buildPatch) {
  const items = blogs.map((blog) => {
    let patch = {};
    try {
      patch = buildPatch(blog) || {};
    } catch {
      patch = {};
    }
    return {
      id: blog.id,
      heading: blog.heading || blog.title || "Untitled",
      blog,
      patch,
      changed: patchHasChanges(patch),
    };
  });

  const willChange = items.filter((i) => i.changed);
  return {
    items,
    changedItems: willChange,
    summary: {
      total: items.length,
      willChange: willChange.length,
      unchanged: items.length - willChange.length,
      batches: chunk(willChange).length,
    },
  };
}

/** Roll a per-chunk progress sequence up into an overall percentage. */
export function progressPercent({ done = 0, failed = 0, total = 0 }) {
  if (!total) return 0;
  return Math.min(100, Math.round(((done + failed) / total) * 100));
}
