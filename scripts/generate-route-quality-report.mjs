import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  collectSitemapPaths,
  extractAdvertisedSitemapUrls,
  readRenderedSitemapXml,
} from "./lib/rendered-sitemap.mjs";
import {
  compileNoindexResponseHeaderRules,
  hasNoindexResponseHeader,
} from "./lib/rendered-route-policies.mjs";
import {
  classifyRenderedContentQuality,
  passesStrictQuality,
} from "./lib/route-quality-policy.mjs";
import { isIntentionalSitemapOmission } from "./lib/sitemap-coverage-policy.mjs";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const webRoot = path.join(workspaceRoot, "altftoolweb");
const appOutput = path.join(webRoot, ".next/server/app");
const serverOutput = path.join(webRoot, ".next/server");
const robotsOutput = path.join(appOutput, "robots.txt.body");
const appPathsManifestPath = path.join(serverOutput, "app-paths-manifest.json");
const routesManifestPath = path.join(webRoot, ".next/routes-manifest.json");
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
    .replace(
      /&([a-z]+);/gi,
      (match, name) => named[name.toLowerCase()] ?? match,
    );
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
      decodeHtml(
        match[1]
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      ),
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
  return (
    labels[segment] ||
    segment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
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

function matchAppRoute(routeKey, pathname) {
  const routePath = routeKey.replace(/\/route$/, "");
  const routeParts = routePath.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  const params = {};
  let pathIndex = 0;

  for (const routePart of routeParts) {
    const optionalCatchAll = routePart.match(/^\[\[\.\.\.(.+)\]\]$/);
    const catchAll = routePart.match(/^\[\.\.\.(.+)\]$/);
    const dynamic = routePart.match(/^\[(.+)\]$/);

    if (optionalCatchAll || catchAll) {
      const name = (optionalCatchAll || catchAll)[1];
      const remaining = pathParts.slice(pathIndex).map(decodeURIComponent);
      if (!remaining.length && catchAll) return null;
      if (remaining.length) params[name] = remaining;
      pathIndex = pathParts.length;
      continue;
    }

    if (dynamic) {
      if (pathIndex >= pathParts.length) return null;
      params[dynamic[1]] = decodeURIComponent(pathParts[pathIndex]);
      pathIndex += 1;
      continue;
    }

    if (routePart !== pathParts[pathIndex]) return null;
    pathIndex += 1;
  }

  return pathIndex === pathParts.length ? params : null;
}

function resolveCompiledAppRoute(appPathsManifest, pathname) {
  const matches = [];

  for (const [routeKey, compiledPath] of Object.entries(appPathsManifest)) {
    const params = matchAppRoute(routeKey, pathname);
    if (!params) continue;
    matches.push({
      compiledPath: path.join(serverOutput, compiledPath),
      params,
      dynamicSegments: (routeKey.match(/\[/g) || []).length,
    });
  }

  matches.sort((left, right) => left.dynamicSegments - right.dynamicSegments);
  return matches[0] || null;
}

async function readSitemapPaths() {
  const [robots, appPathsManifest] = await Promise.all([
    readFile(robotsOutput, "utf8"),
    readFile(appPathsManifestPath, "utf8").then(JSON.parse),
  ]);
  const advertised = extractAdvertisedSitemapUrls(robots);
  if (!advertised.length) {
    throw new Error("Rendered robots.txt does not advertise a sitemap.");
  }

  const { paths } = await collectSitemapPaths({
    sitemapUrls: advertised,
    readSitemap: async (sitemapUrl) => {
      const url = new URL(sitemapUrl);
      const pathname = normalizePathname(url.pathname);
      const relativePath = pathname.replace(/^\/+/, "");
      const compiledRoute = resolveCompiledAppRoute(appPathsManifest, pathname);
      if (!compiledRoute) {
        throw new Error(`No compiled app route owns sitemap ${pathname}.`);
      }

      return readRenderedSitemapXml({
        staticOutputPath: path.join(appOutput, `${relativePath}.body`),
        dynamicRoutePath: compiledRoute.compiledPath,
        dynamicRouteWorkingDirectory: webRoot,
        dynamicRouteRequest: new Request(sitemapUrl),
        dynamicRouteContext: { params: Promise.resolve(compiledRoute.params) },
      });
    },
  });

  return paths;
}

async function readNoindexResponseHeaderRules() {
  const routesManifest = await readFile(routesManifestPath, "utf8").then(
    JSON.parse,
  );
  return compileNoindexResponseHeaderRules(routesManifest);
}

function addIssue(items, message) {
  if (!items.includes(message)) items.push(message);
}

const [files, sitemapPaths, buildId, noindexResponseHeaderRules] =
  await Promise.all([
    collectHtmlFiles(appOutput),
    readSitemapPaths(),
    readFile(buildIdPath, "utf8")
      .then((value) => value.trim())
      .catch(() => null),
    readNoindexResponseHeaderRules(),
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
  const googlebot = getMetaValues(html, "name", "googlebot")
    .join(",")
    .toLowerCase();
  const metaNoindex = /\bnoindex\b/.test(`${robots},${googlebot}`);
  const responseHeaderNoindex = hasNoindexResponseHeader(
    route,
    noindexResponseHeaderRules,
  );
  const noindex = metaNoindex || responseHeaderNoindex;
  const canonical = canonicals[0] || "";
  const canonicalPath = canonicalPathname(canonical);
  const sitemapIncluded = sitemapPaths.has(route);
  const canonicalInSitemap = canonicalPath
    ? sitemapPaths.has(canonicalPath)
    : false;
  const ownsCanonical = Boolean(canonicalPath && canonicalPath === route);
  const issues = [];
  const advisories = [];
  const title = titles[0] || "";
  const description = descriptions[0] || "";
  const intentionalSitemapOmission = Boolean(
    canonical &&
    !canonicalInSitemap &&
    isIntentionalSitemapOmission({ route: canonicalPath || route, title }),
  );
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const schemaCount = findTags(html, "script").filter(
    (tag) =>
      String(tag.attributes.type || "").toLowerCase() === "application/ld+json",
  ).length;

  if (noindex && sitemapIncluded) {
    addIssue(issues, "Noindex route is present in sitemap");
  }

  if (!noindex) {
    if (titles.length !== 1)
      addIssue(issues, `Expected one title; rendered ${titles.length}`);
    if (descriptions.length !== 1) {
      addIssue(
        issues,
        `Expected one description; rendered ${descriptions.length}`,
      );
    }
    if (canonicals.length !== 1) {
      addIssue(issues, `Expected one canonical; rendered ${canonicals.length}`);
    }
    if (canonical && !canonicalInSitemap && !intentionalSitemapOmission) {
      addIssue(issues, "Canonical target is missing from sitemap");
    }
    const quality = classifyRenderedContentQuality({
      title,
      titleCount: titles.length,
      description,
      descriptionCount: descriptions.length,
      h1Count,
    });
    for (const issue of quality.issues) addIssue(issues, issue);
    for (const advisory of quality.advisories) {
      addIssue(advisories, advisory);
    }
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
    indexDirectiveSource: responseHeaderNoindex
      ? "response-header"
      : "metadata",
    title,
    descriptionLength: description.length,
    canonical,
    canonicalPath,
    ownsCanonical,
    sitemapIncluded,
    canonicalInSitemap,
    intentionalSitemapOmission,
    h1Count,
    schemaCount,
    issues,
    advisories,
    score: clampScore(100 - issues.length * 25 - advisories.length * 4),
  });
}

for (const [canonicalPath, owners] of canonicalOwners) {
  const canonicalOwnerRoutes = owners.filter(
    (route) => route === canonicalPath,
  );
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
      scores.reduce((sum, value) => sum + value, 0) /
        Math.max(1, scores.length),
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
  (route) =>
    route.canonical &&
    !route.canonicalInSitemap &&
    !route.intentionalSitemapOmission,
);
const intentionalSitemapOmissions = indexable.filter(
  (route) => route.canonical && route.intentionalSitemapOmission,
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
  qualityOk: passesStrictQuality({
    routesWithIssues: routesWithIssues.length,
    indexConflicts: indexConflicts.length,
    missingCanonicalTargets: missingCanonicalTargets.length,
  }),
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
  await writeFile(
    absoluteOutput,
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
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
