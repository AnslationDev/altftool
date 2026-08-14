import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import test from "node:test";
import { isBopsDemoActionLabel } from "../src/app/bops/demoGuardPolicy.js";

const root = path.resolve(import.meta.dirname, "..");
const bopsRoot = path.join(root, "src/app/bops");

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

async function sourceFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(absolute)));
    else if (/\.(?:css|js|jsx|mjs|ts|tsx)$/i.test(entry.name)) files.push(absolute);
  }
  return files;
}

async function combinedSource(directory) {
  const files = await sourceFiles(directory);
  return (await Promise.all(files.map((file) => fs.readFile(file, "utf8")))).join("\n");
}

test("BOPS stays a noindexed, non-transactional demonstration", async () => {
  const [layout, nextConfig, sitemap] = await Promise.all([
    read("src/app/bops/layout.jsx"),
    read("next.config.mjs"),
    read("src/app/sitemap.js"),
  ]);

  assert.match(layout, /Design demonstration only/);
  assert.match(layout, /does not collect or send quote requests/);
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.match(nextConfig, /source:\s*["']\/bops\/:path\*["'][\s\S]*?X-Robots-Tag[\s\S]*?noindex, nofollow/);
  assert.match(sitemap, /path === ["']\/bops["'] \|\| path\.startsWith\(["']\/bops\/["']\)/);
});

test("BOPS guard catches quote actions in either word order without blocking search", () => {
  for (const label of [
    "Send my quote request",
    "Lock my flat quote",
    "Request My Free Estimate",
    "Quote request",
    "See My Real Rate",
    "Compare rates",
  ]) {
    assert.equal(isBopsDemoActionLabel(label), true, label);
  }

  for (const label of [
    "Find flights",
    "Search articles",
    "Filter results",
    "Check availability",
    "Compare destinations",
    "Rate this article",
  ]) {
    assert.equal(isBopsDemoActionLabel(label), false, label);
  }
});

test("BOPS source contains no live placeholder quote URLs or fake phone destinations", async () => {
  const source = await combinedSource(bopsRoot);

  assert.doesNotMatch(source, /https?:\/\/example\.com\/quote\//i);
  assert.doesNotMatch(source, /(?:tel|mailto):[^\s"'`>]*5{3}/i);
  assert.doesNotMatch(source, /(?:tel|mailto):(?:Demo|#demo)/i);
  assert.doesNotMatch(source, /(?:href\s*=|href\s*:)[^\n]{0,24}(?:tel|mailto):/i);
  assert.doesNotMatch(source, /tel:\$\{(?:phoneNumber|company\.phoneHref)\}/);
  assert.doesNotMatch(source, /mailto:\$\{company\.email\}/);
  assert.match(source, /\/\^\(\?:tel\|mailto\):\/i/);
  assert.match(source, /#demo-only/);
});

test("BOPS source does not hotlink the removed third-party service assets", async () => {
  const source = await combinedSource(bopsRoot);
  assert.doesNotMatch(source, /maspethroofing\.com/i);
  assert.doesNotMatch(source, /uniqueheatingandcooling\.com/i);
  assert.doesNotMatch(source, /limric\.com/i);
  assert.doesNotMatch(source, /encrypted-tbn0\.gstatic\.com/i);
  assert.doesNotMatch(source, /lh4\.googleusercontent\.com/i);
  assert.doesNotMatch(source, /content\.jdmagicbox\.com/i);
  assert.doesNotMatch(source, /allkindplumbing\.com\.au/i);
  assert.doesNotMatch(source, /thumbs\.dreamstime\.com/i);
  assert.doesNotMatch(source, /reedplumbingsolutions\.com\.au/i);
  assert.doesNotMatch(source, /mcgillplumbing\.com/i);
});

test("BOPS contains no external lead form or live messaging destination", async () => {
  const source = await combinedSource(bopsRoot);
  assert.doesNotMatch(source, /leadconnectorhq\.com/i);
  assert.doesNotMatch(source, /https?:\/\/(?:www\.)?wa\.me\//i);
  assert.doesNotMatch(source, /<iframe\b/i);
  assert.doesNotMatch(source, /<form\b[^>]*\baction\s*=\s*["']?https?:/i);
});

test("auto insurance is a neutral guide with FAQ schema and no fabricated provider", async () => {
  const page = await read("src/app/bops/insurance/auto-insurance/page.jsx");
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /ALTFTool does not sell insurance or provide quotes/);
  assert.match(page, /not an insurer, insurance agency, or broker/);
  assert.doesNotMatch(page, /ANSTER|David Richardson|licensed in all|customer reviews|average savings/i);
  await assert.rejects(fs.access(path.join(bopsRoot, "insurance/auto-insurance/AutoInsuranceClient.jsx")));
  await assert.rejects(fs.access(path.join(bopsRoot, "insurance/auto-insurance/auto-insurance.css")));
});

test("meme encyclopedia does not claim third-party branding or fabricated bylines", async () => {
  const source = await combinedSource(path.join(root, "src/app/kym"));
  assert.doesNotMatch(source, /Know Your Meme|KYM Staff|KYM-style|author:\s*["']Phil["']/i);
  assert.match(source, /Meme Encyclopedia/);
});

test("Quiz Studio does not show clone branding or unverified creator and play metadata", async () => {
  const source = await combinedSource(path.join(root, "src/app/playbuzz"));
  assert.doesNotMatch(source, /Playbuzz Clone|Playbuzz Alternative|same format as Playbuzz/i);
  assert.doesNotMatch(source, /\b(?:author|creator|plays)\s*:/i);
  assert.doesNotMatch(source, /(?:article|quiz|quizData)\.(?:author|creator|plays)/i);
  assert.match(source, /ALTFTool Quiz Studio/);
});
