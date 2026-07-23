// Housing Needs — category registry.
//
// Housing Needs is the one-stop editorial hub: the eight original guide pages
// (the former /housingneeds/* verticals), one per category, rendered by the
// shared HnVerticalPage component at /bops/housingneeds/<slug>.
//
// The provider-style landers were split out to Housing Services
// (src/app/bops/housing-services/) — see its _data/services.js registry.
//
// `icon`   — key resolved to a lucide component in _components/HnCard.jsx
// `accent` — icon-tile colour: sky | amber | violet | emerald | rose (bops.css)

export const HN_CATEGORIES = [
  {
    slug: "roofing",
    name: "Roofing",
    icon: "home",
    accent: "rose",
    description: "Roof replacement, repair, storm damage and inspections.",
    pages: [
      {
        slug: "roofing",
        name: "Roofing Guide",
        tagline: "Materials, costs & options",
        description:
          "In-depth roofing guide — asphalt vs metal, tear-off vs overlay, ventilation, storm damage and cost drivers.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "siding",
    name: "Siding",
    icon: "layers",
    accent: "sky",
    description: "Siding installation, materials comparison and storm repair.",
    pages: [
      {
        slug: "siding",
        name: "Siding Guide",
        tagline: "Materials, costs & options",
        description:
          "How siding systems work — vinyl vs fiber cement vs engineered wood, house wrap, trim and what drives cost.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "gutters",
    name: "Gutters",
    icon: "waves",
    accent: "sky",
    description: "Seamless gutters, guards, downspouts and drainage.",
    pages: [
      {
        slug: "gutters",
        name: "Gutters Guide",
        tagline: "Seamless gutters & drainage",
        description:
          "Seamless gutters, guards and downspouts — sizing, pitch, fascia and the drainage details that matter.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "windows",
    name: "Windows",
    icon: "window",
    accent: "violet",
    description: "Window replacement, glazing upgrades and facades.",
    pages: [
      {
        slug: "windows",
        name: "Windows Guide",
        tagline: "Materials, costs & options",
        description:
          "Full-frame vs insert replacement, glazing and energy upgrades, seal-failure repair and cost factors.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "solar",
    name: "Solar",
    icon: "sun",
    accent: "amber",
    description: "Rooftop solar, battery storage and installation.",
    pages: [
      {
        slug: "solar",
        name: "Solar Guide",
        tagline: "Panels, storage & payback",
        description:
          "Grid-tied PV, inverters, battery backup, permitting and interconnection — and what drives the payback.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    icon: "droplet",
    accent: "sky",
    description: "Leak repair, drains, water heaters and repiping.",
    pages: [
      {
        slug: "plumbing",
        name: "Plumbing Guide",
        tagline: "Repairs, costs & options",
        description:
          "Leak detection, drain cleaning, water heaters, repiping and fixtures — how each job works and what it costs.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "interiors",
    name: "Interiors",
    icon: "paintbrush",
    accent: "violet",
    description: "Drywall, painting, flooring, trim and interior remodels.",
    pages: [
      {
        slug: "interiors",
        name: "Interiors Guide",
        tagline: "Drywall, paint, flooring & trim",
        description:
          "Interior finish work — drywall and texture, painting, flooring, trim, kitchen and bath refresh, and cost drivers.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    icon: "bug",
    accent: "emerald",
    description: "Pest management, extermination and prevention.",
    pages: [
      {
        slug: "pestcontrol",
        name: "Pest Control Guide",
        tagline: "Treatment, prevention & costs",
        description:
          "General pest, termite, rodent and bed-bug control — how treatment and prevention work, and what drives cost.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
];

HN_CATEGORIES.push(
  {
    slug: "landscaping",
    name: "Landscaping",
    icon: "sprout",
    accent: "emerald",
    description: "Lawn care, garden design, hardscaping and irrigation.",
    pages: [
      {
        slug: "landscaping",
        name: "Landscaping Guide",
        tagline: "Lawns, hardscape & irrigation",
        description:
          "Lawn care, garden design, patios and irrigation — what each project involves and what drives the price.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    icon: "sparkles",
    accent: "sky",
    description: "House cleaning, deep cleans and move-out services.",
    pages: [
      {
        slug: "cleaning",
        name: "Cleaning Guide",
        tagline: "Recurring, deep & move-out",
        description:
          "Recurring house cleaning, deep cleans and move-out services — service levels, pricing and what to expect.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "electrical",
    name: "Electrical",
    icon: "zap",
    accent: "amber",
    description: "Panel upgrades, wiring, EV chargers and lighting.",
    pages: [
      {
        slug: "electrical",
        name: "Electrical Guide",
        tagline: "Panels, wiring & EV chargers",
        description:
          "Panel upgrades, rewiring, EV chargers and lighting — safety, permits and the cost drivers explained.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "flooring",
    name: "Flooring",
    icon: "grid",
    accent: "rose",
    description: "Hardwood, vinyl plank, tile, laminate and carpet.",
    pages: [
      {
        slug: "flooring",
        name: "Flooring Guide",
        tagline: "Hardwood, LVP, tile & carpet",
        description:
          "Hardwood vs vinyl plank vs tile vs carpet — durability, comfort, cost and which floor fits your home.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "garage-driveway",
    name: "Garage & Driveway",
    icon: "door",
    accent: "violet",
    description: "Garage doors, driveway paving, sealing and coatings.",
    pages: [
      {
        slug: "garage-driveway",
        name: "Garage & Driveway Guide",
        tagline: "Doors, paving & coatings",
        description:
          "Garage doors and openers, driveway paving and epoxy floors — options, curb-appeal ROI and costs.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
  {
    slug: "restoration",
    name: "Restoration",
    icon: "droplets",
    accent: "teal",
    description: "Water, fire and storm damage restoration and mold.",
    pages: [
      {
        slug: "restoration",
        name: "Restoration Guide",
        tagline: "Water, fire & mold recovery",
        description:
          "Water extraction, drying, mold remediation and insurance claims — what to do in the first 48 hours.",
        tags: ["Guide", "SEO"],
      },
    ],
  },
);

// Attach the resolved href to every category and page once. Guide pages live
// flat at /bops/housingneeds/<slug>; a category is a tab on the dashboard.
for (const category of HN_CATEGORIES) {
  category.href = `/bops/housingneeds/${category.pages[0].slug}`;
  for (const page of category.pages) {
    page.href = `/bops/housingneeds/${page.slug}`;
  }
}

export const HN_CATEGORY_MAP = Object.fromEntries(
  HN_CATEGORIES.map((category) => [category.slug, category]),
);

export function getHnCategory(slug) {
  return HN_CATEGORY_MAP[slug] ?? null;
}

export function getHnStats() {
  const pages = HN_CATEGORIES.reduce((total, c) => total + c.pages.length, 0);
  return { categories: HN_CATEGORIES.length, pages };
}
