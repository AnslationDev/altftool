// import HeroSectionBrand from "./(components)/HeroSectionBrand";
// import Categories from "./(components)/Categories";
// import PopularTopic from "./(components)/PopularTopic";
// import MethodologySection from "./(components)/MethodologySection";
// import Brand from "./(components)/Brand";
// import ConsumerRating from "./(components)/ConsumerRating";
// import TrustSecure from "./(components)/TrustSecure";
// import "./brandrating.css";
// import data from "./(data)/data.json";
// import JsonLd from "@/platform/seo/JsonLd";
// import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
// import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
// import {
//   createBreadcrumbJsonLd,
//   createCollectionPageJsonLd,
//   createItemListJsonLd,
//   createPageMetadata,
// } from "@/platform/seo/generateMetadata";

// const brandRatingRouteHub = getRouteHub("brandrating");
// const brandRatingDescription =
//   "Check brand ratings, product reviews, comparison signals, and tool scores on AltFTool. Compare brands and online tools with reliable context before choosing.";

// export async function generateMetadata() {
//   return createPageMetadata({
//     title: "Brand Rating & Reviews – Tool Scores | AltFTool",
//     description: brandRatingDescription,
//     path: "/brandrating",
//   });
// }


// function Page() {
//   const allCategory = data.brandRating || {};
//   return (
//     <>
//       <JsonLd
//         id="brandrating-schema"
//         data={[
//           createCollectionPageJsonLd({
//             path: "/brandrating",
//             name: "AltFTool Brand Rating",
//             description: brandRatingDescription,
//           }),
//           createItemListJsonLd({
//             path: "/brandrating",
//             name: "AltFTool brand rating next routes",
//             items: getRouteHubJsonLdItems("brandrating"),
//           }),
//           createBreadcrumbJsonLd([
//             { name: "Home", path: "/" },
//             { name: "Brand Rating", path: "/brandrating" },
//           ]),
//         ]}
//       />
//       <div className="brandrating-page route-page-shell w-full">
//         <header className="section pb-3 pt-8 sm:pt-10">
//           <p className="text-xs font-semibold uppercase tracking-wide text-(--primary)">
//             Independent comparisons
//           </p>
//           <h1 className="mt-2 text-2xl font-semibold text-(--foreground) sm:text-3xl">
//             Compare brands with confidence
//           </h1>
//           <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
//             Review ratings, features, offers, and comparison signals in one clear workspace.
//           </p>
//         </header>
//         <HeroSectionBrand />

//         <Categories data={allCategory} />
//         <PopularTopic data={allCategory} />
//         <MethodologySection />
//         <ConsumerRating />
//         <Brand />

//         <TrustSecure />
//       </div>
//       <RouteDiscoveryBand {...brandRatingRouteHub} />
//     </>


//   );
// }

// export default Page;



"use client";

/**
 * NOTE (temporary, first-pass file):
 *  - Requires `framer-motion`: run `npm install framer-motion` in the project.
 *  - This is a "use client" component so it can't also export `generateMetadata`
 *    (Next.js server-only export). Once we split this into real components,
 *    move metadata back to a server page.jsx that imports these as client
 *    children — everything below is disposable/organisational for now.
 *  - All arrays under TEMP DATA still need to be wired to categoryService /
 *    data.json / mockBrand.js.
 */

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ChevronRight,
  Star,
  Check,
  Mail,
  Newspaper,
  ShieldCheck,
  FlaskConical,
  Users2,
  Database,
  RefreshCcw,
  Sparkles,
  Bed,
  HeartPulse,
  CreditCard,
  Cpu,
  Gamepad2,
  Tv,
  Dumbbell,
  Home as HomeIcon,
  Umbrella,
  Code2,
  TrendingUp,
} from "lucide-react";
import "./brandrating.css";

/* ------------------------------------------------------------------ */
/*  TEMP DATA                                                          */
/* ------------------------------------------------------------------ */

const STATS = [
  { value: "2,400+", label: "Brands Reviewed" },
  { value: "180+", label: "Categories" },
  { value: "4.2M", label: "Monthly Visitors" },
  { value: "98K+", label: "Expert Reviews" },
];

const TRENDING_SEARCHES = ["NordVPN", "Nectar Mattress", "Chase Sapphire", "Saatva", "ExpressVPN"];

/** Category icon nodes orbiting the hero's central CTA. */
const ORBIT_NODES = [
  { label: "Technology", icon: Cpu, bg: "bg-slate-800" },
  { label: "VPN & Security", icon: ShieldCheck, bg: "bg-blue-600" },
  { label: "Mattress", icon: Bed, bg: "bg-violet-600" },
  { label: "Credit Cards", icon: CreditCard, bg: "bg-amber-500" },
  { label: "Health", icon: HeartPulse, bg: "bg-rose-500" },
  { label: "Insurance", icon: Umbrella, bg: "bg-sky-500" },
  { label: "Gaming", icon: Gamepad2, bg: "bg-emerald-600" },
  { label: "Streaming", icon: Tv, bg: "bg-red-600" },
];

/** Quick trust stats shown beneath the orbit ring. */
const ORBIT_STATS = [
  { value: "9.4", label: "Trust Index" },
  { value: "2,400+", label: "Brands Tested" },
  { value: "4.2M", label: "Shoppers Helped" },
];

/** Press outlets shown in the "Featured in" pill marquee (row scrolls right). */
const PRESS_MENTIONS = ["Forbes", "TechCrunch", "Yahoo Finance", "Business Insider", "PCMag", "Inc.", "The Verge", "Wired", "CNET"];

/** Rated brands shown in the partner pill marquee (row scrolls left, opposite the press row). */
const PARTNER_BRANDS = [
  { name: "NordVPN", initial: "N", bg: "bg-blue-600" },
  { name: "Saatva", initial: "S", bg: "bg-violet-600" },
  { name: "Chase Sapphire", initial: "C", bg: "bg-sky-600" },
  { name: "ExpressVPN", initial: "E", bg: "bg-slate-800" },
  { name: "Nectar", initial: "N", bg: "bg-emerald-600" },
  { name: "Capital One", initial: "C", bg: "bg-rose-600" },
  { name: "Surfshark", initial: "S", bg: "bg-teal-600" },
  { name: "DreamCloud", initial: "D", bg: "bg-indigo-600" },
  { name: "Discover It", initial: "D", bg: "bg-orange-600" },
  { name: "ProtonVPN", initial: "P", bg: "bg-purple-600" },
];

/** Standard weighted-scoring rubric used to justify every published score. */
const SCORING_RUBRIC = [
  { label: "Features & Performance", weight: 30, desc: "What the brand actually delivers, benchmarked against category leaders." },
  { label: "Value for Money", weight: 25, desc: "Price relative to what's included, measured against direct competitors." },
  { label: "Verified User Reviews", weight: 20, desc: "Aggregated ratings from 12 trusted review platforms, fraud-filtered." },
  { label: "Reliability & Support", weight: 15, desc: "Uptime, warranty terms, and real response times from support tickets." },
  { label: "Trust & Transparency", weight: 10, desc: "Clear pricing, honest marketing claims, and data-privacy practices." },
];

/** Rotating promo banners for the lead-gen carousel. */
const BRAND_BANNERS = [
  { name: "NordVPN", category: "VPN", headline: "86% off + 3 months free", cta: "Claim Deal", bg: "bg-blue-600", initial: "N" },
  { name: "Saatva", category: "Mattress", headline: "$400 off any mattress", cta: "Shop Now", bg: "bg-violet-600", initial: "S" },
  { name: "Chase Sapphire", category: "Credit Cards", headline: "Earn 80,000 bonus points", cta: "Apply Now", bg: "bg-sky-600", initial: "C" },
  { name: "Surfshark", category: "VPN", headline: "Unlimited devices, 82% off", cta: "Get Deal", bg: "bg-teal-600", initial: "S" },
  { name: "Capital One Venture", category: "Credit Cards", headline: "75,000 bonus miles on signup", cta: "Apply Now", bg: "bg-rose-600", initial: "C" },
  { name: "DreamCloud", category: "Mattress", headline: "$200 off + 2 free pillows", cta: "Shop Now", bg: "bg-indigo-600", initial: "D" },
];

const CATEGORIES = [
  { name: "Technology", count: "324 brands", brands: 324, icon: Cpu, trending: true, featured: true, blurb: "Software, gadgets, and tools compared side-by-side." },
  { name: "Finance", count: "89 brands", brands: 89, icon: TrendingUp },
  { name: "VPN & Security", count: "42 brands", brands: 42, icon: ShieldCheck, trending: true, featured: true, blurb: "Speed-tested, leak-checked, and independently verified." },
  { name: "Mattress", count: "31 brands", brands: 31, icon: Bed },
  { name: "Health", count: "96 brands", brands: 96, icon: HeartPulse },
  { name: "Insurance", count: "58 brands", brands: 58, icon: Umbrella },
  { name: "Credit Cards", count: "47 brands", brands: 47, icon: CreditCard },
  { name: "Software", count: "253 brands", brands: 253, icon: Code2 },
  { name: "Gaming", count: "67 brands", brands: 67, icon: Gamepad2, trending: true },
  { name: "Streaming", count: "29 brands", brands: 29, icon: Tv },
  { name: "Fitness", count: "54 brands", brands: 54, icon: Dumbbell },
  { name: "Home & Kitchen", count: "112 brands", brands: 112, icon: HomeIcon },
];

const MAX_CATEGORY_BRANDS = Math.max(...CATEGORIES.map((c) => c.brands));

const RANKING_FILTERS = ["All", "Technology", "Finance", "VPN", "Mattress", "Health", "Insurance"];

const TOP_PICKS = [
  {
    rank: "#1",
    name: "NordVPN",
    category: "VPN",
    badge: "Editor's Choice",
    badgeTone: "bg-(--primary)/12 text-(--primary)",
    promo: "86% Off Today",
    promoTone: "bg-emerald-100 text-emerald-700",
    score: "9.8",
    expertScore: "9.9",
    userScore: "9.7",
    reviews: "12,483 reviews",
    bullets: ["Fastest speeds tested", "6 simultaneous devices", "No logs policy verified"],
    footnote: "Best Overall · Top Security",
  },
  {
    rank: "#2",
    name: "Saatva",
    category: "Mattress",
    badge: "Premium Pick",
    badgeTone: "bg-sky-100 text-sky-700",
    promo: "$400 Off",
    promoTone: "bg-amber-100 text-amber-700",
    score: "9.7",
    expertScore: "9.8",
    userScore: "9.6",
    reviews: "8,241 reviews",
    bullets: ["Luxury hybrid construction", "White glove delivery", "365-night trial"],
    footnote: "Luxury · Best Comfort",
  },
  {
    rank: "#3",
    name: "Chase Sapphire",
    category: "Credit Cards",
    badge: "Best Value",
    badgeTone: "bg-violet-100 text-violet-700",
    promo: "80K Bonus Points",
    promoTone: "bg-amber-100 text-amber-700",
    score: "9.5",
    expertScore: "9.6",
    userScore: "9.4",
    reviews: "19,603 reviews",
    bullets: ["3x points on dining", "$300 travel credit", "No foreign fees"],
    footnote: "Best Rewards · Travel",
  },
];

const RANKING_TABLE = [
  { rank: "#4", name: "ExpressVPN", category: "VPN", score: "9.4" },
  { rank: "#5", name: "Nectar Mattress", category: "Mattress", score: "9.3" },
  { rank: "#6", name: "Capital One Venture", category: "Credit Cards", score: "9.2" },
  { rank: "#7", name: "Surfshark", category: "VPN", score: "9.1" },
  { rank: "#8", name: "DreamCloud", category: "Mattress", score: "9.0" },
  { rank: "#9", name: "Discover It", category: "Credit Cards", score: "8.9" },
  { rank: "#10", name: "ProtonVPN", category: "VPN", score: "8.8" },
];

const COMPARISONS = [
  { category: "VPN", views: "486 views", a: { name: "NordVPN", score: "9.8" }, b: { name: "ExpressVPN", score: "9.4" }, winner: "a" },
  { category: "Mattress", views: "339 views", a: { name: "Nectar", score: "9.3" }, b: { name: "Saatva", score: "9.7" }, winner: "b" },
  { category: "Credit Cards", views: "274 views", a: { name: "Capital One", score: "9.2" }, b: { name: "Chase Sapphire", score: "9.5" }, winner: "b" },
  { category: "VPN", views: "304 views", a: { name: "Surfshark", score: "9.1" }, b: { name: "ProtonVPN", score: "8.8" }, winner: "a" },
  { category: "Mattress", views: "154 views", a: { name: "DreamCloud", score: "9.0" }, b: { name: "Helix", score: "8.7" }, winner: "a" },
  { category: "Credit Cards", views: "134 views", a: { name: "Discover It", score: "8.9" }, b: { name: "Citi Double Cash", score: "8.6" }, winner: "a" },
];

const COMPARE_TABLE = {
  columns: ["NordVPN", "ExpressVPN", "Surfshark"],
  rows: [
    { label: "Overall Score", values: ["9.8", "9.4", "9.1"] },
    { label: "Expert Score", values: ["9.9", "9.5", "9.2"] },
    { label: "User Score", values: ["9.7", "9.3", "9.0"] },
    { label: "Price Range", values: ["$3.99/mo", "$6.67/mo", "$2.49/mo"] },
    { label: "Free Trial", values: [true, true, true] },
    { label: "24/7 Support", values: [true, true, true] },
    { label: "Money-back Guarantee", values: ["30-day", "30-day", "30-day"] },
    { label: "Mobile App", values: [true, true, true] },
  ],
};

const METHODOLOGY_STATS = [
  { value: "50+", label: "Point Scoring Rubric" },
  { value: "90", label: "Day Re-test Cycle" },
  { value: "3+", label: "Expert Reviewers" },
  { value: "0", label: "Paid Placements" },
];

const METHODOLOGY_STEPS = [
  { icon: FlaskConical, title: "Deep Research", desc: "Our analysts study 100+ data points per brand — specs, pricing, public reviews, and expert reports." },
  { icon: ShieldCheck, title: "Independent Testing", desc: "We purchase and test products ourselves. No samples, no sponsored positions." },
  { icon: Users2, title: "Expert Panel Review", desc: "A panel of 3+ industry specialists scores each brand on a standardized 50-point rubric." },
  { icon: Database, title: "User Data Integration", desc: "We aggregate verified purchase reviews from 12 trusted platforms to build user scores." },
  { icon: RefreshCcw, title: "Published & Monitored", desc: "Reviews go live after editorial sign-off. We re-test every 90 days to keep rankings current." },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Austin, TX",
    tag: "VPN",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=SarahM",
    text: "I was about to overpay for a VPN. Brand Rating showed me Surfshark had the same features for 60% less. Saved me $80 this year.",
  },
  {
    name: "James R.",
    location: "Chicago, IL",
    tag: "Mattress",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=JamesR",
    text: "The mattress comparison tool is incredible. Side-by-side scores for 15 brands. I bought the Saatva and couldn't be happier.",
  },
  {
    name: "Priya K.",
    location: "San Jose, CA",
    tag: "Credit Cards",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=PriyaK",
    text: "Finally a review site that actually explains WHY a product ranks where it does, instead of asking me to just trust their scores.",
  },
  {
    name: "David L.",
    location: "Seattle, WA",
    tag: "Software",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=DavidL",
    text: "Their comparison table saved me hours. I could see exactly what I was trading off between the top three tools.",
  },
  {
    name: "Maria G.",
    location: "Miami, FL",
    tag: "Insurance",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=MariaG",
    text: "I appreciate that they show their methodology up front. It's rare to find a ratings site this transparent.",
  },
];

/* ------------------------------------------------------------------ */
/*  ANIMATION HELPERS                                                  */
/* ------------------------------------------------------------------ */

const EASE = [0.16, 1, 0.3, 1];

/** Fades + slides a block up into place the moment it scrolls into view. */
function Reveal({ children, className = "", delay = 0, y = 60 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 44 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** A grid/row whose children reveal one after another as it scrolls in. */
function StaggerGroup({ children, className = "" }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Types `text` out character-by-character, pauses, deletes, repeats. */
function TypewriterText({ text, className = "" }) {
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    let timeout;
    if (phase === "typing") {
      if (display.length < text.length) {
        timeout = setTimeout(() => setDisplay(text.slice(0, display.length + 1)), 65);
      } else {
        timeout = setTimeout(() => setPhase("deleting"), 2400);
      }
    } else {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(text.slice(0, display.length - 1)), 32);
      } else {
        timeout = setTimeout(() => setPhase("typing"), 500);
      }
    }
    return () => clearTimeout(timeout);
  }, [display, phase, text]);

  return (
    <span className={className}>
      {display}
      <span className="inline-block w-[3px] h-[0.85em] bg-current ml-1 align-middle animate-pulse" />
    </span>
  );
}

/** Parses "2,400+" / "4.2M" / "98K+" into a countable number + suffix. */
function parseStat(raw) {
  const match = String(raw).match(/^([\d,.]+)(.*)$/);
  if (!match) return { number: 0, suffix: raw, decimals: 0 };
  const numStr = match[1].replace(/,/g, "");
  const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
  return { number: parseFloat(numStr), suffix: match[2] || "", decimals, hasComma: raw.includes(",") };
}

/** Counts up from 0 to the target value the moment it scrolls into view. */
function AnimatedCounter({ value, duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const { number, suffix, decimals, hasComma } = useMemo(() => parseStat(value), [value]);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(number * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, number, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : hasComma
      ? Math.round(display).toLocaleString("en-US")
      : Math.round(display).toString();

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

/** Category icons orbiting a central CTA — the hero's signature visual.
 *  The outer ring rotates continuously; each icon counter-rotates so it
 *  always reads upright, the same trick used for the orbit chips before it. */
function BrandOrbit({ nodes, radius = 168, ctaLabel = "Compare Brands", ctaHref = "#" }) {
  return (
    <div className="relative w-[360px] h-[360px] mx-auto">
      {/* outer ring guide */}
      <div className="absolute inset-0 rounded-full border border-dashed border-(--primary)/25" />

      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {nodes.map((node, i) => {
          const angle = (360 / nodes.length) * i;
          const rad = (angle * Math.PI) / 180;
          const x = radius * Math.cos(rad);
          const y = radius * Math.sin(rad);
          const Icon = node.icon;
          return (
            <motion.div
              key={node.label}
              className="absolute top-1/2 left-1/2"
              style={{ x, y }}
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            >
              <div
                className={`-translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full ${node.bg} shadow-lg flex items-center justify-center ring-4 ring-(--background)`}
                title={node.label}
              >
                <Icon size={22} className="text-white" strokeWidth={1.75} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* center CTA pill, stays fixed while the ring turns around it */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <Link
          href={ctaHref}
          className="flex items-center gap-2 h-12 px-6 rounded-full bg-(--primary) text-(--primary-foreground) font-semibold text-sm shadow-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Search size={16} /> {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

/** Seamless infinite horizontal scroller. Pass a single set of items —
 *  it duplicates them internally so the loop never shows a seam. */
function Marquee({ items, renderItem, duration = 26, reverse = false, gapClass = "gap-6", className = "" }) {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-x-hidden ${className}`}>
      <motion.div
        className={`flex w-max ${gapClass}`}
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration, ease: "linear" }}
      >
        {doubled.map((item, i) => renderItem(item, i))}
      </motion.div>
    </div>
  );
}

/** Single-slide promo carousel for brand offers — auto-advances, pauses on
 *  hover, and supports arrow + dot navigation so the CTA stays clickable
 *  (unlike a continuously-scrolling marquee). */
function BannerCarousel({ items, interval = 4500 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [paused, items.length, interval]);

  const go = (dir) => setIndex((i) => (i + dir + items.length) % items.length);
  const item = items[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[180px] sm:h-[200px] rounded-2xl overflow-hidden">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`absolute inset-0 ${item.bg} flex items-center justify-between px-6 sm:px-10`}
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-lg shrink-0">
              {item.initial}
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                Sponsored · {item.category}
              </span>
              <div className="text-white font-bold text-lg sm:text-2xl mt-1 max-w-[280px] sm:max-w-none">
                {item.name}: {item.headline}
              </div>
            </div>
          </div>
          <Link
            href="#"
            className="hidden sm:flex shrink-0 items-center gap-1.5 h-11 px-6 rounded-full bg-white text-(--foreground) font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            {item.cta} <ChevronRight size={15} />
          </Link>
        </motion.div>
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Previous offer"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-(--foreground) flex items-center justify-center shadow-md hover:bg-white transition-colors"
      >
        <ChevronRight size={16} className="rotate-180" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next offer"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-(--foreground) flex items-center justify-center shadow-md hover:bg-white transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to offer ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-(--primary)" : "w-1.5 bg-(--border)"}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Slow-drifting blurred blobs used both as the page-wide ambient
 *  background and inside the newsletter panel. */
function GradientBlobs({ className = "", variant = "page" }) {
  const blobs =
    variant === "page"
      ? [
          { cls: "bg-(--primary)/18 w-[520px] h-[520px]", pos: "top-[-160px] left-[-120px]", d: 22 },
          { cls: "bg-sky-400/14 w-[480px] h-[480px]", pos: "top-[520px] right-[-140px]", d: 26 },
          { cls: "bg-violet-400/10 w-[420px] h-[420px]", pos: "top-[1200px] left-[10%]", d: 30 },
        ]
      : [
          { cls: "bg-(--primary)/35 w-[320px] h-[320px]", pos: "-top-24 -left-16", d: 14 },
          { cls: "bg-sky-400/25 w-[280px] h-[280px]", pos: "-bottom-20 -right-10", d: 18 },
          { cls: "bg-emerald-400/20 w-[220px] h-[220px]", pos: "top-1/3 left-1/2", d: 16 },
        ];

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${b.cls} ${b.pos}`}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 25, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ repeat: Infinity, duration: b.d, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

function Page() {
  return (
    <div className="brandrating-page w-full relative">
      {/* Page-wide ambient background, sits behind everything */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <GradientBlobs variant="page" className="absolute inset-0" />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Promo / trust strip                                          */}
      {/* ------------------------------------------------------------ */}
      <div className="w-full bg-(--foreground) text-(--background) text-center text-xs sm:text-sm py-2 px-4">
        Independently tested, Expert-verified, Updated weekly ·{" "}
        <Link href="/brandrating/methodology" className="text-(--primary) font-semibold underline underline-offset-2">
          See our methodology
        </Link>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Hero                                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="section pt-10 sm:pt-16 pb-12 sm:pb-20 relative overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_0.85fr] gap-10 lg:gap-16 items-center relative z-10">
          {/* Left column */}
          <Reveal>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2 h-[30px] px-3 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-semibold mb-5"
            >
              <Sparkles size={13} /> THE #1 BRAND RATING PLATFORM IN THE US
            </motion.span>

            <h1 className="text-[2.4rem] sm:text-[3.2rem] lg:text-[3.6rem] font-extrabold leading-[1.05] text-(--foreground)">
              Find the best brands.
              <br />
              <TypewriterText text="Trusted by millions." className="text-(--primary)" />
            </h1>

            <p className="mt-5 text-base sm:text-lg text-(--muted-foreground) max-w-[520px]">
              We research, test, and rank every major brand so you don&apos;t have to. Unbiased expert reviews across 180+ categories.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-[560px]">
              <div className="flex-1 flex items-center gap-3 h-[54px] px-5 rounded-full bg-(--card) border border-(--border) shadow-sm">
                <Search size={18} className="text-(--muted-foreground)" />
                <input
                  type="text"
                  placeholder="Search brands, categories, comparisons..."
                  className="flex-1 bg-transparent outline-none text-sm text-(--foreground) placeholder:text-(--muted-foreground)"
                />
              </div>
              <button className="h-[54px] px-8 rounded-full bg-(--primary) text-(--primary-foreground) font-semibold text-sm hover:opacity-90 transition-opacity">
                Search
              </button>
            </div>

            {/* Trending tags */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-(--muted-foreground)">
              <span className="font-medium">Trending:</span>
              {TRENDING_SEARCHES.map((term) => (
                <Link key={term} href="#" className="hover:text-(--primary) underline underline-offset-2 decoration-(--border)">
                  {term}
                </Link>
              ))}
            </div>

            {/* Animated stats */}
            <div className="mt-10 grid grid-cols-4 gap-4 max-w-[520px]">
              {STATS.map((s, i) => (
                <div key={s.label}>
                  <AnimatedCounter
                    value={s.value}
                    duration={1.4 + i * 0.15}
                    className="text-xl sm:text-2xl font-extrabold text-(--foreground) tabular-nums"
                  />
                  <div className="text-xs text-(--muted-foreground) mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right column — category icons orbiting a central "Compare" CTA */}
          <div className="relative hidden lg:flex flex-col items-center gap-6">
            <Reveal delay={0.15}>
              <BrandOrbit nodes={ORBIT_NODES} ctaLabel="Compare Brands" ctaHref="#" />
            </Reveal>

            <Reveal delay={0.3} className="flex items-center gap-3 sm:gap-4">
              {ORBIT_STATS.map((s) => (
                <div
                  key={s.label}
                  className="brandrating-card-surface rounded-xl px-4 py-3 text-center min-w-[92px]"
                >
                  <AnimatedCounter value={s.value} duration={1.4} className="text-lg font-extrabold text-(--foreground) tabular-nums" />
                  <div className="text-[10px] text-(--muted-foreground) mt-0.5">{s.label}</div>
                </div>
              ))}
            </Reveal>

            <Reveal
              delay={0.4}
              className="flex items-center gap-2 h-[38px] px-4 rounded-full bg-(--foreground) text-(--background) text-xs font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              42 ratings updated today
              <Link href="#" className="text-(--primary) font-semibold ml-1">See all</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Featured in + partner brands — two pill marquees scrolling    */}
      {/* opposite directions                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="w-full border-y border-(--border) py-6 bg-(--card)/40 flex flex-col gap-4">
        <Reveal className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 flex items-center gap-6">
          <span className="text-[11px] tracking-wide uppercase text-(--muted-foreground) font-semibold shrink-0 w-[110px]">
            Featured in
          </span>
          <Marquee
            items={PRESS_MENTIONS}
            duration={30}
            reverse
            gapClass="gap-3"
            className="flex-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
            renderItem={(name, i) => (
              <span
                key={`${name}-${i}`}
                className="flex items-center gap-2 h-9 px-4 rounded-full border border-(--border) bg-(--background) text-sm font-semibold text-(--muted-foreground) whitespace-nowrap shrink-0"
              >
                <Newspaper size={14} className="text-(--primary)" />
                {name}
              </span>
            )}
          />
        </Reveal>

        <Reveal delay={0.05} className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 flex items-center gap-6">
          <span className="text-[11px] tracking-wide uppercase text-(--muted-foreground) font-semibold shrink-0 w-[110px]">
            Brands we rate
          </span>
          <Marquee
            items={PARTNER_BRANDS}
            duration={26}
            gapClass="gap-3"
            className="flex-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
            renderItem={(brand, i) => (
              <span
                key={`${brand.name}-${i}`}
                className="flex items-center gap-2 h-9 pl-1.5 pr-4 rounded-full border border-(--border) bg-(--background) text-sm font-semibold text-(--foreground) whitespace-nowrap shrink-0"
              >
                <span className={`w-6 h-6 rounded-full ${brand.bg} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                  {brand.initial}
                </span>
                {brand.name}
              </span>
            )}
          />
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Featured brand offers — lead-gen promo carousel                */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <Reveal className="flex items-end justify-between gap-4 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Limited-time offers</p>
            <h2 className="section-title text-2xl sm:text-3xl">Featured Brand Offers</h2>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <BannerCarousel items={BRAND_BANNERS} />
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Browse by Category — bento layout with relative-volume bars   */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <Reveal className="flex items-end justify-between gap-4 pb-8 sm:pb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Browse by category</p>
            <h2 className="section-title text-2xl sm:text-3xl">Every industry. Every brand.</h2>
          </div>
          <Link href="#" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-(--primary) whitespace-nowrap">
            View all 180+ categories <ChevronRight size={16} />
          </Link>
        </Reveal>

        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:auto-rows-[176px] lg:[grid-auto-flow:dense]">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const pct = Math.round((cat.brands / MAX_CATEGORY_BRANDS) * 100);
            return (
              <motion.div
                key={cat.name}
                variants={staggerItem}
                className={cat.featured ? "lg:col-span-2 lg:row-span-2" : ""}
              >
                <Link
                  href="#"
                  className={`group relative h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-(--border) bg-(--card) transition-all duration-300 hover:-translate-y-1 hover:border-(--primary)/40 hover:shadow-lg ${
                    cat.featured ? "p-6 sm:p-8" : "p-5"
                  }`}
                >
                  {/* watermark icon, purely decorative */}
                  <Icon
                    size={cat.featured ? 168 : 100}
                    strokeWidth={1}
                    className="absolute -right-6 -bottom-6 text-(--primary)/[0.07] group-hover:text-(--primary)/[0.12] transition-colors duration-300"
                    aria-hidden="true"
                  />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div
                      className={`rounded-xl bg-(--primary)/8 border border-(--primary)/15 flex items-center justify-center group-hover:bg-(--primary) transition-colors duration-300 ${
                        cat.featured ? "w-14 h-14" : "w-11 h-11"
                      }`}
                    >
                      <Icon
                        size={cat.featured ? 26 : 20}
                        className="text-(--primary) group-hover:text-(--primary-foreground) transition-colors duration-300"
                      />
                    </div>
                    {cat.trending && (
                      <span className="text-[10px] font-semibold px-2 py-[3px] rounded-full bg-(--primary)/10 text-(--primary) shrink-0">
                        Trending
                      </span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <div className={`font-semibold text-(--foreground) ${cat.featured ? "text-xl" : "text-base"}`}>
                      {cat.name}
                    </div>
                    {cat.featured && cat.blurb && (
                      <p className="text-sm text-(--muted-foreground) mt-1.5 max-w-[240px]">{cat.blurb}</p>
                    )}

                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-(--border) overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-(--primary)"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-(--muted-foreground)">{cat.count}</span>
                        <span className="text-xs font-semibold text-(--primary) flex items-center gap-1">
                          Explore <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </StaggerGroup>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Top Rated Brands Right Now                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Expert rankings</p>
            <h2 className="section-title text-2xl sm:text-3xl">Top Rated Brands Right Now</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-(--muted-foreground)">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Updated Today
          </div>
        </Reveal>

        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-6 [scrollbar-width:none] [-ms-overflow-style:none]">
          {RANKING_FILTERS.map((f, i) => (
            <button
              key={f}
              className={`shrink-0 h-[36px] px-4 rounded-full text-sm font-medium border transition-colors ${
                i === 0
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "border-(--border) text-(--muted-foreground) hover:bg-(--primary)/8"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <StaggerGroup className="grid md:grid-cols-3 gap-5">
          {TOP_PICKS.map((pick) => (
            <motion.div key={pick.name} variants={staggerItem} className="brandrating-card-surface rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-(--muted-foreground)">{pick.category}</span>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-(--foreground)">{pick.score}</span>
                  <span className="text-xs text-(--muted-foreground)"> /10</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2 py-[3px] rounded-full ${pick.badgeTone}`}>{pick.badge}</span>
                <span className={`text-[11px] font-semibold px-2 py-[3px] rounded-full ${pick.promoTone}`}>{pick.promo}</span>
              </div>

              <div className="font-bold text-lg text-(--foreground)">{pick.name}</div>

              <div className="flex items-center gap-4 text-xs text-(--muted-foreground)">
                <span>Expert Score <b className="text-(--foreground)">{pick.expertScore}</b></span>
                <span>User Score <b className="text-(--foreground)">{pick.userScore}</b></span>
              </div>
              <div className="text-xs text-(--muted-foreground)">{pick.reviews}</div>

              <ul className="flex flex-col gap-2">
                {pick.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-(--foreground)">
                    <Check size={14} className="text-emerald-500 shrink-0" /> {b}
                  </li>
                ))}
              </ul>

              <div className="text-[11px] text-(--muted-foreground)">{pick.footnote}</div>

              <button className="w-full h-[44px] rounded-full brandrating-action font-semibold text-sm">Visit Website</button>

              <div className="flex items-center justify-between text-xs">
                <Link href="#" className="text-(--primary) font-semibold">Read Review</Link>
                <button className="px-3 py-1 rounded-full border border-(--border) text-(--muted-foreground)">Compare</button>
              </div>
              <div className="text-[10px] text-(--muted-foreground)">Affiliate link — we may earn a commission</div>
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal className="mt-8 brandrating-panel rounded-2xl overflow-hidden" delay={0.05}>
          <div className="grid grid-cols-[60px_1fr_140px_90px_140px] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground) border-b border-(--border)">
            <span>Rank</span>
            <span>Brand</span>
            <span>Category</span>
            <span>Score</span>
            <span className="text-right">Actions</span>
          </div>
          {RANKING_TABLE.map((row) => (
            <div
              key={row.rank}
              className="grid grid-cols-[60px_1fr_140px_90px_140px] items-center px-5 py-4 border-b border-(--border) last:border-b-0 hover:bg-(--primary)/5 transition-colors"
            >
              <span className="text-sm font-semibold text-(--muted-foreground)">{row.rank}</span>
              <span className="text-sm font-semibold text-(--foreground)">{row.name}</span>
              <span className="text-sm text-(--muted-foreground)">{row.category}</span>
              <span className="text-sm font-bold text-(--foreground)">
                {row.score} <span className="text-xs font-normal text-(--muted-foreground)">/10</span>
              </span>
              <div className="flex items-center justify-end gap-2">
                <Link href="#" className="text-xs font-semibold text-(--primary)">Read Review</Link>
                <button className="text-xs px-3 py-1 rounded-full border border-(--border) text-(--muted-foreground)">Visit Site</button>
              </div>
            </div>
          ))}
        </Reveal>

        <div className="flex justify-center mt-6">
          <Link href="#" className="text-sm font-semibold text-(--primary) flex items-center gap-1">
            View full rankings for all 2,400+ brands <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Trending Comparisons                                          */}
      {/* ------------------------------------------------------------ */}
      <section className="w-full bg-(--card)/40 py-14 sm:py-20">
        <div className="section !py-0">
          <Reveal className="flex items-end justify-between gap-4 pb-8 sm:pb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Head-to-head</p>
              <h2 className="section-title text-2xl sm:text-3xl">Trending Comparisons</h2>
            </div>
            <Link href="#" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-(--primary)">
              All comparisons <ChevronRight size={16} />
            </Link>
          </Reveal>

          <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPARISONS.map((c, i) => (
              <motion.div key={i} variants={staggerItem} className="brandrating-card-surface rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-(--muted-foreground) mb-4">
                  <span className="font-semibold">{c.category}</span>
                  <span>{c.views}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {["a", "b"].map((key) => {
                    const item = c[key];
                    const isWinner = c.winner === key;
                    return (
                      <div
                        key={key}
                        className={`flex-1 rounded-xl border p-3 text-center ${
                          isWinner ? "border-(--primary) bg-(--primary)/6" : "border-(--border)"
                        }`}
                      >
                        <div className="text-sm font-semibold text-(--foreground) truncate">{item.name}</div>
                        <div className="text-lg font-extrabold text-(--foreground) mt-1">{item.score}</div>
                        {isWinner && <div className="text-[10px] font-semibold text-(--primary) mt-1">Winner ★</div>}
                      </div>
                    );
                  })}
                </div>
                <Link href="#" className="mt-4 flex items-center gap-1 text-xs font-semibold text-(--primary)">
                  View full comparison <ChevronRight size={13} />
                </Link>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Compare any brands instantly                                  */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <Reveal className="flex items-end justify-between gap-4 pb-8 sm:pb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Side-by-side</p>
            <h2 className="section-title text-2xl sm:text-3xl">Compare any brands instantly</h2>
          </div>
          <Link href="#" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-(--primary)">
            Open full comparison tool <ChevronRight size={16} />
          </Link>
        </Reveal>

        <Reveal delay={0.08} className="brandrating-panel rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-(--muted-foreground) px-5 py-4">Features</th>
                {COMPARE_TABLE.columns.map((col, i) => (
                  <th key={col} className={`text-left px-5 py-4 text-sm font-bold text-(--foreground) ${i === 0 ? "bg-(--primary)/8 rounded-t-xl" : ""}`}>
                    {col}
                    {i === 0 && (
                      <span className="ml-2 text-[10px] font-semibold px-2 py-[2px] rounded-full bg-(--primary) text-(--primary-foreground)">
                        #1 Pick
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_TABLE.rows.map((row, ri) => (
                <tr key={row.label} className="border-t border-(--border)">
                  <td className="px-5 py-4 text-sm text-(--muted-foreground)">{row.label}</td>
                  {row.values.map((val, ci) => (
                    <td
                      key={ci}
                      className={`px-5 py-4 text-sm font-medium text-(--foreground) ${ci === 0 ? "bg-(--primary)/6" : ""} ${
                        ri === COMPARE_TABLE.rows.length - 1 && ci === 0 ? "rounded-b-xl" : ""
                      }`}
                    >
                      {typeof val === "boolean" ? val ? <Check size={16} className="text-emerald-500" /> : "—" : val}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 py-5" />
                {COMPARE_TABLE.columns.map((col, i) => (
                  <td key={col} className="px-5 py-5">
                    <button
                      className={`w-full h-[42px] rounded-full text-sm font-semibold ${
                        i === 0 ? "brandrating-action" : "border border-(--border) text-(--foreground) hover:bg-(--primary)/6"
                      }`}
                    >
                      Visit Site
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Why millions trust our ratings                                */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Our standards</p>
            <h2 className="section-title text-2xl sm:text-3xl mb-4">Why millions trust our ratings</h2>
            <p className="text-sm text-(--muted-foreground) mb-8">
              We&apos;re not a PR outlet. Every ranking is earned, not bought. Here&apos;s exactly how we decide who wins.
            </p>

            <StaggerGroup className="grid grid-cols-2 gap-5 mb-8">
              {METHODOLOGY_STATS.map((s) => (
                <motion.div key={s.label} variants={staggerItem} className="brandrating-card-surface rounded-xl p-4">
                  <AnimatedCounter value={s.value} duration={1.2} className="text-2xl font-extrabold text-(--foreground) tabular-nums" />
                  <div className="text-xs text-(--muted-foreground) mt-1">{s.label}</div>
                </motion.div>
              ))}
            </StaggerGroup>

            <div className="brandrating-soft-surface rounded-xl p-4 text-xs text-(--muted-foreground)">
              <span className="font-semibold text-(--foreground)">Affiliate Disclosure: </span>
              We may earn commissions from links on this site, which never affects our scores or rankings.
            </div>
          </Reveal>

          <StaggerGroup className="flex flex-col gap-4">
            {METHODOLOGY_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.title} variants={staggerItem} className="flex items-start gap-4 brandrating-card-surface rounded-xl p-5">
                  <div className="w-10 h-10 rounded-full bg-(--foreground) text-(--background) flex items-center justify-center shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-(--foreground)">{step.title}</div>
                    <p className="text-sm text-(--muted-foreground) mt-1">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* How every score is justified — weighted scoring rubric        */}
      {/* ------------------------------------------------------------ */}
      <section className="w-full bg-(--card)/40 py-14 sm:py-20">
        <div className="section !py-0">
          <Reveal className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Score justification</p>
            <h2 className="section-title text-2xl sm:text-3xl mb-3">How we justify every score</h2>
            <p className="text-sm text-(--muted-foreground)">
              A 9.2 isn&apos;t a gut feeling — it&apos;s five weighted criteria added up and normalized onto a
              10-point scale, so brands within the same category can be compared fairly. Here&apos;s the exact
              formula behind every number on this site.
            </p>
          </Reveal>

          <StaggerGroup className="grid gap-4">
            {SCORING_RUBRIC.map((c) => (
              <motion.div
                key={c.label}
                variants={staggerItem}
                className="brandrating-card-surface rounded-xl p-5 grid sm:grid-cols-[220px_1fr_64px] items-center gap-3 sm:gap-6"
              >
                <div className="font-semibold text-(--foreground) text-sm">{c.label}</div>
                <div className="h-2 rounded-full bg-(--border) overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-(--primary)"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.weight}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: EASE }}
                  />
                </div>
                <div className="text-right sm:text-left font-extrabold text-(--foreground)">{c.weight}%</div>
                <p className="hidden sm:block sm:col-start-2 sm:col-span-2 text-xs text-(--muted-foreground) -mt-3">
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </StaggerGroup>

          <Reveal delay={0.1} className="mt-6 brandrating-soft-surface rounded-xl p-4 text-xs text-(--muted-foreground) max-w-3xl">
            <span className="font-semibold text-(--foreground)">Why this formula: </span>
            It mirrors how independent bodies like Consumer Reports and J.D. Power weight expert testing
            above single-source reviews, while still giving real user sentiment a meaningful share of the
            outcome — so no one factor can be gamed into an artificially high score.
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Testimonials — infinite marquee, avatar pinned top-left        */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <Reveal className="text-center pb-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--primary) mb-2">Real readers</p>
          <h2 className="section-title text-2xl sm:text-3xl">Trusted by everyday shoppers</h2>
        </Reveal>

        <Marquee
          items={TESTIMONIALS}
          duration={38}
          gapClass="gap-5"
          className="pt-6"
          renderItem={(t, i) => (
            <div key={`${t.name}-${i}`} className="relative shrink-0 w-[300px] sm:w-[340px] mt-5">
              <img
                src={t.avatar}
                alt={t.name}
                className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-(--card) ring-4 ring-(--background) shadow-md z-10"
              />
              <div className="brandrating-card-surface rounded-2xl p-6 pt-8 flex flex-col gap-4 h-full">
                <div className="flex gap-1 text-(--primary) pl-10">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-sm text-(--foreground) leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-auto pt-2">
                  <div className="text-sm font-semibold text-(--foreground)">{t.name}</div>
                  <div className="text-xs text-(--muted-foreground)">{t.location} · {t.tag}</div>
                </div>
              </div>
            </div>
          )}
        />
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Newsletter CTA — gradient blobs                                */}
      {/* ------------------------------------------------------------ */}
      <section className="section">
        <Reveal className="relative rounded-3xl bg-(--foreground) text-(--background) px-6 sm:px-14 py-14 sm:py-16 text-center overflow-hidden">
          <GradientBlobs variant="panel" className="absolute inset-0" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 h-[28px] px-3 rounded-full bg-white/10 text-xs font-semibold mb-5">
              <Mail size={13} /> WEEKLY DIGEST
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
              The best brands. Every week.
              <br />
              <span className="text-(--primary)">In your inbox.</span>
            </h2>
            <p className="text-sm text-white/70 max-w-md mx-auto mb-8">
              Weekly buying guides, top-rated picks, and exclusive deals from our expert team.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 h-[48px] px-5 rounded-full bg-white/10 text-sm text-white placeholder:text-white/50 outline-none border border-white/15"
              />
              <button
                type="submit"
                className="h-[48px] px-6 rounded-full bg-(--primary) text-(--primary-foreground) font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[11px] text-white/40 mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

export default Page;