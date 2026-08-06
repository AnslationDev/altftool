import {
  Activity,
  AppWindow,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Code2,
  Compass,
  Dumbbell,
  FileText,
  FlaskConical,
  Footprints,
  Gamepad2,
  Gavel,
  HandHeart,
  Gem,
  Ghost,
  Globe2,
  GraduationCap,
  HeartPulse,
  House,
  ImageIcon,
  Landmark,
  Laugh,
  LayoutGrid,
  Library,
  Lightbulb,
  Link2,
  Maximize2,
  Bot,
  MapPin,
  Monitor,
  Music4,
  Newspaper,
  Palette,
  PawPrint,
  PenTool,
  Plane,
  Puzzle,
  Radar,
  Radio,
  ScanFace,
  Search,
  SearchCheck,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Shuffle,
  Smartphone,
  Sparkles,
  Tags,
  TextCursorInput,
  Video,
  Waves,
  Workflow,
  Wrench,
} from "lucide-react";
import {
  EXPERIENCE_CATALOG,
  EXPERIENCE_GROUPS,
} from "@altftool/core/experiences";
import { PRODUCT_SUITE_CATALOG } from "@altftool/core/product-suites";
import { CANONICAL_CATEGORIES } from "../registry/categoryTaxonomy.js";
import { canonicalRouteOption } from "./routeOptionUtils.js";

/**
 * Nav options assembled from an external catalog can drift onto a URL that
 * `next.config.mjs` redirects — `/games` 308s to `/tools/games` today, which
 * cost every visitor who tapped "Games Arcade" an extra round trip. Routing the
 * catalog href through the alias table keeps the nav on canonical URLs, while
 * `match` keeps the legacy path so the item still highlights when a visitor
 * arrives on it from an old link.
 */
const PRODUCT_SUITE_ICONS = {
  "idea-lab": Lightbulb,
  domainops: Globe2,
  minutes: FileText,
  security: ShieldCheck,
  authenticator: ShieldCheck,
  netcheck: Radar,
  career: BriefcaseBusiness,
  creator: Sparkles,
  flow: Workflow,
  impact: Globe2,
  campus: GraduationCap,
  developers: Wrench,
  vault: ShieldCheck,
};

const PRODUCT_SUITE_GROUPS = {
  "idea-lab": "Build & create",
  minutes: "Build & create",
  creator: "Build & create",
  flow: "Build & create",
  domainops: "Operate & protect",
  security: "Operate & protect",
  authenticator: "Operate & protect",
  netcheck: "Operate & protect",
  developers: "Operate & protect",
  vault: "Operate & protect",
  career: "Career & impact",
  impact: "Career & impact",
  campus: "Career & impact",
};

const EXPERIENCE_ICONS = {
  Activity,
  AppWindow,
  BookOpen,
  Brain,
  Gamepad2,
  Ghost,
  ImageIcon,
  Landmark,
  Laugh,
  LayoutGrid,
  Library,
  Music4,
  PenTool,
  Plane,
  Puzzle,
  Radio,
  ScrollText,
  Sparkles,
  Waves,
};

const TOOL_CATEGORY_ICONS = {
  "ai-tools": Bot,
  "pdf-documents": FileText,
  "image-photo": ImageIcon,
  "video-audio": Video,
  "text-writing": TextCursorInput,
  converters: Workflow,
  generators: Sparkles,
  calculators: Calculator,
  "finance-calculators": Gem,
  "health-calculators": HeartPulse,
  "health-fitness": Dumbbell,
  developer: Code2,
  "design-color": Palette,
  "marketing-social": Radar,
  "security-privacy": ShieldCheck,
  "education-science": GraduationCap,
  productivity: Workflow,
  business: Building2,
  lifestyle: House,
  fun: Laugh,
  games: Gamepad2,
  other: LayoutGrid,
};

// Tool categories grouped by the job a visitor is trying to finish, not by the
// order the codebase grew. The previous buckets ("Create & work",
// "Build & calculate", "Learn & everyday") mixed unrelated jobs — image editing
// sat next to invoicing, and fitness sat next to browser games — which made the
// mobile list impossible to scan. `TOOL_INTENT_ORDER` fixes display order so a
// new canonical category cannot silently reshuffle the menu.
export const TOOL_INTENT_ORDER = Object.freeze([
  "Images & video",
  "PDF & writing",
  "Calculate & convert",
  "Health & fitness",
  "AI, code & work",
  "Learn & play",
]);

const TOOL_CATEGORY_GROUPS = {
  "image-photo": "Images & video",
  "video-audio": "Images & video",
  "design-color": "Images & video",
  "pdf-documents": "PDF & writing",
  "text-writing": "PDF & writing",
  calculators: "Calculate & convert",
  "finance-calculators": "Calculate & convert",
  "health-calculators": "Calculate & convert",
  converters: "Calculate & convert",
  "health-fitness": "Health & fitness",
  lifestyle: "Health & fitness",
  "ai-tools": "AI, code & work",
  generators: "AI, code & work",
  developer: "AI, code & work",
  "security-privacy": "AI, code & work",
  productivity: "AI, code & work",
  business: "AI, code & work",
  "marketing-social": "AI, code & work",
  "education-science": "Learn & play",
  games: "Learn & play",
  fun: "Learn & play",
  other: "Learn & play",
};

const TOOL_INTENT_ICONS = {
  "Images & video": ImageIcon,
  "PDF & writing": FileText,
  "Calculate & convert": Calculator,
  "Health & fitness": HeartPulse,
  "AI, code & work": Bot,
  "Learn & play": Gamepad2,
};

export const PRODUCT_SUITE_ROUTE_OPTIONS = PRODUCT_SUITE_CATALOG.map((suite) =>
  canonicalRouteOption({
    label: suite.name.replace(/^AltF\s+/, ""),
    href: `/products/${suite.slug}`,
    group: PRODUCT_SUITE_GROUPS[suite.slug] || "Product suites",
    icon: PRODUCT_SUITE_ICONS[suite.slug] || LayoutGrid,
  }),
);

export const EXPERIENCE_ROUTE_OPTIONS = EXPERIENCE_CATALOG.map((experience) =>
  canonicalRouteOption({
    label: experience.name,
    href: experience.href,
    match: [experience.href],
    group: EXPERIENCE_GROUPS[experience.group]?.label || "Labs",
    icon: EXPERIENCE_ICONS[experience.icon] || FlaskConical,
  }),
);

export const TOOL_CATEGORY_ROUTE_OPTIONS = CANONICAL_CATEGORIES.map(
  (category) =>
    canonicalRouteOption({
      label: category.label,
      href: `/tools/${category.slug}`,
      match: [`/tools/${category.slug}`],
      group: TOOL_CATEGORY_GROUPS[category.slug] || "More tool categories",
      icon: TOOL_CATEGORY_ICONS[category.slug] || LayoutGrid,
    }),
);

/**
 * The 22 canonical tool categories, collapsed into the six intent groups above
 * and returned in a stable display order. This is the shape the mobile tool
 * browser renders, so the grouping lives in the registry instead of the header.
 */
export const TOOL_BROWSE_GROUPS = (() => {
  const byIntent = new Map();

  for (const option of TOOL_CATEGORY_ROUTE_OPTIONS) {
    if (!byIntent.has(option.group)) byIntent.set(option.group, []);
    byIntent.get(option.group).push(option);
  }

  const ordered = [
    ...TOOL_INTENT_ORDER.filter((label) => byIntent.has(label)),
    ...[...byIntent.keys()].filter(
      (label) => !TOOL_INTENT_ORDER.includes(label),
    ),
  ];

  return ordered.map((label) => ({
    label,
    icon: TOOL_INTENT_ICONS[label] || LayoutGrid,
    items: byIntent.get(label),
  }));
})();

export const SITE_ROUTES = {
  home: { label: "Home", href: "/" },
  tools: { label: "Tools", href: "/tools/all", match: ["/tools"] },
  apps: { label: "Android Apps", href: "/apps", match: ["/apps"] },
  products: { label: "Products", href: "/products" },
  labs: { label: "Labs", href: "/labs" },
  signals: { label: "Signals", href: "/signals" },
  ideas: { label: "Ideas", href: "/ideas", match: ["/ideas"] },
  backlinks: { label: "Backlinks", href: "/backlinks", match: ["/backlinks"] },
  lexicon: { label: "Lexicon", href: "/lexicon", match: ["/lexicon"] },
  lexiconBrowse: { label: "Browse A–Z", href: "/lexicon/browse" },
  lexiconWordOfTheDay: { label: "Word of the Day", href: "/lexicon/word-of-the-day" },
  lexiconThesaurus: { label: "Thesaurus", href: "/lexicon/thesaurus" },
  lexiconCollections: { label: "Word Collections", href: "/lexicon/collections" },
  lexiconWordLists: { label: "Word Lists", href: "/lexicon/words" },
  lexiconGames: { label: "Word Games", href: "/lexicon/games" },
  lexiconTools: { label: "Word Tools", href: "/lexicon/tools" },
  lexiconLearn: { label: "Grammar & Usage", href: "/lexicon/learn" },
  lexiconCompare: { label: "Compare Words", href: "/lexicon/compare" },
  lexiconSources: { label: "Sources & Licences", href: "/lexicon/sources" },
  rabbithole: { label: "Rabbithole", href: "/rabbithole", match: ["/rabbithole"] },
  rabbitholeBrowse: { label: "Browse interesting sites", href: "/rabbithole/browse" },
  rabbitholeCollections: { label: "Rabbithole collections", href: "/rabbithole/collections" },
  rabbitholeBuiltByAltf: { label: "Built by AltF", href: "/rabbithole/built-by-altf" },
  atlas: { label: "Atlas", href: "/altfatlas", match: ["/altfatlas"] },
  atlasBrowse: { label: "Browse useful sites", href: "/altfatlas/browse" },
  atlasCategories: { label: "Atlas categories", href: "/altfatlas/categories" },
  atlasUseCases: { label: "Find a site by task", href: "/altfatlas/use-case" },
  detour: { label: "Detour", href: "/detour", match: ["/detour"] },
  detourToday: { label: "Detour of the day", href: "/detour/today" },
  detourBrowse: { label: "Browse Detour", href: "/detour/browse" },
  detourOriginals: { label: "AltF originals", href: "/detour/play" },
  persona: { label: "Persona", href: "/persona", match: ["/persona"] },
  personaStudio: { label: "Persona Studio", href: "/persona/studio" },
  personaCast: { label: "Persona cast", href: "/persona/cast" },
  personaShots: { label: "Shot library", href: "/persona/shots" },
  personaDisclosure: { label: "AI disclosure", href: "/persona/disclosure" },
  personaRates: { label: "Quote worksheet", href: "/persona/rates" },
  ideaLab: { label: "IdeaLab", href: "/products/idea-lab" },
  domainOps: { label: "DomainOps", href: "/products/domainops" },
  minutes: { label: "Minutes", href: "/products/minutes" },
  flow: { label: "Flow", href: "/products/flow" },
  impact: { label: "Impact", href: "/products/impact" },
  businessOps: { label: "Business Ops", href: "/bops" },
  loans: {
    label: "Loans",
    href: "/bops/loans",
    match: ["/bops/loans"],
  },
  insurance: {
    label: "Insurance",
    href: "/bops/insurance",
    match: ["/bops/insurance"],
  },
  homeServices: {
    label: "Home Services",
    href: "/homeserv",
    match: ["/homeserv"],
  },
  housingNeeds: {
    label: "Housing Needs",
    href: "/bops/housingneeds",
    match: ["/bops/housingneeds", "/housingneeds"],
  },
  housingServices: {
    label: "Housing Services",
    href: "/bops/housing-services",
    match: ["/bops/housing-services"],
  },
  legalServices: {
    label: "Legal Services",
    href: "/bops/legal-services",
    match: ["/bops/legal-services"],
  },
  seniorCare: {
    label: "Senior Care",
    href: "/bops/senior-care",
    match: ["/bops/senior-care"],
  },
  petServices: {
    label: "Pet Services",
    href: "/bops/pet-services",
    match: ["/bops/pet-services"],
  },
  tripFindBox: {
    label: "TripFindBox",
    href: "/bops/tripfindbox",
    match: ["/bops/tripfindbox"],
  },
  calculators: {
    label: "Calculators",
    href: "/altfcalculators",
    match: ["/altfcalculators"],
  },
  examPhoto: {
    label: "Exam Photo Specs",
    href: "/exam-photo",
    match: ["/exam-photo"],
  },
  promptStudio: {
    label: "AI Prompt Studio",
    href: "/imgprompt",
    match: ["/imgprompt"],
  },
  automationLibrary: {
    label: "n8n Automation Library",
    href: "/n8n",
    match: ["/n8n"],
  },
  fullScreen: {
    label: "Fullscreen Browser",
    href: "/fullscrn",
    match: ["/fullscrn"],
  },
  webSearch: {
    label: "Web Search",
    href: "/search-eng",
    match: ["/search-eng"],
  },
  seedreamPrompts: {
    label: "Seedream Prompts",
    href: "/prompts/seedream-5-pro",
    match: ["/prompts/seedream-5-pro"],
  },
  factNet: { label: "FactNet", href: "/fact-net", match: ["/fact-net"] },
  bharatVirasat: {
    label: "Bharat Virasat",
    href: "/bharat-virasat",
    match: ["/bharat-virasat"],
  },
  mockly: {
    label: "Mockly",
    href: "/prank-socialmedia",
    match: ["/prank-socialmedia"],
  },
  games: {
    label: "Browser Games",
    href: "/tools/games",
    match: ["/tools/games"],
  },
  altfGames: { label: "AltF Games", href: "/altfgame", match: ["/altfgame"] },
  embedWidgets: { label: "Embed Widgets", href: "/embed" },
  extensions: { label: "Extensions", href: "/extensions" },
  altfDeals: { label: "AltF Deals", href: "/deals" },
  exclusiveDeals: { label: "Exclusive Deals", href: "/exclusivedeals" },
  buySmart: { label: "BuySmart", href: "/buysmart" },
  saleLocator: { label: "Sale Locator", href: "/sale" },
  imgPrompt: { label: "Img Prompt", href: "/imgprompt" },
  freeAiTool: { label: "Free-Ai-Tool", href: "/free-ai-tool" },
  // Hub over the two routes directly above. It links to those two and
  // nothing else — see LOOKOUTS_PRODUCTS in src/app/lookouts/lookouts.js,
  // which must only ever name routes that exist in this tree.
  lookouts: { label: "Lookouts", href: "/lookouts" },
  academy: { label: "Academy", href: "/academy" },
  blogs: { label: "Blog", href: "/blogs" },
  brandRatings: { label: "Brand Ratings", href: "/brandrating" },
  docs: { label: "Documentation", href: "/docs" },
  support: { label: "Support", href: "/supportsetting" },
  requestTool: { label: "Request a Tool", href: "/request-a-tool" },
  faq: { label: "FAQ", href: "/policypages/faq" },
  status: { label: "Status", href: "/status" },
  licenses: { label: "Open Source Licenses", href: "/licenses" },
  siteMap: { label: "Site Map", href: "/site-map" },
  imageTools: { label: "Image Tools", href: "/altfloveimg" },
  pdfTools: { label: "PDF Tools", href: "/altflovepdf" },
  news: { label: "News", href: "/news" },
  locations: { label: "Locations", href: "/locations" },
  desktop: { label: "Desktop Software", href: "/desktop" },
  trendingVideos: { label: "Trending Videos", href: "/trendingvids" },
  personality: { label: "Personality", href: "/personality" },
  // Every entry here must have a page.jsx under src/app — a nav link to a
  // missing route resolves to the global not-found document served with a
  // 200, which is the soft 404 these routes exist to stop producing.
  top1: { label: "Top1", href: "/top1" },
  top6: { label: "Top6", href: "/top6" },
  top9: { label: "Top9", href: "/top9" },
  top10: { label: "Top10", href: "/top10" },
  about: { label: "About AltFTool", href: "/policypages/about" },
  contact: { label: "Contact", href: "/policypages/contact" },
  privacy: { label: "Privacy", href: "/policypages/privacy" },
  terms: { label: "Terms", href: "/policypages/termsandconditions" },
  disclaimer: { label: "Disclaimer", href: "/policypages/disclaimer" },
  affiliate: { label: "Affiliate", href: "/policypages/affiliate" },
  cookie: { label: "Cookie", href: "/policypages/cookie" },
};

/**
 * Standalone tool destinations that are neither canonical categories nor
 * directory hubs. One list feeds both the desktop menu and the phone sheet:
 * they had drifted apart, so `/fullscrn` and `/search-eng` were reachable on a
 * desktop and unreachable on a phone, which is where 84% of clicks land.
 */
export const TOOL_UTILITY_ROUTE_OPTIONS = [
  { ...SITE_ROUTES.fullScreen, group: "Browser utilities", icon: Maximize2 },
  { ...SITE_ROUTES.webSearch, group: "Browser utilities", icon: SearchCheck },
];

export const PUBLIC_NAV_ITEMS = [
  {
    ...SITE_ROUTES.products,
    icon: LayoutGrid,
    menuAlign: "left",
    menuColumns: 3,
    options: [
      { ...SITE_ROUTES.products, group: "Overview", icon: LayoutGrid },
      { ...SITE_ROUTES.ideas, group: "Discover", icon: Lightbulb },
      { ...SITE_ROUTES.backlinks, group: "Discover", icon: Link2 },
      { ...SITE_ROUTES.persona, group: "Create", icon: Sparkles },
      { ...SITE_ROUTES.signals, group: "Overview", icon: Radar },
      ...PRODUCT_SUITE_ROUTE_OPTIONS,
    ],
  },
  {
    ...SITE_ROUTES.tools,
    icon: Wrench,
    menuColumns: 4,
    options: [
      { ...SITE_ROUTES.tools, group: "Directories & apps", icon: Wrench },
      {
        ...SITE_ROUTES.calculators,
        group: "Directories & apps",
        icon: Calculator,
      },
      {
        ...SITE_ROUTES.imageTools,
        group: "Directories & apps",
        icon: ImageIcon,
      },
      { ...SITE_ROUTES.pdfTools, group: "Directories & apps", icon: FileText },
      { ...SITE_ROUTES.altfGames, group: "Directories & apps", icon: Gamepad2 },
      { ...SITE_ROUTES.atlas, group: "Directories & apps", icon: Compass },
      { ...SITE_ROUTES.lexicon, group: "Directories & apps", icon: BookOpen },
      {
        ...SITE_ROUTES.examPhoto,
        group: "Directories & apps",
        icon: GraduationCap,
      },
      ...TOOL_CATEGORY_ROUTE_OPTIONS,
      // "Build & calculate" was the last surviving label from the retired
      // grouping scheme described above TOOL_INTENT_ORDER, so it read as a
      // stray bucket next to the six intent groups.
      ...TOOL_UTILITY_ROUTE_OPTIONS,
    ],
  },
  {
    ...SITE_ROUTES.automationLibrary,
    label: "Automate",
    icon: Workflow,
    menuColumns: 3,
    options: [
      {
        ...SITE_ROUTES.automationLibrary,
        group: "Workflow library",
        icon: Bot,
      },
      { ...SITE_ROUTES.flow, group: "Workflow library", icon: Workflow },
      { ...SITE_ROUTES.promptStudio, group: "Create with AI", icon: Sparkles },
      {
        ...SITE_ROUTES.seedreamPrompts,
        group: "Create with AI",
        icon: Sparkles,
      },
      { ...SITE_ROUTES.extensions, group: "Apps & software", icon: Puzzle },
      { ...SITE_ROUTES.apps, group: "Apps & software", icon: Smartphone },
      { ...SITE_ROUTES.desktop, group: "Apps & software", icon: Monitor },
    ],
  },
  {
    ...SITE_ROUTES.businessOps,
    label: "Business",
    icon: BriefcaseBusiness,
    menuColumns: 3,
    options: [
      {
        ...SITE_ROUTES.businessOps,
        group: "Overview",
        icon: BriefcaseBusiness,
      },
      { ...SITE_ROUTES.housingNeeds, group: "Home & housing", icon: House },
      { ...SITE_ROUTES.housingServices, group: "Home & housing", icon: Wrench },
      { ...SITE_ROUTES.homeServices, group: "Home & housing", icon: House },
      { ...SITE_ROUTES.loans, group: "Money & protection", icon: Landmark },
      {
        ...SITE_ROUTES.insurance,
        group: "Money & protection",
        icon: ShieldCheck,
      },
      { ...SITE_ROUTES.tripFindBox, group: "Specialist services", icon: Plane },
      {
        ...SITE_ROUTES.petServices,
        group: "Specialist services",
        icon: PawPrint,
      },
      {
        ...SITE_ROUTES.legalServices,
        group: "Specialist services",
        icon: Gavel,
      },
      {
        ...SITE_ROUTES.seniorCare,
        group: "Specialist services",
        icon: HandHeart,
      },
    ],
  },
  {
    ...SITE_ROUTES.altfDeals,
    label: "Deals",
    icon: Tags,
    menuColumns: 2,
    options: [
      {
        ...SITE_ROUTES.altfDeals,
        label: "All Deals",
        group: "Find deals",
        icon: Gem,
      },
      { ...SITE_ROUTES.exclusiveDeals, group: "Find deals", icon: Tags },
      { ...SITE_ROUTES.buySmart, group: "Find deals", icon: ShoppingBag },
      { ...SITE_ROUTES.saleLocator, group: "Find deals", icon: MapPin },
      { ...SITE_ROUTES.brandRatings, group: "Research", icon: ShieldCheck },
      { ...SITE_ROUTES.top1, group: "Research", icon: LayoutGrid },
      { ...SITE_ROUTES.top6, group: "Research", icon: LayoutGrid },
      { ...SITE_ROUTES.top9, group: "Research", icon: LayoutGrid },
      { ...SITE_ROUTES.top10, group: "Research", icon: LayoutGrid },
    ],
  },
  {
    ...SITE_ROUTES.academy,
    label: "Learn",
    icon: BookOpen,
    menuColumns: 3,
    options: [
      { ...SITE_ROUTES.academy, group: "Learn & follow", icon: GraduationCap },
      { ...SITE_ROUTES.blogs, group: "Learn & follow", icon: BookOpen },
      { ...SITE_ROUTES.news, group: "Learn & follow", icon: Newspaper },
      {
        ...SITE_ROUTES.trendingVideos,
        group: "Learn & follow",
        icon: Sparkles,
      },
      { ...SITE_ROUTES.locations, group: "Learn & follow", icon: MapPin },
      { ...SITE_ROUTES.factNet, group: "Knowledge", icon: Library },
      { ...SITE_ROUTES.bharatVirasat, group: "Knowledge", icon: Landmark },
      { ...SITE_ROUTES.seedreamPrompts, group: "Knowledge", icon: Sparkles },
      { ...SITE_ROUTES.docs, group: "Help & directory", icon: BookOpen },
      { ...SITE_ROUTES.requestTool, group: "Help & directory", icon: Wrench },
      { ...SITE_ROUTES.support, group: "Help & directory", icon: ShieldCheck },
      { ...SITE_ROUTES.faq, group: "Help & directory", icon: BookOpen },
      { ...SITE_ROUTES.siteMap, group: "Help & directory", icon: LayoutGrid },
      { ...SITE_ROUTES.status, group: "Help & directory", icon: Activity },
      {
        ...SITE_ROUTES.licenses,
        group: "Help & directory",
        icon: ScrollText,
      },
    ],
  },
  {
    ...SITE_ROUTES.labs,
    icon: FlaskConical,
    menuAlign: "right",
    menuColumns: 3,
    options: [
      { ...SITE_ROUTES.labs, group: "Create & experiment", icon: FlaskConical },
      { ...SITE_ROUTES.detour, group: "Explore the web", icon: Shuffle },
      { ...SITE_ROUTES.rabbithole, group: "Explore the web", icon: Compass },
      ...EXPERIENCE_ROUTE_OPTIONS,
    ],
  },
];

// ---------------------------------------------------------------------------
// Mobile information architecture
//
// Most visitors arrive from search on a single tool page and never see the home
// page, so the phone navigation is built around two jobs — "find another tool"
// and "search" — with everything else behind one "Explore" entry. These are
// registry values so the header stays a renderer.
// ---------------------------------------------------------------------------

/**
 * Thumb-reachable bottom bar. `sheet` entries open an overlay instead of
 * navigating, so browsing costs one tap from any page.
 */
export const MOBILE_TAB_ITEMS = [
  { id: "home", label: "Home", icon: House, ...SITE_ROUTES.home },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    sheet: "tools",
    href: SITE_ROUTES.tools.href,
    match: [
      "/tools",
      "/altfcalculators",
      "/altfloveimg",
      "/altflovepdf",
      "/exam-photo",
      "/altfatlas",
      "/lexicon",
    ],
  },
  {
    id: "search",
    label: "Search",
    icon: Search,
    sheet: "search",
    href: "/search",
    match: ["/search"],
  },
  { id: "more", label: "Explore", icon: LayoutGrid, sheet: "more" },
];

/**
 * Direct links to the tool pages that carry the most organic mobile traffic, so
 * a visitor who landed on one tool reaches the next one in two taps. Ordered by
 * Search Console landing-page volume; no counts or ratings are ever rendered.
 */
export const TOOL_QUICK_LINKS = [
  { label: "Step Counter", href: "/tools/all/step-counter", icon: Footprints },
  {
    label: "Age & Gender Detector",
    href: "/tools/all/age-gender-detector",
    icon: ScanFace,
  },
  {
    label: "Image Resizer",
    href: "/tools/all/image-resizer",
    icon: ImageIcon,
  },
  {
    label: "Image Compressor",
    href: "/tools/all/image-compressor",
    icon: ImageIcon,
  },
  {
    label: "BMI Calculator",
    href: "/tools/all/bmi-calculator",
    icon: HeartPulse,
  },
  {
    label: "Percentage Calculator",
    href: "/tools/all/percentage-calculator",
    icon: Calculator,
  },
  {
    label: "Unit Converter",
    href: "/tools/all/unit-converter",
    icon: Workflow,
  },
  {
    label: "Password Generator",
    href: "/tools/all/password-generator",
    icon: ShieldCheck,
  },
];

/**
 * Directory-level destinations shown above the category grid. Kept in step with
 * the desktop Tools menu's "Directories & apps" group — Exam Photo Specs was in
 * that group but missing here, so the phone could not reach it at all.
 */
export const TOOL_DIRECTORY_LINKS = [
  { ...SITE_ROUTES.tools, label: "All tools", icon: Wrench },
  { ...SITE_ROUTES.atlas, icon: Compass },
  { ...SITE_ROUTES.lexicon, icon: BookOpen },
  { ...SITE_ROUTES.calculators, icon: Calculator },
  { ...SITE_ROUTES.imageTools, icon: ImageIcon },
  { ...SITE_ROUTES.pdfTools, icon: FileText },
  { ...SITE_ROUTES.altfGames, icon: Gamepad2 },
  { ...SITE_ROUTES.apps, icon: Smartphone },
  { ...SITE_ROUTES.examPhoto, icon: GraduationCap },
  ...TOOL_UTILITY_ROUTE_OPTIONS,
];

/**
 * Everything that is not "tools" or "search", for the Explore sheet. Tools are
 * excluded because they have a dedicated sheet — keeping them here would
 * duplicate ~30 links in every page's HTML.
 */
export const MOBILE_MORE_NAV_ITEMS = PUBLIC_NAV_ITEMS.filter(
  (item) => item.href !== SITE_ROUTES.tools.href,
);

/** Support/utility routes pinned to the bottom of the Explore sheet. */
export const MOBILE_UTILITY_LINKS = [
  SITE_ROUTES.support,
  SITE_ROUTES.docs,
  SITE_ROUTES.requestTool,
  SITE_ROUTES.siteMap,
];

export const FOOTER_ROUTE_GROUPS = [
  {
    title: "Products",
    links: [
      SITE_ROUTES.products,
      SITE_ROUTES.ideas,
      SITE_ROUTES.backlinks,
      SITE_ROUTES.persona,
      SITE_ROUTES.signals,
      SITE_ROUTES.ideaLab,
      SITE_ROUTES.domainOps,
      SITE_ROUTES.flow,
    ],
  },
  {
    title: "Tools",
    links: [
      SITE_ROUTES.tools,
      SITE_ROUTES.atlas,
      SITE_ROUTES.lexicon,
      SITE_ROUTES.calculators,
      SITE_ROUTES.imageTools,
      SITE_ROUTES.pdfTools,
      SITE_ROUTES.examPhoto,
      SITE_ROUTES.embedWidgets,
      SITE_ROUTES.extensions,
      SITE_ROUTES.apps,
      SITE_ROUTES.desktop,
      SITE_ROUTES.automationLibrary,
    ],
  },
  {
    title: "Business",
    links: [
      SITE_ROUTES.businessOps,
      SITE_ROUTES.housingNeeds,
      SITE_ROUTES.housingServices,
      SITE_ROUTES.loans,
      SITE_ROUTES.insurance,
      SITE_ROUTES.tripFindBox,
    ],
  },
  {
    title: "Discover",
    links: [
      SITE_ROUTES.labs,
      SITE_ROUTES.detour,
      SITE_ROUTES.rabbithole,
      SITE_ROUTES.games,
      SITE_ROUTES.altfGames,
      SITE_ROUTES.academy,
      SITE_ROUTES.blogs,
      SITE_ROUTES.news,
      SITE_ROUTES.locations,
      SITE_ROUTES.trendingVideos,
    ],
  },
  {
    title: "Shopping",
    links: [
      SITE_ROUTES.altfDeals,
      SITE_ROUTES.exclusiveDeals,
      SITE_ROUTES.buySmart,
      SITE_ROUTES.brandRatings,
      SITE_ROUTES.top1,
      SITE_ROUTES.top6,
      SITE_ROUTES.top9,
      SITE_ROUTES.top10,
    ],
  },
  {
    title: "Company",
    links: [
      SITE_ROUTES.about,
      SITE_ROUTES.docs,
      SITE_ROUTES.contact,
      SITE_ROUTES.support,
      SITE_ROUTES.requestTool,
      SITE_ROUTES.status,
      SITE_ROUTES.siteMap,
      SITE_ROUTES.licenses,
    ],
  },
];

export const LEGAL_ROUTE_LINKS = [
  SITE_ROUTES.disclaimer,
  SITE_ROUTES.affiliate,
  SITE_ROUTES.cookie,
];

// Top tools surfaced as server-rendered links in the footer (every page) to push
// crawl equity to the highest-value canonical tool pages.
export const POPULAR_TOOL_LINKS = [
  { label: "Step Counter", href: "/tools/all/step-counter" },
  { label: "Age & Gender Detector", href: "/tools/all/age-gender-detector" },
  { label: "Image Resizer", href: "/tools/all/image-resizer" },
  { label: "Image Compressor", href: "/tools/all/image-compressor" },
  { label: "Unit Converter", href: "/tools/all/unit-converter" },
  { label: "Base Converter", href: "/tools/all/base-converter" },
  {
    label: "Scientific Notation Calculator",
    href: "/tools/all/scientific-notation-calculator",
  },
  { label: "Invoice Generator", href: "/tools/all/invoice-generator" },
  { label: "Web Speed Checker", href: "/tools/all/web-speed-checker" },
  { label: "Password Generator", href: "/tools/all/password-generator" },
  { label: "BMI Calculator", href: "/tools/all/bmi-calculator" },
  { label: "Age Calculator", href: "/tools/all/age-calculator" },
  { label: "Percentage Calculator", href: "/tools/all/percentage-calculator" },
  { label: "Markdown Preview", href: "/tools/all/markdown-preview" },
  { label: "Resume Maker", href: "/tools/all/resume-maker" },
  { label: "Meme Generator", href: "/tools/all/meme-generator" },
  { label: "Currency Converter", href: "/tools/all/currency-converter" },
  { label: "UUID Generator", href: "/tools/all/uuid-generator" },
  {
    label: "Aspect Ratio Calculator",
    href: "/tools/all/aspect-ratio-calculator",
  },
  { label: "Barcode Generator", href: "/tools/all/barcode-generator" },
  { label: "Lorem Ipsum Generator", href: "/tools/all/lorem-ipsum-generator" },
  { label: "Emoji Hub", href: "/tools/all/emoji-hub" },
  {
    label: "Lucky Number Generator",
    href: "/tools/all/lucky-number-generator",
  },
  { label: "Rock Paper Scissors", href: "/tools/all/rock-paper-scissors" },
  { label: "Snake Game", href: "/tools/all/snake-game" },
  { label: "Tic Tac Toe", href: "/tools/all/tic-tac-toe-game" },
  { label: "Joke Generator", href: "/tools/all/joke-generator" },
  { label: "Dice Roller (3D)", href: "/tools/all/dice-roller-3d" },
  { label: "Whack-a-Mole", href: "/tools/all/whack-a-mole" },
  { label: "Emoji Quiz", href: "/tools/all/emoji-quiz" },
  { label: "Memory Card Game", href: "/tools/all/memory-card-game" },
  { label: "Compliment Generator", href: "/tools/all/compliment-generator" },
];

const HIDDEN_PUBLIC_SHELL_PREFIXES = ["/search-eng"];
const HIDDEN_PUBLIC_SHELL_PATTERNS = [];

export function isPublicShellHidden(pathname = "") {
  return (
    HIDDEN_PUBLIC_SHELL_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || HIDDEN_PUBLIC_SHELL_PATTERNS.some((pattern) => pattern.test(pathname))
  );
}

export function isPublicRouteActive(pathname = "", route = {}) {
  const hrefs = [route.href, ...(route.match || [])].filter(Boolean);
  return hrefs.some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}
