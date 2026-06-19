import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db } from "@/lib/firebase";

// Same Firestore location the public TripFindBox site reads from.
// projects/altftool/tripfindbox/data/home/content  (single document)
const HOME_DOC_PATH = ["projects", "altftool", "tripfindbox", "data", "home", "content"];

const homeDocRef = () => doc(db, ...HOME_DOC_PATH);

// Default content mirrors the public site's defaults so the editor is seeded
// with the exact current copy when no document exists yet.
export const DEFAULT_HOME_CONTENT = {
  header: {
    logoAlt: "TripFindBox",
    nav: [
      { label: "Discover", href: "#discover" },
      { label: "Insights", href: "#insights" },
      { label: "Support", href: "#support" },
    ],
    phone: "+1-714-782-7278",
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
    { iconKey: "Headphones", title: "24/7 Travel Support", text: "TripFindBox support is ready when plans shift, flights change, or you need help comparing options." },
    { iconKey: "Luggage", title: "Built for travelers", text: "Plan quick escapes, family holidays, and work trips with a booking flow designed around real journeys." },
    { iconKey: "Globe2", title: "Smarter fares worldwide", text: "Explore flexible route ideas and fare alerts across popular domestic and international destinations." },
  ],
  destinations: {
    sectionTitle: "Trending Destinations",
    items: [
      ["Bali", "Ocean villas from ₹42k", "Wellness stays, beaches, and slow mornings.", "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80"],
      ["Dubai", "Desert skylines from ₹31k", "Luxury stopovers with skyline views.", "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80"],
      ["Paris", "Boutique stays from ₹58k", "Art walks, cafes, and refined weekends.", "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80"],
      ["Tokyo", "Neon routes from ₹67k", "Food, design, and electric city nights.", "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80"],
      ["London", "Classic fares from ₹55k", "Culture-rich city breaks and flexible routes.", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80"],
      ["Singapore", "Smart breaks from ₹38k", "Clean city design, food trails, and gardens.", "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80"],
      ["Rome", "Heritage trips from ₹61k", "Historic streets, cuisine, and warm evenings.", "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80"],
      ["New York", "Urban escapes from ₹72k", "Iconic energy with premium flight options.", "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80"],
      ["Goa", "Coastline hops from ₹7k", "Sunset beaches and relaxed stays.", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80"],
      ["Jaipur", "Palace breaks from ₹6k", "Color, craft, and boutique hotels.", "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80"],
      ["Kerala", "Backwaters from ₹11k", "Calm waterways and green retreats.", "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80"],
      ["Kathmandu", "Mountain air from ₹18k", "Temples, trails, and highland views.", "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80"],
      ["Maldives", "Island fares from ₹74k", "Overwater stays and clear lagoons.", "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80"],
      ["Swiss Alps", "Scenic routes from ₹88k", "Snow-light views and alpine rail days.", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80"],
      ["Istanbul", "Crossroads from ₹44k", "Markets, domes, and layered history.", "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80"],
      ["Seoul", "Culture routes from ₹52k", "Design, food, music, and fast city days.", "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80"],
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

// Selectable lucide icon keys exposed in the editor for icon fields.
export const ICON_OPTIONS = [
  "ShieldCheck",
  "Star",
  "CreditCard",
  "Headphones",
  "Luggage",
  "Globe2",
  "HandCoins",
  "BadgePercent",
  "Plane",
  "Sparkles",
];

export async function fetchHome() {
  const snap = await getDoc(homeDocRef());
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveHome(content) {
  await setDoc(
    homeDocRef(),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function uploadHomeImage(file) {
  const storage = getStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const imageRef = ref(storage, `tripfindbox/home/${Date.now()}-${safeName}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
