/* ==================================
   Placement Configuration
================================== */

// All tool slugs — the single source of truth is the web app's auto-generated
// tool registry (altftoolweb/src/platform/registry/toolRuntimeMap.js). The old
// hand-maintained list had drifted badly (~95 of 315 tools), so newly-added
// tools never appeared as ad targets. Regenerate after adding/removing tools:
//   node scripts/generate-tool-slugs.mjs
import { TOOL_SLUGS } from "./toolSlugs.generated";

export { TOOL_SLUGS };

// Static category list reused across tool/game/extension placements
const TECH_CATEGORIES = [
  "AI", "Lifestyle", "Creators", "Developer", "Startup",
  "Web", "Fitness", "Cybersecurity Tool", "EdTech", "Business",
  "Job", "Marketing", "Content Creation", "No-Code", "Design",
  "Tools", "Other",
];

const ACADEMY_CATEGORIES = ["Govt & Competitive Exams",
  "Tech & Coding",
  "Skills & Career Growth",
  "Higher Education",
  "School & Foundation",
  "Course Creation",];

export const PLACEMENTS = {
  tools_listing: {
    label: "Tools Listing",
    description: "Injected inside tools grid every 6 tools in pairs.",
    layout: "tool_card",
    categories: { type: "static", values: TECH_CATEGORIES },
    minSpec: { width: 800, height: 440, ratio: 800 / 400 },
  },

  tool_detail_left: {
    label: "Tool Detail - Left",
    description: "Left sidebar banner.",
    layout: "sidebar",
    categories: { type: "static", values: TECH_CATEGORIES },
    target: { type: "static", values: TOOL_SLUGS },
    minSpec: { width: 320, height: 1200, ratio: 320 / 1200 },
  },

  tool_detail_right: {
    label: "Tool Detail - Right",
    description: "Right sidebar banner.",
    layout: "sidebar",
    categories: { type: "static", values: TECH_CATEGORIES },
    target: { type: "static", values: TOOL_SLUGS },
    minSpec: { width: 320, height: 1200, ratio: 320 / 1200 },
  },

  tool_detail_bottom: {
    label: "Tool Detail - Bottom",
    description: "Bottom banner.",
    layout: "banner",
    categories: { type: "static", values: TECH_CATEGORIES },
    target: { type: "static", values: TOOL_SLUGS },
    minSpec: { width: 1200, height: 400, ratio: 1200 / 400 },
  },

  games_listing: {
    label: "Games Listing",
    description: "Injected inside games grid randomly.",
    layout: "game_card",
    categories: { type: "static", values: TECH_CATEGORIES },
    minSpec: { width: 800, height: 600, ratio: 800 / 600 },
  },

  extensions_listing: {
    label: "Extensions Listing",
    description: "Injected inside extensions grid randomly.",
    layout: "extension_card",
    categories: { type: "static", values: TECH_CATEGORIES },
    minSpec: { width: 900, height: 600, ratio: 900 / 600 },
  },

  news_feed: {
    label: "News Feed",
    description: "Injected inside news feed randomly.",
    layout: "news_card",
    categories: { type: "static", values: TECH_CATEGORIES },
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },

  news_sideads: {
    label: "News Side Ads",
    description: "Shown on the side of news feed.",
    layout: "sidebar",
    minSpec: { width: 320, height: 1200, ratio: 320 / 1200 },
  },

  buysmart_left: {
    label: "Categories Left",
    description: "Injected inside BuySmart section.",
    layout: "sidebar",
    categories: { type: "static", values: TECH_CATEGORIES },
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },

  buysmart_right: {
    label: "Categories Right",
    description: "Injected inside BuySmart section.",
    layout: "sidebar",
    categories: { type: "static", values: TECH_CATEGORIES },
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },

  trending_section: {
    label: "Trending Section",
    description: "Injected inside trending section.",
    layout: "trend_card",
    categories: { type: "static", values: TECH_CATEGORIES },
    // No target: ad shows across all trending section pages
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },


  // ── Blog placements: categories + target fetched dynamically from Firestore ──
  // categories collection: docs with `name` field
  // target collection: blogs, maps `slug` field → shown as label, stored as value
  blog_list: {
    label: "Blog List",
    description: "Injected inside blog list section.",
    layout: "blog_card",
    // `extra` categories are always shown even if absent from the Firestore
    // `categories` collection (e.g. the editorial-only "Tools" category).
    categories: { type: "dynamic", collection: "categories", extra: ["Tools"] },
    target: { type: "dynamic", collection: "blogs", field: "slug", label: "slug" },
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },

  blog_detail: {
    label: "Blog Detail",
    description: "Injected inside blog detail page.",
    layout: "blog_detail",
    categories: { type: "dynamic", collection: "categories", extra: ["Tools"] },
    target: { type: "dynamic", collection: "blogs", field: "slug", label: "slug" },
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },

  academy: {
    label: "Academy",
    description: "Injected inside Academy section.",
    layout: "academy_card",
    categories: { type: "static", values: ACADEMY_CATEGORIES },
    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  },

  settingsupport: {
    label: "Setting Support",
    description: "Shown on the support page.",
    layout: "support_card",

    minSpec: { width: 1200, height: 800, ratio: 1200 / 800 },
  }
};

/* ==================================
   Sidebar Navigation Structure
================================== */

export const NAV = [
  { key: "overview", label: "Overview" },

  {
    key: "tools",
    label: "Tools Pages",
    children: [
      "tools_listing",
      "tool_detail_left",
      "tool_detail_right",
      "tool_detail_bottom",
    ],
  },

  {
    key: "games",
    label: "Games Pages",
    children: ["games_listing"],
  },

  {
    key: "extensions",
    label: "Extensions Pages",
    children: ["extensions_listing"],
  },

  {
    key: "news",
    label: "News Feed",
    children: ["news_feed", "news_sideads"],
  },

  {
    key: "buysmart",
    label: "BuySmart",
    children: ["buysmart_left", "buysmart_right"],
  },

  {
    key: "blogs",
    label: "Blog Pages",
    children: [
      "trending_section",
      "blog_list",
      "blog_detail",
    ],
  },

  {
    key: "academy",
    label: "Academy",
    children: ["academy"],
  },

  {
    key: "support",
    label: "Setting Support",
    children: ["settingsupport"],
  },
];