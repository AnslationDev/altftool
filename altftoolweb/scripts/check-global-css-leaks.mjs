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

const ALLOWED = new Set([
  "src/app/globals.css",
  "src/app/theme.css",
]);

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

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".css")) files.push(full);
  }
})("src");

const offenders = [];
for (const file of files) {
  if (ALLOWED.has(file)) continue;
  const source = fs.readFileSync(file, "utf8");

  // Strip @media print blocks — overriding the document is their purpose.
  const withoutPrint = source.replace(/@media\s+print\s*\{[\s\S]*?\n\}/g, "");

  for (const match of withoutPrint.matchAll(
    /(?:^|[}\s;])(?:html\s*,\s*)?body\s*\{([^}]*)\}/g,
  )) {
    const body = match[1];
    const declaresColour = /(?:^|[\s;])(?:background(?:-color)?|color)\s*:/.test(
      body,
    );
    const appliesColour = APPLY_COLOUR.test(body);
    if (!declaresColour && !appliesColour) continue;
    offenders.push({ file, rule: body.trim().replace(/\s+/g, " ").slice(0, 70) });
  }
}

if (offenders.length === 0) {
  console.log(`Global CSS leak guard: OK (${files.length} stylesheets).`);
  process.exit(0);
}

console.error(
  `Global CSS leak guard: ${offenders.length} route stylesheet(s) paint the document.\n`,
);
for (const o of offenders) {
  console.error(`  ${o.file}\n    body { ${o.rule} }\n`);
}
console.error(
  "Move the colour onto the route's own root element. A route stylesheet stays\n" +
    "attached after the visitor navigates away, so this repaints later pages too.",
);
process.exit(1);
