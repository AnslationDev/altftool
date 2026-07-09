
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
    events: [""],
    team: [""],
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

export const ADMIN_MODULE_LAYOUT_KEYS = {
  altftool: new Set(["blogs"]),
  leadtree: new Set(["blogs", "creditcard", "expertvideos", "ourteams"]),
};

export function resolveAdminModuleRouteKey(
  projectId,
  moduleKey,
  candidates
) {
  const routeKeys = ADMIN_MODULE_ROUTE_KEYS[projectId]?.[moduleKey] || [];
  const match = candidates.find((candidate) =>
    routeKeys.includes(candidate)
  );
  return match === undefined ? null : match;
}

export function hasAdminModuleLayout(projectId, moduleKey) {
  return ADMIN_MODULE_LAYOUT_KEYS[projectId]?.has(moduleKey) || false;
}

