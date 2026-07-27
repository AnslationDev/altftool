/**
 * Server registry — resolves a slug to its transformer and runs it.
 *
 * Server-only. Imported by the API dispatcher (api/[slug]/route.js) and the
 * Node test harness. Wraps every call in try/catch so a transformer can never
 * crash the route — failures come back as { ok: false, error }.
 */
import { serverLoaders, hasServerLoader } from "./transformers/index.js";
import { getToolBySlug } from "./manifest.js";
import { err } from "./types.js";

/**
 * @param {string} slug
 * @returns {Promise<any|null>} the transformer module, or null if not built yet
 */
async function loadModule(slug) {
  if (!hasServerLoader(slug)) return null;
  try {
    return await serverLoaders[slug]();
  } catch {
    return null;
  }
}

/**
 * Run a transformer by slug. Always resolves to a TransformResult.
 * @param {string} slug
 * @param {string} input
 * @param {Record<string, unknown>} [options]
 * @returns {Promise<import("./types.js").TransformResult>}
 */
export async function runTransform(slug, input, options = {}) {
  const tool = getToolBySlug(slug);
  if (!tool) return err(`Unknown converter: "${slug}".`);

  const mod = await loadModule(slug);
  if (!mod) return err("This converter is being finalized and isn't available yet.");

  const fn = mod.transform || mod.default;
  if (typeof fn !== "function") return err(`Converter "${slug}" is misconfigured.`);

  try {
    return await fn(input ?? "", options || {});
  } catch (e) {
    return err(e);
  }
}

/**
 * The realistic sample input for a tool, if it exposes one.
 * @param {string} slug
 * @returns {Promise<string>}
 */
export async function getServerSample(slug) {
  const mod = await loadModule(slug);
  if (!mod || mod.sample == null) return "";
  return typeof mod.sample === "string" ? mod.sample : String(mod.sample);
}

/**
 * The declared UI options for a tool, if any.
 * @param {string} slug
 * @returns {Promise<import("./types.js").ToolOption[]>}
 */
export async function getServerOptions(slug) {
  const mod = await loadModule(slug);
  return Array.isArray(mod?.options) ? mod.options : [];
}
