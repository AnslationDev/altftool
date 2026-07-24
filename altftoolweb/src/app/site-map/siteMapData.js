import {
  canonicalizePublicPath,
  getPublicRouteFamilyId,
  normalizePublicPath,
  PUBLIC_ROUTE_FAMILIES,
} from "../../platform/navigation/publicRouteTaxonomy.js";

export const SITE_MAP_GROUPS = PUBLIC_ROUTE_FAMILIES;

const ACRONYMS = new Map([
  ["ai", "AI"],
  ["api", "API"],
  ["css", "CSS"],
  ["csv", "CSV"],
  ["dns", "DNS"],
  ["faq", "FAQ"],
  ["gif", "GIF"],
  ["html", "HTML"],
  ["http", "HTTP"],
  ["https", "HTTPS"],
  ["img", "IMG"],
  ["ip", "IP"],
  ["jpg", "JPG"],
  ["json", "JSON"],
  ["pdf", "PDF"],
  ["png", "PNG"],
  ["qr", "QR"],
  ["rss", "RSS"],
  ["seo", "SEO"],
  ["sql", "SQL"],
  ["svg", "SVG"],
  ["ui", "UI"],
  ["url", "URL"],
  ["ux", "UX"],
  ["xml", "XML"],
]);

const normalizePath = normalizePublicPath;

export function getSiteMapGroupId(path = "/") {
  return getPublicRouteFamilyId(path);
}

export function humanizeRouteSegment(segment = "") {
  let decoded = String(segment);
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the encoded segment readable rather than failing the whole directory.
  }

  return decoded
    .replace(/[-_]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ACRONYMS.get(word.toLowerCase()) || `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function getDefaultRouteLabel(path = "/") {
  const normalized = normalizePath(path);
  if (normalized === "/") return "AltFTool home";

  const segments = normalized.split("/").filter(Boolean);
  const lastSegment = segments.at(-1);

  if (segments[0] === "exclusivedeals" && /^\d+$/.test(lastSegment) && segments.length > 2) {
    const category = humanizeRouteSegment(segments.at(-2));
    return `${category} exclusive deals - Page ${lastSegment}`;
  }

  return humanizeRouteSegment(lastSegment) || normalized;
}

export function buildSiteMapGroups(entries = [], { labels = new Map(), query = "" } = {}) {
  const normalizedQuery = String(query).trim().toLowerCase();
  const seen = new Set();
  const routes = [];

  for (const entry of entries) {
    let path;
    try {
      path = canonicalizePublicPath(new URL(entry?.url || entry).pathname);
    } catch {
      continue;
    }

    if (seen.has(path)) continue;
    seen.add(path);

    const label = labels.get(path) || getDefaultRouteLabel(path);
    const groupId = getSiteMapGroupId(path);
    const searchable = `${label} ${path} ${groupId}`.toLowerCase();
    if (normalizedQuery && !searchable.includes(normalizedQuery)) continue;

    routes.push({ label, path, groupId });
  }

  return SITE_MAP_GROUPS.map((group) => ({
    ...group,
    routes: routes
      .filter((route) => route.groupId === group.id)
      .sort((left, right) => left.label.localeCompare(right.label) || left.path.localeCompare(right.path)),
  })).filter((group) => group.routes.length > 0);
}
