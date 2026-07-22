import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PRODUCT_REGISTRY } from "@altftool/core/products";

const root = path.resolve(import.meta.dirname, "..");
const webRoot = path.join(root, "altftoolweb");
const catalogMetaFile = path.join(webRoot, "src", "platform", "registry", "toolMetaMap.js");
const baseWarningBudget = 250;
const catalogBaseline = 613;
const catalogWarningGrowth = 3.75;
const productBaseline = 22;
const productWarningGrowth = 70;

const catalogSource = readFileSync(catalogMetaFile, "utf8");
const catalogMatch = catalogSource.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);
if (!catalogMatch) {
  throw new Error(`Unable to parse ${path.relative(root, catalogMetaFile)}`);
}

const catalogSize = Object.keys(JSON.parse(catalogMatch[1])).length;
const productCount = PRODUCT_REGISTRY.length;
const catalogGrowth = Math.max(0, catalogSize - catalogBaseline);
const productGrowth = Math.max(0, productCount - productBaseline);
const calculatedWarningBudget = Math.ceil(
  baseWarningBudget
    + catalogGrowth * catalogWarningGrowth
    + productGrowth * productWarningGrowth,
);
const explicitWarningBudget = String(process.env.ALTFT_WEB_LINT_WARNING_BUDGET || "").trim();
const warningBudget = explicitWarningBudget
  ? Number(explicitWarningBudget)
  : calculatedWarningBudget;

if (!Number.isFinite(warningBudget) || warningBudget < 0) {
  throw new Error("ALTFT_WEB_LINT_WARNING_BUDGET must be a non-negative number");
}

const result = spawnSync(
  "npm",
  ["exec", "eslint", "--", "--format", "json"],
  {
    cwd: webRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  },
);

if (result.error) {
  throw result.error;
}

let eslintResults;
try {
  eslintResults = JSON.parse(result.stdout || "[]");
} catch (error) {
  console.error("Unable to parse ESLint JSON output.");
  if (result.stdout) console.error(result.stdout.slice(0, 4000));
  if (result.stderr) console.error(result.stderr.slice(0, 4000));
  throw error;
}

let errors = 0;
let warnings = 0;
const warningsByRule = new Map();

for (const file of eslintResults) {
  for (const message of file.messages) {
    if (message.severity === 2) errors += 1;
    if (message.severity === 1) {
      warnings += 1;
      const ruleId = message.ruleId || "unknown";
      warningsByRule.set(ruleId, (warningsByRule.get(ruleId) || 0) + 1);
    }
  }
}

const topWarnings = [...warningsByRule.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);

console.log(`Web ESLint: ${errors} errors, ${warnings} warnings (budget ${warningBudget}).`);

if (!explicitWarningBudget) {
  console.log(
    `Budget basis: ${catalogSize} tools (${catalogGrowth} above baseline), `
      + `${productCount} products (${productGrowth} above baseline).`,
  );
}

if (topWarnings.length) {
  console.log("Top warning rules:");
  for (const [ruleId, count] of topWarnings) {
    console.log(`- ${ruleId}: ${count}`);
  }
}

if (errors > 0) {
  console.error("Web lint budget failed: errors must stay at 0.");
  process.exit(1);
}

if (warnings > warningBudget) {
  console.error(`Web lint budget failed: warnings ${warnings} exceed budget ${warningBudget}.`);
  process.exit(1);
}
