import { access, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
import { PRODUCT_REGISTRY } from "@altftool/core/products";

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);

// Aggregate totals include independently lazy-loaded tools and admin modules,
// so their ceilings grow with their registries. Per-chunk ceilings remain
// fixed because they represent what one route can make a visitor download.
const DEFAULT_APP_BUDGETS = [
  {
    name: "web",
    cwd: "altftoolweb",
    maxChunkGzipKiB: 375,
    maxChunkRawKiB: 1350,
    maxTotalJsGzipKiB: 10500,
    maxTotalCssGzipKiB: 1150,
    catalogMetaFile: "altftoolweb/src/platform/registry/toolMetaMap.js",
    catalogBaseline: 613,
    catalogJsGrowthKiB: 12.5,
    catalogCssGrowthKiB: 0.9,
    productBaseline: 22,
    productJsGrowthKiB: 50,
    productCssGrowthKiB: 320,
  },
  {
    name: "admin",
    cwd: "altftoolwebadmin",
    maxChunkGzipKiB: 250,
    maxChunkRawKiB: 850,
    maxTotalJsGzipKiB: 2700,
    maxTotalCssGzipKiB: 450,
    routeLoaderFile: "altftoolwebadmin/src/lib/adminModuleLoaders.js",
    routeLoaderBaseline: 245,
    routeJsGrowthKiB: 6,
  },
];

const DEFAULT_CRITICAL_ASSETS = [
  { file: "altftoolweb/public/extension/hero.jpg", maxKiB: 450 },
  { file: "altftoolweb/public/academy/hero/banner-academy.jpg", maxKiB: 500 },
  { file: "altftoolweb/public/academy/hero/banner-acad2.jpg", maxKiB: 500 },
  { file: "altftoolweb/public/trending/game/Flappy.jpg", maxKiB: 500 },
  { file: "altftoolweb/public/images/featured5.jpg", maxKiB: 450 },
  { file: "altftoolweb/public/images/featured6.jpg", maxKiB: 450 },
  { file: "altftoolweb/public/continue.jpg", maxKiB: 350 },
  { file: "altftoolweb/public/amaz.jpg", maxKiB: 350 },
  { file: "altftoolweb/public/banners/vertical.jpg", maxKiB: 450 },
];

const FORBIDDEN_CRITICAL_REFERENCES = [
  { pattern: "/extension/hero.png", replacement: "/extension/hero.jpg" },
  { pattern: "/academy/hero/banner-academy.png", replacement: "/academy/hero/banner-academy.jpg" },
  { pattern: "/academy/hero/banner-acad2.png", replacement: "/academy/hero/banner-acad2.jpg" },
  { pattern: "/images/featured5.png", replacement: "/images/featured5.jpg" },
  { pattern: "/images/featured6.png", replacement: "/images/featured6.jpg" },
  { pattern: "/continue.png", replacement: "/continue.jpg" },
  { pattern: "/amaz.png", replacement: "/amaz.jpg" },
  { pattern: "/banners/vertical.png", replacement: "/banners/vertical.jpg" },
];

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpg", ".jpeg", ".png", ".svg", ".webp"]);
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".md", ".mdx"]);

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const index = rawArgs.indexOf(name);
  if (index >= 0 && rawArgs[index + 1] && !rawArgs[index + 1].startsWith("--")) {
    return rawArgs[index + 1];
  }

  const match = rawArgs.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function envFlag(name) {
  return process.env[name] === "true" || process.env[name] === "1";
}

function resolveOutputPath(value) {
  if (!value) return "";
  return path.isAbsolute(value) ? value : path.join(workspaceRoot, value);
}

function clampScore(score) {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function bytesToKiB(bytes) {
  return bytes / 1024;
}

function formatKiB(bytes) {
  return `${bytesToKiB(bytes).toFixed(1)} KiB`;
}

function budgetKiB(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir, filter) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath, filter);
      if (entry.isFile() && filter(fullPath)) return [fullPath];
      return [];
    }),
  );

  return files.flat();
}

async function walkIfExists(dir, filter) {
  if (!(await pathExists(dir))) return [];
  return walk(dir, filter);
}

function createIssue(level, area, message, extra = {}) {
  return {
    level,
    area,
    message,
    ...extra,
  };
}

async function collectAssetRows(files, rootDir) {
  const rows = [];

  for (const file of files) {
    const [fileStat, content] = await Promise.all([stat(file), readFile(file)]);
    rows.push({
      file: path.relative(rootDir, file),
      rawBytes: fileStat.size,
      gzipBytes: gzipSync(content).length,
    });
  }

  rows.sort((a, b) => b.gzipBytes - a.gzipBytes || b.rawBytes - a.rawBytes);
  return rows;
}

function summarizeBundleRows(rows) {
  const totalRawBytes = rows.reduce((sum, row) => sum + row.rawBytes, 0);
  const totalGzipBytes = rows.reduce((sum, row) => sum + row.gzipBytes, 0);
  const largest = rows[0] || null;

  return {
    fileCount: rows.length,
    totalRawBytes,
    totalGzipBytes,
    totalRaw: formatKiB(totalRawBytes),
    totalGzip: formatKiB(totalGzipBytes),
    largest: largest
      ? {
          file: largest.file,
          rawBytes: largest.rawBytes,
          gzipBytes: largest.gzipBytes,
          raw: formatKiB(largest.rawBytes),
          gzip: formatKiB(largest.gzipBytes),
        }
      : null,
    topFiles: rows.slice(0, 8).map((row) => ({
      file: row.file,
      raw: formatKiB(row.rawBytes),
      gzip: formatKiB(row.gzipBytes),
    })),
  };
}

async function checkAppBuild(app, rootDir, options) {
  const appRoot = path.join(rootDir, app.cwd);
  const buildRoot = path.join(appRoot, ".next");
  const issues = [];
  const notices = [];

  if (!(await pathExists(buildRoot))) {
    const issue = createIssue(
      options.requireBuild ? "failure" : "warning",
      "build",
      `${app.name}: missing ${path.relative(rootDir, buildRoot)}. Run npm run build before enforcing bundle budgets.`,
      { app: app.name },
    );

    return {
      app: app.name,
      buildPresent: false,
      chunks: summarizeBundleRows([]),
      css: summarizeBundleRows([]),
      issues: [issue],
      notices,
    };
  }

  const chunkFiles = await walkIfExists(path.join(buildRoot, "static", "chunks"), (file) =>
    file.endsWith(".js"),
  );
  const cssFiles = await walkIfExists(path.join(buildRoot, "static", "css"), (file) =>
    file.endsWith(".css"),
  );
  const chunkRows = await collectAssetRows(chunkFiles, rootDir);
  const cssRows = await collectAssetRows(cssFiles, rootDir);
  const chunks = summarizeBundleRows(chunkRows);
  const css = summarizeBundleRows(cssRows);
  let catalogSize = null;
  let productCount = null;
  let routeLoaderCount = null;
  let maxTotalJsGzipKiB = app.maxTotalJsGzipKiB;
  let maxTotalCssGzipKiB = app.maxTotalCssGzipKiB;

  if (app.catalogMetaFile) {
    const metaSource = await readFile(path.join(rootDir, app.catalogMetaFile), "utf8");
    const metaMatch = metaSource.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);
    if (!metaMatch) throw new Error(`${app.name}: unable to parse ${app.catalogMetaFile}`);

    catalogSize = Object.keys(JSON.parse(metaMatch[1])).length;
    const growth = Math.max(0, catalogSize - app.catalogBaseline);
    if (!app.totalJsOverridden) maxTotalJsGzipKiB += growth * app.catalogJsGrowthKiB;
    if (!app.totalCssOverridden) maxTotalCssGzipKiB += growth * app.catalogCssGrowthKiB;

    productCount = PRODUCT_REGISTRY.length;
    const productGrowth = Math.max(0, productCount - app.productBaseline);
    if (!app.totalJsOverridden) maxTotalJsGzipKiB += productGrowth * app.productJsGrowthKiB;
    if (!app.totalCssOverridden) maxTotalCssGzipKiB += productGrowth * app.productCssGrowthKiB;
  }

  if (app.routeLoaderFile) {
    const loaderSource = await readFile(path.join(rootDir, app.routeLoaderFile), "utf8");
    routeLoaderCount = (loaderSource.match(/=>\s*import\(/g) || []).length;
    const growth = Math.max(0, routeLoaderCount - app.routeLoaderBaseline);
    if (!app.totalJsOverridden) maxTotalJsGzipKiB += growth * app.routeJsGrowthKiB;
  }

  if (!chunkRows.length) {
    issues.push(createIssue("failure", "build", `${app.name}: no JavaScript chunks found in .next/static/chunks`, { app: app.name }));
  }

  if (chunks.largest && bytesToKiB(chunks.largest.gzipBytes) > app.maxChunkGzipKiB) {
    issues.push(
      createIssue(
        "failure",
        "javascript",
        `${app.name}: largest gzip chunk ${chunks.largest.gzip} exceeds ${app.maxChunkGzipKiB} KiB`,
        { app: app.name, file: chunks.largest.file },
      ),
    );
  }

  if (chunks.largest && bytesToKiB(chunks.largest.rawBytes) > app.maxChunkRawKiB) {
    issues.push(
      createIssue(
        "failure",
        "javascript",
        `${app.name}: largest raw chunk ${chunks.largest.raw} exceeds ${app.maxChunkRawKiB} KiB`,
        { app: app.name, file: chunks.largest.file },
      ),
    );
  }

  if (bytesToKiB(chunks.totalGzipBytes) > maxTotalJsGzipKiB) {
    issues.push(
      createIssue(
        "failure",
        "javascript",
        `${app.name}: total gzip JavaScript ${chunks.totalGzip} exceeds ${maxTotalJsGzipKiB.toFixed(1)} KiB`,
        { app: app.name },
      ),
    );
  }

  if (bytesToKiB(css.totalGzipBytes) > maxTotalCssGzipKiB) {
    issues.push(
      createIssue(
        "failure",
        "css",
        `${app.name}: total gzip CSS ${css.totalGzip} exceeds ${maxTotalCssGzipKiB.toFixed(1)} KiB`,
        { app: app.name },
      ),
    );
  }

  if (!cssRows.length) {
    notices.push(createIssue("notice", "css", `${app.name}: no emitted CSS chunks found`, { app: app.name }));
  }

  return {
    app: app.name,
    buildPresent: true,
    chunks,
    css,
    budgets: {
      maxChunkGzipKiB: app.maxChunkGzipKiB,
      maxChunkRawKiB: app.maxChunkRawKiB,
      maxTotalJsGzipKiB,
      maxTotalCssGzipKiB,
    },
    catalogSize,
    productCount,
    routeLoaderCount,
    issues,
    notices,
  };
}

async function checkCriticalAssets(rootDir, criticalAssets) {
  const rows = [];
  const issues = [];

  for (const asset of criticalAssets) {
    const fullPath = path.join(rootDir, asset.file);
    if (!(await pathExists(fullPath))) {
      issues.push(createIssue("warning", "media", `${asset.file}: critical asset is missing`, { file: asset.file }));
      continue;
    }

    const fileStat = await stat(fullPath);
    rows.push({
      file: asset.file,
      bytes: fileStat.size,
      size: formatKiB(fileStat.size),
      maxKiB: asset.maxKiB,
    });

    if (bytesToKiB(fileStat.size) > asset.maxKiB) {
      issues.push(
        createIssue(
          "failure",
          "media",
          `${asset.file}: ${formatKiB(fileStat.size)} exceeds ${asset.maxKiB} KiB`,
          { file: asset.file },
        ),
      );
    }
  }

  return { rows, issues };
}

async function checkPublicImages(rootDir, publicRoot, maxPublicImageKiB) {
  if (!(await pathExists(publicRoot))) {
    return {
      imageCount: 0,
      totalBytes: 0,
      totalSize: "0.0 KiB",
      topImages: [],
      issues: [createIssue("warning", "media", `${path.relative(rootDir, publicRoot)} is missing`)],
    };
  }

  const imageFiles = await walk(publicRoot, (file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const rows = [];

  for (const file of imageFiles) {
    const fileStat = await stat(file);
    rows.push({
      file: path.relative(rootDir, file),
      bytes: fileStat.size,
    });
  }

  rows.sort((a, b) => b.bytes - a.bytes);
  const issues = rows
    .filter((row) => bytesToKiB(row.bytes) > maxPublicImageKiB)
    .map((row) =>
      createIssue(
        "failure",
        "media",
        `${row.file}: ${formatKiB(row.bytes)} exceeds ${maxPublicImageKiB} KiB`,
        { file: row.file },
      ),
    );
  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);

  return {
    imageCount: rows.length,
    totalBytes,
    totalSize: formatKiB(totalBytes),
    topImages: rows.slice(0, 10).map((row) => ({ file: row.file, size: formatKiB(row.bytes) })),
    issues,
  };
}

async function checkSourceGuardrails(rootDir, sourceRoot, options) {
  const issues = [];
  const notices = [];
  const directToolImports = [];
  const priorityToolSlugs = options.priorityToolSlugs || TOP_PRIORITY_TOOL_SLUGS;
  let runtimeToolSlugs = [];
  let runtimeImportMismatches = [];
  let lazyShell = {
    checked: false,
    hasDynamicLoader: false,
    disablesSsr: false,
    file: path.relative(rootDir, path.join(sourceRoot, "app", "tools", "[category]", "[slug]", "ToolClient.jsx")),
  };

  if (!(await pathExists(sourceRoot))) {
    return {
      dynamicToolImports: 0,
      directToolImports,
      issues: [createIssue("warning", "source", `${path.relative(rootDir, sourceRoot)} is missing`)],
      notices,
    };
  }

  const sourceFiles = await walk(sourceRoot, (file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const runtimeMapFile = path.join(sourceRoot, "platform", "registry", "toolRuntimeMap.js");
  let dynamicToolImports = 0;

  if (await pathExists(runtimeMapFile)) {
    const content = await readFile(runtimeMapFile, "utf8");
    const runtimeImportMatches = [
      ...content.matchAll(/(?:["']([^"']+)["']|([a-zA-Z_$][\w$]*))\s*:\s*\(\)\s*=>\s*import\(["']@\/tools\/([^"']+)\/entry["']\)/g),
    ];
    runtimeToolSlugs = runtimeImportMatches.map((match) => match[1] || match[2]);
    runtimeImportMismatches = runtimeImportMatches
      .filter((match) => (match[1] || match[2]) !== match[3])
      .map((match) => ({ mapKey: match[1] || match[2], importSlug: match[3] }));
    dynamicToolImports = runtimeImportMatches.length || [...content.matchAll(/=>\s*import\(["']@\/tools\//g)].length;

    if (dynamicToolImports < options.minDynamicToolImports) {
      issues.push(
        createIssue(
          "warning",
          "source",
          `tool runtime map has ${dynamicToolImports} dynamic imports; expected at least ${options.minDynamicToolImports}`,
          { file: path.relative(rootDir, runtimeMapFile) },
        ),
      );
    }

    for (const mismatch of runtimeImportMismatches.slice(0, 20)) {
      issues.push(
        createIssue(
          "warning",
          "source",
          `tool runtime map key ${mismatch.mapKey} imports ${mismatch.importSlug}; keep slug and import aligned`,
          { file: path.relative(rootDir, runtimeMapFile) },
        ),
      );
    }

    const missingPriorityToolRuntimes = priorityToolSlugs.filter((slug) => !runtimeToolSlugs.includes(slug));
    if (missingPriorityToolRuntimes.length) {
      issues.push(
        createIssue(
          "warning",
          "source",
          `missing dynamic runtime imports for priority tools: ${missingPriorityToolRuntimes.slice(0, 16).join(", ")}`,
          { file: path.relative(rootDir, runtimeMapFile), count: missingPriorityToolRuntimes.length },
        ),
      );
    }
  } else {
    issues.push(createIssue("warning", "source", "tool runtime map is missing", { file: path.relative(rootDir, runtimeMapFile) }));
  }

  const lazyShellFile = path.join(sourceRoot, "app", "tools", "[category]", "[slug]", "ToolClient.jsx");
  if (await pathExists(lazyShellFile)) {
    const content = await readFile(lazyShellFile, "utf8");
    lazyShell = {
      checked: true,
      hasDynamicLoader: /dynamic\(\s*\(\)\s*=>\s*loadToolModule\(slug\)/s.test(content),
      disablesSsr: /ssr\s*:\s*false/.test(content),
      file: path.relative(rootDir, lazyShellFile),
    };

    if (!lazyShell.hasDynamicLoader || !lazyShell.disablesSsr) {
      issues.push(
        createIssue(
          "warning",
          "source",
          `${lazyShell.file}: priority tool route should load runtimes with next/dynamic and ssr:false`,
          { file: lazyShell.file },
        ),
      );
    }
  } else {
    issues.push(createIssue("warning", "source", "tool route lazy shell is missing", { file: path.relative(rootDir, lazyShellFile) }));
  }

  for (const file of sourceFiles) {
    const relativeFile = path.relative(rootDir, file);
    if (relativeFile.endsWith("platform/registry/toolRuntimeMap.js")) continue;
    if (relativeFile.startsWith("altftoolweb/src/tools/")) continue;

    const content = (await readFile(file, "utf8"))
      .split("\n")
      .filter((line) => !line.trim().startsWith("//"))
      .join("\n");
    const directMatches = [
      ...content.matchAll(/(?:import\s+[^"'()]+?\s+from\s+|export\s+[^"']+?\s+from\s+)["']@\/tools\//g),
      ...content.matchAll(/require\(["']@\/tools\//g),
    ];

    if (directMatches.length) {
      directToolImports.push({
        file: relativeFile,
        count: directMatches.length,
      });
    }
  }

  for (const entry of directToolImports) {
    issues.push(
      createIssue(
        "warning",
        "source",
        `${entry.file}: imports tool code directly; keep tool runtimes behind dynamic import boundaries`,
        { file: entry.file },
      ),
    );
  }

  return {
    dynamicToolImports,
    directToolImports,
    lazyShell,
    missingPriorityToolRuntimes: priorityToolSlugs.filter((slug) => !runtimeToolSlugs.includes(slug)),
    priorityToolRuntimeCoverage: priorityToolSlugs.length
      ? `${priorityToolSlugs.length - priorityToolSlugs.filter((slug) => !runtimeToolSlugs.includes(slug)).length}/${priorityToolSlugs.length}`
      : "0/0",
    runtimeImportMismatches,
    runtimeToolSlugs,
    sourceFileCount: sourceFiles.length,
    issues,
    notices,
  };
}

async function checkAdminSourceGuardrails(rootDir) {
  const adminLayoutFile = path.join(rootDir, "altftoolwebadmin", "src", "app", "layout.jsx");
  const adminPackageFile = path.join(rootDir, "altftoolwebadmin", "package.json");
  const lazyEditorAssetsFile = path.join(
    rootDir,
    "altftoolwebadmin",
    "src",
    "components",
    "admin",
    "CkeditorAssets.jsx",
  );
  const issues = [];
  const notices = [];
  const result = {
    adminLayoutFile: path.relative(rootDir, adminLayoutFile),
    lazyEditorAssetsFile: path.relative(rootDir, lazyEditorAssetsFile),
    globalEditorCdn: false,
    editorDependencyConfigured: false,
    lazyEditorAssets: false,
    issues,
    notices,
  };

  if (await pathExists(adminLayoutFile)) {
    const content = await readFile(adminLayoutFile, "utf8");
    result.globalEditorCdn = /cdn\.(ckeditor|ckbox)\.com|ckeditor5\.umd\.js|ckbox\.js/i.test(content);

    if (result.globalEditorCdn) {
      issues.push(
        createIssue(
          "warning",
          "source",
          `${result.adminLayoutFile}: loads CKEditor/CKBox CDN assets globally; lazy-load editor assets from blog editor routes`,
          { file: result.adminLayoutFile },
        ),
      );
    }
  }

  if (await pathExists(adminPackageFile)) {
    const adminPackage = JSON.parse(await readFile(adminPackageFile, "utf8"));
    const dependencyNames = Object.keys({
      ...(adminPackage.dependencies || {}),
      ...(adminPackage.devDependencies || {}),
    });
    result.editorDependencyConfigured = dependencyNames.some((name) => /ckeditor|ckbox/i.test(name));
  }

  result.lazyEditorAssets = await pathExists(lazyEditorAssetsFile);
  if (!result.lazyEditorAssets && (result.globalEditorCdn || result.editorDependencyConfigured)) {
    issues.push(
      createIssue(
        "warning",
        "source",
        `${result.lazyEditorAssetsFile}: missing lazy CKEditor asset loader for admin blog editors`,
        { file: result.lazyEditorAssetsFile },
      ),
    );
  }

  return result;
}

async function checkForbiddenReferences(rootDir, sourceRoot, forbiddenReferences) {
  if (!(await pathExists(sourceRoot))) {
    return [];
  }

  const sourceFiles = await walk(sourceRoot, (file) => SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()));
  const issues = [];

  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    for (const rule of forbiddenReferences) {
      if (content.includes(rule.pattern)) {
        issues.push(
          createIssue(
            "failure",
            "media",
            `${path.relative(rootDir, file)} still references ${rule.pattern}; use ${rule.replacement}`,
            { file: path.relative(rootDir, file) },
          ),
        );
      }
    }
  }

  return issues;
}

function normalizeAppBudgets(options) {
  return (options.appBudgets || DEFAULT_APP_BUDGETS).map((app) => {
    const prefix = `ALTFT_${app.name.toUpperCase()}`;
    const totalJsValue = options.env?.[`${prefix}_MAX_TOTAL_GZIP_KB`];
    const totalCssValue = options.env?.[`${prefix}_MAX_CSS_GZIP_KB`];

    return {
      ...app,
      totalJsOverridden: String(totalJsValue || "").trim().length > 0,
      totalCssOverridden: String(totalCssValue || "").trim().length > 0,
      maxChunkGzipKiB: budgetKiB(
        options.env?.[`${prefix}_MAX_CHUNK_GZIP_KB`],
        app.maxChunkGzipKiB,
      ),
      maxChunkRawKiB: budgetKiB(
        options.env?.[`${prefix}_MAX_CHUNK_RAW_KB`],
        app.maxChunkRawKiB,
      ),
      maxTotalJsGzipKiB: budgetKiB(totalJsValue, app.maxTotalJsGzipKiB),
      maxTotalCssGzipKiB: budgetKiB(totalCssValue, app.maxTotalCssGzipKiB),
    };
  });
}

export async function buildPerformanceBudgetReport(options = {}) {
  const startedAt = performance.now();
  const rootDir = options.rootDir || workspaceRoot;
  const env = options.env || process.env;
  const strict = Boolean(options.strict);
  const requireBuild = Boolean(options.requireBuild);
  const publicRoot = options.publicRoot || path.join(rootDir, "altftoolweb", "public");
  const sourceRoot = options.sourceRoot || path.join(rootDir, "altftoolweb", "src");
  const maxPublicImageKiB = budgetKiB(env.ALTFT_MAX_PUBLIC_IMAGE_KIB, options.maxPublicImageKiB ?? 3000);
  const appBudgets = normalizeAppBudgets({ ...options, env });

  const [apps, criticalAssets, publicImages, sourceGuardrails, adminSourceGuardrails, forbiddenReferences] = await Promise.all([
    Promise.all(appBudgets.map((app) => checkAppBuild(app, rootDir, { requireBuild }))),
    checkCriticalAssets(rootDir, options.criticalAssets || DEFAULT_CRITICAL_ASSETS),
    checkPublicImages(rootDir, publicRoot, maxPublicImageKiB),
    checkSourceGuardrails(rootDir, sourceRoot, {
      minDynamicToolImports: Number(options.minDynamicToolImports ?? 50),
      priorityToolSlugs: options.priorityToolSlugs || TOP_PRIORITY_TOOL_SLUGS,
    }),
    checkAdminSourceGuardrails(rootDir),
    checkForbiddenReferences(rootDir, sourceRoot, options.forbiddenReferences || FORBIDDEN_CRITICAL_REFERENCES),
  ]);

  const allIssues = [
    ...apps.flatMap((app) => app.issues),
    ...criticalAssets.issues,
    ...publicImages.issues,
    ...sourceGuardrails.issues,
    ...adminSourceGuardrails.issues,
    ...forbiddenReferences,
  ];
  const notices = [
    ...apps.flatMap((app) => app.notices),
    ...sourceGuardrails.notices,
    ...adminSourceGuardrails.notices,
  ];
  const failures = allIssues.filter((issue) => issue.level === "failure");
  const warnings = allIssues.filter((issue) => issue.level === "warning");
  const ok = failures.length === 0 && (!strict || warnings.length === 0);
  const score = clampScore(100 - failures.length * 18 - warnings.length * (strict ? 6 : 3));

  return {
    generatedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - startedAt),
    ok,
    strict,
    requireBuild,
    status: failures.length ? "blocked" : warnings.length ? "watch" : "clean",
    score,
    totals: {
      failures: failures.length,
      warnings: warnings.length,
      notices: notices.length,
      apps: apps.length,
      publicImages: publicImages.imageCount,
      dynamicToolImports: sourceGuardrails.dynamicToolImports,
      directToolImportFiles: sourceGuardrails.directToolImports.length,
      missingPriorityToolRuntimes: sourceGuardrails.missingPriorityToolRuntimes.length,
      priorityToolRuntimeCoverage: sourceGuardrails.priorityToolRuntimeCoverage,
    },
    apps,
    media: {
      maxPublicImageKiB,
      criticalAssets: criticalAssets.rows,
      publicImages,
    },
    source: sourceGuardrails,
    adminSource: adminSourceGuardrails,
    failures,
    warnings,
    notices,
  };
}

export function renderPerformanceBudgetMarkdown(report) {
  const lines = [
    "# Performance Budget Report",
    "",
    `- Status: ${report.status}`,
    `- Score: ${report.score}/100`,
    `- Duration: ${report.durationMs}ms`,
    `- Build required: ${report.requireBuild ? "yes" : "no"}`,
    `- Failures: ${report.totals.failures}`,
    `- Warnings: ${report.totals.warnings}`,
    `- Notices: ${report.totals.notices}`,
    "",
    "## Apps",
    "",
    "| App | Build | JS chunks | Largest JS gzip | Total JS gzip | Total CSS gzip |",
    "| --- | --- | ---: | ---: | ---: | ---: |",
  ];

  for (const app of report.apps) {
    lines.push(
      `| ${app.app} | ${app.buildPresent ? "yes" : "no"} | ${app.chunks.fileCount} | ${app.chunks.largest?.gzip || "n/a"} | ${app.chunks.totalGzip} | ${app.css.totalGzip} |`,
    );
  }

  lines.push(
    "",
    "## Media",
    "",
    `- Public images: ${report.media.publicImages.imageCount}`,
    `- Public image total: ${report.media.publicImages.totalSize}`,
    `- Dynamic tool imports: ${report.totals.dynamicToolImports}`,
    `- Direct tool import files: ${report.totals.directToolImportFiles}`,
    `- Priority tool runtime coverage: ${report.totals.priorityToolRuntimeCoverage}`,
    `- Missing priority runtimes: ${report.totals.missingPriorityToolRuntimes}`,
    `- Admin global editor CDN: ${report.adminSource.globalEditorCdn ? "yes" : "no"}`,
    `- Admin lazy editor assets: ${report.adminSource.lazyEditorAssets ? "yes" : "no"}`,
  );

  if (report.failures.length) {
    lines.push("", "## Failures", "");
    for (const issue of report.failures.slice(0, 60)) lines.push(`- ${issue.area}: ${issue.message}`);
  }

  if (report.warnings.length) {
    lines.push("", "## Warnings", "");
    for (const issue of report.warnings.slice(0, 60)) lines.push(`- ${issue.area}: ${issue.message}`);
  }

  if (report.notices.length) {
    lines.push("", "## Notices", "");
    for (const issue of report.notices.slice(0, 60)) lines.push(`- ${issue.area}: ${issue.message}`);
  }

  return `${lines.join("\n")}\n`;
}

async function writeArtifact(filePath, content) {
  if (!filePath) return;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

function printReport(report, jsonOnly = false) {
  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log("Performance budget check");
  console.log(`Status: ${report.status}`);
  console.log(`Score: ${report.score}/100`);
  console.log(`Failures: ${report.totals.failures}`);
  console.log(`Warnings: ${report.totals.warnings}`);
  console.log(`Public images: ${report.totals.publicImages}`);
  console.log(`Dynamic tool imports: ${report.totals.dynamicToolImports}`);

  if (report.failures.length) {
    console.log("\nFailures");
    for (const issue of report.failures.slice(0, 30)) console.log(`- ${issue.area}: ${issue.message}`);
  }

  if (report.warnings.length) {
    console.log("\nWarnings");
    for (const issue of report.warnings.slice(0, 30)) console.log(`- ${issue.area}: ${issue.message}`);
  }

  if (!report.failures.length) {
    console.log("\nPerformance budget check passed.");
  }
}

async function main() {
  const report = await buildPerformanceBudgetReport({
    env: process.env,
    maxPublicImageKiB: Number(argValue("--max-public-image-kib", process.env.ALTFT_MAX_PUBLIC_IMAGE_KIB || "3000")),
    minDynamicToolImports: Number(argValue("--min-dynamic-tools", process.env.ALTFT_MIN_DYNAMIC_TOOL_IMPORTS || "50")),
    requireBuild: args.has("--require-build") || envFlag("ALTFT_PERFORMANCE_REQUIRE_BUILD"),
    strict: args.has("--strict") || envFlag("ALTFT_PERFORMANCE_STRICT"),
  });
  const outputPath = resolveOutputPath(argValue("--output", process.env.ALTFT_PERFORMANCE_OUTPUT || ""));
  const markdownPath = resolveOutputPath(
    argValue("--output-md", argValue("--output-markdown", process.env.ALTFT_PERFORMANCE_MARKDOWN_OUTPUT || "")),
  );

  await writeArtifact(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  await writeArtifact(markdownPath, renderPerformanceBudgetMarkdown(report));
  printReport(report, args.has("--json"));

  if (!report.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
