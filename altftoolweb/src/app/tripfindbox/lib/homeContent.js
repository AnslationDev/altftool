// Firestore location for the editable TripFindBox home page content.
// Path: projects/altftool/tripfindbox/data/home/content  (single document)
export const HOME_DOC_PATH = ["projects", "altftool", "tripfindbox", "data", "home", "content"];

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";

// Default home page content. This mirrors the original hardcoded values so the
// site renders identically until an admin saves changes. It is also used by the
// admin editor as the seed when no document exists yet, and as a deep-merge
// fallback for any field an admin has not set.
export const DEFAULT_HOME_CONTENT = {
  header: {
    logoAlt: "TripFindBox",
    nav: [
      { label: "Discover", href: "#discover" },
      { label: "Insights", href: "#insights" },
      { label: "Support", href: "#support" },
    ],
    phone: "+1-714-782-7274",
    callSubtext: "CALL 24/7 FOR OUR BEST DEALS",
  },
  hero: {
    eyebrow: "Premium flight booking",
    title: "Find Your Perfect Flight & Travel Deal",
    lead: "Search real flights, compare fares, and plan a smoother trip with destination ideas built around your route.",
    trustBadges: [
      { iconKey: "ShieldCheck", label: "Verified route data" },
      { iconKey: "Star", label: "4.8 traveler rating" },
      { iconKey: "CreditCard", label: "Secure booking path" },
    ],
    reviewStrip: {
      trustedByCount: "100,000+",
      excellentLabel: "Excellent",
      filledStars: 4,
      reviewScore: "3.9",
      reviewCount: "89",
    },
    mobileCallText: "Call & Get Unpublished Flight Deals!",
  },
  insights: [
    {
      iconKey: "Headphones",
      title: "24/7 Travel Support",
      text: "TripFindBox support is ready when plans shift, flights change, or you need help comparing options.",
    },
    {
      iconKey: "Luggage",
      title: "Built for travelers",
      text: "Plan quick escapes, family holidays, and work trips with a booking flow designed around real journeys.",
    },
    {
      iconKey: "Globe2",
      title: "Smarter fares worldwide",
      text: "Explore flexible route ideas and fare alerts across popular domestic and international destinations.",
    },
  ],
  destinations: {
    sectionTitle: "Trending Destinations",
    items: [
      { city: "Bali", price: "Ocean villas from ₹42k", description: "Wellness stays, beaches, and slow mornings.", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80" },
      { city: "Dubai", price: "Desert skylines from ₹31k", description: "Luxury stopovers with skyline views.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80" },
      { city: "Paris", price: "Boutique stays from ₹58k", description: "Art walks, cafes, and refined weekends.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80" },
      { city: "Tokyo", price: "Neon routes from ₹67k", description: "Food, design, and electric city nights.", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80" },
      { city: "London", price: "Classic fares from ₹55k", description: "Culture-rich city breaks and flexible routes.", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80" },
      { city: "Singapore", price: "Smart breaks from ₹38k", description: "Clean city design, food trails, and gardens.", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80" },
      { city: "Rome", price: "Heritage trips from ₹61k", description: "Historic streets, cuisine, and warm evenings.", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80" },
      { city: "New York", price: "Urban escapes from ₹72k", description: "Iconic energy with premium flight options.", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80" },
      { city: "Goa", price: "Coastline hops from ₹7k", description: "Sunset beaches and relaxed stays.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80" },
      { city: "Jaipur", price: "Palace breaks from ₹6k", description: "Color, craft, and boutique hotels.", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80" },
      { city: "Kerala", price: "Backwaters from ₹11k", description: "Calm waterways and green retreats.", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80" },
      { city: "Kathmandu", price: "Mountain air from ₹18k", description: "Temples, trails, and highland views.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80" },
      { city: "Maldives", price: "Island fares from ₹74k", description: "Overwater stays and clear lagoons.", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80" },
      { city: "Swiss Alps", price: "Scenic routes from ₹88k", description: "Snow-light views and alpine rail days.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80" },
      { city: "Istanbul", price: "Crossroads from ₹44k", description: "Markets, domes, and layered history.", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80" },
      { city: "Seoul", price: "Culture routes from ₹52k", description: "Design, food, music, and fast city days.", image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80" },
    ],
  },
  about: {
    heading: "About Us",
    image: "/tripfindbox/images/about_tripnest.webp",
    imageAlt: "Traveler with luggage enjoying a TripFindBox beach getaway",
    paragraphs: [
      "TripFindBox was created for travelers who want flight planning to feel clear, quick, and genuinely useful. We help you explore routes, compare fare options, and discover trip ideas without forcing you through a crowded booking experience.",
      "Whether you are planning a family holiday, a last-minute business visit, or a quiet weekend escape, TripFindBox keeps the important details easy to scan. From route choices and flexible dates to cabin preferences and traveler counts, the search flow is designed around real trip decisions.",
      "We focus on the moments that matter before a booking: where you are flying, when you can travel, how many people are going, and which cabin feels right. The experience stays simple so travelers can compare choices without losing context.",
      "Our goal is simple: make travel discovery feel smoother from the first search. You can review options, adjust your route, and move toward booking with a calm, modern interface built for everyday travelers.",
      "With curated route ideas, helpful travel prompts, and a booking-first layout, TripFindBox gives every journey a clearer starting point. It is built for people who want inspiration and practical flight choices in the same place.",
    ],
  },
  newsletter: {
    kicker: "Exclusive travel perks, delivered to you",
    title: "Sign Up For Our",
    titleHighlight: "Newsletter",
    copy: "Get access to members-only fares, handpicked flight deals, latest discounts, and private promo alerts.",
    placeholder: "Enter your email address",
    buttonText: "Subscribe Now",
    proof: "10,000+ travelers already subscribed.",
    image: "/tripfindbox/images/signup_tripnest.jpg",
    imageAlt: "TripFindBox newsletter travel perks with luggage and flight inspiration",
    perks: [
      { iconKey: "HandCoins", label: "Members only Fares", text: "Access special fares available just for members." },
      { iconKey: "Luggage", label: "Handpicked Travel Deals", text: "Curated deals on flights and holiday routes." },
      { iconKey: "BadgePercent", label: "Latest Sales & Discounts", text: "Be the first to know about the best offers." },
      { iconKey: "CreditCard", label: "Exclusive Promo Codes", text: "Unlock private promo codes for future trips." },
    ],
  },
  footer: {
    newsletterHeading: "Subscribe to our Newsletter",
    newsletterText: "Get latest offers from TripFindBox",
    consentText:
      "I would like to receive SMS and email from TripFindBox with curated fare alerts, destination ideas, seasonal promotions, and travel planning updates.",
    columns: [
      {
        title: "Quick Links",
        items: [
          { label: "Security", href: "/security" },
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Baggage Fees", href: "/baggage-fees" },
          { label: "Terms & Conditions", href: "/terms-and-conditions" },
          { label: "Cancellation Policy", href: "/cancellation-policy" },
          { label: "About Us", href: "/about-us" },
          { label: "Contact Us", href: "/contact-us" },
          { label: "Taxes & Fees", href: "/taxes-and-fees" },
          { label: "FAQs", href: "/faqs" },
          { label: "Sitemap", href: "/site-map" },
          { label: "Blogs", href: "/blogs" },
        ],
      },
      {
        title: "Top Airlines",
        items: [
          { label: "American Airlines", href: "/american-airlines-flights" },
          { label: "United Airlines", href: "/united-airlines-flights" },
          { label: "Frontier Airlines", href: "/frontier-airlines-flights" },
          { label: "Air Canada", href: "/air-canada-flights" },
          { label: "Alaska Airlines", href: "/alaska-airlines-flights" },
          { label: "Turkish Airlines", href: "/turkish-airlines-flights" },
        ],
      },
      {
        title: "Travel Deals",
        items: [
          { label: "Top Airline Deals", href: "/top-airline-deals" },
          { label: "Last Minute Flights", href: "/last-minute-flight-deals" },
          { label: "One Way Flights", href: "/one-way-flight-deals" },
          { label: "Round Trip Flights", href: "/round-trip-flight-deals" },
          { label: "Cheap Domestic Flights", href: "/domestic-flight-deals" },
          { label: "Cheap International Flights", href: "/international-flight-deals" },
        ],
      },
      {
        title: "Top Destinations",
        items: [
          { label: "Flights to Miami", href: "/flights-to-miami" },
          { label: "Flights to Las Vegas", href: "/flights-to-las-vegas" },
          { label: "Flights to Los Angeles", href: "/flights-to-los-angeles" },
          { label: "Flights to Orlando", href: "/flights-to-orlando" },
          { label: "Flights to New York", href: "/flights-to-new-york" },
        ],
      },
    ],
    social: {
      facebook: "https://www.facebook.com",
      instagram: "https://www.instagram.com",
      x: "https://x.com",
      linkedin: "https://www.linkedin.com",
    },
    disclaimer:
      "TripFindBox is an independent travel planning and flight search experience. The information shown on this website is provided for general travel research, route comparison, and booking-flow assistance only. Sample fares, availability, airline details, baggage notes, taxes, fees, policies, schedules, and destination guidance may change without notice and should be confirmed with the final travel provider before any booking decision is made. TripFindBox does not guarantee fare availability, final pricing, airline policy accuracy, or ticket confirmation until the live booking process is completed. For support or route questions, write to support@tripfindbox.com.",
    copyright: "© 2021 - 2026 TripFindBox. All Rights Reserved.",
  },
};

// Deep-merge a stored value over the defaults so that any missing/blank field
// falls back to the default. Arrays from the stored value replace defaults
// entirely (so removing a list item in admin actually removes it).
function mergeContent(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    return override === undefined || override === null ? base : override;
  }
  if (base && typeof base === "object" && override && typeof override === "object") {
    const out = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = mergeContent(base[key], override[key]);
    }
    return out;
  }
  return override === undefined || override === null || override === "" ? base : override;
}

// Decode a single Firestore REST "Value" object into a plain JS value.
function decodeValue(value) {
  if (value === null || value === undefined) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields || {});
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeValue);
  return null;
}

function decodeFields(fields) {
  const out = {};
  for (const key of Object.keys(fields)) out[key] = decodeValue(fields[key]);
  return out;
}

// Server-side read of the editable home content via the Firestore REST API
// (avoids the client SDK's gRPC transport, which is unreliable during SSR).
// Falls back safely to defaults on any error or missing document.
export async function fetchHomeContent() {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) return DEFAULT_HOME_CONTENT;

  const docPath = HOME_DOC_PATH.join("/");
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/${docPath}?key=${FIREBASE_API_KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_HOME_CONTENT; // 404 = not created yet
    const json = await res.json();
    if (!json.fields) return DEFAULT_HOME_CONTENT;
    return mergeContent(DEFAULT_HOME_CONTENT, decodeFields(json.fields));
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}
