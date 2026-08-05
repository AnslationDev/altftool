import {
  Palette,
  ImageIcon,
  Wand2,
  Hexagon,
  Eraser,
  CircleUserRound,
  Zap,
  Layers,
  PenTool,
  Grid3x3,
  Sparkles,
  Type,
  Pen,
  BookOpen,
} from "lucide-react";
import { toolId } from "../lib/toolId";

// Deterministic, name-derived rating (4.2-4.9) — seeded/editorial, not a live
// user-vote average. Stable across reloads since it's a pure hash of the
// name rather than Math.random(). Flagged clearly wherever it's displayed.
function seedRating(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return Math.round((4.2 + (hash % 8) / 10) * 10) / 10;
}

// Estimated worldwide weekly visits — editorial figures based on general
// public knowledge of each tool's relative popularity, NOT live third-party
// analytics (no API gives that for a site you don't own; see AuthDialog/
// ToolStatsProvider for the analytics we can actually track ourselves).
// Well-known tools get a hand-picked ballpark; everything else falls back to
// a smaller deterministic estimate so the long tail still looks plausible
// rather than uniform.
const KNOWN_WEEKLY_VISITS = {
  Canva: 42_000_000,
  Figma: 18_000_000,
  Midjourney: 12_000_000,
  "Adobe Creative Cloud": 9_500_000,
  "Google Fonts": 8_200_000,
  Miro: 7_400_000,
  "Adobe Express": 6_500_000,
  Webflow: 5_800_000,
  "Adobe Firefly": 5_000_000,
  Framer: 3_400_000,
  "Adobe XD": 3_100_000,
  ChatGPT: 20_000_000,
  Claude: 1_500_000,
  Sketch: 1_600_000,
  "Adobe Fonts": 2_100_000,
  Notion: 4_000_000,
};

function seedWeeklyVisits(name) {
  if (KNOWN_WEEKLY_VISITS[name]) return KNOWN_WEEKLY_VISITS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return 40_000 + (hash % 960_000); // 40K - 1M for the long tail
}

/** "42000000" -> "42M", "900000" -> "900K". Used wherever weeklyVisits renders. */
export function formatVisits(n) {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    return `${millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10}M`;
  }
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

const tool = (name, domain, tagline, pricing = "FREE + PAID", category = "Design Tools", url) => ({
  name,
  domain,
  tagline,
  pricing,
  category,
  weeklyVisits: seedWeeklyVisits(name),
  rating: seedRating(name),
  url: url || `https://${domain}`,
});

// Design-focused tools organized by type
export const DESIGN_CATEGORIES = [
  {
    id: "design-tools",
    label: "Design Tools",
    description: "The core software for building interfaces from scratch.",
    icon: Palette,
    tools: [
      tool("Figma", "figma.com", "Collaborative interface design with real-time teamwork.", "FREE + PAID", "Design Tools"),
      tool("Adobe XD", "adobe.com", "Fast prototyping and design workflow for UX professionals.", "FREE + PAID", "Design Tools", "https://www.adobe.com/products/xd/"),
      tool("Sketch", "sketch.com", "Professional design tool for digital products.", "PAID", "Design Tools"),
      tool("Webflow", "webflow.com", "Visual web builder with design and development.", "FREE + PAID", "Design Tools"),
      tool("Framer", "framer.com", "Interactive design and prototyping for modern web.", "FREE + PAID", "Design Tools"),
    ],
  },
  {
    id: "image-design",
    label: "Image Design",
    description: "Turn any idea into a polished visual in minutes.",
    icon: ImageIcon,
    tools: [
      tool("Canva", "canva.com", "Create gorgeous designs in minutes, no experience needed.", "FREE + PAID", "Image Design"),
      tool("Adobe Express", "adobe.com", "Free generative design with built-in templates.", "FREE + PAID", "Image Design", "https://www.adobe.com/express/"),
      tool("Piktochart", "piktochart.com", "Transform data into stunning infographics instantly.", "FREE + PAID", "Image Design"),
      tool("Crello", "crello.com", "Professional design tool for social media and marketing.", "FREE + PAID", "Image Design"),
      tool("Snappa", "snappa.com", "Create professional social media graphics in seconds.", "FREE + PAID", "Image Design"),
    ],
  },
  {
    id: "ai-design",
    label: "AI Design",
    description: "Generate original art, mockups, and assets with AI.",
    icon: Sparkles,
    tools: [
      tool("Midjourney", "midjourney.com", "AI image generation from text prompts.", "PAID", "AI Design"),
      tool("Adobe Firefly", "adobe.com", "Generative AI for design directly in Creative Cloud.", "FREE + PAID", "AI Design", "https://www.adobe.com/products/firefly.html"),
      tool("Recraft", "recraft.ai", "Generate high-quality vector art and illustrations.", "FREE + PAID", "AI Design"),
      tool("Krea", "krea.ai", "AI-powered image generation for design professionals.", "FREE + PAID", "AI Design"),
      tool("leonardo.ai", "leonardo.ai", "Stylized image generation for games and design.", "FREE + PAID", "AI Design"),
    ],
  },
  {
    id: "ui-design",
    label: "UI/UX Tools",
    description: "Wireframe, prototype, and test user flows before you build.",
    icon: Grid3x3,
    tools: [
      tool("Penpot", "penpot.app", "Open-source design platform for UI and UX.", "FREE + PAID", "UI/UX Tools"),
      tool("Balsamiq", "balsamiq.com", "Low-fidelity wireframing and prototyping tool.", "FREE + PAID", "UI/UX Tools"),
      tool("Wireframe.cc", "wireframe.cc", "Simple online wireframing tool.", "FREE + PAID", "UI/UX Tools"),
      tool("Miro", "miro.com", "Infinite board for visual collaboration and design.", "FREE + PAID", "UI/UX Tools"),
      tool("Excalidraw", "excalidraw.com", "Free whiteboard tool for diagramming and sketching.", "FREE", "UI/UX Tools"),
    ],
  },
  {
    id: "logo-design",
    label: "Logo Design",
    description: "Craft a brand mark that scales from favicon to billboard.",
    icon: Hexagon,
    tools: [
      tool("Looka", "looka.com", "AI logo maker with full brand kits.", "FREE + PAID", "Logo Design"),
      tool("LogoAI", "logoai.com", "Smart logo design engine.", "FREE + PAID", "Logo Design"),
      tool("Hatchful", "hatchful.shopify.com", "Free logo maker by Shopify.", "FREE", "Logo Design"),
      tool("Brandmark", "brandmark.io", "Deep learning logo design.", "FREE + PAID", "Logo Design"),
      tool("Designs.ai", "designs.ai", "Logo and brand kit generation.", "FREE + PAID", "Logo Design"),
    ],
  },
  {
    id: "photo-editing",
    label: "Photo Editing",
    description: "Clean up, retouch, and repurpose images fast.",
    icon: Eraser,
    tools: [
      tool("Remove.bg", "remove.bg", "One-click background removal.", "FREE + PAID", "Photo Editing"),
      tool("Clipdrop", "clipdrop.co", "AI tools for image editing and enhancement.", "FREE + PAID", "Photo Editing"),
      tool("PhotoRoom", "photoroom.com", "Product photo studio with cutouts and backgrounds.", "FREE + PAID", "Photo Editing"),
      tool("Pixlr", "pixlr.com", "Online photo editor with AI tools.", "FREE + PAID", "Photo Editing"),
      tool("Fotor", "fotor.com", "All-in-one photo editing and design suite.", "FREE + PAID", "Photo Editing"),
    ],
  },
  {
    id: "animation",
    label: "Animation",
    description: "Bring static designs to life with motion.",
    icon: Zap,
    tools: [
      tool("Lottie", "lottie.com", "Lightweight animated vector graphics.", "FREE", "Animation"),
      tool("Rive", "rive.app", "Real-time interactive design and animation.", "FREE + PAID", "Animation"),
      tool("Motionity", "motionity.app", "Timeline animation maker for web.", "FREE + PAID", "Animation"),
      tool("Spline", "spline.design", "3D design and animation in the browser.", "FREE + PAID", "Animation"),
      tool("Theater.js", "theatrejs.com", "Motion graphics library for web.", "FREE", "Animation"),
    ],
  },
  {
    id: "typography",
    label: "Typography",
    description: "Fonts and pairings for every kind of project.",
    icon: Type,
    tools: [
      tool("Google Fonts", "fonts.google.com", "Free open-source fonts.", "FREE", "Typography"),
      tool("Font Pair", "fontpair.co", "Beautiful font combinations for web.", "FREE", "Typography"),
      tool("Typo Graphic", "typographic.app", "Font design and exploration tool.", "FREE + PAID", "Typography"),
      tool("Adobe Fonts", "adobe.com", "Unlimited fonts with Creative Cloud.", "FREE + PAID", "Typography", "https://fonts.adobe.com"),
      tool("MyFonts", "myfonts.com", "Browse and purchase fonts.", "PAID", "Typography"),
    ],
  },
  {
    id: "color-tools",
    label: "Color Tools",
    description: "Palettes, gradients, and contrast checks made simple.",
    icon: Palette,
    tools: [
      tool("Coolors", "coolors.co", "Fast color palette generator.", "FREE + PAID", "Color Tools"),
      tool("Adobe Color", "color.adobe.com", "Create and explore color schemes.", "FREE", "Color Tools"),
      tool("Color Hunt", "colorhunt.co", "Curated color palettes.", "FREE", "Color Tools"),
      tool("Chroma", "chroma.spencerxiao.com", "Color space visualization.", "FREE", "Color Tools"),
      tool("Pigment", "pigment.shapefactory.co", "Color picker and palette builder.", "FREE", "Color Tools"),
    ],
  },
];

// Featured tools (handpicked for homepage carousel)
export const FEATURED_DESIGN_TOOLS = [
  tool("Figma", "figma.com", "Collaborative interface design with real-time teamwork.", "FREE + PAID", "Featured"),
  tool("Canva", "canva.com", "Create gorgeous designs in minutes.", "FREE + PAID", "Featured"),
  tool("Adobe XD", "adobe.com", "Professional UX design tool.", "FREE + PAID", "Featured", "https://www.adobe.com/products/xd/"),
  tool("Webflow", "webflow.com", "Visual web builder and design tool.", "FREE + PAID", "Featured"),
];

// Latest design resources (newest additions)
export const LATEST_DESIGN_RESOURCES = [
  tool("Penpot", "penpot.app", "Open-source design platform for UI and UX.", "FREE + PAID", "Latest"),
  tool("Spline", "spline.design", "3D design and animation in the browser.", "FREE + PAID", "Latest"),
  tool("Rive", "rive.app", "Real-time interactive design and animation.", "FREE + PAID", "Latest"),
  tool("Adobe Firefly", "adobe.com", "Generative AI for design.", "FREE + PAID", "Latest", "https://www.adobe.com/products/firefly.html"),
  tool("Remove.bg", "remove.bg", "AI-powered background removal.", "FREE + PAID", "Latest"),
  tool("Recraft", "recraft.ai", "Generate vector art with AI.", "FREE + PAID", "Latest"),
  tool("Coolors", "coolors.co", "Fast color palette generator.", "FREE + PAID", "Latest"),
  tool("Lottie", "lottie.com", "Lightweight animated vector graphics.", "FREE", "Latest"),
];

// Essential design platforms
export const ESSENTIAL_DESIGN_TOOLS = [
  tool("Figma", "figma.com", "Industry-standard collaborative design tool.", "FREE + PAID", "Essential"),
  tool("Adobe XD", "adobe.com", "Professional UX design and prototyping.", "FREE + PAID", "Essential", "https://www.adobe.com/products/xd/"),
  tool("Sketch", "sketch.com", "macOS design tool for product design.", "PAID", "Essential"),
  tool("Webflow", "webflow.com", "No-code web design and development.", "FREE + PAID", "Essential"),
  tool("Canva", "canva.com", "Design tool for creators and marketers.", "FREE + PAID", "Essential"),
  tool("Adobe Creative Cloud", "adobe.com", "Complete creative suite.", "PAID", "Design Tools", "https://www.adobe.com/creativecloud/plans.html"),
];

// Partner design picks (hand-picked, horizontal card layout)
export const PARTNER_DESIGN_PICKS = [
  tool("Midjourney", "midjourney.com", "AI image generation from text prompts.", "PAID", "Partner"),
  tool("Recraft", "recraft.ai", "Generate high-quality vector art and illustrations.", "FREE + PAID", "Partner"),
  tool("Krea", "krea.ai", "AI-powered image generation for design professionals.", "FREE + PAID", "Partner"),
  tool("Looka", "looka.com", "AI logo maker with full brand kits.", "FREE + PAID", "Partner"),
  tool("Remove.bg", "remove.bg", "One-click background removal for product photos.", "FREE + PAID", "Partner"),
  tool("Spline", "spline.design", "3D design and animation in the browser.", "FREE + PAID", "Partner"),
  tool("Coolors", "coolors.co", "Fast color palette generator for any project.", "FREE + PAID", "Partner"),
  tool("Miro", "miro.com", "Infinite board for visual collaboration and design.", "FREE + PAID", "Partner"),
  tool("Framer", "framer.com", "Interactive design and prototyping for modern web.", "FREE + PAID", "Partner"),
];

// Designer toolkits (category pages)
export const DESIGNER_TOOLKITS = [
  { name: "UI Designers", icon: Grid3x3, href: "#ui-design" },
  { name: "UX Designers", icon: Palette, href: "#ui-design" },
  { name: "Brand Designers", icon: Hexagon, href: "#logo-design" },
  { name: "Product Designers", icon: Zap, href: "#design-tools" },
  { name: "Motion Designers", icon: Zap, href: "#animation" },
  { name: "Web Designers", icon: Grid3x3, href: "#design-tools" },
  { name: "Graphic Designers", icon: Palette, href: "#image-design" },
  { name: "Illustrators", icon: PenTool, href: "#ai-design" },
];

// Canonical toolId -> tool lookup, covering every tool that appears
// anywhere on the page. Used to resolve a user's saved-tool ids (which are
// just strings) back into full tool objects, and to power category
// filtering in Community Favorites. DESIGN_CATEGORIES is spread LAST so its
// real category labels ("Design Tools", "Image Design", ...) win over the
// generic "Featured"/"Latest"/"Essential"/"Partner" labels the other lists
// use for tools that appear in both places (e.g. Figma is in both).
export const ALL_TOOLS_BY_ID = new Map(
  [
    ...FEATURED_DESIGN_TOOLS,
    ...LATEST_DESIGN_RESOURCES,
    ...ESSENTIAL_DESIGN_TOOLS,
    ...PARTNER_DESIGN_PICKS,
    ...DESIGN_CATEGORIES.flatMap((category) => category.tools),
  ].map((t) => [toolId(t), t]),
);
