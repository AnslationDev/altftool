export const ADMIN_MODULE_ROUTE_KEYS = {
  altftool: {
    academy: [""],
    ads: [""],
    blogs: [
      "",
      "add-blogs",
      "analytics",
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
    seo: ["", "dashboard", "search", "global", "pages", "bulk", "technical", "gsc"],
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
    creditcard: ["", "add-cards", "edit-card/[id]", "view-cards", "view-cards/[id]"],
    expertvideos: ["", "add-video", "edit-video/[id]", "view-video", "view-video/[id]"],
    ourteams: ["", "view-team"],
  },
  carrerbook: {
    navbar: [""],
    footer: [""],
    home: [""],
    "contact-us": [""],
    advertiser: ["", "hero-section", "traffic-types"],
    publisers: [""],
    blog: [""],
    "about-us": ["", "hero-section", "lead-section"],
    team: [""],
  },
};

export const ADMIN_MODULE_LAYOUT_KEYS = {
  altftool: new Set(["blogs"]),
  leadtree: new Set(["blogs", "creditcard", "expertvideos", "ourteams"]),
};

export function resolveAdminModuleRouteKey(projectId, moduleKey, candidates) {
  const routeKeys = ADMIN_MODULE_ROUTE_KEYS[projectId]?.[moduleKey] || [];
  const match = candidates.find((candidate) => routeKeys.includes(candidate));
  return match === undefined ? null : match;
}

export function hasAdminModuleLayout(projectId, moduleKey) {
  return ADMIN_MODULE_LAYOUT_KEYS[projectId]?.has(moduleKey) || false;
}
