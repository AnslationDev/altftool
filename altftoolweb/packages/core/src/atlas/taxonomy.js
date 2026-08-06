/*
 * AltF Atlas — taxonomy
 *
 * The Atlas is a curated directory of sites that do ONE useful thing in a
 * browser tab. Everything downstream (routes, filters, sitemap, JSON-LD) is
 * generated from the four vocabularies in this file, so a new category or
 * intent is a one-line change here rather than an edit across twelve pages.
 *
 * Two rules keep the taxonomy honest:
 *   1. A category is a *kind of thing*; a use case is a *sentence a person
 *      types into a search box*. They are deliberately different shapes — the
 *      category pages win "best X sites", the use-case pages win "how do I X".
 *   2. Every vocabulary term carries its own copy (blurb, intro, metaTitle).
 *      A page with a generated H1 and no prose is a doorway page, and search
 *      engines have treated those as spam since 2015.
 */

/* ------------------------------------------------------------------ *
 * Access — what the site costs you before it does anything useful.
 * This is the filter people actually want and almost no directory ships.
 * ------------------------------------------------------------------ */
export const ACCESS_LEVELS = [
  {
    id: "open",
    label: "Open",
    short: "No sign-up",
    blurb: "Works the moment the page loads. No account, no email, no trial.",
    tone: "success",
  },
  {
    id: "account",
    label: "Free account",
    short: "Free account",
    blurb: "Free to use, but you have to register before it will do the job.",
    tone: "info",
  },
  {
    id: "freemium",
    label: "Freemium",
    short: "Free tier",
    blurb:
      "A genuinely usable free tier with paid plans for volume or team features.",
    tone: "warning",
  },
];

export const ACCESS_IDS = ACCESS_LEVELS.map((level) => level.id);

/* ------------------------------------------------------------------ *
 * Runtime — where the work happens. The whole premise of the Atlas is
 * "no server of your own, nothing to install", and `local` is the strongest
 * version of that: the file never leaves the machine.
 * ------------------------------------------------------------------ */
export const RUNTIMES = [
  {
    id: "local",
    label: "Runs on your device",
    blurb:
      "The processing happens in your browser. Files are not uploaded anywhere.",
  },
  {
    id: "hosted",
    label: "Runs on their server",
    blurb:
      "Your input is sent to the service to be processed. Fine for public data, think twice for private files.",
  },
];

/* ------------------------------------------------------------------ *
 * Status — the reason this directory exists.
 * The famous "101 useful websites" lists are now roughly half link rot. An
 * entry that dies does not get deleted here; it gets a `retired` status and a
 * successor, because "what replaced Ma.gnolia?" is a real question people ask.
 * ------------------------------------------------------------------ */
export const STATUSES = [
  { id: "live", label: "Live", blurb: "Reachable and still maintained." },
  {
    id: "retired",
    label: "Retired",
    blurb: "Shut down or abandoned. Kept on record with a working successor.",
  },
];

/* ------------------------------------------------------------------ *
 * Categories — 24 kinds of thing. Each is a route: /altfatlas/category/<slug>
 * ------------------------------------------------------------------ */
export const CATEGORIES = [
  {
    slug: "files-and-formats",
    name: "Files & Format Conversion",
    icon: "Repeat",
    tagline: "Turn one file type into another without installing anything.",
    metaTitle: "Best free online file converters",
    intro:
      "Format conversion is the single most common reason people search for a web tool. The sites here cover documents, images, audio, video, archives and the long tail of formats that desktop software quietly refuses to open — and the best of them do the conversion inside your browser, so the file never leaves your machine.",
  },
  {
    slug: "pdf-and-documents",
    name: "PDF & Documents",
    icon: "FileText",
    tagline: "Merge, split, sign, compress and repair PDFs in a tab.",
    metaTitle: "Free online PDF tools that need no sign-up",
    intro:
      "PDF is the format everyone has to handle and nobody wants to pay for. These sites cover the whole lifecycle — combining, splitting, compressing, filling forms, signing, unlocking, and converting to and from Office formats — without a desktop licence.",
  },
  {
    slug: "images-and-photos",
    name: "Images & Photo Editing",
    icon: "Image",
    tagline: "Crop, compress, upscale, restore and clean up pictures.",
    metaTitle: "Free browser photo editors and image tools",
    intro:
      "Full photo editors, single-purpose fixers and the increasingly good AI cleanup tools. The ones worth bookmarking share a trait: they open a file instantly instead of asking you to create a project first.",
  },
  {
    slug: "video-and-audio",
    name: "Video & Audio",
    icon: "Clapperboard",
    tagline: "Trim, caption, transcribe, convert and record media.",
    metaTitle: "Free online video editors, audio tools and recorders",
    intro:
      "Editing media used to mean a render farm and a licence. These sites handle trimming, subtitling, format conversion, stem separation, noise removal and screen recording from a tab — several of them entirely on-device via WebAssembly.",
  },
  {
    slug: "design-and-color",
    name: "Design, Colour & Type",
    icon: "Palette",
    tagline: "Palettes, fonts, icons, mockups and design assets.",
    metaTitle: "Free colour palette, font and design asset sites",
    intro:
      "The reference layer of design work: picking a palette that holds contrast, identifying a font from a screenshot, finding an icon set with a licence you can actually read, and generating the gradients, shadows and mockups that make a rough page look finished.",
  },
  {
    slug: "writing-and-text",
    name: "Writing & Text",
    icon: "PenLine",
    tagline: "Draft, edit, proofread, count, clean and transform text.",
    metaTitle: "Free online writing, grammar and text tools",
    intro:
      "Everything between a blank page and a finished document — distraction-free editors, grammar and readability checkers, plain-text scrubbers, case converters, diff viewers and the small utilities that fix a paste from Word.",
  },
  {
    slug: "ai-assistants",
    name: "AI Assistants & Generators",
    icon: "Sparkles",
    tagline:
      "Chat models, image generators and AI workbenches you can open now.",
    metaTitle: "Best free AI tools you can use in a browser",
    intro:
      "The AI layer of the useful web: general assistants, image and audio generators, transcription, summarisation and the model playgrounds worth knowing about. Free tiers move constantly here, so each entry states what you get without paying at the time of review.",
  },
  {
    slug: "developer-tools",
    name: "Developer & Code",
    icon: "Code2",
    tagline: "Format, validate, convert, test and share code.",
    metaTitle: "Free online developer tools and code playgrounds",
    intro:
      "The tabs that stay open in every developer's second window — JSON and regex workbenches, format converters, diff viewers, API clients, cron parsers, playgrounds and the paste sites that make a bug report reproducible.",
  },
  {
    slug: "data-and-spreadsheets",
    name: "Data, Tables & Charts",
    icon: "Table2",
    tagline: "Clean, join, query and visualise tabular data in a tab.",
    metaTitle: "Free online data cleaning, CSV and charting tools",
    intro:
      "Spreadsheets end where these begin: converting between CSV, JSON and SQL, cleaning messy exports, running queries against a local file, and turning the result into a chart good enough to put in a deck.",
  },
  {
    slug: "diagrams-and-whiteboards",
    name: "Diagrams & Whiteboards",
    icon: "Workflow",
    tagline: "Flowcharts, wireframes, mind maps and shared canvases.",
    metaTitle: "Free online diagram, whiteboard and mind map tools",
    intro:
      "Thinking tools. Architecture diagrams, sequence charts, mind maps, sticky-note canvases and the text-to-diagram tools that let you version a drawing in git.",
  },
  {
    slug: "productivity-and-notes",
    name: "Notes, Tasks & Focus",
    icon: "ListChecks",
    tagline: "Capture, plan, time-block and actually finish things.",
    metaTitle: "Free online note-taking, to-do and focus tools",
    intro:
      "Notes you can reach from any machine, task lists that survive a browser restart, timers that make a two-hour block feel finite, and the scratchpads that are faster to open than a native app.",
  },
  {
    slug: "collaboration-and-meetings",
    name: "Collaboration & Meetings",
    icon: "Users",
    tagline: "Meet, schedule, poll and work on the same document.",
    metaTitle: "Free online meeting, scheduling and collaboration tools",
    intro:
      "Getting other people involved without making them install anything: instant video rooms, scheduling links that respect time zones, group polls, shared documents and the anonymous feedback boards that make retros usable.",
  },
  {
    slug: "file-sharing-and-transfer",
    name: "File Sharing & Transfer",
    icon: "Send",
    tagline: "Move a large file to someone else without an account.",
    metaTitle: "Free large file transfer and sharing sites",
    intro:
      "Email attachment limits are the reason this category exists. Browser-to-browser transfers, expiring links, encrypted drops and the temporary hosts that are gone by tomorrow — which is often exactly what you want.",
  },
  {
    slug: "privacy-and-security",
    name: "Privacy & Security",
    icon: "ShieldCheck",
    tagline: "Check, clean, encrypt and reduce your exposure.",
    metaTitle: "Free privacy checkers and online security tools",
    intro:
      "Breach checks, password and passphrase generation, header and TLS audits, metadata scrubbing, disposable addresses and the link expanders that tell you where a shortened URL really goes before you click it.",
  },
  {
    slug: "learning-and-reference",
    name: "Learning & Reference",
    icon: "GraduationCap",
    tagline: "Courses, practice, languages and things worth knowing.",
    metaTitle: "Best free learning sites and online courses",
    intro:
      "Structured courses, practice-first sites and open reference libraries. Weighted towards places where you can start learning in the first minute rather than after a curriculum selection wizard.",
  },
  {
    slug: "maps-and-travel",
    name: "Maps & Travel",
    icon: "MapPin",
    tagline: "Routes, flights, time zones and places worth seeing.",
    metaTitle: "Best free map, flight tracking and travel planning sites",
    intro:
      "Route planners that understand cycling and hiking, live flight and ship tracking, time-zone maths for distributed teams, visa and border reference, and the map toys that are genuinely useful once a year.",
  },
  {
    slug: "music-and-radio",
    name: "Music, Radio & Sound",
    icon: "Music4",
    tagline: "Listen, discover, tune, practise and generate sound.",
    metaTitle: "Free online radio, music discovery and audio sites",
    intro:
      "Global radio, ambient generators for focus, music discovery that still works without an algorithm knowing you, plus tuners, metronomes, drum machines and notation tools that live in a tab.",
  },
  {
    slug: "reading-and-research",
    name: "Reading & Research",
    icon: "BookOpen",
    tagline: "Find, save, de-clutter and cite what you read.",
    metaTitle: "Free research, read-later and citation tools",
    intro:
      "Archives and open libraries, read-later queues, paper search, citation formatting, and the readers that strip a page back to its text. The research desk of the useful web.",
  },
  {
    slug: "web-utilities",
    name: "Web, Domain & Network",
    icon: "Globe2",
    tagline: "Inspect, test and troubleshoot anything with a URL.",
    metaTitle: "Free website testing, DNS and domain lookup tools",
    intro:
      "Speed and accessibility audits, DNS and WHOIS lookups, SSL checks, uptime probes, screenshot APIs, archived copies of pages that have since changed, and the small network utilities you need twice a year and cannot remember the name of.",
  },
  {
    slug: "money-and-business",
    name: "Money, Invoices & Business",
    icon: "Landmark",
    tagline: "Invoice, sign, calculate, register and get paid.",
    metaTitle: "Free invoicing, e-signature and small business tools",
    intro:
      "The administrative spine of freelancing and small business — invoices and quotes, e-signatures, currency and tax maths, contract templates, and the form builders that collect an answer without a subscription.",
  },
  {
    slug: "health-and-life",
    name: "Health & Everyday Life",
    icon: "HeartPulse",
    tagline: "Track, calculate and decide the ordinary things.",
    metaTitle: "Free health, fitness and everyday calculator sites",
    intro:
      "Sleep and exercise calculators, nutrition references, symptom and medication checkers with real editorial standards, plus the household maths — unit conversion, recipe scaling, splitting a bill — that comes up constantly.",
  },
  {
    slug: "career-and-hiring",
    name: "Career, Resume & Hiring",
    icon: "BriefcaseBusiness",
    tagline: "Build a CV, find work and prepare for the interview.",
    metaTitle: "Free resume builders, job boards and interview prep sites",
    intro:
      "Resume and portfolio builders that export a real PDF, job boards worth checking, salary data with a stated methodology, and interview practice for both the technical and the awkward parts.",
  },
  {
    slug: "media-discovery",
    name: "Film, TV & Media Discovery",
    icon: "Tv",
    tagline: "Decide what to watch, read or play next.",
    metaTitle: "Best sites for finding films, shows and books to watch",
    intro:
      "Where something is streaming, what to read next, which game is worth the weekend — recommendation engines, catalogue search and the archives that host things nobody else does.",
  },
  {
    slug: "email-and-communication",
    name: "Email & Communication",
    icon: "Mail",
    tagline: "Send, receive, alias, authenticate and test email.",
    metaTitle: "Free email testing, alias and deliverability tools",
    intro:
      "Email is the last piece of infrastructure almost everyone runs and almost nobody configures. These cover the practical half — disposable inboxes for a one-off signup, aliases that let you cut off a sender permanently, and the SPF, DKIM and DMARC checkers that explain why your mail is landing in spam.",
  },
];

/*
 * NOT a category here: fun / curiosity / "cool websites".
 *
 * That belongs to AltF Rabbithole (/rabbithole), which is organised around
 * time-to-joy rather than utility. Listing it in both places would put two
 * pages on this domain in competition for the same query, and the Atlas data
 * model does not fit it anyway — "what does this cost you before it works"
 * and "where does the free version stop" are meaningless questions to ask of
 * a generative art toy.
 */

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug);

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category]),
);

/* Category groups drive the header mega-menu and the home-page grid, so the
   24 categories never render as one undifferentiated wall. */
export const CATEGORY_GROUPS = [
  {
    label: "Make & edit",
    slugs: [
      "files-and-formats",
      "pdf-and-documents",
      "images-and-photos",
      "video-and-audio",
      "design-and-color",
      "writing-and-text",
    ],
  },
  {
    label: "Build & analyse",
    slugs: [
      "ai-assistants",
      "developer-tools",
      "data-and-spreadsheets",
      "diagrams-and-whiteboards",
      "web-utilities",
    ],
  },
  {
    label: "Work & organise",
    slugs: [
      "productivity-and-notes",
      "collaboration-and-meetings",
      "file-sharing-and-transfer",
      "email-and-communication",
      "money-and-business",
      "career-and-hiring",
    ],
  },
  {
    label: "Learn & live",
    slugs: [
      "learning-and-reference",
      "reading-and-research",
      "privacy-and-security",
      "maps-and-travel",
      "health-and-life",
      "music-and-radio",
      "media-discovery",
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Use cases — the intent layer. Each is a route:
 * /altfatlas/use-case/<slug>. These are phrased as jobs, not nouns, because
 * that is how the query arrives.
 * ------------------------------------------------------------------ */
export const USE_CASES = [
  {
    slug: "convert-a-file",
    name: "Convert a file to another format",
    question: "How do I convert a file online for free?",
    answer:
      "Pick a converter that runs in your browser rather than uploading, check it supports your exact input and output pair, and confirm the output size limit before you start. Browser-side converters keep the file on your machine, which matters for anything with personal data in it.",
    tags: ["convert", "format"],
  },
  {
    slug: "compress-a-file",
    name: "Make a file smaller",
    question: "How do I compress a PDF, image or video without losing quality?",
    answer:
      "Compression is a trade, not a free win. For images, drop to WebP or AVIF before you touch quality sliders. For PDFs, downsampling embedded images usually gets you 80% of the saving. For video, changing the codec beats lowering the bitrate.",
    tags: ["compress", "optimise"],
  },
  {
    slug: "remove-a-background",
    name: "Remove or replace a background",
    question: "What is the best free background remover?",
    answer:
      "The on-device removers are now good enough for product shots and headshots, and they do not upload your photo. Hair and semi-transparent edges are still where free tools separate from paid ones — check those before committing to a batch.",
    tags: ["image", "cutout"],
  },
  {
    slug: "sign-a-document",
    name: "Sign or fill a document",
    question: "How can I sign a PDF online for free?",
    answer:
      "For a signature you just need to look right, a browser PDF editor is enough. For anything with legal weight, use a service that produces an audit trail with timestamps and signer identity — the difference matters if the document is ever contested.",
    tags: ["pdf", "signature"],
  },
  {
    slug: "record-my-screen",
    name: "Record my screen or a demo",
    question: "How do I record my screen without installing software?",
    answer:
      "Modern browsers expose screen capture directly, so a tab can record your screen, camera and microphone with no install. Check whether the tool writes the file locally or streams it to a server before recording anything confidential.",
    tags: ["record", "video"],
  },
  {
    slug: "transfer-a-big-file",
    name: "Send a file too big for email",
    question: "How do I send a large file to someone for free?",
    answer:
      "Under about 2 GB, an expiring-link service is simplest. Above that, a browser-to-browser transfer avoids the upload entirely but needs both people online at the same time. Encrypt anything sensitive before it leaves your machine, not after.",
    tags: ["transfer", "share"],
  },
  {
    slug: "make-a-diagram",
    name: "Draw a diagram or flowchart",
    question: "What is the best free online diagram tool?",
    answer:
      "For anything you will edit again, prefer a tool that saves to a file you own or to a text format you can version. Text-to-diagram tools are slower for the first draft and dramatically faster for the fifth.",
    tags: ["diagram", "visual"],
  },
  {
    slug: "transcribe-or-caption",
    name: "Transcribe audio or add captions",
    question: "How do I transcribe audio to text for free?",
    answer:
      "Free transcription is now accurate enough for notes and captions in clear audio. Accented speech, crosstalk and technical vocabulary are where it still fails, so budget time to correct rather than assuming a clean pass.",
    tags: ["audio", "captions"],
  },
  {
    slug: "check-a-link-is-safe",
    name: "Check whether a link or file is safe",
    question: "How do I check if a website or link is safe before clicking?",
    answer:
      "Expand the short URL first so you can see the real destination, then run the domain through a multi-engine reputation check. For a file, scan the hash rather than uploading the file itself when you can — a hash leaks nothing.",
    tags: ["security", "scam"],
  },
  {
    slug: "learn-something-free",
    name: "Learn a new skill for free",
    question: "Where can I learn a new skill online for free?",
    answer:
      "Practice-first sites beat lecture-first ones for anything you will do with your hands. Pick one with a visible syllabus and a way to check your work, and finish something small in the first session — completion rate is the only metric that matters.",
    tags: ["learning", "courses"],
  },
  {
    slug: "write-and-proofread",
    name: "Write and proofread faster",
    question: "What are the best free writing and grammar tools?",
    answer:
      "Separate the passes. Draft somewhere with nothing on the screen, then run a grammar and readability check, then a final read on a different device. Tools that try to do all three at once mostly interrupt the first one.",
    tags: ["writing", "grammar"],
  },
  {
    slug: "find-a-font-or-colour",
    name: "Find a font, colour or icon",
    question: "How do I identify a font or build a colour palette?",
    answer:
      "Font identifiers work from a clean, high-contrast crop of a few characters. For palettes, start from one colour you must keep and generate around it, then check every text pair against WCAG contrast before you fall in love with it.",
    tags: ["design", "colour"],
  },
  {
    slug: "read-without-clutter",
    name: "Read without ads and clutter",
    question: "How do I read an article without pop-ups and clutter?",
    answer:
      "A reader view strips the page to its text. If the page is gone or has changed, an archive snapshot usually still has it. Save to a read-later queue rather than leaving forty tabs open — the tabs are not a queue, they are a guilt pile.",
    tags: ["reading", "focus"],
  },
  {
    slug: "plan-a-trip",
    name: "Plan a trip or a route",
    question: "What are the best free trip planning websites?",
    answer:
      "Build the route first, then price it. Cycling and hiking routers understand terrain that car-first maps ignore, and a flight tracker tells you whether the inbound aircraft is already late long before the airline updates the board.",
    tags: ["travel", "maps"],
  },
  {
    slug: "focus-and-time-block",
    name: "Focus and block out time",
    question: "How do I stay focused while working online?",
    answer:
      "Make the block finite and visible. A timer you can see, a sound layer that masks the room, and one page in front of you beats any amount of intention. Track where the time actually went for a week before changing anything.",
    tags: ["focus", "time"],
  },
  {
    slug: "build-a-quick-page",
    name: "Put something on the web quickly",
    question: "How can I publish a page online for free?",
    answer:
      "For one page, a static host with drag-and-drop deployment is live in under a minute. Register the domain separately from the host so you can move later without a migration — the host is a commodity, the domain is not.",
    tags: ["web", "publish"],
  },
];

export const USE_CASE_SLUGS = USE_CASES.map((useCase) => useCase.slug);

export const USE_CASE_BY_SLUG = Object.fromEntries(
  USE_CASES.map((useCase) => [useCase.slug, useCase]),
);

/* ------------------------------------------------------------------ *
 * Collections — hand-picked stacks. Each is a route:
 * /altfatlas/collections/<slug>. Unlike categories these are opinionated and
 * capped, because the value of a shortlist is what it leaves out.
 * ------------------------------------------------------------------ */
export const COLLECTIONS = [
  {
    slug: "ten-tabs-instead-of-paid-software",
    name: "Ten tabs instead of paid software",
    tagline:
      "The browser replacements for the subscriptions most people never use in full.",
    intro:
      "Every entry here does the 90% of a paid product that most people actually touch. None of them replace the professional tool at the top end, and each one says where it stops.",
  },
  {
    slug: "nothing-leaves-your-device",
    name: "Nothing leaves your device",
    tagline: "Tools that process files in the browser, with no upload at all.",
    intro:
      "The strongest privacy guarantee a web tool can offer is that the file never travels. These run entirely in the page — you can load them, disconnect from the network, and they still work.",
  },
  {
    slug: "student-starter-stack",
    name: "The student starter stack",
    tagline: "Research, write, cite, submit — without buying anything.",
    intro:
      "Assembled around the actual sequence of a piece of coursework rather than around software categories: find sources, read them properly, write, check, format, hand in.",
  },
  {
    slug: "freelancer-day-one",
    name: "Freelancer, day one",
    tagline: "The admin layer you need before the first invoice goes out.",
    intro:
      "Contracts, invoices, signatures, time tracking and a way to get paid. Deliberately boring, because the interesting part is the work and this is the part that stops it happening.",
  },
  {
    slug: "privacy-first-toolkit",
    name: "The privacy-first toolkit",
    tagline: "Reduce what you leak, on purpose, in an afternoon.",
    intro:
      "A sequence rather than a pile: find out what is already exposed, close the biggest holes, then set up the habits — aliases, generated passwords, scrubbed metadata — that stop it re-accumulating.",
  },
  {
    slug: "job-hunt-kit",
    name: "The job hunt kit",
    tagline: "CV, portfolio, applications and interview prep in one pass.",
    intro:
      "Ordered by what unblocks the next step. A CV that parses cleanly beats a beautiful one, so the formatting tools come before the design ones.",
  },
  {
    slug: "creator-starter-pack",
    name: "The creator starter pack",
    tagline: "Shoot, cut, caption, thumbnail, publish.",
    intro:
      "The full pipeline for someone making video or audio on their own, chosen so that no step forces an upgrade before the next step is even possible.",
  },
  {
    slug: "small-business-back-office",
    name: "Small business back office",
    tagline: "The unglamorous systems that keep a small company running.",
    intro:
      "Quotes, invoices, receipts, scheduling, simple forms and light CRM. Sized for a business with no operations person, because that is most of them.",
  },
  {
    slug: "developer-second-monitor",
    name: "What lives on the second monitor",
    tagline: "The tabs a working developer never closes.",
    intro:
      "Not frameworks or IDEs — the small workbenches you reach for a dozen times a day and would notice immediately if they disappeared.",
  },
  {
    slug: "classics-that-survived",
    name: "The classics that survived",
    tagline:
      "Entries from the original useful-website lists that are still standing.",
    intro:
      "The viral lists of the late 2000s recommended a few hundred sites. Most are gone. These are the ones that are still live, still free, and still the best answer to the question they were listed for.",
  },
];

export const COLLECTION_SLUGS = COLLECTIONS.map(
  (collection) => collection.slug,
);

export const COLLECTION_BY_SLUG = Object.fromEntries(
  COLLECTIONS.map((collection) => [collection.slug, collection]),
);
