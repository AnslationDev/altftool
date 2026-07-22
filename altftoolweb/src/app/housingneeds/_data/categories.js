// Housing Needs — category registry.
//
// Housing Needs is organised as: Housing Needs > category > pages. A category
// is an organisational folder (e.g. Roofing); a page is an actual page living
// at /housingneeds/<category>/<page>. Two kinds of page coexist:
//   - landers  — the standalone conversion microsites from the inventory import
//   - guides   — the informational vertical pages (the former /housingneeds/*),
//                rendered by the shared HnVerticalPage component.
// The dashboard and category views derive entirely from this array.
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
        slug: "roofers",
        name: "Roofers",
        tagline: "Full-service roofing contractor",
        description:
          "Cedar, metal and shingle roofing — replacement, storm-damage repair and free inspections.",
        tags: ["Lander", "Contractor"],
      },
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
        slug: "siding-pros",
        name: "Siding Pros",
        tagline: "Siding installation & replacement",
        description:
          "Vinyl, fiber-cement and engineered-wood siding with a project gallery and estimates.",
        tags: ["Lander", "Estimate"],
      },
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
        slug: "window-replacement",
        name: "Window Replacement",
        tagline: "Windows & facades",
        description:
          "Full-frame and insert window replacement, glazing upgrades and specialty shapes.",
        tags: ["Lander", "Multi-page"],
      },
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
        slug: "helios-solar",
        name: "Helios Solar",
        tagline: "Residential solar & storage",
        description:
          "Rooftop panels, battery storage and installation with reviews and a gallery.",
        tags: ["Lander", "Storage"],
      },
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
        slug: "plumber",
        name: "Plumber",
        tagline: "Residential plumbing services",
        description:
          "Leak repair, drain cleaning, water heaters and repiping with 24/7 dispatch.",
        tags: ["Lander", "Lead gen"],
      },
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
    slug: "bathroom",
    name: "Bathroom",
    icon: "bath",
    accent: "rose",
    description: "Bathroom remodeling and renovation.",
    pages: [
      {
        slug: "bathroom-remodeling",
        name: "Bathroom Remodeling",
        tagline: "Bathroom renovation",
        description:
          "Custom bathroom remodels with 3D design, fixed pricing and free consultations.",
        tags: ["Lander", "Interiors"],
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
    slug: "hvac",
    name: "HVAC",
    icon: "thermometer",
    accent: "emerald",
    description: "Heating, cooling, installation and maintenance.",
    pages: [
      {
        slug: "climatech",
        name: "ClimaTech",
        tagline: "Heating & cooling services",
        description:
          "HVAC install, repair and maintenance with 24/7 emergency service and a blog.",
        tags: ["Lander", "Blog"],
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
        slug: "pest-control",
        name: "Pest Control",
        tagline: "Pest management services",
        description:
          "Full-service pest control — inspection, treatment, booking and service areas.",
        tags: ["Lander", "Booking"],
      },
      {
        slug: "pest-killer",
        name: "Pest Killer",
        tagline: "Pest extermination",
        description:
          "Ants, bedbugs, cockroaches, mosquitoes and termites, with reveal animations.",
        tags: ["Lander", "Animated"],
      },
      {
        slug: "kairos",
        name: "Kairos Pest Control",
        tagline: "Termite & pest control",
        description:
          "Branded termite and pest control with a dedicated termite service page.",
        tags: ["Lander", "Termites"],
      },
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

const GUIDE_ROUTES = {
  gutters: "/housingneeds/gutters",
  interiors: "/housingneeds/interiors",
  pestcontrol: "/housingneeds/pestcontrol",
  plumbing: "/housingneeds/plumbing",
  roofing: "/housingneeds/roofing",
  siding: "/housingneeds/siding",
  solar: "/housingneeds/solar",
  windows: "/housingneeds/windows",
};

// Attach canonical URLs once. Existing guide pages keep their established
// short URLs, while focused service experiences live one level deeper.
for (const category of HN_CATEGORIES) {
  category.href = `/housingneeds?category=${category.slug}`;
  for (const page of category.pages) {
    page.href =
      GUIDE_ROUTES[page.slug] ||
      `/housingneeds/${category.slug}/${page.slug}`;
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
