import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import backlog from "./new-tasks-backlog.json" with { type: "json" };

const automationDir = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(automationDir, "..", "src", "tools");
const entries = backlog.tools.filter((entry) => entry.id >= 141 && entry.id <= 155);

const configSource = (entry) => `const toolConfig = {
  slug: ${JSON.stringify(entry.slug)},
  name: ${JSON.stringify(entry.name)},
  category: ["Accessibility", "Productivity"],
  description: ${JSON.stringify(entry.description)},
  icon: "accessibility",
  iconColor: "text-primary",
  wideWorkspace: true,
};

export default toolConfig;
`;

const entrySource = (entry) => `"use client";

import AssistiveTool from "@/tools/_shared/assistive/AssistiveTool";

export default function ToolEntry() {
  return <AssistiveTool slug=${JSON.stringify(entry.slug)} />;
}
`;

for (const entry of entries) {
  const directory = path.join(toolsDir, entry.slug);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "tool.config.js"), configSource(entry));
  fs.writeFileSync(path.join(directory, "entry.jsx"), entrySource(entry));
  console.log(`Built ${entry.id} ${entry.slug}`);
}

console.log(`Built ${entries.length} assistive browser tools.`);
