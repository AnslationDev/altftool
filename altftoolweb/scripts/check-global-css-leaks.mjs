#!/usr/bin/env node
/**
 * Fails the build when a route stylesheet paints the document.
 *
 * Next keeps a route's CSS attached for the life of the document — it is not
 * detached on client navigation. So a bare `body { background: … }` inside a
 * route or tool stylesheet does not stop applying when the visitor moves on:
 * it repaints every page they visit next, until a hard reload. Three
 * micro-sites and two tools were doing exactly that, which is what "the design
 * breaks after changing route" turned out to be.
 *
 * Only colour is treated as a leak. `body { margin: 0 }` or a font-family is
 * harmless; a background or a text colour is not. Rules inside @media print
 * are ignored — those are meant to override the document.
 *
 * Colour arrives two ways. A literal declaration is the obvious one. The other
 * is `@apply bg-background text-foreground`, which names no CSS property at all
 * and so slipped past the first version of this check — two stylesheets were
 * repainting the document that way and shipped. Both forms are matched now.
 *
 * The global stylesheets are allowed to style the document; that is their job.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ALLOWED_FILES = [
  "src/app/globals.css",
  "src/app/theme.css",
];
const ALLOWED = new Set(ALLOWED_FILES);

// master.md makes the workspace package the primitive/theme source of truth.
// The web app also carries a synchronized package mirror for standalone use,
// so read both locations when present. Set de-duplication keeps this harmless
// in the monorepo while still making the guard work in a standalone web clone.
const OWNED_TOKEN_FILES = [
  ...ALLOWED_FILES,
  "../packages/ui/src/tokens.css",
  "../packages/ui/src/theme.css",
  "packages/ui/src/tokens.css",
  "packages/ui/src/theme.css",
];

// `bg-` and `text-` also spell utilities that have nothing to do with colour —
// `text-center`, `text-sm`, `bg-cover`. Those are excluded by name so the guard
// does not fail a stylesheet that merely centres its body text.
const NOT_COLOUR = [
  "center", "left", "right", "justify", "start", "end", "wrap", "nowrap",
  "balance", "pretty", "ellipsis", "clip", "uppercase", "lowercase",
  "capitalize", "xs", "sm", "base", "lg", "xl", "\\d?xl",
  "cover", "contain", "fixed", "local", "scroll", "repeat", "no-repeat",
  "bottom", "top", "origin-\\w+", "clip-\\w+", "blend-\\w+",
].join("|");
const APPLY_COLOUR = new RegExp(
  `@apply[^;]*(?:^|\\s)(?:from-|via-|to-|(?:bg|text)-(?!(?:${NOT_COLOUR})(?:\\s|;|$)))`,
);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function collectCssFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectCssFiles(full, files);
    else if (entry.name.endsWith(".css")) files.push(full);
  }
  return files;
}

// The design tokens the global sheets own. A route stylesheet that reassigns
// one of these at :root wins document-wide for the rest of the session — the
// same leak as a bare `body` rule, one selector up. Five route stylesheets were
// redefining --primary, --background and --foreground that way, so visiting one
// of those routes and navigating on repainted every later page in its colours.
// Tokens a route invents for itself are fine; only the shared names are a leak.
export function collectOwnedTokens(root = APP_ROOT) {
  const ownedTokens = new Set();
  for (const file of OWNED_TOKEN_FILES) {
    const absolute = path.resolve(root, file);
    if (!fs.existsSync(absolute)) continue;
    for (const match of fs.readFileSync(absolute, "utf8").matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) {
      ownedTokens.add(match[1]);
    }
  }
  return ownedTokens;
}

function stripPrintBlocks(source) {
  const mediaPrint = /@media\s+print\s*\{/gi;
  let result = "";
  let cursor = 0;
  let match;

  while ((match = mediaPrint.exec(source))) {
    result += source.slice(cursor, match.index);
    let depth = 1;
    let quote = null;
    let escaped = false;
    let index = mediaPrint.lastIndex;

    for (; index < source.length && depth > 0; index += 1) {
      const char = source[index];
      if (quote) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === quote) quote = null;
        continue;
      }
      if (char === '"' || char === "'") quote = char;
      else if (char === "{") depth += 1;
      else if (char === "}") depth -= 1;
    }

    cursor = index;
    mediaPrint.lastIndex = index;
  }

  return result + source.slice(cursor);
}

export function findCssLeaks(file, source, ownedTokens) {
  // Strip @media print blocks — overriding the document is their purpose.
  // Comments go too, so a token block introduced by a banner comment is still
  // seen as starting a rule rather than continuing whatever preceded it.
  const withoutPrint = stripPrintBlocks(
    source.replace(/\/\*[\s\S]*?\*\//g, ""),
  );
  const offenders = [];

  for (const match of withoutPrint.matchAll(
    /(?:^|[{};,])\s*(?:(?:html|:root|\[data-theme(?:=[^\]]+)?\])(?:\[[^\]]*\]|\.[a-zA-Z_-][\w-]*)*\s+)?(?:body:{1,2}(?:before|after)|body(?:\[[^\]]*\]|\.[a-zA-Z_-][\w-]*)*(?!:has\())\s*(?:,[^{]*)?\{([^}]*)\}/g,
  )) {
    const body = match[1];
    const declaresColour = /(?:^|[\s;])(?:background(?:-color)?|color)\s*:/.test(
      body,
    );
    const appliesColour = APPLY_COLOUR.test(body);
    if (!declaresColour && !appliesColour) continue;
    offenders.push({ file, rule: `body { ${body.trim().replace(/\s+/g, " ").slice(0, 70)} }` });
  }

  for (const match of withoutPrint.matchAll(
    /(?:^|[{};,])\s*(?::root(?:\[[^\]]*\]|\.[a-zA-Z_-][\w-]*)*|html(?:\[[^\]]*\]|\.[a-zA-Z_-][\w-]*)*|body(?:\[[^\]]*\]|\.[a-zA-Z_-][\w-]*)*|\[data-theme(?:=[^\]]+)?\]|\.dark)(?!:has\()\s*(?:,[^{]*)?\{([^}]*)\}/g,
  )) {
    const redefined = [...match[1].matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)]
      .map((m) => m[1])
      .filter((token) => ownedTokens.has(token));
    if (!redefined.length) continue;
    offenders.push({
      file,
      rule: `:root { ${redefined.slice(0, 4).join(", ")}${redefined.length > 4 ? `, +${redefined.length - 4} more` : ""} }`,
    });
  }

  return offenders;
}

export function scanCssLeaks(root = APP_ROOT) {
  const files = collectCssFiles(path.join(root, "src"));
  const ownedTokens = collectOwnedTokens(root);
  const offenders = [];
  for (const absolute of files) {
    const file = toPosix(path.relative(root, absolute));
    if (ALLOWED.has(file)) continue;
    offenders.push(...findCssLeaks(file, fs.readFileSync(absolute, "utf8"), ownedTokens));
  }
  return { files, offenders, ownedTokens };
}

function main() {
  const { files, offenders } = scanCssLeaks();
  if (offenders.length === 0) {
    console.log(`Global CSS leak guard: OK (${files.length} stylesheets).`);
    return;
  }

  console.error(
    `Global CSS leak guard: ${offenders.length} route stylesheet(s) paint the document.\n`,
  );
  for (const o of offenders) {
    console.error(`  ${o.file}\n    ${o.rule}\n`);
  }
  console.error(
    "Move the colour — or the token block — onto the route's own root element. A\n" +
      "route stylesheet stays attached after the visitor navigates away, so this\n" +
      "repaints later pages too.",
  );
  process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
