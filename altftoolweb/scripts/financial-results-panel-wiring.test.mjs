import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const TOOL_SLUGS = [
  "budget-planner",
  "compound-interest-calculator",
  "currency-profit-loss-calculator",
  "debt-payoff-planner",
  "financial-goal-planner",
  "fire-calculator",
  "investment-fee-impact-calculator",
  "loan-prepayment-calculator",
  "mortgage-calculator",
  "net-worth-calculator",
  "retirement-planner",
  "salary-tax-calculator",
  "savings-goal-calculator",
];

test("financial Year-by-Year disclosures receive and destructure their state setter", async () => {
  for (const slug of TOOL_SLUGS) {
    const source = await readFile(
      new URL(`../src/tools/${slug}/pages/index.jsx`, import.meta.url),
      "utf8",
    );
    const invocation = source.match(/<ResultsPanel\b[^>]*\/>/s)?.[0] || "";
    const signature = source.match(/function\s+ResultsPanel\s*\(\s*\{([^}]*)\}\s*\)/s)?.[1] || "";

    assert.match(source, /Year-by-Year Breakdown/, `${slug} must keep its disclosure`);
    assert.match(
      source,
      /onClick=\{\(\) => setShowDetails\(!showDetails\)\}/,
      `${slug} must toggle the disclosure state`,
    );
    assert.match(
      invocation,
      /\bsetShowDetails=\{setShowDetails\}/,
      `${slug} must pass setShowDetails to ResultsPanel`,
    );
    assert.ok(
      signature.split(",").map((name) => name.trim()).includes("setShowDetails"),
      `${slug} ResultsPanel must destructure setShowDetails`,
    );
  }
});
