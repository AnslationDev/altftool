import { promises as fs } from "node:fs";
import path from "node:path";
import { TOP_PRIORITY_TOOL_SLUGS, normalizeToolCategory } from "@altftool/core/toolHealth";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const webRoot = path.join(workspaceRoot, "altftoolweb");
const manifestPath = path.join(
  workspaceRoot,
  "altftoolwebadmin/src/data/healthManifest.json",
);

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
const IGNORED_TOOL_DIRS = new Set(["_toolfk-suite"]);
const VALID_ENTRY_FILES = ["entry.js", "entry.jsx", "entry.ts", "entry.tsx"];

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

async function hasToolEntry(toolRoot, slug) {
  const checks = await Promise.all(
    VALID_ENTRY_FILES.map((file) => fileExists(path.join(toolRoot, slug, file))),
  );
  return checks.some(Boolean);
}

async function readToolMetaMap() {
  const source = await readText(path.join(webRoot, "src/platform/registry/toolMetaMap.js"));
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

async function buildToolQuality(toolMetaMap) {
  const toolRoot = path.join(webRoot, "src/tools");
  const toolDirs = (await listDirectories(toolRoot)).filter(
    (slug) => !IGNORED_TOOL_DIRS.has(slug) && !slug.startsWith("."),
  );
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
          hasToolEntry(toolRoot, slug).then((ok) => ({
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

async function buildPriorityQaReadiness(toolMetaMap) {
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

async function buildSeoReadiness() {
  const packageJson = await readJson(path.join(workspaceRoot, "package.json"), {});
  const scripts = packageJson.scripts || {};
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
    {
      key: "blogSeoAudit",
      label: "Blog SEO readiness gate",
      detail: "npm run seo:blog-check",
      ok:
        Boolean(scripts["seo:blog-check"]) &&
        (await fileExists(path.join(workspaceRoot, "scripts/check-blog-seo-readiness.mjs"))),
    },
  ];

  return {
    score: clampScore((checks.filter((check) => check.ok).length / checks.length) * 100),
    checks,
  };
}

async function buildContentReadiness() {
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

async function buildAutomationReadiness() {
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

async function buildManifest() {
  const toolMetaMap = await readToolMetaMap();
  const [tools, qa, seo, content, automation] = await Promise.all([
    buildToolQuality(toolMetaMap),
    buildPriorityQaReadiness(toolMetaMap),
    buildSeoReadiness(),
    buildContentReadiness(),
    buildAutomationReadiness(),
  ]);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    tools,
    qa,
    seo,
    content,
    automation,
  };
}

const manifest = await buildManifest();
const previousContent = await readText(manifestPath);
let previousManifest = null;

try {
  previousManifest = previousContent ? JSON.parse(previousContent) : null;
} catch {
  previousManifest = null;
}

function comparableManifest(value) {
  if (!value) return null;
  const { generatedAt, ...rest } = value;
  return rest;
}

if (
  previousManifest &&
  JSON.stringify(comparableManifest(previousManifest)) === JSON.stringify(comparableManifest(manifest))
) {
  manifest.generatedAt = previousManifest.generatedAt || manifest.generatedAt;
}

const nextContent = `${JSON.stringify(manifest, null, 2)}\n`;

if (previousContent !== nextContent) {
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, nextContent, "utf8");
}

console.log(
  `Admin health manifest ready: ${manifest.tools.total} tools, ${manifest.qa.functionalCovered}/${manifest.qa.total} priority functional flows.`,
);
