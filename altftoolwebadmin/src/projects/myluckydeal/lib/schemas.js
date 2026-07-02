"use client";

/**
 * Schema-driven module definitions. Each collection describes its fields once;
 * the generic CollectionManager renders lists, forms and validation from this.
 *
 * Field types: text · textarea · number · boolean · select · tags · list ·
 *              keyvalue · image · objectlist · group
 * select options: array OR "dynamic:categories" / "dynamic:stores" (loaded live).
 */

export const ICONS = ["shield", "tag", "headset", "refresh", "truck", "lock", "sparkles", "store", "clock", "mail", "gift", "card", "discount", "fire", "star", "grid"];
export const CATEGORY_ICONS = ["electronics", "fashion", "home", "beauty", "gaming", "travel", "sports", "books"];
export const ACCENTS = ["indigo", "violet", "rose", "pink", "emerald", "sky", "amber", "teal"];
export const IMAGE_KEYS = ["shoe", "headphones", "perfume", "watch", "laptop", "keyboard", "camera", "chair", "console", "jeans", "cooker", "gift", "cloud", "card"];
export const PLACEMENTS = [
  "home-inline", "home-sidebar", "deals-banner", "stores-banner", "coupons-banner", "blog-banner",
  "category-banner", "store-banner", "deal-banner", "deal-sidebar", "coupon-banner", "coupon-sidebar",
  "blog-detail-banner", "blog-sidebar",
];

const slugField = { key: "slug", label: "Slug (URL id)", type: "text", required: true, isId: true, hint: "kebab-case, unique, immutable after create", pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/ };
const idField = { key: "id", label: "ID", type: "text", required: true, isId: true, pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/ };

export const COLLECTIONS = {
  deals: {
    label: "Deals", icon: "🏷️", collection: "deals",
    listColumns: ["title", "category", "storeName", "price", "discountLabel", "hot", "active"],
    fields: [
      slugField,
      { key: "title", label: "Title", type: "text", required: true, max: 80 },
      { key: "subtitle", label: "Subtitle", type: "text", max: 60, hint: "e.g. Men's Running Shoes" },
      { key: "description", label: "Short Description", type: "textarea", required: true, max: 200 },
      { key: "about", label: "About paragraphs", type: "list", hint: "1–4 paragraphs for 'About this Product'" },
      { key: "category", label: "Category", type: "select", options: "dynamic:categories", required: true },
      { key: "storeId", label: "Store", type: "select", options: "dynamic:stores", required: true },
      { key: "storeName", label: "Store Display Name", type: "text", required: true, hint: "Shown on cards (auto-fill from store)" },
      { key: "price", label: "Price", type: "text", required: true, hint: "₹2,399" },
      { key: "originalPrice", label: "Original Price", type: "text", hint: "₹5,999 (must be higher)" },
      { key: "discountLabel", label: "Discount Label", type: "text", required: true, hint: "60% OFF" },
      { key: "discountPercent", label: "Discount %", type: "number", required: true, min: 0, max: 100 },
      { key: "rating", label: "Rating", type: "number", required: true, min: 0, max: 5, step: 0.1 },
      { key: "reviews", label: "Reviews Count", type: "number", min: 0 },
      { key: "imageUrl", label: "Image", type: "image", folder: "deals", hint: "Transparent PNG 1000×1000" },
      { key: "url", label: "Merchant URL", type: "text", required: true, url: true },
      { key: "badges", label: "Badges", type: "tags", hint: "'Deal of the Day' selects the homepage widget" },
      { key: "hot", label: "Hot Right Now", type: "boolean" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "endsInHours", label: "Ends In (hours)", type: "number", min: 0 },
      { key: "highlights", label: "Key Highlights", type: "list", hint: "3–6 bullet points" },
      { key: "specs", label: "Specifications", type: "keyvalue" },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  categories: {
    label: "Categories", icon: "🗂️", collection: "categories",
    listColumns: ["name", "tagline", "icon", "accent"],
    guards: [{ collection: "deals", field: "category", message: "deals still reference this category" }],
    fields: [
      slugField,
      { key: "name", label: "Name", type: "text", required: true, max: 30 },
      { key: "tagline", label: "Tagline", type: "text", required: true, max: 50 },
      { key: "icon", label: "Icon", type: "select", options: CATEGORY_ICONS, required: true },
      { key: "accent", label: "Accent Colour", type: "select", options: ACCENTS, required: true },
      { key: "subcategories", label: "Subcategories", type: "tags" },
    ],
  },

  stores: {
    label: "Stores", icon: "🏬", collection: "stores",
    listColumns: ["name", "discount", "rating", "category", "featured"],
    guards: [
      { collection: "deals", field: "storeId", message: "deals still reference this store" },
      { collection: "coupons", field: "storeSlug", message: "coupons still reference this store" },
    ],
    fields: [
      slugField,
      { key: "name", label: "Name", type: "text", required: true },
      { key: "logoUrl", label: "Logo", type: "image", folder: "stores", hint: "Square PNG ≥256px. Overrides built-in brand marks" },
      { key: "discount", label: "Discount Headline", type: "text", required: true, hint: "Up to 60% OFF" },
      { key: "url", label: "Store URL", type: "text", required: true, url: true },
      { key: "rating", label: "Rating", type: "number", required: true, min: 0, max: 5, step: 0.1 },
      { key: "category", label: "Category Label", type: "text", required: true, hint: "Marketplace / Fashion / Beauty" },
      { key: "description", label: "Description", type: "textarea", required: true, max: 160 },
      { key: "featured", label: "Featured (Top Stores widget)", type: "boolean" },
    ],
  },

  coupons: {
    label: "Coupons", icon: "🎟️", collection: "coupons",
    listColumns: ["code", "store", "discountLabel", "expiry"],
    fields: [
      idField,
      { key: "code", label: "Coupon Code", type: "text", required: true, transform: "uppercase" },
      { key: "storeSlug", label: "Store", type: "select", options: "dynamic:stores", required: true },
      { key: "store", label: "Store Display Name", type: "text", required: true },
      { key: "title", label: "Benefit Title", type: "text", required: true },
      { key: "discountLabel", label: "Discount Label", type: "text", required: true },
      { key: "terms", label: "Terms", type: "textarea", required: true },
      { key: "expiry", label: "Expiry Text", type: "text", required: true, hint: "Expires in 3 days" },
      { key: "url", label: "Store URL", type: "text", required: true, url: true },
      { key: "usageCount", label: "Usage Count", type: "number", min: 0 },
      { key: "category", label: "Filter Category", type: "text" },
    ],
  },

  blogs: {
    label: "Blog Posts", icon: "📝", collection: "blogs",
    listColumns: ["title", "category", "author", "date", "featured"],
    fields: [
      slugField,
      { key: "title", label: "Title", type: "text", required: true, max: 90 },
      { key: "excerpt", label: "Excerpt", type: "textarea", required: true, max: 180 },
      { key: "category", label: "Editorial Category", type: "text", required: true, hint: "Tech Guide / Fitness / Beauty…" },
      { key: "author", label: "Author", type: "text", required: true },
      { key: "authorRole", label: "Author Role", type: "text" },
      { key: "date", label: "Date", type: "text", required: true, hint: "June 24, 2026" },
      { key: "readTime", label: "Read Time", type: "text", required: true, hint: "5 min read" },
      { key: "views", label: "Views", type: "text", hint: "1.2k — drives Popular Posts" },
      { key: "tags", label: "Tags", type: "tags", required: true },
      { key: "coverImage", label: "Cover Image", type: "image", folder: "blog", hint: "JPG 1600×900 (16:9)" },
      { key: "featured", label: "Featured (blog hero)", type: "boolean" },
      { key: "content", label: "Content Blocks", type: "list", required: true, rows: 3,
        hint: "One block per line-group: plain text = paragraph · '## ' prefix = heading · '- ' prefix = bullet" },
    ],
  },

  faqs: {
    label: "FAQs", icon: "❓", collection: "faqs",
    listColumns: ["question", "category", "order"],
    fields: [
      idField,
      { key: "question", label: "Question", type: "text", required: true, max: 160 },
      { key: "answer", label: "Answer", type: "textarea", required: true, max: 600 },
      { key: "category", label: "Group", type: "text", required: true, hint: "General / Coupons / Deals" },
      { key: "order", label: "Sort Order", type: "number", min: 0 },
    ],
  },

  hero: {
    label: "Hero Slides", icon: "🖼️", collection: "hero",
    listColumns: ["title", "highlight", "badge", "order"],
    fields: [
      idField,
      { key: "eyebrow", label: "Eyebrow", type: "text", required: true },
      { key: "title", label: "Title (line 1)", type: "text", required: true },
      { key: "highlight", label: "Highlight (line 2, gradient)", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "text", required: true },
      { key: "badge", label: "Savings Badge Text", type: "text", required: true, hint: "Up to 70% OFF" },
      { key: "discount", label: "Circle Badge Value", type: "text", required: true, hint: "70%" },
      { key: "ctaLabel", label: "Primary Button Label", type: "text", required: true },
      { key: "ctaUrl", label: "Primary Button URL", type: "text", required: true, url: true },
      { key: "secondaryLabel", label: "Secondary Button Label", type: "text" },
      { key: "secondaryUrl", label: "Secondary Button URL", type: "text", url: true },
      { key: "imageUrl", label: "Slide Image", type: "image", folder: "hero", hint: "Transparent PNG 1400×1400" },
      { key: "theme", label: "Glow Theme", type: "select", options: ["indigo", "violet", "sky"] },
      { key: "order", label: "Slide Order", type: "number", min: 0 },
    ],
  },

  ads: {
    label: "Ads", icon: "📣", collection: "ads",
    listColumns: ["placement", "title", "active", "priority"],
    fields: [
      idField,
      { key: "placement", label: "Placement", type: "select", options: PLACEMENTS, required: true, hint: "See ADS_PLACEMENTS.md for exact positions" },
      { key: "active", label: "Active", type: "boolean", default: true },
      { key: "priority", label: "Priority (lowest wins)", type: "number", min: 1, default: 1 },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "subtitle", label: "Subtitle", type: "text", required: true },
      { key: "cta", label: "Button Label", type: "text", required: true },
      { key: "url", label: "Target URL", type: "text", required: true, url: true },
      { key: "imageUrl", label: "Ad Image", type: "image", folder: "ads", hint: "Transparent PNG" },
      { key: "imageKey", label: "Fallback Art", type: "select", options: ["gift", "card", "cloud"] },
      { key: "gradient", label: "Banner Gradient", type: "select", options: ["brand", "sky", "emerald"] },
    ],
  },

  featuredOffers: {
    label: "Featured Offers", icon: "💳", collection: "featuredOffers",
    listColumns: ["title", "icon", "badge", "cta"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea", required: true, max: 90 },
      { key: "icon", label: "Icon", type: "select", options: ["card", "emi", "exchange", "ticket"], required: true },
      { key: "badge", label: "Badge", type: "text" },
      { key: "cta", label: "Button Label", type: "text", required: true },
      { key: "url", label: "URL", type: "text", required: true, url: true },
    ],
  },

  collections: {
    label: "Trending Collections", icon: "📦", collection: "collections",
    listColumns: ["title", "categoryName", "count"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true },
      { key: "categorySlug", label: "Category", type: "select", options: "dynamic:categories", required: true },
      { key: "categoryName", label: "Category Display Name", type: "text", required: true },
      { key: "imageUrl", label: "Image", type: "image", folder: "misc" },
      { key: "imageKey", label: "Fallback Art", type: "select", options: IMAGE_KEYS },
      { key: "count", label: "Deals Count", type: "number", required: true, min: 0 },
      { key: "href", label: "Link", type: "text", required: true, hint: "/search?q=earbuds" },
    ],
  },
};

/* ------------------------- Settings (single documents) ------------------------- */
export const SETTINGS = {
  site: {
    label: "Site Identity", icon: "🌐", docId: "site",
    fields: [
      { key: "name", label: "Site Name", type: "text", required: true },
      { key: "tagline", label: "Tagline", type: "textarea" },
      { key: "newsletterNote", label: "Newsletter Note", type: "textarea" },
    ],
  },
  trendingSearches: {
    label: "Trending Searches", icon: "🔎", docId: "trendingSearches",
    fields: [{ key: "terms", label: "Search Chips", type: "tags", hint: "6–10 terms" }],
  },
  seo: {
    label: "SEO Defaults", icon: "🚀", docId: "seo",
    fields: [
      { key: "defaultTitle", label: "Default Title", type: "text" },
      { key: "titleTemplate", label: "Title Template", type: "text", hint: "%s · My Lucky Deals" },
      { key: "defaultDescription", label: "Default Description", type: "textarea", max: 160 },
      { key: "ogImageUrl", label: "OG Image", type: "image", folder: "misc", hint: "1200×630" },
      { key: "twitterHandle", label: "Twitter Handle", type: "text" },
      { key: "canonicalBase", label: "Canonical Base URL", type: "text" },
      { key: "robots", label: "Robots", type: "select", options: ["index,follow", "noindex,nofollow"] },
      { key: "analyticsId", label: "Analytics ID", type: "text" },
    ],
  },
  ui: {
    label: "UI Content", icon: "🧩", docId: "ui",
    fields: [
      { key: "nav", label: "Header Navigation", type: "objectlist", item: [
        { key: "label", label: "Label", type: "text" }, { key: "href", label: "Link", type: "text" }] },
      { key: "heroTrust", label: "Hero Trust Strip (4)", type: "objectlist", item: [
        { key: "icon", label: "Icon", type: "select", options: ICONS }, { key: "title", label: "Title", type: "text" }, { key: "note", label: "Note", type: "text" }] },
      { key: "bottomTrust", label: "Bottom Trust Strip (4)", type: "objectlist", item: [
        { key: "icon", label: "Icon", type: "select", options: ICONS }, { key: "title", label: "Title", type: "text" }, { key: "note", label: "Note", type: "text" }] },
      { key: "dealBenefits", label: "Deal Page Benefits (4)", type: "objectlist", item: [
        { key: "icon", label: "Icon", type: "select", options: ICONS }, { key: "label", label: "Label", type: "text" }] },
      { key: "referEarn", label: "Refer & Earn Widget", type: "group", item: [
        { key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "text" },
        { key: "cta", label: "Button", type: "text" }, { key: "url", label: "URL", type: "text" }] },
      { key: "newsletter", label: "Newsletter Widget", type: "group", item: [
        { key: "title", label: "Title", type: "text" }, { key: "note", label: "Note", type: "text" },
        { key: "placeholder", label: "Placeholder", type: "text" }, { key: "cta", label: "Button", type: "text" }] },
      { key: "footer", label: "Footer", type: "group", item: [
        { key: "tagline", label: "Tagline", type: "text" },
        { key: "links", label: "Links", type: "objectlist", item: [
          { key: "label", label: "Label", type: "text" }, { key: "href", label: "Link", type: "text" }] },
        { key: "social", label: "Social Icons", type: "tags" },
        { key: "payments", label: "Payment Marks", type: "objectlist", item: [
          { key: "label", label: "Label", type: "text" }, { key: "color", label: "Colour", type: "text" }] },
      ] },
    ],
  },
  home: {
    label: "Homepage Layout", icon: "🏠", docId: "home",
    fields: [
      { key: "sections", label: "Section Order & Visibility", type: "objectlist", item: [
        { key: "id", label: "Section ID", type: "text" }, { key: "visible", label: "Visible", type: "boolean" }] },
      { key: "sidebarWidgets", label: "Right Rail Widgets", type: "tags",
        hint: "deal-of-day · top-stores · newsletter · trending-searches · sponsored-ad · refer-earn" },
    ],
  },
};

/* ------------------------------ Validation ------------------------------ */
export function validate(fields, values) {
  const errors = {};
  for (const f of fields) {
    const v = values[f.key];
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (f.required && empty) { errors[f.key] = "Required"; continue; }
    if (empty) continue;
    if (f.pattern && typeof v === "string" && !f.pattern.test(v)) errors[f.key] = "Invalid format (kebab-case only)";
    if (f.max && typeof v === "string" && v.length > f.max) errors[f.key] = `Max ${f.max} characters`;
    if (f.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) errors[f.key] = "Must be a number";
      else if (f.min !== undefined && n < f.min) errors[f.key] = `Min ${f.min}`;
      else if (f.max !== undefined && n > f.max) errors[f.key] = `Max ${f.max}`;
    }
    if (f.url && typeof v === "string" && !(v.startsWith("/") || v.startsWith("https://")))
      errors[f.key] = "Must start with / or https://";
  }
  return errors;
}
