/*
 * AltF Persona — taxonomy
 *
 * Every vocabulary the product generates pages, filters, prompts and copy
 * from. A new niche or platform is a one-line change here rather than an edit
 * across a dozen routes.
 *
 * Two rules, inherited from Atlas and worth restating:
 *   1. Every term carries its own copy. A page with a generated H1 and no
 *      prose is a doorway page.
 *   2. Nothing in here is decorative. If a vocabulary does not change what the
 *      engine emits or what the reader must do, it does not belong.
 */

/* ------------------------------------------------------------------ *
 * Production route — what a persona costs you BEFORE the face is
 * reproducible. This is the spine of the whole product, the way `access`
 * is the spine of Atlas.
 * ------------------------------------------------------------------ */
export const PRODUCTION_ROUTES = [
  {
    id: "prompt-only",
    label: "Prompt only",
    short: "Text alone",
    tone: "success",
    blurb:
      "The locked line plus a fixed seed is enough. No uploads, no training, nothing to maintain.",
    detail:
      "Works when the face is built from features a sentence can pin down — a strong jaw, a gap in the front teeth, one grey streak. Drift shows up first in the eyes and the hairline, and it shows up worst at three-quarter angles.",
    setupMinutes: 0,
    reliability: 2,
    needs: ["A generator that honours a seed", "The locked line, verbatim"],
  },
  {
    id: "reference",
    label: "Reference frame",
    short: "One image",
    tone: "info",
    blurb:
      "You keep one approved frame and feed it back into every generation as a character reference.",
    detail:
      "The middle route and the one most people should start on. Generate until one frame is unmistakably the person, then that frame becomes the source of truth — Midjourney takes it as --cref, Flux and SDXL take it through IP-Adapter, most video models take it as the first frame.",
    setupMinutes: 45,
    reliability: 4,
    needs: [
      "One frame you are willing to be stuck with",
      "A generator with character-reference or IP-Adapter support",
    ],
  },
  {
    id: "trained",
    label: "Trained model",
    short: "LoRA",
    tone: "brand",
    blurb:
      "12–20 approved frames trained into a LoRA. The face then survives angles, lighting and motion that break the other two routes.",
    detail:
      "The only route that holds up for video and for anything shot from behind, in profile, or in bad light. It costs a training run and a storage decision, and it locks you to the model family you trained on — a LoRA built for one base model is not portable to another.",
    setupMinutes: 180,
    reliability: 5,
    needs: [
      "12–20 varied frames of the same face",
      "A training run on the base model you intend to keep using",
      "Somewhere to store and version the weights",
    ],
  },
];

export const ROUTE_IDS = PRODUCTION_ROUTES.map((route) => route.id);
export const ROUTE_BY_ID = Object.fromEntries(
  PRODUCTION_ROUTES.map((route) => [route.id, route]),
);

/* ------------------------------------------------------------------ *
 * Niches — the content vertical. Drives the pillar defaults, the shot
 * pairings, the rate card multiplier and the wardrobe suggestions.
 * ------------------------------------------------------------------ */
export const NICHES = [
  {
    slug: "beauty",
    label: "Beauty & skincare",
    blurb: "Routines, ingredient explainers, before-and-after, shade matching.",
    intro:
      "The most saturated niche on every platform and the one where face consistency matters most — a skincare account whose face changes between the before and the after has no product left to sell. Expect high brand demand, high scrutiny, and the strictest disclosure rules of any vertical.",
    pillars: ["teach", "prove", "review", "myth-bust", "routine"],
    props: ["a serum bottle", "a jade roller", "a cotton pad", "a ring light"],
    settings: ["bathroom counter", "vanity with warm bulbs", "bright bedroom"],
  },
  {
    slug: "fitness",
    label: "Fitness & training",
    blurb: "Programming, form checks, progress arcs, gym-floor content.",
    intro:
      "Fitness is the hardest niche for an AI persona to survive, because the audience is trained to read bodies and the content genre is literally proof-of-change over time. It works when the persona teaches rather than demonstrates, and it falls apart the moment it claims a transformation it did not have.",
    pillars: ["teach", "prove", "myth-bust", "day-in-life", "compare"],
    props: ["a kettlebell", "a shaker bottle", "a resistance band", "chalk"],
    settings: ["a squat rack", "an empty studio floor", "an outdoor track"],
  },
  {
    slug: "fashion",
    label: "Fashion & styling",
    blurb: "Fit checks, capsule wardrobes, styling rules, lookbooks.",
    intro:
      "The niche AI personas are genuinely good at, because the subject of the shot is the garment and the face is the frame around it. Virtual try-on is a real workflow here rather than a demo, and the consistency problem shifts from the face to the body proportions.",
    pillars: ["review", "compare", "teach", "trend", "haul"],
    props: ["a shopping tote", "a garment rack", "a full-length mirror"],
    settings: ["a city street", "a boutique fitting room", "a bare white wall"],
  },
  {
    slug: "food",
    label: "Food & cooking",
    blurb: "Recipes, one-pan formats, restaurant finds, pantry science.",
    intro:
      "Hands and food beat faces here — the persona is the voice and the two hands in frame, and most of the content does not need the face at all. That makes it the cheapest niche to run on the prompt-only route, and the one where a shaky face model does least damage.",
    pillars: ["teach", "review", "list", "behind-the-scenes", "story"],
    props: ["a chef's knife", "a wooden board", "a cast-iron pan"],
    settings: ["a kitchen counter", "a market stall", "a small restaurant"],
  },
  {
    slug: "travel",
    label: "Travel & places",
    blurb: "Itineraries, cost breakdowns, neighbourhood guides, transit hacks.",
    intro:
      "Travel is where an AI persona is most likely to get caught, because the audience can check whether that hotel lobby exists. It works as a research-and-planning account — costs, routes, what to skip — and fails as a look-where-I-am account.",
    pillars: ["teach", "list", "compare", "story", "day-in-life"],
    props: ["a carry-on", "a paper map", "a train ticket"],
    settings: ["an old-town street", "an airport gate", "a rooftop at dusk"],
  },
  {
    slug: "tech",
    label: "Tech & gadgets",
    blurb: "Setups, spec explainers, hands-on impressions, buying advice.",
    intro:
      "The audience most likely to spot a generated face and least likely to forgive one that is not declared. Lead with the disclosure, keep the persona as an explainer rather than a reviewer with a product in hand, and the niche works well.",
    pillars: ["teach", "compare", "review", "list", "myth-bust"],
    props: ["a laptop", "a mechanical keyboard", "a camera body"],
    settings: ["a desk setup", "a plain studio", "a workshop bench"],
  },
  {
    slug: "gaming",
    label: "Gaming",
    blurb: "Builds, patch reactions, guides, ranked climbs.",
    intro:
      "The one audience that has been comfortable with invented on-screen identities for twenty years, which makes it the softest landing for a declared AI persona. Face time is low, overlay time is high, and the voice matters more than the render.",
    pillars: ["react", "teach", "list", "story", "trend"],
    props: ["a controller", "a headset", "an energy drink"],
    settings: ["a lit battlestation", "a dark room with a monitor glow"],
  },
  {
    slug: "money",
    label: "Money & business",
    blurb: "Budgeting, tax basics, side-income maths, small-business ops.",
    intro:
      "The highest-paying niche and the most heavily regulated. A persona here must never present as a licensed adviser, and in several of the markets on this site financial promotions carry their own approval rules on top of the AI-disclosure ones. Teach method, never recommend a security.",
    pillars: ["teach", "compare", "myth-bust", "list", "story"],
    props: ["a notebook", "a calculator", "a coffee cup"],
    settings: ["a small office", "a cafe table", "a plain backdrop"],
  },
  {
    slug: "home",
    label: "Home & interiors",
    blurb: "Small-space fixes, rentals, before-and-after, sourcing.",
    intro:
      "The room is the subject, not the person, so the persona appears in maybe one frame in four. Strong brand demand from furniture and paint, and a genre where AI-generated rooms have already normalised — which cuts both ways for trust.",
    pillars: ["teach", "prove", "list", "behind-the-scenes", "compare"],
    props: ["a paint swatch", "a tape measure", "a woven basket"],
    settings: ["a half-finished room", "a rented flat", "a balcony"],
  },
  {
    slug: "wellness",
    label: "Wellness & mind",
    blurb: "Sleep, focus, habits, breathwork, burnout recovery.",
    intro:
      "Enormous reach and the sharpest ethical edge on the list: a synthetic person giving mental-health advice to a real one. Keep the persona to habit mechanics and away from anything that reads as therapy, and put the disclosure in the bio rather than the caption.",
    pillars: ["teach", "story", "myth-bust", "routine", "q-and-a"],
    props: ["a journal", "a mug", "a yoga mat"],
    settings: ["a morning bedroom", "a quiet park", "a still living room"],
  },
  {
    slug: "parenting",
    label: "Parenting & family",
    blurb: "Routines, gear that lasts, school-run logistics, sanity saving.",
    intro:
      "High trust, high scrutiny, and the one niche where an undeclared AI persona reads as genuinely predatory rather than merely sloppy. Never render a child. Keep the persona's own family off-screen and talk about method.",
    pillars: ["teach", "list", "story", "review", "q-and-a"],
    props: ["a nappy bag", "a lunchbox", "a stroller handle"],
    settings: ["a hallway at 7am", "a school gate", "a cluttered kitchen"],
  },
  {
    slug: "auto",
    label: "Cars & motoring",
    blurb: "Ownership costs, buying traps, detailing, first-drive impressions.",
    intro:
      "Machinery photographs better than people and the audience wants the car in frame, so face time is low. Watch the badge: rendering a recognisable marque's logo onto a car that manufacturer never made is where this niche gets its takedowns.",
    pillars: ["review", "compare", "teach", "list", "myth-bust"],
    props: ["a key fob", "a microfibre cloth", "a service book"],
    settings: ["an empty car park at dawn", "a garage", "a mountain road"],
  },
  {
    slug: "pets",
    label: "Pets & animals",
    blurb: "Training, vet-adjacent basics, gear, adoption stories.",
    intro:
      "The animal carries every frame and the persona is a voice with a leash in hand. Consistency demands drop to almost nothing — which makes it the single easiest niche to run well on the cheapest production route.",
    pillars: ["teach", "story", "review", "list", "q-and-a"],
    props: ["a lead", "a treat pouch", "a grooming brush"],
    settings: ["a park in the morning", "a vet waiting room", "a sofa"],
  },
  {
    slug: "study",
    label: "Study & careers",
    blurb: "Exam method, applications, portfolios, first-job navigation.",
    intro:
      "A young audience, a huge one, and a genre built almost entirely on screen recordings and desk shots. The persona's credibility comes from the method being right, so the writing carries far more weight here than the render.",
    pillars: ["teach", "list", "story", "compare", "q-and-a"],
    props: ["a highlighter", "a stack of notes", "a timer"],
    settings: ["a library desk", "a dorm room", "a campus bench"],
  },
  {
    slug: "craft",
    label: "Craft & making",
    blurb: "Process videos, materials, patterns, small-batch selling.",
    intro:
      "Process is the content and hands are the star. An AI persona in this niche should show the making rather than the maker, and should be honest that the finished object is rendered — an audience that makes things will spot an impossible seam immediately.",
    pillars: ["behind-the-scenes", "teach", "story", "list", "prove"],
    props: ["a glue gun", "a sketchbook", "a pair of shears"],
    settings: ["a workbench", "a studio corner", "a market stall"],
  },
  {
    slug: "sustainability",
    label: "Sustainability",
    blurb: "Repair, second-hand, energy bills, the maths behind the claims.",
    intro:
      "An audience with a finely tuned detector for greenwashing, pointed at a synthetic person selling sustainability. It only works with the disclosure loud and the numbers checkable, and it works surprisingly well when it is.",
    pillars: ["teach", "myth-bust", "compare", "prove", "list"],
    props: ["a repair kit", "a reusable bottle", "an energy monitor"],
    settings: ["a repair cafe", "a charity shop", "a kitchen bin area"],
  },
];

export const NICHE_SLUGS = NICHES.map((niche) => niche.slug);
export const NICHE_BY_SLUG = Object.fromEntries(
  NICHES.map((niche) => [niche.slug, niche]),
);

/* ------------------------------------------------------------------ *
 * Platforms — drive aspect ratio, run length, disclosure label and the
 * shape of the 30-day plan.
 * ------------------------------------------------------------------ */
export const PLATFORMS = [
  {
    id: "instagram",
    label: "Instagram",
    surface: "Reels + carousel",
    aspect: "9:16",
    stillAspect: "4:5",
    runSeconds: [7, 30],
    cadencePerWeek: 5,
    captionChars: 2200,
    hookSeconds: 2,
    labelName: "AI-generated content label",
    labelNote:
      "Meta applies an 'AI info' label from the file's provenance metadata, and expects you to disclose photoreal synthetic media yourself when it is missing.",
  },
  {
    id: "tiktok",
    label: "TikTok",
    surface: "Short video",
    aspect: "9:16",
    stillAspect: "9:16",
    runSeconds: [9, 60],
    cadencePerWeek: 7,
    captionChars: 2200,
    hookSeconds: 1,
    labelName: "AI-generated content toggle",
    labelNote:
      "TikTok requires realistic AI content to carry the AI-generated label, and auto-applies it when it reads content credentials in the upload.",
  },
  {
    id: "youtube-shorts",
    label: "YouTube Shorts",
    surface: "Short video",
    aspect: "9:16",
    stillAspect: "9:16",
    runSeconds: [15, 60],
    cadencePerWeek: 5,
    captionChars: 1000,
    hookSeconds: 2,
    labelName: "Altered or synthetic content disclosure",
    labelNote:
      "YouTube's upload flow asks whether the content is altered or synthetic; answering yes adds a description label, and a more prominent one on sensitive topics.",
  },
  {
    id: "youtube",
    label: "YouTube (long)",
    surface: "Long video",
    aspect: "16:9",
    stillAspect: "16:9",
    runSeconds: [180, 900],
    cadencePerWeek: 1,
    captionChars: 5000,
    hookSeconds: 8,
    labelName: "Altered or synthetic content disclosure",
    labelNote:
      "Same disclosure control as Shorts. On a long video the spoken disclosure in the first fifteen seconds does more for trust than the metadata flag.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    surface: "Post + document",
    aspect: "1:1",
    stillAspect: "1:1",
    runSeconds: [30, 120],
    cadencePerWeek: 3,
    captionChars: 3000,
    hookSeconds: 3,
    labelName: "C2PA provenance badge",
    labelNote:
      "LinkedIn surfaces content credentials where the file carries them. There is no manual toggle, so the disclosure has to be in the post text.",
  },
  {
    id: "x",
    label: "X",
    surface: "Post + video",
    aspect: "16:9",
    stillAspect: "16:9",
    runSeconds: [15, 140],
    cadencePerWeek: 10,
    captionChars: 280,
    hookSeconds: 1,
    labelName: "Community note risk",
    labelNote:
      "No first-party AI label to rely on. Undeclared synthetic media here gets annotated by readers rather than by the platform, which is worse.",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    surface: "Pin + idea pin",
    aspect: "2:3",
    stillAspect: "2:3",
    runSeconds: [15, 60],
    cadencePerWeek: 7,
    captionChars: 500,
    hookSeconds: 0,
    labelName: "Generated-AI label",
    labelNote:
      "Pinterest reads image metadata and labels generated pins, and lets people see fewer of them. Strip the metadata and you are gaming a filter people chose.",
  },
  {
    id: "threads",
    label: "Threads",
    surface: "Post",
    aspect: "1:1",
    stillAspect: "4:5",
    runSeconds: [10, 60],
    cadencePerWeek: 7,
    captionChars: 500,
    hookSeconds: 1,
    labelName: "AI info label",
    labelNote:
      "Shares Meta's provenance labelling with Instagram. Text-led surface, so the persona's voice carries more of the load than the render does.",
  },
];

export const PLATFORM_IDS = PLATFORMS.map((platform) => platform.id);
export const PLATFORM_BY_ID = Object.fromEntries(
  PLATFORMS.map((platform) => [platform.id, platform]),
);

/* ------------------------------------------------------------------ *
 * Markets — the disclosure regime. This is a
 * plain-language summary of published rules, not legal advice, and every
 * page that renders it says so.
 * ------------------------------------------------------------------ */
export const MARKETS = [
  {
    id: "us",
    label: "United States",
    currency: "USD",
    symbol: "$",
    regulator: "FTC",
    rule: "Endorsement Guides + the rule on fake reviews and testimonials",
    summary:
      "The FTC's endorsement rules were revised in 2023 to cover reviews and testimonials that are not from a real person, and the 2024 rule on fake reviews makes AI-generated testimonials from a non-existent reviewer explicitly actionable. A material connection to a brand must be disclosed clearly and conspicuously in the post itself, not only in a bio.",
    mustDo: [
      "Say the persona is AI-generated where the audience will actually see it",
      "Disclose any brand relationship in the post, unavoidably, not just in a bio link",
      "Never present the persona's experience of a product as a real customer testimonial",
    ],
  },
  {
    id: "eu",
    label: "European Union",
    currency: "EUR",
    symbol: "€",
    regulator: "EU AI Act + national consumer law",
    rule: "AI Act Article 50 transparency obligations",
    summary:
      "Article 50 requires that synthetic image, audio and video content be marked in a machine-readable way and that deep-fake content be disclosed to the people who see it. The transparency obligations apply from August 2026. On top of that, national unfair-commercial-practice law treats an undisclosed paid endorsement as a misleading practice.",
    mustDo: [
      "Keep the machine-readable provenance metadata intact on export",
      "Disclose visibly that the depicted person is AI-generated",
      "Mark paid partnerships with the platform's own paid-partnership control",
    ],
  },
  {
    id: "uk",
    label: "United Kingdom",
    currency: "GBP",
    symbol: "£",
    regulator: "ASA / CMA",
    rule: "CAP Code + Digital Markets, Competition and Consumers Act",
    summary:
      "The ASA has ruled repeatedly that an ad must be obviously identifiable as an ad before a reader engages with it, and #ad at the front of the caption remains the standard it accepts. The CMA gained direct enforcement powers over hidden advertising under the DMCC Act, which raises the cost of getting this wrong.",
    mustDo: [
      "Put #ad at the start of the caption, not in a hashtag block at the end",
      "State that the creator is a synthetic persona in the profile and in the post",
      "Hold evidence for any objective claim the persona makes",
    ],
  },
  {
    id: "in",
    label: "India",
    currency: "INR",
    symbol: "₹",
    regulator: "ASCI / MeitY",
    rule: "ASCI influencer guidelines + IT Rules synthetic-media amendments",
    summary:
      "ASCI's guidelines require a prominent disclosure label — advertisement, ad, sponsored or collaboration — placed so it cannot be missed, in the same language as the post. India has also moved to require clear labelling of synthetically generated information on significant social media intermediaries, so the AI disclosure and the ad disclosure are two separate obligations.",
    mustDo: [
      "Use one of ASCI's accepted disclosure words, in the post's own language",
      "Place it in the first two lines, or as a video overlay that stays on screen",
      "Label the content as synthetically generated in addition to the ad label",
    ],
  },
  {
    id: "ae",
    label: "UAE",
    currency: "AED",
    symbol: "AED ",
    regulator: "UAE Media Council",
    rule: "Media activity licensing",
    summary:
      "Paid influencer activity in the UAE requires a media licence, and that requirement attaches to the account operator rather than to the persona. An AI persona does not remove the licensing question — it moves it onto whoever runs the account.",
    mustDo: [
      "Hold the applicable media licence before running paid content",
      "Disclose the commercial relationship in the post",
      "Disclose the synthetic nature of the persona in the profile",
    ],
  },
  {
    id: "au",
    label: "Australia",
    currency: "AUD",
    symbol: "A$",
    regulator: "ACCC / AANA",
    rule: "AANA Code of Ethics section 2.7",
    summary:
      "Advertising must be clearly distinguishable as advertising to the average member of the audience. The ACCC has run dedicated sweeps of influencer accounts for undisclosed ads, and it treats a misleading impression created by omission the same as a false statement.",
    mustDo: [
      "Make the ad obvious before the audience engages, not after",
      "Disclose the persona is AI-generated in profile and post",
      "Substantiate comparative claims",
    ],
  },
  {
    id: "br",
    label: "Brazil",
    currency: "BRL",
    symbol: "R$",
    regulator: "CONAR",
    rule: "CONAR advertising code + influencer guide",
    summary:
      "CONAR's guide for influencer advertising requires disclosure that a reasonable person would notice at a glance, in Portuguese, and holds the advertiser and the creator jointly responsible for the content of the claim.",
    mustDo: [
      "Disclose in Portuguese, in the visible part of the caption",
      "Name the synthetic nature of the persona in the profile bio",
      "Keep substantiation for product claims on file with the advertiser",
    ],
  },
  {
    id: "global",
    label: "Global / mixed",
    currency: "USD",
    symbol: "$",
    regulator: "Strictest-rule-wins",
    rule: "Apply the most demanding market you post into",
    summary:
      "An account with an audience spread across markets is subject to all of them at once, and the practical answer is to run the strictest combination: a visible AI disclosure in the profile, an ad label at the front of every commercial caption, and provenance metadata left intact on every file.",
    mustDo: [
      "Run the strictest rule of any market in your top five audience countries",
      "Keep one disclosure wording across every platform so it reads as policy",
      "Never strip content credentials to dodge a platform label",
    ],
  },
];

export const MARKET_IDS = MARKETS.map((market) => market.id);
export const MARKET_BY_ID = Object.fromEntries(
  MARKETS.map((market) => [market.id, market]),
);

/* ------------------------------------------------------------------ *
 * Archetypes — the behavioural template. Sets the voice defaults, the
 * pillar weighting and the opening line of the bio.
 * ------------------------------------------------------------------ */
export const ARCHETYPES = [
  {
    id: "the-explainer",
    label: "The Explainer",
    blurb: "Takes one confusing thing and makes it obvious in forty seconds.",
    voice: "calm, precise, allergic to hype",
    opener: "Here is the part nobody explains properly:",
    pillars: ["teach", "myth-bust", "compare"],
    strength: "Trust compounds. The slowest to grow and the hardest to churn.",
  },
  {
    id: "the-insider",
    label: "The Insider",
    blurb: "Knows how the industry actually works and says it out loud.",
    voice: "dry, specific, a little conspiratorial",
    opener: "Nobody in this industry will tell you this, so:",
    pillars: ["myth-bust", "behind-the-scenes", "story"],
    strength: "Extremely shareable. Needs real domain detail or it reads hollow.",
  },
  {
    id: "the-builder",
    label: "The Builder",
    blurb: "Documents the thing being made, in public, including the failures.",
    voice: "plain, progress-driven, unpolished on purpose",
    opener: "Day 14 of building this in public:",
    pillars: ["behind-the-scenes", "prove", "story"],
    strength: "The arc IS the retention. Weak on any single post, strong over eight.",
  },
  {
    id: "the-curator",
    label: "The Curator",
    blurb: "Finds the five good ones so the audience does not open forty tabs.",
    voice: "confident, edited down, no filler",
    opener: "I went through 40 of these. Five are worth it:",
    pillars: ["list", "review", "compare"],
    strength: "Highest save rate of any archetype. Lowest personal attachment.",
  },
  {
    id: "the-coach",
    label: "The Coach",
    blurb: "Gives you the next single action, not the whole philosophy.",
    voice: "direct, warm, second person",
    opener: "If you only change one thing this week, change this:",
    pillars: ["teach", "routine", "q-and-a"],
    strength: "Converts to products best. Needs a real method or it is noise.",
  },
  {
    id: "the-analyst",
    label: "The Analyst",
    blurb: "Brings the numbers and lets them be unflattering.",
    voice: "measured, sourced, comfortable with 'it depends'",
    opener: "I ran the numbers and they are worse than people say:",
    pillars: ["compare", "prove", "myth-bust"],
    strength: "Earns citations and screenshots. Slow, defensible growth.",
  },
  {
    id: "the-aesthete",
    label: "The Aesthete",
    blurb: "The frame is the argument. Composition first, words second.",
    voice: "spare, sensory, almost no explanation",
    opener: "",
    pillars: ["trend", "behind-the-scenes", "routine"],
    strength: "Best fit for a generated persona — the genre is already stylised.",
  },
  {
    id: "the-contrarian",
    label: "The Contrarian",
    blurb: "Takes the consensus position apart, then offers a better one.",
    voice: "sharp, argumentative, never sneering",
    opener: "Everyone is wrong about this and I can show you why:",
    pillars: ["myth-bust", "compare", "react"],
    strength: "Fastest reach, highest risk. One bad take costs a year of trust.",
  },
  {
    id: "the-companion",
    label: "The Companion",
    blurb: "Not teaching anything. Just good company at 11pm.",
    voice: "unhurried, first person, small details",
    opener: "Slow evening. Making the good soup again.",
    pillars: ["day-in-life", "story", "routine"],
    strength: "Deepest parasocial bond, which is exactly why disclosure matters most here.",
  },
  {
    id: "the-tester",
    label: "The Tester",
    blurb: "Puts the claim under a stopwatch and reports what happened.",
    voice: "deadpan, methodical, protocol-first",
    opener: "Tested this for 30 days. Here is what actually happened:",
    pillars: ["prove", "review", "compare"],
    strength: "High authority. Hard for an AI persona to run honestly — see the guides.",
  },
];

export const ARCHETYPE_IDS = ARCHETYPES.map((archetype) => archetype.id);
export const ARCHETYPE_BY_ID = Object.fromEntries(
  ARCHETYPES.map((archetype) => [archetype.id, archetype]),
);

/* ------------------------------------------------------------------ *
 * Content pillars — the repeating post shapes the 30-day plan is built
 * from. `weight` is the default share of a month when a pillar is in play.
 * ------------------------------------------------------------------ */
export const PILLARS = [
  {
    id: "teach",
    label: "Teach one thing",
    blurb: "A single mechanism, explained end to end, with nothing left implied.",
    shotBias: "talking",
    weight: 3,
  },
  {
    id: "prove",
    label: "Show the proof",
    blurb: "The result first, then the method that produced it.",
    shotBias: "demo",
    weight: 2,
  },
  {
    id: "review",
    label: "Review something",
    blurb: "One product, one verdict, one named reason not to buy it.",
    shotBias: "product",
    weight: 2,
  },
  {
    id: "compare",
    label: "Compare two options",
    blurb: "A and B on the same axis, with a stated winner and the case where it flips.",
    shotBias: "product",
    weight: 2,
  },
  {
    id: "myth-bust",
    label: "Break a myth",
    blurb: "The thing everyone repeats, and the reason it is wrong.",
    shotBias: "talking",
    weight: 2,
  },
  {
    id: "list",
    label: "Make a list",
    blurb: "Five items, ranked, with the fifth being the one nobody expects.",
    shotBias: "flatlay",
    weight: 2,
  },
  {
    id: "story",
    label: "Tell a story",
    blurb: "A concrete scene with a turn in it, ending on the lesson not the moral.",
    shotBias: "lifestyle",
    weight: 1,
  },
  {
    id: "react",
    label: "React to something",
    blurb: "A live take on a thing the audience already saw this week.",
    shotBias: "talking",
    weight: 1,
  },
  {
    id: "behind-the-scenes",
    label: "Behind the scenes",
    blurb: "The messy middle of the work, deliberately unpolished.",
    shotBias: "lifestyle",
    weight: 1,
  },
  {
    id: "day-in-life",
    label: "A day in the life",
    blurb: "Structure and texture rather than events. Ambient, not narrative.",
    shotBias: "lifestyle",
    weight: 1,
  },
  {
    id: "routine",
    label: "The routine",
    blurb: "The same sequence every time, so the audience can run it themselves.",
    shotBias: "demo",
    weight: 1,
  },
  {
    id: "q-and-a",
    label: "Answer a question",
    blurb: "One real question from the comments, answered properly.",
    shotBias: "talking",
    weight: 1,
  },
  {
    id: "trend",
    label: "Take the trend",
    blurb: "The current format, bent to say something only this persona would say.",
    shotBias: "motion",
    weight: 1,
  },
  {
    id: "haul",
    label: "The haul",
    blurb: "Several things at once, sorted into keep and return.",
    shotBias: "product",
    weight: 1,
  },
];

export const PILLAR_IDS = PILLARS.map((pillar) => pillar.id);
export const PILLAR_BY_ID = Object.fromEntries(
  PILLARS.map((pillar) => [pillar.id, pillar]),
);

/* ------------------------------------------------------------------ *
 * Shot categories — how the shot library is grouped, and what each group
 * demands of the production route.
 * ------------------------------------------------------------------ */
export const SHOT_CATEGORIES = [
  {
    slug: "portrait",
    label: "Portrait",
    blurb: "Face-forward frames where the identity is the whole subject.",
    intro:
      "The frames that build recognition, and the ones that break first. Everything in this group should be generated on your strongest production route, because a portrait that is half a face off is not a near miss — it is a different person.",
    minRoute: "reference",
  },
  {
    slug: "talking",
    label: "Talking head",
    blurb: "Speaking to camera, the workhorse frame of every short-form account.",
    intro:
      "Sixty per cent of a short-form account is one person talking at a fixed distance. Get the eyeline, the framing and the room right once and the rest of the month becomes a copy of it.",
    minRoute: "reference",
  },
  {
    slug: "lifestyle",
    label: "Lifestyle",
    blurb: "The persona inside a scene, at middle distance, doing something.",
    intro:
      "Middle distance forgives a lot. The face occupies fewer pixels, the environment carries the meaning, and the prompt-only route often survives here when it would fail on a portrait.",
    minRoute: "prompt-only",
  },
  {
    slug: "product",
    label: "Product in hand",
    blurb: "The thing being sold, held, at the distance a buyer would hold it.",
    intro:
      "Where brand money lands. Hands and packaging are the two hardest things for image models to keep honest, so this group is worth more attention per frame than any other.",
    minRoute: "reference",
  },
  {
    slug: "demo",
    label: "Demonstration",
    blurb: "Hands doing the step, face out of frame or barely in it.",
    intro:
      "The cheapest useful frames in the library. No face means no consistency problem, which is why food, craft and tech accounts can run on the prompt-only route almost indefinitely.",
    minRoute: "prompt-only",
  },
  {
    slug: "flatlay",
    label: "Flat lay",
    blurb: "Objects arranged from directly above, no person at all.",
    intro:
      "Zero identity load, high save rate, and the format that makes a list post work as a still. Every account should have twenty of these banked.",
    minRoute: "prompt-only",
  },
  {
    slug: "ugc",
    label: "UGC / selfie",
    blurb: "Deliberately imperfect, phone-in-hand, at arm's length.",
    intro:
      "The register brands pay most for and the hardest to fake convincingly, because the tells are exactly the imperfections a model has been trained to remove. Ask for the flaws explicitly.",
    minRoute: "trained",
  },
  {
    slug: "motion",
    label: "Motion",
    blurb: "Video frames — walking, turning, gesturing, a camera move.",
    intro:
      "Motion is where prompt-only personas die. A model interpolating between frames will re-imagine a face it was never confident about, so this group assumes a trained route or a locked first frame.",
    minRoute: "trained",
  },
  {
    slug: "street",
    label: "Street & environment",
    blurb: "Wide frames where the location does the talking.",
    intro:
      "Location shots are the most falsifiable content an AI persona can post — someone who lives there will check. Use them for mood, not for claims about being somewhere.",
    minRoute: "prompt-only",
  },
  {
    slug: "studio",
    label: "Studio",
    blurb: "Controlled light, clean backdrop, catalogue register.",
    intro:
      "The most reproducible group in the library, because you have removed every variable except the face. Start a new persona here to find out how well it holds before spending anything on training.",
    minRoute: "prompt-only",
  },
];

export const SHOT_CATEGORY_SLUGS = SHOT_CATEGORIES.map((cat) => cat.slug);
export const SHOT_CATEGORY_BY_SLUG = Object.fromEntries(
  SHOT_CATEGORIES.map((cat) => [cat.slug, cat]),
);

/* ------------------------------------------------------------------ *
 * Generators — the models a prompt kit is emitted for. `syntax` is the
 * template compose.js fills; `consistency` is the mechanism that actually
 * holds a face on that model, which is the only reason this table exists.
 * ------------------------------------------------------------------ */
export const MODELS = [
  {
    slug: "midjourney",
    name: "Midjourney",
    vendor: "Midjourney",
    kind: "image",
    label: "Midjourney",
    consistency: "Character reference (--cref) plus a pinned --seed",
    mechanism:
      "Pass an approved frame as --cref and dial --cw to control how much of it carries over: 100 keeps face, hair and clothing, 0 keeps the face only. Pin --seed so re-runs of the same prompt land in the same place.",
    syntax:
      "{prompt} --ar {aspect} --style raw --seed {seed} --cref {referenceUrl} --cw 100",
    strengths: [
      "Best-looking skin and light of any general image model",
      "--cw gives you a dial between 'same face' and 'same outfit'",
    ],
    limits:
      "No LoRA training, so the trained route is closed here — your ceiling is the reference route. Output lives in their gallery unless you are on a plan that changes that.",
    routes: ["prompt-only", "reference"],
    order: 1,
  },
  {
    slug: "flux",
    name: "Flux",
    vendor: "Black Forest Labs",
    kind: "image",
    label: "Flux",
    consistency: "LoRA on the base model, or an in-context edit from a reference",
    mechanism:
      "The strongest route: train a LoRA from 12–20 approved frames and invoke it by trigger word in every prompt. For a lighter setup, an in-context editing model takes a reference image plus an instruction and keeps the subject across edits.",
    syntax: "{prompt}\n\nnegative: {negative}\nseed: {seed} | guidance: 3.5 | steps: 28",
    strengths: [
      "Handles typography and hands better than most open models",
      "Open weights mean the trained route is genuinely available to you",
    ],
    limits:
      "A LoRA is bound to the base model it was trained on. Change base model and you retrain, which is the real switching cost of this route.",
    routes: ["prompt-only", "reference", "trained"],
    order: 2,
  },
  {
    slug: "seedream",
    name: "Seedream",
    vendor: "ByteDance",
    kind: "image",
    label: "Seedream",
    consistency: "Reference image conditioning with an explicit subject lock",
    mechanism:
      "Give it the reference frame and describe only what changes. It holds a subject across a set better than most when the instruction is phrased as an edit rather than as a new scene.",
    syntax: "{prompt}\n\nKeep identical: {lockedLine}\nChange only: {variable}",
    strengths: [
      "Strong at holding a subject across a batch",
      "Good text rendering for on-image captions",
    ],
    limits:
      "Prompt phrasing matters more here than elsewhere — a scene description will re-roll the face where an edit instruction would have kept it.",
    routes: ["prompt-only", "reference"],
    order: 3,
  },
  {
    slug: "stable-diffusion",
    name: "Stable Diffusion",
    vendor: "Stability AI",
    kind: "image",
    label: "SD + LoRA",
    consistency: "LoRA plus IP-Adapter, run locally",
    mechanism:
      "The full toolkit: LoRA for the identity, IP-Adapter for a per-shot reference, ControlNet for pose. It is the only stack where you control every variable, and the only one where the persona never leaves your machine.",
    syntax:
      "<lora:{trigger}:0.8> {prompt}\nNegative: {negative}\nSeed: {seed}, CFG: 6, Steps: 30, Sampler: DPM++ 2M Karras",
    strengths: [
      "Runs offline — the persona and the training set never leave your device",
      "ControlNet gives you the same pose across a whole set",
    ],
    limits:
      "The most setup of anything here, and base-model quality is behind the closed models unless you invest in the fine-tune.",
    routes: ["prompt-only", "reference", "trained"],
    order: 4,
  },
  {
    slug: "sora",
    name: "Sora",
    vendor: "OpenAI",
    kind: "video",
    label: "Sora",
    consistency: "First-frame conditioning from an approved still",
    mechanism:
      "Feed an approved still as the opening frame and describe the motion rather than the person. Describing the face again inside a video prompt is the single most common way people lose it.",
    syntax:
      "Opening frame: {referenceUrl}\nMotion: {motion}\nCamera: {camera}\nDuration: {seconds}s | Aspect: {aspect}",
    strengths: [
      "Best physical plausibility in motion",
      "Holds a subject well when it is given the first frame",
    ],
    limits:
      "Short clips, and identity drift grows with duration. Cut before the drift rather than trying to prompt it away.",
    routes: ["reference", "trained"],
    order: 5,
  },
  {
    slug: "veo",
    name: "Veo",
    vendor: "Google DeepMind",
    kind: "video",
    label: "Veo",
    consistency: "Image-to-video from a locked still, plus native audio",
    mechanism:
      "Image-to-video with synchronised speech, which makes it the shortest path from a character sheet to a talking clip. The still you feed it is doing all the identity work.",
    syntax:
      "Image: {referenceUrl}\nAction: {motion}\nDialogue: \"{line}\"\nCamera: {camera} | Aspect: {aspect}",
    strengths: [
      "Native audio removes a whole lip-sync step",
      "Camera-language prompts are honoured precisely",
    ],
    limits:
      "Generated speech carries its own disclosure obligation on top of the image one. Both, not either.",
    routes: ["reference", "trained"],
    order: 6,
  },
  {
    slug: "kling",
    name: "Kling",
    vendor: "Kuaishou",
    kind: "video",
    label: "Kling",
    consistency: "Start-and-end frame conditioning",
    mechanism:
      "Takes a start frame and an end frame and interpolates between them, which gives you tighter control over where a clip lands than a text-only motion prompt does.",
    syntax:
      "Start frame: {referenceUrl}\nEnd frame: {endFrameUrl}\nMotion: {motion}\nDuration: {seconds}s",
    strengths: [
      "Start-and-end framing keeps a clip from wandering",
      "Good at slow, controlled camera moves",
    ],
    limits: "Fast motion still smears faces. Keep the persona's movement small.",
    routes: ["reference", "trained"],
    order: 7,
  },
  {
    slug: "runway",
    name: "Runway",
    vendor: "Runway",
    kind: "video",
    label: "Runway",
    consistency: "Reference-locked generation with per-shot camera control",
    mechanism:
      "Built around an editing timeline rather than a single prompt, so it is the one to reach for when a clip has to cut against footage you already have.",
    syntax:
      "Reference: {referenceUrl}\nShot: {motion}\nCamera move: {camera}\nDuration: {seconds}s",
    strengths: [
      "Fits an existing edit rather than replacing it",
      "Strong motion-brush control over what moves and what does not",
    ],
    limits: "Costs add up per second faster than the image models cost per frame.",
    routes: ["reference", "trained"],
    order: 8,
  },
  {
    slug: "heygen",
    name: "HeyGen",
    vendor: "HeyGen",
    kind: "avatar",
    label: "HeyGen",
    consistency: "A trained avatar, reused as an asset",
    mechanism:
      "Turns an approved likeness into a reusable talking avatar and drives it from a script in many languages. The identity problem is solved once at setup and never re-litigated per clip.",
    syntax: "Avatar: {handle}\nVoice: {voice}\nScript:\n{script}",
    strengths: [
      "The most consistent talking output available, by a distance",
      "Multi-language delivery from one script",
    ],
    limits:
      "It talks; it does not live a life. You still need an image model for everything that is not a talking head.",
    routes: ["trained"],
    order: 9,
  },
  {
    slug: "elevenlabs",
    name: "ElevenLabs",
    vendor: "ElevenLabs",
    kind: "voice",
    label: "ElevenLabs",
    consistency: "A saved voice, versioned like the face",
    mechanism:
      "The voice is half the persona and it is the half people forget to lock. Save one voice, note its settings on the character sheet, and never regenerate it casually — a changed voice is as jarring as a changed face.",
    syntax:
      "Voice: {handle}\nStability: 0.45 | Similarity: 0.8 | Style: {style}\nScript:\n{script}",
    strengths: [
      "Consistent delivery across months of content",
      "Language coverage without re-recording",
    ],
    limits:
      "Cloning a real person's voice without their written permission is a legal problem in most of the markets listed here, not a grey area.",
    routes: ["prompt-only", "reference", "trained"],
    order: 10,
  },
];

export const MODEL_SLUGS = MODELS.map((model) => model.slug);
export const MODEL_BY_SLUG = Object.fromEntries(
  MODELS.map((model) => [model.slug, model]),
);

export const MODEL_KINDS = [
  { id: "image", label: "Image", blurb: "Stills — the identity is set here." },
  { id: "video", label: "Video", blurb: "Motion, conditioned on a locked still." },
  { id: "avatar", label: "Talking avatar", blurb: "A script in, a person out." },
  { id: "voice", label: "Voice", blurb: "The half of the persona nobody locks." },
];

/* ------------------------------------------------------------------ *
 * Languages the persona can publish in. Drives the multilingual claim on
 * the landing page and the disclosure wording, which must match the post.
 * ------------------------------------------------------------------ */
export const LANGUAGES = [
  { id: "en", label: "English", disclosure: "AI-generated" },
  { id: "hi", label: "Hindi", disclosure: "एआई-निर्मित" },
  { id: "es", label: "Spanish", disclosure: "generado por IA" },
  { id: "pt", label: "Portuguese", disclosure: "gerado por IA" },
  { id: "fr", label: "French", disclosure: "généré par IA" },
  { id: "de", label: "German", disclosure: "KI-generiert" },
  { id: "ar", label: "Arabic", disclosure: "تم إنشاؤه بالذكاء الاصطناعي" },
  { id: "id", label: "Indonesian", disclosure: "dibuat oleh AI" },
  { id: "ja", label: "Japanese", disclosure: "AI生成" },
  { id: "ko", label: "Korean", disclosure: "AI 생성" },
  { id: "it", label: "Italian", disclosure: "generato dall'IA" },
  { id: "tr", label: "Turkish", disclosure: "yapay zeka üretimi" },
];

export const LANGUAGE_IDS = LANGUAGES.map((language) => language.id);
export const LANGUAGE_BY_ID = Object.fromEntries(
  LANGUAGES.map((language) => [language.id, language]),
);
