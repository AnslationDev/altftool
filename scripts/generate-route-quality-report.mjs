import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readRenderedSitemapXml } from "./lib/rendered-sitemap.mjs";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const webRoot = path.join(workspaceRoot, "altftoolweb");
const appOutput = path.join(webRoot, ".next/server/app");
const sitemapOutput = path.join(appOutput, "sitemap.xml.body");
const sitemapRouteOutput = path.join(appOutput, "sitemap.xml/route.js");
const buildIdPath = path.join(webRoot, ".next/BUILD_ID");
const excludedRoutes = new Set(["/_global-error", "/_not-found"]);
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const strictQuality = args.includes("--strict-quality");
const outputArg = args.find((arg) => arg.startsWith("--output="));
const outputPath = outputArg ? outputArg.slice("--output=".length) : "";

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function parseAttributes(tag = "") {
  const attributes = {};
  const pattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtml(
      match[2] ?? match[3] ?? match[4] ?? "",
    );
  }

  return attributes;
}

function findTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(
    (match) => ({
      raw: match[0],
      attributes: parseAttributes(match[0]),
    }),
  );
}

function getMetaValues(html, key, value) {
  return findTags(html, "meta")
    .filter(
      (tag) =>
        String(tag.attributes[key] || "").toLowerCase() === value.toLowerCase(),
    )
    .map((tag) => String(tag.attributes.content || "").trim())
    .filter(Boolean);
}

function getCanonicalValues(html) {
  return findTags(html, "link")
    .filter((tag) =>
      String(tag.attributes.rel || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    )
    .map((tag) => String(tag.attributes.href || "").trim())
    .filter(Boolean);
}

function getTitleValues(html) {
  return [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)]
    .map((match) =>
      decodeHtml(match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()),
    )
    .filter(Boolean);
}

async function collectHtmlFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    throw new Error(
      "Rendered web output is missing. Run npm run build:web before generating route quality.",
    );
  }

  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(absolute)));
    } else if (entry.name.endsWith(".html")) {
      files.push(absolute);
    }
  }
  return files;
}

function routeFromFile(file) {
  const relative = path.relative(appOutput, file).split(path.sep).join("/");
  const withoutExtension = relative.replace(/\.html$/, "");
  const route =
    withoutExtension === "index"
      ? "/"
      : `/${withoutExtension.replace(/\/index$/, "")}`;

  try {
    return decodeURIComponent(route);
  } catch {
    return route;
  }
}

function normalizePathname(value = "/") {
  const pathname = String(value || "/").split(/[?#]/)[0] || "/";
  return pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
}

function canonicalPathname(value = "") {
  if (!value) return "";
  try {
    return normalizePathname(new URL(value).pathname);
  } catch {
    return "";
  }
}

function routeGroup(route) {
  if (route === "/") return "Home";
  const segment = route.split("/").filter(Boolean)[0] || "other";
  const labels = {
    account: "Account",
    altfcalculators: "Calculators",
    altfgame: "Games",
    altfloveimg: "Image tools",
    altflovepdf: "PDF tools",
    blogs: "Blogs",
    bops: "Business Ops",
    buysmart: "BuySmart",
    deals: "Deals",
    exclusivedeals: "Exclusive Deals",
    extensions: "Extensions",
    lander: "Landers",
    locations: "Locations",
    n8n: "Automation",
    news: "News",
    products: "Products",
    signals: "Signals",
    tools: "Tools",
    wattpad: "Stories",
  };
  return labels[segment] || segment.replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.floor(score)));
}

function percentile(values, percentileValue) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * sorted.length) - 1),
  );
  return sorted[index];
}

async function readSitemapPaths() {
  const xml = await readRenderedSitemapXml({
    staticOutputPath: sitemapOutput,
    dynamicRoutePath: sitemapRouteOutput,
    dynamicRouteWorkingDirectory: webRoot,
  });

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) =>
    decodeHtml(match[1]),
  );
  return new Set(
    urls
      .map((value) => {
        try {
          return normalizePathname(new URL(value).pathname);
        } catch {
          return "";
        }
      })
      .filter(Boolean),
  );
}

function addIssue(items, message) {
  if (!items.includes(message)) items.push(message);
}

const [files, sitemapPaths, buildId] = await Promise.all([
  collectHtmlFiles(appOutput),
  readSitemapPaths(),
  readFile(buildIdPath, "utf8").then((value) => value.trim()).catch(() => null),
]);

const routes = [];
const canonicalOwners = new Map();

for (const file of files) {
  const route = normalizePathname(routeFromFile(file));
  if (excludedRoutes.has(route)) continue;

  const html = await readFile(file, "utf8");
  const titles = getTitleValues(html);
  const descriptions = getMetaValues(html, "name", "description");
  const canonicals = getCanonicalValues(html);
  const robots = getMetaValues(html, "name", "robots").join(",").toLowerCase();
  const googlebot = getMetaValues(html, "name", "googlebot").join(",").toLowerCase();
  const noindex = /\bnoindex\b/.test(`${robots},${googlebot}`);
  const canonical = canonicals[0] || "";
  const canonicalPath = canonicalPathname(canonical);
  const sitemapIncluded = sitemapPaths.has(route);
  const canonicalInSitemap = canonicalPath ? sitemapPaths.has(canonicalPath) : false;
  const ownsCanonical = Boolean(canonicalPath && canonicalPath === route);
  const issues = [];
  const advisories = [];
  const title = titles[0] || "";
  const description = descriptions[0] || "";
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const schemaCount = findTags(html, "script").filter(
    (tag) =>
      String(tag.attributes.type || "").toLowerCase() === "application/ld+json",
  ).length;

  if (noindex && sitemapIncluded) {
    addIssue(issues, "Noindex route is present in sitemap");
  }

  if (!noindex) {
    if (titles.length !== 1) addIssue(issues, `Expected one title; rendered ${titles.length}`);
    if (descriptions.length !== 1) {
      addIssue(issues, `Expected one description; rendered ${descriptions.length}`);
    }
    if (canonicals.length !== 1) {
      addIssue(issues, `Expected one canonical; rendered ${canonicals.length}`);
    }
    if (canonical && !canonicalInSitemap) {
      addIssue(issues, "Canonical target is missing from sitemap");
    }
    if (title.length > 70) addIssue(advisories, `Long title (${title.length})`);
    if (description.length && (description.length < 70 || description.length > 165)) {
      addIssue(advisories, `Non-ideal description (${description.length})`);
    }
    if (h1Count === 0) addIssue(advisories, "No rendered H1");
  }

  if (canonical) {
    try {
      const canonicalUrl = new URL(canonical);
      if (canonicalUrl.protocol !== "https:") {
        addIssue(issues, "Canonical does not use HTTPS");
      }
      if (canonicalUrl.hostname !== "www.altftool.com") {
        addIssue(issues, "Canonical does not use the www production host");
      }
    } catch {
      addIssue(issues, "Canonical is not a valid absolute URL");
    }
  }

  if (canonicalPath) {
    const owners = canonicalOwners.get(canonicalPath) || [];
    owners.push(route);
    canonicalOwners.set(canonicalPath, owners);
  }

  routes.push({
    route,
    group: routeGroup(route),
    indexState: noindex ? "noindex" : "index",
    title,
    descriptionLength: description.length,
    canonical,
    canonicalPath,
    ownsCanonical,
    sitemapIncluded,
    canonicalInSitemap,
    h1Count,
    schemaCount,
    issues,
    advisories,
    score: clampScore(100 - issues.length * 25 - advisories.length * 4),
  });
}

for (const [canonicalPath, owners] of canonicalOwners) {
  const canonicalOwnerRoutes = owners.filter((route) => route === canonicalPath);
  if (canonicalOwnerRoutes.length <= 1) continue;
  for (const route of owners) {
    const item = routes.find((candidate) => candidate.route === route);
    if (item) addIssue(item.issues, "Duplicate self-canonical route");
  }
}

for (const route of routes) {
  route.score = clampScore(
    100 - route.issues.length * 25 - route.advisories.length * 4,
  );
}

const groupsByName = new Map();
for (const route of routes) {
  const current = groupsByName.get(route.group) || {
    group: route.group,
    routes: 0,
    indexable: 0,
    noindex: 0,
    sitemapCovered: 0,
    issues: 0,
    advisories: 0,
    scores: [],
  };
  current.routes += 1;
  current.indexable += route.indexState === "index" ? 1 : 0;
  current.noindex += route.indexState === "noindex" ? 1 : 0;
  current.sitemapCovered +=
    route.indexState === "index" && route.canonicalInSitemap ? 1 : 0;
  current.issues += route.issues.length;
  current.advisories += route.advisories.length;
  current.scores.push(route.score);
  groupsByName.set(route.group, current);
}

const groups = [...groupsByName.values()]
  .map(({ scores, ...group }) => ({
    ...group,
    score: clampScore(
      scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length),
    ),
    sitemapCoverage: group.indexable
      ? Math.round((group.sitemapCovered / group.indexable) * 100)
      : 100,
  }))
  .sort((a, b) => b.routes - a.routes || a.group.localeCompare(b.group));

const indexable = routes.filter((route) => route.indexState === "index");
const noindex = routes.filter((route) => route.indexState === "noindex");
const indexConflicts = noindex.filter((route) => route.sitemapIncluded);
const missingCanonicalTargets = indexable.filter(
  (route) => route.canonical && !route.canonicalInSitemap,
);
const routesWithIssues = routes.filter((route) => route.issues.length > 0);
const routesWithAdvisories = routes.filter(
  (route) => route.advisories.length > 0,
);
const sitemapCovered = indexable.filter((route) => route.canonicalInSitemap);
const routeScores = routes.map((route) => route.score);
const watchlist = routes
  .filter((route) => route.issues.length || route.advisories.length)
  .sort(
    (a, b) =>
      b.issues.length - a.issues.length ||
      b.advisories.length - a.advisories.length ||
      a.score - b.score ||
      a.route.localeCompare(b.route),
  )
  .slice(0, 100);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  buildId,
  ok:
    routesWithIssues.length === 0 &&
    indexConflicts.length === 0 &&
    missingCanonicalTargets.length === 0,
  indexControlOk:
    indexConflicts.length === 0 && missingCanonicalTargets.length === 0,
  qualityOk:
    routesWithIssues.length === 0 &&
    routesWithAdvisories.length === 0 &&
    indexConflicts.length === 0 &&
    missingCanonicalTargets.length === 0,
  score: clampScore(
    routeScores.reduce((sum, value) => sum + value, 0) /
      Math.max(1, routeScores.length),
  ),
  totals: {
    routes: routes.length,
    indexable: indexable.length,
    noindex: noindex.length,
    sitemapUrls: sitemapPaths.size,
    sitemapCovered: sitemapCovered.length,
    sitemapCoverage: indexable.length
      ? Math.round((sitemapCovered.length / indexable.length) * 100)
      : 100,
    indexConflicts: indexConflicts.length,
    missingCanonicalTargets: missingCanonicalTargets.length,
    routesWithIssues: routesWithIssues.length,
    routesWithAdvisories: routesWithAdvisories.length,
    medianRouteScore: percentile(routeScores, 50),
    p95RouteScore: percentile(routeScores, 95),
  },
  groups,
  watchlist,
  conflicts: indexConflicts.map((route) => ({
    route: route.route,
    issue: "Noindex route is present in sitemap",
  })),
  missingCanonicalTargets: missingCanonicalTargets.map((route) => ({
    route: route.route,
    canonicalPath: route.canonicalPath,
  })),
};

if (outputPath) {
  const absoluteOutput = path.resolve(workspaceRoot, outputPath);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(
  `Route quality: ${report.score}/100 across ${report.totals.routes} rendered routes; ` +
    `${report.totals.indexable} indexable, ${report.totals.noindex} noindex, ` +
    `${report.totals.indexConflicts} sitemap conflicts, ` +
    `${report.totals.missingCanonicalTargets} missing canonical targets.`,
);

if (outputPath) {
  console.log(`Saved ${outputPath}.`);
}

if (strict && !report.indexControlOk) {
  for (const conflict of report.conflicts.slice(0, 20)) {
    console.error(`- ${conflict.route}: ${conflict.issue}`);
  }
  for (const item of report.missingCanonicalTargets.slice(0, 20)) {
    console.error(
      `- ${item.route}: canonical target ${item.canonicalPath || "(missing)"} is not in sitemap`,
    );
  }
  process.exit(1);
}

if (strictQuality && !report.qualityOk) {
  for (const item of watchlist.slice(0, 30)) {
    console.error(
      `- ${item.route}: ${[...item.issues, ...item.advisories].join("; ")}`,
    );
  }
  process.exit(1);
}
