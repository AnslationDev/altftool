import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";

// Labs, navigation, the sitemap, and chrome behavior all consume this shared
// catalog so a shipped experiment cannot silently lose its discovery route.
export const FEATURED_EXPERIMENTS = EXPERIENCE_CATALOG.filter(
  (experience) => experience.featured,
);

export const GRID_EXPERIMENTS = EXPERIENCE_CATALOG.filter(
  (experience) => !experience.featured,
);

/**
 * Every experiment, featured first. The /labs grid renders THIS, not
 * GRID_EXPERIMENTS: a featured experiment is otherwise only reachable through
 * the hero carousel, which renders one link at a time, so the other featured
 * entries had no crawlable link anywhere on the page.
 */
export const ALL_EXPERIMENTS = [...FEATURED_EXPERIMENTS, ...GRID_EXPERIMENTS];

// NOTE: no tool counts in here. This module is imported by LabsClient, a client
// component, so it must never import the registry (that would ship the whole
// tool map to the browser) — and a hardcoded count silently rots. It previously
// read "885+" against a registry that has since grown well past that. Counts
// belong in server components that can read the registry directly.
export const LAB_GRADUATES = [
  {
    slug: "tools",
    name: "Tools Directory",
    description:
      "Our biggest graduate — free tools for images, PDFs, developers, text and more, each one its own page and open without an account.",
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
