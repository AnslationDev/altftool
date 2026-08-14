
"use client";

function createSinglePageLoaders(loaders) {
  return Object.fromEntries(
    Object.entries(loaders).map(([moduleKey, loader]) => [
      moduleKey,
      { "": loader },
    ]),
  );
}

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
    landing: {
      "": () => import("@/projects/altftool/modules/landing/page.jsx"),
      "edit/[id]": () =>
        import("@/projects/altftool/modules/landing/edit/[id]/page.jsx"),
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
    products: {
      "": () => import("@/projects/altftool/modules/products/page.jsx"),
    },
    searchEng: {
      "": () => import("@/projects/altftool/modules/searchEng/page.jsx"),
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
    industries: {
      "": () => import("@/projects/alphobia/modules/industries/page.jsx"),
    },
    stats: {
      "": () => import("@/projects/alphobia/modules/stats/page.jsx"),
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
    navbar: {
      "": () => import("@/projects/coozter/modules/navbar/page.jsx"),
    },
    home: {
      "": () => import("@/projects/coozter/modules/home/page.jsx"),
      "hero-section": () => import("@/projects/coozter/modules/home/hero-section/page.jsx"),
      "marketing-channels": () => import("@/projects/coozter/modules/home/marketing-channels/page.jsx"),
      "process-section": () => import("@/projects/coozter/modules/home/process-section/page.jsx"),
      "services-preview": () => import("@/projects/coozter/modules/home/services-preview/page.jsx"),
      "trust-section": () => import("@/projects/coozter/modules/home/trust-section/page.jsx"),
      "blog-preview": () => import("@/projects/coozter/modules/home/blog-preview/page.jsx"),
      "contact-cta": () => import("@/projects/coozter/modules/home/contact-cta/page.jsx"),
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
  anslic: {
    navbar: {
      "": () => import("@/projects/anslic/modules/navbar/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/anslic/modules/footer/page.jsx"),
    },
    home: {
      "": () => import("@/projects/anslic/modules/home/page.jsx"),
      hero: () => import("@/projects/anslic/modules/home/hero/page.jsx"),
      "about-preview": () =>
        import("@/projects/anslic/modules/home/about-preview/page.jsx"),
      "services-preview": () =>
        import("@/projects/anslic/modules/home/services-preview/page.jsx"),
      testimonials: () =>
        import("@/projects/anslic/modules/home/testimonials/page.jsx"),
      "team-preview": () =>
        import("@/projects/anslic/modules/home/team-preview/page.jsx"),
      cta: () => import("@/projects/anslic/modules/home/cta/page.jsx"),
      "blog-preview": () =>
        import("@/projects/anslic/modules/home/blog-preview/page.jsx"),
    },
    about: {
      "": () => import("@/projects/anslic/modules/about/page.jsx"),
      hero: () => import("@/projects/anslic/modules/about/hero/page.jsx"),
      "mission-vision": () =>
        import("@/projects/anslic/modules/about/mission-vision/page.jsx"),
      values: () => import("@/projects/anslic/modules/about/values/page.jsx"),
      "team-preview": () =>
        import("@/projects/anslic/modules/about/team-preview/page.jsx"),
    },
    stats: {
      "": () => import("@/projects/anslic/modules/stats/page.jsx"),
    },
    services: {
      "": () => import("@/projects/anslic/modules/services/page.jsx"),
    },
    team: {
      "": () => import("@/projects/anslic/modules/team/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/anslic/modules/blog/page.jsx"),
      "add-article": () =>
        import("@/projects/anslic/modules/blog/add-article/page.jsx"),
      "edit-article/[id]": () =>
        import("@/projects/anslic/modules/blog/edit-article/[id]/page.jsx"),
    },
    contact: {
      "": () => import("@/projects/anslic/modules/contact/page.jsx"),
      leads: () => import("@/projects/anslic/modules/contact/leads/page.jsx"),
    },
  },
  infodrif: {
    navbar: {
      "": () => import("@/projects/infodrif/modules/navbar/page.jsx"),
    },
    home: {
      "": () => import("@/projects/infodrif/modules/home/page.jsx"),
      hero: () => import("@/projects/infodrif/modules/home/hero/page.jsx"),
      "trusted-by": () =>
        import("@/projects/infodrif/modules/home/trusted-by/page.jsx"),
      "work-strategy": () =>
        import("@/projects/infodrif/modules/home/work-strategy/page.jsx"),
      showcase: () => import("@/projects/infodrif/modules/home/showcase/page.jsx"),
    },
    about: {
      "": () => import("@/projects/infodrif/modules/about/page.jsx"),
      hero: () => import("@/projects/infodrif/modules/about/hero/page.jsx"),
      intro: () => import("@/projects/infodrif/modules/about/intro/page.jsx"),
      services: () => import("@/projects/infodrif/modules/about/services/page.jsx"),
      story: () => import("@/projects/infodrif/modules/about/story/page.jsx"),
      team: () => import("@/projects/infodrif/modules/about/team/page.jsx"),
    },
    partners: {
      "": () => import("@/projects/infodrif/modules/partners/page.jsx"),
      hero: () => import("@/projects/infodrif/modules/partners/hero/page.jsx"),
      "service-features": () =>
        import("@/projects/infodrif/modules/partners/service-features/page.jsx"),
      features: () =>
        import("@/projects/infodrif/modules/partners/features/page.jsx"),
      pricing: () => import("@/projects/infodrif/modules/partners/pricing/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/infodrif/modules/blog/page.jsx"),
      "add-article": () =>
        import("@/projects/infodrif/modules/blog/add-article/page.jsx"),
      "edit-article/[id]": () =>
        import("@/projects/infodrif/modules/blog/edit-article/[id]/page.jsx"),
      categories: () =>
        import("@/projects/infodrif/modules/blog/categories/page.jsx"),
    },
    offers: {
      "": () => import("@/projects/infodrif/modules/offers/page.jsx"),
      "add-offer": () =>
        import("@/projects/infodrif/modules/offers/add-offer/page.jsx"),
      "edit-offer/[id]": () =>
        import("@/projects/infodrif/modules/offers/edit-offer/[id]/page.jsx"),
    },
    contact: {
      "": () => import("@/projects/infodrif/modules/contact/page.jsx"),
      leads: () => import("@/projects/infodrif/modules/contact/leads/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/infodrif/modules/footer/page.jsx"),
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
    homepage: { "": () => import("@/projects/anternet/modules/homepage/page.jsx") },
    walletpage: { "": () => import("@/projects/anternet/modules/walletpage/page.jsx") },
    winners: { "": () => import("@/projects/anternet/modules/winners/page.jsx") },
    quickearn: { "": () => import("@/projects/anternet/modules/quickearn/page.jsx") },
    explorecards: { "": () => import("@/projects/anternet/modules/explorecards/page.jsx") },
    homecategories: { "": () => import("@/projects/anternet/modules/homecategories/page.jsx") },
    bonusladdertiers: { "": () => import("@/projects/anternet/modules/bonusladdertiers/page.jsx") },
    khokho: { "": () => import("@/projects/anternet/modules/khokho/page.jsx") },
  },
  campaignastra: {
    navbar: {
      "": () => import("@/projects/campaignastra/modules/navbar/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/campaignastra/modules/footer/page.jsx"),
    },
    home: {
      "": () => import("@/projects/campaignastra/modules/home/page.jsx"),
      hero: () => import("@/projects/campaignastra/modules/home/hero/page.jsx"),
      "about-preview": () =>
        import("@/projects/campaignastra/modules/home/about-preview/page.jsx"),
      "services-preview": () =>
        import("@/projects/campaignastra/modules/home/services-preview/page.jsx"),
      testimonials: () =>
        import("@/projects/campaignastra/modules/home/testimonials/page.jsx"),
      "team-preview": () =>
        import("@/projects/campaignastra/modules/home/team-preview/page.jsx"),
      cta: () => import("@/projects/campaignastra/modules/home/cta/page.jsx"),
      "blog-preview": () =>
        import("@/projects/campaignastra/modules/home/blog-preview/page.jsx"),
    },
    about: {
      "": () => import("@/projects/campaignastra/modules/about/page.jsx"),
      hero: () => import("@/projects/campaignastra/modules/about/hero/page.jsx"),
      "mission-vision": () =>
        import("@/projects/campaignastra/modules/about/mission-vision/page.jsx"),
      values: () => import("@/projects/campaignastra/modules/about/values/page.jsx"),
      "team-preview": () =>
        import("@/projects/campaignastra/modules/about/team-preview/page.jsx"),
    },
    stats: {
      "": () => import("@/projects/campaignastra/modules/stats/page.jsx"),
    },
    services: {
      "": () => import("@/projects/campaignastra/modules/services/page.jsx"),
    },
    team: {
      "": () => import("@/projects/campaignastra/modules/team/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/campaignastra/modules/blog/page.jsx"),
      "add-article": () =>
        import("@/projects/campaignastra/modules/blog/add-article/page.jsx"),
      "edit-article/[id]": () =>
        import("@/projects/campaignastra/modules/blog/edit-article/[id]/page.jsx"),
    },
    contact: {
      "": () => import("@/projects/campaignastra/modules/contact/page.jsx"),
      leads: () => import("@/projects/campaignastra/modules/contact/leads/page.jsx"),
    },
  },
  dailyhnt: createSinglePageLoaders({
    navbar: () => import("@/projects/dailyhnt/modules/navbar/page.jsx"),
    home: () => import("@/projects/dailyhnt/modules/home/page.jsx"),
    services: () => import("@/projects/dailyhnt/modules/services/page.jsx"),
    team: () => import("@/projects/dailyhnt/modules/team/page.jsx"),
    blog: () => import("@/projects/dailyhnt/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/dailyhnt/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/dailyhnt/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/dailyhnt/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/dailyhnt/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/dailyhnt/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/dailyhnt/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/dailyhnt/modules/footer/page.jsx"),
    "site-settings": () => import("@/projects/dailyhnt/modules/site-settings/page.jsx"),
  }),
  dealnbook: createSinglePageLoaders({
    "site-settings": () => import("@/projects/dealnbook/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/dealnbook/modules/navbar/page.jsx"),
    home: () => import("@/projects/dealnbook/modules/home/page.jsx"),
    services: () => import("@/projects/dealnbook/modules/services/page.jsx"),
    team: () => import("@/projects/dealnbook/modules/team/page.jsx"),
    blog: () => import("@/projects/dealnbook/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/dealnbook/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/dealnbook/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/dealnbook/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/dealnbook/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/dealnbook/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/dealnbook/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/dealnbook/modules/footer/page.jsx"),
  }),
  exclusinsider: createSinglePageLoaders({
    "site-settings": () => import("@/projects/exclusinsider/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/exclusinsider/modules/navbar/page.jsx"),
    home: () => import("@/projects/exclusinsider/modules/home/page.jsx"),
    services: () => import("@/projects/exclusinsider/modules/services/page.jsx"),
    team: () => import("@/projects/exclusinsider/modules/team/page.jsx"),
    blog: () => import("@/projects/exclusinsider/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/exclusinsider/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/exclusinsider/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/exclusinsider/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/exclusinsider/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/exclusinsider/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/exclusinsider/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/exclusinsider/modules/footer/page.jsx"),
  }),
  infovasta: createSinglePageLoaders({
    "site-settings": () => import("@/projects/infovasta/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/infovasta/modules/navbar/page.jsx"),
    home: () => import("@/projects/infovasta/modules/home/page.jsx"),
    services: () => import("@/projects/infovasta/modules/services/page.jsx"),
    "why-choose-us": () => import("@/projects/infovasta/modules/why-choose-us/page.jsx"),
    process: () => import("@/projects/infovasta/modules/process/page.jsx"),
    team: () => import("@/projects/infovasta/modules/team/page.jsx"),
    testimonials: () => import("@/projects/infovasta/modules/testimonials/page.jsx"),
    portfolio: () => import("@/projects/infovasta/modules/portfolio/page.jsx"),
    blog: () => import("@/projects/infovasta/modules/blog/page.jsx"),
    faq: () => import("@/projects/infovasta/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/infovasta/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/infovasta/modules/contact-us/page.jsx"),
    footer: () => import("@/projects/infovasta/modules/footer/page.jsx"),
  }),
  offerhoppr: createSinglePageLoaders({
    "site-settings": () => import("@/projects/offerhoppr/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/offerhoppr/modules/navbar/page.jsx"),
    home: () => import("@/projects/offerhoppr/modules/home/page.jsx"),
    services: () => import("@/projects/offerhoppr/modules/services/page.jsx"),
    team: () => import("@/projects/offerhoppr/modules/team/page.jsx"),
    blog: () => import("@/projects/offerhoppr/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/offerhoppr/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/offerhoppr/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/offerhoppr/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/offerhoppr/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/offerhoppr/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/offerhoppr/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/offerhoppr/modules/footer/page.jsx"),
    "misc-pages": () => import("@/projects/offerhoppr/modules/misc-pages/page.jsx"),
  }),
  offerris: createSinglePageLoaders({
    "site-settings": () => import("@/projects/offerris/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/offerris/modules/navbar/page.jsx"),
    home: () => import("@/projects/offerris/modules/home/page.jsx"),
    services: () => import("@/projects/offerris/modules/services/page.jsx"),
    team: () => import("@/projects/offerris/modules/team/page.jsx"),
    blog: () => import("@/projects/offerris/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/offerris/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/offerris/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/offerris/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/offerris/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/offerris/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/offerris/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/offerris/modules/footer/page.jsx"),
  }),
  samvatsara: createSinglePageLoaders({
    "site-settings": () => import("@/projects/samvatsara/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/samvatsara/modules/navbar/page.jsx"),
    home: () => import("@/projects/samvatsara/modules/home/page.jsx"),
    services: () => import("@/projects/samvatsara/modules/services/page.jsx"),
    team: () => import("@/projects/samvatsara/modules/team/page.jsx"),
    blog: () => import("@/projects/samvatsara/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/samvatsara/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/samvatsara/modules/faq/page.jsx"),
    portfolio: () => import("@/projects/samvatsara/modules/portfolio/page.jsx"),
    "about-us": () => import("@/projects/samvatsara/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/samvatsara/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/samvatsara/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/samvatsara/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/samvatsara/modules/footer/page.jsx"),
  }),
  shophobia: createSinglePageLoaders({
    "site-settings": () => import("@/projects/shophobia/modules/site-settings/page.jsx"),
    navbar: () => import("@/projects/shophobia/modules/navbar/page.jsx"),
    home: () => import("@/projects/shophobia/modules/home/page.jsx"),
    services: () => import("@/projects/shophobia/modules/services/page.jsx"),
    team: () => import("@/projects/shophobia/modules/team/page.jsx"),
    blog: () => import("@/projects/shophobia/modules/blog/page.jsx"),
    testimonials: () => import("@/projects/shophobia/modules/testimonials/page.jsx"),
    faq: () => import("@/projects/shophobia/modules/faq/page.jsx"),
    "about-us": () => import("@/projects/shophobia/modules/about-us/page.jsx"),
    "contact-us": () => import("@/projects/shophobia/modules/contact-us/page.jsx"),
    policy: () => import("@/projects/shophobia/modules/policy/page.jsx"),
    "term-condition": () => import("@/projects/shophobia/modules/term-condition/page.jsx"),
    footer: () => import("@/projects/shophobia/modules/footer/page.jsx"),
  }),
    thestylelife: {
    "site-settings": {
      "": () => import("@/projects/thestylelife/modules/site-settings/page.jsx"),
    },
    navbar: {
      "": () => import("@/projects/thestylelife/modules/navbar/page.jsx"),
    },
    home: {
      "": () => import("@/projects/thestylelife/modules/home/page.jsx"),
    },
    services: {
      "": () => import("@/projects/thestylelife/modules/services/page.jsx"),
    },
    team: {
      "": () => import("@/projects/thestylelife/modules/team/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/thestylelife/modules/blog/page.jsx"),
    },
    testimonials: {
      "": () => import("@/projects/thestylelife/modules/testimonials/page.jsx"),
    },
    faq: {
      "": () => import("@/projects/thestylelife/modules/faq/page.jsx"),
    },
    "about-us": {
      "": () => import("@/projects/thestylelife/modules/about-us/page.jsx"),
    },
    "contact-us": {
      "": () => import("@/projects/thestylelife/modules/contact-us/page.jsx"),
    },
    policy: {
      "": () => import("@/projects/thestylelife/modules/policy/page.jsx"),
    },
    "term-condition": {
      "": () => import("@/projects/thestylelife/modules/term-condition/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/thestylelife/modules/footer/page.jsx"),
    },
  },
  snapagee: {
    "site-settings": {
      "": () => import("@/projects/snapagee/modules/site-settings/page.jsx"),
    },
    navbar: {
      "": () => import("@/projects/snapagee/modules/navbar/page.jsx"),
    },
    home: {
      "": () => import("@/projects/snapagee/modules/home/page.jsx"),
    },
    services: {
      "": () => import("@/projects/snapagee/modules/services/page.jsx"),
    },
    team: {
      "": () => import("@/projects/snapagee/modules/team/page.jsx"),
    },
    blog: {
      "": () => import("@/projects/snapagee/modules/blog/page.jsx"),
    },
    testimonials: {
      "": () => import("@/projects/snapagee/modules/testimonials/page.jsx"),
    },
    faq: {
      "": () => import("@/projects/snapagee/modules/faq/page.jsx"),
    },
    "contact-us": {
      "": () => import("@/projects/snapagee/modules/contact-us/page.jsx"),
    },
    policy: {
      "": () => import("@/projects/snapagee/modules/policy/page.jsx"),
    },
    "term-condition": {
      "": () => import("@/projects/snapagee/modules/term-condition/page.jsx"),
    },
    footer: {
      "": () => import("@/projects/snapagee/modules/footer/page.jsx"),
    },
  },
};

// Shared, project-agnostic module page loaders. These modules exist for EVERY
// project (SHARED_PROJECT_MODULES) through one implementation, resolved
// regardless of the projectId in the URL. The SEO Engine pages physically live
// under the altftool namespace but are fully project-scoped at runtime via the
// ?project= param their service sends and the server RBAC gate.
const sharedModuleLoaders = {
  seo: {
    "": () => import("@/projects/altftool/modules/seo/page.jsx"),
    dashboard: () => import("@/projects/altftool/modules/seo/dashboard/page.jsx"),
    search: () => import("@/projects/altftool/modules/seo/search/page.jsx"),
    global: () => import("@/projects/altftool/modules/seo/global/page.jsx"),
    pages: () => import("@/projects/altftool/modules/seo/pages/page.jsx"),
    bulk: () => import("@/projects/altftool/modules/seo/bulk/page.jsx"),
    technical: () => import("@/projects/altftool/modules/seo/technical/page.jsx"),
    gsc: () => import("@/projects/altftool/modules/seo/gsc/page.jsx"),
    "search-console": () =>
      import("@/projects/altftool/modules/seo/search-console/page.jsx"),
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
  // Project-specific modules take precedence; shared modules (e.g. the SEO
  // Engine) resolve for any project that doesn't define its own implementation.
  const moduleRoutes =
    routeLoaders[projectId]?.[moduleKey] || sharedModuleLoaders[moduleKey];
  return moduleRoutes?.[routeKey] || null;
}

export function getAdminModuleLayoutLoader(projectId, moduleKey) {
  return layoutLoaders[projectId]?.[moduleKey] || null;
}
