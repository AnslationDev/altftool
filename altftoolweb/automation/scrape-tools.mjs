// ============================================================================
// scrape-tools.mjs — auto-fetch fresh tool ideas from the manifest's scrape
// sources, dedupe against every known slug, and append new ones as "pending".
//
// Robust by design: each source is tried independently with a timeout; a
// blocked/unreachable source is logged and skipped, never fatal. New ideas are
// written to automation/data/pending-extra.json, which generate-manifest.mjs
// merges into the pending list.
//
//   node automation/scrape-tools.mjs [--limit 200] [--source tinywow]
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readManifest } from "./lib/manifest.mjs";
import { classify } from "./lib/capability.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const EXTRA_FILE = path.join(DATA_DIR, "pending-extra.json");

const kebab = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const STOP = new Set(["home", "about", "login", "sign in", "sign up", "signup", "register", "blog", "news", "contact", "privacy", "terms", "pricing", "faq", "help", "support", "docs", "api", "download", "menu", "search", "all tools", "tools", "more", "categories", "category", "features", "featured", "featured tools", "popular tools", "new tools", "get started", "learn more", "read more", "products", "company", "resources", "account", "profile", "settings", "logout", "cookie", "cookies", "advertisement", "sponsored", "trending", "recommended", "top tools"]);

const CATEGORY_HINTS = [
  [/pdf/, "PDF"], [/image|photo|jpg|png|webp/, "Image"], [/video|mp4|gif/, "Media"],
  [/json|xml|yaml|csv|base64|encode|decode|hash|regex|css|html|api|developer|code/, "Developer"],
  [/calculator|calculate/, "Calculator"], [/convert|converter/, "Converter"],
  [/loan|tax|interest|salary|invoice|finance|budget/, "Finance"],
  [/bmi|calorie|health|fitness|workout/, "Health"], [/word|text|character|case|slug/, "Text"],
  [/generator|random/, "Fun"], [/seo|meta|sitemap|robots/, "Web"],
];

function categoryFor(name) {
  const n = name.toLowerCase();
  for (const [re, cat] of CATEGORY_HINTS) if (re.test(n)) return cat;
  return "Utility";
}

function looksLikeTool(text) {
  const t = text.trim();
  if (t.length < 3 || t.length > 46) return false;
  if (STOP.has(t.toLowerCase())) return false;
  if (!/[a-zA-Z]/.test(t)) return false;
  if (/[<>{}|©®™]|https?:|@|\.\w{2,4}$/.test(t)) return false;
  // Reject names dominated by non-ASCII (e.g. CJK) — this site targets English tools.
  const nonAscii = (t.match(/[^\x00-\x7F]/g) || []).length;
  if (nonAscii > 0 && nonAscii / t.length > 0.15) return false;
  // Reject ALL-CAPS section headings (FEATURED TOOLS, TOP PICKS…).
  if (t === t.toUpperCase() && /\s/.test(t)) return false;
  const words = t.split(/\s+/);
  if (words.length > 6) return false;
  // Must look like a tool: contains a tool-ish verb/noun OR is title-cased multi-word.
  const toolish = /(convert|converter|calculator|generator|maker|editor|checker|counter|encoder|decoder|formatter|analyzer|tester|remov: |remover|compress|resize|cropper|splitter|merger|viewer|finder|tracker|planner|scanner|translator|downloader|extractor|builder|cleaner|picker)/i.test(t);
  const titleMulti = words.length >= 2 && words.every((w) => /^[A-Z0-9(]/.test(w) || w.length <= 3);
  return toolish || titleMulti;
}

function extractNames(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  const names = new Set();
  const re = /<(?:a|h1|h2|h3|h4|li|span|button|p)[^>]*>([^<]{3,60})<\/(?:a|h1|h2|h3|h4|li|span|button|p)>/gi;
  let m;
  while ((m = re.exec(text))) {
    const raw = m[1].replace(/&amp;/g, "&").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
    if (looksLikeTool(raw)) names.add(raw);
  }
  return [...names];
}

async function fetchSource(site) {
  try {
    const res = await fetch(site.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AltFToolBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ok: false, reason: "HTTP " + res.status, names: [] };
    const html = await res.text();
    return { ok: true, names: extractNames(html) };
  } catch (e) {
    return { ok: false, reason: e.name === "TimeoutError" ? "timeout" : e.message || String(e), names: [] };
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const limit = argv.includes("--limit") ? Number(argv[argv.indexOf("--limit") + 1]) : 250;
  const only = argv.includes("--source") ? argv[argv.indexOf("--source") + 1].toLowerCase() : null;

  const manifest = readManifest();
  const known = new Set(manifest.tools.map((t) => t.slug));

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const existingExtra = fs.existsSync(EXTRA_FILE) ? JSON.parse(fs.readFileSync(EXTRA_FILE, "utf8")) : [];
  for (const e of existingExtra) known.add(kebab(e.name));

  let sites = manifest.scrapeSources?.sites || [];
  if (only) sites = sites.filter((s) => s.name.toLowerCase().includes(only));

  console.log(`🔎 Scraping ${sites.length} source(s)…\n`);
  const found = [];
  const seenThisRun = new Set();

  for (const site of sites) {
    process.stdout.write(`  ${site.name} … `);
    const r = await fetchSource(site);
    if (!r.ok) {
      console.log(`skipped (${r.reason})`);
      continue;
    }
    let added = 0;
    let dropped = 0;
    for (const name of r.names) {
      const slug = kebab(name);
      if (!slug || known.has(slug) || seenThisRun.has(slug)) continue;
      seenThisRun.add(slug);
      // Feasibility filter: only keep tools buildable as pure browser logic.
      if (!classify({ name, slug, category: categoryFor(name) }).ok) {
        dropped++;
        continue;
      }
      found.push({ name, category: categoryFor(name), source: site.name });
      added++;
      if (found.length >= limit) break;
    }
    console.log(`${r.names.length} candidates, ${added} new${dropped ? `, ${dropped} skipped (needs server/AI/media)` : ""}`);
    if (found.length >= limit) break;
  }

  if (!found.length) {
    console.log("\nNo new tool ideas found (sources may be blocked or already covered).");
    console.log("The pipeline still has the authored + previously-scraped backlog to build.");
    return;
  }

  const merged = [...existingExtra, ...found];
  fs.writeFileSync(EXTRA_FILE, JSON.stringify(merged, null, 2) + "\n");
  console.log(`\n✅ added ${found.length} new idea(s) → automation/data/pending-extra.json (total scraped: ${merged.length})`);
  console.log("   run: node automation/generate-manifest.mjs   to fold them into the manifest.");
}

main().catch((e) => {
  console.error("FATAL:", e.message || e);
  process.exit(1);
});
