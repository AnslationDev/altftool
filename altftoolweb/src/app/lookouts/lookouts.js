// Lookouts product registry — the single source of truth for the /lookouts hub.
//
// HARD RULE: every entry here must point at a route that exists in THIS tree.
// A card whose href 404s turns this hub into a page that manufactures soft
// 404s for every crawler that follows it, which is the exact bug /lookouts
// was shipped to fix. Before adding an entry, confirm the route renders and
// is registered in src/app/sitemap.js.
//
// Fields:
//   slug        stable React key
//   name        display name
//   tagline     one short line shown under the name
//   description 1-2 sentences describing what the destination does
//   href        route to open (must exist in this tree)
//   icon        key resolved to a lucide icon in page.jsx
//
// There is deliberately no per-card accent colour — see the note on
// .lookouts-product-ico in lookouts.css.

export const LOOKOUTS_PRODUCTS = [
  {
    slug: "ai-prompt-studio",
    name: "AI Prompt Studio",
    tagline: "Build and refine AI prompts",
    // Both sentences track /imgprompt's own navigation (Prompt Studio, Prompt
    // Generator, Prompt Optimizer, Image/Video/Cinema Prompt, and the AI
    // Models section) rather than describing a structure it does not have.
    description:
      "Image, video and cinema prompts grouped by AI model, plus a studio that generates and optimises prompts of your own.",
    href: "/imgprompt",
    icon: "sparkles",
  },
  {
    slug: "free-ai-tool",
    name: "Free AI Tools",
    tagline: "A directory of free AI tools",
    description:
      "A categorised directory of free AI tools for writing, images, video, audio and code, with a link straight out to each one.",
    href: "/free-ai-tool",
    icon: "bot",
  },
];
