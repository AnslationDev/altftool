import {
  BookOpen,
  GraduationCap,
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
      SITE_ROUTES.support,
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
