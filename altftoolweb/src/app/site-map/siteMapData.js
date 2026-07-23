import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";

const EXPERIENCE_PREFIXES = [
  "/labs",
  "/altfgame",
  ...EXPERIENCE_CATALOG.map((experience) => experience.href),
];

export const SITE_MAP_GROUPS = [
  {
    id: "platform",
    title: "Platform",
    description: "Core AltFTool products, apps, extensions, and discovery hubs.",
    prefixes: ["/products", "/signals", "/apps", "/extensions", "/desktop", "/imgprompt", "/n8n"],
  },
  {
    id: "tools",
    title: "Tools & utilities",
    description: "Every canonical microtool, tool category, image workflow, and PDF utility.",
    prefixes: [
      "/tools",
      "/altfcalculators",
      "/altfloveimg",
      "/altflovepdf",
      "/smartlink",
      "/fullscrn",
      "/search-eng",
    ],
  },
  {
    id: "learn",
    title: "Learn & discover",
    description: "Blogs, news, academy resources, facts, locations, and editorial collections.",
    prefixes: ["/blogs", "/news", "/academy", "/prompts", "/trendingvids", "/locations"],
  },
  {
    id: "commerce",
    title: "Deals & shopping",
    description: "Deals, stores, buying guides, brand ratings, sales, and ranked recommendations.",
    prefixes: ["/deals", "/exclusivedeals", "/buysmart", "/brandrating", "/sale", "/top9", "/top11"],
  },
  {
    id: "experiences",
    title: "Games & experiences",
    description: "Games, interactive experiments, creative spaces, quizzes, and entertainment.",
    prefixes: EXPERIENCE_PREFIXES,
  },
  {
    id: "business",
    title: "Business & services",
    description: "Business products, travel planning, housing services, and specialist destinations.",
    prefixes: [
      "/bops",
      "/business-ops",
      "/housingneeds",
      "/tripfindbox",
      "/homeserv",
      "/siding",
      "/lander",
    ],
  },
  {
    id: "support",
    title: "Company & support",
    description: "Company information, policies, support, status, licenses, and account resources.",
    prefixes: [
      "/policypages",
      "/supportsetting",
      "/request-a-tool",
      "/status",
      "/licenses",
      "/unsubscribe",
      "/account",
      "/site-map",
    ],
  },
  {
    id: "other",
    title: "More destinations",
    description: "Additional public AltFTool pages and standalone experiences.",
    prefixes: [],
  },
];

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

function normalizePath(path = "/") {
  const value = String(path || "/").split(/[?#]/, 1)[0] || "/";
  if (value === "/") return value;
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function hasPrefix(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function getSiteMapGroupId(path = "/") {
  const normalized = normalizePath(path);
  if (normalized === "/") return "platform";

  return (
    SITE_MAP_GROUPS.find(
      (group) => group.id !== "other" && group.prefixes.some((prefix) => hasPrefix(normalized, prefix)),
    )?.id || "other"
  );
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
      path = normalizePath(new URL(entry?.url || entry).pathname);
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
