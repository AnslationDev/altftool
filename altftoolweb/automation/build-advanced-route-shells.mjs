import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import backlog from "./new-tasks-backlog.json" with { type: "json" };

const automationDir = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(automationDir, "..", "src", "tools");
const ids = new Set([
  ...Array.from({ length: 60 }, (_, index) => 156 + index),
  225,
  230,
  261,
  264,
  265,
  268,
  313,
  320,
]);

const selected = backlog.tools.filter((item) => ids.has(item.id));
const sharedDir = path.join(toolsDir, "_shared", "advanced");
fs.mkdirSync(sharedDir, { recursive: true });
fs.writeFileSync(
  path.join(sharedDir, "catalog.js"),
  `export const advancedCatalog = ${JSON.stringify(
    Object.fromEntries(selected.map((entry) => [entry.slug, entry])),
    null,
    2,
  )};\n`,
);

for (const entry of selected) {
  const category =
    entry.id >= 156 && entry.id <= 170
      ? "Video & Audio"
      : entry.id >= 171 && entry.id <= 185
        ? "Image & Photo"
        : entry.id >= 186 && entry.id <= 230
          ? "Developer"
          : entry.id >= 261 && entry.id <= 268
            ? "Marketing & Social"
            : entry.id === 313
              ? "Security & Privacy"
              : "Lifestyle";
  const dir = path.join(toolsDir, entry.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "entry.jsx"),
    `"use client";\n\nimport AdvancedWorkbench from "@/tools/_shared/advanced/AdvancedWorkbench";\n\nexport default function ToolEntry() {\n  return <AdvancedWorkbench slug=${JSON.stringify(entry.slug)} />;\n}\n`,
  );
  fs.writeFileSync(
    path.join(dir, "tool.config.js"),
    `const toolConfig = ${JSON.stringify(
      {
        slug: entry.slug,
        name: entry.name,
        category: [category, "Productivity"],
        description: entry.description,
        icon: "wrench",
        iconColor: "text-primary",
        wideWorkspace: true,
      },
      null,
      2,
    )};\n\nexport default toolConfig;\n`,
  );
}

console.log(`Built ${ids.size} advanced route shells.`);
