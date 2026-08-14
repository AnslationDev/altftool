// Fact catalog — the canonical vocabulary for measurements and traits.
//
// WHY THIS EXISTS
// Category-specific attributes (bite force, wingspan, venom type, dive time)
// are NOT top-level record fields. They live in each record's `measurements`
// and `traits` arrays, keyed by the ids below. That choice matters:
//
//   • A record stays dense. A bird carries wingspan and flight speed; it does
//     not carry a null `venomType`. Firestore documents stay small and the
//     model does not grow a field every time a category is added.
//   • UI stays generic. Components render "the facts this animal has" and
//     never branch on category, so the PRD's no-animal-specific-UI rule holds.
//   • Cross-cutting attributes work. "Marine" is not one of the six
//     categories — whales are mammals, sharks are fish, penguins are birds —
//     so dive time and pod size are gated by TAG, not category. A category
//     field could not express that; a keyed fact can.
//
// This catalog adds what freeform keys could not: a stable id, a shared
// label and unit, which categories or tags a fact belongs to, how it should
// be displayed, and whether it is numerically comparable (the seam the future
// compare feature reads).
//
// The catalog is ADVISORY, not a gate. A record may use a key that is not
// listed — it renders with its own label under "Other" — so content is never
// blocked by a missing definition. What the catalog buys is consistency for
// the facts that recur.
//
// DISPLAY POLICY
//   "panel"  — rendered in the profile's statistics panel (the default).
//   "data"   — stored and comparable, but not rendered: values that are
//              precise enough to sort on yet too dry to put in front of a
//              reader, or that duplicate something the prose already says.
// Whether a fact ALSO appears in the hero strip is decided per record by its
// `highlights` array — that is an editorial choice about one animal, not a
// property of the fact type.

/** Display groupings for the statistics panel, in render order. */
export const FACT_GROUPS = [
  { id: "size", label: "Size & build" },
  { id: "locomotion", label: "Movement" },
  { id: "life-cycle", label: "Life cycle" },
  { id: "behaviour", label: "Behaviour" },
  { id: "defence", label: "Defence & senses" },
  { id: "environment", label: "Environment" },
  { id: "other", label: "Other" },
];

/**
 * key → { label, group, unit, categories, tags, display, comparable, why }
 *
 * `categories` / `tags`: where the fact is expected. Empty categories with a
 * tag list means the fact is cross-cutting (marine animals, venomous animals)
 * rather than belonging to one taxonomic group.
 * `comparable`: safe to rank across animals — requires a shared unit and a
 * shared meaning. Ranges expressed in different units (grams vs kilograms)
 * are normalised by the compare layer using `unit`, not by the record.
 */
export const FACT_DEFINITIONS = {
  /* ── Size & build ─────────────────────────────────────────── */
  "body-length": {
    label: "Head–body length",
    group: "size",
    unit: "m",
    categories: ["mammals", "reptiles", "amphibians", "fish"],
    display: "panel",
    comparable: true,
    why: "The most direct answer to 'how big is it', and the one figure readers compare between species.",
  },
  length: {
    label: "Length",
    group: "size",
    unit: "m",
    categories: ["reptiles", "fish", "amphibians"],
    display: "panel",
    comparable: true,
    why: "Total length for animals where a head–body/tail split is not meaningful, such as snakes and sharks.",
  },
  weight: {
    label: "Weight",
    group: "size",
    unit: "kg",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: true,
    why: "Mass drives almost everything else — what an animal can hunt, how much it must eat, how fast it can accelerate.",
  },
  height: {
    label: "Standing height",
    group: "size",
    unit: "m",
    categories: ["birds", "mammals"],
    display: "panel",
    comparable: true,
    why: "More useful than body length for upright animals such as penguins and bears.",
  },
  "shoulder-height": {
    label: "Shoulder height",
    group: "size",
    unit: "m",
    categories: ["mammals"],
    display: "panel",
    comparable: true,
    why: "The standard field measure for quadrupeds; body length varies with posture, shoulder height does not.",
  },
  wingspan: {
    label: "Wingspan",
    group: "size",
    unit: "cm",
    categories: ["birds", "insects"],
    display: "panel",
    comparable: true,
    why: "For anything that flies this is the defining dimension — it sets glide efficiency, manoeuvrability and how the animal is identified in the field.",
  },
  "tail-length": {
    label: "Tail length",
    group: "size",
    unit: "m",
    categories: ["mammals", "reptiles"],
    display: "panel",
    comparable: true,
    why: "Meaningful where the tail is a balance or signalling organ; otherwise better folded into total length.",
  },

  /* ── Movement ─────────────────────────────────────────────── */
  "top-speed": {
    label: "Top speed",
    group: "locomotion",
    unit: "km/h",
    categories: ["mammals", "reptiles"],
    display: "panel",
    comparable: true,
    why: "Readers ask this more than almost anything else, and it is genuinely informative — but only alongside the distance it can be held, which is why the note field carries that caveat.",
  },
  "running-speed": {
    label: "Running speed",
    group: "locomotion",
    unit: "km/h",
    categories: ["mammals", "reptiles"],
    display: "panel",
    comparable: true,
    why: "Alias of top-speed for land animals where no other locomotion mode competes; prefer top-speed unless a record needs both.",
  },
  "flight-speed": {
    label: "Flight speed",
    group: "locomotion",
    unit: "km/h",
    categories: ["birds", "insects"],
    display: "panel",
    comparable: true,
    why: "Level cruising speed. Kept separate from dive speed because conflating the two is how the peregrine's 320 km/h figure gets misreported.",
  },
  "dive-speed": {
    label: "Dive (stoop) speed",
    group: "locomotion",
    unit: "km/h",
    categories: ["birds"],
    display: "panel",
    comparable: true,
    why: "For raptors the hunting dive is a different physical regime from flight, and it is the number that makes the species remarkable.",
  },
  "swimming-speed": {
    label: "Swimming speed",
    group: "locomotion",
    unit: "km/h",
    categories: ["fish"],
    tags: ["marine", "aquatic"],
    display: "panel",
    comparable: true,
    why: "The aquatic equivalent of top speed; useful for predator–prey comparisons within a habitat.",
  },
  "jump-height": {
    label: "Jump height",
    group: "locomotion",
    unit: "m",
    categories: ["mammals", "amphibians", "insects"],
    display: "panel",
    comparable: true,
    why: "A concrete proxy for explosive power, and often the fact that makes a small animal impressive relative to its size.",
  },
  "flight-altitude": {
    label: "Maximum flight altitude",
    group: "locomotion",
    unit: "m",
    categories: ["birds"],
    display: "panel",
    comparable: true,
    why: "Reveals physiological adaptation — oxygen handling, temperature tolerance — and separates migratory high-flyers from low-level residents.",
  },
  "migration-distance": {
    label: "Migration distance",
    group: "locomotion",
    unit: "km",
    categories: ["birds", "insects", "mammals", "fish"],
    display: "panel",
    comparable: true,
    why: "Frames the animal's true range, which is often far larger than where it is usually seen.",
  },
  "dive-depth": {
    label: "Maximum dive depth",
    group: "locomotion",
    unit: "m",
    categories: ["fish", "birds", "mammals"],
    tags: ["marine"],
    display: "panel",
    comparable: true,
    why: "A cross-cutting marine measure: the same fact is meaningful for a penguin, a whale and a shark, which is exactly why it is tagged rather than tied to a category.",
  },
  "dive-duration": {
    label: "Maximum dive time",
    group: "locomotion",
    unit: "minutes",
    categories: ["birds", "mammals", "reptiles"],
    tags: ["marine"],
    display: "panel",
    comparable: true,
    why: "For air-breathing marine animals, breath-hold is the constraint that shapes hunting range and depth.",
  },

  /* ── Life cycle ───────────────────────────────────────────── */
  gestation: {
    label: "Gestation",
    group: "life-cycle",
    unit: "days",
    categories: ["mammals"],
    display: "panel",
    comparable: true,
    why: "Length of pregnancy predicts how developed young are at birth, and therefore the whole shape of parental care.",
  },
  incubation: {
    label: "Incubation",
    group: "life-cycle",
    unit: "days",
    categories: ["birds", "reptiles"],
    display: "panel",
    comparable: true,
    why: "The egg-laying counterpart to gestation; keeping them as separate keys prevents nonsense comparisons between an egg and a pregnancy.",
  },
  "sexual-maturity": {
    label: "Sexual maturity",
    group: "life-cycle",
    unit: "years",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians"],
    display: "panel",
    comparable: true,
    why: "The single best predictor of how fast a population can recover from losses — a slow-maturing species stays endangered long after the threat is removed.",
  },
  "litter-size": {
    label: "Litter size",
    group: "life-cycle",
    unit: "young",
    categories: ["mammals"],
    display: "panel",
    comparable: true,
    why: "With maturity age, sets the species' reproductive ceiling.",
  },
  "clutch-size": {
    label: "Clutch size",
    group: "life-cycle",
    unit: "eggs",
    categories: ["birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: true,
    why: "The egg-laying counterpart to litter size.",
  },
  lifespan: {
    label: "Lifespan",
    group: "life-cycle",
    unit: "years",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: true,
    why: "Context for every other life-cycle number; also where wild-versus-captive differences are most striking.",
  },

  /* ── Behaviour ────────────────────────────────────────────── */
  "social-structure": {
    label: "Social structure",
    group: "behaviour",
    categories: ["mammals", "birds", "fish", "insects"],
    display: "panel",
    comparable: false,
    why: "Solitary, pair-bonded, pride, herd or colony — this one fact reframes how every other behaviour should be read.",
  },
  "pod-size": {
    label: "Group size",
    group: "behaviour",
    unit: "individuals",
    categories: ["mammals", "fish"],
    tags: ["marine"],
    display: "panel",
    comparable: true,
    why: "The numeric form of social structure for animals that travel in pods or schools; kept separate so it stays sortable.",
  },
  "schooling-behaviour": {
    label: "Schooling",
    group: "behaviour",
    categories: ["fish"],
    display: "panel",
    comparable: false,
    why: "Whether a fish shoals or hunts alone determines its predator defence and how it is fished commercially.",
  },
  activity: {
    label: "Activity",
    group: "behaviour",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: false,
    why: "Diurnal, nocturnal or crepuscular — decides when an animal can be observed and which senses it invests in.",
  },
  "diet-type": {
    label: "Diet",
    group: "behaviour",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: false,
    why: "Trophic position in one word; the anchor for the predators-and-prey section.",
  },
  "nest-type": {
    label: "Nest type",
    group: "behaviour",
    categories: ["birds", "reptiles", "insects"],
    display: "panel",
    comparable: false,
    why: "Ranges from 'none, a bare scrape' to elaborate construction, and is frequently the most distinctive thing a species does. The king cobra being the only nest-building snake is a good example of why this deserves its own key.",
  },
  "breeding-season": {
    label: "Breeding season",
    group: "life-cycle",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: false,
    why: "Timing relative to climate explains much of a species' vulnerability — the emperor penguin's winter breeding is the whole reason sea-ice loss threatens it.",
  },

  /* ── Defence & senses ─────────────────────────────────────── */
  "bite-force": {
    label: "Bite force",
    group: "defence",
    unit: "PSI",
    categories: ["mammals", "reptiles", "fish"],
    display: "panel",
    comparable: true,
    why: "Determines what prey an animal can physically handle. Also corrects intuitions: the Komodo dragon's bite is weak, and that is precisely why its venom matters.",
  },
  "venom-type": {
    label: "Venom",
    group: "defence",
    categories: ["reptiles", "amphibians", "insects", "fish"],
    tags: ["venomous"],
    display: "panel",
    comparable: false,
    why: "Neurotoxic, haemotoxic or cytotoxic determines the symptoms, the treatment and the realistic danger to a person.",
  },
  "venom-yield": {
    label: "Venom yield per bite",
    group: "defence",
    unit: "mg",
    categories: ["reptiles"],
    tags: ["venomous"],
    display: "panel",
    comparable: true,
    why: "Potency alone misleads. The king cobra's venom is less potent per drop than several smaller elapids; the delivered volume is what makes a bite dangerous.",
  },
  "heat-sensing": {
    label: "Heat sensing",
    group: "defence",
    categories: ["reptiles"],
    display: "panel",
    comparable: false,
    why: "Infrared pit organs let a snake strike accurately in complete darkness. Recording its ABSENCE is as useful as recording its presence — cobras lack pits, and readers routinely assume all snakes have them.",
  },
  echolocation: {
    label: "Echolocation",
    group: "defence",
    categories: ["mammals"],
    tags: ["marine"],
    display: "panel",
    comparable: false,
    why: "A fundamentally different way of perceiving the world; applies to cetaceans and bats, so it is tagged rather than tied to a habitat.",
  },
  "shedding-frequency": {
    label: "Shedding frequency",
    group: "life-cycle",
    categories: ["reptiles"],
    display: "panel",
    comparable: false,
    why: "Ecdysis rate tracks growth rate and health, and is the practical fact anyone keeping or studying reptiles needs.",
  },
  "smell-range": {
    label: "Scent detection range",
    group: "defence",
    unit: "km",
    categories: ["mammals", "reptiles", "fish"],
    display: "panel",
    comparable: true,
    why: "For animals that hunt chemically rather than visually, this is the equivalent of eyesight.",
  },

  /* ── Environment ──────────────────────────────────────────── */
  "water-type": {
    label: "Water type",
    group: "environment",
    categories: ["fish", "amphibians"],
    tags: ["marine", "aquatic"],
    display: "panel",
    comparable: false,
    why: "Freshwater, saltwater or brackish is the first constraint on where an aquatic animal can exist at all.",
  },
  "ocean-range": {
    label: "Ocean range",
    group: "environment",
    categories: ["fish", "mammals", "birds"],
    tags: ["marine"],
    display: "panel",
    comparable: false,
    why: "Marine ranges follow currents and temperature bands rather than borders, so they need their own field rather than a list of countries.",
  },
  "body-temperature": {
    label: "Body temperature above water",
    group: "environment",
    unit: "°C",
    categories: ["fish"],
    display: "panel",
    comparable: true,
    why: "Regional endothermy is rare and consequential — it is what lets a great white hunt in cold seas.",
  },
  "ecological-role": {
    label: "Ecological role",
    group: "environment",
    categories: ["mammals", "birds", "reptiles", "fish", "amphibians", "insects"],
    display: "panel",
    comparable: false,
    why: "Apex predator, keystone species, pollinator or seed disperser — states in one line why the species' loss would matter beyond itself.",
  },
};

/** Definition for a fact key, or null when the key is not in the catalog. */
export function getFactDefinition(key) {
  return FACT_DEFINITIONS[key] ?? null;
}

/** The group a fact belongs to, defaulting to "other" for uncatalogued keys. */
export function getFactGroup(key) {
  return FACT_DEFINITIONS[key]?.group ?? "other";
}

/** Facts the catalog expects for a category, optionally narrowed by tags. */
export function getExpectedFacts(category, tags = []) {
  return Object.entries(FACT_DEFINITIONS)
    .filter(([, def]) => {
      if (def.categories?.includes(category)) return true;
      return def.tags?.some((tag) => tags.includes(tag)) ?? false;
    })
    .map(([key, def]) => ({ key, ...def }));
}
