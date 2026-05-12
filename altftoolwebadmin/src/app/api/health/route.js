import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { getAdminDb, getFirebaseAdminConfigStatus } from "@/lib/firebaseAdmin";

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
          category: getToolCategories(tool).join(", ") || "Uncategorized",
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

function buildRecommendations({ tools, seo, content, automation, firebaseAdmin }) {
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

  if (content.score < 100) {
    recommendations.push("Refresh content data so blogs, stores, deals, and news all stay populated.");
  }

  if (automation.score < 100) {
    recommendations.push("Keep smoke and route audits wired into full validation before every release.");
  }

  if (firebaseAdmin.score < 100) {
    recommendations.push("Configure Firebase Admin service-account env vars before testing admin write actions in production.");
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

    const [tools, seo, content, automation, firebaseAdmin] = await Promise.all([
      buildToolQuality(webRoot),
      buildSeoReadiness(webRoot),
      buildContentReadiness(webRoot),
      buildAutomationReadiness(workspaceRoot),
      buildFirebaseAdminReadiness(),
    ]);

    const overallScore = clampScore(
      tools.averageScore * 0.45 +
        seo.score * 0.2 +
        content.score * 0.15 +
        automation.score * 0.1 +
        firebaseAdmin.score * 0.1,
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
      seo,
      content,
      automation,
      firebaseAdmin,
      recommendations: buildRecommendations({ tools, seo, content, automation, firebaseAdmin }),
    });
  } catch (error) {
    const message = error?.message || "Health audit failed.";
    const status = message === "Unauthorized" ? 401 : 500;
    console.error("Health audit failed:", error);

    return NextResponse.json({ error: message }, { status });
  }
}
