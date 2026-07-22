import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prerenderRoot = path.join(appRoot, ".next", "server", "app");
const defaultMaxBytes = 4 * 1024 * 1024;
const configuredMaxBytes = Number.parseInt(process.env.ALTFT_MAX_PRERENDER_BYTES ?? "", 10);
const maxBytes = Number.isFinite(configuredMaxBytes) && configuredMaxBytes > 0
  ? configuredMaxBytes
  : defaultMaxBytes;

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(filePath);
    return entry.isFile() && entry.name.endsWith(".html") ? [filePath] : [];
  }));

  return nested.flat();
}

const files = await findHtmlFiles(prerenderRoot);
const rows = await Promise.all(files.map(async (filePath) => ({
  filePath,
  bytes: (await stat(filePath)).size,
})));
rows.sort((left, right) => right.bytes - left.bytes);

const largest = rows[0];
if (!largest) {
  throw new Error("No prerendered HTML files were emitted by the web build.");
}

const relativePath = path.relative(appRoot, largest.filePath);
console.log(
  `Prerender size gate: ${rows.length} pages checked; largest ${relativePath} ` +
    `(${(largest.bytes / 1024 / 1024).toFixed(2)} MiB / ${(maxBytes / 1024 / 1024).toFixed(2)} MiB).`,
);

if (largest.bytes > maxBytes) {
  throw new Error(
    `${relativePath} exceeds the prerender response budget. Reduce repeated cards or serialized client data.`,
  );
}
