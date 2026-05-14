import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { getAdminDb, getFirebaseAdminConfigStatus } from "@/lib/firebaseAdmin";
import { createVercelDeployReadinessReport } from "@altftool/core/deployReadiness";
import { TOP_PRIORITY_TOOL_SLUGS, normalizeToolCategory } from "@altftool/core/toolHealth";

export const dynamic = "force-dynamic";

const TOOL_CHECKS = [
  { key: "name", label: "Name", test: (tool) => Boolean(String(tool?.name || "").trim()) },
  {
    key: "description",
    label: "Description",
    test: (tool) => Boolean(String(tool?.description || "").trim()),
  },
  {
    key: "category",
    label: "Category",
    test: (tool) =>
      Array.isArray(tool?.category)
        ? tool.category.some((category) => String(category || "").trim())
        : Boolean(String(tool?.category || "").trim()),
  },
  { key: "icon", label: "Icon", test: (tool) => Boolean(String(tool?.icon || "").trim()) },
];

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizeUrl(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function appendPath(baseUrl, suffix) {
  if (!baseUrl) return "";
  return `${baseUrl}${suffix.startsWith("/") ? suffix : `/${suffix}`}`;
}

function currentCommitSha() {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    null
  );
}

function slugify(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function readText(filePath, fallback = "") {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return fallback;
  }
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function listDirectories(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function readToolMetaMap(webRoot) {
  const source = await readText(
    path.join(webRoot, "src/platform/registry/toolMetaMap.js"),
  );
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error("Unable to parse tool registry.");
  }

  return JSON.parse(match[1]);
}

function getToolCategories(tool) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

function hasSlugReference(source, slug) {
  return source.includes(`"${slug}"`) || source.includes(`'${slug}'`);
}

async function buildToolQuality(webRoot) {
  const toolMetaMap = await readToolMetaMap(webRoot);
  const toolRoot = path.join(webRoot, "src/tools");
  const toolDirs = await listDirectories(toolRoot);
  const registrySlugs = new Set(Object.keys(toolMetaMap));
  const directorySlugs = new Set(toolDirs);
  const categorySlugs = new Set();

  const items = await Promise.all(
    Object.entries(toolMetaMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(async ([slug, tool]) => {
        for (const category of getToolCategories(tool)) {
          const categorySlug = slugify(category);
          if (categorySlug) categorySlugs.add(categorySlug);
        }

        const checks = await Promise.all([
          ...TOOL_CHECKS.map(async (check) => ({
            key: check.key,
            label: check.label,
            ok: check.test(tool),
          })),
          fileExists(path.join(toolRoot, slug, "entry.jsx")).then((ok) => ({
            key: "entry",
            label: "Entry component",
            ok,
          })),
          fileExists(path.join(toolRoot, slug, "tool.config.js")).then((ok) => ({
            key: "config",
            label: "Tool config",
            ok,
          })),
        ]);

        const issues = checks
          .filter((check) => !check.ok)
          .map((check) => `${check.label} missing`);

        return {
          slug,
          name: tool?.name || slug,
          category: normalizeToolCategory(tool?.category),
          score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
          issues,
        };
      }),
  );

  const orphanToolDirs = toolDirs.filter((slug) => !registrySlugs.has(slug));
  const registryWithoutDir = [...registrySlugs].filter((slug) => !directorySlugs.has(slug)).sort();
  const total = items.length;
  const healthy = items.filter((item) => item.issues.length === 0).length;
  const averageScore = clampScore(
    total ? items.reduce((sum, item) => sum + item.score, 0) / total : 0,
  );

  return {
    total,
    healthy,
    needsAttention: total - healthy,
    averageScore,
    categories: categorySlugs.size,
    directories: toolDirs.length,
    orphanToolDirs,
    registryWithoutDir,
    missingEntry: items.filter((item) =>
      item.issues.some((issue) => issue.startsWith("Entry component")),
    ).length,
    missingConfig: items.filter((item) =>
      item.issues.some((issue) => issue.startsWith("Tool config")),
    ).length,
    missingMetadata: items.filter((item) =>
      item.issues.some((issue) =>
        ["Name", "Description", "Category", "Icon"].some((label) => issue.startsWith(label)),
      ),
    ).length,
    topIssues: items
      .filter((item) => item.issues.length > 0)
      .sort((a, b) => a.score - b.score || a.slug.localeCompare(b.slug))
      .slice(0, 12),
  };
}

async function buildPriorityQaReadiness(workspaceRoot, webRoot) {
  const toolMetaMap = await readToolMetaMap(webRoot);
  const packageJson = await readJson(path.join(workspaceRoot, "package.json"), {});
  const scripts = packageJson.scripts || {};
  const prioritySpecPath = path.join(workspaceRoot, "tests/tool-priority.spec.mjs");
  const functionalSpecPath = path.join(workspaceRoot, "tests/tool-functional.spec.mjs");
  const [prioritySpecExists, functionalSpecExists, prioritySpecSource, functionalSpecSource] =
    await Promise.all([
      fileExists(prioritySpecPath),
      fileExists(functionalSpecPath),
      readText(prioritySpecPath),
      readText(functionalSpecPath),
    ]);
  const usesSharedPriorityList = prioritySpecSource.includes("TOP_PRIORITY_TOOL_SLUGS");

  const tools = TOP_PRIORITY_TOOL_SLUGS.map((slug, index) => {
    const tool = toolMetaMap[slug];
    const registered = Boolean(tool);
    const routeCovered =
      prioritySpecExists && registered && (usesSharedPriorityList || hasSlugReference(prioritySpecSource, slug));

    return {
      rank: index + 1,
      slug,
      name: tool?.name || slug,
      category: normalizeToolCategory(tool?.category),
      route: `/tools/all/${slug}`,
      registered,
      routeCovered,
      functionalCovered: functionalSpecExists && hasSlugReference(functionalSpecSource, slug),
    };
  });

  const total = tools.length;
  const registered = tools.filter((tool) => tool.registered).length;
  const routeCovered = tools.filter((tool) => tool.routeCovered).length;
  const functionalCovered = tools.filter((tool) => tool.functionalCovered).length;
  const routeScriptReady = Boolean(scripts["test:tools:priority"]);

  const checks = [
    {
      key: "priorityList",
      label: "Priority tool list",
      detail: `${total} high-traffic tools tracked`,
      ok: total >= 40,
    },
    {
      key: "prioritySpec",
      label: "Priority route QA spec",
      detail: "tests/tool-priority.spec.mjs",
      ok: prioritySpecExists,
    },
    {
      key: "priorityScript",
      label: "Priority QA script",
      detail: "npm run test:tools:priority",
      ok: routeScriptReady,
    },
    {
      key: "registeredTools",
      label: "Priority slugs registered",
      detail: `${registered}/${total}`,
      ok: registered === total,
    },
    {
      key: "routeCoverage",
      label: "Priority route coverage",
      detail: `${routeCovered}/${total}`,
      ok: routeCovered === total,
    },
    {
      key: "functionalSpec",
      label: "Functional regression spec",
      detail: "tests/tool-functional.spec.mjs",
      ok: functionalSpecExists && Boolean(scripts["test:tools:functional"]),
    },
  ];

  return {
    score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
    total,
    registered,
    routeCovered,
    functionalCovered,
    checks,
    tools,
    needsAttention: tools.filter((tool) => !tool.registered || !tool.routeCovered),
  };
}

async function buildSeoReadiness(webRoot) {
  const checks = [
    {
      key: "sitemap",
      label: "Sitemap route",
      detail: "/sitemap.xml",
      ok: await fileExists(path.join(webRoot, "src/app/sitemap.js")),
    },
    {
      key: "robots",
      label: "Robots route",
      detail: "/robots.txt",
      ok: await fileExists(path.join(webRoot, "src/app/robots.js")),
    },
    {
      key: "jsonLd",
      label: "JSON-LD component",
      detail: "Structured data renderer",
      ok: await fileExists(path.join(webRoot, "src/platform/seo/JsonLd.jsx")),
    },
    {
      key: "metadata",
      label: "Metadata helpers",
      detail: "Canonical, Open Graph, Twitter",
      ok: await fileExists(path.join(webRoot, "src/platform/seo/generateMetadata.js")),
    },
  ];

  return {
    score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
    checks,
  };
}

async function buildContentReadiness(webRoot) {
  const blogsData = await readJson(path.join(webRoot, "src/app/blogs/data/blogs.json"), {});
  const buySmartStores = await readJson(path.join(webRoot, "src/app/buysmart/data/stores.json"), []);
  const dealData = await readJson(path.join(webRoot, "src/app/exclusivedeals/(data)/db.json"), {});
  const newsData = await readJson(path.join(webRoot, "public/data/newsdata.json"), {});

  const dealCategories = Array.isArray(dealData.categories) ? dealData.categories : [];
  const dealBrands = dealCategories.reduce(
    (sum, category) => sum + (Array.isArray(category.brands) ? category.brands.length : 0),
    0,
  );

  const metrics = [
    { key: "blogs", label: "Blog posts", value: blogsData.blogs?.length || 0, ok: (blogsData.blogs?.length || 0) > 0 },
    { key: "buySmartStores", label: "BuySmart stores", value: buySmartStores.length || 0, ok: buySmartStores.length > 0 },
    { key: "dealCategories", label: "Deal categories", value: dealCategories.length, ok: dealCategories.length > 0 },
    { key: "dealBrands", label: "Deal brands", value: dealBrands, ok: dealBrands > 0 },
    { key: "news", label: "News items", value: newsData.news?.length || 0, ok: (newsData.news?.length || 0) > 0 },
  ];

  return {
    score: clampScore((metrics.filter((metric) => metric.ok).length / metrics.length) * 100),
    metrics,
  };
}

async function buildAutomationReadiness(workspaceRoot) {
  const packageJson = await readJson(path.join(workspaceRoot, "package.json"), {});
  const scripts = packageJson.scripts || {};
  const checks = [
    {
      key: "routeAudit",
      label: "Route audit spec",
      detail: "tests/route-audit.spec.mjs",
      ok: await fileExists(path.join(workspaceRoot, "tests/route-audit.spec.mjs")),
    },
    {
      key: "smokeSpec",
      label: "Smoke spec",
      detail: "tests/smoke.spec.mjs",
      ok: await fileExists(path.join(workspaceRoot, "tests/smoke.spec.mjs")),
    },
    {
      key: "routeScript",
      label: "Route test script",
      detail: "npm run test:routes",
      ok: Boolean(scripts["test:routes"]),
    },
    {
      key: "fullValidation",
      label: "Full validation script",
      detail: "npm run validate:full",
      ok: Boolean(scripts["validate:full"]),
    },
    {
      key: "buildScripts",
      label: "Build scripts",
      detail: "Web and admin builds",
      ok: Boolean(scripts["build:web"] && scripts["build:admin"]),
    },
  ];

  return {
    score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
    checks,
  };
}

async function buildFirebaseAdminReadiness() {
  const config = getFirebaseAdminConfigStatus();
  const checks = [
    {
      key: "projectId",
      label: "Project ID",
      ok: !config.missing.includes("FIREBASE_PROJECT_ID"),
    },
    {
      key: "clientEmail",
      label: "Service-account email",
      ok:
        config.clientEmailConfigured &&
        !config.invalid.some((message) => message.includes("FIREBASE_CLIENT_EMAIL")),
    },
    {
      key: "privateKey",
      label: "Private key",
      ok:
        config.privateKeyConfigured &&
        config.privateKeyLooksComplete &&
        !config.invalid.some((message) => message.includes("FIREBASE_PRIVATE_KEY")),
    },
  ];
  const firestoreProbe = {
    key: "firestoreRead",
    label: "Firestore Admin SDK read",
    ok: false,
    skipped: !config.ok,
  };

  if (config.ok) {
    try {
      await getAdminDb().collection("admins").limit(1).get();
      firestoreProbe.ok = true;
      firestoreProbe.skipped = false;
    } catch (error) {
      firestoreProbe.error = error?.message || "Firestore read failed.";
      firestoreProbe.skipped = false;
    }
  }

  const allChecks = [...checks, firestoreProbe];

  return {
    score: clampScore((allChecks.filter((check) => check.ok).length / allChecks.length) * 100),
    status: config.ok && firestoreProbe.ok ? "ready" : "needs-config",
    projectId: config.projectId,
    missing: config.missing,
    invalid: config.invalid,
    checks: allChecks,
  };
}

function buildVercelDeployReadiness(workspaceRoot) {
  const report = createVercelDeployReadinessReport({
    root: workspaceRoot,
    env: process.env,
  });
  const totals = report.results.reduce(
    (summary, result) => {
      summary.present += result.present.length;
      summary.missing += result.missing.length;
      return summary;
    },
    { present: 0, missing: 0 },
  );
  const total = totals.present + totals.missing;

  return {
    ...report,
    score: clampScore(total ? (totals.present / total) * 100 : 0),
    missingSecrets: report.results.flatMap((result) =>
      result.missing.map((item) => ({
        target: result.name,
        label: item.label,
        names: item.names,
        displayName: item.displayName,
      })),
    ),
  };
}

async function fetchJsonWithTimeout(url, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = performance.now();
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const text = await response.text();
    const payload = JSON.parse(text);

    return {
      response,
      payload,
      durationMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function buildProductionFreshness() {
  const webUrl = normalizeUrl(
    process.env.ALTFT_MONITOR_WEB_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://altftool.com",
  );
  const healthUrl = appendPath(webUrl, "/api/health");
  const expectedCommit = currentCommitSha();

  if (!webUrl) {
    return {
      score: 0,
      status: "not-configured",
      url: null,
      healthUrl: null,
      expectedCommit,
      productionCommit: null,
      checks: [
        {
          key: "webUrl",
          label: "Production web URL",
          detail: "ALTFT_MONITOR_WEB_URL or NEXT_PUBLIC_SITE_URL",
          ok: false,
        },
      ],
    };
  }

  const checks = [
    {
      key: "webUrl",
      label: "Production web URL",
      detail: webUrl,
      ok: true,
    },
  ];

  try {
    const { response, payload, durationMs } = await fetchJsonWithTimeout(healthUrl);
    const productionCommit = payload?.release?.commitSha || null;
    const commitMatches = !expectedCommit || !productionCommit || expectedCommit === productionCommit;
    const healthOk = response.ok && ["healthy", "watch"].includes(payload?.overall?.status);

    checks.push(
      {
        key: "healthEndpoint",
        label: "Public health endpoint",
        detail: `${response.status} in ${durationMs}ms`,
        ok: response.ok,
      },
      {
        key: "publicHealth",
        label: "Public web health",
        detail: payload?.overall?.label || payload?.overall?.status || "Unknown",
        ok: healthOk,
      },
      {
        key: "commitFreshness",
        label: "Deployment freshness",
        detail: productionCommit
          ? `production ${productionCommit.slice(0, 8)}${expectedCommit ? `, expected ${expectedCommit.slice(0, 8)}` : ""}`
          : "Production commit is not exposed yet.",
        ok: commitMatches && Boolean(productionCommit || !expectedCommit),
      },
    );

    const score = clampScore((checks.filter((check) => check.ok).length / checks.length) * 100);

    return {
      score,
      status: score >= 90 ? "fresh" : score >= 60 ? "watch" : "stale",
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit,
      durationMs,
      publicHealth: payload?.overall || null,
      checks,
    };
  } catch (error) {
    checks.push({
      key: "healthEndpoint",
      label: "Public health endpoint",
      detail: healthUrl,
      ok: false,
      error: error?.name === "AbortError" ? "Timed out." : error?.message || "Request failed.",
    });

    return {
      score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
      status: "stale-or-unavailable",
      url: webUrl,
      healthUrl,
      expectedCommit,
      productionCommit: null,
      checks,
      error: error?.name === "AbortError" ? "Timed out." : error?.message || "Production health check failed.",
    };
  }
}

function buildRecommendations({ tools, qa, seo, content, automation, firebaseAdmin, deploy, production }) {
  const recommendations = [];

  if (tools.missingEntry || tools.missingConfig) {
    recommendations.push(
      `Fix ${tools.missingEntry} missing entry files and ${tools.missingConfig} missing config files before adding more tools.`,
    );
  }

  if (tools.orphanToolDirs.length) {
    recommendations.push(
      `${tools.orphanToolDirs.length} tool folders are not registered. Add them to the registry or archive them.`,
    );
  }

  if (tools.registryWithoutDir.length) {
    recommendations.push(
      `${tools.registryWithoutDir.length} registered tools do not have source folders.`,
    );
  }

  if (seo.score < 100) {
    recommendations.push("Complete sitemap, robots, metadata, and JSON-LD coverage for crawl readiness.");
  }

  if (qa.score < 100) {
    recommendations.push(
      `Keep the top ${qa.total} tool route QA pack green before shipping public tool updates.`,
    );
  }

  if (content.score < 100) {
    recommendations.push("Refresh content data so blogs, stores, deals, and news all stay populated.");
  }

  if (automation.score < 100) {
    recommendations.push("Keep smoke and route audits wired into full validation before every release.");
  }

  if (firebaseAdmin.score < 100) {
    recommendations.push("Configure Firebase Admin service-account env vars before testing admin write actions in production.");
  }

  if (deploy.score < 100) {
    recommendations.push("Add the missing Vercel deploy secrets so web and admin production deployments can run from CI.");
  }

  if (production.score < 100) {
    recommendations.push("Deploy the latest public web build, then confirm the production /api/health endpoint reports a fresh commit.");
  }

  if (!recommendations.length) {
    recommendations.push("System health is clean. Keep using validate:full before release pushes.");
  }

  return recommendations;
}

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);

    const adminRoot = process.cwd();
    const workspaceRoot = path.resolve(adminRoot, "..");
    const webRoot = path.join(workspaceRoot, "altftoolweb");

    const [tools, qa, seo, content, automation, firebaseAdmin, production] = await Promise.all([
      buildToolQuality(webRoot),
      buildPriorityQaReadiness(workspaceRoot, webRoot),
      buildSeoReadiness(webRoot),
      buildContentReadiness(webRoot),
      buildAutomationReadiness(workspaceRoot),
      buildFirebaseAdminReadiness(),
      buildProductionFreshness(),
    ]);
    const deploy = buildVercelDeployReadiness(workspaceRoot);

    const overallScore = clampScore(
      tools.averageScore * 0.25 +
        qa.score * 0.15 +
        seo.score * 0.1 +
        content.score * 0.1 +
        automation.score * 0.1 +
        firebaseAdmin.score * 0.1 +
        deploy.score * 0.1 +
        production.score * 0.1,
    );
    const status = overallScore >= 90 ? "healthy" : overallScore >= 75 ? "watch" : "attention";

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      overall: {
        score: overallScore,
        status,
        label:
          status === "healthy"
            ? "Release ready"
            : status === "watch"
              ? "Needs review"
              : "Needs attention",
      },
      tools,
      qa,
      seo,
      content,
      automation,
      firebaseAdmin,
      deploy,
      production,
      recommendations: buildRecommendations({
        tools,
        qa,
        seo,
        content,
        automation,
        firebaseAdmin,
        deploy,
        production,
      }),
    });
  } catch (error) {
    const message = error?.message || "Health audit failed.";
    const status = message === "Unauthorized" ? 401 : 500;
    console.error("Health audit failed:", error);

    return NextResponse.json({ error: message }, { status });
  }
}
