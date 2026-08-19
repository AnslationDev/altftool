// Housing Services — the standalone provider-style pages (landers), organised
// by category. Split out of Housing Needs: Housing Needs keeps the editorial
// guides; every conversion lander lives here at /bops/housing-services/<slug>.
//
// `icon` keys resolve to lucide components in _components/HousingServicesHub.jsx.
// Pages are noindex landers (their layouts set robots); the hub is indexable.

export const HS_CATEGORIES = [
  {
    slug: "roofing",
    name: "Roofing",
    icon: "home",
    pages: [
      { slug: "roofers", name: "Roofers", tagline: "Full-service roofing contractor", description: "Cedar, metal and shingle roofing — replacement, storm-damage repair and free inspections." },
      { slug: "peakshield-roofing", name: "PeakShield Roofing", tagline: "Storm-ready roof replacement", description: "Storm-damage specialists — free inspections, insurance-claim help and premium shingle, metal and tile installs." },
      { slug: "topnotch-roofing", name: "TopNotch Roofing Co.", tagline: "Old-school roofing craft", description: "A third-generation roofing crew — honest inspections, tidy job sites and roofs that outlive their warranty." },
    ],
  },
  {
    slug: "siding",
    name: "Siding",
    icon: "layers",
    pages: [
      { slug: "siding-pros", name: "Siding Pros", tagline: "Siding installation & replacement", description: "Vinyl, fiber-cement and engineered-wood siding with a project gallery and estimates." },
      { slug: "cladco-exteriors", name: "CladCo Exteriors", tagline: "Siding installation & repair", description: "Vinyl, fiber-cement and engineered-wood siding installed by certified crews, with transparent quotes." },
      { slug: "sidingworks", name: "SidingWorks Studio", tagline: "Exterior design & cladding", description: "Design-led siding — cladding as architecture, with colour studies and precision installation." },
    ],
  },
  {
    slug: "gutters",
    name: "Gutters",
    icon: "waves",
    pages: [
      { slug: "rainright-gutters", name: "RainRight Gutters", tagline: "Seamless gutters & guards", description: "Seamless gutter runs, leaf guards and downspout upgrades that keep water away from your foundation." },
      { slug: "gutterflow-pros", name: "GutterFlow Pros", tagline: "Gutters that just work", description: "Installations, guards and cleanouts measured to your roofline — water where it belongs, every storm." },
    ],
  },
  {
    slug: "windows",
    name: "Windows",
    icon: "window",
    pages: [
      { slug: "window-replacement", name: "Window Replacement", tagline: "Windows & facades", description: "Full-frame and insert window replacement, glazing upgrades and specialty shapes." },
      { slug: "clearview-windows", name: "ClearView Windows", tagline: "Energy-efficient replacements", description: "Double- and triple-pane replacements that cut drafts and energy bills, installed in a day." },
      { slug: "panecraft", name: "PaneCraft", tagline: "Handcrafted window fitting", description: "Artisan window fitting — precise measures, clean installs and glass that changes how rooms feel." },
    ],
  },
  {
    slug: "solar",
    name: "Solar",
    icon: "sun",
    pages: [
      { slug: "helios-solar", name: "Helios Solar", tagline: "Residential solar & storage", description: "Rooftop panels, battery storage and installation with reviews and a gallery." },
      { slug: "sunyield-solar", name: "SunYield Solar", tagline: "Solar panels & battery storage", description: "Home solar with battery backup and monitoring — engineered for maximum yield on your roof." },
      { slug: "ecovolt-solar", name: "EcoVolt Solar", tagline: "Clean energy, engineered", description: "Performance-first solar systems with live output monitoring and battery-ready design." },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    icon: "droplet",
    pages: [
      { slug: "plumber", name: "Plumber", tagline: "Residential plumbing services", description: "Leak repair, drain cleaning, water heaters and repiping with 24/7 dispatch." },
      { slug: "pipeworks-pro", name: "PipeWorks Pro", tagline: "24/7 emergency plumbing", description: "Round-the-clock plumbers for bursts, blockages, water heaters and repiping — on-site fast." },
      { slug: "draindoctors", name: "DrainDoctors", tagline: "Drains, leaks & heaters", description: "Blocked drains, leaks and water heaters diagnosed fast and fixed right — with upfront pricing." },
    ],
  },
  {
    slug: "bathroom",
    name: "Bathroom",
    icon: "bath",
    pages: [
      { slug: "bathroom-remodeling", name: "Bathroom Remodeling", tagline: "Bathroom renovation", description: "Custom bathroom remodels with 3D design, fixed pricing and free consultations." },
      { slug: "aqualux-baths", name: "AquaLux Baths", tagline: "Luxury bathroom remodels", description: "Spa-grade bathroom transformations — walk-in showers, freestanding tubs and marble finishes." },
      { slug: "tiletrend-bath", name: "TileTrend Bath", tagline: "Statement tile bathrooms", description: "Bathrooms built around beautiful tile — mosaics, patterns and waterproofing done properly." },
    ],
  },
  {
    slug: "interiors",
    name: "Interiors",
    icon: "paintbrush",
    pages: [
      { slug: "freshcoat-interiors", name: "FreshCoat Interiors", tagline: "Interior painting & styling", description: "Colour consults, flawless prep and clean-edge painting that transforms rooms in days." },
      { slug: "roomrevive", name: "RoomRevive", tagline: "Whole-room makeovers", description: "Editorial-grade room refreshes — palettes, textures and styling that make a house feel curated." },
    ],
  },
  {
    slug: "hvac",
    name: "HVAC",
    icon: "thermometer",
    pages: [
      { slug: "climatech", name: "ClimaTech", tagline: "Heating & cooling services", description: "HVAC install, repair and maintenance with 24/7 emergency service and a blog." },
      { slug: "airflow-masters", name: "AirFlow Masters", tagline: "Heating & cooling experts", description: "AC installs, furnace repair and smart-thermostat tune-ups with same-week appointments." },
      { slug: "polarflame", name: "PolarFlame HVAC", tagline: "Cold done hot. Heat done cool.", description: "Heat pumps, AC and furnaces sized right the first time — comfort in every season." },
    ],
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    icon: "bug",
    pages: [
      { slug: "pest-control", name: "Pest Control", tagline: "Pest management services", description: "Full-service pest control — inspection, treatment, booking and service areas." },
      { slug: "pest-killer", name: "Pest Killer", tagline: "Pest extermination", description: "Ants, bedbugs, cockroaches, mosquitoes and termites, with reveal animations." },
      { slug: "kairos", name: "Kairos Fictional UI Preview", tagline: "Non-operational pest-service concept", description: "A fictional, non-operational landing-page preview with general education and provider-verification prompts." },
      { slug: "bugshield-pro", name: "BugShield Pro", tagline: "Guaranteed pest protection", description: "Quarterly protection plans for ants, roaches, rodents and termites — re-treat free if pests return." },
      { slug: "greenguard-pest", name: "GreenGuard Exterminators", tagline: "Eco-first pest control", description: "Plant-based treatments and exclusion-first methods that are tough on pests, gentle on homes." },
    ],
  },
  {
    slug: "security",
    name: "Security",
    icon: "shield",
    pages: [
      { slug: "sentinel-secure", name: "SentinelSecure", tagline: "Smart home security systems", description: "24/7 monitored security — cameras, sensors and smart locks installed and managed from one app." },
      { slug: "guardnest", name: "GuardNest", tagline: "Family-first home protection", description: "Friendly, no-contract home security built around families — doorbell cams, alarms and child-safe automations." },
      { slug: "irongate-security", name: "IronGate Security", tagline: "Pro-grade security installs", description: "Commercial-grade cameras, access control and monitored alarms installed by licensed technicians." },
      { slug: "nightwatch-security", name: "NightWatch Security", tagline: "Overnight alarm monitoring", description: "Night-vision cameras and overnight response teams for when your home needs watching most." },
    ],
  },
  {
    slug: "packers-movers",
    name: "Packers & Movers",
    icon: "truck",
    pages: [
      { slug: "swiftshift-movers", name: "SwiftShift Movers", tagline: "Local & long-distance moving", description: "Same-week moves with trained crews, flat quotes and real-time truck tracking — local or cross-country." },
      { slug: "packngo", name: "PackNGo", tagline: "Packing & moving, done for you", description: "Full-service packing, eco-friendly materials and careful transport — from boxes to unpacked home." },
      { slug: "movemint", name: "MoveMint", tagline: "Modern moving, minus stress", description: "App-tracked crews, upfront pricing and reusable crates — moving that feels effortless." },
      { slug: "cityhop-movers", name: "CityHop Movers", tagline: "Apartment & city moves", description: "Stairs, elevators, parking permits — city moving solved by crews who do it daily." },
    ],
  },
];

// Attach hrefs once — every page lives flat at /bops/housing-services/<slug>.
for (const category of HS_CATEGORIES) {
  for (const page of category.pages) {
    page.href = `/bops/housing-services/${page.slug}`;
    page.category = category.slug;
  }
}

const BY_SLUG = new Map(
  HS_CATEGORIES.flatMap((c) => c.pages.map((p) => [p.slug, p])),
);

export function getHousingService(slug) {
  return BY_SLUG.get(slug) ?? null;
}

export function getHsStats() {
  const pages = HS_CATEGORIES.reduce((t, c) => t + c.pages.length, 0);
  return { categories: HS_CATEGORIES.length, pages };
}
