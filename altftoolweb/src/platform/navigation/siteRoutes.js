import {
  BookOpen,
  FileText,
  GraduationCap,
  ImageIcon,
  LayoutGrid,
  MapPin,
  Monitor,
  Newspaper,
  Puzzle,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tags,
  Trophy,
  Wrench,
} from "lucide-react";

export const SITE_ROUTES = {
  home: { label: "Home", href: "/" },
  tools: { label: "Tools", href: "/tools/all", match: ["/tools"] },
  extensions: { label: "Extensions", href: "/extensions" },
  exclusiveDeals: { label: "Exclusive Deals", href: "/exclusivedeals" },
  buySmart: { label: "BuySmart", href: "/buysmart" },
  saleLocator: { label: "Sale Locator", href: "/sale" },
  academy: { label: "Academy", href: "/academy" },
  blogs: { label: "Blog", href: "/blogs" },
  brandRatings: { label: "Brand Ratings", href: "/brandrating" },
  support: { label: "Support", href: "/supportsetting" },
  requestTool: { label: "Request a Tool", href: "/request-a-tool" },
  faq: { label: "FAQ", href: "/policypages/faq" },
  status: { label: "Status", href: "/status" },
  imageTools: { label: "Image Tools", href: "/altfloveimg" },
  pdfTools: { label: "PDF Tools", href: "/altflovepdf" },
  news: { label: "News", href: "/news" },
  desktop: { label: "Desktop Software", href: "/desktop" },
  trendingVideos: { label: "Trending Videos", href: "/trendingvids" },
  personality: { label: "Personality", href: "/personality" },
  top11: { label: "Top11", href: "/top11" },
  top9: { label: "Top9", href: "/top9" },
  about: { label: "About AltFTool", href: "/policypages/about" },
  contact: { label: "Contact", href: "/policypages/contact" },
  privacy: { label: "Privacy", href: "/policypages/privacy" },
  terms: { label: "Terms", href: "/policypages/termsandconditions" },
  disclaimer: { label: "Disclaimer", href: "/policypages/disclaimer" },
  affiliate: { label: "Affiliate", href: "/policypages/affiliate" },
  cookie: { label: "Cookie", href: "/policypages/cookie" },
};

export const PUBLIC_NAV_ITEMS = [
  { ...SITE_ROUTES.tools, icon: Wrench },
  { ...SITE_ROUTES.extensions, icon: Puzzle },
  {
    label: "Deals",
    icon: Tags,
    options: [
      { ...SITE_ROUTES.exclusiveDeals, icon: Tags },
      { ...SITE_ROUTES.buySmart, icon: ShoppingBag },
      { ...SITE_ROUTES.saleLocator, icon: MapPin },
    ],
  },
  {
    label: "Learn",
    icon: BookOpen,
    options: [
      { ...SITE_ROUTES.academy, icon: GraduationCap },
      { ...SITE_ROUTES.blogs, icon: BookOpen },
      { ...SITE_ROUTES.brandRatings, icon: ShieldCheck },
      { ...SITE_ROUTES.support, icon: Sparkles },
    ],
  },
  { ...SITE_ROUTES.news, icon: Newspaper },
  {
    label: "More",
    icon: LayoutGrid,
    options: [
      { ...SITE_ROUTES.desktop, icon: Monitor },
      { ...SITE_ROUTES.imageTools, icon: ImageIcon },
      { ...SITE_ROUTES.pdfTools, icon: FileText },
      { ...SITE_ROUTES.trendingVideos, icon: Sparkles },
      { ...SITE_ROUTES.personality, icon: Sparkles },
      { ...SITE_ROUTES.top11, icon: Trophy },
      { ...SITE_ROUTES.top9, icon: LayoutGrid },
      { ...SITE_ROUTES.about, icon: ShieldCheck },
    ],
  },
];

export const FOOTER_ROUTE_GROUPS = [
  {
    title: "Explore",
    links: [
      SITE_ROUTES.tools,
      SITE_ROUTES.extensions,
      SITE_ROUTES.desktop,
      SITE_ROUTES.trendingVideos,
      SITE_ROUTES.personality,
      SITE_ROUTES.top11,
      SITE_ROUTES.top9,
    ],
  },
  {
    title: "Commerce",
    links: [
      SITE_ROUTES.exclusiveDeals,
      SITE_ROUTES.buySmart,
      SITE_ROUTES.saleLocator,
      SITE_ROUTES.brandRatings,
    ],
  },
  {
    title: "Resources",
    links: [
      SITE_ROUTES.academy,
      SITE_ROUTES.blogs,
      SITE_ROUTES.news,
      SITE_ROUTES.faq,
      SITE_ROUTES.support,
      SITE_ROUTES.requestTool,
      SITE_ROUTES.status,
    ],
  },
  {
    title: "Company",
    links: [
      SITE_ROUTES.about,
      SITE_ROUTES.contact,
      SITE_ROUTES.privacy,
      SITE_ROUTES.terms,
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
  { label: "Image Resizer", href: "/tools/all/image-resizer" },
  { label: "Image Compressor", href: "/tools/all/image-compressor" },
  { label: "Unit Converter", href: "/tools/all/unit-converter" },
  { label: "Base Converter", href: "/tools/all/base-converter" },
  { label: "Scientific Notation Calculator", href: "/tools/all/scientific-notation-calculator" },
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
  { label: "Aspect Ratio Calculator", href: "/tools/all/aspect-ratio-calculator" },
  { label: "Barcode Generator", href: "/tools/all/barcode-generator" },
  { label: "Lorem Ipsum Generator", href: "/tools/all/lorem-ipsum-generator" },
  { label: "Emoji Hub", href: "/tools/all/emoji-hub" },
  { label: "Lucky Number Generator", href: "/tools/all/lucky-number-generator" },
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
  return hrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));
}
