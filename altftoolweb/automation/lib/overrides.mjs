// Merge generated SEO content (intro/useCases/benefits/faqs) into the app's
// central src/app/tools/toolContentOverrides.js so each tool ships unique,
// crawlable copy and the "Common use cases" section switches on.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const HEADER = `// Hand-written + auto-generated SEO content for tools. Keyed by tool slug.
// \`buildToolSeoContent()\` merges these over category-template defaults.
// Auto-generated entries are appended by the tool-factory automation.

`;

export async function mergeOverrides(overridesFilePath, entries) {
  let current = {};
  try {
    const mod = await import(pathToFileURL(path.resolve(overridesFilePath)).href + `?t=${Date.now()}`);
    current = mod.toolContentOverrides || mod.default || {};
  } catch {
    current = {};
  }

  let added = 0;
  for (const [slug, content] of Object.entries(entries)) {
    const payload = {};
    if (content.intro) payload.intro = content.intro;
    if (content.useCases?.length) payload.useCases = content.useCases;
    if (content.benefits?.length) payload.benefits = content.benefits;
    if (content.faqs?.length) payload.faqs = content.faqs;
    if (content.steps?.length) payload.steps = content.steps;
    if (Object.keys(payload).length) {
      current[slug] = { ...(current[slug] || {}), ...payload };
      added++;
    }
  }

  const body = `${HEADER}export const toolContentOverrides = ${JSON.stringify(current, null, 2)};

export default toolContentOverrides;
`;
  fs.writeFileSync(overridesFilePath, body);
  return added;
}
