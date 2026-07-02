/**
 * SEED / FALLBACK DATA
 * ------------------------------------------------------------------
 * This is the temporary fallback used ONLY while Firebase data is
 * loading or unavailable. The ALTFTool Admin Panel + Firestore are
 * the single source of truth in production. Every shape here mirrors
 * the Firestore document shape so replacing seed data with live data
 * requires no UI changes.
 *
 * `imageKey` references a vector illustration in components/Artwork.jsx
 * (we ship crafted SVG art instead of raster placeholders).
 */

export const CATEGORIES = [
  { id: "electronics", slug: "electronics", name: "Electronics", tagline: "Phones, laptops & audio", icon: "electronics", accent: "indigo", subcategories: ["Smartphones", "Laptops", "Audio", "Cameras", "Accessories"] },
  { id: "fashion", slug: "fashion", name: "Fashion", tagline: "Apparel, shoes & watches", icon: "fashion", accent: "rose", subcategories: ["Men", "Women", "Footwear", "Watches", "Bags"] },
  { id: "home-kitchen", slug: "home-kitchen", name: "Home & Kitchen", tagline: "Appliances & decor", icon: "home", accent: "emerald", subcategories: ["Appliances", "Cookware", "Furniture", "Decor"] },
  { id: "beauty", slug: "beauty", name: "Beauty & Health", tagline: "Skincare & wellness", icon: "beauty", accent: "pink", subcategories: ["Skincare", "Cosmetics", "Wellness", "Fragrances"] },
  { id: "gaming", slug: "gaming", name: "Gaming", tagline: "Consoles & gear", icon: "gaming", accent: "violet", subcategories: ["Consoles", "Keyboards", "Mice", "Headsets", "Monitors"] },
  { id: "travel", slug: "travel", name: "Travel", tagline: "Luggage & bookings", icon: "travel", accent: "sky", subcategories: ["Luggage", "Backpacks", "Accessories", "Bookings"] },
  { id: "sports", slug: "sports", name: "Sports", tagline: "Fitness & outdoors", icon: "sports", accent: "amber", subcategories: ["Fitness Equipment", "Athletic Wear", "Outdoor", "Shoes"] },
  { id: "books", slug: "books", name: "Books & More", tagline: "Reads & stationery", icon: "books", accent: "teal", subcategories: ["Fiction", "Self-Help", "Tech", "Stationery"] },
];

export const STORES = [
  { id: "amazon", slug: "amazon", name: "Amazon", logo: "amazon", discount: "Up to 60% OFF", url: "https://www.amazon.in", rating: 4.6, category: "Marketplace", description: "The everything store. Verified daily deals across electronics, fashion, home and more.", featured: true },
  { id: "flipkart", slug: "flipkart", name: "Flipkart", logo: "flipkart", discount: "Up to 50% OFF", url: "https://www.flipkart.com", rating: 4.4, category: "Marketplace", description: "India's homegrown marketplace with Big Billion range of offers year-round.", featured: true },
  { id: "myntra", slug: "myntra", name: "Myntra", logo: "myntra", discount: "Up to 80% OFF", url: "https://www.myntra.com", rating: 4.5, category: "Fashion", description: "Fashion and lifestyle destination with the season's biggest apparel discounts.", featured: true },
  { id: "ajio", slug: "ajio", name: "Ajio", logo: "ajio", discount: "Up to 65% OFF", url: "https://www.ajio.com", rating: 4.2, category: "Fashion", description: "Curated fashion label with exclusive designer collections and steep markdowns.", featured: true },
  { id: "nykaa", slug: "nykaa", name: "Nykaa", logo: "nykaa", discount: "Up to 40% OFF", url: "https://www.nykaa.com", rating: 4.5, category: "Beauty", description: "Beauty and wellness superstore with authentic brands and bundle savings.", featured: true },
  { id: "apple", slug: "apple", name: "Apple Store", logo: "apple", discount: "Exchange offers", url: "https://www.apple.com/in", rating: 4.9, category: "Electronics", description: "Official Apple store deals, student pricing, and instant cashback events.", featured: false },
];

export const DEALS = [
  {
    id: "nike-air-max", slug: "nike-air-max", title: "Nike Air Max", subtitle: "Men's Running Shoes",
    description: "Lightweight mesh upper with the iconic visible Air cushioning for all-day comfort and street-ready style.",
    category: "fashion", storeId: "myntra", storeName: "Myntra", price: "₹2,399", originalPrice: "₹5,999",
    discountLabel: "60% OFF", discountPercent: 60, rating: 4.6, reviews: 12500, imageKey: "shoe",
    url: "https://www.myntra.com", badges: ["Trending"], hot: true, featured: true, endsInHours: 12,
    highlights: ["Breathable engineered mesh upper", "Visible Max Air unit for cushioning", "Durable rubber outsole", "True-to-size fit"],
    about: [
      "The Nike Air Max pairs the iconic visible Air unit with a breathable engineered-mesh upper, giving you plush heel-strike cushioning that holds up on daily runs and all-day wear alike. The waffle-inspired rubber outsole grips wet and dry pavement with equal confidence.",
      "This colourway sits comfortably in both gym and street settings, and the true-to-size fit means you can order your regular size with confidence. At 60% off, it's the lowest verified price we've tracked for this model this year.",
    ],
    specs: { Brand: "Nike", Type: "Running Shoes", Closure: "Lace-up", Material: "Mesh & synthetic", Warranty: "90 days" },
  },
  {
    id: "boat-rockerz-450", slug: "boat-rockerz-450", title: "boAt Rockerz 450", subtitle: "Wireless Headphones",
    description: "40mm drivers, up to 15 hours playback and plush earcups — big sound for a small price.",
    category: "electronics", storeId: "flipkart", storeName: "Flipkart", price: "₹1,499", originalPrice: "₹2,999",
    discountLabel: "50% OFF", discountPercent: 50, rating: 4.4, reviews: 8200, imageKey: "headphones",
    url: "https://www.flipkart.com", badges: ["Hot"], hot: true, featured: true, endsInHours: 8,
    highlights: ["40mm dynamic drivers", "Up to 15 hours playback", "Bluetooth v5.0", "Lightweight foldable design"],
    about: [
      "The boAt Rockerz 450 packs 40mm dynamic drivers into a lightweight 168g frame, delivering the punchy, bass-forward signature boAt is known for. Up to 15 hours of playback covers a full week of commutes on a single charge, and Bluetooth 5.0 keeps the connection stable across the room.",
      "Plush earcups and an adjustable headband make long listening sessions comfortable, while the foldable design slips easily into a backpack. At half price, it's one of the strongest budget wireless options we track.",
    ],
    specs: { Brand: "boAt", Driver: "40mm", Battery: "15 hours", Bluetooth: "v5.0", Weight: "168g" },
  },
  {
    id: "wild-stone-code", slug: "wild-stone-code", title: "Wild Stone Code", subtitle: "Perfume for Men",
    description: "A bold, long-lasting fragrance with woody and citrus notes for day-to-night wear.",
    category: "beauty", storeId: "nykaa", storeName: "Nykaa", price: "₹599", originalPrice: "₹1,999",
    discountLabel: "70% OFF", discountPercent: 70, rating: 4.3, reviews: 4100, imageKey: "perfume",
    url: "https://www.nykaa.com", badges: ["Best Value"], hot: true, featured: true, endsInHours: 20,
    highlights: ["Long-lasting 8+ hour wear", "Woody & citrus accord", "Travel-friendly 100ml", "Skin-safe formulation"],
    about: [
      "Wild Stone Code opens with bright citrus top notes that settle into a warm, woody base — a versatile day-to-night fragrance that reads confident without being overpowering. The eau de parfum concentration delivers 8+ hours of wear from just two or three sprays.",
      "The 100ml bottle makes this an easy everyday signature scent at an entry-level price, and at 70% off it costs less than most travel-size alternatives.",
    ],
    specs: { Brand: "Wild Stone", Volume: "100ml", Notes: "Woody, Citrus", Type: "Eau de Parfum" },
  },
  {
    id: "fastrack-reflex", slug: "fastrack-reflex", title: "Fastrack Reflex", subtitle: "Analog Watch",
    description: "Minimalist analog dial with a genuine leather strap — timeless everyday styling.",
    category: "fashion", storeId: "amazon", storeName: "Amazon", price: "₹1,099", originalPrice: "₹1,999",
    discountLabel: "45% OFF", discountPercent: 45, rating: 4.5, reviews: 6700, imageKey: "watch",
    url: "https://www.amazon.in", badges: ["Top Rated"], hot: true, featured: false, endsInHours: 30,
    highlights: ["Genuine leather strap", "Water-resistant to 30m", "Scratch-resistant glass", "2-year movement warranty"],
    about: [
      "The Fastrack Reflex keeps things deliberately simple: a clean analog dial, scratch-resistant glass, and a genuine leather strap that ages well with daily wear. Water resistance to 30 metres means rain and hand-washing are never a worry.",
      "It's the kind of watch that works with a kurta, a suit, or a t-shirt — and the 2-year movement warranty makes it a safe first 'good watch' or an easy gift.",
    ],
    specs: { Brand: "Fastrack", Display: "Analog", Strap: "Leather", "Water resist": "30m", Warranty: "2 years" },
  },
  {
    id: "fireboltt-ninja", slug: "fireboltt-ninja", title: "Fire-Boltt Ninja Pro Max", subtitle: "Smartwatch",
    description: "1.6\" HD display, SpO2 & heart-rate tracking, 100+ sports modes and 7-day battery life.",
    category: "electronics", storeId: "amazon", storeName: "Amazon", price: "₹1,999", originalPrice: "₹5,999",
    discountLabel: "66% OFF", discountPercent: 66, rating: 4.5, reviews: 2456, imageKey: "watch",
    url: "https://www.amazon.in", badges: ["Deal of the Day"], hot: true, featured: true, endsInHours: 6,
    highlights: ["1.6-inch HD display", "SpO2 & heart-rate sensor", "100+ sports modes", "7-day battery life", "IP68 water resistant"],
    about: [
      "The Fire-Boltt Ninja Pro Max squeezes a bright 1.6-inch HD display, SpO2 and continuous heart-rate monitoring, and 100+ sports modes into a watch that costs less than most fitness bands. Seven days of real battery life means you charge it once a week, not once a day.",
      "IP68 water resistance handles workouts, rain and hand-washing, and it pairs with both Android and iOS. At 66% off it's our current Deal of the Day for a reason — this is flagship-band functionality at an impulse-buy price.",
    ],
    specs: { Brand: "Fire-Boltt", Display: "1.6\" HD", Battery: "7 days", Water: "IP68", Compatibility: "Android & iOS" },
  },
  {
    id: "macbook-pro-m4", slug: "macbook-pro-m4", title: "MacBook Pro M4 Max (16-inch)",
    description: "The most powerful MacBook Pro ever — M4 Max, Liquid Retina XDR display and up to 22 hours battery.",
    category: "electronics", storeId: "apple", storeName: "Apple Store", price: "₹2,29,900", originalPrice: "₹2,49,900",
    discountLabel: "₹20,000 OFF", discountPercent: 8, rating: 4.9, reviews: 890, imageKey: "laptop",
    url: "https://www.apple.com/in", badges: ["Premium"], hot: false, featured: true, endsInHours: 48,
    highlights: ["M4 Max 14-core CPU", "32-core GPU", "36GB unified memory", "Liquid Retina XDR display", "Up to 22 hours battery"],
    about: [
      "The 16-inch MacBook Pro with M4 Max is the most capable laptop Apple has ever shipped: a 14-core CPU and 32-core GPU chew through video exports, code compilation and 3D workloads while the machine stays cool and silent. The Liquid Retina XDR display remains the best panel fitted to any laptop.",
      "With 36GB of unified memory, a 1TB SSD and up to 22 hours of battery life, this configuration is genuinely desktop-replacement class. The ₹20,000 discount plus exchange bonuses make this the best entry point we've seen since launch.",
    ],
    specs: { Brand: "Apple", CPU: "M4 Max", GPU: "32-core", RAM: "36GB", Storage: "1TB SSD", Battery: "22 hours" },
  },
  {
    id: "keychron-k2", slug: "keychron-k2", title: "Keychron K2 Mechanical Keyboard",
    description: "75% layout hot-swappable mechanical keyboard with RGB backlight and Mac/Windows support.",
    category: "gaming", storeId: "amazon", storeName: "Amazon", price: "₹6,499", originalPrice: "₹8,999",
    discountLabel: "27% OFF", discountPercent: 27, rating: 4.7, reviews: 1540, imageKey: "keyboard",
    url: "https://www.amazon.in", badges: ["Top Rated"], hot: false, featured: true, endsInHours: 36,
    highlights: ["75% compact layout", "Gateron Brown switches", "Bluetooth & USB-C", "RGB backlight (18 modes)", "4000mAh battery"],
    about: [
      "The Keychron K2 is the board that made 75% layouts mainstream: full arrow keys and function row in a footprint barely larger than a 60%. Hot-swappable sockets mean you can change switches without soldering, and the included Gateron Browns are a crowd-pleasing tactile starting point.",
      "It pairs with three devices over Bluetooth, switches instantly between Mac and Windows layouts, and the 4000mAh battery runs for weeks with the backlight off. A near-perfect first mechanical keyboard.",
    ],
    specs: { Brand: "Keychron", Layout: "75%", Switches: "Gateron Brown", Connectivity: "BT & USB-C", Battery: "4000mAh" },
  },
  {
    id: "sony-alpha", slug: "sony-alpha", title: "Sony Alpha ZV-E10 Mirrorless Camera",
    description: "24.2MP APS-C sensor built for creators — flip screen, real-time eye AF and 4K video.",
    category: "electronics", storeId: "flipkart", storeName: "Flipkart", price: "₹58,990", originalPrice: "₹74,990",
    discountLabel: "21% OFF", discountPercent: 21, rating: 4.7, reviews: 640, imageKey: "camera",
    url: "https://www.flipkart.com", badges: ["Creator Pick"], hot: false, featured: true, endsInHours: 40,
    highlights: ["24.2MP APS-C sensor", "Vari-angle touchscreen", "Real-time Eye AF", "4K movie recording"],
    about: [
      "Sony built the ZV-E10 specifically for creators: the 24.2MP APS-C sensor delivers crisp 4K video, real-time Eye AF keeps you tack-sharp even while moving, and the fully articulating touchscreen makes solo framing effortless. The directional 3-capsule mic records surprisingly usable audio straight out of the box.",
      "Access to Sony's enormous E-mount lens ecosystem means the camera grows with you — start with the kit lens, add a fast prime when a deal lands. For YouTube, reels and product shots, this remains the value benchmark.",
    ],
    specs: { Brand: "Sony", Sensor: "24.2MP APS-C", Video: "4K 30p", Mount: "Sony E", Screen: "Vari-angle" },
  },
  {
    id: "ergo-chair", slug: "ergo-chair", title: "Green Soul Monster Ergonomic Chair",
    description: "High-back ergonomic office chair with adjustable lumbar support and breathable mesh.",
    category: "home-kitchen", storeId: "amazon", storeName: "Amazon", price: "₹11,499", originalPrice: "₹24,999",
    discountLabel: "54% OFF", discountPercent: 54, rating: 4.4, reviews: 3200, imageKey: "chair",
    url: "https://www.amazon.in", badges: ["WFH Essential"], hot: false, featured: false, endsInHours: 24,
    highlights: ["Adjustable lumbar support", "Breathable mesh back", "Multi-tilt lock mechanism", "Heavy-duty metal base"],
    about: [
      "The Green Soul Monster is built for long working days: adjustable lumbar support that actually reaches your lower back, a breathable mesh backrest for hot afternoons, and a multi-tilt lock that holds any recline angle you set. The heavy-duty metal base is rated for 120kg of daily use.",
      "Armrests, seat depth and headrest all adjust independently, so the chair fits you rather than the other way round. At 54% off with a 3-year warranty, it undercuts most mid-range ergonomic chairs by a wide margin.",
    ],
    specs: { Brand: "Green Soul", Type: "Ergonomic", Material: "Mesh", "Weight cap": "120kg", Warranty: "3 years" },
  },
  {
    id: "ps5-pro", slug: "ps5-pro", title: "Sony PlayStation 5 Pro Console",
    description: "Next-gen gaming with an upgraded GPU, AI upscaling and blazing SSD load times.",
    category: "gaming", storeId: "flipkart", storeName: "Flipkart", price: "₹74,990", originalPrice: "₹79,990",
    discountLabel: "₹5,000 OFF", discountPercent: 6, rating: 4.8, reviews: 1120, imageKey: "console",
    url: "https://www.flipkart.com", badges: ["Trending"], hot: true, featured: true, endsInHours: 10,
    highlights: ["Upgraded ray-tracing GPU", "PSSR AI upscaling", "2TB SSD storage", "Backwards compatible"],
    about: [
      "The PlayStation 5 Pro is the most powerful console Sony has built: an upgraded GPU with advanced ray tracing, PSSR AI upscaling that pushes games toward 8K clarity, and a 2TB SSD that loads worlds in seconds. Performance modes that previously forced a choice between resolution and frame rate now deliver both.",
      "Full backwards compatibility means your existing PS5 and PS4 library comes along, most titles running better than ever. The ₹5,000 launch-window discount makes this the cheapest entry to true next-gen performance we've tracked.",
    ],
    specs: { Brand: "Sony", Storage: "2TB SSD", Resolution: "Up to 8K", "Ray tracing": "Advanced" },
  },
  {
    id: "levis-jeans", slug: "levis-jeans", title: "Levi's 511 Slim Fit Jeans",
    description: "The classic slim-fit denim with just the right amount of stretch for everyday comfort.",
    category: "fashion", storeId: "ajio", storeName: "Ajio", price: "₹1,799", originalPrice: "₹3,599",
    discountLabel: "50% OFF", discountPercent: 50, rating: 4.5, reviews: 5400, imageKey: "jeans",
    url: "https://www.ajio.com", badges: ["Wardrobe Staple"], hot: false, featured: false, endsInHours: 28,
    highlights: ["Slim fit through hip and thigh", "Stretch denim comfort", "Classic 5-pocket styling", "Machine washable"],
    about: [
      "The Levi's 511 is the modern default for a reason: slim through the hip and thigh without turning skinny, cut from stretch denim that keeps its shape through a full day of wear. The mid-rise and classic 5-pocket styling work with everything from sneakers to boots.",
      "This is the pair to buy in multiples when the price halves — a genuine wardrobe staple that machine-washes without drama and fades gracefully.",
    ],
    specs: { Brand: "Levi's", Fit: "511 Slim", Material: "Stretch denim", Rise: "Mid" },
  },
  {
    id: "instant-pot", slug: "instant-pot", title: "Instant Pot Duo 7-in-1 Cooker",
    description: "Pressure cook, slow cook, sauté, steam and more — dinner sorted in one pot.",
    category: "home-kitchen", storeId: "amazon", storeName: "Amazon", price: "₹6,995", originalPrice: "₹11,995",
    discountLabel: "42% OFF", discountPercent: 42, rating: 4.6, reviews: 9800, imageKey: "cooker",
    url: "https://www.amazon.in", badges: ["Best Seller"], hot: false, featured: false, endsInHours: 22,
    highlights: ["7 appliances in one", "13 smart programs", "Stainless steel inner pot", "Safe-lock lid"],
    about: [
      "The Instant Pot Duo replaces seven appliances with one 6-litre pot: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yoghurt maker and food warmer. Thirteen smart programs handle dal, biryani, curries and stocks with one-touch consistency.",
      "The stainless-steel inner pot avoids non-stick coating worries, and the safe-lock lid with overpressure protection makes it far less intimidating than a traditional pressure cooker. Set it in the morning, come home to dinner done.",
    ],
    specs: { Brand: "Instant Pot", Capacity: "6L", Programs: "13", Material: "Stainless steel" },
  },
];

export const COUPONS = [
  { id: "amz150", code: "AMZ150OFF", store: "Amazon", storeSlug: "amazon", title: "₹150 off orders above ₹1,499", discountLabel: "₹150 OFF", terms: "Valid on orders above ₹1,499. One use per customer.", expiry: "Expires in 3 days", url: "https://www.amazon.in", usageCount: 840, category: "Marketplace" },
  { id: "flip10", code: "FLIPKART10", store: "Flipkart", storeSlug: "flipkart", title: "10% off clothing & apparel", discountLabel: "10% OFF", terms: "Valid on clothing & apparel category only.", expiry: "Expires in 5 days", url: "https://www.flipkart.com", usageCount: 1420, category: "Fashion" },
  { id: "myn300", code: "MYNTRANEW", store: "Myntra", storeSlug: "myntra", title: "₹300 off first purchase", discountLabel: "₹300 OFF", terms: "First-purchase exclusive. Orders above ₹999.", expiry: "Expires in 10 days", url: "https://www.myntra.com", usageCount: 2309, category: "Fashion" },
  { id: "ajio30", code: "AJIOSUPER", store: "Ajio", storeSlug: "ajio", title: "30% off selected styles", discountLabel: "30% OFF", terms: "Selected styles. Minimum cart ₹2,999.", expiry: "Expires in 2 days", url: "https://www.ajio.com", usageCount: 654, category: "Fashion" },
  { id: "nykaa20", code: "GLOW20", store: "Nykaa", storeSlug: "nykaa", title: "20% off skincare bundles", discountLabel: "20% OFF", terms: "Applicable on skincare bundles above ₹1,199.", expiry: "Expires in 7 days", url: "https://www.nykaa.com", usageCount: 980, category: "Beauty" },
  { id: "apple5", code: "STUDENT5", store: "Apple Store", storeSlug: "apple", title: "Extra 5% student discount", discountLabel: "5% OFF", terms: "Valid student ID required at checkout.", expiry: "Expires in 14 days", url: "https://www.apple.com/in", usageCount: 410, category: "Electronics" },
];

export const BLOGS = [
  {
    id: "best-laptops-2026", slug: "best-laptops-2026", title: "Top Laptop Choices for Developers in 2026",
    excerpt: "An in-depth review comparing the power and performance of Apple M4 Max, AMD Ryzen AI, and Intel Core Ultra chips.",
    category: "Tech Guide", author: "Alex Rivers", authorRole: "Senior Hardware Editor", date: "June 24, 2026",
    readTime: "5 min read", views: "1.2k", tags: ["Tech", "Workstation"], coverKey: "laptop", featured: true,
    content: [
      "Choosing a developer laptop in 2026 is less about raw clock speed and more about balance: sustained performance under load, battery endurance, thermals, and how quietly the machine handles a heavy compile at 2 AM. This guide breaks down the three chip families that matter this year and tells you exactly when to buy.",
      "## The performance-per-watt king: Apple M4 Max",
      "Apple's M4 Max continues to lead on performance-per-watt, and it isn't close. If your workflow lives in containers, JavaScript build tooling, or native mobile development, the 16-inch MacBook Pro remains the machine to beat. In our sustained-load testing it completed a full monorepo build 34% faster than last year's M3 Pro while staying whisper-quiet — and 22 hours of real-world battery life is not a typo.",
      "- Best for: iOS/macOS developers, video editors, anyone who values battery life above all",
      "- Watch out for: memory upgrades are expensive — buy 36GB up front rather than regretting 18GB later",
      "- Deal pattern: exchange bonuses and instant cashback events typically land around festive sales",
      "## The challengers: AMD Ryzen AI and Intel Core Ultra",
      "On the Windows side, AMD's Ryzen AI chips have closed the gap dramatically and pair beautifully with Linux — driver support in 2026 is the best it has ever been. Intel's Core Ultra line remains the value pick: mid-range configurations regularly drop 20% below launch price within six months, making them ideal for budget-conscious developers who want strong multi-core performance.",
      "## How to actually buy one for less",
      "Decide on your operating system first, set a firm budget, then wait for a verified deal rather than paying sticker price. The discounts we track on My Lucky Deals routinely knock 15–25% off flagship configurations, and bank-card instant discounts stack on top during sale events. A flagship machine bought on the right day costs the same as a mid-ranger bought on the wrong one.",
    ],
  },
  {
    id: "running-gear-checklist", slug: "running-gear-checklist", title: "Running Gear Checklist: What You Actually Need",
    excerpt: "Beyond the shoes — hydration vests, lightweight smartwatches, and the fabric choices that make or break a long run.",
    category: "Fitness", author: "Sarah Jain", authorRole: "Fitness Contributor", date: "June 20, 2026",
    readTime: "4 min read", views: "890", tags: ["Sports", "Outdoors"], coverKey: "shoe", featured: false,
    content: [
      "The internet will happily sell you a hundred running accessories. You need roughly five of them, and the rest can wait until you're logging serious weekly mileage. Here's the honest checklist, in priority order, with the buying tricks that save real money on each item.",
      "## 1. Shoes — the only non-negotiable",
      "Get fitted properly at a running store at least once, even if you buy online afterwards. Your gait, arch, and preferred distance decide the shoe — not the marketing. Then watch for deals on last season's colourways: the midsole technology rarely changes year to year, but the price drops 40–60% the moment a new colour launches.",
      "## 2. A GPS smartwatch that stays out of the way",
      "A lightweight GPS watch is the single best upgrade after shoes. Prioritise accurate optical heart-rate tracking and multi-day battery life so charging never interrupts a training block. Budget models in 2026 cover 90% of what most runners need — pace, distance, heart-rate zones and sleep recovery.",
      "## 3–5. The supporting cast",
      "- Moisture-wicking tees with seamless construction — fabric matters far more than brand, and chafing ends more runs than fatigue does",
      "- A soft-flask hydration bottle for anything over 45 minutes",
      "- Wireless earbuds with a secure fit — look for an IPX4 rating or better for sweat resistance",
      "Everything else — compression sleeves, massage guns, energy gels by the crate — can wait. Buy the basics on verified deals, run for a season, and let real needs drive the next purchase.",
    ],
  },
  {
    id: "mechanical-keyboard-guide", slug: "mechanical-keyboard-guide", title: "Mechanical Keyboards: Linear vs Tactile vs Clicky",
    excerpt: "Understand switch differences, acoustics, and layouts before you commit to your next keyboard.",
    category: "Gaming", author: "Marcus Chen", authorRole: "Peripherals Reviewer", date: "June 18, 2026",
    readTime: "7 min read", views: "2.5k", tags: ["Gaming", "DeskSetup"], coverKey: "keyboard", featured: true,
    content: [
      "Every mechanical keyboard debate eventually comes down to switches, and every switch debate comes down to three families: linear, tactile, and clicky. Understand these — plus one decision about layout — and you can buy your next keyboard with total confidence.",
      "## Linear, tactile, or clicky?",
      "- Linear switches (Reds, Yellows) are smooth from top to bottom with no bump — gamers love them for fast, consistent actuation during rapid double-taps",
      "- Tactile switches (Browns, Clears) add a gentle bump right at the actuation point, so your fingers learn exactly how far to press — the typist's favourite",
      "- Clicky switches (Blues, Greens) add an audible click on top of the bump — deeply satisfying to use, deeply annoying to everyone sharing your office",
      "If you're undecided, start tactile. It's the best all-rounder, and hot-swappable boards let you change your mind later without buying a whole new keyboard.",
      "## The layout decision nobody warns you about",
      "Full-size boards waste desk space most people never use. A 75% layout like the Keychron K2 keeps the arrow keys and function row while shrinking the footprint dramatically — the sweet spot for work-and-play setups. Go 60% only if you're sure you can live without dedicated arrows.",
      "## What to pay",
      "A quality hot-swappable mechanical board costs far less than it used to. Solid entry points appear regularly under ₹7,000 on tracked deals, and flagship features — gasket mounting, PBT keycaps, wireless tri-mode — now show up at mid-range prices. Skip the hype releases and buy last quarter's favourite at a discount.",
    ],
  },
  {
    id: "skincare-on-a-budget", slug: "skincare-on-a-budget", title: "Building a Skincare Routine on a Budget",
    excerpt: "You don't need a ten-step routine or a luxury price tag. Here's what actually moves the needle.",
    category: "Beauty", author: "Priya Nair", authorRole: "Beauty Editor", date: "June 15, 2026",
    readTime: "5 min read", views: "1.6k", tags: ["Beauty", "Wellness"], coverKey: "perfume", featured: false,
    content: [
      "You don't need a ten-step routine or a luxury price tag for healthy skin. Dermatologists have been saying the same thing for years: great skin comes down to three consistent steps, done daily, with products that suit your skin type. Everything else is optional.",
      "## The only three steps that matter",
      "- Cleanse — a gentle, non-stripping cleanser morning and night; if your skin feels tight after washing, it's too harsh",
      "- Moisturise — even oily skin needs it; a lightweight gel moisturiser keeps oil production balanced rather than making it worse",
      "- Protect — broad-spectrum SPF 30+ every single morning; sun damage is the single biggest driver of premature ageing",
      "## Ingredients beat marketing, every time",
      "A well-formulated niacinamide serum at ₹400 will outperform a poorly formulated one at ₹4,000. Learn to read the ingredient list instead of the front of the box: niacinamide for texture and oil control, hyaluronic acid for hydration, vitamin C for brightness, retinol (introduced slowly) for fine lines. Concentration and formulation matter — brand prestige doesn't.",
      "## How to build the routine for less",
      "Watch for bundle coupons on beauty stores — they routinely stack an extra 20% on top of sale pricing when you buy a cleanser and moisturiser together. Introduce one new product at a time, patch test on your inner arm first, and give each product four full weeks before judging results. Your skin — and your bank balance — will thank you.",
    ],
  },
  {
    id: "smart-home-starter", slug: "smart-home-starter", title: "The Smart Home Starter Kit That's Actually Worth It",
    excerpt: "Skip the gimmicks. These are the smart-home upgrades that pay for themselves in convenience.",
    category: "Home", author: "Dev Malhotra", authorRole: "Home Tech Writer", date: "June 10, 2026",
    readTime: "6 min read", views: "740", tags: ["Home", "Tech"], coverKey: "cooker", featured: false,
    content: [
      "Smart home tech is finally at the point where a modest budget buys genuine everyday value rather than novelty. The trick is knowing which upgrades actually change your daily routine — and which ones end up in a drawer within a month. Here's the starter kit that earns its place.",
      "## Start here: lighting and plugs",
      "Begin with smart bulbs in the two rooms you use most, plus a couple of smart plugs. They're cheap, install in minutes with zero wiring, and instantly make lamps, fans and appliances schedulable from your phone. Morning lights that fade in gently and a coffee maker that starts before your alarm — that's the daily payoff, and it costs less than a dinner out.",
      "## The kitchen upgrade nobody calls 'smart'",
      "A good multi-cooker like the Instant Pot isn't smart in the app-controlled sense, but it automates the most time-consuming chore in the house: dinner. Set it in the morning, come home to a finished meal. On a per-use basis it's arguably the highest-value kitchen purchase you can make, especially bought on sale at 40%+ off.",
      "## What to add later — and what to skip",
      "- Add a smart speaker once you have devices worth controlling by voice — it's the glue, not the starting point",
      "- Add cameras and smart locks only after the basics feel indispensable; they're the most expensive and most privacy-sensitive pieces",
      "- Skip smart appliances (fridges, washing machines) — the premium rarely pays for itself before the appliance ages out",
      "Buy during festive sales where the discounts are steepest, and build the system one verified deal at a time.",
    ],
  },
];

export const FAQS = [
  { id: "f1", question: "Does My Lucky Deals sell products directly?", answer: "No. We are a deals discovery platform. We don't sell, ship, or process payments. When you click a deal, coupon, or store, we redirect you to the merchant's official website to complete your purchase there.", category: "General" },
  { id: "f2", question: "How do I use a coupon code?", answer: "Click 'Reveal Code' on any coupon card. The code is copied to your clipboard and we open the store in a new tab. Paste the code at the merchant's checkout to apply your discount.", category: "Coupons" },
  { id: "f3", question: "Are these deals updated in real time?", answer: "Yes. Every deal, coupon, and offer is synced from our database and managed by the ALTFTool admin team. You always see the latest prices without reloading.", category: "General" },
  { id: "f4", question: "Do the prices include taxes and shipping?", answer: "Prices shown are the merchant's listed price at the time of syncing. Final taxes and shipping are calculated on the merchant's checkout page.", category: "Deals" },
  { id: "f5", question: "How are deals verified?", answer: "Our editorial team checks each listing against the merchant's live page and historical pricing so you see genuine discounts, not inflated 'was' prices.", category: "Deals" },
  { id: "f6", question: "Is it free to use?", answer: "Completely free. We may earn a small affiliate commission when you buy through our links — at no extra cost to you. That's what keeps the lights on.", category: "General" },
  { id: "f7", question: "Why did a deal expire or change price?", answer: "Merchant prices and stock change frequently. If a deal looks different when you arrive at the store, the merchant has updated it since our last sync.", category: "Deals" },
  { id: "f8", question: "How do I get notified about new deals?", answer: "Subscribe to our newsletter from any page. We send a curated digest of the best verified offers — no spam.", category: "General" },
];

export const HERO_SLIDES = [
  {
    id: "slide-audio", eyebrow: "Limited time offer", title: "Unbeatable Deals", highlight: "Just For You!",
    subtitle: "Shop smart and save big on top brands",
    ctaLabel: "Shop Now", ctaUrl: "/deals", secondaryLabel: "View All Deals", secondaryUrl: "/deals",
    badge: "Up to 70% OFF", discount: "70%", imageKey: "headphones", theme: "indigo", endsInHours: 12,
  },
  {
    id: "slide-gaming", eyebrow: "Trending now", title: "Level Up Your", highlight: "Game Setup",
    subtitle: "Console bundles, mechanical keyboards and next-gen gear at exclusive discovery prices.",
    ctaLabel: "Explore Gaming", ctaUrl: "/categories/gaming", secondaryLabel: "See Coupons", secondaryUrl: "/coupons",
    badge: "Up to 40% OFF", discount: "40%", imageKey: "console", theme: "violet", endsInHours: 8,
  },
  {
    id: "slide-tech", eyebrow: "Best value", title: "Next-Gen Tech", highlight: "For Less",
    subtitle: "MacBooks, cameras and creator gear with verified price drops and exchange bonuses.",
    ctaLabel: "View Tech Deals", ctaUrl: "/categories/electronics", secondaryLabel: "Top Stores", secondaryUrl: "/stores",
    badge: "₹20,000 OFF", discount: "₹20K", imageKey: "laptop", theme: "sky", endsInHours: 24,
  },
];

/**
 * ADS — one placement key per site section, fully controlled from the
 * ALTFTool Admin Panel (Firestore collection: "ads").
 *
 * Doc shape: { placement, active, priority, title, subtitle, cta, url,
 *             imageUrl?, imageKey?, gradient? ("brand"|"sky"|"emerald") }
 * - `placement` decides WHERE the ad renders (see ADS_PLACEMENTS.md).
 * - `active: false` hides an ad without deleting it.
 * - Lower `priority` wins when several ads share a placement.
 * - `imageUrl` (uploaded from the panel) always overrides local images.
 * Once the Firestore collection has documents, this seed list is ignored.
 */
export const ADS = [
  /* -------- Home -------- */
  { id: "home-inline", placement: "home-inline", active: true, priority: 1, title: "Mega Sale is Live!", subtitle: "Grab up to 80% off on top brands. Limited time offer.", cta: "Explore Now", url: "/deals", imageKey: "gift", gradient: "brand" },
  { id: "home-sidebar", placement: "home-sidebar", active: true, priority: 1, title: "Bank Cashback Days", subtitle: "Extra 10% instant discount with partner cards.", cta: "Claim Now", url: "/coupons", imageKey: "card", gradient: "sky" },
  /* -------- Listing pages -------- */
  { id: "deals-banner", placement: "deals-banner", active: true, priority: 1, title: "Today's Lightning Deals", subtitle: "Extra savings on already-discounted picks — while stocks last.", cta: "Grab Now", url: "/deals", imageKey: "gift", gradient: "emerald" },
  { id: "stores-banner", placement: "stores-banner", active: true, priority: 1, title: "Store of the Week", subtitle: "Handpicked merchant with the deepest verified discounts.", cta: "Visit Store", url: "/stores", imageKey: "card", gradient: "brand" },
  { id: "coupons-banner", placement: "coupons-banner", active: true, priority: 1, title: "Stack & Save More", subtitle: "Combine bank offers with coupon codes for double savings.", cta: "Learn How", url: "/deals", imageKey: "card", gradient: "sky" },
  { id: "blog-banner", placement: "blog-banner", active: true, priority: 1, title: "Deals Featured in Our Guides", subtitle: "Shop the products our editors actually recommend.", cta: "Shop Picks", url: "/deals", imageKey: "gift", gradient: "brand" },
  /* -------- Detail pages -------- */
  { id: "category-banner", placement: "category-banner", active: true, priority: 1, title: "No Cost EMI Available", subtitle: "Split your purchase into easy monthly payments at checkout.", cta: "Learn More", url: "/coupons", imageKey: "card", gradient: "sky" },
  { id: "store-banner", placement: "store-banner", active: true, priority: 1, title: "Exclusive Store Coupons", subtitle: "Reveal extra codes before you check out here.", cta: "Get Codes", url: "/coupons", imageKey: "card", gradient: "emerald" },
  { id: "deal-banner", placement: "deal-banner", active: true, priority: 1, title: "No Cost EMI Available", subtitle: "Split your purchase into easy monthly payments at checkout.", cta: "Learn More", url: "/coupons", imageKey: "card", gradient: "sky" },
  { id: "deal-sidebar", placement: "deal-sidebar", active: true, priority: 1, title: "Today's Best Picks", subtitle: "Hand-verified deals with the biggest savings right now.", cta: "See Offers", url: "/deals", imageKey: "gift", gradient: "brand" },
  { id: "coupon-banner", placement: "coupon-banner", active: true, priority: 1, title: "More Ways to Save", subtitle: "Browse every live deal across all partner stores.", cta: "Browse Deals", url: "/deals", imageKey: "gift", gradient: "emerald" },
  { id: "coupon-sidebar", placement: "coupon-sidebar", active: true, priority: 1, title: "Today's Best Picks", subtitle: "Hand-verified deals with the biggest savings right now.", cta: "See Offers", url: "/deals", imageKey: "gift", gradient: "brand" },
  { id: "blog-detail-banner", placement: "blog-detail-banner", active: true, priority: 1, title: "Shop This Guide", subtitle: "Every product in this article, at its lowest tracked price.", cta: "See Deals", url: "/deals", imageKey: "gift", gradient: "brand" },
  { id: "blog-sidebar", placement: "blog-sidebar", active: true, priority: 1, title: "Reader Favourites", subtitle: "The deals our readers grabbed the most this week.", cta: "Explore", url: "/deals", imageKey: "gift", gradient: "sky" },
];

export const FEATURED_OFFERS = [
  { id: "o1", title: "Bank Offers", description: "Up to 10% instant discount on HDFC, SBI & more cards.", icon: "card", badge: "Card Deal", cta: "Explore", url: "/coupons" },
  { id: "o2", title: "No Cost EMI", description: "On selected products with easy EMI options.", icon: "emi", badge: "0% Interest", cta: "Explore", url: "/deals" },
  { id: "o3", title: "Exchange Offers", description: "Up to ₹10,000 off when you exchange your old device.", icon: "exchange", badge: "Instant Credit", cta: "Explore", url: "/deals" },
  { id: "o4", title: "Coupon Store", description: "Extra savings on every order with special codes.", icon: "ticket", badge: "Extra Code", cta: "Explore", url: "/coupons" },
];

/** Curated "trending collections" (categories page rail) — admin-managed. */
export const TRENDING_COLLECTIONS = [
  { id: "wireless-earbuds", title: "Wireless Earbuds", categoryName: "Electronics", categorySlug: "electronics", imageUrl: "/images/deals/boat-rockerz-450.png", imageKey: "headphones", count: 24, href: "/search?q=earbuds" },
  { id: "running-shoes", title: "Running Shoes", categoryName: "Sports", categorySlug: "sports", imageUrl: "/images/deals/nike-air-max.png", imageKey: "shoe", count: 18, href: "/search?q=shoes" },
  { id: "smart-watches", title: "Smart Watches", categoryName: "Electronics", categorySlug: "electronics", imageUrl: "/images/deals/fireboltt-ninja.png", imageKey: "watch", count: 15, href: "/search?q=watch" },
  { id: "mech-keyboards", title: "Gaming Keyboards", categoryName: "Gaming", categorySlug: "gaming", imageUrl: "/images/deals/keychron-k2.png", imageKey: "keyboard", count: 12, href: "/search?q=keyboard" },
  { id: "perfumes", title: "Perfumes", categoryName: "Beauty", categorySlug: "beauty", imageUrl: "/images/deals/wild-stone-code.png", imageKey: "perfume", count: 10, href: "/search?q=perfume" },
];

export const TRENDING_SEARCHES = [
  "iPhone 15 Pro", "Nike Shoes", "MacBook Air", "Noise Earbuds",
  "Ray-Ban Sunglasses", "Travel Bags", "Gaming Keyboard", "Skincare Sets",
];

export const SITE = {
  name: "My Lucky Deals",
  tagline: "Your one-stop destination for the best deals online. Save more, shop smart.",
  newsletterNote: "Subscribe to get verified premium offers straight to your inbox.",
};

/**
 * Admin-managed UI content (Firestore doc: settings/ui).
 * Nav, trust strips, widget copy and footer are all editable from the
 * ALTFTool Admin Panel — this object is only the fallback.
 */
export const UI_CONTENT = {
  nav: [
    { label: "Deals", href: "/deals" },
    { label: "Categories", href: "/categories" },
    { label: "Stores", href: "/stores" },
    { label: "Blog", href: "/blog" },
  ],
  heroTrust: [
    { icon: "shield", title: "100% Secure", note: "Secure Shopping" },
    { icon: "tag", title: "Best Price", note: "Guaranteed" },
    { icon: "headset", title: "24/7 Support", note: "We're here to help" },
    { icon: "refresh", title: "Easy Returns", note: "Hassle Free" },
  ],
  bottomTrust: [
    { icon: "truck", title: "Free Shipping", note: "On orders above ₹499" },
    { icon: "shield", title: "100% Original", note: "Genuine Products" },
    { icon: "lock", title: "Secure Payment", note: "100% Protected" },
    { icon: "refresh", title: "Easy Returns", note: "7-day return policy" },
  ],
  dealBenefits: [
    { icon: "truck", label: "Free Shipping" },
    { icon: "shield", label: "100% Original" },
    { icon: "lock", label: "Secure Payment" },
    { icon: "refresh", label: "Easy Returns" },
  ],
  referEarn: {
    title: "Refer & Earn",
    text: "Invite your friends and earn exciting rewards!",
    cta: "Invite Now",
    url: "/faq",
  },
  newsletter: {
    title: "Get Exclusive Deals",
    note: "straight to your inbox",
    placeholder: "Enter your email",
    cta: "Subscribe Now",
  },
  footer: {
    tagline: "Save more, shop smart.",
    /* Only pages that actually exist. */
    links: [
      { label: "Deals", href: "/deals" },
      { label: "Categories", href: "/categories" },
      { label: "Coupons", href: "/coupons" },
      { label: "Stores", href: "/stores" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
    ],
    social: ["facebook", "twitter", "instagram", "youtube", "telegram"],
    payments: [
      { label: "VISA", color: "#1a1f71" },
      { label: "mastercard", color: "#eb001b" },
      { label: "paytm", color: "#00baf2" },
      { label: "UPI", color: "#3d3d3d" },
    ],
  },
};

/** Homepage CMS config: section order + visibility (admin-controlled in Firestore). */
export const HOME_CONFIG = {
  sections: [
    { id: "hero", visible: true },
    { id: "category-rail", visible: true },
    { id: "hot-deals", visible: true },
    { id: "ad-inline", visible: true },
    { id: "deals-grid", visible: true },
    { id: "coupons", visible: true },
    { id: "featured-offers", visible: true },
    { id: "blogs", visible: true },
    { id: "faq", visible: true },
  ],
  sidebarWidgets: ["deal-of-day", "top-stores", "newsletter", "trending-searches", "sponsored-ad"],
};
