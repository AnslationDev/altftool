import { createCollectionCrudService, createSingletonDocService } from "@/lib/firestoreCrud";
import { createImageUploader } from "@/lib/storageUpload";

/**
 * Infodrif — About module data layer.
 *
 * Every field name below mirrors `src/data/about.json` in the public site
 * (infodrif/src/data/about.json) EXACTLY. The site loads each section with
 * `loadSection()` (src/lib/contentLoader.js) and overlays the Firestore
 * document on that JSON via `mergeWithFallback()`. A renamed or misspelled key
 * does not error — it is simply ignored and the JSON fallback renders instead.
 * Treat the JSON as the schema of record and change both together.
 *
 * Firestore layout
 *   projects/infodrif/about/hero     (+ stats)
 *   projects/infodrif/about/intro    (+ highlights)
 *   projects/infodrif/about/services (+ items)
 *   projects/infodrif/about/story    (+ timeline)
 *   projects/infodrif/about/team     (+ members)
 */

const PROJECT_ID = "infodrif";
const ABOUT_PATH = (key) => ["projects", PROJECT_ID, "about", key];

const HERO_STATS_PATH = [...ABOUT_PATH("hero"), "stats"];
const INTRO_HIGHLIGHTS_PATH = [...ABOUT_PATH("intro"), "highlights"];
const SERVICES_ITEMS_PATH = [...ABOUT_PATH("services"), "items"];
const STORY_TIMELINE_PATH = [...ABOUT_PATH("story"), "timeline"];
const TEAM_MEMBERS_PATH = [...ABOUT_PATH("team"), "members"];

const cleanText = (value = "") => String(value).trim();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ---------------------------------------------------------------------------
// Hub metadata — one card per sub-section on the module index page.
// ---------------------------------------------------------------------------
export const ABOUT_SECTIONS = [
  {
    key: "hero",
    label: "Hero",
    description: "Split headline, paragraph, CTA, hero image, and the animated counter stats.",
    route: "/infodrif/about/hero",
  },
  {
    key: "intro",
    label: "Intro",
    description:
      "The \"who we are\" copy, image, experience badge, quoted testimonial, and highlight bullets.",
    route: "/infodrif/about/intro",
  },
  {
    key: "services",
    label: "Services",
    description: "Services heading and the bento grid of service cards.",
    route: "/infodrif/about/services",
  },
  {
    key: "story",
    label: "Story",
    description: "Story intro, closing line, CTA, and the year-by-year timeline entries.",
    route: "/infodrif/about/story",
  },
  {
    key: "team",
    label: "Team",
    description: "Team heading, blurb, placeholder image, and the team member cards.",
    route: "/infodrif/about/team",
  },
];

// ---------------------------------------------------------------------------
// Lucide icon names. Stored as STRINGS and resolved back to components by the
// site's own `ICONS` lookup — a name outside these lists renders nothing.
// Keep each list in sync with the component named beside it.
// ---------------------------------------------------------------------------

/** Site component: infodrif/src/app/about/components/AboutHero.jsx -> `ICONS` */
export const ABOUT_HERO_STAT_ICON_NAMES = ["Users", "ThumbsUp", "Briefcase"];

/** Site component: infodrif/src/app/about/components/AboutServices.jsx -> `ICONS` */
export const ABOUT_SERVICE_ICON_NAMES = [
  "MessageSquare",
  "Settings",
  "Cpu",
  "Network",
  "Shield",
  "BarChart3",
];

/**
 * Tailwind gradient class pairs, not free text — the site interpolates them
 * straight into `className`, so only classes its build already emits render.
 * Site component: infodrif/src/app/about/components/AboutHero.jsx
 */
export const ABOUT_HERO_STAT_COLORS = [
  "from-violet-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
];

/**
 * Bento-grid column spans for a service card. Same Tailwind constraint as the
 * colours above. Site component: AboutServices.jsx
 */
export const ABOUT_SERVICE_SPANS = [
  { value: "col-span-1", label: "col-span-1 (standard)" },
  {
    value: "col-span-1 md:col-span-2 lg:col-span-1",
    label: "col-span-1 md:col-span-2 lg:col-span-1 (wide on tablet)",
  },
];

/** Which side of the timeline row the image sits on. Site component: OurStory.jsx */
export const STORY_IMAGE_SIDES = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

// ---------------------------------------------------------------------------
// Hero (settings doc + stats subcollection)
// ---------------------------------------------------------------------------

/**
 * The headline is split into three separately styled spans on the site
 * (heading + headingConnector + headingAccent) — keep them as distinct fields.
 */
export const DEFAULT_ABOUT_HERO = {
  eyebrow: "AI EXCELLENCE SINCE 2021",
  heading: "AI Consulting",
  headingConnector: "That",
  headingAccent: "Delivers Results",
  paragraph:
    "We partner with visionary organizations to architect intelligent systems that transform operations, unlock new opportunities, and create lasting competitive advantage.",
  ctaLabel: "Get Strategy",
  ctaHref: "/contact",
  imageUrl: "/assets/about1.png",
  imagePath: "",
  imageAlt: "Brand Illustration",
  imageWidth: 900,
  imageHeight: 900,
};

/**
 * `value` is a NUMBER and `suffix` is a separate string: the site feeds `value`
 * to a CountUp animator that does arithmetic on it, then appends `suffix`.
 * Storing "250+" in `value` would break the animation, so the two never merge.
 */
function normalizeHeroStat(payload) {
  return {
    icon: cleanText(payload.icon),
    value: toNumber(payload.value),
    suffix: cleanText(payload.suffix),
    label: cleanText(payload.label),
    color: cleanText(payload.color),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const heroService = createSingletonDocService(ABOUT_PATH("hero"), DEFAULT_ABOUT_HERO);
export const subscribeAboutHero = heroService.subscribe;
export const saveAboutHero = heroService.save;
export const resetAboutHero = heroService.reset;

const heroStatsService = createCollectionCrudService(HERO_STATS_PATH, {
  normalize: normalizeHeroStat,
  orderByField: "order",
});

export const subscribeAboutHeroStats = heroStatsService.subscribe;
export const createAboutHeroStat = heroStatsService.create;
export const updateAboutHeroStat = heroStatsService.update;
export const deleteAboutHeroStat = heroStatsService.remove;
export const toggleAboutHeroStatStatus = heroStatsService.toggleActive;

const heroImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/about/hero` });
export const uploadAboutHeroImage = heroImageUploader.upload;
export const deleteAboutHeroImage = heroImageUploader.remove;

// ---------------------------------------------------------------------------
// Intro (settings doc + highlights subcollection)
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_INTRO = {
  eyebrow: "Who We Are",
  heading: "Building intelligent",
  headingAccent: "futures with AI",
  body: "We leverage cutting-edge artificial intelligence to transform how businesses operate — making them more efficient, agile, and prepared for the future of digital commerce.",
  imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  imagePath: "",
  imageAlt: "Team collaboration",
  experienceValue: "10+",
  experienceLabel: "Years Experience",
  // Nested object — merged recursively by the site's mergeWithFallback().
  testimonial: {
    quote: '"Their AI expertise reshaped our entire workflow."',
    name: "Sarah Chen",
    role: "CTO, Nexus",
  },
};

function normalizeHighlight(payload) {
  return {
    text: cleanText(payload.text),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const introService = createSingletonDocService(ABOUT_PATH("intro"), DEFAULT_ABOUT_INTRO);
export const subscribeAboutIntro = introService.subscribe;
export const saveAboutIntro = introService.save;
export const resetAboutIntro = introService.reset;

const introHighlightsService = createCollectionCrudService(INTRO_HIGHLIGHTS_PATH, {
  normalize: normalizeHighlight,
  orderByField: "order",
});

export const subscribeAboutIntroHighlights = introHighlightsService.subscribe;
export const createAboutIntroHighlight = introHighlightsService.create;
export const updateAboutIntroHighlight = introHighlightsService.update;
export const deleteAboutIntroHighlight = introHighlightsService.remove;
export const toggleAboutIntroHighlightStatus = introHighlightsService.toggleActive;

const introImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/about/intro` });
export const uploadAboutIntroImage = introImageUploader.upload;
export const deleteAboutIntroImage = introImageUploader.remove;

// ---------------------------------------------------------------------------
// Services (settings doc + items subcollection)
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_SERVICES = {
  eyebrow: "Our Expertise",
  heading: "We Provide Best",
  headingAccent: "AI Consulting",
  ctaLabel: "View All Services",
};

/**
 * `featured` and `span` drive the bento grid layout (which tile is the hero
 * tile and how many columns it occupies), so they are content, not styling
 * incidentals. `iconSize` is passed straight to the lucide component.
 */
function normalizeServiceItem(payload) {
  return {
    title: cleanText(payload.title),
    description: cleanText(payload.description),
    icon: cleanText(payload.icon),
    iconSize: toNumber(payload.iconSize, 28),
    featured: payload.featured === true,
    span: cleanText(payload.span),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const servicesService = createSingletonDocService(ABOUT_PATH("services"), DEFAULT_ABOUT_SERVICES);
export const subscribeAboutServices = servicesService.subscribe;
export const saveAboutServices = servicesService.save;
export const resetAboutServices = servicesService.reset;

const servicesItemsService = createCollectionCrudService(SERVICES_ITEMS_PATH, {
  normalize: normalizeServiceItem,
  orderByField: "order",
});

export const subscribeAboutServiceItems = servicesItemsService.subscribe;
export const createAboutServiceItem = servicesItemsService.create;
export const updateAboutServiceItem = servicesItemsService.update;
export const deleteAboutServiceItem = servicesItemsService.remove;
export const toggleAboutServiceItemStatus = servicesItemsService.toggleActive;

// ---------------------------------------------------------------------------
// Story (settings doc + timeline subcollection)
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_STORY = {
  eyebrow: "Our story",
  subheading: "A journey of passion, innovation, and relentless pursuit of excellence.",
  ctaLabel: "Join Our Journey",
  ctaHref: "/contact",
  closingLine: "The best chapters are yet to be written.",
};

/** `imageSide` ("left" | "right") alternates the timeline layout per entry. */
function normalizeTimelineEntry(payload) {
  return {
    year: cleanText(payload.year),
    imageUrl: cleanText(payload.imageUrl),
    // Storage path kept alongside the URL so the blob can be deleted later.
    imagePath: cleanText(payload.imagePath),
    description: cleanText(payload.description),
    imageSide: payload.imageSide === "right" ? "right" : "left",
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const storyService = createSingletonDocService(ABOUT_PATH("story"), DEFAULT_ABOUT_STORY);
export const subscribeAboutStory = storyService.subscribe;
export const saveAboutStory = storyService.save;
export const resetAboutStory = storyService.reset;

const storyTimelineService = createCollectionCrudService(STORY_TIMELINE_PATH, {
  normalize: normalizeTimelineEntry,
  orderByField: "order",
});

export const subscribeAboutStoryTimeline = storyTimelineService.subscribe;
export const createAboutStoryTimelineEntry = storyTimelineService.create;
export const updateAboutStoryTimelineEntry = storyTimelineService.update;
export const deleteAboutStoryTimelineEntry = storyTimelineService.remove;
export const toggleAboutStoryTimelineEntryStatus = storyTimelineService.toggleActive;

const storyImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/about/story` });
export const uploadAboutStoryImage = storyImageUploader.upload;
export const deleteAboutStoryImage = storyImageUploader.remove;

// ---------------------------------------------------------------------------
// Team (settings doc + members subcollection)
// ---------------------------------------------------------------------------
export const DEFAULT_ABOUT_TEAM = {
  eyebrow: "Team",
  heading: "People at InfoDrif.",
  blurb:
    "Our people differentiate us as an agency. Beyond the job titles are individuals with unique perspectives and passions that help shape the vision and values of InfoDrif.",
  leadershipLabel: "Global Leadership",
  placeholderImageUrl: "https://via.placeholder.com/300x260/ffffff/111111?text=Team",
};

/**
 * The JSON fallback carries a numeric `id` (1..7) on each member, but the site
 * never reads it — TeamMember.jsx keys its cards off the array index. It is
 * deliberately NOT persisted here: both the admin factory and the site's reader
 * build items as `{ id: doc.id, ...doc.data() }`, so a stored `id` would shadow
 * the real Firestore document id and point update/delete at the wrong document.
 * Omitting it leaves `member.id` as the document id, which is what the admin
 * needs and what the site ignores.
 */
function normalizeTeamMember(payload) {
  return {
    name: cleanText(payload.name),
    role: cleanText(payload.role),
    imageUrl: cleanText(payload.imageUrl),
    imagePath: cleanText(payload.imagePath),
    order: toNumber(payload.order),
    active: payload.active !== false,
  };
}

const teamService = createSingletonDocService(ABOUT_PATH("team"), DEFAULT_ABOUT_TEAM);
export const subscribeAboutTeam = teamService.subscribe;
export const saveAboutTeam = teamService.save;
export const resetAboutTeam = teamService.reset;

const teamMembersService = createCollectionCrudService(TEAM_MEMBERS_PATH, {
  normalize: normalizeTeamMember,
  orderByField: "order",
});

export const subscribeAboutTeamMembers = teamMembersService.subscribe;
export const createAboutTeamMember = teamMembersService.create;
export const updateAboutTeamMember = teamMembersService.update;
export const deleteAboutTeamMember = teamMembersService.remove;
export const toggleAboutTeamMemberStatus = teamMembersService.toggleActive;

const teamImageUploader = createImageUploader({ pathPrefix: `${PROJECT_ID}/about/team` });
export const uploadAboutTeamMemberImage = teamImageUploader.upload;
export const deleteAboutTeamMemberImage = teamImageUploader.remove;

// ---------------------------------------------------------------------------
// Section registry — lets the hub page subscribe to every settings doc.
// ---------------------------------------------------------------------------
const sectionServices = {
  hero: heroService,
  intro: introService,
  services: servicesService,
  story: storyService,
  team: teamService,
};

export const DEFAULT_ABOUT_SECTIONS = {
  hero: DEFAULT_ABOUT_HERO,
  intro: DEFAULT_ABOUT_INTRO,
  services: DEFAULT_ABOUT_SERVICES,
  story: DEFAULT_ABOUT_STORY,
  team: DEFAULT_ABOUT_TEAM,
};

export function subscribeAboutSection(key, onNext, onError) {
  return sectionServices[key].subscribe(onNext, onError);
}
