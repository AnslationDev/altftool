// Minimal .env loader for the automation (plain `node` doesn't read .env like
// Next.js does). Loads .env first, then .env.example as a fallback, without
// overriding anything already in process.env. Import for side effects.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

for (const file of [".env", ".env.example"]) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].replace(/^["']|["']$/g, "");
    if (val && process.env[key] === undefined) process.env[key] = val;
  }
}
