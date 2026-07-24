import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const appOutput = path.join(root, "altftoolweb/.next/server/app");
const canonicalHosts = new Set(["altftool.com", "www.altftool.com"]);
const excludedRoutes = new Set(["/_global-error", "/_not-found"]);
const failures = [];
const warnings = [];

function decodeHtml(value = "") {
  const named = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function parseAttributes(tag = "") {
  const attributes = {};
  const pattern =
    /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = pattern.exec(tag))) {
    attributes[match[1].toLowerCase()] = decodeHtml(
      match[2] ?? match[3] ?? match[4] ?? "",
    );
  }

  return attributes;
}

function findTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(
    (match) => ({
      raw: match[0],
      attributes: parseAttributes(match[0]),
    }),
  );
}

function getMetaValues(html, key, value) {
  return findTags(html, "meta")
    .filter(
      (tag) =>
        String(tag.attributes[key] || "").toLowerCase() === value.toLowerCase(),
    )
    .map((tag) => String(tag.attributes.content || "").trim())
    .filter(Boolean);
}

function getCanonicalValues(html) {
  return findTags(html, "link")
    .filter((tag) =>
      String(tag.attributes.rel || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    )
    .map((tag) => String(tag.attributes.href || "").trim())
    .filter(Boolean);
}

function getTitleValues(html) {
  return [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)]
    .map((match) =>
      decodeHtml(match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()),
    )
    .filter(Boolean);
}

async function collectHtmlFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    throw new Error(
      `Rendered app output is missing at ${path.relative(root, directory)}. Run npm run build:web first.`,
    );
  }

  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(absolute)));
    } else if (entry.name.endsWith(".html")) {
      files.push(absolute);
    }
  }
  return files;
}

function routeFromFile(file) {
  const relative = path.relative(appOutput, file).split(path.sep).join("/");
  const withoutExtension = relative.replace(/\.html$/, "");
  const route = withoutExtension === "index"
    ? "/"
    : `/${withoutExtension.replace(/\/index$/, "")}`;

  try {
    return decodeURIComponent(route);
  } catch {
    return route;
  }
}

function validateUrl(value, route, label) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      failures.push(`${route}: ${label} must use HTTPS (${value})`);
    }
    if (["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
      failures.push(`${route}: ${label} points to a local host (${value})`);
    }
    if (canonicalHosts.has(url.hostname) && url.hostname !== "www.altftool.com") {
      failures.push(`${route}: ${label} uses the non-canonical apex host (${value})`);
    }
    if (url.hash) {
      failures.push(`${route}: ${label} contains a URL fragment (${value})`);
    }
    return url;
  } catch {
    failures.push(`${route}: ${label} is not a valid absolute URL (${value})`);
    return null;
  }
}

const files = await collectHtmlFiles(appOutput);
let auditedFiles = 0;
let indexableFiles = 0;
let noindexFiles = 0;
const titleOwners = new Map();

for (const file of files) {
  const route = routeFromFile(file);
  if (excludedRoutes.has(route)) continue;

  auditedFiles += 1;
  const html = await readFile(file, "utf8");
  const titles = getTitleValues(html);
  const descriptions = getMetaValues(html, "name", "description");
  const canonicals = getCanonicalValues(html);
  const robots = getMetaValues(html, "name", "robots").join(",").toLowerCase();
  const googlebot = getMetaValues(html, "name", "googlebot").join(",").toLowerCase();
  const noindex = /\bnoindex\b/.test(`${robots},${googlebot}`);

  if (canonicals.length > 1) {
    failures.push(`${route}: rendered ${canonicals.length} canonical links`);
  }
  if (canonicals[0]) validateUrl(canonicals[0], route, "canonical");

  if (noindex) {
    noindexFiles += 1;
    continue;
  }

  indexableFiles += 1;
  if (titles.length !== 1) {
    failures.push(`${route}: expected one title, rendered ${titles.length}`);
  }
  if (descriptions.length !== 1) {
    failures.push(
      `${route}: expected one meta description, rendered ${descriptions.length}`,
    );
  }
  if (canonicals.length !== 1) {
    failures.push(`${route}: expected one canonical, rendered ${canonicals.length}`);
  }

  const title = titles[0] || "";
  const description = descriptions[0] || "";
  if (title.length < 4 || title.length > 140) {
    failures.push(`${route}: title length is ${title.length}; expected 4-140`);
  } else if (title.length > 70) {
    warnings.push(`${route}: long title (${title.length})`);
  }
  if (description.length < 40 || description.length > 180) {
    failures.push(
      `${route}: description length is ${description.length}; expected 40-180`,
    );
  } else if (description.length < 70 || description.length > 165) {
    warnings.push(`${route}: non-ideal description length (${description.length})`);
  }

  const ogTitle = getMetaValues(html, "property", "og:title");
  const ogDescription = getMetaValues(html, "property", "og:description");
  const ogUrl = getMetaValues(html, "property", "og:url");
  const ogImage = getMetaValues(html, "property", "og:image");
  const twitterCard = getMetaValues(html, "name", "twitter:card");
  const twitterTitle = getMetaValues(html, "name", "twitter:title");
  const twitterDescription = getMetaValues(html, "name", "twitter:description");
  const twitterImage = getMetaValues(html, "name", "twitter:image");

  for (const [label, values] of [
    ["og:title", ogTitle],
    ["og:description", ogDescription],
    ["og:url", ogUrl],
    ["og:image", ogImage],
    ["twitter:card", twitterCard],
    ["twitter:title", twitterTitle],
    ["twitter:description", twitterDescription],
    ["twitter:image", twitterImage],
  ]) {
    if (values.length !== 1) {
      failures.push(`${route}: expected one ${label}, rendered ${values.length}`);
    }
  }

  if (ogUrl[0]) {
    validateUrl(ogUrl[0], route, "og:url");
    if (canonicals[0] && ogUrl[0] !== canonicals[0]) {
      failures.push(`${route}: og:url does not match the canonical URL`);
    }
  }
  if (ogImage[0]) validateUrl(ogImage[0], route, "og:image");
  if (twitterImage[0]) validateUrl(twitterImage[0], route, "twitter:image");

  if (title && canonicals[0]) {
    const owners = titleOwners.get(title) || new Set();
    owners.add(canonicals[0]);
    titleOwners.set(title, owners);
  }
}

for (const [title, canonicals] of titleOwners) {
  if (canonicals.size > 1) {
    failures.push(
      `Duplicate title "${title}" is used by ${canonicals.size} canonical URLs`,
    );
  }
}

if (failures.length) {
  console.error(`Rendered SEO audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  if (warnings.length) {
    console.error(`Warnings: ${warnings.length} (showing up to 10)`);
    for (const warning of warnings.slice(0, 10)) console.error(`- ${warning}`);
  }
  process.exit(1);
}

console.log(
  `Rendered SEO audit passed: ${auditedFiles} HTML pages (${indexableFiles} indexable, ${noindexFiles} noindex).`,
);
console.log(
  `Advisory metadata warnings: ${warnings.length}${warnings.length ? " (non-blocking)" : ""}.`,
);
