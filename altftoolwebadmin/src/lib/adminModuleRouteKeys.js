
export const ADMIN_MODULE_ROUTE_KEYS = {
  altftool: {
    academy: [""],
    ads: [""],
    blogs: [
      "",
      "add-blogs",
      "analytics",
      "automation",
      "bulk-refresh",
      "edit-blog/[id]",
      "quality",
      "view-blogs",
      "view-blogs/[id]",
    ],
    buysmart: [""],
    landing: ["", "edit/[id]"],
    consumerrating: [""],
    deals: [""],
    dynamic: [""],
    extensions: [""],
    images: [""],
    salelocator: [""],
    trendingVideos: [""],
    pintrest: [""],
    tripfindbox: [""],
    pranksocialmedia: [""],
    pranx: [""],
    sketchflow: [""],
    seo: [
      "",
      "dashboard",
      "search",
      "global",
      "pages",
      "bulk",
      "technical",
      "gsc",
    ],
  },

  leadtree: {
    blogs: [
      "",
      "add-blogs",
      "analytics",
      "edit-blog/[id]",
      "view-blogs",
      "view-blogs/[id]",
    ],
    creditcard: [
      "",
      "add-cards",
      "edit-card/[id]",
      "view-cards",
      "view-cards/[id]",
    ],
    expertvideos: [
      "",
      "add-video",
      "edit-video/[id]",
      "view-video",
      "view-video/[id]",
    ],
    ourteams: ["", "view-team"],
  },
  smartlucky: {
    home: [""],
    about: [""],
    services: [""],
    solutions: [""],
    resources: [""],
    contact: [""],
    blog: ["", "add-blogs", "edit-blog/[id]"],
    platforms: [""],
    "contact-submissions": [""],
  },
  alphobia: {
    home: [""],
    about: [""],
    services: [""],
    casestudies: [""],
    insights: [""],
    assets: [""],
    contacts: [""],
  },
  apexboost: {
    frontend: [""],
    hero: [""],
    blogs: [""],
    services: [""],
    testimonials: [""],
    portfolio: [""],
    faq: [""],
    features: [""],
    stats: [""],
    process: [""],
    whyChooseUs: [""],
    cta: [""],
    navLinks: [""],
    contact: [""],
  },
  marketys: {
    about: [""],
    home: [""],
    blogs: [""],
    reviews: [""],
    services: [""],
    bookings: [""],
    contact: [""],
    team: [""],
    settings: [""],
  },
  carrerbook: {
    navbar: [""],
    footer: [""],
    home: [""],
    "contact-us": ["", "settings"],
    advertiser: ["", "hero-section", "traffic-types"],
    publisers: [""],
    blog: ["", "add-article", "edit-article/[id]", "view-articles"],
    "about-us": ["", "hero-section", "lead-section"],
    "term-condition": [""],
    policy: [""],
    client: ["", "advertiser", "publisher"],
    events: [""],
    team: [""],
  },

  coozter: {
    navbar: [""],
    home: [
      "",
      "hero-section",
      "marketing-channels",
      "process-section",
      "services-preview",
      "trust-section",
    ],
    about: [
      "",
      "beliefs-section",
      "hero-section",
      "team-section",
      "why-choose-section",
      "work-model-section",
    ],
    services: [
      "",
      "faq-section",
      "growth-engine-section",
      "hero-section",
      "outcomes-section",
      "process-section",
      "service-categories-section",
    ],
    blog: ["", "add-article", "edit-article/[id]"],
    "contact-us": [""],
  },

  growvibe: {
    navbar: [""],
    home: [""],
    services: [""],
    "case-studies": [""],
    blog: [""],
    pages: [""],
    leads: [""],
    footer: [""],
  },

  myluckydeal: {
    dashboard: [""],
    deals: [""],
    categories: [""],
    stores: [""],
    coupons: [""],
    blogs: [""],
    faqs: [""],
    hero: [""],
    ads: [""],
    offers: [""],
    collections: [""],
    settings: [""],
    migration: [""],
  },
  anternet: {
    banners: [""],
    tasks: [""],
    quizcategories: [""],
    questions: [""],
    spinprizes: [""],
    videosections: [""],
    earningtasks: [""],
    settings: [""],
    migration: [""],
    ads: [""],
    notifications: [""],
    pages: [""],
    users: [""],
    arenas: [""],
  },
};

// Route keys for modules shared by every project (SHARED_PROJECT_MODULES in
// src/projects/index.js). SEO resolves these routes under every project.
// NOTE: "gsc" (Google Search Console) is intentionally NOT shared — it is backed
// by a single altftool-global connection, so it stays altftool-only (via
// ADMIN_MODULE_ROUTE_KEYS.altftool.seo) to avoid exposing altftool's search data
// under other projects. It becomes shared once per-project GSC connections exist.
export const SHARED_MODULE_ROUTE_KEYS = {
  seo: ["", "dashboard", "search", "global", "pages", "bulk", "technical"],
};

export const ADMIN_MODULE_LAYOUT_KEYS = {
  altftool: new Set(["blogs"]),
  leadtree: new Set(["blogs", "creditcard", "expertvideos", "ourteams"]),
  marketys: new Set(["blogs"]),
  carrerbook: new Set(["blog"]),
  coozter: new Set(["blog"]),
};

export function resolveAdminModuleRouteKey(
  projectId,
  moduleKey,
  candidates
) {
  // Project-specific route keys win; shared modules (e.g. the SEO Engine) fall
  // back to the platform-wide set so they resolve under every project.
  const routeKeys =
    ADMIN_MODULE_ROUTE_KEYS[projectId]?.[moduleKey] ||
    SHARED_MODULE_ROUTE_KEYS[moduleKey] ||
    [];
  const match = candidates.find((candidate) =>
    routeKeys.includes(candidate)
  );
  return match === undefined ? null : match;
}

export function hasAdminModuleLayout(projectId, moduleKey) {
  return ADMIN_MODULE_LAYOUT_KEYS[projectId]?.has(moduleKey) || false;
}
