// ============================================================================
// Top3 — Mock Data Layer
// ----------------------------------------------------------------------------
// This file is the single source of truth for all editorial content.
// To connect a real backend later, replace the exports in this file with
// async fetchers that mirror the same shape. No UI component needs to change.
// ============================================================================

// ---------------------------------------------------------------------------
// Cover imagery (stock photography, licensed via Pexels)
// ---------------------------------------------------------------------------
const IMG = {
  earbuds: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1200",
  earbuds2: "https://images.pexels.com/photos/3394653/pexels-photo-3394653.jpeg?auto=compress&cs=tinysrgb&w=1200",
  earbuds3: "https://images.pexels.com/photos/3756985/pexels-photo-3756985.jpeg?auto=compress&cs=tinysrgb&w=1200",
  keyboard: "https://images.pexels.com/photos/6623763/pexels-photo-6623763.jpeg?auto=compress&cs=tinysrgb&w=1200",
  suv1: "https://images.pexels.com/photos/14782635/pexels-photo-14782635.jpeg?auto=compress&cs=tinysrgb&w=1600",
  suv2: "https://images.pexels.com/photos/11808155/pexels-photo-11808155.jpeg?auto=compress&cs=tinysrgb&w=1600",
  suv3: "https://images.pexels.com/photos/11482784/pexels-photo-11482784.jpeg?auto=compress&cs=tinysrgb&w=1600",
  coffee1: "https://images.pexels.com/photos/21404851/pexels-photo-21404851.jpeg?auto=compress&cs=tinysrgb&w=1200",
  coffee2: "https://images.pexels.com/photos/36573009/pexels-photo-36573009.jpeg?auto=compress&cs=tinysrgb&w=1200",
  yosemite: "https://images.pexels.com/photos/37777350/pexels-photo-37777350.jpeg?auto=compress&cs=tinysrgb&w=1600",
  elcap: "https://images.pexels.com/photos/19977696/pexels-photo-19977696.jpeg?auto=compress&cs=tinysrgb&w=1600",
  valley: "https://images.pexels.com/photos/27400430/pexels-photo-27400430.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

// ---------------------------------------------------------------------------
// Rankings
// ---------------------------------------------------------------------------
const baseRankings = [
  {
    id: "r-wireless-earbuds",
    slug: "wireless-earbuds",
    title: "The 3 Best Wireless Earbuds",
    kicker: "Audio · Updated Feb 2026",
    summary:
      "After 120 hours of listening across 28 models, these three earbuds deliver the clearest call quality, most honest tuning, and longest real-world battery we've measured this year.",
    category: "Technology",
    author: "Naomi Okafor",
    authorRole: "Senior Audio Editor",
    updatedAt: "2026-02-14",
    readingTime: 11,
    popularity: 94,
    tested: 28,
    products: [
      {
        id: "p-sonos-roam-2", rank: 1, name: "Sonos Roam Buds", maker: "Sonos",
        tagline: "The most honest tuning under $300.", price: "$279", score: 9.4,
        verdict: "A reference-grade soundstage that finally makes ANC earbuds feel unprocessed.",
        pros: ["Reference-neutral tuning", "8-hour real-world battery", "Lossless over USB-C"],
        cons: ["Case is bulky", "App required for EQ"],
        specs: [
          { label: "Driver", value: "11mm dynamic + BA" },
          { label: "Battery", value: "8h / 32h" },
          { label: "Weight", value: "5.8g" },
          { label: "Codec", value: "AAC, aptX Lossless" },
        ],
        image: IMG.earbuds,
      },
      {
        id: "p-ap3", rank: 2, name: "Nothing Ear (3)", maker: "Nothing",
        tagline: "Design-forward with surprisingly mature audio.", price: "$179", score: 9.0,
        verdict: "The first Nothing earbud that sounds as considered as it looks.",
        pros: ["Outstanding transparency", "Distinctive design", "Fast pairing"],
        cons: ["Bass light for hip-hop", "No multipoint on iOS"],
        specs: [
          { label: "Driver", value: "11mm ceramic" },
          { label: "Battery", value: "7h / 28h" },
          { label: "Weight", value: "4.9g" },
          { label: "Codec", value: "AAC, LDHC" },
        ],
        image: IMG.earbuds2,
      },
      {
        id: "p-buds3", rank: 3, name: "Bose QC Ultra II", maker: "Bose",
        tagline: "Still the quietest cabin on the market.", price: "$299", score: 8.8,
        verdict: "Unmatched noise cancellation; the sound is warm and forgiving of bad recordings.",
        pros: ["Class-leading ANC", "All-day comfort", "Excellent call quality"],
        cons: ["Warm tuning colors detail", "Touch controls finicky"],
        specs: [
          { label: "Driver", value: "9.3mm dynamic" },
          { label: "Battery", value: "6h / 24h" },
          { label: "Weight", value: "6.2g" },
          { label: "Codec", value: "AAC, aptX Adaptive" },
        ],
        image: IMG.earbuds3,
      },
    ],
  },
  {
    id: "r-mechanical-keyboards",
    slug: "mechanical-keyboards",
    title: "The 3 Best Mechanical Keyboards",
    kicker: "Productivity · Updated Jan 2026",
    summary:
      "Typing feel is subjective; build quality is not. These three boards earned their spots on our desk for consistency, sound signature, and software that stays out of the way.",
    category: "Technology",
    author: "Daniel Reyes",
    authorRole: "Peripherals Editor",
    updatedAt: "2026-01-29",
    readingTime: 14,
    popularity: 88,
    tested: 42,
    products: [
      {
        id: "p-keychron-q1-he", rank: 1, name: "Keychron Q1 HE", maker: "Keychron",
        tagline: "The aluminum benchmark.", price: "$219", score: 9.3,
        verdict: "A gasket-mounted 75% that punches well above its price in sound and feel.",
        pros: ["Thocky, consistent acoustics", "QMK/VIA out of the box", "CNC aluminum case"],
        cons: ["No included wrist rest", "Heavy for travel"],
        specs: [
          { label: "Layout", value: "75% (82 keys)" },
          { label: "Switch", value: "Gateron Jupiter Banana" },
          { label: "Case", value: "CNC aluminum" },
          { label: "Connection", value: "USB-C / 2.4GHz" },
        ],
        image: IMG.keyboard,
      },
      {
        id: "p-nuphy-air75", rank: 2, name: "NuPhy Air75 V3", maker: "NuPhy",
        tagline: "Low-profile done right.", price: "$149", score: 8.9,
        verdict: "The only low-profile board we've kept on our desk past the review period.",
        pros: ["Ultra-slim profile", "Excellent travel feel", "Tri-mode wireless"],
        cons: ["Bottoms out fast", "No numpad option"],
        specs: [
          { label: "Layout", value: "75%" },
          { label: "Switch", value: "NuPhy Wisteria" },
          { label: "Case", value: "Aluminum top, ABS base" },
          { label: "Connection", value: "USB-C / BT / 2.4GHz" },
        ],
      },
      {
        id: "p-mode-envoy", rank: 3, name: "Mode Envoy", maker: "Mode Designs",
        tagline: "Modular, obsessive, and worth the wait.", price: "$480", score: 9.5,
        verdict: "A configurable enthusiast board that sounds like a $900 keyboard.",
        pros: ["Fully modular case", "World-class typing feel", "Open-source firmware"],
        cons: ["Long lead times", "Requires assembly"],
        specs: [
          { label: "Layout", value: "65% / 75% / TKL" },
          { label: "Switch", value: "Hot-swap, any MX" },
          { label: "Case", value: "6063 aluminum" },
          { label: "Connection", value: "USB-C" },
        ],
      },
    ],
  },
  {
    id: "r-electric-suvs",
    slug: "electric-suvs",
    title: "The 3 Best Electric SUVs",
    kicker: "Automotive · Updated Mar 2026",
    summary:
      "Range claims are marketing; range delivered is engineering. We drove each candidate 500+ miles in mixed conditions to find the three that keep their promises.",
    category: "Automotive",
    author: "Priya Menon",
    authorRole: "Automotive Editor",
    updatedAt: "2026-03-02",
    readingTime: 18,
    popularity: 91,
    tested: 14,
    products: [
      {
        id: "p-rivian-r2", rank: 1, name: "Rivian R2", maker: "Rivian",
        tagline: "Adventure-ready without the R1T price.", price: "From $52,900", score: 9.2,
        verdict: "The most usable electric SUV for people who actually leave the pavement.",
        pros: ["Real 340-mile range", "Thoughtful storage", "Quiet highway ride"],
        cons: ["Rear seats firm", "Infotainment learning curve"],
        specs: [
          { label: "Range", value: "340 mi EPA" },
          { label: "0-60", value: "4.5s" },
          { label: "Charge", value: "10–80% in 22m" },
          { label: "Tow", value: "5,000 lb" },
        ],
        image: IMG.suv1,
      },
      {
        id: "p-ioniq-9", rank: 2, name: "Hyundai Ioniq 9", maker: "Hyundai",
        tagline: "Three rows, honest pricing.", price: "From $57,500", score: 9.0,
        verdict: "The first three-row EV that doesn't feel like a compromise in row three.",
        pros: ["Genuine third-row space", "Ultra-fast 800V charging", "Smooth ride"],
        cons: ["Styling polarizing", "Cargo limited with row 3 up"],
        specs: [
          { label: "Range", value: "335 mi EPA" },
          { label: "0-60", value: "5.2s" },
          { label: "Charge", value: "10–80% in 18m" },
          { label: "Seats", value: "7" },
        ],
        image: IMG.suv2,
      },
      {
        id: "p-gv60", rank: 3, name: "Genesis GV60", maker: "Genesis",
        tagline: "Luxury EV with a human touch.", price: "From $53,350", score: 8.7,
        verdict: "A boutique electric SUV that treats the driver as a guest, not a user.",
        pros: ["Exceptional fit and finish", "Crystal sphere shifter", "Whisper quiet"],
        cons: ["280-mi range trails rivals", "Small cargo area"],
        specs: [
          { label: "Range", value: "280 mi EPA" },
          { label: "0-60", value: "3.9s" },
          { label: "Charge", value: "10–80% in 18m" },
          { label: "Power", value: "483 hp" },
        ],
        image: IMG.suv3,
      },
    ],
  },
  {
    id: "r-national-parks",
    slug: "national-parks",
    title: "The 3 Best National Parks",
    kicker: "Travel · Updated Jan 2026",
    summary:
      "We ranked 63 parks across scenery, trail quality, crowd density, and the likelihood of a moment you'll still be telling friends about in five years.",
    category: "Travel",
    author: "Hiroshi Tanaka",
    authorRole: "Travel Editor",
    updatedAt: "2026-01-18",
    readingTime: 12,
    popularity: 82,
    tested: 63,
    products: [
      {
        id: "p-yosemite", rank: 1, name: "Yosemite", maker: "California, USA",
        tagline: "Granite cathedrals at golden hour.", price: "$35 vehicle pass", score: 9.7,
        verdict: "The valley at dawn is still the single most moving landscape in the lower 48.",
        pros: ["Iconic granite walls", "World-class hiking", "Year-round access"],
        cons: ["Valley crowds in summer", "Reservations required"],
        specs: [
          { label: "Size", value: "748,036 acres" },
          { label: "Peak", value: "Mt. Lyell, 13,114 ft" },
          { label: "Trails", value: "800+ miles" },
          { label: "Best", value: "May, October" },
        ],
        image: IMG.yosemite,
      },
      {
        id: "p-glacier", rank: 2, name: "Glacier", maker: "Montana, USA",
        tagline: "The Alps, minus the cable cars.", price: "$35 vehicle pass", score: 9.5,
        verdict: "Going-to-the-Sun Road is the finest drive in North America. Full stop.",
        pros: ["Going-to-the-Sun Road", "Wildlife density", "Pristine alpine lakes"],
        cons: ["Short season", "Road closures common"],
        specs: [
          { label: "Size", value: "1,013,325 acres" },
          { label: "Glaciers", value: "25 active" },
          { label: "Trails", value: "740 miles" },
          { label: "Best", value: "July–September" },
        ],
        image: IMG.elcap,
      },
      {
        id: "p-olympic", rank: 3, name: "Olympic", maker: "Washington, USA",
        tagline: "Three ecosystems, one park.", price: "$30 vehicle pass", score: 9.3,
        verdict: "Rain forest, alpine meadow, and rugged coast — often in the same afternoon.",
        pros: ["Temperate rain forest", "Wild coastline", "Fewer crowds than peers"],
        cons: ["Weather is fickle", "Long drives between zones"],
        specs: [
          { label: "Size", value: "922,651 acres" },
          { label: "Peak", value: "Mt. Olympus, 7,980 ft" },
          { label: "Trails", value: "611 miles" },
          { label: "Best", value: "June–September" },
        ],
        image: IMG.valley,
      },
    ],
  },
  {
    id: "r-coffee-makers",
    slug: "coffee-makers",
    title: "The 3 Best Coffee Makers",
    kicker: "Home · Updated Feb 2026",
    summary:
      "A great coffee maker is one you actually use every morning. These three earn counter space with consistency, speed, and the kind of coffee that doesn't need milk.",
    category: "Home",
    author: "Léa Moreau",
    authorRole: "Home Editor",
    updatedAt: "2026-02-04",
    readingTime: 9,
    popularity: 79,
    tested: 22,
    products: [
      {
        id: "p-fellow-aiden", rank: 1, name: "Fellow Aiden", maker: "Fellow",
        tagline: "The pour-over, automated honestly.", price: "$350", score: 9.4,
        verdict: "The first drip machine we've tasted alongside a V60 and couldn't pick the Aiden out.",
        pros: ["SCA-certified brew temp", "Pulse bloom pre-infusion", "Quiet operation"],
        cons: ["Small water tank", "Single-cup awkward"],
        specs: [
          { label: "Brew", value: "Drip, pour-over profile" },
          { label: "Tank", value: "1.1L" },
          { label: "Cert", value: "SCA" },
          { label: "Carafe", value: "Glass, 10-cup" },
        ],
        image: IMG.coffee1,
      },
      {
        id: "p-breville-precision", rank: 2, name: "Breville Precision", maker: "Breville",
        tagline: "Dial in once, brew perfectly forever.", price: "$299", score: 9.1,
        verdict: "A workhorse with enough settings to satisfy a barista and a simple enough UI to satisfy a morning person.",
        pros: ["Adjustable flow rate", "Flat & cone filter support", "Large batch capable"],
        cons: ["Footprint is large", "Screen could be brighter"],
        specs: [
          { label: "Brew", value: "Drip with flow control" },
          { label: "Tank", value: "1.7L" },
          { label: "Cert", value: "SCA" },
          { label: "Carafe", value: "Thermal, 12-cup" },
        ],
        image: IMG.coffee2,
      },
      {
        id: "p-technivorm", rank: 3, name: "Technivorm Moccamaster", maker: "Technivorm",
        tagline: "Dutch-made and still the reference.", price: "$359", score: 9.0,
        verdict: "Forty years of iteration shows. Repairs are possible; replacement is rarely necessary.",
        pros: ["Lifetime repairable", "Copper heating element", "Made in Netherlands"],
        cons: ["No programmable timer", "Carafe heat loss"],
        specs: [
          { label: "Brew", value: "Drip, 6 min full pot" },
          { label: "Tank", value: "1.25L" },
          { label: "Cert", value: "SCA, ECARF" },
          { label: "Warranty", value: "5 years" },
        ],
      },
    ],
  },
  {
    id: "r-ai-coding",
    slug: "ai-coding-assistants",
    title: "The 3 Best AI Coding Assistants",
    kicker: "Software · Updated Mar 2026",
    summary:
      "We wrote the same six real-world features with each assistant — authentication, a payments flow, a data pipeline, tests, a refactor, and docs. The gap between best and worst was wider than we expected.",
    category: "Artificial Intelligence",
    author: "Samir Kapoor",
    authorRole: "Engineering Editor",
    updatedAt: "2026-03-08",
    readingTime: 16,
    popularity: 97,
    tested: 11,
    products: [
      {
        id: "p-cursor", rank: 1, name: "Cursor", maker: "Anysphere",
        tagline: "The editor that thinks in diffs.", price: "$20/mo", score: 9.3,
        verdict: "Composer mode is the first time AI assistance has felt like pairing with a senior engineer.",
        pros: ["Composer agent", "Multi-file edits", "Fast indexing"],
        cons: ["Proprietary editor", "Credits meter usage"],
        specs: [
          { label: "Editor", value: "VS Code fork" },
          { label: "Models", value: "Claude, GPT, Gemini" },
          { label: "Context", value: "Codebase + docs" },
          { label: "OS", value: "macOS, Windows, Linux" },
        ],
      },
      {
        id: "p-copilot", rank: 2, name: "GitHub Copilot", maker: "GitHub",
        tagline: "The default, and getting close to the best.", price: "$19/mo", score: 9.0,
        verdict: "Workspace mode finally closes the gap with Cursor for most day-to-day tasks.",
        pros: ["Deep GitHub integration", "Workspace context", "Broad IDE support"],
        cons: ["Agent still conservative", "Occasional hallucinated imports"],
        specs: [
          { label: "Editor", value: "VS Code, JetBrains, Neovim" },
          { label: "Models", value: "GPT-4o, Claude" },
          { label: "Context", value: "Repo, workspace" },
          { label: "OS", value: "All major" },
        ],
      },
      {
        id: "p-claude-code", rank: 3, name: "Claude Code", maker: "Anthropic",
        tagline: "Terminal-native and surprisingly autonomous.", price: "Usage-based", score: 8.8,
        verdict: "For engineers comfortable in a shell, this is the most direct path from intent to shipped code.",
        pros: ["CLI-first", "Strong reasoning", "Transparent tool calls"],
        cons: ["Requires terminal fluency", "Token costs add up"],
        specs: [
          { label: "Interface", value: "Terminal" },
          { label: "Models", value: "Claude 4" },
          { label: "Context", value: "Repo, tools, files" },
          { label: "OS", value: "macOS, Linux, Windows" },
        ],
      },
    ],
  },
  {
    id: "r-streaming",
    slug: "streaming-services",
    title: "The 3 Best Streaming Services",
    kicker: "Entertainment · Updated Feb 2026",
    summary:
      "Catalog size is vanity; catalog quality is sanity. We watched enough to know which services you'll actually open twice a week.",
    category: "Streaming",
    author: "Maya Chen",
    authorRole: "Culture Editor",
    updatedAt: "2026-02-20",
    readingTime: 8,
    popularity: 86,
    tested: 9,
    products: [
      {
        id: "p-hbo", rank: 1, name: "Max", maker: "Warner Bros. Discovery",
        tagline: "Prestige TV, actually still prestigious.", price: "$16.99/mo", score: 9.2,
        verdict: "The only service where 'new episode Friday' still means something.",
        pros: ["Strong originals", "Criterion integration", "Clean interface"],
        cons: ["Discovery content dilutes", "Ad tier aggressive"],
        specs: [
          { label: "4K", value: "Selected titles" },
          { label: "Streams", value: "2 / 4" },
          { label: "Downloads", value: "Yes, ad-free" },
          { label: "Profiles", value: "5" },
        ],
      },
      {
        id: "p-appletv", rank: 2, name: "Apple TV+", maker: "Apple",
        tagline: "Small catalog, high batting average.", price: "$12.99/mo", score: 8.9,
        verdict: "You can finish every worthwhile show in a month — and that's the point.",
        pros: ["No filler", "Excellent HDR", "Family sharing"],
        cons: ["Thin back catalog", "Few international originals"],
        specs: [
          { label: "4K", value: "All originals" },
          { label: "Streams", value: "6" },
          { label: "Downloads", value: "Yes" },
          { label: "Profiles", value: "6" },
        ],
      },
      {
        id: "p-netflix", rank: 3, name: "Netflix", maker: "Netflix",
        tagline: "Quantity still has its uses.", price: "$17.99/mo", score: 8.5,
        verdict: "The breadth still matters for households with four different taste profiles.",
        pros: ["Global catalog", "Strong recommendations", "Offline downloads"],
        cons: ["Hit-to-miss ratio slipping", "Password crackdown"],
        specs: [
          { label: "4K", value: "Premium tier" },
          { label: "Streams", value: "4" },
          { label: "Downloads", value: "Yes" },
          { label: "Profiles", value: "5" },
        ],
      },
    ],
  },
  {
    id: "r-credit-cards",
    slug: "credit-cards-travel",
    title: "The 3 Best Travel Credit Cards",
    kicker: "Finance · Updated Jan 2026",
    summary:
      "The math on travel cards changes every quarter. We re-ran it for 2026 with real itineraries, real lounge access, and real customer service calls.",
    category: "Finance",
    author: "Jordan Ellis",
    authorRole: "Finance Editor",
    updatedAt: "2026-01-11",
    readingTime: 13,
    popularity: 90,
    tested: 26,
    products: [
      {
        id: "p-sapphire", rank: 1, name: "Chase Sapphire Reserve", maker: "Chase",
        tagline: "The card that still earns its fee.", price: "$550 annual", score: 9.3,
        verdict: "Transfer partners and a genuinely useful lounge network keep it on top.",
        pros: ["1:1 transfer partners", "Priority Pass", "$300 travel credit"],
        cons: ["High annual fee", "Lounge access diluted"],
        specs: [
          { label: "Rewards", value: "3x travel, 3x dining" },
          { label: "Lounge", value: "Priority Pass" },
          { label: "Credit", value: "Global Entry / TSA" },
          { label: "Insurance", value: "Primary rental" },
        ],
      },
      {
        id: "p-plat", rank: 2, name: "Amex Platinum", maker: "American Express",
        tagline: "For the traveler who values ritual.", price: "$695 annual", score: 9.1,
        verdict: "Centurion lounges are still the best in the business. The concierge is real.",
        pros: ["Centurion lounges", "$200 airline credit", "Hotel elite status"],
        cons: ["Very high fee", "Rewards narrow outside travel"],
        specs: [
          { label: "Rewards", value: "5x flights (portal)" },
          { label: "Lounge", value: "Centurion, Delta, Priority" },
          { label: "Credit", value: "Global Entry / CLEAR" },
          { label: "Status", value: "Hilton Gold, Marriott Gold" },
        ],
      },
      {
        id: "p-venture", rank: 3, name: "Capital One Venture X", maker: "Capital One",
        tagline: "Premium experience, honest pricing.", price: "$395 annual", score: 8.9,
        verdict: "The best value in premium cards for anyone who flies more than twice a year.",
        pros: ["2x on everything", "Capital One lounges", "10k anniversary bonus"],
        cons: ["Transfer partners growing", "Limited lounge network"],
        specs: [
          { label: "Rewards", value: "10x hotels/flights, 2x else" },
          { label: "Lounge", value: "Capital One, Priority" },
          { label: "Credit", value: "Global Entry / TSA" },
          { label: "Bonus", value: "10k annually" },
        ],
      },
    ],
  },
  {
    id: "r-running-shoes",
    slug: "running-shoes-daily",
    title: "The 3 Best Daily Running Shoes",
    kicker: "Sports · Updated Feb 2026",
    summary:
      "Daily trainers are where 80% of your miles happen. We put 300+ miles on each pair to find the three that age gracefully.",
    category: "Sports",
    author: "Ade Okojie",
    authorRole: "Sports Editor",
    updatedAt: "2026-02-27",
    readingTime: 10,
    popularity: 84,
    tested: 19,
    products: [
      {
        id: "p-pegasus", rank: 1, name: "Nike Pegasus 43", maker: "Nike",
        tagline: "The reliable friend you keep recommending.", price: "$140", score: 9.1,
        verdict: "A daily trainer that works for more runners than any other shoe we tested.",
        pros: ["Versatile ride", "Durable outsole", "True to size"],
        cons: ["Not exciting", "Upper breathability average"],
        specs: [
          { label: "Drop", value: "10mm" },
          { label: "Weight", value: "275g M9" },
          { label: "Stack", value: "33/23mm" },
          { label: "Best", value: "Easy to tempo" },
        ],
      },
      {
        id: "p-clifton", rank: 2, name: "Hoka Clifton 10", maker: "Hoka",
        tagline: "Max cushion, surprisingly light.", price: "$150", score: 9.0,
        verdict: "Recovery runs have never felt this forgiving.",
        pros: ["Plush cushioning", "Light for max stack", "Smooth transitions"],
        cons: ["Soft ride for tempo", "Heel slippage if wide"],
        specs: [
          { label: "Drop", value: "5mm" },
          { label: "Weight", value: "260g M9" },
          { label: "Stack", value: "34/29mm" },
          { label: "Best", value: "Recovery, easy" },
        ],
      },
      {
        id: "p-nimbus", rank: 3, name: "Asics Gel-Nimbus 28", maker: "Asics",
        tagline: "Long-run comfort, quietly upgraded.", price: "$170", score: 8.9,
        verdict: "Asics finally got the upper right. The ride has been great for three generations.",
        pros: ["Excellent long-run cushion", "Secure upper", "Durable"],
        cons: ["Firm for Hoka converts", "Heavy for the category"],
        specs: [
          { label: "Drop", value: "8mm" },
          { label: "Weight", value: "295g M9" },
          { label: "Stack", value: "36/28mm" },
          { label: "Best", value: "Long runs" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Supplemental rankings
// ---------------------------------------------------------------------------
// The homepage only needs a small featured slice, but the category explorer
// should still have credible depth everywhere. These entries use the same
// shape as the original rankings so a real API can replace them later.

const product = (name, maker, price, tagline, score, verdict, pros, cons, specs, gradient) => ({
  name,
  maker,
  price,
  tagline,
  score,
  verdict,
  reviewSummary: verdict,
  pros,
  cons,
  specs,
  gradient,
});

const ranking = (seed) => ({
  ...seed,
  products: seed.products.map((item, index) => ({
    ...item,
    id: `${seed.id}-p${index + 1}`,
    rank: index + 1,
  })),
});

const supplementalRankings = [
  ranking({
    id: "r-ai-image-generators", slug: "ai-image-generators", title: "The 3 Best AI Image Generators",
    kicker: "Artificial Intelligence · Updated Mar 2026", summary: "We gave each generator the same art direction brief, then tested control, editability, licensing, and consistency across 60 prompts.", category: "Artificial Intelligence", author: "Samir Kapoor", authorRole: "Engineering Editor", updatedAt: "2026-03-04", readingTime: 15, popularity: 93, tested: 12,
    coverGradient: "from-[#b8451e] to-[#2a2826]", products: [
      product("Midjourney", "Midjourney", "$10/mo", "The strongest visual taste in the room.", 9.4, "The best choice when you want a finished image with a point of view, not a polite interpretation of your prompt.", ["Exceptional composition", "Consistent style control", "Active model updates"], ["Web app can feel busy", "Commercial rights require care"], [{ label: "Model", value: "V7" }, { label: "Editor", value: "Conversational" }, { label: "Output", value: "2048px native" }, { label: "Best for", value: "Concept art" }], "from-[#b8451e] to-[#4a2b1f]"),
      product("Adobe Firefly", "Adobe", "$9.99/mo", "The safest fit for a production workflow.", 9.0, "Firefly gives designers the most practical path from generated idea to editable, licensed campaign asset.", ["Adobe integration", "Generative fill", "Clear commercial terms"], ["Less surprising style", "Best tools are paid"], [{ label: "Model", value: "Firefly Image 4" }, { label: "Editor", value: "Photoshop, web" }, { label: "Output", value: "2048px native" }, { label: "Best for", value: "Brand work" }], "from-[#8a2f12] to-[#c99a3e]"),
      product("Ideogram", "Ideogram", "$20/mo", "The one to call when the image needs words.", 8.8, "Typography, logos, and poster-like compositions remain Ideogram's unfair advantage.", ["Reliable text rendering", "Strong poster layouts", "Easy remixing"], ["Photorealism trails top two", "Limited batch controls"], [{ label: "Model", value: "3.0" }, { label: "Editor", value: "Canvas, remix" }, { label: "Output", value: "1536px native" }, { label: "Best for", value: "Text in images" }], "from-[#4a5a3a] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-project-management", slug: "project-management-software", title: "The 3 Best Project Management Software",
    kicker: "Software · Updated Feb 2026", summary: "We ran a 12-person product launch through each platform, measuring clarity at handoff, reporting overhead, and how quickly a new teammate could find the truth.", category: "Software", author: "Samir Kapoor", authorRole: "Engineering Editor", updatedAt: "2026-02-23", readingTime: 14, popularity: 89, tested: 18,
    coverGradient: "from-[#111010] to-[#4a5a3a]", products: [
      product("Linear", "Linear", "$10/user/mo", "The fastest route from issue to shipped.", 9.5, "A focused, opinionated system that makes a healthy product process feel almost inevitable.", ["Excellent keyboard flow", "Beautiful roadmaps", "Fast search"], ["Less flexible for non-product teams", "Advanced reports cost extra"], [{ label: "Best for", value: "Product teams" }, { label: "Views", value: "List, board, timeline" }, { label: "Automation", value: "Native workflows" }, { label: "API", value: "GraphQL" }], "from-[#111010] to-[#2a2826]"),
      product("Asana", "Asana", "$10.99/user/mo", "The clearest cross-functional handoff.", 9.0, "Asana remains the best choice when marketing, operations, and product need one shared view without learning a new language.", ["Flexible project views", "Strong dependencies", "Useful forms"], ["Notification volume", "Can feel over-configurable"], [{ label: "Best for", value: "Cross-functional work" }, { label: "Views", value: "List, board, timeline" }, { label: "Automation", value: "Rules and forms" }, { label: "API", value: "REST" }], "from-[#b8451e] to-[#2a2826]"),
      product("Notion Projects", "Notion", "$10/user/mo", "For teams that want context beside the task.", 8.7, "The database model is unmatched for briefs and documentation, but needs a little discipline to stay crisp.", ["Docs and projects together", "Flexible databases", "Strong templates"], ["Slower at scale", "Easy to overbuild"], [{ label: "Best for", value: "Knowledge-heavy teams" }, { label: "Views", value: "Table, board, timeline" }, { label: "Automation", value: "Buttons and rules" }, { label: "API", value: "REST" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-small-business-crm", slug: "small-business-crm", title: "The 3 Best CRMs for Small Teams",
    kicker: "Software · Updated Jan 2026", summary: "We configured each CRM for a five-person sales team and tracked setup time, data hygiene, follow-up visibility, and the cost of adding a sixth seat.", category: "Software", author: "Jordan Ellis", authorRole: "Business Editor", updatedAt: "2026-01-25", readingTime: 12, popularity: 81, tested: 14,
    coverGradient: "from-[#4a5a3a] to-[#111010]", products: [
      product("Attio", "Attio", "$29/user/mo", "The modern CRM for teams who hate CRM.", 9.3, "Attio turns a messy spreadsheet into a flexible, living customer system without making the team feel managed.", ["Excellent data model", "Fast setup", "Flexible views"], ["Reporting still maturing", "Higher price at scale"], [{ label: "Best for", value: "Modern sales teams" }, { label: "Setup", value: "1 afternoon" }, { label: "Automation", value: "Rules, enrichment" }, { label: "Integrations", value: "50+" }], "from-[#2a2826] to-[#4a5a3a]"),
      product("HubSpot CRM", "HubSpot", "$20/seat/mo", "The generous default.", 9.0, "The free tier is still genuinely useful, and the upgrade path is clear enough for a growing team.", ["Strong free tier", "Email tracking", "Broad integrations"], ["Upsell pressure", "Settings sprawl"], [{ label: "Best for", value: "Growing small teams" }, { label: "Setup", value: "1-2 days" }, { label: "Automation", value: "Sequences, workflows" }, { label: "Integrations", value: "1,500+" }], "from-[#b8451e] to-[#c99a3e]"),
      product("Pipedrive", "Pipedrive", "$14/user/mo", "The cleanest sales pipeline.", 8.7, "If your business is a sequence of deals, Pipedrive keeps the next action visible and the dashboard refreshingly quiet.", ["Excellent pipeline view", "Simple forecasting", "Easy onboarding"], ["Marketing tools limited", "Reporting add-ons"], [{ label: "Best for", value: "Deal-driven sales" }, { label: "Setup", value: "Half a day" }, { label: "Automation", value: "Workflow rules" }, { label: "Integrations", value: "400+" }], "from-[#4a5a3a] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-high-yield-savings", slug: "high-yield-savings", title: "The 3 Best High-Yield Savings Accounts",
    kicker: "Finance · Updated Feb 2026", summary: "Rates change. We compared the current APY against minimums, transfer speed, customer support, and the small print that makes an account usable day to day.", category: "Finance", author: "Jordan Ellis", authorRole: "Finance Editor", updatedAt: "2026-02-16", readingTime: 10, popularity: 87, tested: 21,
    coverGradient: "from-[#4a5a3a] to-[#c99a3e]", products: [
      product("Marcus Online Savings", "Goldman Sachs", "4.10% APY", "The calm, no-surprises account.", 9.2, "Marcus keeps the important parts simple: a competitive rate, no monthly fee, and transfers that behave as expected.", ["No minimum balance", "Clear interface", "Reliable transfers"], ["No checking account", "No ATM access"], [{ label: "APY", value: "4.10% variable" }, { label: "Minimum", value: "$0" }, { label: "Transfer", value: "1-3 business days" }, { label: "Fee", value: "$0 monthly" }], "from-[#4a5a3a] to-[#2e3a23]"),
      product("Ally Online Savings", "Ally", "4.00% APY", "Best when savings has many jobs.", 9.0, "Buckets, recurring transfers, and a mature app make Ally the most useful account for organized savers.", ["Savings buckets", "24/7 support", "No minimums"], ["Rate can lag leaders", "App occasionally busy"], [{ label: "APY", value: "4.00% variable" }, { label: "Minimum", value: "$0" }, { label: "Transfer", value: "1-3 business days" }, { label: "Fee", value: "$0 monthly" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("SoFi Checking & Savings", "SoFi", "4.00% APY", "The best all-in-one cash hub.", 8.8, "SoFi wins if you want checking, savings, direct deposit, and a strong rate in one modern account.", ["Checking included", "Early direct deposit", "Good mobile app"], ["Direct deposit needed for top APY", "More product cross-sell"], [{ label: "APY", value: "4.00% with DD" }, { label: "Minimum", value: "$0" }, { label: "Transfer", value: "Same day internal" }, { label: "Fee", value: "$0 monthly" }], "from-[#111010] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-europe-city-breaks", slug: "europe-city-breaks", title: "The 3 Best European City Breaks",
    kicker: "Travel · Updated Feb 2026", summary: "For a four-day trip, we weighted walkability, food density, design, transit, and the number of good afternoons that do not require a reservation.", category: "Travel", author: "Hiroshi Tanaka", authorRole: "Travel Editor", updatedAt: "2026-02-08", readingTime: 11, popularity: 85, tested: 17,
    coverGradient: "from-[#c99a3e] to-[#4a5a3a]", products: [
      product("Copenhagen", "Denmark", "$190 average flight", "The easiest city to enjoy slowly.", 9.5, "Copenhagen makes a short trip feel generous: excellent design, excellent transit, and very little friction between neighborhoods.", ["Walkable center", "Exceptional food", "Excellent cycling"], ["High hotel prices", "Early winter darkness"], [{ label: "Best season", value: "May-September" }, { label: "Airport to center", value: "15 minutes" }, { label: "Transit", value: "Metro + bike" }, { label: "Ideal stay", value: "4 nights" }], "from-[#c99a3e] to-[#2a2826]"),
      product("Lisbon", "Portugal", "$160 average flight", "Sun, tile, and a city with edges.", 9.2, "Lisbon still rewards curiosity, especially when you leave the postcard streets for the neighborhoods above the river.", ["Strong value", "Great light", "Excellent day trips"], ["Steep hills", "Summer crowds"], [{ label: "Best season", value: "March-May" }, { label: "Airport to center", value: "25 minutes" }, { label: "Transit", value: "Metro + tram" }, { label: "Ideal stay", value: "4 nights" }], "from-[#b8451e] to-[#c99a3e]"),
      product("Kyoto", "Japan", "$780 round trip", "A city that asks for your attention.", 9.0, "Kyoto is more rewarding when you plan around quiet mornings, local trains, and one neighborhood per day.", ["Deep cultural history", "Excellent food", "Beautiful seasons"], ["Crowds at icons", "Long-haul flight"], [{ label: "Best season", value: "October-November" }, { label: "Airport to center", value: "75 minutes" }, { label: "Transit", value: "Rail + bus" }, { label: "Ideal stay", value: "5 nights" }], "from-[#4a5a3a] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-everyday-luxury-watches", slug: "everyday-luxury-watches", title: "The 3 Best Everyday Luxury Watches",
    kicker: "Luxury · Updated Jan 2026", summary: "The best daily watch is not the loudest one. We lived with each finalist for a month, tracking comfort, legibility, service, and how it wears with ordinary clothes.", category: "Luxury", author: "Elena Park", authorRole: "Style Editor", updatedAt: "2026-01-20", readingTime: 13, popularity: 76, tested: 18,
    coverGradient: "from-[#2a2826] to-[#c99a3e]", products: [
      product("Omega Aqua Terra", "Omega", "$7,100", "The grown-up daily watch.", 9.4, "The Aqua Terra is handsome without demanding a conversation and engineered to disappear into a week of actual life.", ["Excellent movement", "Strong water resistance", "Versatile proportions"], ["Bracelet clasp bulky", "Polished surfaces scratch"], [{ label: "Movement", value: "Cal. 8900 automatic" }, { label: "Case", value: "38mm steel" }, { label: "Water", value: "150m" }, { label: "Power reserve", value: "60 hours" }], "from-[#111010] to-[#c99a3e]"),
      product("Cartier Santos", "Cartier", "$7,750", "A design icon that still lives well.", 9.1, "The Santos brings unmistakable shape and real comfort to a watch that works with a suit or a white T-shirt.", ["Iconic design", "Quick-change bracelet", "Comfortable case"], ["Polished bezel marks", "No-date dial limited"], [{ label: "Movement", value: "Cal. 1847 MC" }, { label: "Case", value: "35.1mm steel" }, { label: "Water", value: "100m" }, { label: "Power reserve", value: "42 hours" }], "from-[#c99a3e] to-[#2a2826]"),
      product("Grand Seiko SBGW283", "Grand Seiko", "$5,900", "Quiet finishing, extraordinary dial.", 9.0, "Grand Seiko offers the most beautiful dial and hand finishing at this level, with a more intimate, less obvious presence.", ["Exceptional finishing", "Slim manual movement", "Distinct dial"], ["Manual winding", "Bracelet is basic"], [{ label: "Movement", value: "Cal. 9S64 manual" }, { label: "Case", value: "37.3mm steel" }, { label: "Water", value: "30m" }, { label: "Power reserve", value: "72 hours" }], "from-[#4a5a3a] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-design-hotels", slug: "design-hotels", title: "The 3 Best Design Hotels",
    kicker: "Luxury · Updated Feb 2026", summary: "A design hotel should make the room better, not merely more photogenic. We ranked these stays on sleep, service, material quality, and the feeling after checkout.", category: "Luxury", author: "Hiroshi Tanaka", authorRole: "Travel Editor", updatedAt: "2026-02-12", readingTime: 12, popularity: 72, tested: 11,
    coverGradient: "from-[#111010] to-[#4a5a3a]", products: [
      product("Aman Tokyo", "Aman", "$1,100/night", "A masterclass in quiet.", 9.6, "Aman Tokyo uses restraint as a luxury material: huge views, perfect service, and almost no visual noise.", ["Exceptional rooms", "Calm service", "Best-in-class spa"], ["Very expensive", "Can feel self-contained"], [{ label: "Rooms", value: "84" }, { label: "Neighborhood", value: "Otemachi" }, { label: "Best for", value: "Quiet reset" }, { label: "Design", value: "Bamboo, stone, washi" }], "from-[#111010] to-[#2a2826]"),
      product("The Hoxton, Paris", "Ennismore", "$280/night", "The lobby you actually want to use.", 8.9, "The Hoxton gets the social hotel right: generous public rooms, a warm team, and a neighborhood worth wandering.", ["Great common spaces", "Strong restaurant", "Good value"], ["Rooms vary in size", "Weekend noise"], [{ label: "Rooms", value: "172" }, { label: "Neighborhood", value: "2nd arrondissement" }, { label: "Best for", value: "City weekends" }, { label: "Design", value: "19th-century + modern" }], "from-[#b8451e] to-[#c99a3e]"),
      product("Fogo Island Inn", "Newfoundland", "$1,850/night", "A place built around the horizon.", 9.3, "Fogo Island Inn earns its remote setting with careful architecture, local food, and the rare feeling of being nowhere else.", ["Spectacular setting", "Thoughtful programming", "Local craft"], ["Remote access", "Weather-dependent"], [{ label: "Rooms", value: "29" }, { label: "Location", value: "Joe Batt's Arm" }, { label: "Best for", value: "Deep retreat" }, { label: "Design", value: "Timber, glass, steel" }], "from-[#4a5a3a] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-travel-cameras", slug: "travel-cameras", title: "The 3 Best Cameras for Travel",
    kicker: "Photography · Updated Feb 2026", summary: "We carried each camera through airports, rain, museums, and a long day on foot. The winner balances image quality with the desire to keep carrying it.", category: "Photography", author: "Mina Alvarez", authorRole: "Photography Editor", updatedAt: "2026-02-18", readingTime: 14, popularity: 83, tested: 15,
    coverGradient: "from-[#111010] to-[#4a5a3a]", products: [
      product("Sony A7C II", "Sony", "$2,199 body", "Full-frame quality in a camera you bring.", 9.4, "Sony's compact full-frame body makes the best case for leaving the phone at home without punishing your shoulders.", ["Excellent autofocus", "Compact body", "Strong low light"], ["Small viewfinder", "Menus dense"], [{ label: "Sensor", value: "33MP full-frame" }, { label: "Weight", value: "514g" }, { label: "Video", value: "4K 60p" }, { label: "Battery", value: "530 shots" }], "from-[#111010] to-[#4a5a3a]"),
      product("Fujifilm X-T5", "Fujifilm", "$1,699 body", "The camera that makes you look around.", 9.2, "The X-T5's tactile controls and beautiful files make photography feel like part of the trip again.", ["Beautiful JPEG color", "Excellent dials", "40MP detail"], ["Autofocus trails Sony", "No tilt-and-flip screen"], [{ label: "Sensor", value: "40MP APS-C" }, { label: "Weight", value: "557g" }, { label: "Video", value: "6.2K 30p" }, { label: "Battery", value: "580 shots" }], "from-[#4a5a3a] to-[#c99a3e]"),
      product("Canon EOS R8", "Canon", "$1,499 body", "The full-frame sweet spot.", 8.9, "Canon delivers clean full-frame files and superb autofocus at a price that leaves room for a good lens.", ["Excellent autofocus", "Lightweight", "Natural color"], ["Small battery", "No weather sealing"], [{ label: "Sensor", value: "24MP full-frame" }, { label: "Weight", value: "461g" }, { label: "Video", value: "4K 60p" }, { label: "Battery", value: "370 shots" }], "from-[#b8451e] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-photo-printers", slug: "photo-printers", title: "The 3 Best Photo Printers",
    kicker: "Photography · Updated Jan 2026", summary: "We printed portraits, landscapes, and small albums from the same files to judge color, permanence, setup, and whether the printer encourages more making.", category: "Photography", author: "Mina Alvarez", authorRole: "Photography Editor", updatedAt: "2026-01-30", readingTime: 9, popularity: 68, tested: 9,
    coverGradient: "from-[#c99a3e] to-[#b8451e]", products: [
      product("Canon Selphy CP1500", "Canon", "$109", "Small prints with very little ceremony.", 9.2, "The Selphy makes four-by-six prints fast, affordable, and good enough to become actual objects.", ["Excellent value", "Fast prints", "Small footprint"], ["Small format only", "Glossy look"], [{ label: "Print size", value: "4 x 6 inches" }, { label: "Technology", value: "Dye sublimation" }, { label: "Speed", value: "41 seconds" }, { label: "Connection", value: "Wi-Fi, USB-C" }], "from-[#c99a3e] to-[#b8451e]"),
      product("Epson SureColor P700", "Epson", "$799", "For the print you keep.", 9.4, "The P700 is slower and larger, but its tonal range and archival inks make it the serious photographer's choice.", ["Archival pigment inks", "Wide color gamut", "Up to 13-inch prints"], ["High ink cost", "Needs regular use"], [{ label: "Print size", value: "13 x 19 inches" }, { label: "Technology", value: "10-color pigment" }, { label: "Speed", value: "4 min 8 x 10" }, { label: "Connection", value: "Wi-Fi, Ethernet" }], "from-[#111010] to-[#4a5a3a]"),
      product("Fujifilm Instax Link Wide", "Fujifilm", "$149", "Instant prints with a little more room.", 8.8, "The Link Wide is less about fidelity than sharing, and it is unusually good at making a phone photo feel present.", ["Fun physical format", "Simple app", "Good battery"], ["Film is expensive", "Soft detail"], [{ label: "Print size", value: "3.9 x 2.4 inches" }, { label: "Technology", value: "Instax instant film" }, { label: "Speed", value: "12 seconds" }, { label: "Connection", value: "Bluetooth" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-handheld-gaming", slug: "handheld-gaming-consoles", title: "The 3 Best Handheld Gaming Consoles",
    kicker: "Gaming · Updated Feb 2026", summary: "We played new releases, older libraries, and indie games on commutes and couches to measure performance, suspend-resume reliability, and battery life.", category: "Gaming", author: "Tara Brooks", authorRole: "Gaming Editor", updatedAt: "2026-02-21", readingTime: 13, popularity: 92, tested: 10,
    coverGradient: "from-[#b8451e] to-[#c99a3e]", products: [
      product("Steam Deck OLED", "Valve", "$549", "The most generous handheld library.", 9.5, "Steam Deck remains the best value in portable PC gaming because the hardware and the community keep improving together.", ["Excellent OLED screen", "Huge library", "Repairable design"], ["Bulky", "Some games need tweaks"], [{ label: "Display", value: "7.4-inch OLED, 90Hz" }, { label: "Battery", value: "3-12 hours" }, { label: "Storage", value: "512GB" }, { label: "OS", value: "SteamOS" }], "from-[#b8451e] to-[#2a2826]"),
      product("ROG Ally X", "ASUS", "$799", "The powerful Windows handheld.", 9.0, "For players who want Game Pass, storefront freedom, and desktop-class performance, the Ally X is the most complete option.", ["Strong performance", "Excellent battery", "Windows compatibility"], ["Windows friction", "Fans audible"], [{ label: "Display", value: "7-inch LCD, 120Hz" }, { label: "Battery", value: "3-8 hours" }, { label: "Storage", value: "1TB" }, { label: "OS", value: "Windows 11" }], "from-[#4a5a3a] to-[#111010]"),
      product("Nintendo Switch 2", "Nintendo", "$449", "The easiest way to play together.", 8.9, "Nintendo still understands the social magic of a handheld better than anyone, with a library no PC can quite replace.", ["Great first-party games", "Simple suspend", "Excellent local multiplayer"], ["Online service uneven", "Display not OLED"], [{ label: "Display", value: "7.9-inch LCD, 120Hz" }, { label: "Battery", value: "2.5-6.5 hours" }, { label: "Storage", value: "256GB" }, { label: "Modes", value: "Handheld, docked" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-gaming-monitors", slug: "gaming-monitors", title: "The 3 Best Gaming Monitors",
    kicker: "Gaming · Updated Jan 2026", summary: "We measured motion clarity, HDR behavior, input lag, and desk ergonomics across PC and console setups, not just peak refresh rate.", category: "Gaming", author: "Tara Brooks", authorRole: "Gaming Editor", updatedAt: "2026-01-22", readingTime: 11, popularity: 79, tested: 13,
    coverGradient: "from-[#111010] to-[#b8451e]", products: [
      product("LG UltraGear 32GS95UE", "LG", "$1,399", "A dual-mode OLED that earns its desk space.", 9.3, "The LG's switchable 4K and 1080p high-refresh modes make it unusually good for both beautiful single-player games and competitive play.", ["Excellent OLED contrast", "Dual resolution modes", "Low input lag"], ["Text fringing", "Stand takes space"], [{ label: "Panel", value: "32-inch OLED" }, { label: "Refresh", value: "240Hz / 480Hz" }, { label: "Resolution", value: "4K / 1080p" }, { label: "HDR", value: "DisplayHDR True Black" }], "from-[#111010] to-[#b8451e]"),
      product("Alienware AW3225QF", "Dell", "$1,199", "The best curved 4K OLED for most desks.", 9.1, "Alienware balances exceptional contrast with a gentle curve and the warranty support that expensive OLEDs deserve.", ["Beautiful HDR", "Strong warranty", "USB hub"], ["Curve not for everyone", "Glossy reflections"], [{ label: "Panel", value: "32-inch QD-OLED" }, { label: "Refresh", value: "240Hz" }, { label: "Resolution", value: "4K" }, { label: "HDR", value: "DisplayHDR True Black" }], "from-[#4a5a3a] to-[#111010]"),
      product("ROG Swift PG27UCDM", "ASUS", "$1,099", "Pixel density for serious desk work.", 8.9, "The 27-inch 4K OLED is sharp enough for code and fast enough for games, with a practical KVM for two machines.", ["Very sharp text", "240Hz OLED", "Useful KVM"], ["Smaller screen", "Fanless heat management"], [{ label: "Panel", value: "27-inch OLED" }, { label: "Refresh", value: "240Hz" }, { label: "Resolution", value: "4K" }, { label: "HDR", value: "DisplayHDR True Black" }], "from-[#c99a3e] to-[#b8451e]"),
    ],
  }),
  ranking({
    id: "r-hybrid-crossovers", slug: "hybrid-crossovers", title: "The 3 Best Hybrid Crossovers",
    kicker: "Automotive · Updated Feb 2026", summary: "We drove each crossover in town, on the highway, and with a full load to separate impressive EPA numbers from genuinely low-effort ownership.", category: "Automotive", author: "Priya Menon", authorRole: "Automotive Editor", updatedAt: "2026-02-26", readingTime: 16, popularity: 83, tested: 12,
    coverGradient: "from-[#4a5a3a] to-[#2a2826]", products: [
      product("Toyota RAV4 Hybrid", "Toyota", "From $33,350", "The answer that keeps answering.", 9.2, "Toyota's hybrid system is quiet, efficient, and backed by an ownership network that makes the decision easy.", ["Excellent efficiency", "Useful cargo", "Proven reliability"], ["Interior dated", "Road noise"], [{ label: "Efficiency", value: "39 mpg combined" }, { label: "Power", value: "219 hp" }, { label: "Cargo", value: "69.8 cu ft" }, { label: "Warranty", value: "3yr / 36k miles" }], "from-[#4a5a3a] to-[#111010]"),
      product("Honda CR-V Hybrid", "Honda", "From $35,700", "The most comfortable family default.", 9.0, "The CR-V gives a family the space, ride, and controls it needs without making efficiency feel like the point of the car.", ["Comfortable ride", "Spacious back seat", "Good visibility"], ["Hybrid trims pricey", "Infotainment average"], [{ label: "Efficiency", value: "40 mpg combined" }, { label: "Power", value: "204 hp" }, { label: "Cargo", value: "76.5 cu ft" }, { label: "Warranty", value: "3yr / 36k miles" }], "from-[#2a2826] to-[#4a5a3a]"),
      product("Kia Sportage Hybrid", "Kia", "From $28,790", "The value pick with a real interior.", 8.8, "Kia pairs a strong warranty and generous equipment with an efficient powertrain that feels more expensive than it is.", ["Excellent warranty", "Large cabin", "Good value"], ["Ride can float", "Touch controls distract"], [{ label: "Efficiency", value: "38 mpg combined" }, { label: "Power", value: "227 hp" }, { label: "Cargo", value: "74.1 cu ft" }, { label: "Warranty", value: "5yr / 60k miles" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-online-learning", slug: "online-learning-platforms", title: "The 3 Best Online Learning Platforms",
    kicker: "Education · Updated Jan 2026", summary: "We completed a course on each platform and scored teaching quality, practice, pacing, transcripts, and whether the lessons survived a busy week.", category: "Education", author: "Maya Chen", authorRole: "Learning Editor", updatedAt: "2026-01-16", readingTime: 12, popularity: 78, tested: 16,
    coverGradient: "from-[#4a5a3a] to-[#c99a3e]", products: [
      product("Coursera Plus", "Coursera", "$59/mo", "The broadest serious catalog.", 9.2, "Coursera is the best place to build a structured path from curiosity to a recognized credential.", ["University-quality courses", "Excellent exercises", "Clear paths"], ["Quality varies", "Subscription math"], [{ label: "Catalog", value: "10,000+ courses" }, { label: "Best for", value: "Career skills" }, { label: "Certificates", value: "Included" }, { label: "Offline", value: "Mobile downloads" }], "from-[#4a5a3a] to-[#111010]"),
      product("MasterClass", "MasterClass", "$120/year", "The best first hour of a new obsession.", 8.9, "MasterClass makes expert perspective feel cinematic, approachable, and easy to fit into an evening.", ["Excellent production", "Distinctive teachers", "Easy browsing"], ["Limited practice", "Some courses shallow"], [{ label: "Catalog", value: "200+ classes" }, { label: "Best for", value: "Creative skills" }, { label: "Certificates", value: "No" }, { label: "Offline", value: "Mobile downloads" }], "from-[#b8451e] to-[#2a2826]"),
      product("Brilliant", "Brilliant", "$24.99/mo", "Concepts you learn by doing.", 8.7, "Brilliant is the rare learning app that makes mathematics and science feel tactile rather than remedial.", ["Interactive lessons", "Excellent feedback", "Good daily habit"], ["Narrow subject range", "Subscription required"], [{ label: "Catalog", value: "Math, science, CS" }, { label: "Best for", value: "Conceptual fluency" }, { label: "Certificates", value: "No" }, { label: "Offline", value: "Selected lessons" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-language-learning-apps", slug: "language-learning-apps", title: "The 3 Best Language Learning Apps",
    kicker: "Education · Updated Feb 2026", summary: "We used each app for 30 days and tested recall, speaking confidence, listening comprehension, and how quickly the lessons became repetitive.", category: "Education", author: "Maya Chen", authorRole: "Learning Editor", updatedAt: "2026-02-05", readingTime: 10, popularity: 88, tested: 13,
    coverGradient: "from-[#c99a3e] to-[#b8451e]", products: [
      product("Pimsleur", "Pimsleur", "$15/mo", "The strongest speaking habit.", 9.3, "Pimsleur's audio-first method gets words into your mouth quickly, even if the interface looks like it missed a redesign.", ["Excellent pronunciation", "Hands-free practice", "Useful travel phrases"], ["Limited reading", "Interface dated"], [{ label: "Method", value: "Audio recall" }, { label: "Languages", value: "50+" }, { label: "Daily lesson", value: "30 minutes" }, { label: "Practice", value: "Speaking drills" }], "from-[#b8451e] to-[#c99a3e]"),
      product("Babbel", "Babbel", "$14.95/mo", "The best balanced course.", 9.0, "Babbel combines useful dialogues, grammar notes, and repetition into a course that feels adult and practical.", ["Useful dialogues", "Good grammar notes", "Clear progression"], ["Less playful", "Fewer languages"], [{ label: "Method", value: "Guided lessons" }, { label: "Languages", value: "14" }, { label: "Daily lesson", value: "15 minutes" }, { label: "Practice", value: "Speech, writing" }], "from-[#4a5a3a] to-[#111010]"),
      product("Duolingo", "Duolingo", "$12.99/mo", "The habit builder.", 8.7, "Duolingo is still the easiest app to open every day, especially for beginners who need a little game design on their side.", ["Excellent habit loop", "Generous free tier", "Large language list"], ["Grammar light", "Some exercises repetitive"], [{ label: "Method", value: "Gamified lessons" }, { label: "Languages", value: "40+" }, { label: "Daily lesson", value: "5-15 minutes" }, { label: "Practice", value: "Reading, listening" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-sleep-trackers", slug: "sleep-trackers", title: "The 3 Best Sleep Trackers",
    kicker: "Health · Updated Feb 2026", summary: "We compared sleep staging, comfort, wake detection, and whether each device gave advice that changed behavior rather than simply adding a score.", category: "Health", author: "Dr. Amara Singh", authorRole: "Health Editor", updatedAt: "2026-02-14", readingTime: 11, popularity: 86, tested: 8,
    coverGradient: "from-[#c99a3e] to-[#4a5a3a]", products: [
      product("Oura Ring 4", "Oura", "$349 + $6/mo", "The quietest way to notice your patterns.", 9.3, "Oura turns weeks of sleep and recovery signals into advice that is specific enough to use and calm enough to trust.", ["Comfortable overnight", "Strong trend insights", "Good battery"], ["Subscription required", "No live workout screen"], [{ label: "Form", value: "Smart ring" }, { label: "Battery", value: "7-8 days" }, { label: "Sensors", value: "Temperature, PPG" }, { label: "Best for", value: "Long-term trends" }], "from-[#c99a3e] to-[#111010]"),
      product("Apple Watch Series 11", "Apple", "$399", "The best all-round health watch.", 9.0, "Apple gives the most complete health feature set in a device people already wear for messages, music, and maps.", ["Broad health features", "Excellent ecosystem", "Useful alerts"], ["Nightly charging", "iPhone required"], [{ label: "Form", value: "Smartwatch" }, { label: "Battery", value: "Up to 24 hours" }, { label: "Sensors", value: "ECG, PPG, temperature" }, { label: "Best for", value: "Apple households" }], "from-[#b8451e] to-[#2a2826]"),
      product("Withings Sleep Analyzer", "Withings", "$149", "Sleep data without wearing anything.", 8.7, "The under-mattress sensor is the best option for people who dislike sleeping in a wearable but still want trends.", ["No wearable required", "Simple setup", "Snore detection"], ["Single sleeper", "Position sensitive"], [{ label: "Form", value: "Under-mattress pad" }, { label: "Power", value: "USB" }, { label: "Sensors", value: "Pressure, sound" }, { label: "Best for", value: "Sleep-first data" }], "from-[#4a5a3a] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-blood-pressure-monitors", slug: "blood-pressure-monitors", title: "The 3 Best Home Blood Pressure Monitors",
    kicker: "Health · Updated Jan 2026", summary: "We compared cuff fit, repeatability, setup, and data sharing against clinic readings. These are consumer devices, not diagnostic tools.", category: "Health", author: "Dr. Amara Singh", authorRole: "Health Editor", updatedAt: "2026-01-28", readingTime: 8, popularity: 74, tested: 10,
    coverGradient: "from-[#4a5a3a] to-[#c99a3e]", products: [
      product("Omron 10 Series", "Omron", "$69", "The reliable clinical-style cuff.", 9.4, "Omron's straightforward cuff produced the most consistent readings across arms and repeated checks.", ["Validated accuracy", "Dual-user memory", "Clear display"], ["Bulky case", "Bluetooth optional"], [{ label: "Cuff", value: "22-42cm upper arm" }, { label: "Memory", value: "2 x 100 readings" }, { label: "Power", value: "4 AA batteries" }, { label: "Validation", value: "Clinical protocol" }], "from-[#4a5a3a] to-[#111010]"),
      product("Withings BPM Connect", "Withings", "$99", "The best connected option.", 9.0, "Withings makes regular monitoring easier with one-button readings and a history that is simple to share with a clinician.", ["Wi-Fi sync", "Compact design", "Good app"], ["Cuff can feel tight", "Cloud account needed"], [{ label: "Cuff", value: "22-42cm upper arm" }, { label: "Memory", value: "Unlimited app history" }, { label: "Power", value: "Rechargeable" }, { label: "Validation", value: "Clinical protocol" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("QardioArm", "Qardio", "$99", "The portable cuff.", 8.7, "QardioArm packs into a travel case and gives useful trend reports without turning a reading into a project.", ["Very portable", "Shareable reports", "Simple app"], ["Phone required", "Battery life variable"], [{ label: "Cuff", value: "22-37cm upper arm" }, { label: "Memory", value: "App history" }, { label: "Power", value: "4 AAA batteries" }, { label: "Validation", value: "Clinical protocol" }], "from-[#b8451e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-white-sneakers", slug: "white-sneakers", title: "The 3 Best White Sneakers",
    kicker: "Fashion · Updated Feb 2026", summary: "We wore each pair through six weeks of commuting and travel, looking at leather quality, repairability, comfort, and how well the white actually stays white.", category: "Fashion", author: "Elena Park", authorRole: "Style Editor", updatedAt: "2026-02-19", readingTime: 9, popularity: 80, tested: 17,
    coverGradient: "from-[#ede7d9] to-[#111010]", products: [
      product("Common Projects Achilles", "Common Projects", "$465", "The clean original.", 9.1, "The Achilles still has the best balance of line, leather, and quiet branding, provided you can accept the price.", ["Excellent leather", "Timeless shape", "Resoleable construction"], ["Very expensive", "Break-in period"], [{ label: "Upper", value: "Full-grain leather" }, { label: "Sole", value: "Rubber" }, { label: "Origin", value: "Italy" }, { label: "Best for", value: "Minimal wardrobes" }], "from-[#ede7d9] to-[#2a2826]"),
      product("Adidas Stan Smith", "Adidas", "$100", "The democratic classic.", 8.8, "The Stan Smith is less precious, easier to replace, and still one of the most versatile sneakers ever made.", ["Affordable", "Comfortable", "Easy to find"], ["Synthetic versions vary", "Less durable sole"], [{ label: "Upper", value: "Leather or synthetic" }, { label: "Sole", value: "Rubber" }, { label: "Origin", value: "Vietnam" }, { label: "Best for", value: "Daily wear" }], "from-[#c99a3e] to-[#ede7d9]"),
      product("New Balance 550", "New Balance", "$120", "The retro court shoe with room.", 8.6, "The 550 gives wider feet a more forgiving shape and brings a little more visual character to a simple outfit.", ["Roomier fit", "Good value", "Retro shape"], ["Stiff at first", "Leather quality varies"], [{ label: "Upper", value: "Leather and mesh" }, { label: "Sole", value: "Rubber cupsole" }, { label: "Origin", value: "Asia" }, { label: "Best for", value: "Casual rotation" }], "from-[#111010] to-[#b8451e]"),
    ],
  }),
  ranking({
    id: "r-everyday-denim", slug: "everyday-denim", title: "The 3 Best Everyday Denim",
    kicker: "Fashion · Updated Jan 2026", summary: "We wore each pair through a season and washed them according to the maker's instructions, scoring fit stability, fabric character, and repair options.", category: "Fashion", author: "Elena Park", authorRole: "Style Editor", updatedAt: "2026-01-14", readingTime: 10, popularity: 73, tested: 14,
    coverGradient: "from-[#111010] to-[#4a5a3a]", products: [
      product("Levi's 501 Original", "Levi's", "$80", "The baseline for a reason.", 9.0, "The 501's straight leg, familiar rise, and global availability make it the easiest pair to recommend without knowing your entire wardrobe.", ["Classic fit", "Accessible price", "Many washes"], ["Sizing inconsistent", "Fabric varies"], [{ label: "Fit", value: "Straight, button fly" }, { label: "Fabric", value: "100% cotton" }, { label: "Weight", value: "12 oz typical" }, { label: "Repair", value: "Widely available" }], "from-[#111010] to-[#2a2826]"),
      product("3sixteen ST-120x", "3sixteen", "$220", "Denim with a long memory.", 9.3, "The ST-120x rewards patience with a beautiful, personal fade and a fit that stays composed through years of wear.", ["Excellent fabric", "Strong construction", "Distinct fades"], ["Stiff break-in", "Limited availability"], [{ label: "Fit", value: "Slim tapered" }, { label: "Fabric", value: "14.5 oz selvedge" }, { label: "Weight", value: "14.5 oz" }, { label: "Repair", value: "Brand repairs" }], "from-[#4a5a3a] to-[#111010]"),
      product("Uniqlo Selvedge", "Uniqlo", "$50", "The affordable gateway pair.", 8.7, "Uniqlo makes selvedge denim approachable, comfortable, and easy to wear from the first day.", ["Excellent value", "Comfortable fabric", "Easy returns"], ["Shorter lifespan", "Limited fades"], [{ label: "Fit", value: "Slim straight" }, { label: "Fabric", value: "Stretch selvedge" }, { label: "Weight", value: "12.5 oz" }, { label: "Repair", value: "Local tailor" }], "from-[#c99a3e] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-olive-oils", slug: "olive-oils", title: "The 3 Best Everyday Olive Oils",
    kicker: "Food & Drink · Updated Feb 2026", summary: "We tasted each oil raw, on warm bread, and in a simple vinaigrette to separate peppery character from the kind of bitter note that overwhelms dinner.", category: "Food & Drink", author: "Léa Moreau", authorRole: "Home Editor", updatedAt: "2026-02-02", readingTime: 7, popularity: 77, tested: 24,
    coverGradient: "from-[#4a5a3a] to-[#c99a3e]", products: [
      product("Brightland Alive", "Brightland", "$37", "Peppery enough to finish with.", 9.2, "Brightland has the freshness and gentle heat to make a weeknight salad taste intentional without turning it into a tasting flight.", ["Fresh flavor", "Opaque bottle", "Good finish"], ["Premium price", "Shorter shelf life"], [{ label: "Origin", value: "California" }, { label: "Harvest", value: "Fall 2025" }, { label: "Flavor", value: "Green, peppery" }, { label: "Format", value: "750ml tin" }], "from-[#4a5a3a] to-[#c99a3e]"),
      product("Graza Drizzle", "Graza", "$25", "The squeeze bottle that gets used.", 8.9, "Graza's easy bottle and grassy flavor make it the most likely to be reached for on an ordinary Tuesday.", ["Easy squeeze bottle", "Fresh grassy flavor", "Good value"], ["Plastic packaging", "Less subtle heat"], [{ label: "Origin", value: "Jaen, Spain" }, { label: "Harvest", value: "Current season" }, { label: "Flavor", value: "Grassy, mild" }, { label: "Format", value: "500ml squeeze" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("Cobram Estate California Select", "Cobram Estate", "$23", "The supermarket workhorse.", 8.7, "Cobram Estate offers dependable freshness and a balanced profile that works as both cooking oil and table oil.", ["Widely available", "Balanced profile", "Good traceability"], ["Bottle can sit warm", "Less intense finish"], [{ label: "Origin", value: "California" }, { label: "Harvest", value: "Fall 2025" }, { label: "Flavor", value: "Herbal, balanced" }, { label: "Format", value: "750ml bottle" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-non-alcoholic-aperitifs", slug: "non-alcoholic-aperitifs", title: "The 3 Best Non-Alcoholic Aperitifs",
    kicker: "Food & Drink · Updated Jan 2026", summary: "We served each over ice, with soda, and alongside dinner to find the bottles with enough bitterness and structure to feel like a drink, not a compromise.", category: "Food & Drink", author: "Léa Moreau", authorRole: "Home Editor", updatedAt: "2026-01-19", readingTime: 8, popularity: 75, tested: 15,
    coverGradient: "from-[#8a2f12] to-[#c99a3e]", products: [
      product("Ghia Original", "Ghia", "$33", "Bitter, bright, and grown-up.", 9.1, "Ghia brings enough citrus, gentian, and bitterness to hold its place in a proper aperitivo glass.", ["Complex bitterness", "Great with soda", "Distinctive bottle"], ["Acquired taste", "Pricey per serving"], [{ label: "Profile", value: "Bitter citrus" }, { label: "Serve", value: "1:2 with soda" }, { label: "Sweetener", value: "Low sugar" }, { label: "Bottle", value: "500ml" }], "from-[#8a2f12] to-[#c99a3e]"),
      product("Figlia Fiore", "Figlia", "$39", "Floral without becoming sweet.", 8.9, "Figlia's rose, hibiscus, and spice make it the most graceful option for a drink that should feel celebratory.", ["Beautiful aroma", "Good with tonic", "Low sweetness"], ["Floral for some", "Bottle pours slowly"], [{ label: "Profile", value: "Floral, spice" }, { label: "Serve", value: "1:3 with tonic" }, { label: "Sweetener", value: "Cane sugar" }, { label: "Bottle", value: "500ml" }], "from-[#b8451e] to-[#2a2826]"),
      product("Wilfred's Grove 42", "Wilfred's", "$29", "The easy highball.", 8.6, "Wilfred's orange, rosemary, and ginger make an unfussy long drink that works for a crowd.", ["Approachable flavor", "Good value", "Easy highball"], ["Less bitter", "Ginger dominates"], [{ label: "Profile", value: "Orange, herb" }, { label: "Serve", value: "1:3 with tonic" }, { label: "Sweetener", value: "Agave" }, { label: "Bottle", value: "700ml" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-documentary-streaming", slug: "documentary-streaming", title: "The 3 Best Documentary Streaming Services",
    kicker: "Streaming · Updated Jan 2026", summary: "We judged catalog depth, curation, new releases, subtitles, and whether the service can help you find the next film without a search engine.", category: "Streaming", author: "Maya Chen", authorRole: "Culture Editor", updatedAt: "2026-01-31", readingTime: 9, popularity: 70, tested: 7,
    coverGradient: "from-[#2a2826] to-[#b8451e]", products: [
      product("MUBI", "MUBI", "$14.99/mo", "A film club with a daily deadline.", 9.3, "MUBI's one-new-film-a-day model creates the rare streaming habit that feels like curation instead of accumulation.", ["Excellent curation", "Global cinema", "Beautiful interface"], ["Small catalog", "Films rotate quickly"], [{ label: "Catalog", value: "Curated, rotating" }, { label: "4K", value: "Selected titles" }, { label: "Subtitles", value: "Most titles" }, { label: "Best for", value: "Film discovery" }], "from-[#2a2826] to-[#b8451e]"),
      product("Curiosity Stream", "Curiosity Stream", "$4.99/mo", "The reliable science shelf.", 8.9, "Curiosity Stream gives curious households an unusually deep, affordable library of science and history films.", ["Affordable", "Strong science catalog", "Family-friendly"], ["Production varies", "Less cultural breadth"], [{ label: "Catalog", value: "3,000+ titles" }, { label: "4K", value: "Selected titles" }, { label: "Subtitles", value: "Most titles" }, { label: "Best for", value: "Science and history" }], "from-[#4a5a3a] to-[#111010]"),
      product("The Criterion Channel", "Criterion", "$10.99/mo", "The archive with context.", 9.1, "Criterion remains the best place to watch important films with the essays, interviews, and restorations that make them land.", ["Restored classics", "Great extras", "Expert programming"], ["Not all docs", "App experience uneven"], [{ label: "Catalog", value: "1,000+ films" }, { label: "4K", value: "Selected titles" }, { label: "Subtitles", value: "Most titles" }, { label: "Best for", value: "Film history" }], "from-[#c99a3e] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-robot-vacuums", slug: "robot-vacuums", title: "The 3 Best Robot Vacuums",
    kicker: "Home · Updated Feb 2026", summary: "We scattered crumbs, hair, and the occasional sock across hard floors and carpet to see which robots clean well without demanding a second job.", category: "Home", author: "Léa Moreau", authorRole: "Home Editor", updatedAt: "2026-02-25", readingTime: 12, popularity: 91, tested: 14,
    coverGradient: "from-[#4a5a3a] to-[#2a2826]", products: [
      product("Roborock Saros 10", "Roborock", "$1,599", "The robot that needs the least babysitting.", 9.4, "Roborock's navigation, mop lifting, and dock automation make it the closest thing to a housekeeper in a disc.", ["Excellent navigation", "Strong mop system", "Low maintenance"], ["Expensive", "App has many settings"], [{ label: "Suction", value: "22,000 Pa" }, { label: "Height", value: "3.14 inches" }, { label: "Dock", value: "Wash, dry, empty" }, { label: "Runtime", value: "180 minutes" }], "from-[#4a5a3a] to-[#111010]"),
      product("Dreame X50 Ultra", "Dreame", "$1,299", "The best obstacle climber.", 9.1, "Dreame handles thresholds, clutter, and edge cleaning with a confidence that suits complicated homes.", ["Climbs thresholds", "Good edge cleaning", "Strong dock"], ["Noisy dock", "Map edits complex"], [{ label: "Suction", value: "20,000 Pa" }, { label: "Height", value: "3.5 inches" }, { label: "Dock", value: "Wash, dry, empty" }, { label: "Runtime", value: "220 minutes" }], "from-[#2a2826] to-[#c99a3e]"),
      product("Eufy X10 Pro Omni", "Eufy", "$799", "The sensible value.", 8.8, "Eufy's X10 gives most homes strong vacuuming and good mopping for roughly half the cost of the flagships.", ["Good value", "Reliable mapping", "Useful dock"], ["Hair tangles", "Mop less precise"], [{ label: "Suction", value: "8,000 Pa" }, { label: "Height", value: "4.1 inches" }, { label: "Dock", value: "Wash, dry, empty" }, { label: "Runtime", value: "180 minutes" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-note-taking-apps", slug: "note-taking-apps", title: "The 3 Best Note-Taking Apps",
    kicker: "Productivity · Updated Feb 2026", summary: "We moved a real archive of meeting notes, research, and personal writing into each app to test retrieval, capture speed, and long-term portability.", category: "Productivity", author: "Daniel Reyes", authorRole: "Productivity Editor", updatedAt: "2026-02-11", readingTime: 11, popularity: 94, tested: 15,
    coverGradient: "from-[#111010] to-[#c99a3e]", products: [
      product("Obsidian", "Obsidian", "$50/year", "The durable local archive.", 9.3, "Obsidian gives serious note-takers control over files, links, and the shape of their own knowledge base.", ["Local Markdown files", "Powerful linking", "Huge plugin ecosystem"], ["Needs setup", "Sync costs extra"], [{ label: "Storage", value: "Local Markdown" }, { label: "Linking", value: "Backlinks, graph" }, { label: "Sync", value: "$4/mo optional" }, { label: "Platforms", value: "Mac, Win, iOS, Android" }], "from-[#111010] to-[#4a5a3a]"),
      product("Craft", "Craft Docs", "$10/mo", "The most pleasurable writing surface.", 9.1, "Craft makes notes feel like designed documents while keeping sharing and organization simple enough for a whole team.", ["Beautiful editing", "Fast sharing", "Good daily notes"], ["Export less flexible", "Pricing scales"], [{ label: "Storage", value: "Cloud documents" }, { label: "Linking", value: "Pages, blocks" }, { label: "Sync", value: "Included" }, { label: "Platforms", value: "Mac, Win, iOS, web" }], "from-[#c99a3e] to-[#111010]"),
      product("Bear", "Shiny Frog", "$2.99/mo", "The elegant personal notebook.", 8.8, "Bear is the best note app for someone who wants a calm writing tool, Markdown underneath, and almost no setup.", ["Fast capture", "Beautiful typography", "Simple tags"], ["Apple-only", "Collaboration limited"], [{ label: "Storage", value: "Cloud notes" }, { label: "Linking", value: "Tags, links" }, { label: "Sync", value: "Included" }, { label: "Platforms", value: "Mac, iPhone, iPad" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-task-managers", slug: "task-managers", title: "The 3 Best Task Managers",
    kicker: "Productivity · Updated Jan 2026", summary: "We ran work and home lists through each app for a month, tracking capture speed, recurring tasks, calendar context, and the cost of staying organized.", category: "Productivity", author: "Daniel Reyes", authorRole: "Productivity Editor", updatedAt: "2026-01-27", readingTime: 10, popularity: 90, tested: 12,
    coverGradient: "from-[#4a5a3a] to-[#111010]", products: [
      product("Todoist", "Doist", "$4/mo", "The best balance of power and calm.", 9.4, "Todoist handles work, errands, and recurring obligations without forcing any one productivity philosophy on you.", ["Fast capture", "Great recurring tasks", "Cross-platform"], ["Calendar view paid", "Collaboration basic"], [{ label: "Views", value: "List, board, calendar" }, { label: "Recurring", value: "Natural language" }, { label: "Platforms", value: "All major" }, { label: "Offline", value: "Yes" }], "from-[#4a5a3a] to-[#c99a3e]"),
      product("Things 3", "Cultured Code", "$49.99 one-time", "The most satisfying personal system.", 9.2, "Things is a beautifully constrained task manager for people who want a clear Today list and no team features in the way.", ["Excellent interaction design", "Great areas and projects", "No subscription"], ["Apple-only", "No collaboration"], [{ label: "Views", value: "Today, anytime, someday" }, { label: "Recurring", value: "Flexible schedules" }, { label: "Platforms", value: "Apple only" }, { label: "Offline", value: "Yes" }], "from-[#111010] to-[#4a5a3a]"),
      product("TickTick", "Appest", "$35/year", "The feature-rich value.", 8.8, "TickTick packs calendar, habits, focus timers, and tasks into one inexpensive system for people who want more surfaces.", ["Many built-in tools", "Good value", "Habit tracking"], ["Interface busy", "Some features hidden"], [{ label: "Views", value: "List, board, calendar" }, { label: "Recurring", value: "Advanced schedules" }, { label: "Platforms", value: "All major" }, { label: "Offline", value: "Yes" }], "from-[#b8451e] to-[#2a2826]"),
    ],
  }),
  ranking({
    id: "r-invoicing-software", slug: "invoicing-software", title: "The 3 Best Invoicing Software",
    kicker: "Business · Updated Feb 2026", summary: "We sent test invoices, accepted payments, chased late balances, and exported year-end records to see which tools reduce administrative drag for a small business.", category: "Business", author: "Jordan Ellis", authorRole: "Business Editor", updatedAt: "2026-02-03", readingTime: 9, popularity: 69, tested: 11,
    coverGradient: "from-[#4a5a3a] to-[#111010]", products: [
      product("FreshBooks", "FreshBooks", "$19/mo", "The friendliest client-facing invoice.", 9.2, "FreshBooks makes billing feel like part of the service, with clear invoices and useful reminders that do not feel aggressive.", ["Beautiful invoices", "Time tracking", "Good client portal"], ["Team seats add up", "Reports basic"], [{ label: "Best for", value: "Freelancers, agencies" }, { label: "Payments", value: "Cards, ACH" }, { label: "Expenses", value: "Receipt capture" }, { label: "Integrations", value: "100+" }], "from-[#4a5a3a] to-[#c99a3e]"),
      product("Wave", "Wave", "Free + processing", "The honest free starting point.", 8.9, "Wave is still the right first invoicing tool for a solo business that needs to get paid before it needs a finance department.", ["Free invoicing", "Simple setup", "Basic accounting"], ["Support limited", "Payroll varies by state"], [{ label: "Best for", value: "Solo businesses" }, { label: "Payments", value: "Cards, bank" }, { label: "Expenses", value: "Basic tracking" }, { label: "Integrations", value: "Bank feeds" }], "from-[#111010] to-[#4a5a3a]"),
      product("QuickBooks Online", "Intuit", "$35/mo", "The system your accountant already knows.", 8.7, "QuickBooks is more than invoicing, which is precisely why it wins for businesses that are ready for books, reports, and tax workflows.", ["Full accounting", "Accountant network", "Deep reports"], ["Interface busy", "Upsells frequent"], [{ label: "Best for", value: "Growing businesses" }, { label: "Payments", value: "Cards, ACH" }, { label: "Expenses", value: "Full accounting" }, { label: "Integrations", value: "750+" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-team-communication", slug: "team-communication-tools", title: "The 3 Best Team Communication Tools",
    kicker: "Business · Updated Jan 2026", summary: "We moved a distributed team into each tool and measured signal-to-noise, async clarity, search, and whether meetings actually went down.", category: "Business", author: "Samir Kapoor", authorRole: "Engineering Editor", updatedAt: "2026-01-21", readingTime: 12, popularity: 84, tested: 12,
    coverGradient: "from-[#111010] to-[#4a5a3a]", products: [
      product("Slack", "Salesforce", "$8.75/user/mo", "The best real-time layer.", 9.1, "Slack remains unmatched for fast collaboration when channels are named well and notifications are treated as a design problem.", ["Great integrations", "Fast search", "Strong huddles"], ["Notification noise", "History limits on free"], [{ label: "Best for", value: "Real-time teams" }, { label: "Async", value: "Threads, canvas" }, { label: "Search", value: "Strong, paid history" }, { label: "Integrations", value: "2,600+" }], "from-[#b8451e] to-[#2a2826]"),
      product("Microsoft Teams", "Microsoft", "$6/user/mo", "The practical enterprise default.", 8.9, "Teams becomes compelling when your company already lives in Microsoft 365 and needs meetings, files, and chat under one roof.", ["Office integration", "Video meetings", "Enterprise controls"], ["Interface dense", "External chat friction"], [{ label: "Best for", value: "Microsoft workplaces" }, { label: "Async", value: "Channels, posts" }, { label: "Search", value: "Tenant-wide" }, { label: "Integrations", value: "Microsoft 365" }], "from-[#4a5a3a] to-[#111010]"),
      product("Basecamp", "37signals", "$299/mo flat", "The calm alternative.", 8.7, "Basecamp deliberately limits chat and feeds, giving teams a slower, clearer place to work when urgency is not the product.", ["Flat pricing", "Clear projects", "Low distraction"], ["Fewer integrations", "Chat limited"], [{ label: "Best for", value: "Async projects" }, { label: "Async", value: "Message board, docs" }, { label: "Search", value: "Project search" }, { label: "Integrations", value: "API, add-ons" }], "from-[#c99a3e] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-fitness-watches", slug: "fitness-watches", title: "The 3 Best Fitness Watches",
    kicker: "Sports · Updated Mar 2026", summary: "We logged runs, rides, strength sessions, and recovery days with each watch to test GPS accuracy, training guidance, battery, and comfort.", category: "Sports", author: "Ade Okojie", authorRole: "Sports Editor", updatedAt: "2026-03-01", readingTime: 13, popularity: 86, tested: 9,
    coverGradient: "from-[#b8451e] to-[#4a5a3a]", products: [
      product("Garmin Forerunner 965", "Garmin", "$599", "The training watch that gets out of the way.", 9.4, "Garmin gives serious runners the best training depth, maps, and battery without making daily use feel like a spreadsheet.", ["Excellent training tools", "Great GPS", "Long battery"], ["Smart features basic", "Large on small wrists"], [{ label: "Battery", value: "Up to 23 days" }, { label: "GPS", value: "Multi-band" }, { label: "Display", value: "1.4-inch AMOLED" }, { label: "Maps", value: "Built-in topo" }], "from-[#b8451e] to-[#4a5a3a]"),
      product("COROS Pace Pro", "COROS", "$449", "The marathoner's value.", 9.1, "COROS nails the essentials for runners who want a light watch, long battery, and useful training feedback at a fairer price.", ["Lightweight", "Excellent battery", "Clear training load"], ["Music limited", "App less polished"], [{ label: "Battery", value: "Up to 20 days" }, { label: "GPS", value: "Dual-frequency" }, { label: "Display", value: "1.3-inch AMOLED" }, { label: "Maps", value: "Offline maps" }], "from-[#4a5a3a] to-[#111010]"),
      product("Apple Watch Ultra 2", "Apple", "$799", "The best watch for a mixed life.", 8.9, "Apple Watch Ultra is the best choice for athletes who also want the most capable everyday smartwatch and safety system.", ["Great smart features", "Accurate workouts", "Excellent safety tools"], ["Daily charging", "iPhone only"], [{ label: "Battery", value: "Up to 36 hours" }, { label: "GPS", value: "Dual-frequency" }, { label: "Display", value: "49mm OLED" }, { label: "Maps", value: "Offline maps" }], "from-[#111010] to-[#b8451e]"),
    ],
  }),
  ranking({
    id: "r-automatic-pet-feeders", slug: "automatic-pet-feeders", title: "The 3 Best Automatic Pet Feeders",
    kicker: "Pets · Updated Feb 2026", summary: "We tested portion consistency, jam resistance, app reliability, and how easy each hopper is to clean after a month of daily use.", category: "Pets", author: "Mina Alvarez", authorRole: "Pets Editor", updatedAt: "2026-02-07", readingTime: 8, popularity: 66, tested: 8,
    coverGradient: "from-[#c99a3e] to-[#4a5a3a]", products: [
      product("Petlibro Granary", "Petlibro", "$79", "The reliable everyday hopper.", 9.2, "Petlibro gets the important parts right: consistent portions, a sealed lid, and an app you do not need to understand.", ["Consistent portions", "Quiet motor", "Good hopper seal"], ["App setup", "Plastic bowl"], [{ label: "Capacity", value: "5L dry food" }, { label: "Portions", value: "1-50 per meal" }, { label: "Power", value: "USB-C + backup" }, { label: "Best for", value: "Cats, small dogs" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("Feeder-Robot", "Whisker", "$799", "For multi-pet households.", 9.0, "Whisker's feeder is expensive but thoughtful, especially when several pets need different portions and access rules.", ["Pet recognition", "Large capacity", "Excellent app"], ["Very expensive", "Large footprint"], [{ label: "Capacity", value: "32 cups" }, { label: "Portions", value: "Custom per pet" }, { label: "Power", value: "AC + backup" }, { label: "Best for", value: "Multi-pet homes" }], "from-[#4a5a3a] to-[#111010]"),
      product("WOPET SmartFeeder", "WOPET", "$49", "The affordable scheduled meal.", 8.6, "WOPET is a useful entry point for a single pet when you want schedules and a camera without a premium price.", ["Affordable", "Camera included", "Easy schedule"], ["Portion drift", "App ads"], [{ label: "Capacity", value: "6L dry food" }, { label: "Portions", value: "1-20 per meal" }, { label: "Power", value: "AC + backup" }, { label: "Best for", value: "Single pets" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-orthopedic-dog-beds", slug: "orthopedic-dog-beds", title: "The 3 Best Orthopedic Dog Beds",
    kicker: "Pets · Updated Jan 2026", summary: "We checked foam recovery, washable covers, edge support, and whether the beds stayed comfortable after weeks of digging, nesting, and naps.", category: "Pets", author: "Mina Alvarez", authorRole: "Pets Editor", updatedAt: "2026-01-13", readingTime: 7, popularity: 61, tested: 7,
    coverGradient: "from-[#4a5a3a] to-[#c99a3e]", products: [
      product("Big Barker 7-inch", "Big Barker", "$249", "The long-term support bed.", 9.3, "Big Barker's dense foam and generous warranty make it the safest bet for large dogs and older joints.", ["Excellent foam", "Strong edges", "10-year warranty"], ["Large and heavy", "Premium price"], [{ label: "Foam", value: "7-inch layered" }, { label: "Sizes", value: "S to XXL" }, { label: "Cover", value: "Machine washable" }, { label: "Best for", value: "Large dogs" }], "from-[#4a5a3a] to-[#111010]"),
      product("Furhaven Plush & Suede", "Furhaven", "$79", "The soft landing.", 8.9, "Furhaven offers supportive foam with a softer, nest-like top that suits dogs who circle before settling.", ["Good value", "Many shapes", "Easy-clean cover"], ["Foam less dense", "Bolsters flatten"], [{ label: "Foam", value: "Egg-crate orthopedic" }, { label: "Sizes", value: "S to XXL" }, { label: "Cover", value: "Machine washable" }, { label: "Best for", value: "Nesters" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("Casper Dog Bed", "Casper", "$149", "The thoughtfully engineered option.", 8.7, "Casper's bolsters and durable cover handle enthusiastic digging better than most beds in the middle of the market.", ["Durable cover", "Good support", "Tough construction"], ["Cover can be tight", "Limited colors"], [{ label: "Foam", value: "Memory + support" }, { label: "Sizes", value: "S to L" }, { label: "Cover", value: "Machine washable" }, { label: "Best for", value: "Diggers" }], "from-[#b8451e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-bookshelf-speakers", slug: "bookshelf-speakers", title: "The 3 Best Bookshelf Speakers",
    kicker: "Audio · Updated Mar 2026", summary: "Each pair ran the same 40-track listening panel — blind, level-matched, across three rooms — plus a month of ordinary evenings before we ranked anything.", category: "Audio", author: "Naomi Okafor", authorRole: "Senior Audio Editor", updatedAt: "2026-03-09", readingTime: 12, popularity: 74, tested: 14,
    coverGradient: "from-[#111010] to-[#b8451e]", products: [
      product("KEF LS50 Meta", "KEF", "$1,599/pair", "The reference point everyone else is chasing.", 9.4, "The Metamaterial absorption isn't marketing — imaging is so precise the speakers disappear, and nothing under $3,000 embarrassed them.", ["Holographic imaging", "Even off-axis response", "Superb build"], ["Needs a capable amp", "Bass wants a subwoofer"], [{ label: "Type", value: "2-way Uni-Q" }, { label: "Sensitivity", value: "85dB" }, { label: "Amp needed", value: "40W+ recommended" }, { label: "Best for", value: "Critical listening" }], "from-[#111010] to-[#2a2826]"),
      product("Q Acoustics 5020", "Q Acoustics", "$899/pair", "The musical middle ground.", 9.0, "Warm, generous, and forgiving of bad recordings — the pair our panel kept choosing for long evenings rather than short auditions.", ["Rich, full tone", "Easy to drive", "Lovely cabinets"], ["Less analytical detail", "Large for small shelves"], [{ label: "Type", value: "2-way bass reflex" }, { label: "Sensitivity", value: "87.5dB" }, { label: "Amp needed", value: "25W+ works" }, { label: "Best for", value: "Relaxed listening" }], "from-[#b8451e] to-[#4a2b1f]"),
      product("ELAC Debut 3.0 B5", "ELAC", "$399/pair", "Proof that entry-level isn't a compromise.", 8.8, "Andrew Jones' budget benchmark again: honest tuning and real dynamics at a price that makes the hobby accessible.", ["Outstanding value", "Balanced tuning", "Small-room friendly"], ["Vinyl finish is plain", "Ceiling on max volume"], [{ label: "Type", value: "2-way bass reflex" }, { label: "Sensitivity", value: "86.5dB" }, { label: "Amp needed", value: "20W+ works" }, { label: "Best for", value: "First real system" }], "from-[#4a5a3a] to-[#111010]"),
    ],
  }),
  ranking({
    id: "r-turntables", slug: "turntables", title: "The 3 Best Turntables",
    kicker: "Audio · Updated Feb 2026", summary: "We measured wow, flutter, and rumble on a test record, then lived with each deck through a hundred sides — cueing, swapping, and cleaning like a real owner.", category: "Audio", author: "Naomi Okafor", authorRole: "Senior Audio Editor", updatedAt: "2026-02-18", readingTime: 11, popularity: 68, tested: 11,
    coverGradient: "from-[#2a2826] to-[#c99a3e]", products: [
      product("Rega Planar 3", "Rega", "$1,125", "The deck you stop upgrading from.", 9.3, "Every measurement and every listening note pointed the same way: the Planar 3 simply gets out of the record's way.", ["Superb speed stability", "Excellent tonearm", "Upgrade path"], ["No built-in phono stage", "Manual speed change"], [{ label: "Drive", value: "Belt" }, { label: "Cartridge", value: "Elys 2 included" }, { label: "Phono stage", value: "External required" }, { label: "Best for", value: "Serious collections" }], "from-[#2a2826] to-[#0a0908]"),
      product("Pro-Ject Debut Carbon Evo", "Pro-Ject", "$599", "The sweet spot of new vinyl.", 9.0, "Carbon-fiber arm, decent cartridge, and a sound that flatters the format — the deck we recommend to most people, most often.", ["Carbon tonearm", "Quiet motor", "Nine finishes"], ["Felt mat attracts dust", "Speed box is basic"], [{ label: "Drive", value: "Belt" }, { label: "Cartridge", value: "Sumiko Rainier" }, { label: "Phono stage", value: "External required" }, { label: "Best for", value: "Committed starters" }], "from-[#c99a3e] to-[#8a6a26]"),
      product("Audio-Technica AT-LP120XUSB", "Audio-Technica", "$349", "The do-everything workhorse.", 8.7, "Direct drive, built-in phono stage, USB ripping — it isn't romantic, but it's the most useful deck under $400 by a distance.", ["Built-in phono stage", "USB archiving", "Pitch control"], ["Heavier platter noise", "Looks industrial"], [{ label: "Drive", value: "Direct" }, { label: "Cartridge", value: "AT-VM95E" }, { label: "Phono stage", value: "Built in" }, { label: "Best for", value: "First turntable" }], "from-[#b8451e] to-[#2a2826]"),
    ],
  }),
  ranking({
    id: "r-chefs-knives", slug: "chefs-knives", title: "The 3 Best Chef's Knives",
    kicker: "Kitchen · Updated Mar 2026", summary: "Four cooks, sixty pounds of onions, carrots, chicken, and squash — plus edge-retention testing on a controlled cutting board — decided these three.", category: "Kitchen", author: "Léa Moreau", authorRole: "Home Editor", updatedAt: "2026-03-02", readingTime: 10, popularity: 77, tested: 16,
    coverGradient: "from-[#8a2f12] to-[#2a2826]", products: [
      product("MAC Professional MTH-80", "MAC", "$155", "The knife professionals quietly agree on.", 9.5, "Light, thin, and scary-sharp out of the box — every tester's hand found it first by the end of week one.", ["Effortlessly sharp", "Perfect balance", "Dimples reduce sticking"], ["Needs careful drying", "Edge chips if abused"], [{ label: "Steel", value: "Molybdenum alloy" }, { label: "Edge", value: "15° double bevel" }, { label: "Weight", value: "184g" }, { label: "Care", value: "Hand wash only" }], "from-[#8a2f12] to-[#111010]"),
      product("Wüsthof Classic Ikon 8\"", "Wüsthof", "$200", "The German heavyweight, refined.", 9.1, "For cooks who like heft and a forgiving edge, the Ikon's balance and fit-and-finish remain the standard.", ["Durable edge", "Comfortable handle", "Lifetime warranty"], ["Heavier than Japanese rivals", "Thicker behind the edge"], [{ label: "Steel", value: "X50CrMoV15" }, { label: "Edge", value: "14° double bevel" }, { label: "Weight", value: "227g" }, { label: "Care", value: "Hand wash only" }], "from-[#2a2826] to-[#4a5a3a]"),
      product("Victorinox Fibrox Pro 8\"", "Victorinox", "$45", "The best first knife ever made.", 8.9, "Forty-five dollars buys a knife that outperformed blades at four times the price. Culinary schools use it for a reason.", ["Unbeatable value", "Grippy handle", "Easy to maintain"], ["Plain looks", "Edge needs frequent honing"], [{ label: "Steel", value: "Stainless X50" }, { label: "Edge", value: "15° double bevel" }, { label: "Weight", value: "180g" }, { label: "Care", value: "Dishwasher-safe (not advised)" }], "from-[#c99a3e] to-[#8a2f12]"),
    ],
  }),
  ranking({
    id: "r-dutch-ovens", slug: "dutch-ovens", title: "The 3 Best Dutch Ovens",
    kicker: "Kitchen · Updated Jan 2026", summary: "Bread, braises, and a deliberately scorched tomato sauce: we tested heat evenness, lid seal, cleanup, and how each enamel survived six months of real cooking.", category: "Kitchen", author: "Léa Moreau", authorRole: "Home Editor", updatedAt: "2026-01-26", readingTime: 9, popularity: 71, tested: 12,
    coverGradient: "from-[#b8451e] to-[#8a2f12]", products: [
      product("Le Creuset 5.5-Qt Round", "Le Creuset", "$420", "The heirloom that earns its price.", 9.4, "Lighter than every rival, the most forgiving enamel we tested, and the one pot our testers fought to keep after the review.", ["Lightest in class", "Durable enamel", "Even, gentle heat"], ["Expensive", "Light interior stains"], [{ label: "Capacity", value: "5.5 quarts" }, { label: "Weight", value: "5.1kg" }, { label: "Oven max", value: "260°C" }, { label: "Warranty", value: "Lifetime" }], "from-[#b8451e] to-[#4a2b1f]"),
      product("Staub 5.5-Qt Cocotte", "Staub", "$390", "The braising specialist.", 9.2, "The black matte interior hides stains and the spiked lid genuinely bastes — braises came out measurably moister.", ["Self-basting lid", "Stain-proof interior", "Beautiful colors"], ["Heavier than Le Creuset", "Interior hard to monitor"], [{ label: "Capacity", value: "5.5 quarts" }, { label: "Weight", value: "5.9kg" }, { label: "Oven max", value: "260°C" }, { label: "Warranty", value: "Lifetime" }], "from-[#2a2826] to-[#0a0908]"),
      product("Lodge 6-Qt Enameled", "Lodge", "$90", "Ninety dollars of honest cast iron.", 8.8, "It's heavier and the enamel is less refined — but it braises, bakes, and simmers within a whisker of pots costing four times more.", ["Exceptional value", "Great heat retention", "Large capacity"], ["Heavy", "Enamel chips at rim over years"], [{ label: "Capacity", value: "6 quarts" }, { label: "Weight", value: "7.1kg" }, { label: "Oven max", value: "260°C" }, { label: "Warranty", value: "Limited lifetime" }], "from-[#4a5a3a] to-[#2e3a23]"),
    ],
  }),
  ranking({
    id: "r-backpacking-tents", slug: "backpacking-tents", title: "The 3 Best Backpacking Tents",
    kicker: "Outdoors · Updated Feb 2026", summary: "Three weekends of wind, one genuinely miserable storm, and a garden-hose rain rig: we pitched, packed, and slept in every tent before ranking.", category: "Outdoors", author: "Hiroshi Tanaka", authorRole: "Travel Editor", updatedAt: "2026-02-13", readingTime: 11, popularity: 63, tested: 10,
    coverGradient: "from-[#2e3a23] to-[#4a5a3a]", products: [
      product("Big Agnes Copper Spur HV UL2", "Big Agnes", "$550", "The benchmark ultralight two-person.", 9.3, "The rare ultralight that doesn't feel fragile — livable headroom, clever vestibules, and 1.3kg on the scale.", ["Genuinely light", "Two doors, two vestibules", "Fast setup"], ["Thin floor needs a footprint", "Premium price"], [{ label: "Weight", value: "1.36kg packed" }, { label: "Floor", value: "2.7m²" }, { label: "Doors", value: "2" }, { label: "Season", value: "3-season" }], "from-[#2e3a23] to-[#111010]"),
      product("MSR Hubba Hubba LT 2", "MSR", "$580", "The one for bad-weather optimists.", 9.0, "It shrugged off our storm night with the least flex and the driest gear — the tent we'd take when the forecast is a lie.", ["Excellent wind stability", "Durable fabrics", "Easy solo pitch"], ["Heavier than Copper Spur", "Smaller vestibules"], [{ label: "Weight", value: "1.58kg packed" }, { label: "Floor", value: "2.6m²" }, { label: "Doors", value: "2" }, { label: "Season", value: "3-season" }], "from-[#4a5a3a] to-[#2a2826]"),
      product("REI Half Dome SL 2+", "REI", "$329", "Comfort per dollar, uncontested.", 8.8, "Roomier than both rivals and hundreds cheaper — carry the extra half kilo and your wallet and shoulders can argue it out.", ["Spacious interior", "Great value", "Thoughtful pockets"], ["Heaviest here", "Bulkier packed size"], [{ label: "Weight", value: "1.98kg packed" }, { label: "Floor", value: "3.3m²" }, { label: "Doors", value: "2" }, { label: "Season", value: "3-season" }], "from-[#c99a3e] to-[#4a5a3a]"),
    ],
  }),
  ranking({
    id: "r-daypacks", slug: "day-hike-backpacks", title: "The 3 Best Day-Hike Backpacks",
    kicker: "Outdoors · Updated Jan 2026", summary: "Ten packs, 140 trail kilometers, one water-bladder leak test each. We scored carry comfort loaded at 6kg, organization, and how each back panel handled a sweaty climb.", category: "Outdoors", author: "Hiroshi Tanaka", authorRole: "Travel Editor", updatedAt: "2026-01-19", readingTime: 8, popularity: 58, tested: 13,
    coverGradient: "from-[#4a5a3a] to-[#c99a3e]", products: [
      product("Osprey Talon 22", "Osprey", "$145", "The daypack other daypacks copy.", 9.2, "The AirScape back panel and hipbelt carry 6kg like 3 — after five hours nobody wanted to swap packs.", ["Superb carry comfort", "Excellent organization", "Durable build"], ["Slightly warm back", "No rain cover included"], [{ label: "Volume", value: "22L" }, { label: "Weight", value: "0.87kg" }, { label: "Frame", value: "AirScape panel" }, { label: "Rain cover", value: "Sold separately" }], "from-[#4a5a3a] to-[#111010]"),
      product("Deuter Speed Lite 21", "Deuter", "$110", "The fast-and-light favourite.", 8.9, "Barely there on the shoulders and stable at a jog — the pick for movers who count grams but still want structure.", ["Very light", "Stable when moving", "Clean design"], ["Thinner padding", "Fewer pockets"], [{ label: "Volume", value: "21L" }, { label: "Weight", value: "0.65kg" }, { label: "Frame", value: "Flexlite panel" }, { label: "Rain cover", value: "Sold separately" }], "from-[#2e3a23] to-[#4a5a3a]"),
      product("REI Flash 22", "REI", "$60", "The sixty-dollar overachiever.", 8.7, "It gives up polish, not function — for casual day hikes it does 90% of what the Osprey does at 40% of the price.", ["Outstanding value", "Packable and light", "Comfortable enough"], ["Basic back panel", "Less durable fabric"], [{ label: "Volume", value: "22L" }, { label: "Weight", value: "0.4kg" }, { label: "Frame", value: "Foam sheet" }, { label: "Rain cover", value: "None" }], "from-[#c99a3e] to-[#8a6a26]"),
    ],
  }),
  ranking({
    id: "r-video-doorbells", slug: "video-doorbells", title: "The 3 Best Video Doorbells",
    kicker: "Smart Home · Updated Mar 2026", summary: "Three months on three different doors: we measured detection accuracy, alert latency, night clarity, and — because it matters — how each company treats your footage.", category: "Smart Home", author: "Samir Kapoor", authorRole: "Engineering Editor", updatedAt: "2026-03-06", readingTime: 10, popularity: 72, tested: 9,
    coverGradient: "from-[#2a2826] to-[#c99a3e]", products: [
      product("Ring Battery Doorbell Pro", "Ring", "$230", "The most complete package.", 9.1, "Radar-backed detection cut false alerts to nearly zero, and the app remains the one house guests can operate without a briefing.", ["Accurate 3D detection", "Excellent app", "Head-to-toe view"], ["Subscription for recording", "Amazon account required"], [{ label: "Power", value: "Battery or wired" }, { label: "Resolution", value: "1536p HDR" }, { label: "Storage", value: "Cloud (plan)" }, { label: "Subscription", value: "From $4.99/mo" }], "from-[#2a2826] to-[#111010]"),
      product("Google Nest Doorbell (wired)", "Google", "$180", "The smartest eyes on the porch.", 8.9, "On-device intelligence recognises people, packages, and the neighbour's cat correctly more often than anything else we tested.", ["Best detection AI", "3 hours free event history", "Clean design"], ["Needs existing wiring", "Aware plan for full history"], [{ label: "Power", value: "Wired" }, { label: "Resolution", value: "960p HDR" }, { label: "Storage", value: "Cloud, 3h free" }, { label: "Subscription", value: "From $8/mo" }], "from-[#4a5a3a] to-[#2a2826]"),
      product("Eufy Video Doorbell E340", "Eufy", "$180", "No subscription, no problem.", 8.8, "Dual cameras cover face and doormat, and local storage means the monthly fee is zero — the value pick for the privacy-minded.", ["Local storage included", "Dual camera view", "No monthly fee"], ["App less polished", "Cloud features limited"], [{ label: "Power", value: "Battery or wired" }, { label: "Resolution", value: "2K dual-cam" }, { label: "Storage", value: "8GB local" }, { label: "Subscription", value: "None required" }], "from-[#b8451e] to-[#2a2826]"),
    ],
  }),
  ranking({
    id: "r-smart-thermostats", slug: "smart-thermostats", title: "The 3 Best Smart Thermostats",
    kicker: "Smart Home · Updated Feb 2026", summary: "A full winter across three homes with utility-bill baselines from the year before. We tracked comfort, schedule intelligence, and the actual money saved.", category: "Smart Home", author: "Samir Kapoor", authorRole: "Engineering Editor", updatedAt: "2026-02-09", readingTime: 9, popularity: 65, tested: 8,
    coverGradient: "from-[#111010] to-[#4a5a3a]", products: [
      product("Ecobee Smart Thermostat Premium", "Ecobee", "$250", "The whole-home comfort brain.", 9.2, "The included room sensor fixed the cold-bedroom problem no other thermostat solved, and it trimmed 11% off our test-home bill.", ["Room sensors included", "Works with everything", "Air quality monitor"], ["Busiest interface", "Premium price"], [{ label: "Sensors", value: "1 room sensor incl." }, { label: "Works with", value: "HomeKit, Alexa, Google" }, { label: "Display", value: "Touch, glass" }, { label: "Savings (tested)", value: "~11%" }], "from-[#111010] to-[#2a2826]"),
      product("Google Nest Learning (4th gen)", "Google", "$280", "Set it, forget it, save anyway.", 9.0, "A week of normal life and it had our schedule figured out — the best pick for people who never want to program anything.", ["True auto-learning", "Beautiful hardware", "Clear energy history"], ["Fewer HVAC integrations", "No HomeKit support"], [{ label: "Sensors", value: "Optional add-on" }, { label: "Works with", value: "Google, Alexa" }, { label: "Display", value: "Rotating dial" }, { label: "Savings (tested)", value: "~9%" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("Amazon Smart Thermostat", "Amazon", "$80", "Smart heating for the price of dinner.", 8.6, "It skips the sensors and the learning, keeps the savings — the honest budget answer for simple one-zone homes.", ["Very affordable", "Simple, reliable", "Alexa hunches work"], ["No remote sensors", "Requires C-wire or kit"], [{ label: "Sensors", value: "None" }, { label: "Works with", value: "Alexa only" }, { label: "Display", value: "Touch" }, { label: "Savings (tested)", value: "~7%" }], "from-[#b8451e] to-[#c99a3e]"),
    ],
  }),
  ranking({
    id: "r-electric-razors", slug: "electric-razors", title: "The 3 Best Electric Razors",
    kicker: "Grooming · Updated Feb 2026", summary: "Six weeks, five beard types, one shared scoring sheet: closeness measured against a manual-blade control, plus irritation notes logged every morning.", category: "Grooming", author: "Amara Diallo", authorRole: "Grooming Editor", updatedAt: "2026-02-21", readingTime: 9, popularity: 59, tested: 12,
    coverGradient: "from-[#b8451e] to-[#2a2826]", products: [
      product("Braun Series 9 Pro+", "Braun", "$330", "The closest foil shave, full stop.", 9.3, "On every beard type it got closest to the manual-blade control while causing the least irritation — the category's quiet benchmark.", ["Closest foil shave", "Gentle on skin", "Superb build"], ["Expensive", "Heads cost real money"], [{ label: "Type", value: "Foil, 5 elements" }, { label: "Battery", value: "60 min" }, { label: "Wet/dry", value: "Yes" }, { label: "Head cost", value: "$45/18mo" }], "from-[#2a2826] to-[#111010]"),
      product("Panasonic Arc6", "Panasonic", "$300", "The technical marvel for heavy beards.", 9.1, "Six blades and a motor that never bogs down — dense three-day growth came off in single passes nothing else managed.", ["Fastest on thick beards", "Excellent display", "Responsive motor"], ["Large head takes practice", "Loud at full speed"], [{ label: "Type", value: "Foil, 6 blades" }, { label: "Battery", value: "50 min" }, { label: "Wet/dry", value: "Yes" }, { label: "Head cost", value: "$50/2yr" }], "from-[#111010] to-[#4a5a3a]"),
      product("Philips Norelco 7500", "Philips", "$150", "The rotary pick for sensitive skin.", 8.7, "Rotary heads glide where foils scrape — testers with reactive skin finished the six weeks irritation-free for half the flagship price.", ["Gentlest on skin", "Great value", "Easy to clean"], ["Less close than foils", "Slower on flat areas"], [{ label: "Type", value: "Rotary, 3 heads" }, { label: "Battery", value: "60 min" }, { label: "Wet/dry", value: "Yes" }, { label: "Head cost", value: "$40/2yr" }], "from-[#c99a3e] to-[#b8451e]"),
    ],
  }),
  ranking({
    id: "r-hair-dryers", slug: "hair-dryers", title: "The 3 Best Hair Dryers",
    kicker: "Grooming · Updated Jan 2026", summary: "Dry-time trials on four hair types, heat-damage checks with an infrared thermometer, and a decibel meter at arm's length — glamour, quantified.", category: "Grooming", author: "Amara Diallo", authorRole: "Grooming Editor", updatedAt: "2026-01-29", readingTime: 8, popularity: 54, tested: 11,
    coverGradient: "from-[#c99a3e] to-[#8a2f12]", products: [
      product("Dyson Supersonic", "Dyson", "$430", "Still the one to beat.", 9.2, "Fastest dry times on every hair type with the lowest measured heat — five years on, nothing fully catches it.", ["Fastest drying", "Intelligent heat control", "Light and balanced"], ["Very expensive", "Magnetic attachments get lost"], [{ label: "Weight", value: "660g" }, { label: "Heat settings", value: "4 + cold shot" }, { label: "Attachments", value: "5 included" }, { label: "Noise", value: "79dB measured" }], "from-[#2a2826] to-[#b8451e]"),
      product("Shark HyperAIR", "Shark", "$230", "Ninety percent of the Dyson for half.", 8.9, "Auto-adjusting heat and near-flagship dry times — the sensible answer for anyone who blinks at a $400 dryer.", ["Excellent dry speed", "Auto heat modes", "Good attachments"], ["Bulkier body", "Louder than Dyson"], [{ label: "Weight", value: "700g" }, { label: "Heat settings", value: "3 + cool" }, { label: "Attachments", value: "2 included" }, { label: "Noise", value: "83dB measured" }], "from-[#c99a3e] to-[#4a5a3a]"),
      product("Rusk W8less", "Rusk", "$70", "The salon secret at a drugstore price.", 8.6, "Stylists have bought it for years for a reason: light, durable, and quick enough that the price feels like a clerical error.", ["Genuinely lightweight", "Salon-grade motor", "Bargain price"], ["No auto heat", "Basic attachments"], [{ label: "Weight", value: "450g" }, { label: "Heat settings", value: "3 + cold shot" }, { label: "Attachments", value: "2 included" }, { label: "Noise", value: "85dB measured" }], "from-[#b8451e] to-[#8a2f12]"),
    ],
  }),
];

// ---------------------------------------------------------------------------
// Cover imagery for rankings whose products shipped without photos.
// Topic-matched Pexels photo IDs, each verified to resolve on the CDN.
// Applied product-by-product below, so any hand-set product image wins.
// ---------------------------------------------------------------------------
const px = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const RANKING_IMAGES = {
  "r-mechanical-keyboards": ["9020272", "4065748", "5380584"],
  "r-coffee-makers": ["3936163", "6612594", "27860686"],
  "r-ai-coding": ["2004161", "1921326", "4976712"],
  "r-streaming": ["9807277", "21792098", "12475131"],
  "r-credit-cards": ["5239804", "5242822", "4968635"],
  "r-running-shoes": ["260044", "6951787", "17695225"],
  "r-ai-image-generators": ["7989026", "7563475", "16313516"],
  "r-project-management": ["7693103", "17724732", "17724742"],
  "r-small-business-crm": ["1181370", "7437087", "7792836"],
  "r-high-yield-savings": ["3943715", "9929281", "6863252"],
  "r-europe-city-breaks": ["20197709", "19295175", "19560867"],
  "r-everyday-luxury-watches": ["190819", "16739804", "31642726"],
  "r-design-hotels": ["7746092", "14547138", "14750392"],
  "r-travel-cameras": ["3497120", "13987297", "13987300"],
  "r-photo-printers": ["7015072", "7015073", "1226721"],
  "r-handheld-gaming": ["28978366", "34482313", "3162024"],
  "r-gaming-monitors": ["7858742", "31862217", "7915281"],
  "r-hybrid-crossovers": ["17612417", "20707196", "17761661"],
  "r-online-learning": ["4260484", "5905945", "4260481"],
  "r-language-learning-apps": ["5408854", "33906738", "32410282"],
  "r-sleep-trackers": ["10608085", "18243488", "7504657"],
  "r-blood-pressure-monitors": ["8670204", "7659573", "8088865"],
  "r-white-sneakers": ["11324518", "8147433", "18286290"],
  "r-everyday-denim": ["10133274", "10133278", "10133275"],
  "r-olive-oils": ["31275834", "25745506", "7296399"],
  "r-non-alcoholic-aperitifs": ["9119755", "128242", "14387125"],
  "r-documentary-streaming": ["19374140", "11092278", "34084878"],
  "r-robot-vacuums": ["7641488", "7641526", "35147280"],
  "r-note-taking-apps": ["204511", "7504756", "38048095"],
  "r-task-managers": ["131979", "8386682", "11616422"],
  "r-invoicing-software": ["7688524", "7680696", "7680742"],
  "r-team-communication": ["7212946", "8204363", "5918384"],
  "r-fitness-watches": ["267391", "1080745", "374619"],
  "r-automatic-pet-feeders": ["18418977", "5822458", "35030848"],
  "r-orthopedic-dog-beds": ["2102839", "8191847", "545016"],
  "r-bookshelf-speakers": ["19482598", "33911171", "776101"],
  "r-turntables": ["26315454", "36471696", "27383826"],
  "r-chefs-knives": ["6294409", "37923422", "8629044"],
  "r-dutch-ovens": ["30507250", "17966611", "34363709"],
  "r-backpacking-tents": ["30482810", "14100743", "4268094"],
  "r-daypacks": ["5937273", "9187307", "30829443"],
  "r-video-doorbells": ["19227220", "14750384", "18833129"],
  "r-smart-thermostats": ["27638181", "7616651", "36077581"],
  "r-electric-razors": ["7518745", "8867401", "6336662"],
  "r-hair-dryers": ["3993328", "696285", "3993471"],
};

export const rankings = [...baseRankings, ...supplementalRankings].map((r) => {
  const imgs = RANKING_IMAGES[r.id];
  if (!imgs) return r;
  return {
    ...r,
    products: r.products.map((p, i) => (p.image ? p : { ...p, image: px(imgs[i]) })),
  };
});

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const categories = [
  { id: "c-tech", slug: "technology", name: "Technology", count: 2, tagline: "Tools that earn their place on your desk.", symbol: "◐", tone: "from-[#111010] to-[#2a2826]" },
  { id: "c-ai", slug: "ai", name: "Artificial Intelligence", count: 2, tagline: "The honest guide to a noisy field.", symbol: "✦", tone: "from-[#b8451e] to-[#8a2f12]" },
  { id: "c-software", slug: "software", name: "Software", count: 2, tagline: "Systems that make good work easier.", symbol: "⌘", tone: "from-[#111010] to-[#4a5a3a]" },
  { id: "c-finance", slug: "finance", name: "Finance", count: 2, tagline: "Cards, accounts, and the fine print read for you.", symbol: "∞", tone: "from-[#4a5a3a] to-[#2e3a23]" },
  { id: "c-travel", slug: "travel", name: "Travel", count: 2, tagline: "Places worth the flight.", symbol: "◉", tone: "from-[#c99a3e] to-[#8a6a26]" },
  { id: "c-luxury", slug: "luxury", name: "Luxury", count: 2, tagline: "Craftsmanship, not logos.", symbol: "❖", tone: "from-[#2a2826] to-[#0a0908]" },
  { id: "c-photography", slug: "photography", name: "Photography", count: 2, tagline: "Gear that disappears in your hand.", symbol: "◎", tone: "from-[#111010] to-[#4a5a3a]" },
  { id: "c-gaming", slug: "gaming", name: "Gaming", count: 2, tagline: "Frames, feel, and the games worth your evening.", symbol: "▲", tone: "from-[#b8451e] to-[#c99a3e]" },
  { id: "c-auto", slug: "automotive", name: "Automotive", count: 2, tagline: "Driven, measured, re-driven.", symbol: "◈", tone: "from-[#2a2826] to-[#4a5a3a]" },
  { id: "c-edu", slug: "education", name: "Education", count: 2, tagline: "Learning that respects your time.", symbol: "§", tone: "from-[#4a5a3a] to-[#c99a3e]" },
  { id: "c-health", slug: "health", name: "Health", count: 2, tagline: "Evidence over enthusiasm.", symbol: "+", tone: "from-[#c99a3e] to-[#b8451e]" },
  { id: "c-fashion", slug: "fashion", name: "Fashion", count: 2, tagline: "Pieces that outlive trends.", symbol: "◊", tone: "from-[#111010] to-[#b8451e]" },
  { id: "c-food", slug: "food-drink", name: "Food & Drink", count: 2, tagline: "Taste, tested.", symbol: "✧", tone: "from-[#8a2f12] to-[#c99a3e]" },
  { id: "c-streaming", slug: "streaming", name: "Streaming", count: 2, tagline: "What's actually worth opening twice a week.", symbol: "▷", tone: "from-[#2a2826] to-[#b8451e]" },
  { id: "c-home", slug: "home", name: "Home", count: 2, tagline: "Objects you'll keep for a decade.", symbol: "□", tone: "from-[#4a5a3a] to-[#2a2826]" },
  { id: "c-prod", slug: "productivity", name: "Productivity", count: 2, tagline: "Tools that remove friction.", symbol: "→", tone: "from-[#111010] to-[#c99a3e]" },
  { id: "c-biz", slug: "business", name: "Business", count: 2, tagline: "Software your CFO won't regret.", symbol: "△", tone: "from-[#4a5a3a] to-[#111010]" },
  { id: "c-sports", slug: "sports", name: "Sports", count: 2, tagline: "Gear that holds up at mile 20.", symbol: "○", tone: "from-[#b8451e] to-[#4a5a3a]" },
  { id: "c-pets", slug: "pets", name: "Pets", count: 2, tagline: "For the ones who don't read reviews.", symbol: "♡", tone: "from-[#c99a3e] to-[#4a5a3a]" },
  { id: "c-audio", slug: "audio", name: "Audio", count: 2, tagline: "Listened to for weeks, measured for days.", symbol: "∿", tone: "from-[#111010] to-[#b8451e]" },
  { id: "c-kitchen", slug: "kitchen", name: "Kitchen", count: 2, tagline: "Tools that survive the Sunday rush.", symbol: "❋", tone: "from-[#8a2f12] to-[#2a2826]" },
  { id: "c-outdoors", slug: "outdoors", name: "Outdoors", count: 2, tagline: "Packed, carried, rained on, re-tested.", symbol: "▽", tone: "from-[#2e3a23] to-[#4a5a3a]" },
  { id: "c-smart-home", slug: "smart-home", name: "Smart Home", count: 2, tagline: "Convenience that doesn't call home too often.", symbol: "⌂", tone: "from-[#2a2826] to-[#c99a3e]" },
  { id: "c-grooming", slug: "grooming", name: "Grooming", count: 2, tagline: "Daily rituals, honestly reviewed.", symbol: "✳", tone: "from-[#b8451e] to-[#2a2826]" },
];

// ---------------------------------------------------------------------------
// Trending (weekly)
// ---------------------------------------------------------------------------
export const trending = [
  { slug: "wireless-earbuds", title: "Wireless Earbuds", delta: "+38%", views: "184k" },
  { slug: "ai-coding-assistants", title: "AI Coding Assistants", delta: "+62%", views: "412k" },
  { slug: "electric-suvs", title: "Electric SUVs", delta: "+21%", views: "96k" },
  { slug: "streaming-services", title: "Streaming Services", delta: "+14%", views: "228k" },
  { slug: "travel-credit-cards", title: "Travel Credit Cards", delta: "+27%", views: "151k" },
  { slug: "mechanical-keyboards", title: "Mechanical Keyboards", delta: "+9%", views: "78k" },
  { slug: "running-shoes-daily", title: "Daily Running Shoes", delta: "+18%", views: "64k" },
];

// ---------------------------------------------------------------------------
// Editor's picks (curated selection of ranking IDs)
// ---------------------------------------------------------------------------
export const editorsPickIds = ["r-ai-coding", "r-national-parks", "r-coffee-makers", "r-credit-cards"];

// ---------------------------------------------------------------------------
// Editorial standards
// ---------------------------------------------------------------------------
export const editorialStandards = [
  {
    title: "We buy, or we disclose.",
    body: "Every product we review is purchased at retail or provided on loan with a signed return agreement. If a brand comped a unit, we say so at the top of the review.",
  },
  {
    title: "No affiliate influence.",
    body: "Affiliate revenue never determines ranking. A $20 pick that tests best will always outrank a $2,000 pick that tests second. Compensation is listed on every page.",
  },
  {
    title: "Testing is public.",
    body: "Every ranking links to its methodology. You can see the exact tests, the raw measurements, and the panel of reviewers. We update methods annually.",
  },
  {
    title: "Re-tests, not re-runs.",
    body: "When a product updates — firmware, recipe, revision — we re-test. Rankings that haven't been re-verified in 12 months are marked, and often retired.",
  },
];

// ---------------------------------------------------------------------------
// How we test (pipeline steps)
// ---------------------------------------------------------------------------
export const testPipeline = [
  { step: "01", name: "Longlist", detail: "We begin with every serious contender in the category — typically 20 to 60 products." },
  { step: "02", name: "Screen", detail: "Objective filters (safety certifications, warranty minimums, return policies) cut the list to 12–15." },
  { step: "03", name: "Test", detail: "A structured protocol, run by at least two reviewers, with raw measurements logged to a public sheet." },
  { step: "04", name: "Live", detail: "Finalists live with an editor for a minimum of 14 days. First-week impressions are discarded." },
  { step: "05", name: "Rank", detail: "Scores are weighted by what users actually report caring about — based on annual reader surveys." },
  { step: "06", name: "Publish", detail: "Drafts are reviewed by an editor who did not test, and by a subject-matter expert outside the team." },
  { step: "07", name: "Revisit", detail: "Every ranking is re-verified at least annually. Lapsed rankings are marked or retired." },
];

// ---------------------------------------------------------------------------
// Experts
// ---------------------------------------------------------------------------
export const experts = [
  { name: "Naomi Okafor", role: "Senior Audio Editor", focus: "Headphones, speakers, home audio", years: 11, bio: "Former mastering engineer at Abbey Road. Reviews with her ears, not the spec sheet.", initials: "NO" },
  { name: "Daniel Reyes", role: "Peripherals Editor", focus: "Keyboards, mice, monitors", years: 9, bio: "Types 140 WPM. Still insists on Cherry MX Brown as a baseline.", initials: "DR" },
  { name: "Priya Menon", role: "Automotive Editor", focus: "EVs, efficiency, road trips", years: 13, bio: "Drove the Pan-American Highway in an Ioniq 5. Has receipts.", initials: "PM" },
  { name: "Hiroshi Tanaka", role: "Travel Editor", focus: "National parks, long-haul flights, hotels", years: 16, bio: "63 national parks, four passports. Will tell you about each.", initials: "HT" },
  { name: "Léa Moreau", role: "Home Editor", focus: "Kitchen, appliances, furniture", years: 8, bio: "Former pastry chef. Tests coffee makers with a refractometer.", initials: "LM" },
  { name: "Samir Kapoor", role: "Engineering Editor", focus: "Developer tools, AI, infrastructure", years: 14, bio: "Ex-Stripe. Reviews tools the way he'd review a pull request.", initials: "SK" },
];

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------
export const stats = {
  rankingsPublished: 287,
  productsTested: 4812,
  hoursOfTesting: 38400,
  categoriesCovered: 24,
  yearsRunning: 7,
  readerSurveys: 42,
};

// ---------------------------------------------------------------------------
// Trust signals (publications that have referenced Top3)
// ---------------------------------------------------------------------------
export const press = [
  "The New York Times",
  "Financial Times",
  "Monocle",
  "The Verge",
  "Wallpaper*",
  "Wired",
  "Fast Company",
  "Kinfolk",
];

// ---------------------------------------------------------------------------
// Recently updated (ranking IDs + change note)
// ---------------------------------------------------------------------------
export const recentlyUpdated = [
  { id: "r-ai-coding", note: "Re-tested with Claude 4 and GPT-5. Ranks shifted.", delta: "2 days ago" },
  { id: "r-wireless-earbuds", note: "Added Sonos Roam Buds as the new #1.", delta: "6 days ago" },
  { id: "r-electric-suvs", note: "Rivian R2 added, replacing Model Y in position 2.", delta: "11 days ago" },
  { id: "r-coffee-makers", note: "Fellow Aiden re-verified after firmware update.", delta: "2 weeks ago" },
  { id: "r-running-shoes-daily", note: "Clifton 10 replaced Clifton 9 at #2.", delta: "3 weeks ago" },
];

// ---------------------------------------------------------------------------
// Reader favorites (community voted, simulated)
// ---------------------------------------------------------------------------
export const readerFavorites = [
  { title: "Mechanical Keyboards", votes: "42,118", winner: "Keychron Q1 HE" },
  { title: "AI Coding Assistants", votes: "68,492", winner: "Cursor" },
  { title: "Daily Running Shoes", votes: "29,341", winner: "Nike Pegasus 43" },
  { title: "Travel Credit Cards", votes: "51,208", winner: "Chase Sapphire Reserve" },
];

// ---------------------------------------------------------------------------
// Featured comparison — a deep dive into a single ranking
// ---------------------------------------------------------------------------
export const featuredComparisonId = "r-wireless-earbuds";
