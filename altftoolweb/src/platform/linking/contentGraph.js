// Site-wide internal-linking content graph.
//
// Aggregates every STATIC, server-enumerable content family into one flat
// list of linkable items so any page can render a relevant "keep exploring"
// band. Static-only by design: no Firestore/network reads, so the graph is
// deterministic and safe at build time. Firebase-backed families (landers,
// extensions, brandrating, buysmart stores, live news slugs) are deliberately
// absent as link TARGETS — their slugs are not reliably enumerable on the
// server and live news slugs are ephemeral (only the 10 seed articles in
// public/data/newsdata.json are durable).
//
// Server-side use only — several sources are heavyweight registries that must
// never reach a client bundle. Import from server components / route files.

import "server-only";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { CANONICAL_CATEGORIES } from "@/platform/registry/categoryTaxonomy";
import { getAllBlogs } from "@/app/blogs/data";
import {
  getTop9Items,
  getTop9Title,
  getTop9Description,
  getTop9Category,
} from "@/app/top9/data/getTop9Items";
import top11CategoryData from "@/app/top11/data/categoryData";
import { getDeals } from "@/app/deals/data/deals";
import { apps as appCatalog } from "@/app/apps/data/apps";
import { getAllWorkflows } from "@/app/n8n/data/service";
import { GAMES } from "@/app/altfgame/_data/games";
import { CALCULATORS } from "@/app/altfcalculators/toolsData";
import { TOOLS as PDF_TOOLS } from "@/app/altflovepdf/toolsData";
import { TOOLS as IMAGE_TOOLS, BASE as IMAGE_BASE } from "@/app/altfloveimg/data/tools";
import { INCUMBENTS, INCUMBENT_SLUGS } from "@/app/alternatives/data/incumbents";
import { getAllGeoLocations } from "@/platform/seo/geoLocations";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import { SIGNAL_CATALOG } from "@altftool/core/signals";
import newsSeed from "../../../public/data/newsdata.json";

export const SECTION_LABELS = {
  tools: "Free tool",
  toolCategories: "Tool category",
  blogs: "Guide",
  top9: "Top 9",
  top11: "Top 11",
  deals: "Deal",
  apps: "App",
  products: "Product",
  experiences: "Experience",
  signals: "Signal",
  calculators: "Calculator",
  pdfTools: "PDF tool",
  imageTools: "Image tool",
  locations: "Location",
  news: "News",
  games: "Game",
  n8n: "Automation",
  alternatives: "Comparison",
  hubs: "Explore",
};

const CLAMP_LENGTH = 150;

function clampText(value = "") {
  const text = String(value)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // markdown images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // markdown links -> label
    .replace(/<[^>]*>/g, " ") // html tags
    .replace(/[#*`>_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= CLAMP_LENGTH) return text;
  return `${text.slice(0, CLAMP_LENGTH - 1).replace(/\s+\S*$/, "")}…`;
}

function toTags(...values) {
  return values
    .flat(Infinity)
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function pushItem(items, seen, item) {
  if (!item?.href || !item?.title || seen.has(item.href)) return;
  seen.add(item.href);
  items.push({
    href: item.href,
    title: String(item.title),
    description: clampText(item.description || ""),
    section: item.section,
    tags: toTags(item.tags),
  });
}

// Some games exist under two routes (/altfgame/[slug] and a /tools/all twin).
// Map them so the scorer can treat a twin as "the same page" and never
// recommend a page's duplicate. Keys: altfgame slug -> tools slug.
const GAME_TOOL_TWINS = {
  hangman: "hangman",
  minesweeper: "minesweeper",
  2048: "2048-game",
  "aim-trainer-pro": "aim-trainer",
  "connect-four": "four-in-a-row",
  chess: "chess-multiplayer",
};

/** href -> twin href, both directions. */
export const DUPLICATE_HREFS = Object.entries(GAME_TOOL_TWINS).reduce(
  (map, [gameSlug, toolSlug]) => {
    map[`/altfgame/${gameSlug}`] = `/tools/all/${toolSlug}`;
    map[`/tools/all/${toolSlug}`] = `/altfgame/${gameSlug}`;
    return map;
  },
  {},
);

// Stable hub destinations — always available as guaranteed fallbacks.
const HUB_ITEMS = [
  { href: "/tools/all", title: "All free tools", description: "1,100+ browser utilities for files, images, text, data, and more.", tags: ["tools", "utilities"] },
  { href: "/blogs", title: "Guides & blog", description: "Practical tutorials, comparisons, and productivity explainers.", tags: ["guides", "blog"] },
  { href: "/altfcalculators", title: "Calculators", description: "Finance, health, math, and everyday calculators.", tags: ["calculators", "finance", "health"] },
  { href: "/tools/games", title: "Free games", description: "Browser games — no install, no sign-up.", tags: ["games", "fun"] },
  { href: "/labs", title: "Labs & experiences", description: "Interactive experiments, creative spaces, and focus tools.", tags: ["labs", "experiences", "creative"] },
  { href: "/deals", title: "Deals", description: "Curated savings on tools and services.", tags: ["deals", "shopping", "savings"] },
  { href: "/news", title: "News", description: "Current headlines and topic pages.", tags: ["news", "headlines"] },
  { href: "/academy", title: "Academy", description: "Compare learning platforms and build skills.", tags: ["academy", "learning", "education"] },
  { href: "/site-map", title: "Site map", description: "Every AltFTool destination in one organized directory.", tags: ["sitemap", "directory"] },
  { href: "/alternatives", title: "Tool alternatives", description: "Honest comparisons with the hosted PDF, image, converter and calculator services people already pay for.", tags: ["alternatives", "comparison", "pricing"] },
];

function buildGraph() {
  const items = [];
  const seen = new Set();

  // Hubs first: they are the guaranteed fallbacks, so they must win the
  // href dedupe (e.g. /tools/games also exists as a canonical category).
  HUB_ITEMS.forEach((hub) => {
    pushItem(items, seen, { ...hub, section: "hubs" });
  });

  Object.entries(toolMetaMap).forEach(([slug, tool]) => {
    const categories = Array.isArray(tool.category)
      ? tool.category
      : [tool.category];
    pushItem(items, seen, {
      href: `/tools/all/${slug}`,
      title: tool.name || slug.replace(/-/g, " "),
      description: tool.description,
      section: "tools",
      tags: [categories, tool.topics, slug.split("-")],
    });
  });

  CANONICAL_CATEGORIES.forEach((category) => {
    pushItem(items, seen, {
      href: `/tools/${category.slug}`,
      title: category.label,
      description: category.description,
      section: "toolCategories",
      tags: [category.label, category.slug.split("-")],
    });
  });

  getAllBlogs().forEach((blog) => {
    if (!blog?.slug) return;
    pushItem(items, seen, {
      href: `/blogs/${blog.slug}`,
      title: blog.heading || blog.title,
      description: blog.seoDescription || blog.excerpt,
      section: "blogs",
      tags: [blog.category, blog.tags, blog.topic, blog.tool],
    });
  });

  getTop9Items().forEach((item) => {
    if (!item?.slug) return;
    pushItem(items, seen, {
      href: `/top9/${item.slug}`,
      title: getTop9Title(item),
      description: getTop9Description(item),
      section: "top9",
      tags: [getTop9Category(item), item.slug.split("-")],
    });
  });

  Object.entries(top11CategoryData || {}).forEach(([slug, category]) => {
    pushItem(items, seen, {
      href: `/top11/${slug}`,
      title: category?.title || `Top 11 ${slug.replace(/-/g, " ")}`,
      description: category?.description,
      section: "top11",
      tags: [slug.split("-"), (category?.tools || []).slice(0, 5).map((tool) => tool?.name)],
    });
  });

  getDeals().forEach((deal) => {
    if (!deal?.slug) return;
    pushItem(items, seen, {
      href: `/deals/${deal.slug}`,
      title: deal.name,
      description: deal.tagline,
      section: "deals",
      tags: [deal.category, deal.alternativeTo, deal.bestFor],
    });
  });

  appCatalog.forEach((app) => {
    if (!app?.slug) return;
    pushItem(items, seen, {
      href: `/apps/${app.slug}`,
      title: app.name || app.title,
      description: app.description || app.tagline,
      section: "apps",
      tags: [app.category, app.tags, app.platforms],
    });
  });

  PRODUCT_SUITE_CATALOG.forEach((suite) => {
    pushItem(items, seen, {
      href: `/products/${suite.slug}`,
      title: suite.name,
      description: suite.description,
      section: "products",
      tags: [suite.capabilities, suite.eyebrow, suite.slug.split("-")],
    });
  });

  EXPERIENCE_CATALOG.forEach((experience) => {
    pushItem(items, seen, {
      href: experience.href,
      title: experience.name,
      description: experience.description || experience.tagline,
      section: "experiences",
      tags: [experience.tag, experience.group, experience.slug.split("-")],
    });
  });

  SIGNAL_CATALOG.forEach((signal) => {
    if (!signal?.slug) return;
    pushItem(items, seen, {
      href: `/signals/${signal.slug}`,
      title: signal.name || signal.title,
      description: signal.description,
      section: "signals",
      tags: [signal.category, signal.slug.split("-")],
    });
  });

  CALCULATORS.forEach((calculator) => {
    if (!calculator?.slug) return;
    pushItem(items, seen, {
      href: `/altfcalculators/${calculator.slug}`,
      title: calculator.name || calculator.title,
      description: calculator.description || calculator.desc || calculator.tagline,
      section: "calculators",
      tags: [calculator.category, calculator.sidebarCategory, calculator.slug.split("-")],
    });
  });

  PDF_TOOLS.forEach((tool) => {
    if (!tool?.slug) return;
    pushItem(items, seen, {
      href: `/altflovepdf/${tool.slug}`,
      title: tool.name || tool.title,
      description: tool.description || tool.desc || tool.tagline,
      section: "pdfTools",
      tags: ["pdf", tool.category, tool.slug.split("-")],
    });
  });

  IMAGE_TOOLS.forEach((tool) => {
    if (!tool?.slug) return;
    pushItem(items, seen, {
      href: `${IMAGE_BASE}/${tool.slug}`,
      title: tool.name,
      description: tool.description || tool.tagline,
      section: "imageTools",
      tags: ["image", "photo", tool.category, tool.slug.split("-")],
    });
  });

  INCUMBENT_SLUGS.forEach((slug) => {
    const entry = INCUMBENTS[slug];
    pushItem(items, seen, {
      href: `/alternatives/${slug}`,
      title: `${entry.shortName || entry.name} alternative`,
      description: entry.valueProp,
      section: "alternatives",
      // The mapped tool slugs are the strongest signal here: a page about
      // pdf-merger should be able to surface the iLovePDF comparison.
      tags: [entry.category, entry.name, "alternative", entry.tools],
    });
  });

  getAllGeoLocations().forEach((location) => {
    pushItem(items, seen, {
      href: `/locations/${location.slug}`,
      title: `AltFTool in ${location.name}`,
      description: `Free tools, guides, and deals for ${location.name}.`,
      section: "locations",
      tags: [location.name, location.type, location.containedIn, location.alternateName],
    });
  });

  (newsSeed?.news || []).forEach((article) => {
    if (!article?.slug) return;
    pushItem(items, seen, {
      href: `/news/${article.slug}`,
      title: article.headline,
      description: article.summary,
      section: "news",
      tags: [article.source, article.location],
    });
  });

  GAMES.forEach((game) => {
    if (!game?.slug) return;
    pushItem(items, seen, {
      href: `/altfgame/${game.slug}`,
      title: game.name || game.title,
      description: game.description || game.tagline,
      section: "games",
      tags: ["game", game.category, game.slug.split("-")],
    });
  });

  getAllWorkflows().forEach((workflow) => {
    if (!workflow?.slug) return;
    pushItem(items, seen, {
      href: `/n8n/${workflow.slug}`,
      title: workflow.title || workflow.name,
      description: workflow.description,
      section: "n8n",
      tags: [
        "automation",
        "workflow",
        (workflow.categories || []).map((category) => category?.name || category?.slug || category),
        (workflow.nodes || []).slice(0, 6).map((node) => node?.name || node?.slug || node),
      ],
    });
  });

  return items;
}

let cachedGraph = null;

/** Full flat list of linkable items. Built once per server process. */
export function getContentGraph() {
  if (!cachedGraph) cachedGraph = buildGraph();
  return cachedGraph;
}

/** Items belonging to one section of the graph. */
export function getSectionItems(section) {
  return getContentGraph().filter((item) => item.section === section);
}
