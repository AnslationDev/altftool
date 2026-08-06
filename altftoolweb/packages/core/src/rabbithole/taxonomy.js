/**
 * AltF Rabbithole — taxonomy.
 *
 * The catalog is a directory of websites worth losing an evening to. Everything
 * a page can filter, sort, or group by is declared here so the data files stay
 * dumb arrays and the validator has a single source of truth to check against.
 */

export const BRAND = Object.freeze({
  name: "AltF Rabbithole",
  shortName: "Rabbithole",
  href: "/rabbithole",
  tagline: "The good internet is still out there.",
  promise:
    "A hand-checked directory of websites that are strange, beautiful, useful or quietly brilliant — sorted so you can find the right one in under a minute.",
});

/**
 * When every link in the catalog was last opened and checked.
 *
 * Deliberately one date for the whole corpus rather than a per-entry field:
 * the catalog is verified in sweeps, so a per-entry timestamp would be fake
 * precision. Bump this when a sweep finishes, and only then.
 */
export const REVIEWED_ON = Object.freeze({
  iso: "2026-07-29",
  label: "29 July 2026",
});

/**
 * Categories double as landing pages, so each carries its own copy: `blurb` is
 * the card line, `intro` opens the category page, and `metaDescription` is the
 * search snippet. Writing them together keeps the three from drifting apart.
 */
export const CATEGORIES = Object.freeze([
  {
    id: "time-machines",
    name: "Time Machines",
    icon: "History",
    tone: "amber",
    blurb: "The internet's own memory, still browsable.",
    intro:
      "Archives, dead websites brought back, and search engines pointed at the past. These are the sites that remember what the web looked like before it settled down.",
    metaDescription:
      "Web archives and internet history sites — browse the Wayback Machine, resurrected 90s pages, GeoCities GIFs and other ways to visit the old internet.",
  },
  {
    id: "beautiful-useless",
    name: "Beautifully Useless",
    icon: "Sparkle",
    tone: "violet",
    blurb: "No purpose whatsoever, and that is the point.",
    intro:
      "Sites that do exactly one strange thing extremely well and solve no problem at all. The purest form of the web — somebody built this because it amused them.",
    metaDescription:
      "The best useless websites on the internet — pointless, funny and oddly beautiful pages built for no reason other than delight.",
  },
  {
    id: "generative-toys",
    name: "Generative Toys",
    icon: "Wand2",
    tone: "fuchsia",
    blurb: "Move the mouse, make something you can keep.",
    intro:
      "Instruments disguised as web pages. Drag, type or click and something visual or musical appears — no tutorial, no account, no blank canvas anxiety.",
    metaDescription:
      "Creative browser toys that turn clicks and keystrokes into art, music and animation — generative drawing tools you can use instantly, free.",
  },
  {
    id: "mind-benders",
    name: "Mind Benders",
    icon: "Puzzle",
    tone: "indigo",
    blurb: "One more round, then bed. Definitely.",
    intro:
      "Puzzles, logic games and daily habits that fit in a browser tab. Short enough for a coffee break, sharp enough that you will be thinking about them afterwards.",
    metaDescription:
      "Free browser puzzle games and logic challenges — daily word games, number puzzles and brain teasers that need no download or sign-up.",
  },
  {
    id: "explain-everything",
    name: "Explain Everything",
    icon: "Lightbulb",
    tone: "sky",
    blurb: "Hard things, made suddenly obvious.",
    intro:
      "Explainers that use motion, interaction and scrolling to teach what a paragraph never could. The clearest teaching on the internet lives here.",
    metaDescription:
      "Interactive explainers and visual essays that make complex topics click — the best educational websites for learning by playing with the idea.",
  },
  {
    id: "cosmos-and-scale",
    name: "Cosmos & Scale",
    icon: "Orbit",
    tone: "blue",
    blurb: "Zoom out until you feel small.",
    intro:
      "Space, deep time, and the size of things. Every site here exists to give you the one feeling a textbook diagram cannot: actual scale.",
    metaDescription:
      "Interactive space and scale websites — explore the universe, compare sizes from quarks to galaxies, and travel through deep time in your browser.",
  },
  {
    id: "live-planet",
    name: "The Live Planet",
    icon: "Globe2",
    tone: "emerald",
    blurb: "What Earth is doing, right this second.",
    intro:
      "Live data drawn on a map: flights, ships, weather, wildlife, earthquakes, radio. Open one and the planet stops being an abstraction.",
    metaDescription:
      "Real-time maps of Earth — track flights, ships, storms, earthquakes, sharks and live radio around the world as it happens.",
  },
  {
    id: "sound-and-signal",
    name: "Sound & Signal",
    icon: "Radio",
    tone: "rose",
    blurb: "Music discovery that beats the algorithm.",
    intro:
      "Ways into music that no recommendation engine will give you — by genre map, by country, by decade, or by finding the songs literally nobody has played.",
    metaDescription:
      "Music discovery websites that go beyond streaming algorithms — explore genres, decades, world radio and forgotten tracks nobody has heard.",
  },
  {
    id: "calm-corner",
    name: "The Calm Corner",
    icon: "Waves",
    tone: "teal",
    blurb: "Somewhere to put your shoulders down.",
    intro:
      "Ambient sound, breathing exercises, slow visuals and sixty-second resets. Low stimulation on purpose — open one in a background tab and leave it there.",
    metaDescription:
      "Calming websites for focus and stress relief — ambient sound mixers, rain sounds, breathing exercises and short meditation tools, all free.",
  },
  {
    id: "deep-archives",
    name: "Deep Archives",
    icon: "Library",
    tone: "stone",
    blurb: "Long reads and older, stranger knowledge.",
    intro:
      "Essays, public-domain scans, encyclopaedias and collections built by people who cared far too much about one subject. Bring time.",
    metaDescription:
      "Free libraries, archives and long-form reading on the web — public domain books, art scans, science essays and specialist encyclopaedias.",
  },
  {
    id: "comedy-department",
    name: "Comedy Department",
    icon: "Laugh",
    tone: "orange",
    blurb: "Reliable laughs, low commitment.",
    intro:
      "Satire, comics and the sort of internet humour that has survived a decade of reposting. Open in a tab you can close quickly.",
    metaDescription:
      "Funny websites worth bookmarking — satire news, webcomics and internet humour that still holds up after years of reposting.",
  },
  {
    id: "wiki-dives",
    name: "Wiki Dives",
    icon: "Network",
    tone: "cyan",
    blurb: "Enter for one fact, leave two hours later.",
    intro:
      "Densely linked reference sites engineered — accidentally or otherwise — to make you click one more entry. The original rabbit holes.",
    metaDescription:
      "The internet's best rabbit hole websites — deeply linked wikis and reference sites where one click turns into two hours of reading.",
  },
  {
    id: "practical-magic",
    name: "Practical Magic",
    icon: "Wrench",
    tone: "lime",
    blurb: "Free tools that feel like cheating.",
    intro:
      "Sites that quietly do a job you would otherwise pay for or install software for. Interesting because they are genuinely, unreasonably good.",
    metaDescription:
      "Genuinely useful free websites — photo editors, converters, recipe finders and browser tools that replace paid software with no sign-up.",
  },
  {
    id: "ai-playground",
    name: "AI Playground",
    icon: "Bot",
    tone: "purple",
    blurb: "Machine learning you can poke at.",
    intro:
      "Models you can play with directly in a tab — generators, guessers, classifiers and the odd unsettling demo. Understanding by messing about.",
    metaDescription:
      "Free AI websites you can try in the browser — image generators, drawing guessers, face synthesis demos and hands-on machine learning toys.",
  },
  {
    id: "pixel-nostalgia",
    name: "Pixel Nostalgia",
    icon: "Joystick",
    tone: "yellow",
    blurb: "Old software, running again, in a tab.",
    intro:
      "Emulated arcades, resurrected operating systems and interfaces that have no business still working. Nostalgia with a working keyboard.",
    metaDescription:
      "Retro websites and browser emulators — play classic arcade games, boot old operating systems and revisit 90s interfaces online for free.",
  },
  {
    id: "data-made-visible",
    name: "Data Made Visible",
    icon: "ChartScatter",
    tone: "red",
    blurb: "Numbers that finally mean something.",
    intro:
      "Visual journalism and open data done properly — charts you can interrogate rather than just look at. The argument is in the interaction.",
    metaDescription:
      "The best data visualisation websites — interactive charts, visual journalism and open datasets that make statistics understandable.",
  },
  {
    id: "wholesome-web",
    name: "The Wholesome Web",
    icon: "PawPrint",
    tone: "pink",
    blurb: "For when the feed has been too much.",
    intro:
      "Animals, kindness, small good news and pages built purely to improve your afternoon. No irony anywhere on this list.",
    metaDescription:
      "Wholesome websites that lift your mood — puppies, good news, kindness projects and comforting corners of the internet.",
  },
  {
    id: "sandboxes",
    name: "Sandboxes & Simulators",
    icon: "FlaskConical",
    tone: "green",
    blurb: "Small worlds that keep running without you.",
    intro:
      "Physics toys, ecosystems and simulations with no win condition. Set the initial state, then watch what the rules do with it.",
    metaDescription:
      "Browser sandbox games and simulators — physics toys, ecosystem sims and falling-sand games with no goal except watching what happens.",
  },
]);

export const CATEGORY_IDS = Object.freeze(CATEGORIES.map((c) => c.id));

/**
 * `timeToJoy` answers the only question a visitor actually has: how long before
 * this is worth it? It is the primary sort on the browse page.
 */
export const TIME_BANDS = Object.freeze([
  {
    id: "instant",
    label: "Instant",
    hint: "Good within five seconds of loading.",
    minutes: 0,
  },
  {
    id: "one-minute",
    label: "A minute",
    hint: "One quick round, then you can leave.",
    minutes: 1,
  },
  {
    id: "coffee-break",
    label: "Coffee break",
    hint: "Five to fifteen minutes of proper attention.",
    minutes: 10,
  },
  {
    id: "rabbit-hole",
    label: "Rabbit hole",
    hint: "Clear your evening. We warned you.",
    minutes: 60,
  },
]);

export const TIME_BAND_IDS = Object.freeze(TIME_BANDS.map((b) => b.id));

/**
 * Vibes are the cross-cutting filter — a site can carry up to three.
 *
 * Each one also gets its own landing page, because "calming websites" and
 * "weird websites" are things people actually search for and no category name
 * answers. That means every vibe needs the same three pieces of copy a
 * category has: `blurb` for the chip row, `intro` to open the page, and
 * `metaDescription` for the snippet. `heading` is the plural noun phrase used
 * in the H1 and title, which is rarely just the adjective.
 */
export const VIBES = Object.freeze([
  {
    id: "mesmerising",
    label: "Mesmerising",
    heading: "Mesmerising websites",
    tone: "violet",
    blurb: "Hard to look away from.",
    intro:
      "Sites you open for ten seconds and close four minutes later. Loops, generative motion and things that keep changing on their own — nothing here is trying to hold your attention, it just does.",
    metaDescription:
      "Mesmerising websites that are hard to stop watching — infinite zooms, generative art, particle toys and loops that never quite repeat. All free.",
  },
  {
    id: "funny",
    label: "Funny",
    heading: "Funny websites",
    tone: "orange",
    blurb: "Actually funny, not just quirky.",
    intro:
      "Satire, comics and single-joke pages that have survived years of reposting. The bar for this tag is that it made someone laugh out loud, not that it was mildly amusing in 2011.",
    metaDescription:
      "Genuinely funny websites worth bookmarking — satire, webcomics, absurd single-purpose pages and internet humour that still lands.",
  },
  {
    id: "calming",
    label: "Calming",
    heading: "Calming websites",
    tone: "teal",
    blurb: "Lowers your heart rate a little.",
    intro:
      "Low-stimulation pages for a day that has had too much of everything. Ambient sound, slow visuals, breathing exercises and things that ask nothing of you.",
    metaDescription:
      "Calming websites for stress and focus — rain sounds, ambient mixers, breathing exercises and slow visuals you can leave open in a tab.",
  },
  {
    id: "brainy",
    label: "Brainy",
    heading: "Websites that teach you something",
    tone: "sky",
    blurb: "You will repeat this to someone.",
    intro:
      "Interactive explainers, visual journalism and reference work good enough that the fact sticks. Time spent on these is the opposite of time wasted.",
    metaDescription:
      "Educational websites that actually teach — interactive explainers, visual essays, simulations and reference sites that make ideas click.",
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    heading: "Nostalgic websites",
    tone: "amber",
    blurb: "The internet you remember.",
    intro:
      "Emulators, archives and pages that never got redesigned. Some are genuinely old, some are careful recreations, and a few have simply been running untouched for twenty years.",
    metaDescription:
      "Nostalgic websites and retro internet — 90s page revivals, browser emulators, web archives and sites that never changed.",
  },
  {
    id: "useful",
    label: "Useful",
    heading: "Genuinely useful websites",
    tone: "lime",
    blurb: "Free, and better than it should be.",
    intro:
      "Sites that quietly do a job you would otherwise install software or pay a subscription for. They earn a place in a directory of interesting websites by being unreasonably good at one thing.",
    metaDescription:
      "Useful free websites that replace paid software — editors, converters, planners and browser tools that need no download or sign-up.",
  },
  {
    id: "weird",
    label: "Weird",
    heading: "Weird websites",
    tone: "fuchsia",
    blurb: "Somebody built this on purpose.",
    intro:
      "The strange end of the web: pages with no business existing, made by one person for one reason that was never explained. This is the tag most likely to make you send a link to someone.",
    metaDescription:
      "Weird websites worth seeing — strange, pointless and oddly specific corners of the internet built by people with too much time.",
  },
  {
    id: "beautiful",
    label: "Beautiful",
    heading: "Beautiful websites",
    tone: "pink",
    blurb: "Worth opening on the big screen.",
    intro:
      "Sites where the craft is the point — typography, motion, illustration and interfaces made by people who cared far more than the brief required.",
    metaDescription:
      "Beautiful websites and web design worth seeing — visual craft, motion, typography and interactive art in the browser.",
  },
  {
    id: "competitive",
    label: "Competitive",
    heading: "Competitive browser games",
    tone: "indigo",
    blurb: "One more round. Definitely the last.",
    intro:
      "Scores, streaks, daily puzzles and things you will want to beat. Short enough for a break, sharp enough that you will come back tomorrow.",
    metaDescription:
      "Competitive browser games and daily puzzles — scores, streaks and quick challenges you can play free with no download.",
  },
  {
    id: "cosy",
    label: "Cosy",
    heading: "Cosy corners of the internet",
    tone: "stone",
    blurb: "Small, warm and unhurried.",
    intro:
      "Pages that feel like somebody's front room. Slow, handmade, personal, and entirely uninterested in growth — the opposite of a feed.",
    metaDescription:
      "Cosy websites for a quiet evening — small handmade pages, gentle simulations and unhurried corners of the internet.",
  },
  {
    id: "unsettling",
    label: "Unsettling",
    heading: "Unsettling websites",
    tone: "red",
    blurb: "Slightly wrong, in a good way.",
    intro:
      "Nothing here is a horror site. These are pages that sit a little off — uncanny generated faces, scale that stops being comfortable, simulations that keep running after you look away.",
    metaDescription:
      "Unsettling websites that get under your skin — uncanny generators, unnerving scale and quietly strange simulations. Nothing graphic.",
  },
  {
    id: "wholesome",
    label: "Wholesome",
    heading: "Wholesome websites",
    tone: "green",
    blurb: "No irony anywhere on this page.",
    intro:
      "Animals, kindness, small good news and pages built purely to improve somebody's afternoon. Open one when the feed has been too much.",
    metaDescription:
      "Wholesome websites that lift your mood — puppies, good news, kindness projects and comforting corners of the internet.",
  },
]);

export const VIBE_IDS = Object.freeze(VIBES.map((v) => v.id));

export const DEVICES = Object.freeze(["desktop", "mobile", "both"]);

/**
 * Collections are editorial cross-sections — they cut across categories by
 * answering a mood rather than a topic. `rule` is evaluated against the catalog
 * at build time, so a collection never goes stale when entries are added.
 */
export const COLLECTIONS = Object.freeze([
  {
    id: "ten-minutes-to-kill",
    browse: "?time=instant,one-minute",
    name: "Ten minutes to kill",
    blurb: "You are early for something. These are the right length.",
    intro:
      "Every site here pays off inside a short break and lets you walk away cleanly — no save file, no streak to protect, nothing that needs finishing.",
    rule: (site) =>
      site.timeToJoy === "instant" || site.timeToJoy === "one-minute",
    limit: 36,
  },
  {
    id: "feels-like-magic",
    browse: "?vibe=mesmerising,beautiful",
    name: "Sites that feel like magic",
    blurb: "The first ten seconds do something you did not expect.",
    intro:
      "The reaction we were sorting for is the small involuntary one — where a browser tab does something it has no right to be able to do.",
    rule: (site) =>
      site.vibes.includes("mesmerising") || site.vibes.includes("beautiful"),
    limit: 36,
  },
  {
    id: "quiet-tabs",
    browse: "?vibe=calming,cosy",
    name: "Quiet tabs",
    blurb: "Low stimulation, for a day that has had enough.",
    intro:
      "Nothing here flashes, autoplays loudly or asks for anything. Open one in a background tab and let it sit there while you work.",
    rule: (site) =>
      site.vibes.includes("calming") || site.vibes.includes("cosy"),
    limit: 30,
  },
  {
    id: "actually-learn-something",
    browse: "?vibe=brainy",
    name: "Actually learn something",
    blurb: "Time on these is not time wasted.",
    intro:
      "Interactive teaching, visual journalism and reference work good enough that you will repeat what you read here to somebody else.",
    rule: (site) => site.vibes.includes("brainy"),
    limit: 36,
  },
  {
    id: "show-someone-else",
    browse: "?vibe=funny,weird,wholesome",
    name: "Show this to someone",
    blurb: "Built for handing over a phone.",
    intro:
      "Sites that land in one sentence of setup — the ones you send to a group chat rather than bookmark for yourself.",
    rule: (site) =>
      site.vibes.includes("funny") ||
      site.vibes.includes("weird") ||
      site.vibes.includes("wholesome"),
    limit: 36,
  },
  {
    id: "works-on-your-phone",
    browse: "?only=mobile",
    name: "Good on a phone",
    blurb: "Tested to be worth opening on a small screen.",
    intro:
      "Plenty of the classic web assumes a mouse and a wide window. Everything in this collection holds up on mobile.",
    rule: (site) => site.bestOn === "mobile" || site.bestOn === "both",
    limit: 36,
  },
  {
    id: "no-account-needed",
    browse: "?only=noSignup",
    name: "No sign-up, no email",
    blurb: "Open the link, use the thing, close the tab.",
    intro:
      "Free, immediately usable, and not interested in your email address. A shrinking category, which is why it gets its own page.",
    rule: (site) => site.free && !site.needsAccount,
    limit: 36,
  },
  {
    id: "the-old-internet",
    browse: null,
    name: "The old internet",
    blurb: "Made before the web got tidy.",
    intro:
      "Sites from the era of personal pages and hand-written HTML, plus the archives that keep that period reachable.",
    rule: (site) => typeof site.year === "number" && site.year <= 2012,
    limit: 36,
  },
]);

export const COLLECTION_IDS = Object.freeze(COLLECTIONS.map((c) => c.id));

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) || null;
}

export function getCollection(id) {
  return COLLECTIONS.find((collection) => collection.id === id) || null;
}

export function getTimeBand(id) {
  return TIME_BANDS.find((band) => band.id === id) || null;
}

export function getVibe(id) {
  return VIBES.find((vibe) => vibe.id === id) || null;
}
