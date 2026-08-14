/* ============================================================
   AltF Backlinks — sheet importer

   Reads the maintained Google Sheet and emits a normalised catalogue.
   Re-runnable: the sheet keeps growing, so every mapping below is a
   keyword rule with a defined fallback rather than a lookup table of
   values seen once. An unrecognised category lands in a real bucket
   instead of vanishing or creating a 200th filter option.

   Usage:
     node scripts/import-backlinks.mjs            # fetch live sheet
     node scripts/import-backlinks.mjs local.csv  # use a local export
   ============================================================ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SHEET_ID = "1FUnrMfWeW3WaiZsB0qJEwvpqwQECZJD7jg6r5JrlYQE";
const SHEET_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const OUT_DIR = join(process.cwd(), "public", "data", "backlinks");

/* ---------- CSV (RFC 4180: quoted commas and embedded newlines) ---------- */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v !== "")) rows.push(row);
  }
  return rows;
}

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();

const slugify = (v) =>
  clean(v)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ---------- Groups ----------
   199 raw category strings collapse to these. Order matters: the first
   matching pattern wins, so the more specific ones sit higher. */
export const GROUPS = [
  { id: "launch", label: "Launch platforms", blurb: "One-shot launches where timing and preparation decide the outcome.", re: /launch|show hn|product hunt|betalist|uneed|peerlist launch/i },
  { id: "ai-directory", label: "AI tool directories", blurb: "Fast-growing listings specifically for AI-powered tools.", re: /\bai\b.*(director|tool|list)|futurepedia|toolify|there'?s an ai/i },
  // Marketplaces sit above the generic software bucket: an extension or plugin
  // store has its own review process and asset requirements, and lumping it in
  // with directories loses that.
  { id: "marketplace", label: "Marketplaces and app stores", blurb: "Extension, plugin and integration stores. Real review processes, real distribution.", re: /marketplace|app ?store|extension|plugin|integration|widget|add-?on|no-?code|dataset platform/i },
  { id: "startup", label: "Startup directories", blurb: "Startup listings, beta lists and founder media.", re: /startup|beta.?(test|list)|incubat|accelerat|founder|indie ?hacker/i },
  { id: "software-directory", label: "Software directories", blurb: "General tool and software catalogues with real search traffic.", re: /tool|software|saas|app (director|list)|alternative/i },
  { id: "review-platform", label: "Review platforms", blurb: "B2B review sites. Slow to approve, strong once live.", re: /review|g2|capterra|getapp|trustpilot|crozdesk/i },
  { id: "dev-registry", label: "Developer registries", blurb: "Package, image and docs hosting that carries real authority.", re: /package|registry|npm|docker|github|pypi|crates|repositor|documentation|docs hosting|open-?source project/i },
  { id: "design-gallery", label: "Design galleries", blurb: "Showcases judged on craft. A good screenshot matters more than copy.", re: /design|gallery|showcase|awwward|css|inspiration/i },
  { id: "content-platform", label: "Publishing platforms", blurb: "Write once, link back. Editorial standards vary widely.", re: /content|blog|publish|medium|dev\.to|hashnode|editorial contribution|article|newsletter|resource page/i },
  { id: "pr-source", label: "PR and source platforms", blurb: "Get quoted or distribute a release. Slower, higher ceiling.", re: /\bpr\b|press|source platform|journalist|media outreach|newswire/i },
  { id: "business-directory", label: "Business directories", blurb: "Company and local listings. Unglamorous, consistently indexed.", re: /business|local|company (director|listing)|web director|maps|yelp/i },
  { id: "profile-entity", label: "Profiles and entities", blurb: "Owned pages you control: company, founder, knowledge-panel entities.", re: /profile|entity|crunchbase|linkedin|wikidata|about/i },
  { id: "community", label: "Communities and forums", blurb: "Answer real questions. Never drop a bare link.", re: /communit|forum|reddit|discord|slack|stack ?overflow|quora/i },
  { id: "social", label: "Social channels", blurb: "Brand surface and referral traffic more than link equity.", re: /social|twitter|\bx\b|youtube|instagram|facebook|tiktok|mastodon/i },
];

const FALLBACK_GROUP = { id: "other", label: "Other opportunities", blurb: "Everything that does not fit the buckets above." };

function groupFor(category, opportunityType, website) {
  const hay = `${category} ${opportunityType} ${website}`;
  for (const g of GROUPS) if (g.re.test(hay)) return g.id;
  return FALLBACK_GROUP.id;
}

/* ---------- Cost ----------
   138 raw strings, mostly variations on the same four states. */
export const COSTS = [
  { id: "free", label: "Free" },
  { id: "freemium", label: "Free + paid tier" },
  { id: "paid", label: "Paid" },
  { id: "unknown", label: "Not stated" },
];

function costFor(raw) {
  const v = clean(raw).toLowerCase();
  if (!v || /unknown|not publicly|not stated|n\/a|tbd/.test(v)) return "unknown";
  // "Free + paid", "Free/paid", "Free + ads" all mean: you can start free.
  if (/free/.test(v) && /paid|ads|premium|\+|\/|sponsor/.test(v)) return "freemium";
  if (/free|editorial|no cost/.test(v)) return "free";
  if (/paid|\$|fee|subscription/.test(v)) return "paid";
  return "unknown";
}

/* ---------- Status ---------- */
export const STATUSES = [
  { id: "verified", label: "Verified live" },
  { id: "conditional", label: "Live, with conditions" },
  { id: "unverified", label: "Needs checking" },
  { id: "todo", label: "Not submitted yet" },
];

function statusFor(raw) {
  const v = clean(raw).toLowerCase();
  if (/conditional/.test(v)) return "conditional";
  if (/verified|live/.test(v)) return "verified";
  if (/verify|check|source-listed/.test(v)) return "unverified";
  return "todo";
}

/* ---------- Effort ----------
   Not in the sheet. Derived from what the opportunity actually asks of you,
   because "free" and "easy" are different axes and conflating them is the
   main thing that makes these lists useless. */
function effortFor(opportunityType, rules) {
  const hay = `${opportunityType} ${rules}`.toLowerCase();
  if (/editorial|guest|article|write|pitch|interview|press-release|journalist/.test(hay)) return "high";
  if (/review|verify|verification|approval|moderat|manual/.test(hay)) return "medium";
  if (/profile|listing|submit|directory|registry/.test(hay)) return "low";
  return "medium";
}

const EFFORT_WEIGHT = { low: 1, medium: 0.82, high: 0.62 };

/* ---------- Impact ----------
   The sheet's P0-P3 is the editor's judgement and is the strongest signal, so
   it dominates. Cost and effort only modulate it: a free, low-effort P1 should
   outrank a paid, high-effort P1, because it is the one you can actually do
   this afternoon. */
const PRIORITY_BASE = { P0: 96, P1: 82, P2: 64, P3: 44 };

function impactFor(priority, cost, effort) {
  const base = PRIORITY_BASE[clean(priority).toUpperCase()] ?? 50;
  const costAdj = cost === "free" ? 4 : cost === "freemium" ? 1 : cost === "paid" ? -6 : 0;
  const effortAdj = (EFFORT_WEIGHT[effort] - 1) * 12;
  return Math.max(5, Math.min(100, Math.round(base + costAdj + effortAdj)));
}

/* ---------- Guidance ----------
   The sheet's action notes are written as AltFTool's own plan and name it in
   61% of rows. This is a public directory, so they are rewritten to address
   the reader. Purely mechanical: the advice itself is unchanged. */
function generalise(text) {
  let t = clean(text);
  if (!t) return "";
  t = t
    .replace(/\bAltFTool(?:\.com)?(?:'s)?\b/gi, "your tool")
    .replace(/\bthe your tool\b/gi, "your tool")
    .replace(/\byour tool platform\b/gi, "your platform")
    .replace(/\byour tool app\b/gi, "your app")
    .replace(/^(submit|launch|add|create|list|publish|post)\b/i, (m) => m[0].toUpperCase() + m.slice(1).toLowerCase())
    .replace(/\s{2,}/g, " ")
    .trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* ---------- Build ---------- */
const localPath = process.argv[2];
let csv;
if (localPath) {
  csv = readFileSync(localPath, "utf8");
  console.log(`reading local ${localPath}`);
} else {
  console.log("fetching sheet…");
  const res = await fetch(SHEET_CSV, { redirect: "follow" });
  if (!res.ok) throw new Error(`sheet fetch failed: HTTP ${res.status}`);
  csv = await res.text();
}

const rows = parseCsv(csv);
const header = rows[0].map(clean);
const idx = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

const C = {
  id: idx("ID"),
  category: idx("Category"),
  website: idx("Website"),
  domain: idx("Domain"),
  type: idx("Opportunity Type"),
  url: idx("Direct URL"),
  todo: idx("What to do for AltFTool"),
  cost: idx("Cost"),
  priority: idx("Priority"),
  rules: idx("Rules / Caveat"),
  status: idx("Status"),
  checked: idx("Source Checked"),
};

for (const [k, v] of Object.entries(C)) {
  if (v === -1) throw new Error(`sheet is missing an expected column for "${k}" — headers were: ${header.join(" | ")}`);
}

const seenSlug = new Set();
const items = [];
const skipped = [];

/* ---------- Slugs ----------
   Slugs are URLs, and these pages get indexed, so a slug must depend only on
   the row's own content — never on where the row sits in the sheet.

   The naive "first one wins, later ones get -2" approach fails badly: insert a
   new row with a duplicate site name near the top and it takes over the bare
   slug, silently repointing an already-indexed URL at a different website. That
   is worse than a 404, because nothing looks broken.

   So: count every website name up front. Names that are unique get the bare
   slug. Names that appear more than once are ALWAYS domain-qualified — nobody
   gets the bare slug — which makes the result identical regardless of row
   order, and stable as the sheet grows. */
const dataRows = rows.slice(1);
const nameFrequency = new Map();
for (const r of dataRows) {
  const key = slugify(clean(r[C.website]));
  if (key) nameFrequency.set(key, (nameFrequency.get(key) ?? 0) + 1);
}

/* Short, stable, content-derived suffix for the rare case where two rows share
   both a name and a domain. */
function shortHash(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).slice(0, 4);
}

function slugFor(website, domain, url) {
  const base = slugify(website) || slugify(domain);
  if ((nameFrequency.get(base) ?? 0) <= 1) return base;

  const domainPart = slugify(domain.replace(/^www\./, ""));
  if (domainPart && domainPart !== base) return `${base}-${domainPart}`;
  return `${base}-${shortHash(url)}`;
}

for (const r of dataRows) {
  const website = clean(r[C.website]);
  const domain = clean(r[C.domain]).replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  const url = clean(r[C.url]);

  // A row with no destination cannot be acted on, so it is not an opportunity.
  if (!website || !/^https?:\/\//.test(url)) {
    skipped.push({ website, url, why: !website ? "no website name" : "no usable URL" });
    continue;
  }

  const rawCategory = clean(r[C.category]);
  const rawType = clean(r[C.type]);
  const rules = clean(r[C.rules]);

  const group = groupFor(rawCategory, rawType, website);
  const cost = costFor(r[C.cost]);
  const status = statusFor(r[C.status]);
  const effort = effortFor(rawType, rules);
  const priority = (clean(r[C.priority]).toUpperCase().match(/P[0-3]/) || ["P3"])[0];
  const impact = impactFor(priority, cost, effort);

  const slug = slugFor(website, domain, url);
  if (seenSlug.has(slug)) {
    // Two rows resolved to the same slug even after domain and URL
    // disambiguation, which means they are genuinely the same destination.
    skipped.push({ website, url, why: `duplicate of an earlier row (${slug})` });
    continue;
  }
  seenSlug.add(slug);

  items.push({
    id: clean(r[C.id]) || String(items.length + 1),
    slug,
    website,
    domain,
    url,
    group,
    rawCategory,
    rawType,
    cost,
    rawCost: clean(r[C.cost]),
    status,
    rawStatus: clean(r[C.status]),
    priority,
    effort,
    impact,
    guidance: generalise(r[C.todo]),
    rules,
    checked: clean(r[C.checked]),
  });
}

items.sort((a, b) => b.impact - a.impact || a.website.localeCompare(b.website));
items.forEach((it, i) => {
  it.rank = i + 1;
});

const tally = (key) =>
  items.reduce((acc, it) => ((acc[it[key]] = (acc[it[key]] || 0) + 1), acc), {});

const facets = {
  group: tally("group"),
  cost: tally("cost"),
  status: tally("status"),
  priority: tally("priority"),
  effort: tally("effort"),
};

const manifest = {
  source: `https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
  total: items.length,
  skipped: skipped.length,
  groups: GROUPS.map((g) => ({ id: g.id, label: g.label, blurb: g.blurb, count: facets.group[g.id] || 0 }))
    .concat([{ ...FALLBACK_GROUP, count: facets.group[FALLBACK_GROUP.id] || 0 }])
    .filter((g) => g.count > 0),
  facets,
  quickWins: items.filter((i) => i.cost === "free" && i.effort === "low" && i.priority !== "P3").length,
  freeCount: items.filter((i) => i.cost === "free" || i.cost === "freemium").length,
};

/* ---------- Slug-stability report ----------
   Slugs are indexed URLs. Compare against the previous import and say plainly
   what moved, so a sheet edit that would repoint or retire a live page is
   visible in the run output instead of discovered from a traffic drop. */
let stability = null;
try {
  const previous = JSON.parse(readFileSync(join(OUT_DIR, "items.json"), "utf8"));
  const was = new Map(previous.map((p) => [p.slug, p.url]));
  const now = new Map(items.map((i) => [i.slug, i.url]));

  const repointed = [...now.entries()]
    .filter(([slug, url]) => was.has(slug) && was.get(slug) !== url)
    .map(([slug, url]) => ({ slug, from: was.get(slug), to: url }));
  const removed = [...was.keys()].filter((slug) => !now.has(slug));
  const added = [...now.keys()].filter((slug) => !was.has(slug));

  stability = { repointed, removed, added };
} catch {
  // First run, or no previous output — nothing to compare against.
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "items.json"), JSON.stringify(items));
writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(`\n✓ imported ${items.length} opportunities`);
console.log(`  skipped (no actionable URL): ${skipped.length}`);
console.log(`  free or freemium : ${manifest.freeCount}`);
console.log(`  quick wins       : ${manifest.quickWins}`);
console.log(`  groups           : ${manifest.groups.length}`);
for (const g of manifest.groups) console.log(`     ${String(g.count).padStart(4)}  ${g.label}`);
console.log(`  cost buckets     : ${JSON.stringify(facets.cost)}`);
console.log(`  statuses         : ${JSON.stringify(facets.status)}`);

if (stability) {
  console.log("\nURL stability vs previous import");
  console.log(`  new pages        : ${stability.added.length}`);
  console.log(`  retired pages    : ${stability.removed.length}`);
  console.log(`  REPOINTED slugs  : ${stability.repointed.length}`);

  if (stability.repointed.length) {
    console.log(
      "\n  ⚠ These URLs already exist and now point somewhere else. Search engines\n" +
        "    have them indexed against the old destination. Either revert the sheet\n" +
        "    edit, or add a redirect before deploying:",
    );
    for (const r of stability.repointed.slice(0, 20)) {
      console.log(`      /backlinks/${r.slug}`);
      console.log(`         was: ${r.from}`);
      console.log(`         now: ${r.to}`);
    }
    if (stability.repointed.length > 20) {
      console.log(`      … and ${stability.repointed.length - 20} more`);
    }
  }
  if (stability.removed.length) {
    console.log("\n  Retired (will 404 unless redirected):");
    stability.removed.slice(0, 10).forEach((s) => console.log(`      /backlinks/${s}`));
    if (stability.removed.length > 10) {
      console.log(`      … and ${stability.removed.length - 10} more`);
    }
  }
}

console.log(`\n  output           : ${OUT_DIR}`);
