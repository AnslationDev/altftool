"use client";

const routeLoaders = {
  altftool: {
    academy: {
      "": () => import("@/projects/altftool/modules/academy/page.jsx"),
    },
    ads: {
      "": () => import("@/projects/altftool/modules/ads/page.jsx"),
    },
    blogs: {
      "": () => import("@/projects/altftool/modules/blogs/page.jsx"),
      "add-blogs": () => import("@/projects/altftool/modules/blogs/add-blogs/page.jsx"),
      analytics: () => import("@/projects/altftool/modules/blogs/analytics/page.jsx"),
      "bulk-refresh": () => import("@/projects/altftool/modules/blogs/bulk-refresh/page.jsx"),
      "edit-blog/[id]": () => import("@/projects/altftool/modules/blogs/edit-blog/[id]/page.jsx"),
      quality: () => import("@/projects/altftool/modules/blogs/quality/page.jsx"),
      "view-blogs": () => import("@/projects/altftool/modules/blogs/view-blogs/page.jsx"),
      "view-blogs/[id]": () => import("@/projects/altftool/modules/blogs/view-blogs/[id]/page.jsx"),
    },
    buysmart: {
      "": () => import("@/projects/altftool/modules/buysmart/page.jsx"),
    },
    consumerrating: {
      "": () => import("@/projects/altftool/modules/consumerrating/page.jsx"),
    },
    deals: {
      "": () => import("@/projects/altftool/modules/deals/page.jsx"),
    },
    dynamic: {
      "": () => import("@/projects/altftool/modules/dynamic/page.jsx"),
    },
    extensions: {
      "": () => import("@/projects/altftool/modules/extensions/page.jsx"),
    },
    images: {
      "": () => import("@/projects/altftool/modules/images/page.jsx"),
    },
    salelocator: {
      "": () => import("@/projects/altftool/modules/salelocator/page.jsx"),
    },
    trendingVideos: {
      "": () => import("@/projects/altftool/modules/trendingVideos/page.jsx"),
    },
    pintrest: {
      "": () => import("@/projects/altftool/modules/pintrest/page.jsx"),
    },
    tripfindbox: {
      "": () => import("@/projects/altftool/modules/tripfindbox/page.jsx"),
    },
    pranksocialmedia: {
      "": () => import("@/projects/altftool/modules/prank-socialmedia/page.jsx"),
    },
    pranx: {
      "": () => import("@/projects/altftool/modules/pranx/page.jsx")
    },
    sketchflow: {
      "": () => import("@/projects/altftool/modules/sketchflow/page.jsx")
    },
    seo: {
      "": () => import("@/projects/altftool/modules/seo/page.jsx"),
      dashboard: () => import("@/projects/altftool/modules/seo/dashboard/page.jsx"),
      search: () => import("@/projects/altftool/modules/seo/search/page.jsx"),
      global: () => import("@/projects/altftool/modules/seo/global/page.jsx"),
      pages: () => import("@/projects/altftool/modules/seo/pages/page.jsx"),
      bulk: () => import("@/projects/altftool/modules/seo/bulk/page.jsx"),
      technical: () => import("@/projects/altftool/modules/seo/technical/page.jsx"),
      gsc: () => import("@/projects/altftool/modules/seo/gsc/page.jsx"),
      "search-console": () => import("@/projects/altftool/modules/seo/search-console/page.jsx"),
    },
  },
  leadtree: {
    blogs: {
      "": () => import("@/projects/leadtree/modules/blogs/page.jsx"),
      "add-blogs": () => import("@/projects/leadtree/modules/blogs/add-blogs/page.jsx"),
      analytics: () => import("@/projects/leadtree/modules/blogs/analytics/page.jsx"),
      "edit-blog/[id]": () => import("@/projects/leadtree/modules/blogs/edit-blog/[id]/page.jsx"),
      "view-blogs": () => import("@/projects/leadtree/modules/blogs/view-blogs/page.jsx"),
      "view-blogs/[id]": () => import("@/projects/leadtree/modules/blogs/view-blogs/[id]/page.jsx"),
    },
    creditcard: {
      "": () => import("@/projects/leadtree/modules/creditcard/page.jsx"),
      "add-cards": () => import("@/projects/leadtree/modules/creditcard/add-cards/page.jsx"),
      "edit-card/[id]": () => import("@/projects/leadtree/modules/creditcard/edit-card/[id]/page.jsx"),
      "view-cards": () => import("@/projects/leadtree/modules/creditcard/view-cards/page.jsx"),
      "view-cards/[id]": () => import("@/projects/leadtree/modules/creditcard/view-cards/[id]/page.jsx"),
    },
    expertvideos: {
      "": () => import("@/projects/leadtree/modules/expertvideos/page.jsx"),
      "add-video": () => import("@/projects/leadtree/modules/expertvideos/add-video/page.jsx"),
      "edit-video/[id]": () => import("@/projects/leadtree/modules/expertvideos/edit-video/[id]/page.jsx"),
      "view-video": () => import("@/projects/leadtree/modules/expertvideos/view-video/page.jsx"),
      "view-video/[id]": () => import("@/projects/leadtree/modules/expertvideos/view-video/[id]/page.jsx"),
    },
    ourteams: {
      "": () => import("@/projects/leadtree/modules/ourteams/page.jsx"),
      "view-team": () => import("@/projects/leadtree/modules/ourteams/view-team/page.jsx"),
    },
  },
  smartlucky: {
    home: {
      "": () => import("@/projects/smartlucky/modules/home/page.jsx"),
    },
    about: {
      "": () => import("@/projects/smartlucky/modules/about/page.jsx"),
    },
    services: {
      "": () => import("@/projects/smartlucky/modules/services-page/page.jsx"),
    },
    solutions: {
      "": () => import("@/projects/smartlucky/modules/solutions-page/page.jsx"),
    },
    resources: {
      "": () => import("@/projects/smartlucky/modules/resources/page.jsx"),
    },
    contact: {
      "": () => import("@/projects/smartlucky/modules/contact/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/smartlucky/modules/blog/page.jsx"),
    },
    platforms: {
      "": () => import("@/projects/smartlucky/modules/platforms-page/page.jsx"),
    },
    "contact-submissions": {
      "": () => import("@/projects/smartlucky/modules/contact-submissions/page.jsx"),
    },
  },
  alphobia: {
    home: {
      "": () => import("@/projects/alphobia/modules/home/page.jsx"),
    },
    about: {
      "": () => import("@/projects/alphobia/modules/about/page.jsx"),
    },
    services: {
      "": () => import("@/projects/alphobia/modules/services/page.jsx"),
    },
    casestudies: {
      "": () => import("@/projects/alphobia/modules/casestudies/page.jsx"),
    },
    insights: {
      "": () => import("@/projects/alphobia/modules/insights/page.jsx"),
    },
    assets: {
      "": () => import("@/projects/alphobia/modules/assets/page.jsx"),
    },
    contacts: {
      "": () => import("@/projects/alphobia/modules/contacts/page.jsx"),
    },
  },
  marketys: {
    about: { "": () => import("@/projects/marketys/modules/about/page.jsx") },
    home: { "": () => import("@/projects/marketys/modules/home/page.jsx") },
    blogs: { "": () => import("@/projects/marketys/modules/blogs/page.jsx") },
    reviews: { "": () => import("@/projects/marketys/modules/reviews/page.jsx") },
    services: { "": () => import("@/projects/marketys/modules/services/page.jsx") },
    bookings: { "": () => import("@/projects/marketys/modules/bookings/page.jsx") },
    contact: { "": () => import("@/projects/marketys/modules/contact/page.jsx") },
    team: { "": () => import("@/projects/marketys/modules/team/page.jsx") },
    settings: { "": () => import("@/projects/marketys/modules/settings/page.jsx") },
  },
};

const layoutLoaders = {
  altftool: {
    blogs: () => import("@/projects/altftool/modules/blogs/layout.jsx"),
  },
  leadtree: {
    blogs: () => import("@/projects/leadtree/modules/blogs/layout.jsx"),
    creditcard: () => import("@/projects/leadtree/modules/creditcard/layout.jsx"),
    expertvideos: () => import("@/projects/leadtree/modules/expertvideos/layout.jsx"),
    ourteams: () => import("@/projects/leadtree/modules/ourteams/layout.jsx"),
  },
  marketys: {
    blogs: () => import("@/projects/marketys/modules/blogs/layout.jsx"),
  },
};

export function getAdminModulePageLoader(projectId, moduleKey, routeKey) {
  const moduleRoutes = routeLoaders[projectId]?.[moduleKey];
  return moduleRoutes?.[routeKey] || null;
}

export function getAdminModuleLayoutLoader(projectId, moduleKey) {
  return layoutLoaders[projectId]?.[moduleKey] || null;
}
