import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { PRODUCT_REGISTRY } from "@altftool/core/products";

const root = path.resolve(import.meta.dirname, "..");

const appBudgets = [
  {
    name: "web",
    cwd: "altftoolweb",
    maxChunkGzipKb: Number(process.env.ALTFT_WEB_MAX_CHUNK_GZIP_KB || 375),
    maxChunkRawKb: Number(process.env.ALTFT_WEB_MAX_CHUNK_RAW_KB || 1350),
    // The aggregate contains every independently lazy-loaded tool, so it must
    // scale with the catalog while per-chunk limits continue to protect what a
    // visitor actually downloads. The 613-tool baseline was 9,841 KiB gzip;
    // each additional registered tool gets a conservative 12.5 KiB allowance.
    // The larger 2026 catalog includes richer image, document, and AI runtimes;
    // the fixed per-chunk caps below still guard what one visitor downloads.
    // An explicit env override remains a hard absolute ceiling.
    maxTotalGzipKb: process.env.ALTFT_WEB_MAX_TOTAL_GZIP_KB
      ? Number(process.env.ALTFT_WEB_MAX_TOTAL_GZIP_KB)
      : null,
    baseMaxTotalGzipKb: 10500,
    catalogBaseline: 613,
    catalogGrowthGzipKb: 12.5,
    catalogMetaFile: "altftoolweb/src/platform/registry/toolMetaMap.js",
    // Product suites are independently lazy-loaded just like tools. Keep the
    // per-chunk ceiling fixed, but let the all-routes aggregate grow modestly
    // when a product is formally added to the canonical registry.
    productBaseline: 22,
    productGrowthGzipKb: 50,
  },
  {
    name: "admin",
    cwd: "altftoolwebadmin",
    maxChunkGzipKb: Number(process.env.ALTFT_ADMIN_MAX_CHUNK_GZIP_KB || 250),
    maxChunkRawKb: Number(process.env.ALTFT_ADMIN_MAX_CHUNK_RAW_KB || 850),
    // The aggregate includes every independently lazy-loaded project module.
    // Keep the 2,700 KiB pre-expansion baseline and allow a small amount for
    // each loader added after it; per-chunk limits remain fixed because those
    // represent what an admin actually downloads for one screen.
    maxTotalGzipKb: process.env.ALTFT_ADMIN_MAX_TOTAL_GZIP_KB
      ? Number(process.env.ALTFT_ADMIN_MAX_TOTAL_GZIP_KB)
      : null,
    baseMaxTotalGzipKb: 2700,
    routeLoaderBaseline: 245,
    // Admin modules are independently loaded. The current route mix includes
    // richer editor, health, SEO, and API surfaces, so use the measured 6.5 KiB
    // aggregate allowance per post-baseline loader while retaining the strict
    // 250 KiB per-chunk ceiling that protects real navigation payloads.
    routeGrowthGzipKb: 6.5,
    routeLoaderFile: "altftoolwebadmin/src/lib/adminModuleLoaders.js",
  },
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (entry.isFile() && entry.name.endsWith(".js")) return [fullPath];
    return [];
  }));

  return files.flat();
}

function kb(bytes) {
  return bytes / 1024;
}

function formatKb(bytes) {
  return `${kb(bytes).toFixed(1)} KiB`;
}

async function auditApp(app) {
  const chunkRoot = path.join(root, app.cwd, ".next", "static", "chunks");
  let files;

  try {
    files = await walk(chunkRoot);
  } catch {
    throw new Error(`${app.name}: missing ${path.relative(root, chunkRoot)}. Run npm run build first.`);
  }

  const rows = [];
  for (const file of files) {
    const [fileStat, content] = await Promise.all([stat(file), readFile(file)]);
    rows.push({
      file: path.relative(root, file),
      rawBytes: fileStat.size,
      gzipBytes: gzipSync(content).length,
    });
  }

  rows.sort((a, b) => b.gzipBytes - a.gzipBytes || b.rawBytes - a.rawBytes);
  const totalGzipBytes = rows.reduce((sum, row) => sum + row.gzipBytes, 0);
  const largest = rows[0];
  const failures = [];
  let catalogSize = null;
  let productCount = null;
  let routeLoaderCount = null;
  let maxTotalGzipKb = app.maxTotalGzipKb ?? app.baseMaxTotalGzipKb;

  if (app.maxTotalGzipKb == null && app.catalogMetaFile) {
    const metaSource = await readFile(path.join(root, app.catalogMetaFile), "utf8");
    const metaMatch = metaSource.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);
    if (!metaMatch) throw new Error(`${app.name}: unable to parse ${app.catalogMetaFile}`);

    catalogSize = Object.keys(JSON.parse(metaMatch[1])).length;
    const catalogGrowth = Math.max(0, catalogSize - app.catalogBaseline);
    maxTotalGzipKb += catalogGrowth * app.catalogGrowthGzipKb;

    productCount = PRODUCT_REGISTRY.length;
    const productGrowth = Math.max(0, productCount - app.productBaseline);
    maxTotalGzipKb += productGrowth * app.productGrowthGzipKb;
  } else if (app.maxTotalGzipKb == null && app.routeLoaderFile) {
    const loaderSource = await readFile(path.join(root, app.routeLoaderFile), "utf8");
    routeLoaderCount = (loaderSource.match(/=>\s*import\(/g) || []).length;
    const routeGrowth = Math.max(0, routeLoaderCount - app.routeLoaderBaseline);
    maxTotalGzipKb += routeGrowth * app.routeGrowthGzipKb;
  }

  if (kb(largest.gzipBytes) > app.maxChunkGzipKb) {
    failures.push(`${app.name}: largest gzip chunk ${formatKb(largest.gzipBytes)} exceeds ${app.maxChunkGzipKb} KiB`);
  }
  if (kb(largest.rawBytes) > app.maxChunkRawKb) {
    failures.push(`${app.name}: largest raw chunk ${formatKb(largest.rawBytes)} exceeds ${app.maxChunkRawKb} KiB`);
  }
  if (kb(totalGzipBytes) > maxTotalGzipKb) {
    failures.push(`${app.name}: total gzip JS ${formatKb(totalGzipBytes)} exceeds ${maxTotalGzipKb.toFixed(1)} KiB`);
  }

  return {
    app: app.name,
    fileCount: rows.length,
    catalogSize,
    productCount,
    routeLoaderCount,
    totalGzip: formatKb(totalGzipBytes),
    totalGzipBudget: `${maxTotalGzipKb.toFixed(1)} KiB`,
    largest: {
      file: largest.file,
      raw: formatKb(largest.rawBytes),
      gzip: formatKb(largest.gzipBytes),
    },
    topChunks: rows.slice(0, 8).map((row) => ({
      file: row.file,
      raw: formatKb(row.rawBytes),
      gzip: formatKb(row.gzipBytes),
    })),
    failures,
  };
}

const results = [];
const failures = [];

for (const app of appBudgets) {
  const result = await auditApp(app);
  results.push(result);
  failures.push(...result.failures);
}

console.log("Bundle budget audit:");
console.log(JSON.stringify(results, null, 2));

if (failures.length) {
  console.error("Bundle budget check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Bundle budget check passed.");
