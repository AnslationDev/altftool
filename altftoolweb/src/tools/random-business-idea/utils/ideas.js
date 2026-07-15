function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const s = [...arr].sort(() => Math.random() - 0.5);
  return s.slice(0, n);
}

const INDUSTRIES = [
  "Healthcare", "Education", "Food & Beverage", "Real Estate",
  "Transportation", "Retail", "Hospitality", "Agriculture",
  "Finance", "Entertainment", "Fashion", "Wellness",
  "Construction", "Energy", "Logistics", "Insurance",
  "Legal", "Marketing", "Manufacturing", "Travel",
  "Sports", "Pet Care", "Senior Care", "Childcare",
  "Cybersecurity", "Gaming", "Music", "Art & Design",
];

const PROBLEMS = [
  "lack of transparency", "inefficient processes", "high costs",
  "wasted time", "poor communication", "data silos",
  "supply chain gaps", "skill shortages", "waste management",
  "accessibility barriers", "customer churn", "employee burnout",
  "food waste", "carbon footprint", "urban congestion",
  "housing affordability", "healthcare access", "financial exclusion",
  "digital divide", "information overload", "fraud & scams",
  "quality inconsistency", "last-mile delivery", "talent retention",
  "regulatory compliance", "inventory management", "personalization gaps",
];

const TECHNOLOGIES = [
  "AI", "blockchain", "IoT", "augmented reality",
  "machine learning", "computer vision", "natural language processing",
  "robotics", "3D printing", "drones",
  "edge computing", "5G", "quantum computing",
  "biometrics", "VR", "digital twins",
  "smart contracts", "predictive analytics", "voice AI",
  "autonomous systems", "wearables", "nanotechnology",
  "biotech", "clean tech", "satellite tech",
];

const BUSINESS_MODELS = [
  "subscription", "marketplace", "SaaS", "freemium",
  "on-demand", "direct-to-consumer", "B2B", "B2C",
  "peer-to-peer", "platform coop", "franchise", "licensing",
  "white-label", "agency", "consulting", "affiliate",
  "crowdfunding", "membership", "rental", "pay-per-use",
  "bundling", "razor-blade", "reverse auction",
];

const AUDIENCES = [
  "small business owners", "remote workers", "college students",
  "busy parents", "senior citizens", "freelancers",
  "corporate executives", "healthcare providers", "teachers",
  "restaurant owners", "real estate agents", "gig economy workers",
  "pet owners", "fitness enthusiasts", "travelers",
  "artists & creators", "nonprofits", "local governments",
  "property managers", "event planners", "retirees",
  "new parents", "teenagers", "developers",
];

const COMPANY_NAMES = {
  prefixes: ["Nova", "Aura", "Nexus", "Vibe", "Flux", "Peak", "Core", "Zen", "Pulse", "Arc",
    "Beam", "Cove", "Dawn", "Edge", "Forge", "Grip", "Harbor", "Ivy", "Jolt", "Keen",
    "Loom", "Muse", "Nord", "Oak", "Pivot", "Quest", "Rise", "Shore", "Trace", "Unity",
    "Volt", "Wave", "Yard", "Zeal", "Bright", "Clear", "Deep", "Ever", "First", "Grand"],
  suffixes: ["fy", "ly", "ix", "io", "hub", "lab", "lytics", "works", "ify", "able",
    "wise", "mesh", "sync", "flow", "nest", "link", "core", "mind", "site", "scale"],
};

const STARTUP_COST = {
  low: { label: "Under $5K", range: [500, 5000] },
  medium: { label: "$5K – $50K", range: [5000, 50000] },
  high: { label: "$50K – $250K", range: [50000, 250000] },
  veryHigh: { label: "$250K+", range: [250000, 2000000] },
};

const MONETIZATION = [
  "Monthly subscription tiers", "Pay-per-use pricing", "Commission on transactions",
  "Advertising & sponsorships", "Premium features (freemium)", "Consulting & custom solutions",
  "White-label licensing", "Data insights reports", "Affiliate partnerships",
  "Hardware + recurring software", "Marketplace transaction fees",
  "Lead generation fees", "API access fees", "Certification programs",
];

const COMPETITOR_NAMES = [
  "Traditional agencies", "In-house teams", "Spreadsheets & manual processes",
  "Legacy software vendors", "Open-source alternatives", "Freelance marketplaces",
  "DIY solutions", "Consulting firms", "Enterprise suites",
  "No-code platforms", "Existing startups", "Big tech (Google, Microsoft)",
];

const WHY_IT_WORKS = [
  "Remote and hybrid work is here to stay, creating demand for new tools",
  "AI and automation are becoming accessible to small businesses for the first time",
  "Consumers increasingly expect personalized, on-demand experiences",
  "Regulatory changes are forcing industries to modernize their compliance tools",
  "The creator economy is growing 3x faster than traditional SMEs",
  "Sustainability is no longer optional — every industry needs green solutions",
  "The global middle class is expanding, creating new consumer markets",
  "Baby boomers are retiring, creating gaps in skilled trades and services",
  "Generation Z values transparency and ethics more than any previous generation",
  "Supply chain reshoring is creating opportunities for local manufacturing",
  "Healthcare costs keep rising, driving demand for preventive wellness solutions",
  "The gig economy now accounts for 36% of US workers",
  "Digital literacy is at an all-time high, enabling new user experiences",
  "Climate tech investment has grown 5x in the last five years",
  "Cross-border e-commerce is expanding faster than domestic retail",
];

const CHALLENGES = [
  "Regulatory compliance across different markets can be complex",
  "Customer acquisition costs in this space are rising",
  "Building trust with users requires significant investment in security",
  "Talent competition with larger tech companies is intense",
  "Integration with existing enterprise systems is non-trivial",
  "Educating the market about a new category takes time and capital",
  "Supply chain volatility could affect service reliability",
  "Data privacy regulations vary significantly by region",
  "Scaling beyond the initial market requires localization",
  "Retaining customers long-term requires continuous innovation",
  "Platform dependency risk if building on third-party ecosystems",
  "Seasonal demand fluctuations can strain cash flow",
];

function generateCompanyName() {
  const prefix = pick(COMPANY_NAMES.prefixes);
  const suffix = pick(COMPANY_NAMES.suffixes);
  const name = `${prefix}${suffix}`;
  const formatted = name.charAt(0).toUpperCase() + name.slice(1);
  if (Math.random() > 0.5) {
    return formatted;
  }
  const word = pick(["Technologies", "Solutions", "Labs", "Ventures", "AI", "Data", "Digital", "Systems"]);
  return `${formatted} ${word}`;
}

function generateTagline(industry, problem, technology, audience) {
  const templates = [
    `${technology}-powered ${industry} for ${audience}`,
    `The ${industry} platform solving ${problem} with ${technology}`,
    `${industry} reimagined: ${technology} meets ${problem}`,
    `Empowering ${audience} to overcome ${problem} in ${industry}`,
    `${technology}-first ${industry} built for ${audience}`,
    `Finally, ${technology} solves ${problem} in ${industry}`,
    `The ${industry} revolution: ${technology} for ${audience}`,
  ];
  return pick(templates);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateIdeas(count = 1, filters = {}) {
  const ideas = [];

  for (let i = 0; i < count; i++) {
    const industry = filters.industry || pick(INDUSTRIES);
    const problem = filters.problem || pick(PROBLEMS);
    const technology = pick(TECHNOLOGIES);
    const businessModel = pick(BUSINESS_MODELS);
    const audience = pick(AUDIENCES);
    const costKey = pick(Object.keys(STARTUP_COST));
    const cost = STARTUP_COST[costKey];

    const companyName = generateCompanyName();
    const tagline = generateTagline(industry, problem, technology, audience);

    const idea = {
      id: `${Date.now()}-${i}`,
      companyName,
      tagline: capitalize(tagline),
      industry,
      problem,
      technology,
      businessModel,
      audience,
      startupCost: cost.label,
      costRange: cost.range,
      monetization: pick(MONETIZATION),
      competitors: pickN(COMPETITOR_NAMES, 2),
      whyItWorks: pick(WHY_IT_WORKS),
      challenges: pickN(CHALLENGES, 2),
      description: `${capitalize(companyName)} is a ${businessModel} business that uses ${technology} to solve ${problem} in the ${industry} industry, targeting ${audience}. ${pick([
        `By leveraging cutting-edge ${technology}, the platform delivers measurable results from day one.`,
        `The platform combines ${technology} with deep ${industry} expertise to deliver a superior experience.`,
        `With ${technology} at its core, ${companyName} transforms how ${audience} approach ${problem}.`,
        `${companyName} brings enterprise-grade ${technology} to ${audience} at an affordable price point.`,
      ])}`,
      score: Math.round((60 + Math.random() * 35) * 10) / 10,
      timestamp: new Date().toISOString(),
    };

    ideas.push(idea);
  }

  return ideas;
}

export function generateBatch(count) {
  return generateIdeas(count);
}

export const FILTER_OPTIONS = {
  industries: INDUSTRIES,
  businessModels: BUSINESS_MODELS,
  audiences: AUDIENCES,
  costRanges: Object.entries(STARTUP_COST).map(([key, val]) => ({
    key,
    label: val.label,
  })),
};
