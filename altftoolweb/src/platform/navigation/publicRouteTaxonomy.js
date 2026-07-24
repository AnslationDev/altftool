import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";

const EXPERIENCE_PREFIXES = [
  "/labs",
  "/altfgame",
  ...EXPERIENCE_CATALOG.map((experience) => experience.href),
];

export const PUBLIC_ROUTE_FAMILIES = Object.freeze([
  {
    id: "platform",
    title: "Products & workspaces",
    shortTitle: "Products",
    description:
      "Focused AltFTool products for ideas, security, careers, creators, markets, and everyday work.",
    href: "/products",
    prefixes: ["/products", "/signals", "/tradeon"],
  },
  {
    id: "tools",
    title: "Tools & utilities",
    shortTitle: "Use a tool",
    description:
      "Browser-based utilities for files, images, PDFs, calculations, development, privacy, and more.",
    href: "/tools/all",
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
    id: "automation",
    title: "Apps & automation",
    shortTitle: "Automate work",
    description:
      "Workflow templates, prompt workspaces, browser extensions, mobile apps, and desktop software.",
    href: "/n8n",
    prefixes: ["/n8n", "/imgprompt", "/apps", "/extensions", "/desktop"],
  },
  {
    id: "business",
    title: "Business & services",
    shortTitle: "Business services",
    description:
      "Organized guides and specialist destinations for housing, finance, travel, legal, pet, and care needs.",
    href: "/bops",
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
    id: "commerce",
    title: "Deals & shopping",
    shortTitle: "Compare & save",
    description:
      "Deals, buying guides, store directories, brand ratings, sale discovery, and ranked recommendations.",
    href: "/buysmart",
    prefixes: [
      "/deals",
      "/exclusivedeals",
      "/buysmart",
      "/brandrating",
      "/sale",
      "/top9",
      "/top11",
    ],
  },
  {
    id: "learn",
    title: "Learn & discover",
    shortTitle: "Learn",
    description:
      "Practical guides, news, academy resources, prompts, videos, and location-based discovery.",
    href: "/academy",
    prefixes: [
      "/blogs",
      "/news",
      "/academy",
      "/prompts",
      "/trendingvids",
      "/locations",
    ],
  },
  {
    id: "experiences",
    title: "Labs & experiences",
    shortTitle: "Explore labs",
    description:
      "Interactive experiments, creative spaces, games, cultural discovery, quizzes, and focus experiences.",
    href: "/labs",
    prefixes: EXPERIENCE_PREFIXES,
  },
  {
    id: "support",
    title: "Company & support",
    shortTitle: "Get help",
    description:
      "Company information, policies, support, service status, licenses, accounts, and the complete site map.",
    href: "/supportsetting",
    prefixes: [
      "/policypages",
      "/supportsetting",
      "/request-a-tool",
      "/status",
      "/licenses",
      "/unsubscribe",
      "/account",
      "/docs",
      "/site-map",
    ],
  },
  {
    id: "other",
    title: "More destinations",
    shortTitle: "More",
    description:
      "Additional public AltFTool pages and standalone destinations.",
    href: "/site-map",
    prefixes: [],
  },
]);

export const PUBLIC_ROUTE_ALIASES = Object.freeze([
  { from: "/business-ops/housingneeds", to: "/bops/housingneeds" },
  { from: "/business-ops", to: "/bops" },
  { from: "/housingneeds", to: "/bops/housingneeds" },
  { from: "/tripfindbox", to: "/bops/tripfindbox" },
  { from: "/games", to: "/tools/games" },
  { from: "/categories", to: "/tools/all" },
  { from: "/exclusive-deals", to: "/exclusivedeals" },
  { from: "/buy-smart", to: "/buysmart" },
  { from: "/sale-locator", to: "/sale" },
  { from: "/sales", to: "/sale" },
  { from: "/brand-ratings", to: "/brandrating" },
  { from: "/trending-videos", to: "/trendingvids" },
  { from: "/blog", to: "/blogs" },
  { from: "/about-us", to: "/policypages/about" },
  { from: "/about", to: "/policypages/about" },
  { from: "/contact", to: "/policypages/contact" },
  { from: "/privacy", to: "/policypages/privacy" },
  { from: "/terms", to: "/policypages/termsandconditions" },
  { from: "/cookie-policy", to: "/policypages/cookie" },
]);

export function normalizePublicPath(value = "/") {
  try {
    const pathname = new URL(String(value || "/"), "https://altftool.com")
      .pathname;
    if (pathname === "/") return pathname;
    return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  } catch {
    return "/";
  }
}

export function canonicalizePublicPath(value = "/") {
  const path = normalizePublicPath(value);

  for (const alias of PUBLIC_ROUTE_ALIASES) {
    if (path === alias.from) return alias.to;
    if (path.startsWith(`${alias.from}/`)) {
      return `${alias.to}${path.slice(alias.from.length)}`;
    }
  }

  return path;
}

function hasPrefix(path, prefix) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

export function getPublicRouteFamilyId(value = "/") {
  const path = canonicalizePublicPath(value);
  if (path === "/") return "platform";

  return (
    PUBLIC_ROUTE_FAMILIES.find(
      (family) =>
        family.id !== "other" &&
        family.prefixes.some((prefix) => hasPrefix(path, prefix)),
    )?.id || "other"
  );
}
