// ============================================================================
// retrieval/index.mjs — grounds Tier-3 generation in real sources so the model
// ADAPTS a known algorithm instead of inventing one. Keyless APIs only
// (Wikipedia, npm registry) + your own repo. Each source is best-effort and
// fails soft.
//   retrieve(entry) -> { definition, packages[], repoExamples[] }
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS = path.resolve(__dirname, "..", "..", "src/tools");

async function j(url, opts = {}) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "AltFToolFactory/1.0" }, signal: AbortSignal.timeout(8000), ...opts });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// Wikipedia REST summary — algorithm/definition + often worked examples.
export async function wikipedia(term) {
  const title = encodeURIComponent(term.replace(/\s+/g, "_"));
  const d = await j(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
  if (!d || d.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") return null;
  return { title: d.title, extract: d.extract, url: d.content_urls?.desktop?.page };
}

// npm registry search — packages that implement the thing (with license).
export async function npmSearch(query, size = 5) {
  const d = await j(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${size}`);
  if (!d?.objects) return [];
  return d.objects.map((o) => ({ name: o.package.name, description: o.package.description, version: o.package.version, links: o.package.links, license: o.package.license }));
}

// Mine your OWN repo for the closest existing tool of the same family — free,
// correctly licensed, on-style feature reference.
export function repoExamples(entry, limit = 3) {
  const want = new Set(String(entry.name || entry.slug).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
  const dirs = fs.readdirSync(TOOLS).filter((d) => !d.startsWith("_"));
  const scored = [];
  for (const slug of dirs) {
    const words = new Set(slug.split("-").filter((w) => w.length > 2));
    let s = 0; for (const w of words) if (want.has(w)) s++;
    if (s > 0) scored.push({ slug, score: s });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.slug);
}

export async function retrieve(entry) {
  const name = String(entry.name || entry.slug).replace(/-/g, " ");
  const [def, pkgs] = await Promise.all([wikipedia(name), npmSearch(name)]);
  return { definition: def, packages: pkgs, repoExamples: repoExamples(entry) };
}
