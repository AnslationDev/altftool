import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";

// Labs, navigation, the sitemap, and chrome behavior all consume this shared
// catalog so a shipped experiment cannot silently lose its discovery route.
export const FEATURED_EXPERIMENTS = EXPERIENCE_CATALOG.filter(
  (experience) => experience.featured,
);

export const GRID_EXPERIMENTS = EXPERIENCE_CATALOG.filter(
  (experience) => !experience.featured,
);

export const LAB_GRADUATES = [
  {
    slug: "tools",
    name: "Tools Directory",
    description:
      "Our biggest graduate — 885+ free tools for images, PDFs, developers, text and more, all running right in your browser.",
    href: "/tools/all",
    label: "Now a core product",
    tone: "teal",
    icon: "Wrench",
  },
  {
    slug: "blogs",
    name: "AltFTool Blogs",
    description:
      "Long-form guides, comparisons and how-tos across the whole toolkit — grown into a full publishing platform.",
    href: "/blogs",
    label: "Now a core product",
    tone: "cyan",
    icon: "BookOpen",
  },
  {
    slug: "news",
    name: "AltFTool News",
    description:
      "A live feed of headlines, local stories and trending topics, curated around what our readers use.",
    href: "/news",
    label: "Now a core product",
    tone: "violet",
    icon: "Newspaper",
  },
  {
    slug: "top11",
    name: "Top 11 Guides",
    description:
      "Ranked, research-backed 'best of' guides that help you pick the right product or service faster.",
    href: "/top11",
    label: "Now a core product",
    tone: "teal",
    icon: "Trophy",
  },
];
