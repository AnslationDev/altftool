import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const argValue = (name, fallback = "") => {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
};
const buildRoot = path.resolve(
  workspaceRoot,
  argValue("--build-dir", "altftoolweb/.next/server/app"),
);
const outputPath = argValue("--output");
const jsonOnly = args.includes("--json");

const REQUIRED_FIELDS = {
  Organization: [["name"], ["url"]],
  WebSite: [["name"], ["url"]],
  WebPage: [["name"], ["url"]],
  CollectionPage: [["name"], ["url"]],
  ContactPage: [["name"], ["url"]],
  Person: [["name"], ["url"]],
  Article: [["headline"], ["mainEntityOfPage", "url"]],
  BlogPosting: [["headline"], ["url", "mainEntityOfPage"]],
  SoftwareApplication: [["name"], ["url"], ["applicationCategory"], ["offers"]],
  WebApplication: [["name"], ["url"], ["applicationCategory"], ["offers"]],
  VideoGame: [["name"], ["url"], ["applicationCategory"], ["offers"]],
  Book: [["name"], ["url"], ["author"]],
  Service: [["name"], ["url", "@id"]],
  Country: [["name"]],
  State: [["name"]],
  City: [["name"]],
};

const URL_KEYS = new Set([
  "@id",
  "contentUrl",
  "embedUrl",
  "item",
  "mainEntityOfPage",
  "target",
  "thumbnailUrl",
  "url",
]);

function hasValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function schemaTypes(node) {
  const value = node?.["@type"];
  return (Array.isArray(value) ? value : [value]).filter(
    (type) => typeof type === "string" && type.trim(),
  );
}

function schemaNodes(payload) {
  const roots = Array.isArray(payload) ? payload : [payload];
  return roots.flatMap((node) => {
    if (!node || typeof node !== "object" || Array.isArray(node)) return [node];
    if (!Array.isArray(node["@graph"])) return [node];
    return node["@graph"].map((child) => ({
      ...child,
      "@context": child?.["@context"] || node["@context"],
    }));
  });
}

function routeFromHtml(file) {
  const relative = path.relative(buildRoot, file).replace(/\\/g, "/");
  const withoutExtension = relative.replace(/\.html$/, "");
  return withoutExtension === "index" ? "/" : `/${withoutExtension}`;
}

function isPublicHtml(file) {
  const route = routeFromHtml(file);
  return !route.split("/").some((segment) => segment.startsWith("_"));
}

async function collectHtmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(target)));
    } else if (entry.name.endsWith(".html")) {
      files.push(target);
    }
  }
  return files;
}

function validateUrl(value, location, issues) {
  if (typeof value !== "string" || !/^https?:\/\//i.test(value)) return;

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    issues.push(`${location}: invalid URL ${value}`);
    return;
  }

  if (["localhost", "127.0.0.1", "::1"].includes(parsed.hostname)) {
    issues.push(`${location}: local URL leaked into structured data`);
  }
  if (parsed.hostname === "altftool.com") {
    issues.push(`${location}: same-site URL must use canonical www.altftool.com`);
  }
}

function inspectUrls(value, location, issues, parentKey = "") {
  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      inspectUrls(item, `${location}[${index}]`, issues, parentKey),
    );
    return;
  }

  if (!value || typeof value !== "object") {
    if (URL_KEYS.has(parentKey)) validateUrl(value, location, issues);
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    inspectUrls(child, `${location}.${key}`, issues, key);
  }
}

function validateListItems(node, key, location, issues) {
  const items = node[key];
  if (!Array.isArray(items) || !items.length) {
    issues.push(`${location}: ${key} must contain at least one item`);
    return;
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      issues.push(`${location}: ${key}[${index}] must be an object`);
      return;
    }
    if (!hasValue(item.name)) {
      issues.push(`${location}: ${key}[${index}] is missing name`);
    }
    if (!hasValue(item.position)) {
      issues.push(`${location}: ${key}[${index}] is missing position`);
    }
    if (!hasValue(item.item) && !hasValue(item.url)) {
      issues.push(`${location}: ${key}[${index}] is missing item/url`);
    }
  });
}

function validateSchemaNode(node, location, issues, warnings) {
  if (!node || typeof node !== "object" || Array.isArray(node)) {
    issues.push(`${location}: schema root must be an object`);
    return [];
  }

  if (node["@context"] !== "https://schema.org") {
    issues.push(`${location}: @context must be https://schema.org`);
  }

  const types = schemaTypes(node);
  if (!types.length) {
    issues.push(`${location}: missing @type`);
    return [];
  }

  for (const type of types) {
    for (const alternatives of REQUIRED_FIELDS[type] || []) {
      if (!alternatives.some((field) => hasValue(node[field]))) {
        issues.push(`${location}: ${type} is missing ${alternatives.join(" or ")}`);
      }
    }
  }

  if (types.includes("BreadcrumbList")) {
    validateListItems(node, "itemListElement", location, issues);
  }
  if (types.includes("ItemList")) {
    validateListItems(node, "itemListElement", location, issues);
  }
  if (types.includes("FAQPage")) {
    const questions = node.mainEntity;
    if (!Array.isArray(questions) || !questions.length) {
      issues.push(`${location}: FAQPage must include questions`);
    } else {
      questions.forEach((question, index) => {
        if (!question?.name || !question?.acceptedAnswer?.text) {
          issues.push(`${location}: FAQ question ${index + 1} is incomplete`);
        }
      });
    }
  }
  if (types.includes("HowTo") && (!Array.isArray(node.step) || !node.step.length)) {
    issues.push(`${location}: HowTo must include steps`);
  }
  if (
    (types.includes("Article") || types.includes("BlogPosting")) &&
    !node.datePublished
  ) {
    warnings.push(`${location}: article has no datePublished`);
  }

  inspectUrls(node, location, issues);
  return types;
}

async function audit() {
  const htmlFiles = (await collectHtmlFiles(buildRoot)).filter(isPublicHtml);
  const issues = [];
  const warnings = [];
  const typeCounts = {};
  const missingSchemaRoutes = [];
  let scriptCount = 0;
  let schemaCount = 0;

  for (const file of htmlFiles) {
    const route = routeFromHtml(file);
    const html = await readFile(file, "utf8");
    const scripts = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];

    if (!scripts.length) {
      missingSchemaRoutes.push(route);
      continue;
    }

    scripts.forEach((match, scriptIndex) => {
      scriptCount += 1;
      let payload;
      try {
        payload = JSON.parse(match[1]);
      } catch (error) {
        issues.push(`${route} script ${scriptIndex + 1}: invalid JSON (${error.message})`);
        return;
      }

      schemaNodes(payload).forEach((node, nodeIndex) => {
        schemaCount += 1;
        const location = `${route} script ${scriptIndex + 1} node ${nodeIndex + 1}`;
        for (const type of validateSchemaNode(node, location, issues, warnings)) {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      });
    });
  }

  if (missingSchemaRoutes.length) {
    issues.push(
      `${missingSchemaRoutes.length} public pages have no structured data: ${missingSchemaRoutes
        .slice(0, 12)
        .join(", ")}`,
    );
  }

  return {
    ok: issues.length === 0,
    buildRoot,
    checkedAt: new Date().toISOString(),
    pages: htmlFiles.length,
    pagesWithSchema: htmlFiles.length - missingSchemaRoutes.length,
    scripts: scriptCount,
    schemas: schemaCount,
    typeCounts: Object.fromEntries(
      Object.entries(typeCounts).sort((a, b) => b[1] - a[1]),
    ),
    missingSchemaRoutes,
    issues,
    warnings,
  };
}

const report = await audit();

if (outputPath) {
  const absoluteOutput = path.resolve(workspaceRoot, outputPath);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("Rendered structured-data audit");
  console.log(`Pages: ${report.pages}`);
  console.log(`Pages with schema: ${report.pagesWithSchema}`);
  console.log(`JSON-LD scripts: ${report.scripts}`);
  console.log(`Schema nodes: ${report.schemas}`);
  console.log(`Errors: ${report.issues.length}`);
  console.log(`Advisories: ${report.warnings.length}`);
  console.log(
    `Types: ${Object.entries(report.typeCounts)
      .map(([type, count]) => `${type}=${count}`)
      .join(", ")}`,
  );

  for (const issue of report.issues.slice(0, 40)) console.error(`- ${issue}`);
  for (const warning of report.warnings.slice(0, 20)) console.warn(`- ${warning}`);
}

if (!report.ok) process.exit(1);
