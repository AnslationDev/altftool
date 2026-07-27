/**
 * Client registry — lazy loaders for browser-engine tools only.
 *
 * This is the ONLY registry a client component may import. It references just
 * the transformers whose libraries are browser-safe, so Node-only packages are
 * never pulled into the client bundle. Each entry code-splits into its own
 * async chunk, so a visitor downloads only the converter they open.
 *
 * One line is added here per BROWSER tool as it is implemented in Phase 1.
 * Server-engine tools are intentionally absent — the shell calls the API route
 * for those.
 */

/** @type {Record<string, () => Promise<any>>} */
export const clientLoaders = {
  // --- browser-engine tools are registered below, in manifest order ---
  // Batch 1
  "html-to-jsx": () => import("./transformers/html-to-jsx.js"),
  "json-to-big-query": () => import("./transformers/json-to-big-query.js"),
  // Batch 2
  "json-to-graphql": () => import("./transformers/json-to-graphql.js"),
  "json-to-io-ts": () => import("./transformers/json-to-io-ts.js"),
  // Batch 3
  "json-to-jsdoc": () => import("./transformers/json-to-jsdoc.js"),
  "json-to-json-schema": () => import("./transformers/json-to-json-schema.js"),
  "json-to-mobx-state-tree": () => import("./transformers/json-to-mobx-state-tree.js"),
  // Batch 4
  "json-to-mongoose": () => import("./transformers/json-to-mongoose.js"),
  "json-to-mysql": () => import("./transformers/json-to-mysql.js"),
  "json-to-proptypes": () => import("./transformers/json-to-proptypes.js"),
  "json-to-sarcastic": () => import("./transformers/json-to-sarcastic.js"),
  // Batch 5
  "json-to-toml": () => import("./transformers/json-to-toml.js"),
  "json-to-yaml": () => import("./transformers/json-to-yaml.js"),
  "json-to-zod": () => import("./transformers/json-to-zod.js"),
  // Batch 6
  "json-schema-to-openapi-schema": () => import("./transformers/json-schema-to-openapi-schema.js"),
  "json-schema-to-protobuf": () => import("./transformers/json-schema-to-protobuf.js"),
  "json-schema-to-zod": () => import("./transformers/json-schema-to-zod.js"),
  "css-to-js": () => import("./transformers/css-to-js.js"),
  // Batch 7
  "css-to-tailwind": () => import("./transformers/css-to-tailwind.js"),
  "object-styles-to-template-literal": () => import("./transformers/object-styles-to-template-literal.js"),
  "js-object-to-json": () => import("./transformers/js-object-to-json.js"),
  // Batch 8
  "graphql-to-introspection-json": () => import("./transformers/graphql-to-introspection-json.js"),
  // Batch 9
  "graphql-to-schema-ast": () => import("./transformers/graphql-to-schema-ast.js"),
  // Batch 12
  "cadence-to-go": () => import("./transformers/cadence-to-go.js"),
  "markdown-to-html": () => import("./transformers/markdown-to-html.js"),
  "toml-to-json": () => import("./transformers/toml-to-json.js"),
  "toml-to-yaml": () => import("./transformers/toml-to-yaml.js"),
  "xml-to-json": () => import("./transformers/xml-to-json.js"),
  "yaml-to-json": () => import("./transformers/yaml-to-json.js"),
  "yaml-to-toml": () => import("./transformers/yaml-to-toml.js"),
};

/**
 * @param {string} slug
 * @returns {boolean}
 */
export function hasClientLoader(slug) {
  return Object.prototype.hasOwnProperty.call(clientLoaders, slug);
}

/**
 * Load and run a browser transformer. Resolves to a TransformResult and never
 * throws (mirrors the server registry contract).
 * @param {string} slug
 * @param {string} input
 * @param {Record<string, unknown>} [options]
 * @returns {Promise<import("./types.js").TransformResult>}
 */
export async function runClientTransform(slug, input, options = {}) {
  if (!hasClientLoader(slug)) {
    return { ok: false, error: "This converter runs on the server." };
  }
  let mod;
  try {
    mod = await clientLoaders[slug]();
  } catch {
    return { ok: false, error: "This converter is being finalized and isn't available yet." };
  }
  const fn = mod.transform || mod.default;
  if (typeof fn !== "function") {
    return { ok: false, error: `Converter "${slug}" is misconfigured.` };
  }
  try {
    return await fn(input ?? "", options || {});
  } catch (e) {
    return { ok: false, error: e && e.message ? e.message : String(e) };
  }
}

/**
 * The sample input for a browser tool, loaded from its module.
 * @param {string} slug
 * @returns {Promise<string>}
 */
export async function getClientSample(slug) {
  if (!hasClientLoader(slug)) return "";
  try {
    const mod = await clientLoaders[slug]();
    if (mod.sample == null) return "";
    return typeof mod.sample === "string" ? mod.sample : String(mod.sample);
  } catch {
    return "";
  }
}

/**
 * Sample + declared options for a browser tool, in one module load.
 * @param {string} slug
 * @returns {Promise<{ sample: string, options: import("./types.js").ToolOption[] }>}
 */
export async function getClientMeta(slug) {
  if (!hasClientLoader(slug)) return { sample: "", options: [] };
  try {
    const mod = await clientLoaders[slug]();
    const sample = mod.sample == null ? "" : typeof mod.sample === "string" ? mod.sample : String(mod.sample);
    const options = Array.isArray(mod.options) ? mod.options : [];
    return { sample, options };
  } catch {
    return { sample: "", options: [] };
  }
}
