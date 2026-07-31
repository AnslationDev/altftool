/**
 * netlify.toml generator.
 *
 * Section names and keys follow Netlify's file-based configuration docs
 * (https://docs.netlify.com/configure-builds/file-based-configuration/):
 *   [build]                command, publish, base
 *   [build.environment]    e.g. NODE_VERSION
 *   [functions]            directory, node_bundler
 *   [[redirects]]          from, to, status, force
 *   [[headers]]            for, [headers.values]
 *   [[edge_functions]]     path, function
 */

/**
 * HTTP statuses Netlify's redirect engine accepts, per the redirects docs:
 * 301/302 redirects, 200 rewrite (proxy), 404/410/451 custom error pages.
 */
export const REDIRECT_STATUSES = [
  { code: 301, label: "301 — permanent redirect" },
  { code: 302, label: "302 — temporary redirect" },
  { code: 200, label: "200 — rewrite / proxy (URL stays the same)" },
  { code: 404, label: "404 — custom not-found page" },
  { code: 410, label: "410 — gone" },
  { code: 451, label: "451 — unavailable for legal reasons" },
];

/** Node bundlers accepted by the [functions] block in Netlify's docs. */
export const NODE_BUNDLERS = ["", "esbuild", "zisi"];

/**
 * Common header presets.
 *  - Security headers follow the OWASP Secure Headers Project baseline.
 *  - The immutable cache rule is Netlify's own recommendation for
 *    fingerprinted assets (max-age=31536000 = 365 days in seconds).
 */
export const HEADER_PRESETS = [
  {
    id: "security",
    label: "Security headers on /*",
    path: "/*",
    values: [
      ["X-Frame-Options", "DENY"],
      ["X-Content-Type-Options", "nosniff"],
      ["Referrer-Policy", "strict-origin-when-cross-origin"],
      ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
    ],
  },
  {
    id: "hsts",
    label: "Strict-Transport-Security on /*",
    path: "/*",
    // 63072000 s = 2 years, the value hstspreload.org requires for preload.
    values: [["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"]],
  },
  {
    id: "immutable-assets",
    label: "Immutable cache for /assets/*",
    path: "/assets/*",
    values: [["Cache-Control", "public, max-age=31536000, immutable"]],
  },
];

/** Escape a value for a TOML basic (double-quoted) string. */
export function tomlString(value) {
  const escaped = String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
  return `"${escaped}"`;
}

const NODE_VERSION_PATTERN = /^\d{1,2}(\.\d+){0,2}$/;

function isValidPathOrUrl(value) {
  return value.startsWith("/") || /^https?:\/\//.test(value);
}

/**
 * Build the netlify.toml text.
 *
 * @param {object} input
 * @param {string} [input.buildCommand]
 * @param {string} [input.publishDir]
 * @param {string} [input.baseDir]
 * @param {string} [input.nodeVersion]      e.g. "20" — goes to [build.environment]
 * @param {string} [input.functionsDir]
 * @param {string} [input.nodeBundler]      "" | "esbuild" | "zisi"
 * @param {boolean} [input.spaFallback]     add /* -> /index.html 200 rewrite
 * @param {Array<{from:string,to:string,status:number|string,force:boolean}>} [input.redirects]
 * @param {string[]} [input.headerPresetIds]
 * @param {Array<{path:string,functionName:string}>} [input.edgeFunctions]
 * @returns {{text:string, sectionCount:number, redirectCount:number}|{error:string}}
 */
export function buildNetlifyToml({
  buildCommand = "",
  publishDir = "",
  baseDir = "",
  nodeVersion = "",
  functionsDir = "",
  nodeBundler = "",
  spaFallback = false,
  redirects = [],
  headerPresetIds = [],
  edgeFunctions = [],
} = {}) {
  const command = String(buildCommand).trim();
  const publish = String(publishDir).trim();
  const base = String(baseDir).trim();
  const node = String(nodeVersion).trim();
  const fnDir = String(functionsDir).trim();

  if (node !== "" && !NODE_VERSION_PATTERN.test(node)) {
    return { error: 'Node version should look like "20" or "20.11.1".' };
  }
  if (!NODE_BUNDLERS.includes(nodeBundler)) {
    return { error: "Node bundler must be esbuild, zisi, or left as default." };
  }

  const allRedirects = [];
  for (let index = 0; index < redirects.length; index += 1) {
    const entry = redirects[index] ?? {};
    const from = String(entry.from ?? "").trim();
    const to = String(entry.to ?? "").trim();
    const status = Number(entry.status);
    const label = `Redirect ${index + 1}`;
    if (from === "" && to === "") continue; // skip fully empty rows
    if (from === "") return { error: `${label}: enter the "from" path.` };
    if (to === "") return { error: `${label}: enter the "to" path or URL.` };
    if (!isValidPathOrUrl(from)) {
      return { error: `${label}: "from" must start with / (e.g. /old-page).` };
    }
    if (!isValidPathOrUrl(to)) {
      return { error: `${label}: "to" must start with / or be a full http(s) URL.` };
    }
    if (!REDIRECT_STATUSES.some((option) => option.code === status)) {
      return {
        error: `${label}: status must be one of ${REDIRECT_STATUSES.map((option) => option.code).join(", ")}.`,
      };
    }
    allRedirects.push({ from, to, status, force: Boolean(entry.force) });
  }
  if (spaFallback) {
    // Netlify's documented SPA history-pushstate fallback: rewrite everything
    // to index.html with a 200 so client-side routing handles the path. This
    // must be appended last — Netlify evaluates [[redirects]] top to bottom
    // and stops at the first match, so a catch-all placed earlier would
    // shadow every user-entered redirect/rewrite rule above it.
    allRedirects.push({ from: "/*", to: "/index.html", status: 200, force: false });
  }

  const edges = [];
  for (let index = 0; index < edgeFunctions.length; index += 1) {
    const entry = edgeFunctions[index] ?? {};
    const path = String(entry.path ?? "").trim();
    const functionName = String(entry.functionName ?? "").trim();
    if (path === "" && functionName === "") continue;
    const label = `Edge function ${index + 1}`;
    if (path === "" || !path.startsWith("/")) {
      return { error: `${label}: the path must start with / (e.g. /api/*).` };
    }
    if (functionName === "") {
      return { error: `${label}: enter the function name (its file name without extension).` };
    }
    edges.push({ path, functionName });
  }

  const blocks = [];
  let sectionCount = 0;

  const buildLines = [];
  if (base !== "") buildLines.push(`  base = ${tomlString(base)}`);
  if (command !== "") buildLines.push(`  command = ${tomlString(command)}`);
  if (publish !== "") buildLines.push(`  publish = ${tomlString(publish)}`);
  if (buildLines.length > 0) {
    blocks.push(["[build]", ...buildLines].join("\n"));
    sectionCount += 1;
  }
  if (node !== "") {
    blocks.push(["[build.environment]", `  NODE_VERSION = ${tomlString(node)}`].join("\n"));
    sectionCount += 1;
  }

  if (fnDir !== "" || nodeBundler !== "") {
    const fnLines = ["[functions]"];
    if (fnDir !== "") fnLines.push(`  directory = ${tomlString(fnDir)}`);
    if (nodeBundler !== "") fnLines.push(`  node_bundler = ${tomlString(nodeBundler)}`);
    blocks.push(fnLines.join("\n"));
    sectionCount += 1;
  }

  for (const redirect of allRedirects) {
    const lines = [
      "[[redirects]]",
      `  from = ${tomlString(redirect.from)}`,
      `  to = ${tomlString(redirect.to)}`,
      `  status = ${redirect.status}`,
    ];
    if (redirect.force) lines.push("  force = true");
    blocks.push(lines.join("\n"));
    sectionCount += 1;
  }

  for (const presetId of headerPresetIds) {
    const preset = HEADER_PRESETS.find((entry) => entry.id === presetId);
    if (!preset) return { error: `Unknown header preset "${presetId}".` };
    const lines = [
      "[[headers]]",
      `  for = ${tomlString(preset.path)}`,
      "  [headers.values]",
      ...preset.values.map(([name, value]) => `    ${name} = ${tomlString(value)}`),
    ];
    blocks.push(lines.join("\n"));
    sectionCount += 1;
  }

  for (const edge of edges) {
    blocks.push(
      [
        "[[edge_functions]]",
        `  path = ${tomlString(edge.path)}`,
        `  function = ${tomlString(edge.functionName)}`,
      ].join("\n"),
    );
    sectionCount += 1;
  }

  if (blocks.length === 0) {
    return { error: "Set at least one option — an empty netlify.toml configures nothing." };
  }

  return {
    text: `# netlify.toml — generated configuration\n\n${blocks.join("\n\n")}\n`,
    sectionCount,
    redirectCount: allRedirects.length,
  };
}
