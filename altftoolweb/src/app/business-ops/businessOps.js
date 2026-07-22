// Business Ops product registry.
//
// This is the single source of truth for the /business-ops dashboard. To add a
// new business property, create its folder under src/app/business-ops/<slug>/
// and append one entry here — the dashboard, counters and filters all derive
// from this array.
//
// Fields:
//   slug        folder name under src/app/business-ops/ (also the React key)
//   name        display name
//   tagline     one short line shown under the name
//   description 1–2 sentences describing what the property does
//   href        route to open; use null while status is "planned"
//   status      "live" | "beta" | "planned"
//   accent      icon tile colour: sky | amber | violet | emerald | rose
//   icon        key resolved to a lucide icon in components/BusinessOpsCatalog.jsx
//   tags        short capability labels rendered as pills
//   sections    optional sub-pages, shown as a count on the card

export const BUSINESS_OPS_PRODUCTS = [
  {
    slug: "tripfindbox",
    name: "TripFindBox",
    tagline: "Flight search & travel deals",
    description:
      "A full travel booking front end — flight search, route landing pages, deal grids, blogs and lead capture.",
    href: "/business-ops/tripfindbox",
    status: "live",
    accent: "sky",
    icon: "plane",
    tags: ["Travel", "Booking", "Lead gen", "SEO routes"],
    sections: [
      "Flight search",
      "Route pages",
      "Blogs",
      "Booking",
      "Site map",
    ],
  },
  {
    slug: "housingneeds",
    name: "HousingNeeds",
    tagline: "Home improvement services",
    description:
      "Eight home-services verticals — roofing, siding, gutters, windows, solar, plumbing, interiors and pest control — each explaining the work, the options and the cost drivers.",
    href: "/housingneeds",
    status: "live",
    accent: "amber",
    icon: "home",
    tags: ["Home services", "8 verticals", "Quote CTA"],
    sections: [
      "Roofing",
      "Siding",
      "Gutters",
      "Windows",
      "Solar",
      "Plumbing",
      "Interiors",
      "Pest Control",
    ],
  },
  {
    slug: "loans",
    name: "Loans",
    tagline: "Borrowing guides and comparisons",
    description:
      "Compare personal, home, auto, student, and business borrowing options through focused decision pages.",
    href: "/business-ops/loans",
    status: "live",
    accent: "emerald",
    icon: "landmark",
    tags: ["Finance", "12 loan types", "Comparison guides"],
    sections: [
      "Personal loans",
      "Mortgages",
      "Auto loans",
      "Business loans",
      "Student refinancing",
    ],
  },
  {
    slug: "insurance",
    name: "Insurance",
    tagline: "Coverage guides and quote paths",
    description:
      "Explore auto, home, health, life, travel, pet, and business insurance through clear coverage guides.",
    href: "/business-ops/insurance",
    status: "live",
    accent: "violet",
    icon: "shield",
    tags: ["Insurance", "12 coverage types", "Quote guidance"],
    sections: [
      "Auto insurance",
      "Home insurance",
      "Health and life",
      "Travel and pet",
      "Business coverage",
    ],
  },
];

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
