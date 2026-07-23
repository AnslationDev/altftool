// Business Ops product registry.
//
// This is the single source of truth for the /bops dashboard. To add a
// new business property, create its folder under src/app/bops/<slug>/
// and append one entry here — the dashboard, counters and filters all derive
// from this array.
//
// Fields:
//   slug        folder name under src/app/bops/ (also the React key)
//   name        display name
//   tagline     one short line shown under the name
//   description 1–2 sentences describing what the property does
//   href        route to open; use null while status is "planned"
//   status      "live" | "beta" | "planned"
//   accent      icon tile colour: sky | amber | violet | emerald | rose
//   icon        key resolved to a lucide icon in components/BusinessOpsCatalog.jsx
//   tags        short capability labels rendered as pills
//   sections    optional sub-pages, shown as a count on the card

import { HN_CATEGORIES } from "./housingneeds/_data/categories";

export const BUSINESS_OPS_PRODUCTS = [
  {
    slug: "tripfindbox",
    name: "TripFindBox",
    tagline: "Flight search & travel deals",
    description:
      "A full travel booking front end — flight search, route landing pages, deal grids, blogs and lead capture.",
    href: "/bops/tripfindbox",
    status: "live",
    accent: "sky",
    icon: "plane",
    tags: ["Travel", "Booking", "Lead gen", "SEO routes"],
    sections: ["Flight search", "Route pages", "Blogs", "Booking", "Site map"],
  },
  {
    // The one-stop editorial hub: one guide page per home-service category.
    // category. Provider landers live in Housing Services.
    slug: "housingneeds",
    name: "Housing Needs",
    tagline: "Home guides, by category",
    description:
      "The one-stop home-improvement knowledge hub with practical project, cost and quote guides across every major home-service category.",
    href: "/bops/housingneeds",
    status: "live",
    accent: "amber",
    icon: "home",
    tags: ["Guides", `${HN_CATEGORIES.length} categories`],
    sections: HN_CATEGORIES.map((category) => category.name),
  },
  {
    // A collection (category > pages) — opens the Insurance landing at
    // src/app/bops/insurance/, currently holding Auto Insurance with more to
    // come. Pages are defined in src/app/bops/_data/collections.js.
    slug: "insurance",
    name: "Insurance",
    tagline: "Quotes & coverage",
    description:
      "Compare quotes and find better coverage across auto, home, life, health, Medicare, pet, business and more — from trusted, licensed providers.",
    href: "/bops/insurance",
    status: "live",
    accent: "emerald",
    icon: "shield",
    tags: ["Insurance", "12 types", "Quotes"],
    sections: [
      "Auto", "Home", "Life", "Health", "Medicare", "Final Expense",
      "Renters", "Pet", "Motorcycle", "Commercial", "Small Business", "Travel",
    ],
  },
  {
    // A collection (category > pages) — opens the Loans landing at
    // src/app/bops/loans/, holding 12 loan-type landing pages. Pages are
    // defined in src/app/bops/_data/collections.js; each renders a standalone
    // marketing page via _components/LoanPage.jsx.
    slug: "loans",
    name: "Loans",
    tagline: "Compare rates & offers",
    description:
      "Compare loans for home, auto, business and personal goals — 12 loan types with personalised offers and no impact to your credit to check.",
    href: "/bops/loans",
    status: "live",
    accent: "violet",
    icon: "loan",
    tags: ["Loans", "12 types", "Compare"],
    sections: [
      "Personal", "Debt Consolidation", "Home Mortgage", "Refinance",
      "HELOC", "Auto", "Business", "SBA", "Student", "Credit Builder",
    ],
  },
];

BUSINESS_OPS_PRODUCTS.push({
  // The provider-lander directory split out of Housing Needs — every
  // standalone home-service page, grouped by category.
  slug: "housing-services",
  name: "Housing Services",
  tagline: "Home service providers",
  description:
    "38 standalone home-service providers across 12 categories — roofing to moving day. Pick one and get a free quote.",
  href: "/bops/housing-services",
  status: "live",
  accent: "sky",
  icon: "wrench",
  tags: ["Home services", "12 categories", "38 pages"],
});

BUSINESS_OPS_PRODUCTS.push({
  // A collection (category > pages) — opens the Pet Services landing at
  // src/app/bops/pet-services/. Pages are provider-style landers defined in
  // src/app/bops/_data/collections.js.
  slug: "pet-services",
  name: "Pet Services",
  tagline: "Grooming, vets & more",
  description:
    "Grooming, mobile vet visits, walking, boarding and training — trusted local pet pros in one place.",
  href: "/bops/pet-services",
  status: "live",
  accent: "amber",
  icon: "paw",
  tags: ["Pets", "5 services"],
  sections: ["Grooming", "Vet visits", "Walking", "Boarding", "Training"],
});

BUSINESS_OPS_PRODUCTS.push(
  {
    slug: "legal-services",
    name: "Legal Services",
    tagline: "Free case reviews",
    description:
      "Injury claims, defense, family law, immigration and estate planning — connect with the right legal help.",
    href: "/bops/legal-services",
    status: "live",
    accent: "violet",
    icon: "gavel",
    tags: ["Legal", "6 practice areas"],
    sections: ["Injury", "Car accidents", "Defense", "Family", "Immigration", "Wills"],
  },
  {
    slug: "senior-care",
    name: "Senior Care",
    tagline: "Support for ageing well",
    description:
      "Assisted living, in-home care, medical alerts, stairlifts, walk-in tubs and memory care — dignified options in one place.",
    href: "/bops/senior-care",
    status: "live",
    accent: "rose",
    icon: "handheart",
    tags: ["Seniors", "6 services"],
    sections: ["Assisted living", "Home care", "Alerts", "Mobility", "Bathing", "Memory care"],
  },
);

export const STATUS_META = {
  live: { label: "Live", tone: "live" },
  beta: { label: "Beta", tone: "beta" },
  planned: { label: "In development", tone: "planned" },
};

export function getBusinessOpsStats(products = BUSINESS_OPS_PRODUCTS) {
  const live = products.filter((p) => p.status === "live").length;
  const beta = products.filter((p) => p.status === "beta").length;
  const planned = products.filter((p) => p.status === "planned").length;
  const sections = products.reduce(
    (total, p) => total + (p.sections?.length ?? 0),
    0,
  );

  return { total: products.length, live, beta, planned, sections };
}
