/**
 * Typed loader over transform.manifest.json — the single source of truth for
 * the Transform section. Everything (routes, index grid, metadata, registries)
 * reads tools from here so counts and copy never drift.
 */
import manifest from "../_data/transform.manifest.json";

/** @typedef {import("./types.js").TransformResult} TransformResult */

/**
 * @typedef {Object} ToolMeta
 * @property {string} slug
 * @property {string} title
 * @property {string} category
 * @property {string} from
 * @property {string} to
 * @property {"browser"|"server"} engine
 * @property {string} lib
 * @property {"todo"|"done"|"blocked"} status
 * @property {string} description
 * @property {string[]} keywords
 * @property {string[]} [uses] Packages a `lib: "custom"` converter still
 *   depends on (json5 to parse, mongoose to model the target, …). The page
 *   names them, so this must match the module's real imports — asserted in
 *   scripts/assert-transform-manifest.mjs.
 * @property {string} [blocked_reason]
 */

export const SECTION = manifest.section;
export const CATEGORY_ORDER = manifest.categoryOrder;
/** @type {ToolMeta[]} */
export const TOOLS = manifest.tools;

/** @returns {ToolMeta[]} */
export function getAllTools() {
  return TOOLS;
}

/**
 * @param {string} slug
 * @returns {ToolMeta | null}
 */
export function getToolBySlug(slug) {
  return TOOLS.find((t) => t.slug === slug) || null;
}

/** @returns {string[]} */
export function getToolSlugs() {
  return TOOLS.map((t) => t.slug);
}

/**
 * Group tools by category in the manifest's declared order.
 * @returns {{ name: string, tools: ToolMeta[], count: number }[]}
 */
export function getToolsByCategory() {
  const byCat = new Map();
  for (const name of CATEGORY_ORDER) byCat.set(name, []);
  for (const tool of TOOLS) {
    if (!byCat.has(tool.category)) byCat.set(tool.category, []);
    byCat.get(tool.category).push(tool);
  }
  const order = [...CATEGORY_ORDER];
  for (const key of byCat.keys()) if (!order.includes(key)) order.push(key);
  return order.map((name) => {
    const tools = byCat.get(name) || [];
    return { name, tools, count: tools.length };
  });
}

/** @returns {number} */
export function getToolCount() {
  return TOOLS.length;
}
