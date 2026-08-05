import { Briefcase, Code2, GraduationCap, Palette, Rocket, Sparkles } from "lucide-react";

/**
 * Featured Collections — persona-based tool bundles. Each entry references
 * catalog tools by [name, domain] so the source of truth stays TOOL_CATEGORIES
 * in ./tools.js; resolved via resolveCollectionTools() below.
 */
export const FEATURED_COLLECTIONS = [
  {
    id: "developers",
    title: "For Developers",
    icon: Code2,
    hue: ["#22c55e", "#14b8a6"],
    blurb: "Ship faster with an AI pair programmer and automation stack.",
    toolKeys: [
      ["GitHub Copilot", "github.com"],
      ["Cursor", "cursor.com"],
      ["Claude Code", "claude.com"],
      ["Windsurf", "windsurf.com"],
      ["n8n", "n8n.io"],
      ["Pipedream", "pipedream.com"],
    ],
  },
  {
    id: "marketers",
    title: "For Marketers",
    icon: Rocket,
    hue: ["#fb923c", "#f43f5e"],
    blurb: "Plan campaigns, write copy, and optimize for search — all with AI.",
    toolKeys: [
      ["HubSpot AI", "hubspot.com"],
      ["AdCreative.ai", "adcreative.ai"],
      ["Surfer SEO", "surferseo.com"],
      ["Predis.ai", "predis.ai"],
      ["Mailchimp AI", "mailchimp.com"],
      ["Ocoya", "ocoya.com"],
    ],
  },
  {
    id: "students",
    title: "For Students",
    icon: GraduationCap,
    hue: ["#6366f1", "#a855f7"],
    blurb: "Study smarter, write better, and land the job with free student tools.",
    toolKeys: [
      ["Khanmigo", "khanmigo.ai"],
      ["Duolingo Max", "duolingo.com"],
      ["Quizizz AI", "quizizz.com"],
      ["Kickresume", "kickresume.com"],
      ["ChatPDF", "chatpdf.com"],
      ["Photomath", "photomath.com"],
    ],
  },
  {
    id: "designers",
    title: "For Designers",
    icon: Palette,
    hue: ["#d946ef", "#f43f5e"],
    blurb: "From moodboard to mockup — AI copilots for every design step.",
    toolKeys: [
      ["Canva AI", "canva.com"],
      ["Figma AI", "figma.com"],
      ["Recraft", "recraft.ai"],
      ["Adobe Firefly", "firefly.adobe.com"],
      ["Uizard", "uizard.com"],
      ["Looka", "looka.com"],
    ],
  },
  {
    id: "creators",
    title: "For Content Creators",
    icon: Sparkles,
    hue: ["#f472b6", "#8b5cf6"],
    blurb: "Write, voice, animate, and score your content end to end.",
    toolKeys: [
      ["Suno", "suno.com"],
      ["ElevenLabs", "elevenlabs.io"],
      ["HeyGen", "heygen.com"],
      ["Runway", "runwayml.com"],
      ["Ideogram", "ideogram.ai"],
      ["Gamma", "gamma.app"],
    ],
  },
  {
    id: "startups",
    title: "For Startups & Founders",
    icon: Briefcase,
    hue: ["#0ea5e9", "#6366f1"],
    blurb: "Run lean — a whole ops team's worth of AI on free and starter plans.",
    toolKeys: [
      ["Notion AI", "notion.so"],
      ["Zapier AI", "zapier.com"],
      ["Make", "make.com"],
      ["Motion", "usemotion.com"],
      ["Superhuman", "superhuman.com"],
      ["Framer AI", "framer.com"],
    ],
  },
];
