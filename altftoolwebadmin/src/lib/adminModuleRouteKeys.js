
function singlePageRouteKeys(moduleKeys) {
  return Object.fromEntries(moduleKeys.map((moduleKey) => [moduleKey, [""]]));
}

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
    products: [""],
    searchEng: [""],
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
  anslic: {
    navbar: [""],
    footer: [""],
    home: ["", "hero", "about-preview", "services-preview", "testimonials", "team-preview", "cta", "blog-preview"],
    about: ["", "hero", "mission-vision", "values", "team-preview"],
    stats: [""],
    services: [""],
    team: [""],
    blog: ["", "add-article", "edit-article/[id]"],
    contact: ["", "leads"],
  },
  infodrif: {
    navbar: [""],
    home: ["", "hero", "trusted-by", "work-strategy", "showcase"],
    about: ["", "hero", "intro", "services", "story", "team"],
    partners: ["", "hero", "service-features", "features", "pricing"],
    blog: ["", "add-article", "edit-article/[id]", "categories"],
    offers: ["", "add-offer", "edit-offer/[id]"],
    contact: ["", "leads"],
    footer: [""],
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
    homepage: [""],
    walletpage: [""],
    winners: [""],
    quickearn: [""],
    explorecards: [""],
    homecategories: [""],
    bonusladdertiers: [""],
    khokho: [""],
  },
   thestylelife: {
    "site-settings": [""],
    navbar: [""],
    home: [""],
    services: [""],
    team: [""],
    blog: [""],
    testimonials: [""],
    faq: [""],
    "about-us": [""],
    "contact-us": [""],
    policy: [""],
    "term-condition": [""],
    footer: [""],
  },
  snapagee: {
    "site-settings": [""],
    navbar: [""],
    home: [""],
    services: [""],
    team: [""],
    blog: [""],
    testimonials: [""],
    faq: [""],
    "contact-us": [""],
    policy: [""],
    "term-condition": [""],
    footer: [""],
  },
  campaignastra: singlePageRouteKeys([
    "navbar", "footer", "home", "about", "stats", "services", "team", "blog", "contact",
  ]),
  dailyhnt: singlePageRouteKeys([
    "navbar", "home", "services", "team", "blog", "testimonials", "faq", "about-us",
    "contact-us", "policy", "term-condition", "footer", "site-settings",
  ]),
  dealnbook: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "team", "blog", "testimonials", "faq",
    "about-us", "contact-us", "policy", "term-condition", "footer",
  ]),
  exclusinsider: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "team", "blog", "testimonials", "faq",
    "about-us", "contact-us", "policy", "term-condition", "footer",
  ]),
  infovasta: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "why-choose-us", "process", "team",
    "testimonials", "portfolio", "blog", "faq", "about-us", "contact-us", "footer",
  ]),
  offerhoppr: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "team", "blog", "testimonials", "faq",
    "about-us", "contact-us", "policy", "term-condition", "footer", "misc-pages",
  ]),
  offerris: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "team", "blog", "testimonials", "faq",
    "about-us", "contact-us", "policy", "term-condition", "footer",
  ]),
  samvatsara: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "team", "blog", "testimonials", "faq",
    "portfolio", "about-us", "contact-us", "policy", "term-condition", "footer",
  ]),
  shophobia: singlePageRouteKeys([
    "site-settings", "navbar", "home", "services", "team", "blog", "testimonials", "faq",
    "about-us", "contact-us", "policy", "term-condition", "footer",
  ]),
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
