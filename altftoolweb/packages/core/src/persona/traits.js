/*
 * AltF Persona — trait vocabulary
 *
 * Every option the studio offers, and — more importantly — the exact phrase
 * each option contributes to the locked line. The UI renders `label`; the
 * engine emits `prompt`. Keeping those two strings apart is what lets the
 * interface read like English while the output reads like a specification.
 *
 * THE RULE THAT MATTERS: `prompt` phrases are written to be *stable under
 * re-reading*. No synonyms, no adjectives that a model will interpret
 * differently in a different sentence, and the order of the groups below is
 * the order they appear in the locked line — because prompt order changes
 * output, and a spec whose word order drifts is not a spec.
 *
 * The heritage vocabulary is descriptive and regional. It never names a real
 * person, and the guides say plainly that building a persona to resemble a
 * specific individual is a publicity-rights problem, not a feature.
 */

const opt = (id, label, prompt, note) =>
  note ? { id, label, prompt, note } : { id, label, prompt };

/* ---------------------------------------------------------------- *
 * 1. Presentation and age
 * ---------------------------------------------------------------- */
export const PRESENTATIONS = [
  opt("feminine", "Feminine", "a woman"),
  opt("masculine", "Masculine", "a man"),
  opt("androgynous", "Androgynous", "an androgynous person"),
  opt("nonbinary", "Non-binary", "a non-binary person"),
];

/*
 * Age phrases are bare noun phrases, never "in their late twenties" — the
 * locked line has to stay pronoun-free so it reads the same for every
 * presentation and so no model has to reconcile a pronoun with a description.
 */
export const AGE_BANDS = [
  opt("18-24", "18–24", "early twenties", "Reads youngest on camera; brands in beauty and study buy here."),
  opt("25-32", "25–32", "late twenties", "The default for most creator niches."),
  opt("33-40", "33–40", "mid thirties", "Where authority starts to outrank novelty."),
  opt("41-55", "41–55", "late forties", "Underserved and therefore cheap to stand out in."),
  opt("56+", "56 and over", "sixties", "Almost no competition; strong fit for money, home and wellness."),
];

/* ---------------------------------------------------------------- *
 * 2. Heritage — descriptive regional feature sets
 * ---------------------------------------------------------------- */
export const HERITAGES = [
  opt("east-asian", "East Asian", "East Asian features"),
  opt("south-asian", "South Asian", "South Asian features"),
  opt("southeast-asian", "Southeast Asian", "Southeast Asian features"),
  opt("central-asian", "Central Asian", "Central Asian features"),
  opt("west-asian", "West Asian", "West Asian features"),
  opt("north-african", "North African", "North African features"),
  opt("west-african", "West African", "West African features"),
  opt("east-african", "East African", "East African features"),
  opt("southern-african", "Southern African", "Southern African features"),
  opt("northern-european", "Northern European", "Northern European features"),
  opt("southern-european", "Southern European", "Southern European features"),
  opt("eastern-european", "Eastern European", "Eastern European features"),
  opt("latin-american", "Latin American", "Latin American features"),
  opt("indigenous-american", "Indigenous American", "Indigenous American features"),
  opt("pacific-islander", "Pacific Islander", "Pacific Islander features"),
  opt("mixed", "Mixed heritage", "mixed heritage features"),
];

/* ---------------------------------------------------------------- *
 * 3. Face
 * ---------------------------------------------------------------- */
export const FACE_SHAPES = [
  opt("oval", "Oval", "an oval face"),
  opt("round", "Round", "a round face with full cheeks"),
  opt("square", "Square", "a square face with a strong jaw"),
  opt("heart", "Heart", "a heart-shaped face with a narrow chin"),
  opt("diamond", "Diamond", "a diamond face with high wide cheekbones"),
  opt("long", "Long", "a long face with a high forehead"),
];

export const EYE_SHAPES = [
  opt("almond", "Almond", "almond eyes"),
  opt("round", "Round", "large round eyes"),
  opt("hooded", "Hooded", "hooded eyes"),
  opt("monolid", "Monolid", "monolid eyes"),
  opt("downturned", "Downturned", "downturned eyes"),
  opt("upturned", "Upturned", "upturned eyes"),
  opt("deepset", "Deep set", "deep-set eyes"),
];

export const EYE_COLOURS = [
  opt("dark-brown", "Dark brown", "dark brown"),
  opt("amber", "Amber", "amber"),
  opt("hazel", "Hazel", "hazel"),
  opt("green", "Green", "green"),
  opt("grey-blue", "Grey-blue", "grey-blue"),
  opt("blue", "Blue", "blue"),
  opt("grey", "Grey", "pale grey"),
];

export const BROWS = [
  opt("straight-thick", "Straight and thick", "thick straight brows"),
  opt("arched", "High arched", "high arched brows"),
  opt("soft-arch", "Soft arch", "softly arched brows"),
  opt("feathered", "Feathered", "feathered brows"),
  opt("tapered", "Thin and tapered", "thin tapered brows"),
];

export const NOSES = [
  opt("straight", "Straight", "a straight nose"),
  opt("button", "Button", "a small button nose"),
  opt("aquiline", "Aquiline", "an aquiline nose"),
  opt("wide-bridge", "Wide bridge", "a nose with a wide bridge"),
  opt("upturned", "Upturned", "a slightly upturned nose"),
];

export const LIPS = [
  opt("full", "Full", "full lips"),
  opt("balanced", "Balanced", "evenly balanced lips"),
  opt("thin-upper", "Thin upper", "a thinner upper lip"),
  opt("wide", "Wide", "a wide mouth"),
  opt("cupids-bow", "Defined cupid's bow", "a defined cupid's bow"),
];

/*
 * The distinguishing mark is the single highest-leverage field in the whole
 * builder. A model that is asked for "a pretty face" produces a different one
 * every time; a model asked for "a small vertical scar through the left
 * eyebrow" has something to anchor on, and the rest of the face follows it.
 */
export const MARKS = [
  opt("freckles", "Freckles across the nose", "a scatter of freckles across the nose and cheeks"),
  opt("beauty-mark", "Beauty mark above the lip", "a small beauty mark above the left side of the upper lip"),
  opt("tooth-gap", "Gap in the front teeth", "a visible gap between the front teeth"),
  opt("brow-scar", "Scar through the eyebrow", "a small vertical scar through the left eyebrow"),
  opt("heterochromia", "Two eye colours", "heterochromia, the left iris noticeably lighter"),
  opt("dimples", "Dimples", "deep dimples on both cheeks"),
  opt("widows-peak", "Widow's peak", "a pronounced widow's peak"),
  opt("cleft-chin", "Cleft chin", "a cleft chin"),
  opt("mole-cheek", "Mole on the cheekbone", "a single dark mole high on the right cheekbone"),
  opt("vitiligo", "Vitiligo patch", "a patch of vitiligo across the left jaw and neck"),
  opt("none", "None", "", "Cheaper to describe, far harder to reproduce. Only pick this on the trained route."),
];

/* ---------------------------------------------------------------- *
 * 4. Hair
 * ---------------------------------------------------------------- */
export const HAIR_LENGTHS = [
  opt("buzz", "Buzzed", "buzzed"),
  opt("crop", "Short crop", "cropped short"),
  opt("ear", "Ear length", "ear-length"),
  opt("chin", "Chin length", "chin-length"),
  opt("shoulder", "Shoulder length", "shoulder-length"),
  opt("mid-back", "Mid-back", "mid-back length"),
  opt("waist", "Waist length", "waist-length"),
];

export const HAIR_TEXTURES = [
  opt("straight", "Straight", "straight"),
  opt("wavy", "Wavy", "wavy"),
  opt("curly", "Curly", "curly"),
  opt("coily", "Coily", "tightly coiled"),
  opt("locs", "Locs", "loc'd"),
  opt("braided", "Braided", "braided"),
];

export const HAIR_COLOURS = [
  opt("jet-black", "Jet black", "jet black"),
  opt("dark-brown", "Dark brown", "dark brown"),
  opt("chestnut", "Chestnut", "chestnut"),
  opt("honey", "Honey blonde", "honey blonde"),
  opt("platinum", "Platinum", "platinum blonde"),
  opt("auburn", "Auburn", "auburn"),
  opt("copper", "Copper", "copper red"),
  opt("silver", "Silver", "silver grey"),
  opt("salt-pepper", "Salt and pepper", "salt-and-pepper"),
  opt("dyed", "Dyed a bold colour", "dyed a saturated colour"),
];

export const HAIR_DETAILS = [
  opt("centre-part", "Centre part", "a centre part"),
  opt("side-part", "Deep side part", "a deep side part"),
  opt("curtain", "Curtain fringe", "a curtain fringe"),
  opt("blunt-fringe", "Blunt fringe", "a blunt fringe"),
  opt("swept-back", "Swept back", "no fringe, swept back from the face"),
  opt("grey-streak", "One grey streak", "a single grey streak at the front"),
  opt("undercut", "Undercut", "an undercut on one side"),
  opt("none", "Nothing in particular", ""),
];

/* ---------------------------------------------------------------- *
 * 5. Build and skin
 * ---------------------------------------------------------------- */
export const BUILDS = [
  opt("slight", "Slight", "a slight build"),
  opt("lean", "Lean", "a lean build"),
  opt("athletic", "Athletic", "an athletic build"),
  opt("average", "Average", "an average build"),
  opt("curvy", "Curvy", "a curvy build"),
  opt("broad", "Broad", "a broad build"),
  opt("heavyset", "Heavyset", "a heavyset build"),
];

export const HEIGHTS = [
  opt("short", "Short", "short"),
  opt("below-average", "Below average", "slightly below average height"),
  opt("average", "Average", "average height"),
  opt("tall", "Tall", "tall"),
  opt("very-tall", "Very tall", "very tall"),
];

export const SKIN_TONES = [
  opt("porcelain", "Porcelain", "porcelain skin"),
  opt("fair", "Fair", "fair skin"),
  opt("light-olive", "Light olive", "light olive skin"),
  opt("olive", "Olive", "olive skin"),
  opt("golden", "Golden", "golden skin"),
  opt("tan", "Tan", "tan skin"),
  opt("bronze", "Bronze", "bronze skin"),
  opt("deep-brown", "Deep brown", "deep brown skin"),
  opt("rich-ebony", "Rich ebony", "rich ebony skin"),
];

/*
 * Finish phrases are written as trailing clauses, never as "<x> skin" — the
 * tone already supplies the noun, and two "skin"s in one clause is exactly the
 * kind of wording a model starts editing for you.
 */
export const SKIN_FINISHES = [
  opt("natural", "Natural texture", "natural texture and visible pores"),
  opt("dewy", "Dewy", "a dewy finish"),
  opt("matte", "Matte", "a matte finish"),
  opt("sun-weathered", "Sun-weathered", "sun-weathered with fine lines"),
  opt("freckled", "Freckled", "heavily freckled"),
];

/* ---------------------------------------------------------------- *
 * 6. Style
 * ---------------------------------------------------------------- */
export const WARDROBES = [
  opt("quiet-luxury", "Quiet luxury", "unbranded tailoring in neutral tones"),
  opt("streetwear", "Streetwear", "oversized streetwear"),
  opt("athleisure", "Athleisure", "technical athleisure"),
  opt("business-casual", "Business casual", "smart business-casual separates"),
  opt("workwear", "Workwear", "heavy cotton workwear"),
  opt("bohemian", "Bohemian", "loose bohemian layers"),
  opt("techwear", "Techwear", "black technical outerwear"),
  opt("preppy", "Preppy", "preppy knitwear and collars"),
  opt("vintage", "Vintage", "second-hand vintage pieces"),
  opt("minimal", "Minimal", "plain unbranded basics"),
  opt("indian-contemporary", "Indian contemporary", "contemporary Indian silhouettes"),
  opt("scandi", "Scandi", "pared-back Scandinavian tailoring"),
];

/*
 * Palette phrases are complete noun phrases including the word "palette", so
 * the style line can drop them in without a connective. Naming the actual
 * colours matters — "jewel tones" alone lands somewhere different every run.
 */
export const PALETTES = [
  opt("warm-neutral", "Warm neutral", "a warm neutral palette of sand, bone and camel"),
  opt("cool-neutral", "Cool neutral", "a cool neutral palette of slate, fog and off-white"),
  opt("monochrome", "Monochrome", "a monochrome palette of black, white and grey"),
  opt("earth", "Earth", "an earth-tone palette of clay, moss and rust"),
  opt("jewel", "Jewel", "a jewel-tone palette of emerald, oxblood and sapphire"),
  opt("pastel", "Pastel", "a soft pastel palette"),
  opt("high-contrast", "High contrast", "a high-contrast palette, one saturated accent against black"),
  opt("faded", "Faded", "a washed, sun-faded palette"),
];

export const SETTINGS = [
  opt("apartment", "City apartment", "a small modern city apartment"),
  opt("studio", "Bare studio", "a bare studio with a seamless backdrop"),
  opt("kitchen", "Kitchen", "a lived-in kitchen"),
  opt("desk", "Desk setup", "a desk setup lit by monitor light"),
  opt("street", "Street", "a busy street at eye level"),
  opt("cafe", "Cafe", "a small cafe by the window"),
  opt("gym", "Gym floor", "an empty gym floor"),
  opt("outdoors", "Outdoors", "open ground under a broad sky"),
  opt("shop", "Small shop", "a small independent shop"),
  opt("workshop", "Workshop", "a cluttered workshop bench"),
];

export const LIGHTING = [
  opt("window", "Window light", "soft daylight from a large window"),
  opt("golden", "Golden hour", "low golden-hour sun"),
  opt("overcast", "Overcast", "flat overcast daylight"),
  opt("ring", "Ring light", "an even ring light straight on"),
  opt("practical", "Practical lamps", "warm practical lamps in frame"),
  opt("hard", "Hard direct", "hard direct light with sharp shadows"),
  opt("neon", "Neon", "coloured neon spill"),
];

/* ---------------------------------------------------------------- *
 * 7. Voice
 * ---------------------------------------------------------------- */
export const TONES = [
  opt("dry", "Dry", "dry and understated"),
  opt("warm", "Warm", "warm and unhurried"),
  opt("blunt", "Blunt", "blunt, no cushioning"),
  opt("playful", "Playful", "playful and quick"),
  opt("clinical", "Clinical", "clinical and precise"),
  opt("earnest", "Earnest", "earnest, no irony"),
  opt("deadpan", "Deadpan", "deadpan"),
];

export const VALUES = [
  opt("evidence", "Evidence over vibes", "will not make a claim it cannot source"),
  opt("frugal", "Frugal", "always names the cheaper option that works"),
  opt("access", "Accessible", "assumes no prior knowledge and no budget"),
  opt("craft", "Craft", "cares how a thing was made"),
  opt("speed", "Speed", "optimises for the fastest acceptable answer"),
  opt("longevity", "Longevity", "judges everything by whether it lasts"),
  opt("independence", "Independence", "takes no money it will not disclose"),
  opt("plainness", "Plain speech", "refuses jargon on principle"),
];

export const CAMERA_ANGLES = [
  opt("eye", "Eye level", "eye level"),
  opt("low", "Slightly low", "slightly below eye level"),
  opt("high", "Slightly high", "slightly above eye level"),
  opt("overhead", "Overhead", "directly overhead"),
];

/* ---------------------------------------------------------------- *
 * The wizard is generated from this table, not hand-wired. `key` is the
 * field on the spec; `order` is the position in the locked line.
 * ---------------------------------------------------------------- */
export const TRAIT_FIELDS = [
  { key: "presentation", label: "Presentation", options: PRESENTATIONS, step: "face", order: 1, required: true },
  { key: "ageBand", label: "Age band", options: AGE_BANDS, step: "face", order: 2, required: true },
  { key: "heritage", label: "Heritage", options: HERITAGES, step: "face", order: 3, required: true },
  { key: "faceShape", label: "Face shape", options: FACE_SHAPES, step: "face", order: 4, required: true },
  { key: "eyeShape", label: "Eye shape", options: EYE_SHAPES, step: "face", order: 5, required: true },
  { key: "eyeColour", label: "Eye colour", options: EYE_COLOURS, step: "face", order: 6, required: true },
  { key: "brows", label: "Brows", options: BROWS, step: "face", order: 7, required: false },
  { key: "nose", label: "Nose", options: NOSES, step: "face", order: 8, required: false },
  { key: "lips", label: "Lips", options: LIPS, step: "face", order: 9, required: false },
  { key: "mark", label: "Distinguishing mark", options: MARKS, step: "face", order: 10, required: true },

  { key: "hairLength", label: "Hair length", options: HAIR_LENGTHS, step: "build", order: 11, required: true },
  { key: "hairTexture", label: "Hair texture", options: HAIR_TEXTURES, step: "build", order: 12, required: true },
  { key: "hairColour", label: "Hair colour", options: HAIR_COLOURS, step: "build", order: 13, required: true },
  { key: "hairDetail", label: "Hair detail", options: HAIR_DETAILS, step: "build", order: 14, required: false },
  { key: "skinTone", label: "Skin tone", options: SKIN_TONES, step: "build", order: 15, required: true },
  { key: "skinFinish", label: "Skin finish", options: SKIN_FINISHES, step: "build", order: 16, required: true },
  { key: "build", label: "Build", options: BUILDS, step: "build", order: 17, required: true },
  { key: "height", label: "Height", options: HEIGHTS, step: "build", order: 18, required: false },

  { key: "wardrobe", label: "Wardrobe", options: WARDROBES, step: "style", order: 19, required: true },
  { key: "palette", label: "Palette", options: PALETTES, step: "style", order: 20, required: true },
  { key: "setting", label: "Home setting", options: SETTINGS, step: "style", order: 21, required: true },
  { key: "lighting", label: "Signature light", options: LIGHTING, step: "style", order: 22, required: true },
  { key: "camera", label: "Camera height", options: CAMERA_ANGLES, step: "style", order: 23, required: false },

  { key: "tone", label: "Tone of voice", options: TONES, step: "voice", order: 24, required: true },
  { key: "value", label: "Governing value", options: VALUES, step: "voice", order: 25, required: true },
];

export const TRAIT_FIELD_BY_KEY = Object.fromEntries(
  TRAIT_FIELDS.map((field) => [field.key, field]),
);

/* Fields that contribute to the locked line, in emission order. */
export const IDENTITY_FIELD_KEYS = TRAIT_FIELDS.filter(
  (field) => field.step === "face" || field.step === "build",
)
  .sort((a, b) => a.order - b.order)
  .map((field) => field.key);

export const STYLE_FIELD_KEYS = TRAIT_FIELDS.filter(
  (field) => field.step === "style",
)
  .sort((a, b) => a.order - b.order)
  .map((field) => field.key);

export function traitOption(key, id) {
  const field = TRAIT_FIELD_BY_KEY[key];
  if (!field) return null;
  return field.options.find((option) => option.id === id) || null;
}

export function traitPrompt(key, id) {
  return traitOption(key, id)?.prompt || "";
}

export function traitLabel(key, id) {
  return traitOption(key, id)?.label || "";
}
