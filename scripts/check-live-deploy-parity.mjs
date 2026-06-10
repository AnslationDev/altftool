import { spawnSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const DEFAULT_WEB_URL = "https://altftool.com";

function hasFlag(name, args = process.argv.slice(2)) {
  return args.includes(name);
}

function argValue(name, fallback = "", args = process.argv.slice(2)) {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);

  const index = args.indexOf(name);
  if (index >= 0 && args[index + 1]) return args[index + 1];

  return fallback;
}

function envFlag(name) {
  return ["1", "true", "yes", "on"].includes(String(process.env[name] || "").trim().toLowerCase());
}

function normalizeUrl(value = DEFAULT_WEB_URL) {
  return String(value || DEFAULT_WEB_URL).trim().replace(/\/+$/, "");
}

function appendPath(baseUrl, suffix) {
  return `${normalizeUrl(baseUrl)}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

function gitOutput(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
  });

  return result.status === 0 ? result.stdout.trim() : "";
}

function getExpectedCommit() {
  return process.env.ALTFT_EXPECTED_COMMIT || gitOutput(["rev-parse", "HEAD"]);
}

function getDirtyFiles() {
  return gitOutput(["status", "--porcelain"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

async function readJson(relativePath) {
  return JSON.parse(await fsp.readFile(path.join(root, relativePath), "utf8"));
}

export async function loadLocalParitySnapshot() {
  const [manifest, routeQa, blogContent] = await Promise.all([
    readJson("altftoolwebadmin/src/data/healthManifest.json"),
    readJson("altftoolwebadmin/src/data/routeQaReport.json"),
    readJson("altftoolwebadmin/src/data/blogContentHealthReport.json"),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    healthManifest: {
      generatedAt: manifest.generatedAt,
      tools: manifest.tools,
      qa: manifest.qa,
      seo: manifest.seo,
      content: manifest.content,
      automation: manifest.automation,
    },
    routeQa: {
      checkedAt: routeQa.checkedAt || null,
      ok: Boolean(routeQa.ok),
      score: Number(routeQa.score || 0),
      totals: routeQa.totals || {},
    },
    blogContent: {
      generatedAt: blogContent.generatedAt || null,
      ok: Boolean(blogContent.ok),
      score: Number(blogContent.score || 0),
      totals: blogContent.totals || {},
    },
  };
}

function createCheck({ key, label, status, score, detail, nextAction = "", expected = null, actual = null, meta = {} }) {
  return {
    key,
    label,
    status,
    score: Math.max(0, Math.min(100, Math.round(Number(score) || 0))),
    detail,
    nextAction,
    expected,
    actual,
    meta,
  };
}

function countsFor(checks) {
  return checks.reduce(
    (counts, check) => {
      counts[check.status] += 1;
      return counts;
    },
    { pass: 0, warn: 0, block: 0 },
  );
}

function finalStatus(checks, strict = false) {
  const counts = countsFor(checks);
  if (counts.block > 0) return "blocked";
  if (strict && counts.warn > 0) return "blocked";
  if (counts.warn > 0) return "watch";
  return "ready";
}

async function fetchWithTimeout(url, { timeoutMs = 12000, as = "json", fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetchImpl(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    let body = text;

    if (as === "json") {
      try {
        body = JSON.parse(text);
      } catch (error) {
        throw new Error(`JSON parse failed for ${url}: ${error?.message || error}`);
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
      body,
      text,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function countMatches(text = "", pattern) {
  return (String(text).match(pattern) || []).length;
}

async function collectLiveSnapshot({ webUrl = DEFAULT_WEB_URL, timeoutMs = 12000, fetchImpl = fetch } = {}) {
  const baseUrl = normalizeUrl(webUrl);
  const [health, sitemap, rss, blogs] = await Promise.all([
    fetchWithTimeout(appendPath(baseUrl, "/api/health"), { timeoutMs, as: "json", fetchImpl }),
    fetchWithTimeout(appendPath(baseUrl, "/sitemap.xml"), { timeoutMs, as: "text", fetchImpl }),
    fetchWithTimeout(appendPath(baseUrl, "/rss.xml"), { timeoutMs, as: "text", fetchImpl }),
    fetchWithTimeout(appendPath(baseUrl, "/api/blogs?offset=0&limit=100"), { timeoutMs, as: "json", fetchImpl }),
  ]);

  return {
    webUrl: baseUrl,
    fetchedAt: new Date().toISOString(),
    health: {
      status: health.status,
      durationMs: health.durationMs,
      payload: health.body,
    },
    sitemap: {
      status: sitemap.status,
      durationMs: sitemap.durationMs,
      locCount: countMatches(sitemap.text, /<loc>/g),
      hasUrlSet: /<urlset[\s>]/i.test(sitemap.text),
      hasPriorityTool: sitemap.text.includes("/tools/all/api-stress-estimator"),
      hasPriorityBlog: sitemap.text.includes("/blogs/age-calculator-guide"),
    },
    rss: {
      status: rss.status,
      durationMs: rss.durationMs,
      hasRss: /<rss[\s>]/i.test(rss.text),
      itemCount: countMatches(rss.text, /<item>/g),
    },
    blogs: {
      status: blogs.status,
      durationMs: blogs.durationMs,
      posts: Array.isArray(blogs.body?.posts) ? blogs.body.posts.length : 0,
      hasMore: Boolean(blogs.body?.hasMore),
      source: blogs.body?.source || "live-or-unspecified",
      firstSlug: blogs.body?.posts?.[0]?.slug || null,
    },
  };
}

function analyzeParity({ local, live, expectedCommit = "", strict = false, requireCommit = false }) {
  const health = live.health.payload || {};
  const liveCommit = String(health.release?.commitSha || "");
  const expectedShort = String(expectedCommit || "").slice(0, 8);
  const liveShort = liveCommit.slice(0, 8);
  const localTools = Number(local.healthManifest?.tools?.total || 0);
  const localPriorityTools = Number(local.healthManifest?.qa?.registered || local.healthManifest?.qa?.total || 0);
  const localBlogs = Number(local.blogContent?.totals?.total || 0);
  const localReadyBlogs = Number(local.blogContent?.totals?.ready || 0);
  const localRoutes = Number(local.routeQa?.totals?.routes || 0);
  const liveHealthScore = Number(health.overall?.score || 0);
  const liveTools = Number(health.tools?.total || 0);
  const livePriorityTools = Number(health.tools?.priorityRegistered || 0);
  const liveBlogs = Number(health.content?.localBlogs || 0);
  const liveFirebaseScore = Number(health.firebase?.score || 0);
  const commitMissing = !liveCommit || !expectedCommit;
  const commitMatches = !commitMissing && liveShort === expectedShort;

  const checks = [
    createCheck({
      key: "health-api",
      label: "Live health API",
      status: live.health.status === 200 && health.service === "altftool-web" && ["healthy", "watch"].includes(health.overall?.status) ? "pass" : "block",
      score: liveHealthScore,
      detail: `HTTP ${live.health.status}; status ${health.overall?.status || "unknown"}; score ${liveHealthScore}.`,
      nextAction: "Fix /api/health or deploy the latest public web build.",
      expected: { service: "altftool-web", minScore: strict ? 95 : 90 },
      actual: { service: health.service, score: liveHealthScore, status: health.overall?.status || null },
    }),
    createCheck({
      key: "release-commit",
      label: "Release commit freshness",
      status: commitMatches ? "pass" : requireCommit || (!commitMissing && strict) ? "block" : "warn",
      score: commitMatches ? 100 : commitMissing ? 70 : 45,
      detail: commitMatches
        ? `Live commit ${liveShort} matches expected ${expectedShort}.`
        : commitMissing
          ? `Commit comparison incomplete; expected ${expectedShort || "not available"}, live ${liveShort || "not exposed"}.`
          : `Live commit ${liveShort} does not match expected ${expectedShort}.`,
      nextAction: "Deploy the current main commit or rerun with ALTFT_EXPECTED_COMMIT set to the intended release SHA.",
      expected: { commit: expectedShort || null },
      actual: { commit: liveShort || null },
    }),
    createCheck({
      key: "tool-registry",
      label: "Tool registry parity",
      status: liveTools >= localTools && livePriorityTools >= localPriorityTools ? "pass" : strict ? "block" : "warn",
      score: liveTools >= localTools && livePriorityTools >= localPriorityTools ? 100 : 65,
      detail: `${liveTools}/${localTools} tools and ${livePriorityTools}/${localPriorityTools} priority tools live.`,
      nextAction: "Deploy the latest web build or refresh the local health manifest if expected counts changed.",
      expected: { tools: localTools, priorityTools: localPriorityTools },
      actual: { tools: liveTools, priorityTools: livePriorityTools },
    }),
    createCheck({
      key: "blog-content",
      label: "Blog content parity",
      status: liveBlogs >= localBlogs && live.blogs.posts > 0 && liveBlogs >= localReadyBlogs ? "pass" : strict ? "block" : "warn",
      score: liveBlogs >= localBlogs && live.blogs.posts > 0 ? 100 : live.blogs.posts > 0 ? 75 : 30,
      detail: `${liveBlogs}/${localBlogs} static blogs live; API returned ${live.blogs.posts} posts from ${live.blogs.source}.`,
      nextAction: "Check Firebase blog reads and deploy the latest blog fallback data.",
      expected: { blogs: localBlogs, readyBlogs: localReadyBlogs, apiPosts: ">0" },
      actual: { blogs: liveBlogs, apiPosts: live.blogs.posts, source: live.blogs.source },
    }),
    createCheck({
      key: "sitemap",
      label: "Sitemap parity",
      status: live.sitemap.status === 200 && live.sitemap.hasUrlSet && live.sitemap.locCount >= localRoutes && live.sitemap.hasPriorityTool && live.sitemap.hasPriorityBlog ? "pass" : strict ? "block" : "warn",
      score: live.sitemap.status === 200 && live.sitemap.hasUrlSet ? Math.min(100, Math.round((live.sitemap.locCount / Math.max(localRoutes, 1)) * 100)) : 0,
      detail: `${live.sitemap.locCount}/${localRoutes} route URLs in sitemap; priority tool ${live.sitemap.hasPriorityTool ? "present" : "missing"}; priority blog ${live.sitemap.hasPriorityBlog ? "present" : "missing"}.`,
      nextAction: "Fix sitemap generation and confirm priority tool/blog URLs are indexed.",
      expected: { minLocs: localRoutes, priorityTool: true, priorityBlog: true },
      actual: { locs: live.sitemap.locCount, priorityTool: live.sitemap.hasPriorityTool, priorityBlog: live.sitemap.hasPriorityBlog },
    }),
    createCheck({
      key: "rss",
      label: "RSS parity",
      status: live.rss.status === 200 && live.rss.hasRss && live.rss.itemCount >= Math.min(localBlogs, 10) ? "pass" : strict ? "block" : "warn",
      score: live.rss.status === 200 && live.rss.hasRss ? Math.min(100, Math.round((live.rss.itemCount / Math.max(Math.min(localBlogs, 10), 1)) * 100)) : 0,
      detail: `${live.rss.itemCount} RSS items live; expected at least ${Math.min(localBlogs, 10)}.`,
      nextAction: "Fix rss.xml generation or refresh published blog feed data.",
      expected: { minItems: Math.min(localBlogs, 10) },
      actual: { items: live.rss.itemCount },
    }),
    createCheck({
      key: "firebase-public",
      label: "Firebase public read parity",
      status: liveFirebaseScore >= 90 && Number(health.firebase?.liveBlogs || 0) > 0 ? "pass" : liveFirebaseScore >= 60 ? "warn" : "block",
      score: liveFirebaseScore,
      detail: `Firebase public score ${liveFirebaseScore}; sampled blogs ${health.firebase?.liveBlogs || 0}.`,
      nextAction: "Run npm run firebase:live-check and fix blocked public Firestore reads.",
      expected: { minScore: 90, liveBlogs: ">0" },
      actual: { score: liveFirebaseScore, liveBlogs: health.firebase?.liveBlogs || 0 },
    }),
  ];

  const counts = countsFor(checks);
  const status = finalStatus(checks, strict);
  const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);

  return {
    status,
    strict,
    requireCommit,
    score,
    counts,
    blockingChecks: checks.filter((check) => check.status === "block").map((check) => check.label),
    warningChecks: checks.filter((check) => check.status === "warn").map((check) => check.label),
    checks,
  };
}

function escapeMarkdownCell(value = "") {
  return String(value || "").replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

function statusLabel(status) {
  if (status === "pass") return "PASS";
  if (status === "warn") return "WARN";
  return "BLOCK";
}

export function renderParityMarkdown(report) {
  const lines = [
    "## AltFTool Production Parity",
    "",
    `**Status:** ${report.status}`,
    `**Score:** ${report.score}/100`,
    `**Target:** ${report.webUrl}`,
    `**Expected commit:** ${report.expectedCommitShort || "not available"}`,
    `**Live commit:** ${report.liveCommitShort || "not exposed"}`,
    `**Mode:** ${report.strict ? "strict" : "standard"}`,
    "",
    `**Summary:** ${report.counts.pass} pass, ${report.counts.warn} warn, ${report.counts.block} block`,
    "",
    "| Check | Status | Score | Detail | Next action |",
    "| --- | --- | ---: | --- | --- |",
    ...report.checks.map((check) =>
      `| ${escapeMarkdownCell(check.label)} | ${statusLabel(check.status)} | ${check.score}/100 | ${escapeMarkdownCell(check.detail)} | ${escapeMarkdownCell(check.nextAction)} |`,
    ),
    "",
  ];

  if (report.blockingChecks.length || report.warningChecks.length) {
    lines.push("### Attention Needed", "");
    if (report.blockingChecks.length) {
      lines.push(`**Blocking:** ${report.blockingChecks.map((label) => `\`${escapeMarkdownCell(label)}\``).join(", ")}`, "");
    }
    if (report.warningChecks.length) {
      lines.push(`**Warnings:** ${report.warningChecks.map((label) => `\`${escapeMarkdownCell(label)}\``).join(", ")}`, "");
    }
  } else {
    lines.push("### Attention Needed", "", "No production parity actions are open.", "");
  }

  return `${lines.join("\n")}\n`;
}

export async function buildParityReport(options = {}) {
  const webUrl = normalizeUrl(options.webUrl || process.env.ALTFT_WEB_URL || process.env.ALTFT_LIVE_URL || DEFAULT_WEB_URL);
  const timeoutMs = Number(options.timeoutMs || process.env.ALTFT_PARITY_TIMEOUT_MS || 12000);
  const strict = Boolean(options.strict);
  const expectedCommit = options.expectedCommit ?? getExpectedCommit();
  const requireCommit = Boolean(options.requireCommit);
  const [local, live] = await Promise.all([
    options.localSnapshot ? Promise.resolve(options.localSnapshot) : loadLocalParitySnapshot(),
    options.liveSnapshot ? Promise.resolve(options.liveSnapshot) : collectLiveSnapshot({ webUrl, timeoutMs, fetchImpl: options.fetchImpl || fetch }),
  ]);
  const analysis = analyzeParity({ local, live, expectedCommit, strict, requireCommit });
  const liveCommit = String(live.health?.payload?.release?.commitSha || "");
  const dirtyFiles = options.dirtyFiles || getDirtyFiles();

  return {
    generatedAt: new Date().toISOString(),
    webUrl,
    expectedCommit: expectedCommit || null,
    expectedCommitShort: expectedCommit ? String(expectedCommit).slice(0, 8) : null,
    liveCommit: liveCommit || null,
    liveCommitShort: liveCommit ? liveCommit.slice(0, 8) : null,
    dirtyFileCount: dirtyFiles.length,
    dirtyFiles: dirtyFiles.slice(0, 50),
    local: {
      healthManifestGeneratedAt: local.healthManifest?.generatedAt || null,
      routeQaCheckedAt: local.routeQa?.checkedAt || null,
      blogContentGeneratedAt: local.blogContent?.generatedAt || null,
      tools: local.healthManifest?.tools?.total || 0,
      priorityTools: local.healthManifest?.qa?.total || 0,
      routes: local.routeQa?.totals?.routes || 0,
      blogs: local.blogContent?.totals?.total || 0,
    },
    live: {
      healthStatus: live.health?.status || 0,
      healthScore: live.health?.payload?.overall?.score || 0,
      tools: live.health?.payload?.tools?.total || 0,
      priorityTools: live.health?.payload?.tools?.priorityRegistered || 0,
      blogs: live.health?.payload?.content?.localBlogs || 0,
      sitemapLocs: live.sitemap?.locCount || 0,
      rssItems: live.rss?.itemCount || 0,
      apiBlogPosts: live.blogs?.posts || 0,
      firebaseScore: live.health?.payload?.firebase?.score || 0,
    },
    ...analysis,
  };
}

function printHuman(report) {
  console.log("Production parity gate:");
  console.log(`- Target: ${report.webUrl}`);
  console.log(`- Status: ${report.status.toUpperCase()}`);
  console.log(`- Score: ${report.score}/100`);
  console.log(`- Expected commit: ${report.expectedCommitShort || "not available"}`);
  console.log(`- Live commit: ${report.liveCommitShort || "not exposed"}`);
  if (report.dirtyFileCount > 0) {
    console.log(`- Working tree: ${report.dirtyFileCount} local change(s); commit check compares HEAD unless ALTFT_EXPECTED_COMMIT is set.`);
  }

  for (const check of report.checks) {
    console.log(`\n[${statusLabel(check.status).padEnd(5, " ")}] ${check.label} (${check.score}/100)`);
    console.log(`  ${check.detail}`);
    if (check.status !== "pass") console.log(`  Next: ${check.nextAction}`);
  }
}

async function writeReportFiles(report, { outputPath = "", markdownPath = "" } = {}) {
  if (outputPath) {
    const absolute = path.resolve(root, outputPath);
    await fsp.mkdir(path.dirname(absolute), { recursive: true });
    await fsp.writeFile(absolute, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (markdownPath) {
    const absolute = path.resolve(root, markdownPath);
    await fsp.mkdir(path.dirname(absolute), { recursive: true });
    await fsp.writeFile(absolute, renderParityMarkdown(report));
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY, renderParityMarkdown(report), { flag: "a" });
  }
}

function runBrowserContract({ webUrl, expectedCommit, extraArgs = [] }) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  console.log("\nRunning live browser UX parity contract...");

  const result = spawnSync(
    npxCommand,
    ["playwright", "test", "tests/live-deploy-parity.spec.mjs", ...extraArgs],
    {
      cwd: root,
      env: {
        ...process.env,
        ALTFT_WEB_URL: webUrl,
        ALTFT_EXPECTED_COMMIT: expectedCommit || "",
        ALTFT_REUSE_SERVER: "true",
        ALTFT_SKIP_ADMIN_SERVER: "true",
      },
      stdio: "inherit",
    },
  );

  return result.status || 0;
}

async function main() {
  const args = process.argv.slice(2);
  const json = hasFlag("--json", args);
  const strict = hasFlag("--strict", args) || envFlag("ALTFT_PARITY_STRICT");
  const requireCommit = hasFlag("--require-commit", args) || envFlag("ALTFT_PARITY_REQUIRE_COMMIT");
  const noBrowser = hasFlag("--no-browser", args) || json;
  const outputPath = argValue("--output", process.env.ALTFT_PARITY_OUTPUT_PATH || "", args);
  const markdownPath = argValue("--output-md", argValue("--output-markdown", process.env.ALTFT_PARITY_MARKDOWN_PATH || "", args), args);
  const webUrl = normalizeUrl(argValue("--url", process.env.ALTFT_WEB_URL || process.env.ALTFT_LIVE_URL || DEFAULT_WEB_URL, args));
  const timeoutMs = Number(argValue("--timeout-ms", process.env.ALTFT_PARITY_TIMEOUT_MS || "12000", args));
  const valueFlags = new Set(["--output", "--output-md", "--output-markdown", "--url", "--timeout-ms"]);
  const ignoredFlags = new Set(["--json", "--strict", "--require-commit", "--no-browser"]);
  const browserArgs = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (ignoredFlags.has(arg) || arg.startsWith("--output=") || arg.startsWith("--output-md=") || arg.startsWith("--output-markdown=") || arg.startsWith("--url=") || arg.startsWith("--timeout-ms=")) {
      continue;
    }
    if (valueFlags.has(arg)) {
      index += 1;
      continue;
    }
    browserArgs.push(arg);
  }

  const report = await buildParityReport({ webUrl, strict, requireCommit, timeoutMs });
  await writeReportFiles(report, { outputPath, markdownPath });

  if (json) console.log(JSON.stringify(report, null, 2));
  else printHuman(report);

  if (report.status === "blocked") {
    process.exit(1);
  }

  if (!noBrowser) {
    const browserStatus = runBrowserContract({ webUrl, expectedCommit: report.expectedCommit || "", extraArgs: browserArgs });
    if (browserStatus !== 0) {
      console.error("\nLive browser UX parity contract failed.");
      process.exit(browserStatus || 1);
    }
    console.log("\nLive deploy parity gate passed.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    console.error(`Production parity failed: ${error?.message || error}`);
    process.exit(1);
  });
}
