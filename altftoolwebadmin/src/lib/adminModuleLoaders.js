
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
      "add-blogs": () =>
        import("@/projects/altftool/modules/blogs/add-blogs/page.jsx"),
      analytics: () =>
        import("@/projects/altftool/modules/blogs/analytics/page.jsx"),
      automation: () =>
        import("@/projects/altftool/modules/blogs/automation/page.jsx"),
      "bulk-refresh": () =>
        import("@/projects/altftool/modules/blogs/bulk-refresh/page.jsx"),
      "edit-blog/[id]": () =>
        import("@/projects/altftool/modules/blogs/edit-blog/[id]/page.jsx"),
      quality: () =>
        import("@/projects/altftool/modules/blogs/quality/page.jsx"),
      "view-blogs": () =>
        import("@/projects/altftool/modules/blogs/view-blogs/page.jsx"),
      "view-blogs/[id]": () =>
        import("@/projects/altftool/modules/blogs/view-blogs/[id]/page.jsx"),
    },
    buysmart: {
      "": () => import("@/projects/altftool/modules/buysmart/page.jsx"),
    },
    consumerrating: {
      "": () =>
        import("@/projects/altftool/modules/consumerrating/page.jsx"),
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
      "": () =>
        import("@/projects/altftool/modules/trendingVideos/page.jsx"),
    },
    pintrest: {
      "": () => import("@/projects/altftool/modules/pintrest/page.jsx"),
    },
    tripfindbox: {
      "": () => import("@/projects/altftool/modules/tripfindbox/page.jsx"),
    },
    pranksocialmedia: {
      "": () =>
        import("@/projects/altftool/modules/pranksocialmedia/page.jsx"),
    },
    pranx: {
      "": () => import("@/projects/altftool/modules/pranx/page.jsx"),
    },
    sketchflow: {
      "": () => import("@/projects/altftool/modules/sketchflow/page.jsx"),
    },
    seo: {
      "": () => import("@/projects/altftool/modules/seo/page.jsx"),
      dashboard: () =>
        import("@/projects/altftool/modules/seo/dashboard/page.jsx"),
      search: () =>
        import("@/projects/altftool/modules/seo/search/page.jsx"),
      global: () =>
        import("@/projects/altftool/modules/seo/global/page.jsx"),
      pages: () =>
        import("@/projects/altftool/modules/seo/pages/page.jsx"),
      bulk: () =>
        import("@/projects/altftool/modules/seo/bulk/page.jsx"),
      technical: () =>
        import("@/projects/altftool/modules/seo/technical/page.jsx"),
      gsc: () =>
        import("@/projects/altftool/modules/seo/gsc/page.jsx"),
      "search-console": () =>
        import("@/projects/altftool/modules/seo/search-console/page.jsx"),
    },
  },

  leadtree: {
    blogs: {
      "": () => import("@/projects/leadtree/modules/blogs/page.jsx"),
      "add-blogs": () =>
        import("@/projects/leadtree/modules/blogs/add-blogs/page.jsx"),
      analytics: () =>
        import("@/projects/leadtree/modules/blogs/analytics/page.jsx"),
      "edit-blog/[id]": () =>
        import("@/projects/leadtree/modules/blogs/edit-blog/[id]/page.jsx"),
      "view-blogs": () =>
        import("@/projects/leadtree/modules/blogs/view-blogs/page.jsx"),
      "view-blogs/[id]": () =>
        import("@/projects/leadtree/modules/blogs/view-blogs/[id]/page.jsx"),
    },
    creditcard: {
      "": () => import("@/projects/leadtree/modules/creditcard/page.jsx"),
      "add-cards": () =>
        import("@/projects/leadtree/modules/creditcard/add-cards/page.jsx"),
      "edit-card/[id]": () =>
        import("@/projects/leadtree/modules/creditcard/edit-card/[id]/page.jsx"),
      "view-cards": () =>
        import("@/projects/leadtree/modules/creditcard/view-cards/page.jsx"),
      "view-cards/[id]": () =>
        import("@/projects/leadtree/modules/creditcard/view-cards/[id]/page.jsx"),
    },
    expertvideos: {
      "": () => import("@/projects/leadtree/modules/expertvideos/page.jsx"),
      "add-video": () =>
        import("@/projects/leadtree/modules/expertvideos/add-video/page.jsx"),
      "edit-video/[id]": () =>
        import("@/projects/leadtree/modules/expertvideos/edit-video/[id]/page.jsx"),
      "view-video": () =>
        import("@/projects/leadtree/modules/expertvideos/view-video/page.jsx"),
      "view-video/[id]": () =>
        import("@/projects/leadtree/modules/expertvideos/view-video/[id]/page.jsx"),
    },
    ourteams: {
      "": () => import("@/projects/leadtree/modules/ourteams/page.jsx"),
      "view-team": () =>
        import("@/projects/leadtree/modules/ourteams/view-team/page.jsx"),
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
      "add-blogs": () =>
        import("@/projects/smartlucky/modules/blog/add-blogs/page.jsx"),
      "edit-blog/[id]": () =>
        import("@/projects/smartlucky/modules/blog/edit-blog/[id]/page.jsx"),
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
  carrerbook: {
    navbar: {
      "": () => import("@/projects/carrerbook/modules/navbar/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/carrerbook/modules/footer/page.jsx"),
    },
    home: {
      "": () => import("@/projects/carrerbook/modules/home/page.jsx"),
    },
    "contact-us": {
      "": () => import("@/projects/carrerbook/modules/contact-us/page.jsx"),
      settings: () => import("@/projects/carrerbook/modules/contact-us/settings/page.jsx"),
    },
    advertiser: {
      "": () => import("@/projects/carrerbook/modules/advertiser/page.jsx"),
      "hero-section": () =>
        import("@/projects/carrerbook/modules/advertiser/hero-section/page.jsx"),
      "traffic-types": () =>
        import("@/projects/carrerbook/modules/advertiser/traffic-types/page.jsx"),
    },
    publisers: {
      "": () => import("@/projects/carrerbook/modules/publisers/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/carrerbook/modules/blog/page.jsx"),
      "add-article": () =>
        import("@/projects/carrerbook/modules/blog/add-article/page.jsx"),
      "edit-article/[id]": () =>
        import("@/projects/carrerbook/modules/blog/edit-article/[id]/page.jsx"),
      "view-articles": () =>
        import("@/projects/carrerbook/modules/blog/view-articles/page.jsx"),
    },
    "about-us": {
      "": () => import("@/projects/carrerbook/modules/about-us/page.jsx"),
      "hero-section": () =>
        import("@/projects/carrerbook/modules/about-us/hero-section/page.jsx"),
      "lead-section": () =>
        import("@/projects/carrerbook/modules/about-us/lead-section/page.jsx"),
    },
    "term-condition": {
      "": () => import("@/projects/carrerbook/modules/term-condition/page.jsx"),
    },
    policy: {
      "": () => import("@/projects/carrerbook/modules/policy/page.jsx"),
    },
    client: {
      "": () => import("@/projects/carrerbook/modules/client/page.jsx"),
      advertiser: () =>
        import("@/projects/carrerbook/modules/client/advertiser/page.jsx"),
      publisher: () =>
        import("@/projects/carrerbook/modules/client/publisher/page.jsx"),
    },
    events: {
      "": () => import("@/projects/carrerbook/modules/events/page.jsx"),
    },
    team: {
      "": () => import("@/projects/carrerbook/modules/team/page.jsx"),
    },
  },

  apexboost: {
    frontend: {
      "": () => import("@/projects/apexboost/modules/frontend/page.jsx"),
    },
    hero: {
      "": () => import("@/projects/apexboost/modules/hero/page.jsx"),
    },
    blogs: {
      "": () => import("@/projects/apexboost/modules/blogs/page.jsx"),
    },
    services: {
      "": () => import("@/projects/apexboost/modules/services/page.jsx"),
    },
    testimonials: {
      "": () => import("@/projects/apexboost/modules/testimonials/page.jsx"),
    },
    portfolio: {
      "": () => import("@/projects/apexboost/modules/portfolio/page.jsx"),
    },
    faq: {
      "": () => import("@/projects/apexboost/modules/faq/page.jsx"),
    },
    features: {
      "": () => import("@/projects/apexboost/modules/features/page.jsx"),
    },
    stats: {
      "": () => import("@/projects/apexboost/modules/stats/page.jsx"),
    },
    process: {
      "": () => import("@/projects/apexboost/modules/process/page.jsx"),
    },
    whyChooseUs: {
      "": () => import("@/projects/apexboost/modules/whyChooseUs/page.jsx"),
    },
    cta: {
      "": () => import("@/projects/apexboost/modules/cta/page.jsx"),
    },
    navLinks: {
      "": () => import("@/projects/apexboost/modules/navLinks/page.jsx"),
    },
    contact: {
      "": () => import("@/projects/apexboost/modules/contact/page.jsx"),

    },
  },
  coozter: {
    home: {
      "": () => import("@/projects/coozter/modules/home/page.jsx"),
      "hero-section": () => import("@/projects/coozter/modules/home/hero-section/page.jsx"),
      "marketing-channels": () => import("@/projects/coozter/modules/home/marketing-channels/page.jsx"),
      "process-section": () => import("@/projects/coozter/modules/home/process-section/page.jsx"),
      "services-preview": () => import("@/projects/coozter/modules/home/services-preview/page.jsx"),
      "trust-section": () => import("@/projects/coozter/modules/home/trust-section/page.jsx"),
    },
    about: {
      "": () => import("@/projects/coozter/modules/about/page.jsx"),
      "beliefs-section": () => import("@/projects/coozter/modules/about/beliefs-section/page.jsx"),
      "hero-section": () => import("@/projects/coozter/modules/about/hero-section/page.jsx"),
      "team-section": () => import("@/projects/coozter/modules/about/team-section/page.jsx"),
      "why-choose-section": () => import("@/projects/coozter/modules/about/why-choose-section/page.jsx"),
      "work-model-section": () => import("@/projects/coozter/modules/about/work-model-section/page.jsx"),
    },
    services: {
      "": () => import("@/projects/coozter/modules/services/page.jsx"),
      "faq-section": () => import("@/projects/coozter/modules/services/faq-section/page.jsx"),
      "growth-engine-section": () => import("@/projects/coozter/modules/services/growth-engine-section/page.jsx"),
      "hero-section": () => import("@/projects/coozter/modules/services/hero-section/page.jsx"),
      "outcomes-section": () => import("@/projects/coozter/modules/services/outcomes-section/page.jsx"),
      "process-section": () => import("@/projects/coozter/modules/services/process-section/page.jsx"),
      "service-categories-section": () => import("@/projects/coozter/modules/services/service-categories-section/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/coozter/modules/blog/page.jsx"),
      "add-article": () => import("@/projects/coozter/modules/blog/add-article/page.jsx"),
      "edit-article/[id]": () => import("@/projects/coozter/modules/blog/edit-article/[id]/page.jsx"),
    },
    "contact-us": {
      "": () => import("@/projects/coozter/modules/contact-us/page.jsx"),
    },
  },

  growvibe: {
    navbar: {
      "": () => import("@/projects/growvibe/modules/navbar/page.jsx"),
    },
    home: {
      "": () => import("@/projects/growvibe/modules/home/page.jsx"),
    },
    services: {
      "": () => import("@/projects/growvibe/modules/services/page.jsx"),
    },
    "case-studies": {
      "": () => import("@/projects/growvibe/modules/case-studies/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/growvibe/modules/blog/page.jsx"),
    },
    pages: {
      "": () => import("@/projects/growvibe/modules/pages/page.jsx"),
    },
    leads: {
      "": () => import("@/projects/growvibe/modules/leads/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/growvibe/modules/footer/page.jsx"),
    },
  },

  myluckydeal: {
    dashboard: {
      "": () => import("@/projects/myluckydeal/modules/dashboard/page.jsx"),
    },
    deals: {
      "": () => import("@/projects/myluckydeal/modules/deals/page.jsx"),
    },
    categories: {
      "": () => import("@/projects/myluckydeal/modules/categories/page.jsx"),
    },
    stores: {
      "": () => import("@/projects/myluckydeal/modules/stores/page.jsx"),
    },
    coupons: {
      "": () => import("@/projects/myluckydeal/modules/coupons/page.jsx"),
    },
    blogs: {
      "": () => import("@/projects/myluckydeal/modules/blogs/page.jsx"),
    },
    faqs: {
      "": () => import("@/projects/myluckydeal/modules/faqs/page.jsx"),
    },
    hero: {
      "": () => import("@/projects/myluckydeal/modules/hero/page.jsx"),
    },
    ads: {
      "": () => import("@/projects/myluckydeal/modules/ads/page.jsx"),
    },
    offers: {
      "": () => import("@/projects/myluckydeal/modules/offers/page.jsx"),
    },
    collections: {
      "": () => import("@/projects/myluckydeal/modules/collections/page.jsx"),
    },
    settings: {
      "": () => import("@/projects/myluckydeal/modules/settings/page.jsx"),
    },
    migration: {
      "": () => import("@/projects/myluckydeal/modules/migration/page.jsx"),
    },
  },
  anternet: {
    banners: { "": () => import("@/projects/anternet/modules/banners/page.jsx") },
    tasks: { "": () => import("@/projects/anternet/modules/tasks/page.jsx") },
    quizcategories: { "": () => import("@/projects/anternet/modules/quizcategories/page.jsx") },
    questions: { "": () => import("@/projects/anternet/modules/questions/page.jsx") },
    spinprizes: { "": () => import("@/projects/anternet/modules/spinprizes/page.jsx") },
    videosections: { "": () => import("@/projects/anternet/modules/videosections/page.jsx") },
    earningtasks: { "": () => import("@/projects/anternet/modules/earningtasks/page.jsx") },
    settings: { "": () => import("@/projects/anternet/modules/settings/page.jsx") },
    migration: { "": () => import("@/projects/anternet/modules/migration/page.jsx") },
    ads: { "": () => import("@/projects/anternet/modules/ads/page.jsx") },
    notifications: { "": () => import("@/projects/anternet/modules/notifications/page.jsx") },
    pages: { "": () => import("@/projects/anternet/modules/pages/page.jsx") },
    users: { "": () => import("@/projects/anternet/modules/users/page.jsx") },
    arenas: { "": () => import("@/projects/anternet/modules/arenas/page.jsx") },
  },
};

const layoutLoaders = {
  altftool: {
    blogs: () => import("@/projects/altftool/modules/blogs/layout.jsx"),
  },
  leadtree: {
    blogs: () => import("@/projects/leadtree/modules/blogs/layout.jsx"),
    creditcard: () =>
      import("@/projects/leadtree/modules/creditcard/layout.jsx"),
    expertvideos: () =>
      import("@/projects/leadtree/modules/expertvideos/layout.jsx"),
    ourteams: () =>
      import("@/projects/leadtree/modules/ourteams/layout.jsx"),
  },
  carrerbook: {
    blog: () => import("@/projects/carrerbook/modules/blog/layout.jsx"),
  },
  coozter: {
    blog: () => import("@/projects/coozter/modules/blog/layout.jsx"),
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
