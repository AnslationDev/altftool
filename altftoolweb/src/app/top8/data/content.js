// ============================================================
// TOP8 — Core content data (images, categories, authors,
// collections, countries, articles, site stats)
// ============================================================

const px = (id, w = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMGS = {
  ai: px(34939150), ai2: px(29612111),
  code: px(14553704), code2: px(37227160),
  phone: px(28919442), phoneDark: px(15876529),
  tokyo: px(29356751), ginza: px(33901684),
  coast: px(27672026), amalfi: px(18771874), sea: px(35501922),
  beach: px(15902765), beach2: px(18936488),
  lion: px(32657958), lioness: px(14576861),
  cinema: px(7991231), cinema2: px(7991501),
  food: px(24186303), food2: px(24289213),
  car: px(33345481), car2: px(33268786),
  games: px(9128853), games2: px(30469968),
  uni: px(27276221), uni2: px(29704449),
  desk: px(6893383), desk2: px(6912814),
};

export const img = (key, w) => `${IMGS[key]}${w ? `&h=${Math.round(w * 0.6)}&fit=crop` : ""}`;

// ------------------------------------------------------------
// Categories
// ------------------------------------------------------------
export const CATEGORIES = [
  {
    slug: "ai-tools", name: "AI Tools", img: "ai", accent: "#c3b6ff",
    tagline: "The intelligence layer", count: 64,
    desc: "Hands-on tests of the models, assistants and creative engines reshaping how work gets done.",
    subs: [
      { slug: "assistants", name: "Assistants", count: 18 },
      { slug: "image", name: "Image & Design", count: 14 },
      { slug: "video", name: "Video & Motion", count: 11 },
      { slug: "research", name: "Research", count: 9 },
      { slug: "coding", name: "Coding", count: 12 },
    ],
  },
  {
    slug: "software", name: "Software", img: "desk2", accent: "#c5e0ff",
    tagline: "Tools teams swear by", count: 52,
    desc: "Design suites, collaboration platforms and business software — tested inside real workflows.",
    subs: [
      { slug: "design", name: "Design", count: 14 },
      { slug: "collaboration", name: "Collaboration", count: 13 },
      { slug: "security", name: "Security", count: 8 },
      { slug: "analytics", name: "Analytics", count: 9 },
      { slug: "automation", name: "Automation", count: 8 },
    ],
  },
  {
    slug: "countries", name: "Countries", img: "coast", accent: "#ffd9c7",
    tagline: "Nations, ranked honestly", count: 38,
    desc: "Quality of life, food, adventure and value — the countries worth your year, ranked with data.",
    subs: [
      { slug: "quality-of-life", name: "Quality of Life", count: 9 },
      { slug: "adventure", name: "Adventure", count: 8 },
      { slug: "food", name: "Food", count: 8 },
      { slug: "budget", name: "Budget", count: 7 },
      { slug: "expat", name: "Expat Life", count: 6 },
    ],
  },
  {
    slug: "cities", name: "Cities", img: "tokyo", accent: "#ffc1db",
    tagline: "Urban life, decoded", count: 91,
    desc: "Nightlife, food scenes, weekend escapes and culture — the world's cities under the lens.",
    subs: [
      { slug: "nightlife", name: "After Dark", count: 22 },
      { slug: "food", name: "Food Cities", count: 19 },
      { slug: "weekend", name: "48 Hours", count: 21 },
      { slug: "culture", name: "Culture", count: 17 },
      { slug: "budget", name: "On a Budget", count: 12 },
    ],
  },
  {
    slug: "smartphones", name: "Smartphones", img: "phone", accent: "#d7ff87",
    tagline: "Pocket computers, rated", count: 47,
    desc: "Flagships, camera kings and budget surprises — every phone benchmarked and lived with.",
    subs: [
      { slug: "flagship", name: "Flagships", count: 16 },
      { slug: "camera", name: "Camera Phones", count: 10 },
      { slug: "budget", name: "Budget", count: 12 },
      { slug: "gaming", name: "Gaming", count: 5 },
      { slug: "foldable", name: "Foldables", count: 4 },
    ],
  },
  {
    slug: "universities", name: "Universities", img: "uni", accent: "#fff0a8",
    tagline: "Where ambition studies", count: 29,
    desc: "Global rankings grounded in outcomes, research, teaching and the student experience.",
    subs: [
      { slug: "global", name: "World Ranking", count: 8 },
      { slug: "engineering", name: "Engineering", count: 6 },
      { slug: "arts", name: "Arts & Humanities", count: 5 },
      { slug: "business", name: "Business", count: 6 },
      { slug: "scholarships", name: "Scholarships", count: 4 },
    ],
  },
  {
    slug: "restaurants", name: "Restaurants", img: "food", accent: "#ff9c75",
    tagline: "Tables worth travelling for", count: 76,
    desc: "Tasting menus, street food legends and reservations to plan a year around.",
    subs: [
      { slug: "fine-dining", name: "Fine Dining", count: 21 },
      { slug: "street-food", name: "Street Food", count: 16 },
      { slug: "sushi", name: "Sushi & Omakase", count: 12 },
      { slug: "vegetarian", name: "Vegetarian", count: 13 },
      { slug: "brunch", name: "Brunch", count: 14 },
    ],
  },
  {
    slug: "cars", name: "Cars", img: "car", accent: "#c4ffeb",
    tagline: "Machines with character", count: 55,
    desc: "EVs, sports cars and family haulers — driven, measured and ranked without nostalgia.",
    subs: [
      { slug: "electric", name: "Electric", count: 15 },
      { slug: "suv", name: "SUVs", count: 13 },
      { slug: "sports", name: "Sports", count: 11 },
      { slug: "family", name: "Family", count: 9 },
      { slug: "luxury", name: "Luxury", count: 7 },
    ],
  },
  {
    slug: "movies", name: "Movies", img: "cinema", accent: "#ffb3b3",
    tagline: "Worth your two hours", count: 83,
    desc: "The year's essential films, streaming gems and modern classics — curated, not crowd-sourced.",
    subs: [
      { slug: "stream", name: "Right Now", count: 18 },
      { slug: "classics", name: "Modern Classics", count: 20 },
      { slug: "documentary", name: "Documentaries", count: 15 },
      { slug: "animation", name: "Animation", count: 12 },
      { slug: "world", name: "World Cinema", count: 18 },
    ],
  },
  {
    slug: "games", name: "Games", img: "games", accent: "#b3c6ff",
    tagline: "Play, considered", count: 68,
    desc: "From hundred-hour epics to two-hour miracles — the games that justify your time.",
    subs: [
      { slug: "year", name: "This Year", count: 16 },
      { slug: "indie", name: "Indie", count: 15 },
      { slug: "rpg", name: "RPGs", count: 12 },
      { slug: "multiplayer", name: "Multiplayer", count: 13 },
      { slug: "retro", name: "Retro", count: 12 },
    ],
  },
  {
    slug: "animals", name: "Animals", img: "lion", accent: "#ffe29e",
    tagline: "The wild, ranked", count: 34,
    desc: "Nature's most extraordinary creatures — where to see them, and why they matter.",
    subs: [
      { slug: "safari", name: "Safari", count: 9 },
      { slug: "ocean", name: "Ocean", count: 8 },
      { slug: "birds", name: "Birds", count: 7 },
      { slug: "endangered", name: "Endangered", count: 6 },
      { slug: "pets", name: "Companions", count: 4 },
    ],
  },
  {
    slug: "beaches", name: "Beaches", img: "beach", accent: "#a8ecff",
    tagline: "Sand, scientifically chosen", count: 41,
    desc: "The world's most beautiful shorelines — from famous bays to beaches with no roads in.",
    subs: [
      { slug: "tropical", name: "Tropical", count: 12 },
      { slug: "surf", name: "Surf", count: 9 },
      { slug: "secluded", name: "Secluded", count: 8 },
      { slug: "family", name: "Family", count: 6 },
      { slug: "europe", name: "Europe", count: 6 },
    ],
  },
  {
    slug: "destinations", name: "Destinations", img: "amalfi", accent: "#ffc9a8",
    tagline: "Places that deliver", count: 88,
    desc: "Islands, road trips, city breaks and once-in-a-decade journeys — ranked by payoff.",
    subs: [
      { slug: "europe", name: "Europe", count: 24 },
      { slug: "asia", name: "Asia", count: 22 },
      { slug: "islands", name: "Islands", count: 14 },
      { slug: "road-trips", name: "Road Trips", count: 13 },
      { slug: "winter", name: "Winter", count: 15 },
    ],
  },
  {
    slug: "programming-languages", name: "Programming Languages", img: "code", accent: "#a8ffc9",
    tagline: "Syntax with a future", count: 24,
    desc: "The languages worth your learning hours — weighed by careers, community and craft.",
    subs: [
      { slug: "beginner", name: "Beginner Friendly", count: 6 },
      { slug: "web", name: "Web", count: 6 },
      { slug: "data", name: "Data & AI", count: 5 },
      { slug: "systems", name: "Systems", count: 4 },
      { slug: "mobile", name: "Mobile", count: 3 },
    ],
  },
  {
    slug: "crm-software", name: "CRM Software", img: "desk", accent: "#e6c9ff",
    tagline: "Relationships, systemised", count: 19,
    desc: "The CRMs that help teams sell without drowning in admin — tested with real pipelines.",
    subs: [
      { slug: "small-business", name: "Small Business", count: 6 },
      { slug: "enterprise", name: "Enterprise", count: 4 },
      { slug: "startups", name: "Startups", count: 4 },
      { slug: "free", name: "Free Tiers", count: 2 },
      { slug: "sales", name: "Sales Teams", count: 3 },
    ],
  },
  {
    slug: "productivity-apps", name: "Productivity Apps", img: "desk2", accent: "#d0ffb3",
    tagline: "Do fewer things better", count: 43,
    desc: "Notes, tasks, calendars and focus tools — the apps that earn a place on your dock.",
    subs: [
      { slug: "notes", name: "Notes", count: 11 },
      { slug: "tasks", name: "Tasks", count: 9 },
      { slug: "calendar", name: "Calendar", count: 7 },
      { slug: "focus", name: "Focus", count: 8 },
      { slug: "teams", name: "For Teams", count: 8 },
    ],
  },
];

// ------------------------------------------------------------
// Authors
// ------------------------------------------------------------
export const AUTHORS = [
  {
    slug: "maya-chen", name: "Maya Chen", role: "Senior Editor, Technology",
    initials: "MC", color: "#c3b6ff", rankings: 48, followers: "38k",
    bio: "Maya has spent twelve years reviewing software and AI products. She leads the TOP8 labs testing programme and believes the best tool is the one you forget you are using.",
  },
  {
    slug: "james-okafor", name: "James Okafor", role: "Travel Editor",
    initials: "JO", color: "#ffd9c7", rankings: 37, followers: "52k",
    bio: "James has filed from 61 countries and counting. He edits the travel desk with a simple rule: if a place cannot surprise a local, it does not make the list.",
  },
  {
    slug: "elena-rodriguez", name: "Elena Rodríguez", role: "Culture Critic",
    initials: "ER", color: "#ffc1db", rankings: 29, followers: "44k",
    bio: "Elena covers film, games and the arts. Formerly a programmer at two international festivals, she cares about how a work makes you feel on an ordinary Tuesday.",
  },
  {
    slug: "david-kim", name: "David Kim", role: "Products Analyst",
    initials: "DK", color: "#d7ff87", rankings: 26, followers: "21k",
    bio: "David benchmarks phones, cars and gear for a living. His reviews are equal parts lab data and real life — battery tests next to drop tests next to actual pockets.",
  },
];

// ------------------------------------------------------------
// Collections
// ------------------------------------------------------------
export const COLLECTIONS = [
  {
    slug: "creative-intelligence", name: "The Creative Intelligence Edit",
    desc: "AI tools and apps that help you make things — tested for taste, not just speed.",
    img: "ai", count: 3, tone: "#c3b6ff",
    rankingSlugs: ["best-ai-tools-2025", "ai-image-generators", "best-productivity-apps"],
  },
  {
    slug: "endless-summer", name: "Endless Summer",
    desc: "Coastlines, islands and the cities beside them. A year of warm water, planned.",
    img: "beach", count: 3, tone: "#a8ecff",
    rankingSlugs: ["best-beaches-world", "european-escapes", "asia-destinations"],
  },
  {
    slug: "the-big-screen", name: "The Big Screen",
    desc: "Films and games that are actually events. What to watch and play this season.",
    img: "cinema", count: 2, tone: "#ffb3b3",
    rankingSlugs: ["best-films-right-now", "best-games-2025"],
  },
  {
    slug: "city-weekends", name: "City Weekends, Done Right",
    desc: "Forty-eight hours in the world's great cities — where to eat, drink and disappear.",
    img: "tokyo", count: 2, tone: "#ffc1db",
    rankingSlugs: ["cities-after-dark", "tasting-menus-worth-flight"],
  },
  {
    slug: "money-moves", name: "Money Moves",
    desc: "The software and phones that pay for themselves — ranked by return, not hype.",
    img: "desk", count: 3, tone: "#d0ffb3",
    rankingSlugs: ["best-crm-software", "software-teams-love", "best-budget-phones-2025"],
  },
];

// ------------------------------------------------------------
// Countries (country rankings + detail)
// ------------------------------------------------------------
export const COUNTRIES = [
  {
    slug: "japan", name: "Japan", img: "tokyo", region: "East Asia",
    capital: "Tokyo", bestTime: "Mar–May, Oct–Nov", visitors: "25M / yr", score: 9.3,
    blurb: "Precision and chaos in perfect balance — listening bars at 2am, temple gardens at dawn.",
    facts: ["Rail passes beat domestic flights", "Convenience stores are a food scene", "Book popular restaurants 60 days out", "Cash still matters outside big cities"],
    rankingSlugs: ["cities-after-dark", "tasting-menus-worth-flight", "best-countries-quality-life"],
  },
  {
    slug: "italy", name: "Italy", img: "amalfi", region: "Southern Europe",
    capital: "Rome", bestTime: "Apr–Jun, Sep–Oct", visitors: "57M / yr", score: 9.4,
    blurb: "The heavyweight of pleasure. Every region is a different country wearing the same flag.",
    facts: ["Aperitivo hour is sacred", "South of Rome is a different Italy", "Trains connect everything worth seeing", "August belongs to the locals"],
    rankingSlugs: ["european-escapes", "tasting-menus-worth-flight", "best-beaches-world"],
  },
  {
    slug: "portugal", name: "Portugal", img: "coast", region: "Southern Europe",
    capital: "Lisbon", bestTime: "May–Oct", visitors: "26M / yr", score: 9.2,
    blurb: "Atlantic light, old trams and Europe's easiest-going coastline. Still underpriced.",
    facts: ["Lisbon rewards walkers, not drivers", "The Algarve is better in May", "Porto eats as well as it drinks", "Time your pastéis for 11am"],
    rankingSlugs: ["european-escapes", "best-beaches-world", "best-countries-quality-life"],
  },
  {
    slug: "greece", name: "Greece", img: "sea", region: "Southern Europe",
    capital: "Athens", bestTime: "May–Jun, Sep", visitors: "32M / yr", score: 9.0,
    blurb: "Six thousand islands and one rule: the further the ferry, the better the taverna.",
    facts: ["Skip Santorini's sunset crowds for Folegandros", "Ferries beat flights between islands", "Athens deserves three days, not one", "September sea is warmest"],
    rankingSlugs: ["best-beaches-world", "european-escapes", "best-countries-quality-life"],
  },
  {
    slug: "kenya", name: "Kenya", img: "lion", region: "East Africa",
    capital: "Nairobi", bestTime: "Jul–Oct", visitors: "2M / yr", score: 9.1,
    blurb: "The original safari stage. The Masai Mara during migration is Earth's greatest show.",
    facts: ["Migration peaks August to October", "Conservancies beat the main reserve", "Nairobi's food scene is underrated", "Combine the Mara with the coast"],
    rankingSlugs: ["extraordinary-animals", "best-beaches-world", "asia-destinations"],
  },
  {
    slug: "france", name: "France", img: "food", region: "Western Europe",
    capital: "Paris", bestTime: "Apr–Jun, Sep–Nov", visitors: "89M / yr", score: 9.2,
    blurb: "The benchmark for eating well. The best meals are rarely the ones with the queue.",
    facts: ["Lunch menus are the insider deal", "Paris rewards the second arrondissement wander", "Lyon is the stomach of the country", "August means the coast, not the capital"],
    rankingSlugs: ["tasting-menus-worth-flight", "cities-after-dark", "european-escapes"],
  },
];

// ------------------------------------------------------------
// Articles (editorial)
// ------------------------------------------------------------
export const ARTICLES = [
  { slug: "how-we-test", title: "How TOP8 Tests Everything We Rank", dek: "340 hours, 67 tools, one spreadsheet with strong opinions. Inside the labs methodology.", img: "ai", author: "maya-chen", date: "Mar 14, 2025", read: 9, cat: "Methodology" },
  { slug: "eight-is-enough", title: "Why We Cap Every List at Eight", dek: "Infinite scrolls create infinite doubt. The case for radical editorial constraint.", img: "amalfi", author: "james-okafor", date: "Mar 10, 2025", read: 6, cat: "Editorial" },
  { slug: "night-city-guide", title: "A Field Guide to Cities After Midnight", dek: "What a city does at 1am tells you everything about what it is.", img: "tokyo", author: "james-okafor", date: "Mar 6, 2025", read: 11, cat: "Cities" },
  { slug: "tasting-menu-economy", title: "The Real Economics of a $400 Tasting Menu", dek: "Where the money goes, when it is worth it, and when to order à la carte instead.", img: "food", author: "elena-rodriguez", date: "Feb 27, 2025", read: 8, cat: "Restaurants" },
  { slug: "beach-science", title: "The Science of a Perfect Beach", dek: "Grain size, water clarity, crowd density — the metrics behind our shoreline scores.", img: "beach", author: "james-okafor", date: "Feb 20, 2025", read: 7, cat: "Beaches" },
  { slug: "ev-awakening", title: "The EV Awakening: What Changed in 2025", dek: "Range anxiety is dead. Charging is boring. Electric cars finally have personality.", img: "car", author: "david-kim", date: "Feb 12, 2025", read: 10, cat: "Cars" },
];

// ------------------------------------------------------------
// Misc
// ------------------------------------------------------------
export const TRENDING_TAGS = ["ai assistants", "kyoto", "ev range", "omakase", "pixel 10", "notion templates", "safari season", "mental ray cuts", "budget phones", "lisbon", "crm for startups", "documentaries"];

export const POPULAR_SEARCHES = ["Best AI tools for creative work", "Most beautiful beaches in the world", "Phones with the best cameras", "Cities with the best food", "CRM software for small teams", "Programming languages for beginners"];

export const STATS = [
  { value: 1248, suffix: "", label: "Rankings published" },
  { value: 5600, suffix: "+", label: "Hours of testing" },
  { value: 96, suffix: "", label: "Categories live" },
  { value: 2.4, suffix: "M", label: "Monthly readers", decimals: 1 },
];

export const GUIDE_TIPS = {
  "ai-tools": ["Pick for your workflow, not the benchmark — a tool you open daily beats a slightly smarter one you avoid.", "Check the data policy before pasting anything you would not forward to a stranger.", "Every tool on this list has a free tier. Test against your own real tasks for a week before paying."],
  "smartphones": ["Buy the camera you will actually carry — sensor size matters more than megapixel marketing.", "Seven years of updates now beats yearly spec bumps. Choose longevity.", "Last year's flagship is this year's best deal. Compare before you commit."],
  "cities": ["Stay central and walk — the best hours of any city happen between famous places.", "Ask one local for one place. Follow the advice exactly.", "The 1am version of a city is the real one. Budget energy accordingly."],
  "destinations": ["Shoulder season is the cheat code: same place, half the people, lower prices.", "One base for three nights beats three bases for one night each.", "Book the one famous thing early, leave everything else loose."],
  "movies": ["Watch the director's previous film first — context doubles the payoff.", "The best screening is the one with no phone in your hand.", "If a film divides the room, it is usually the one to see."],
  "restaurants": ["Book 30–60 days out for iconic tables, or walk in at opening on a Tuesday.", "Tasting menus are worth it when the kitchen has a point of view, not just technique.", "The middle of the menu is often where a chef hides their best idea."],
  "default": ["Decide what actually matters to you before comparing — every list winner leads somewhere different.", "The #1 pick is our answer to the most common case. Your case may point to #2 or #3.", "Prices and availability change. Check the source before you commit."],
};
