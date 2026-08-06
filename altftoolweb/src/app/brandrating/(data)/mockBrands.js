// Mock brand data for the brandrating UI.
//
// PURPOSE: fills every subcategory to 5 complete brands until the real data is
// entered through the admin panel (Consumer Rating module).
//
// HOW REPLACEMENT WORKS: a mock brand is shown ONLY while no admin brand with
// the same name exists in the same subcategory. The moment you add e.g.
// "NordVPN" via the admin panel, the mock NordVPN disappears automatically.
// Same rule for mock FAQs (matched by question text).
//
// TO DISABLE ALL MOCK DATA: set MOCK_DATA_ENABLED = false (or delete this file
// and its imports in service/service.js).

export const MOCK_DATA_ENABLED = false;

// Obvious test entries hidden from the UI until cleaned up in the admin panel.
export const MOCK_HIDDEN_BRAND_NAMES = ["google abshj"];

// Ranking fixes for existing admin brands with gap rankings. Applied only while
// the stored ranking still equals "from" — re-rank in the admin panel and the
// override stops applying.
export const MOCK_RANK_OVERRIDES = {
    "gozney": { from: 10, to: 3 },
    "all-clad": { from: 6, to: 4 },
    "delivita flow": { from: 4, to: 5 },
    "nectar": { from: 7, to: 5 },
};

// Shared icons for enrichment entries (same lucide style the admin panel stores).
const I = {
    shield: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
    truck: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/></svg>",
    moon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>",
    flame: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"/></svg>",
    award: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
    wrench: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
    phone: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>",
    heart: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
};

// Fills gaps on EXISTING admin brands whose data is thin (1 feature, no link,
// tagline equal to the name). Each field applies only while the admin value is
// missing/thin — enter real data in the admin panel and it wins automatically.
// Keyed by trimmed lowercase brand name.
export const MOCK_BRAND_ENRICH = {
    "saatva": {
        heading: "Saatva Classic — Handcrafted Luxury Innerspring",
        brandLink: "https://saatva.com",
        description:
            "Saatva Classic pairs a durable dual-coil innerspring core with a plush Euro pillow top and a patented lumbar zone, delivering hotel-level comfort with free white-glove delivery and a full-year home trial.",
        features: [
            { id: 90101, icon: I.shield, heading: "Lumbar Zone Support", description: "Patented center zone keeps the spine aligned" },
            { id: 90102, icon: I.award, heading: "Dual-Coil Durability", description: "Coil-on-coil core resists sagging for years" },
            { id: 90103, icon: I.truck, heading: "White-Glove Delivery", description: "Free in-room setup and old mattress removal" },
            { id: 90104, icon: I.moon, heading: "365-Night Trial", description: "A full year to decide at home, risk free" },
        ],
    },
    "nectar": {
        heading: "Nectar Memory Foam — Year-Long Trial Value Pick",
        brandLink: "https://nectarsleep.com",
        description:
            "Nectar's gel memory foam contours closely to relieve pressure while a breathable cover keeps the surface cool, and every mattress is backed by a 365-night trial with a forever warranty.",
        features: [
            { id: 90201, icon: I.moon, heading: "Gel Memory Foam", description: "Close-contouring pressure relief for joints" },
            { id: 90202, icon: I.heart, heading: "365-Night Trial", description: "Sleep on it a full year before deciding" },
            { id: 90203, icon: I.shield, heading: "Forever Warranty", description: "Lifetime coverage for as long as you own it" },
            { id: 90204, icon: I.award, heading: "Cooling Cover", description: "Heat-wicking quilted cover sleeps cool" },
        ],
    },
    "nutrisystem": {
        heading: "NutriSystem — Portion-Controlled Meal Delivery",
        brandLink: "https://nutrisystem.com",
        description:
            "NutriSystem ships portion-controlled breakfasts, lunches, dinners, and snacks designed for steady weight loss, with flexible plans, high-protein menus, and coaching support built in.",
        features: [
            { id: 90301, icon: I.heart, heading: "Portion-Controlled Meals", description: "Calorie-smart meals with zero guesswork" },
            { id: 90302, icon: I.truck, heading: "Home Delivery", description: "Four weeks of food shipped to your door" },
            { id: 90303, icon: I.phone, heading: "Coaching Support", description: "Dietitian-backed guidance when you need it" },
            { id: 90304, icon: I.award, heading: "High-Protein Menu", description: "150+ menu items that keep you full" },
        ],
    },
    "all-clad": {
        features: [
            { id: 90401, icon: I.flame, heading: "Rotating Stone", description: "Self-turning stone bakes evenly edge to edge" },
            { id: 90402, icon: I.award, heading: "Stainless Build", description: "Premium stainless body built to last" },
            { id: 90403, icon: I.wrench, heading: "Simple Controls", description: "Set-and-forget dial for consistent results" },
        ],
    },
    "gozney": {
        features: [
            { id: 90501, icon: I.award, heading: "Restaurant Quality", description: "Professional-grade dome oven for the garden" },
            { id: 90502, icon: I.flame, heading: "Dual-Fuel Ready", description: "Switch between wood fire and gas burner" },
            { id: 90503, icon: I.shield, heading: "Built-In Thermometer", description: "Digital readout takes out the guesswork" },
        ],
    },
    "delivita flow": {
        features: [
            { id: 90601, icon: I.flame, heading: "Fast Heating", description: "Ready to bake in around 25 minutes" },
            { id: 90602, icon: I.award, heading: "Versatile Cooking", description: "Pizza, roasts, and breads in one oven" },
            { id: 90603, icon: I.heart, heading: "Handmade in the UK", description: "Hand-finished shell in signature colours" },
        ],
    },
    "oneassist": {
        heading: "OneAssist — Complete Home Appliance Protection",
        brandLink: "https://oneassist.in",
        description:
            "OneAssist protects your home appliances against breakdowns with doorstep repairs by verified technicians, quick digital claims, and 24x7 assistance across major Indian cities.",
        features: [
            { id: 90701, icon: I.shield, heading: "All-Brand Coverage", description: "One plan covers appliances of any brand" },
            { id: 90702, icon: I.wrench, heading: "Doorstep Repairs", description: "Verified technicians come to your home" },
            { id: 90703, icon: I.phone, heading: "24x7 Assistance", description: "Round-the-clock claim and service support" },
            { id: 90704, icon: I.award, heading: "Easy Claims", description: "Raise and track claims fully online" },
        ],
    },
};

// NO RATINGS HERE, DELIBERATELY. Every entry below used to carry a "rating"
// literal between 4.1 and 4.7 — NordVPN 4.7, Saatva 4.5, Ooni Koda 16 4.7 and
// so on. applyMockBrands() merges these straight into the Firestore brand list
// (when MOCK_DATA_ENABLED was true), so those numbers rendered as star rows on
// /brandrating/<category> and each brand's detail page, visually identical to a
// rating an editor actually entered in the admin panel. Nobody scored them and
// no source was cited, so a reader had no way to tell the difference.
//
// A mock brand may describe a real product; it may not publish a verdict on it.
// If a brand should carry a rating, enter it in the admin panel — the real
// record replaces its mock twin by name (see the merge rule above), and the
// cards render stars only when a rating is present.
export const MOCK_BRANDS = [
    {
        "id": "mock-nordvpn",
        "isMock": true,
        "categoryId": "vrLNRSpBH5fhyI5Qy7rA",
        "subCategoryId": "p3RVElJK1vLfAnb6naMh",
        "name": "NordVPN",
        "heading": "NordVPN — Fast, Audited No-Logs VPN",
        "description": "NordVPN is one of the most widely used VPN services, with thousands of servers in 100+ countries, independently audited no-logs policy, and consistently fast WireGuard-based speeds. Threat Protection blocks ads, trackers, and malicious sites even when the VPN is off.",
        "ranking": 1,
        "brandLink": "https://nordvpn.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Servers: 6,000+ in 111 countries",
            "Protocol: NordLynx (WireGuard), OpenVPN",
            "Devices: 10 simultaneous connections",
            "No-logs: Independently audited (Deloitte)",
            "Extras: Threat Protection, Meshnet, Dark Web Monitor"
        ],
        "additionalBenefit": [
            {
                "id": 1001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "Audited no-logs"
            },
            {
                "id": 1002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "text": "NordLynx speed"
            },
            {
                "id": 1003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "text": "111 countries"
            }
        ],
        "feature": [
            {
                "id": 1101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "Threat Protection",
                "description": "Blocks ads, trackers, and malware at the network level"
            },
            {
                "id": 1102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "heading": "WireGuard Speeds",
                "description": "NordLynx protocol keeps streaming and downloads fast"
            },
            {
                "id": 1103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "heading": "Global Coverage",
                "description": "6,000+ servers across 111 countries for reliable access"
            },
            {
                "id": 1104,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>",
                "heading": "Kill Switch",
                "description": "Cuts traffic instantly if the VPN connection drops"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-ooni-koda-16",
        "isMock": true,
        "categoryId": "1iwshZ6pEKQhE1WTybfd",
        "subCategoryId": "leQ5Ipxo1fBw9a50yuJS",
        "name": "Ooni Koda 16",
        "heading": "Ooni Koda 16 — Gas-Powered 16\" Pizza Oven",
        "description": "The Ooni Koda 16 is a gas-powered outdoor pizza oven that reaches 500°C in about 20 minutes and cooks a 16-inch Neapolitan-style pizza in roughly 60 seconds. Its fold-flat legs and one-piece shell make it easy to move, while the L-shaped burner delivers even edge-to-edge heat.",
        "ranking": 2,
        "brandLink": "https://ooni.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Max temperature: 500°C / 950°F",
            "Pizza size: Up to 16 inches",
            "Fuel: Propane gas (L-shaped flame burner)",
            "Heat-up time: ~20 minutes",
            "Weight: 18.2 kg with fold-flat legs"
        ],
        "additionalBenefit": [
            {
                "id": 2001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"/></svg>",
                "text": "60-second bake"
            },
            {
                "id": 2002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "text": "Instant gas ignition"
            },
            {
                "id": 2003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "3-year warranty"
            }
        ],
        "feature": [
            {
                "id": 2101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z\"/></svg>",
                "heading": "500°C in 20 Minutes",
                "description": "True Neapolitan char without a wood fire to manage"
            },
            {
                "id": 2102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "heading": "16-inch Stone",
                "description": "Extra-large cordierite stone fits family-size pizzas"
            },
            {
                "id": 2103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "heading": "One-Knob Control",
                "description": "Instant ignition and simple flame adjustment"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-helix-midnight",
        "isMock": true,
        "categoryId": "L1s8qQYMeNH9Ft3P9XJp",
        "subCategoryId": "FuMw8OZRhGeAjrWZxdka",
        "name": "Helix Midnight",
        "heading": "Helix Midnight — Hybrid Mattress Example",
        "description": "The Helix Midnight is shown here as an illustrative catalogue entry. Verify its current construction, trial, shipping, and warranty terms on the official product page before making a decision.",
        "ranking": 3,
        "brandLink": "https://helixsleep.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Type: Hybrid (memory foam + wrapped coils)",
            "Firmness: Medium (5.5/10)",
            "Height: 11.5 inches",
            "Trial: 100 nights, free returns",
            "Warranty: 10-15 years depending on model"
        ],
        "additionalBenefit": [
            {
                "id": 3001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>",
                "text": "100-night trial"
            },
            {
                "id": 3002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/></svg>",
                "text": "Free shipping"
            },
            {
                "id": 3003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "10-year warranty"
            }
        ],
        "feature": [
            {
                "id": 3101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>",
                "heading": "Side-Sleeper Comfort",
                "description": "Memory foam cradles shoulders and relieves pressure points"
            },
            {
                "id": 3102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "Zoned Coil Support",
                "description": "Firmer coils under the hips keep the spine aligned"
            },
            {
                "id": 3103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "heading": "Breathable Cover",
                "description": "Soft-touch cover keeps the sleep surface cool"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-purple-mattress",
        "isMock": true,
        "categoryId": "L1s8qQYMeNH9Ft3P9XJp",
        "subCategoryId": "FuMw8OZRhGeAjrWZxdka",
        "name": "Purple Mattress",
        "heading": "Purple — GelFlex Grid for Cool, Pressure-Free Sleep",
        "description": "Purple's signature GelFlex Grid flexes under shoulders and hips while staying supportive everywhere else, and its open channels let air move freely so hot sleepers stay cool. The grid instantly adapts as you change positions, which makes Purple a favorite for combination sleepers.",
        "ranking": 4,
        "brandLink": "https://purple.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1631049035182-249067d7618e?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Type: GelFlex Grid over responsive foam",
            "Firmness: Medium (6/10)",
            "Height: 9.25 inches",
            "Trial: 100 nights",
            "Warranty: 10 years"
        ],
        "additionalBenefit": [
            {
                "id": 4001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "text": "Instant response"
            },
            {
                "id": 4002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>",
                "text": "Sleeps cool"
            },
            {
                "id": 4003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/></svg>",
                "text": "100-night trial"
            }
        ],
        "feature": [
            {
                "id": 4101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "heading": "GelFlex Grid",
                "description": "Flexes at pressure points and springs back instantly"
            },
            {
                "id": 4102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>",
                "heading": "Temperature Neutral",
                "description": "1,400+ open air channels prevent heat build-up"
            },
            {
                "id": 4103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "Durable Design",
                "description": "Grid material outlasts traditional memory foam"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-noom",
        "isMock": true,
        "categoryId": "FMTW62O9U2T3kNogoV0f",
        "subCategoryId": "ObmK3jVpy2IwY4vu16OE",
        "name": "Noom",
        "heading": "Noom — Psychology-Based Weight Loss Program",
        "description": "Noom pairs daily 5-10 minute psychology lessons with food logging, a color-based food system, and optional 1:1 coaching to build sustainable habits instead of crash dieting. No foods are off-limits — the program focuses on calorie density and behavior change backed by CBT principles.",
        "ranking": 2,
        "brandLink": "https://noom.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Format: App-based daily lessons + food logging",
            "Approach: CBT-informed behavior change",
            "Coaching: Personal coach and group support",
            "Food rules: No banned foods, color system",
            "Trial: Low-cost intro trial available"
        ],
        "additionalBenefit": [
            {
                "id": 5001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "text": "Habit focused"
            },
            {
                "id": 5002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>",
                "text": "1:1 coaching"
            },
            {
                "id": 5003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "text": "No banned foods"
            }
        ],
        "feature": [
            {
                "id": 5101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "heading": "Psychology First",
                "description": "Daily micro-lessons address the why behind eating habits"
            },
            {
                "id": 5102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>",
                "heading": "Human Coaching",
                "description": "Certified coaches keep you accountable week to week"
            },
            {
                "id": 5103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "heading": "Flexible Eating",
                "description": "Color system guides choices without cutting food groups"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-weightwatchers",
        "isMock": true,
        "categoryId": "FMTW62O9U2T3kNogoV0f",
        "subCategoryId": "ObmK3jVpy2IwY4vu16OE",
        "name": "WeightWatchers",
        "heading": "WeightWatchers (WW) — Points-Based Flexible Dieting",
        "description": "WeightWatchers assigns every food a Points value based on calories, protein, fiber, and added sugar, giving you a daily budget that flexes around real life. With decades of published results, workshops, and a large member community, WW remains one of the most proven structured diet programs.",
        "ranking": 3,
        "brandLink": "https://weightwatchers.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1467453678174-768ec283a940?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Format: Points system + app tracking",
            "Support: Workshops, community, and coaching tiers",
            "Evidence: Clinically studied for 60+ years",
            "Food rules: 200+ ZeroPoint foods",
            "Extras: Recipe database and barcode scanner"
        ],
        "additionalBenefit": [
            {
                "id": 6001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "text": "Proven results"
            },
            {
                "id": 6002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "text": "Community support"
            },
            {
                "id": 6003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "text": "ZeroPoint foods"
            }
        ],
        "feature": [
            {
                "id": 6101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "heading": "Points Budget",
                "description": "One simple number guides every meal decision"
            },
            {
                "id": 6102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "heading": "Workshops",
                "description": "In-person and virtual groups keep motivation high"
            },
            {
                "id": 6103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "heading": "ZeroPoint Foods",
                "description": "Fruits, veggies, and lean proteins never need tracking"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-factor",
        "isMock": true,
        "categoryId": "FMTW62O9U2T3kNogoV0f",
        "subCategoryId": "ObmK3jVpy2IwY4vu16OE",
        "name": "Factor",
        "heading": "Factor — Chef-Prepared Ready-to-Eat Meal Plans",
        "description": "Factor delivers fully cooked, dietitian-designed meals that go from fridge to table in about two minutes — no prep, no cleanup. Weekly menus cover keto, calorie-smart, protein-plus, and vegan options, making it a practical choice for people who want results without cooking.",
        "ranking": 4,
        "brandLink": "https://factor75.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Format: Fresh, fully prepared meal delivery",
            "Plans: 6-18 meals per week",
            "Menus: Keto, calorie-smart, protein-plus, vegan",
            "Prep time: ~2 minutes (heat and eat)",
            "Extras: Dietitian consultation included"
        ],
        "additionalBenefit": [
            {
                "id": 7001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/></svg>",
                "text": "Weekly delivery"
            },
            {
                "id": 7002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
                "text": "2-minute meals"
            },
            {
                "id": 7003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "text": "Dietitian designed"
            }
        ],
        "feature": [
            {
                "id": 7101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
                "heading": "Zero Prep",
                "description": "Chef-cooked meals ready after two minutes in the microwave"
            },
            {
                "id": 7102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "heading": "Dietitian Approved",
                "description": "Every menu is built by registered dietitians"
            },
            {
                "id": 7103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/></svg>",
                "heading": "Flexible Plans",
                "description": "Pause, skip, or change meal counts any week"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-trifecta-nutrition",
        "isMock": true,
        "categoryId": "FMTW62O9U2T3kNogoV0f",
        "subCategoryId": "ObmK3jVpy2IwY4vu16OE",
        "name": "Trifecta Nutrition",
        "heading": "Trifecta — Organic Macro-Balanced Meal Delivery",
        "description": "Trifecta ships organic, macro-balanced meals nationwide with plans for keto, paleo, high-protein, and plant-based eating. Popular with athletes and fitness-focused users, it combines clean ingredients with an app that tracks macros, weight, and progress photos.",
        "ranking": 5,
        "brandLink": "https://trifectanutrition.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Format: Organic prepared meal delivery",
            "Plans: Keto, paleo, high-protein, plant-based",
            "Sourcing: Organic produce, grass-fed proteins",
            "App: Macro and progress tracking included",
            "Shipping: All 50 US states"
        ],
        "additionalBenefit": [
            {
                "id": 8001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "text": "Organic sourcing"
            },
            {
                "id": 8002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "text": "Athlete trusted"
            },
            {
                "id": 8003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/></svg>",
                "text": "Nationwide shipping"
            }
        ],
        "feature": [
            {
                "id": 8101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/></svg>",
                "heading": "Clean Ingredients",
                "description": "Organic produce and sustainably sourced proteins"
            },
            {
                "id": 8102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "heading": "Macro Balanced",
                "description": "Meals engineered for training and recovery goals"
            },
            {
                "id": 8103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>",
                "heading": "Progress App",
                "description": "Track macros, weight, and photos in one place"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-expressvpn",
        "isMock": true,
        "categoryId": "vrLNRSpBH5fhyI5Qy7rA",
        "subCategoryId": "p3RVElJK1vLfAnb6naMh",
        "name": "ExpressVPN",
        "heading": "ExpressVPN — Premium Speed with TrustedServer",
        "description": "ExpressVPN runs its entire network on RAM-only TrustedServer technology, so no data ever touches a hard drive, and its Lightway protocol connects in a fraction of a second. With apps for every platform and consistently reliable streaming access, it is the go-to premium pick.",
        "ranking": 2,
        "brandLink": "https://expressvpn.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Servers: 105 countries",
            "Protocol: Lightway, OpenVPN, IKEv2",
            "Devices: 8 simultaneous connections",
            "Security: RAM-only TrustedServer network",
            "Audits: Multiple independent security audits"
        ],
        "additionalBenefit": [
            {
                "id": 9001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "text": "Lightway protocol"
            },
            {
                "id": 9002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "RAM-only servers"
            },
            {
                "id": 9003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "text": "105 countries"
            }
        ],
        "feature": [
            {
                "id": 9101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "TrustedServer",
                "description": "Entire fleet runs in RAM — wiped on every reboot"
            },
            {
                "id": 9102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></svg>",
                "heading": "Instant Connect",
                "description": "Lightway establishes tunnels in under a second"
            },
            {
                "id": 9103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "heading": "Streaming Ready",
                "description": "Reliable access to major streaming platforms abroad"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-surfshark",
        "isMock": true,
        "categoryId": "vrLNRSpBH5fhyI5Qy7rA",
        "subCategoryId": "p3RVElJK1vLfAnb6naMh",
        "name": "Surfshark",
        "heading": "Surfshark — Unlimited Devices, Best Value",
        "description": "Surfshark is the value leader among premium VPNs: one subscription covers unlimited devices, and features like CleanWeb ad-blocking, MultiHop double-VPN, and rotating IP come standard. Independent audits and RAM-only servers back up the low price with real security.",
        "ranking": 3,
        "brandLink": "https://surfshark.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484807352052-23338990c6c6?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Servers: 100 countries, RAM-only",
            "Devices: Unlimited simultaneous connections",
            "Protocol: WireGuard, OpenVPN, IKEv2",
            "Extras: CleanWeb, MultiHop, rotating IP",
            "Audits: Independently audited no-logs"
        ],
        "additionalBenefit": [
            {
                "id": 10001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "text": "Unlimited devices"
            },
            {
                "id": 10002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "text": "Best value"
            },
            {
                "id": 10003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "Audited no-logs"
            }
        ],
        "feature": [
            {
                "id": 10101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "heading": "Whole-Family Cover",
                "description": "One plan protects every device you own"
            },
            {
                "id": 10102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "CleanWeb",
                "description": "Blocks ads, trackers, and phishing attempts"
            },
            {
                "id": 10103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/></svg>",
                "heading": "Rotating IP",
                "description": "Changes your IP regularly without dropping the tunnel"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-proton-vpn",
        "isMock": true,
        "categoryId": "vrLNRSpBH5fhyI5Qy7rA",
        "subCategoryId": "p3RVElJK1vLfAnb6naMh",
        "name": "Proton VPN",
        "heading": "Proton VPN — Swiss Privacy with a Real Free Tier",
        "description": "Built by the CERN-born team behind Proton Mail, Proton VPN pairs strict Swiss privacy law with open-source, independently audited apps. Its Secure Core routing defends against network attacks, and it remains the only top-tier VPN with a genuinely unlimited free plan.",
        "ranking": 4,
        "brandLink": "https://protonvpn.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Jurisdiction: Switzerland",
            "Apps: Open source, independently audited",
            "Free tier: Unlimited data, no ads",
            "Security: Secure Core multi-hop routing",
            "Protocol: WireGuard, OpenVPN, Stealth"
        ],
        "additionalBenefit": [
            {
                "id": 11001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>",
                "text": "Swiss privacy"
            },
            {
                "id": 11002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "Open source"
            },
            {
                "id": 11003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "text": "Free tier"
            }
        ],
        "feature": [
            {
                "id": 11101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/></svg>",
                "heading": "Secure Core",
                "description": "Routes traffic through hardened Swiss data centers first"
            },
            {
                "id": 11102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "Open-Source Apps",
                "description": "Every client is public code, verified by audits"
            },
            {
                "id": 11103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/></svg>",
                "heading": "Honest Free Plan",
                "description": "Unlimited free bandwidth with no ads or data sale"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-cyberghost",
        "isMock": true,
        "categoryId": "vrLNRSpBH5fhyI5Qy7rA",
        "subCategoryId": "p3RVElJK1vLfAnb6naMh",
        "name": "CyberGhost",
        "heading": "CyberGhost — Streaming-Optimized Server Network",
        "description": "CyberGhost operates one of the largest VPN networks with 11,000+ servers, including dedicated streaming and gaming servers labeled by platform. Long-term plans are among the cheapest in the industry and come with a generous 45-day money-back guarantee.",
        "ranking": 5,
        "brandLink": "https://cyberghostvpn.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484807352052-23338990c6c6?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Servers: 11,000+ in 100 countries",
            "Devices: 7 simultaneous connections",
            "Specialty: Streaming and gaming servers",
            "Guarantee: 45-day money-back",
            "Protocol: WireGuard, OpenVPN, IKEv2"
        ],
        "additionalBenefit": [
            {
                "id": 12001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "text": "11,000+ servers"
            },
            {
                "id": 12002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "text": "Budget friendly"
            },
            {
                "id": 12003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/></svg>",
                "text": "45-day refund"
            }
        ],
        "feature": [
            {
                "id": 12101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"/><path d=\"M2 12h20\"/></svg>",
                "heading": "Specialty Servers",
                "description": "Servers tuned and labeled for streaming platforms"
            },
            {
                "id": 12102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "heading": "Low Long-Term Price",
                "description": "Multi-year plans cost a fraction of rivals"
            },
            {
                "id": 12103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/></svg>",
                "heading": "45-Day Guarantee",
                "description": "Longest risk-free trial window in the industry"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-liberty-home-guard",
        "isMock": true,
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA",
        "name": "Liberty Home Guard",
        "heading": "Liberty Home Guard — Coverage Example",
        "description": "Liberty Home Guard is shown here as an illustrative catalogue entry. Verify current plan coverage, add-ons, service fees, availability, and claims terms on the official provider site.",
        "ranking": 2,
        "brandLink": "https://libertyhomeguard.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Plans: Appliance Guard, Systems Guard, Total Home Guard",
            "Add-ons: 40+ optional coverages",
            "Service fee: $65-$125 per claim",
            "Workmanship guarantee: 60 days",
            "Availability: 50 US states"
        ],
        "additionalBenefit": [
            {
                "id": 13001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "text": "Plan details available"
            },
            {
                "id": 13002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
                "text": "40+ add-ons"
            },
            {
                "id": 13003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
                "text": "Fast claims"
            }
        ],
        "feature": [
            {
                "id": 13101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "heading": "Service Terms",
                "description": "Review current service and claims terms before purchase"
            },
            {
                "id": 13102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
                "heading": "Custom Coverage",
                "description": "Tailor plans with 40+ optional add-ons"
            },
            {
                "id": 13103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
                "heading": "Quick Claims",
                "description": "File online in minutes, day or night"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-american-home-shield",
        "isMock": true,
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA",
        "name": "American Home Shield",
        "heading": "American Home Shield — Most Experienced Provider",
        "description": "American Home Shield founded the home warranty industry in 1971 and still leads it, covering breakdowns from normal wear, rust, and even improper past installs that many rivals exclude. Flexible service fees let you trade a higher monthly premium for cheaper claim visits.",
        "ranking": 3,
        "brandLink": "https://ahs.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Founded: 1971 — industry pioneer",
            "Plans: ShieldSilver, ShieldGold, ShieldPlatinum",
            "Service fee: $100 or $125 (your choice)",
            "Coverage: Wear, rust, corrosion, unknown pre-existing",
            "Workmanship guarantee: 30 days"
        ],
        "additionalBenefit": [
            {
                "id": 14001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "text": "Since 1971"
            },
            {
                "id": 14002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "Covers rust & wear"
            },
            {
                "id": 14003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "text": "Flexible fees"
            }
        ],
        "feature": [
            {
                "id": 14101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "Broadest Coverage",
                "description": "Pays on issues most competitors exclude"
            },
            {
                "id": 14102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "heading": "Choose Your Fee",
                "description": "Pick the premium/service-fee balance that fits"
            },
            {
                "id": 14103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "heading": "50+ Years Strong",
                "description": "The original and largest home warranty company"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-choice-home-warranty",
        "isMock": true,
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA",
        "name": "Choice Home Warranty",
        "heading": "Choice Home Warranty — Simple Plans, Fair Prices",
        "description": "Choice Home Warranty keeps things simple with two straightforward plans and a flat $100 service fee, making budgeting easy. Its large contractor network dispatches technicians quickly, and new members frequently get the first month free on annual plans.",
        "ranking": 4,
        "brandLink": "https://choicehomewarranty.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Plans: Basic Plan, Total Plan",
            "Service fee: Flat $100 per claim",
            "Network: 25,000+ contractors nationwide",
            "Claims: 24/7 online and phone filing",
            "Promo: First month free on annual plans"
        ],
        "additionalBenefit": [
            {
                "id": 15001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "text": "Flat $100 fee"
            },
            {
                "id": 15002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
                "text": "24/7 claims"
            },
            {
                "id": 15003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
                "text": "25k contractors"
            }
        ],
        "feature": [
            {
                "id": 15101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"22\"/><path d=\"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6\"/></svg>",
                "heading": "Predictable Cost",
                "description": "One flat service fee — no surprise pricing tiers"
            },
            {
                "id": 15102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/></svg>",
                "heading": "Round-the-Clock",
                "description": "File claims online or by phone 24/7/365"
            },
            {
                "id": 15103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
                "heading": "Big Tech Network",
                "description": "Large vetted contractor base speeds up repairs"
            }
        ],
        "status": "active"
    },
    {
        "id": "mock-first-american-home-warranty",
        "isMock": true,
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA",
        "name": "First American Home Warranty",
        "heading": "First American — Best for Older Appliances",
        "description": "First American Home Warranty stands out for covering appliances regardless of age and including improper installation or maintenance issues that void other contracts. Backed by a Fortune 500 title-insurance parent, it offers strong upgrade options like First Class Service.",
        "ranking": 5,
        "brandLink": "https://homewarranty.firstam.com",
        "country": "US",
        "logo": "",
        "images": [
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop"
        ],
        "specification": [
            "Plans: Starter, Essential, Premium",
            "Service fee: $100-$125",
            "Coverage: Appliances of any age",
            "Extras: First Class Service upgrade",
            "Parent: First American Financial (Fortune 500)"
        ],
        "additionalBenefit": [
            {
                "id": 16001,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "text": "Any-age coverage"
            },
            {
                "id": 16002,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "text": "Fortune 500 backed"
            },
            {
                "id": 16003,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
                "text": "Install issues OK"
            }
        ],
        "feature": [
            {
                "id": 16101,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z\"/></svg>",
                "heading": "No Age Limits",
                "description": "Old appliances are covered like new ones"
            },
            {
                "id": 16102,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>",
                "heading": "Forgiving Terms",
                "description": "Improper install or maintenance won't void claims"
            },
            {
                "id": 16103,
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.477 12.89 17 22l-5-3-5 3 1.523-9.11\"/></svg>",
                "heading": "Stable Backing",
                "description": "Part of a Fortune 500 financial services group"
            }
        ],
        "status": "active"
    }
];

export const MOCK_FAQS = [
    {
        "id": "mock-faq-1",
        "isMock": true,
        "question": "Gas, wood, or electric — which pizza oven should I choose?",
        "answer": "Gas ovens offer the best balance of convenience and high heat; wood-fired ovens deliver authentic smoky flavor but need fire management; electric ovens are the safest indoor option and heat evenly, though most top out at lower temperatures than gas or wood.",
        "categoryId": "1iwshZ6pEKQhE1WTybfd",
        "subCategoryId": "leQ5Ipxo1fBw9a50yuJS"
    },
    {
        "id": "mock-faq-2",
        "isMock": true,
        "question": "Can I use a pizza oven indoors?",
        "answer": "Only electric pizza ovens are safe indoors. Gas and wood-fired ovens produce carbon monoxide and must be used outside in a well-ventilated space, away from walls and overhangs.",
        "categoryId": "1iwshZ6pEKQhE1WTybfd",
        "subCategoryId": "leQ5Ipxo1fBw9a50yuJS"
    },
    {
        "id": "mock-faq-3",
        "isMock": true,
        "question": "How is a home warranty different from home insurance?",
        "answer": "Home insurance covers damage from events like fire, storms, and theft, while a home warranty covers repair or replacement of home systems and appliances that fail from normal wear and tear — like an AC compressor or a water heater giving out.",
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA"
    },
    {
        "id": "mock-faq-4",
        "isMock": true,
        "question": "What is usually not covered by a home warranty?",
        "answer": "Pre-existing conditions found in inspections, cosmetic damage, code violations, and items still under manufacturer warranty are commonly excluded. Always review the sample contract for coverage caps per item before you buy.",
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA"
    },
    {
        "id": "mock-faq-5",
        "isMock": true,
        "question": "How do I file a home warranty claim?",
        "answer": "File online or by phone with your provider, pay the flat service fee, and the company dispatches a vetted technician. If the covered item can't be repaired, the provider replaces it or offers a payout toward a replacement.",
        "categoryId": "ufsoUl4G6ZrrBUc9KSTC",
        "subCategoryId": "t5DLO1iiL5lLEWhu8UrA"
    },
    {
        "id": "mock-faq-6",
        "isMock": true,
        "question": "How do I choose the right diet plan for me?",
        "answer": "Pick a plan that matches how you actually live: choose coaching-based apps if you want accountability, meal delivery if you don't want to cook, and flexible points or macro systems if you eat out often. The best plan is the one you can follow for months, not weeks.",
        "categoryId": "FMTW62O9U2T3kNogoV0f",
        "subCategoryId": "ObmK3jVpy2IwY4vu16OE"
    },
    {
        "id": "mock-faq-7",
        "isMock": true,
        "question": "Do diet plans include exercise guidance?",
        "answer": "Many modern programs include movement content — Noom and WeightWatchers offer activity tracking and workouts, while meal-delivery services like Factor and Trifecta focus on nutrition and pair well with any separate training routine.",
        "categoryId": "FMTW62O9U2T3kNogoV0f",
        "subCategoryId": "ObmK3jVpy2IwY4vu16OE"
    },
    {
        "id": "mock-faq-8",
        "isMock": true,
        "question": "What mattress firmness should I choose?",
        "answer": "Side sleepers usually prefer medium-soft to medium (4-6/10) for shoulder relief; back sleepers do best on medium-firm (6-7/10); stomach sleepers need firmer support (7-8/10) to keep hips from sinking. Heavier bodies generally benefit from going one step firmer.",
        "categoryId": "L1s8qQYMeNH9Ft3P9XJp",
        "subCategoryId": "FuMw8OZRhGeAjrWZxdka"
    }
];
