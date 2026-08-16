/**
 * Derives, per tool, whether that tool's own code contacts a service — and where.
 *
 * The shared tool copy tells a visitor that a tool needing to contact a service
 * says so on its own page. Nothing backed that promise: ~3,550 tool pages take
 * the shared fallback, and 29 of those tools do call out. This produces the map
 * that makes the sentence true.
 *
 * It is generated rather than hand-written for two reasons. The generated
 * directory is rebuilt by prebuild, so a committed file there simply disappears.
 * And a hand-written list goes stale the moment a tool gains or drops a call —
 * re-deriving on every build means the page cannot claim yesterday's behaviour.
 *
 * WHAT COUNTS AS EVIDENCE, strongest first:
 *   1. A literal fetch()/axios() target inside the tool's own directory,
 *      either an absolute http(s) URL or one of this site's /api routes.
 *      Template-interpolated hosts are captured up to the first ${, so a call
 *      to `https://ipwho.is/${target}` records ipwho.is.
 *   2. A call whose target is a variable resolvable to such a literal — the
 *      const/let feeding fetch(url), including ternary branches, template
 *      bases (`${API_URL}/x`), and consts imported from another file in the
 *      same tool. Wave-53 moved many targets one assignment away from the
 *      call site and silently dropped those tools from this map; resolution
 *      exists so a refactor cannot erase a true disclosure.
 *   3. A wrapper function whose body fetches its own parameter (fetchJson,
 *      fetchWithRetry, proxyFetch…): its call sites are then scanned like
 *      fetch sites, so the URL passed to the wrapper counts.
 *   4. A hand-written entry in scripts/data/tool-network-overrides.mjs for
 *      flows the scanner cannot prove (e.g. fetch(built.url) where a builder
 *      assembles the URL). Overrides must cite file:line evidence.
 *
 * WHAT IS DELIBERATELY NOT EVIDENCE: commented-out code, URL literals inside
 * strings of generated sample code (escaped quotes), example/localhost hosts,
 * and fetches of user-supplied URLs (api-tester and friends) — naming a host
 * there would be as false as the privacy promise this work removed.
 *
 * WHAT ABSENCE MEANS: nothing. A tool missing from this map is one where no
 * direct call was found — it may still reach the network through a shared
 * helper. The consuming copy therefore says nothing at all for those tools
 * rather than claiming they are local-only. Asserting local-only across the
 * catalogue is the exact false-privacy promise this work removed.
 */
import fs from "node:fs";
import path from "node:path";
import { TOOL_NETWORK_OVERRIDES } from "./data/tool-network-overrides.mjs";

const TOOLS_DIR = "src/tools";
const OUT_DIR = "src/app/tools/generated";
const OUT_FILE = path.join(OUT_DIR, "toolNetworkMap.js");
const CODE_EXT = new Set([".js", ".jsx", ".ts", ".tsx"]);

// fetch("https://x/…") / axios.get(`/api/…`) / axios.create({baseURL: X}).
// Lookbehind keeps prefetch()/refetch() helpers from matching.
const CALL_START =
  /(?<![\w$])(?:(?:window|globalThis)\.)?fetch\s*\(|(?<![\w$.])axios(?:\.\w+)?\s*\(/g;

// A URL literal. The quote must not be escaped: an escaped quote means the
// "call" lives inside a string of displayed sample code, not real code.
const URL_LIT = /(?<!\\)[`"']((?:https?:\/\/|\/api\/)[^`"'\s]{3,120})/g;

// Hosts that are documentation placeholders, never real destinations.
const IGNORED_HOST =
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$|(^|\.)example\.(com|org|net)$|\.(test|invalid|local|example)$/i;

// Identifiers that can appear in a call's first argument but can never name
// a destination — resolving them would only chase noise.
const IDENT_STOP = new Set([
  "await", "new", "typeof", "return", "if", "else", "true", "false", "null",
  "undefined", "void", "this", "process", "env", "window", "document",
  "globalThis", "fetch", "axios", "JSON", "String", "Number", "Boolean",
  "Math", "Date", "URL", "URLSearchParams", "encodeURIComponent",
  "encodeURI", "AbortSignal", "AbortController", "signal", "console",
]);

function hostOf(url) {
  if (!url.startsWith("http")) return "self"; // one of our own /api routes
  const host = url.replace(/^https?:\/\//, "").split(/[/?#$`]/)[0];
  return host.replace(/^www\./, "");
}

// Commented-out calls are not behaviour. financial-update carries its old
// alphavantage/twelvedata calls as comments; disclosing those would claim a
// request the page never makes. The `(?<!:)` keeps `https://` from reading
// as a comment marker.
function isCommented(source, index) {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1;
  const prefix = source.slice(lineStart, index);
  const trimmed = prefix.trimStart();
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
    return true;
  }
  return /(?<!:)\/\//.test(prefix);
}

// The first argument of a call, walked with a bracket/quote counter so a
// comma inside a URL, template or options object does not cut it short.
function firstArgOf(source, afterParen) {
  let depth = 0;
  let quote = null;
  const max = Math.min(source.length, afterParen + 600);
  for (let i = afterParen; i < max; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" && depth === 0) return source.slice(afterParen, i);
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "," && depth === 0) return source.slice(afterParen, i);
  }
  return source.slice(afterParen, max);
}

function urlLiteralsIn(expr) {
  return [...expr.matchAll(URL_LIT)].map((m) => m[1]);
}

// Identifiers worth resolving in an expression. String bodies are dropped
// first (the words inside "https://ipapi.co" are not identifiers), but the
// ${…} placeholders of template literals are kept — `${API_URL}/latest`
// must surface API_URL.
function identifiersIn(expr) {
  let code = expr.replace(/`(?:[^`\\]|\\.)*`/g, (m) => {
    const inner = [...m.matchAll(/\$\{([^}]*)\}/g)].map((x) => x[1]).join(" ");
    return ` ${inner} `;
  });
  code = code.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, " ");
  const ids = [];
  for (const m of code.matchAll(/(?<![.\w$])[A-Za-z_$][\w$]*/g)) {
    if (!IDENT_STOP.has(m[0]) && !ids.includes(m[0])) ids.push(m[0]);
  }
  return ids;
}

// Only files REACHABLE FROM entry.jsx count. Scanning the whole directory was
// wrong and produced false positives: most tools still carry a leftover Vite
// scaffold (main.jsx -> App.jsx -> components/Main.jsx) that the Next entry
// never renders. random-joke-tool is the clearest case — the shipped chain is
// entry.jsx -> pages/index.jsx -> lib.js with 49 local jokes and no request,
// while the orphaned App.jsx fetches jokeapi. Counting that dead file would
// have made the page disclose a call it never makes, which is the same
// falsehood as the privacy promise this work exists to remove, pointed the
// other way.
function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    ...[...CODE_EXT].map((e) => base + e),
    ...[...CODE_EXT].map((e) => path.join(base, "index" + e)),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const sourceCache = new Map();
function read(file) {
  if (!sourceCache.has(file)) sourceCache.set(file, fs.readFileSync(file, "utf8"));
  return sourceCache.get(file);
}

function reachableFrom(entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file) || !fs.existsSync(file)) continue;
    seen.add(file);
    const source = read(file);
    const specs = [
      ...source.matchAll(/from\s+["'`]([^"'`]+)["'`]/g),
      ...source.matchAll(/import\(\s*["'`]([^"'`]+)["'`]/g),
    ].map((m) => m[1]);
    for (const spec of specs) {
      const next = resolveImport(file, spec);
      if (next) queue.push(next);
    }
  }
  return [...seen];
}

// name imported as `local` in `file` -> { file: definingFile, name: exported }
function namedImportsOf(file) {
  const map = new Map();
  const source = read(file);
  const re = /import\s+(?:[\w$]+\s*,\s*)?\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g;
  for (const m of source.matchAll(re)) {
    const target = resolveImport(file, m[2]);
    if (!target) continue;
    for (const spec of m[1].split(",")) {
      const [exported, local = exported] = spec.trim().split(/\s+as\s+/);
      if (exported?.trim()) map.set((local || exported).trim(), { file: target, name: exported.trim() });
    }
  }
  return map;
}

// Every non-commented assignment to `id` in `file`: const/let/var
// declarations (ternaries included, up to the closing `;`) and plain
// reassignments (`url = …`; the (?![=>]) keeps == and => out).
function assignmentsTo(id, file) {
  const source = read(file);
  const out = [];
  const decl = new RegExp(
    `(?:const|let|var)\\s+${id}\\s*=\\s*([\\s\\S]{1,400}?);`,
    "g",
  );
  const reassign = new RegExp(
    `(?:^|[^\\w$.!=<>&|+\\-*/%^])${id}\\s*=(?![=>])\\s*([^;\\n]{1,400})`,
    "gm",
  );
  for (const re of [decl, reassign]) {
    for (const m of source.matchAll(re)) {
      if (!isCommented(source, m.index)) out.push(m[1]);
    }
  }
  return out;
}

// Hosts an expression can reach: its own URL literals, plus (depth-limited)
// the literals of every identifier it mentions, following ternary branches
// and named imports. Union over branches is correct for disclosure — any
// host the code can contact is a host the page must admit to.
function hostsOfExpr(expr, file, depth, seen = new Set()) {
  const hosts = [];
  for (const url of urlLiteralsIn(expr)) {
    const host = hostOf(url);
    if (host && !IGNORED_HOST.test(host) && !hosts.includes(host)) hosts.push(host);
  }
  if (depth <= 0) return hosts;
  const imports = namedImportsOf(file);
  for (const id of identifiersIn(expr)) {
    const key = `${file} ${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const local = assignmentsTo(id, file);
    const scopes = local.length
      ? local.map((rhs) => [rhs, file])
      : imports.has(id)
        ? assignmentsTo(imports.get(id).name, imports.get(id).file).map((rhs) => [
            rhs,
            imports.get(id).file,
          ])
        : [];
    for (const [rhs, scopeFile] of scopes) {
      for (const host of hostsOfExpr(rhs, scopeFile, depth - 1, seen)) {
        if (!hosts.includes(host)) hosts.push(host);
      }
    }
  }
  return hosts;
}

// Direct fetch/axios call sites in a file: [{ index, arg }].
function callSitesIn(file) {
  const source = read(file);
  const sites = [];
  for (const m of source.matchAll(CALL_START)) {
    if (isCommented(source, m.index)) continue;
    sites.push({ index: m.index, arg: firstArgOf(source, m.index + m[0].length) });
  }
  return sites;
}

// Function declarations in a file: [{ name, params, index }].
function functionDefsIn(file) {
  const source = read(file);
  const defs = [];
  const forms = [
    /(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g,
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\s*\(([^)]*)\)/g,
  ];
  for (const re of forms) {
    for (const m of source.matchAll(re)) {
      if (isCommented(source, m.index)) continue;
      const params = m[2]
        .split(",")
        .map((p) => p.split("=")[0].trim())
        .filter((p) => /^[A-Za-z_$][\w$]*$/.test(p));
      defs.push({ name: m[1], params, index: m.index });
    }
  }
  return defs;
}

const map = {};
for (const entry of fs.readdirSync(TOOLS_DIR, { withFileTypes: true })) {
  // _shared and friends are not routes.
  if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
  const entryFile = [...CODE_EXT]
    .map((e) => path.join(TOOLS_DIR, entry.name, "entry" + e))
    .find((f) => fs.existsSync(f));
  if (!entryFile) continue; // no entry means no route
  const files = reachableFrom(entryFile);

  // Tier 1+2: direct call sites — literal targets first (strongest evidence,
  // and it keeps the host order of the pre-resolution map stable), then
  // variable-resolved targets. Along the way, note wrappers: a function whose
  // body fetches one of its own parameters. Only unresolvable identifiers
  // count as param evidence, so a local `const url` never marks the
  // surrounding component a wrapper.
  const literalHosts = [];
  const resolvedHosts = [];
  const wrapperNames = new Set();
  for (const file of files) {
    for (const site of callSitesIn(file)) {
      for (const url of urlLiteralsIn(site.arg)) {
        const host = hostOf(url);
        if (host && !IGNORED_HOST.test(host) && !literalHosts.includes(host)) {
          literalHosts.push(host);
        }
      }
      const defs = functionDefsIn(file);
      for (const id of identifiersIn(site.arg)) {
        const hosts = hostsOfExpr(id, file, 3);
        for (const host of hosts) {
          if (!resolvedHosts.includes(host)) resolvedHosts.push(host);
        }
        if (!hosts.length && !assignmentsTo(id, file).length) {
          for (const def of defs) {
            if (def.index < site.index && def.params.includes(id)) {
              wrapperNames.add(def.name);
            }
          }
        }
      }
    }
  }

  // Tier 3: whatever the tool passes into its own fetch wrappers.
  const wrapperHosts = [];
  for (const name of wrapperNames) {
    const callRe = new RegExp(`(?<![.\\w$])${name}\\s*\\(`, "g");
    for (const file of files) {
      const source = read(file);
      for (const m of source.matchAll(callRe)) {
        if (isCommented(source, m.index)) continue;
        if (/(?:function|=>)\s*$/.test(source.slice(Math.max(0, m.index - 12), m.index))) continue;
        const arg = firstArgOf(source, m.index + m[0].length);
        for (const host of hostsOfExpr(arg, file, 3)) {
          if (!wrapperHosts.includes(host)) wrapperHosts.push(host);
        }
      }
    }
  }

  // Tier 4 first in the list: override entries are hand-verified against
  // cited evidence, so the 3-host cap must never push them out.
  const hosts = [];
  for (const host of [
    ...(TOOL_NETWORK_OVERRIDES[entry.name] || []),
    ...literalHosts,
    ...resolvedHosts,
    ...wrapperHosts,
  ]) {
    if (!hosts.includes(host)) hosts.push(host);
  }
  // Cap at 3: the copy names at most two, and an unbounded list would be noise.
  if (hosts.length) map[entry.name] = hosts.slice(0, 3);
}

const slugs = Object.keys(map).sort();
const body = `// GENERATED by scripts/generate-tool-network-map.mjs — do not edit.
//
// Per tool, the services its own code contacts, derived from fetch()/axios()
// targets inside that tool's directory: literal targets, targets resolved
// through simple const/let assignments and imports, URLs passed to the tool's
// own fetch wrappers, and hand-verified overrides from
// scripts/data/tool-network-overrides.mjs. "self" is one of this site's own
// /api routes rather than a third party.
//
// Absence is NOT a claim that a tool is local-only — only that no direct call
// was found. Consumers must say nothing rather than promise privacy.

export const TOOL_NETWORK_DESTINATIONS = {
${slugs.map((s) => `  ${JSON.stringify(s)}: ${JSON.stringify(map[s])},`).join("\n")}
};

export function toolNetworkDestinations(slug) {
  return TOOL_NETWORK_DESTINATIONS[slug] || null;
}
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, body);

const external = slugs.filter((s) => map[s].some((h) => h !== "self"));
console.log(
  `✅ toolNetworkMap generated (${slugs.length} tools contact a service; ` +
    `${external.length} reach a third party, ${slugs.length - external.length} only our own API)`,
);
