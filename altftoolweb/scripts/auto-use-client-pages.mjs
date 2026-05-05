import fs from "fs";
import path from "path";

const TOOLS_DIR = "src/tools";

const CLIENT_PATTERNS = [
  /\buseState\b/,
  /\buseEffect\b/,
  /\buseRef\b/,
  /\buseMemo\b/,
  /\buseCallback\b/,
  /\buseLayoutEffect\b/,
  /\bwindow\b/,
  /\bdocument\b/,
  /\bnavigator\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bonClick\s*=/,
  /\bonChange\s*=/,
];

function needsUseClient(code) {
  return CLIENT_PATTERNS.some((rx) => rx.test(code));
}

function hasUseClient(code) {
  return /^["']use client["'];?/m.test(code);
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");

  if (hasUseClient(code)) return false;
  if (!needsUseClient(code)) return false;

  fs.writeFileSync(filePath, `"use client";\n\n${code}`);
  return true;
}

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full);
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      if (processFile(full)) {
        console.log(`✅ Added "use client" → ${full}`);
      }
    }
  }
}

walk(TOOLS_DIR);

console.log("\n🎯 Done scanning tool pages.");
