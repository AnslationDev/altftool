import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve(import.meta.dirname, "..");

const appBudgets = [
  {
    name: "web",
    cwd: "altftoolweb",
    maxChunkGzipKb: Number(process.env.ALTFT_WEB_MAX_CHUNK_GZIP_KB || 375),
    maxChunkRawKb: Number(process.env.ALTFT_WEB_MAX_CHUNK_RAW_KB || 1350),
    maxTotalGzipKb: Number(process.env.ALTFT_WEB_MAX_TOTAL_GZIP_KB || 6000),
  },
  {
    name: "admin",
    cwd: "altftoolwebadmin",
    maxChunkGzipKb: Number(process.env.ALTFT_ADMIN_MAX_CHUNK_GZIP_KB || 250),
    maxChunkRawKb: Number(process.env.ALTFT_ADMIN_MAX_CHUNK_RAW_KB || 850),
    maxTotalGzipKb: Number(process.env.ALTFT_ADMIN_MAX_TOTAL_GZIP_KB || 1600),
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

  if (kb(largest.gzipBytes) > app.maxChunkGzipKb) {
    failures.push(`${app.name}: largest gzip chunk ${formatKb(largest.gzipBytes)} exceeds ${app.maxChunkGzipKb} KiB`);
  }
  if (kb(largest.rawBytes) > app.maxChunkRawKb) {
    failures.push(`${app.name}: largest raw chunk ${formatKb(largest.rawBytes)} exceeds ${app.maxChunkRawKb} KiB`);
  }
  if (kb(totalGzipBytes) > app.maxTotalGzipKb) {
    failures.push(`${app.name}: total gzip JS ${formatKb(totalGzipBytes)} exceeds ${app.maxTotalGzipKb} KiB`);
  }

  return {
    app: app.name,
    fileCount: rows.length,
    totalGzip: formatKb(totalGzipBytes),
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
