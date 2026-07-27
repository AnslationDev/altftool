/**
 * Recipe Remix Prompt Builder — pure logic.
 *
 * Classifies a free-text leftovers list into dish roles, flags declarable
 * allergens, and composes a recipe-generation prompt.
 *
 * No React, no DOM, no Date.now(). Same input -> same output.
 */

/** OpenAI's published English rule of thumb: ~4 characters per token. */
export const CHARS_PER_TOKEN = 4;

export const MIN_INGREDIENTS = 2;
export const MAX_INGREDIENTS = 40;
export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 24;
export const MIN_MINUTES = 5;
export const MAX_MINUTES = 480;

/**
 * Dish roles. A dish that covers protein, starch, vegetable, fat, acid and
 * aromatic reads as complete; the classic "salt, fat, acid, heat" framing is
 * why acid and fat are tracked separately from the main components.
 */
export const ROLES = [
  { id: "protein", label: "Protein" },
  { id: "starch", label: "Starch / base" },
  { id: "vegetable", label: "Vegetable" },
  { id: "fat", label: "Fat" },
  { id: "acid", label: "Acid" },
  { id: "aromatic", label: "Aromatic / spice" },
];

/**
 * Keyword tables. Order matters: the first role whose keyword matches wins,
 * which is why acid and aromatic are tested before the bulkier categories
 * (yoghurt is used as a souring agent here, onion as an aromatic).
 */
const ROLE_KEYWORDS = [
  [
    "acid",
    [
      "lemon", "lime", "nimbu", "vinegar", "tamarind", "imli", "amchur", "kokum",
      "yogurt", "yoghurt", "curd", "dahi", "buttermilk", "chaas", "pickle", "achar",
      "wine", "kimchi", "sauerkraut", "sumac",
    ],
  ],
  [
    "aromatic",
    [
      "onion", "pyaz", "garlic", "lehsun", "ginger", "adrak", "chilli", "chili",
      "mirch", "coriander", "dhania", "cumin", "jeera", "turmeric", "haldi",
      "garam masala", "curry leaf", "curry leaves", "kadi patta", "bay leaf",
      "tej patta", "mustard seed", "rai", "asafoetida", "hing", "cinnamon",
      "cardamom", "elaichi", "clove", "laung", "pepper", "kali mirch", "basil",
      "mint", "pudina", "thyme", "rosemary", "oregano", "parsley", "dill",
      "spring onion", "scallion", "shallot", "lemongrass", "star anise", "fennel",
      "saunf", "nutmeg", "paprika", "chaat masala", "sambar powder", "kasuri methi",
    ],
  ],
  [
    "fat",
    [
      "oil", "ghee", "butter", "cream", "malai", "mayonnaise", "mayo", "coconut milk",
      "coconut cream", "peanut butter", "tahini", "lard", "dripping", "cheese sauce",
      "sesame oil", "olive", "avocado", "almond milk", "oat milk", "soy milk",
      "soya milk", "plant milk", "milk",
    ],
  ],
  [
    "protein",
    [
      "chicken", "murgh", "mutton", "lamb", "goat", "beef", "pork", "bacon", "ham",
      "sausage", "salami", "fish", "machli", "salmon", "tuna", "prawn", "shrimp",
      "crab", "squid", "egg", "anda", "paneer", "tofu", "tempeh", "seitan", "cheese",
      "cheddar", "mozzarella", "feta", "chickpea", "chana", "rajma", "kidney bean",
      "black bean", "lentil", "dal", "daal", "toor", "arhar", "moong", "masoor",
      "urad", "soya chunk", "soy chunk", "peanut", "cashew", "almond", "walnut",
      "sprouts", "yogurt protein",
    ],
  ],
  [
    "starch",
    [
      "rice", "chawal", "roti", "chapati", "paratha", "naan", "bread", "pav", "bun",
      "pasta", "macaroni", "penne", "spaghetti", "noodle", "ramen", "potato", "aloo",
      "sweet potato", "shakarkandi", "quinoa", "couscous", "oats", "poha", "upma",
      "suji", "sooji", "semolina", "rava", "flour", "atta", "maida", "besan",
      "tortilla", "wrap", "corn", "makka", "barley", "millet", "bajra", "jowar",
      "ragi", "vermicelli", "sevai", "idli", "dosa batter", "sabudana", "yam",
    ],
  ],
  [
    "vegetable",
    [
      "tomato", "tamatar", "spinach", "palak", "carrot", "gajar", "capsicum",
      "bell pepper", "broccoli", "cauliflower", "gobi", "peas", "matar", "cabbage",
      "patta gobi", "brinjal", "baingan", "eggplant", "zucchini", "mushroom",
      "cucumber", "kheera", "lettuce", "pumpkin", "kaddu", "bottle gourd", "lauki",
      "okra", "bhindi", "ladies finger", "beetroot", "radish", "mooli", "beans",
      "french bean", "green bean", "celery", "leek", "kale", "asparagus",
      "sweet corn", "drumstick", "tinda", "turai", "methi", "fenugreek leaves",
      "cluster bean", "gavar",
    ],
  ],
];

/**
 * The 14 allergens that must be declared on food sold in the EU and UK under
 * Regulation (EU) No 1169/2011, Annex II. The US FASTER Act 2021 recognises a
 * narrower list of nine (milk, eggs, fish, crustacean shellfish, tree nuts,
 * peanuts, wheat, soybeans, sesame), all of which are covered below.
 */
export const ALLERGENS = [
  {
    id: "gluten",
    label: "Cereals containing gluten",
    keywords: ["wheat", "atta", "maida", "suji", "sooji", "semolina", "rava", "barley", "rye", "oats", "spelt", "bread", "pasta", "macaroni", "penne", "spaghetti", "noodle", "roti", "chapati", "paratha", "naan", "pav", "bun", "vermicelli", "couscous", "seitan"],
    excludes: ["gluten free", "gluten-free", "rice noodle", "buckwheat"],
  },
  { id: "crustaceans", label: "Crustaceans", keywords: ["prawn", "shrimp", "crab", "lobster", "crayfish"], excludes: [] },
  { id: "eggs", label: "Eggs", keywords: ["egg", "anda", "mayonnaise", "mayo", "meringue"], excludes: ["eggplant", "egg free", "egg-free", "vegan mayo"] },
  { id: "fish", label: "Fish", keywords: ["fish", "machli", "salmon", "tuna", "cod", "anchovy", "sardine", "fish sauce"], excludes: [] },
  { id: "peanuts", label: "Peanuts", keywords: ["peanut", "groundnut", "moongphali"], excludes: [] },
  { id: "soybeans", label: "Soybeans", keywords: ["soy", "soya", "tofu", "tempeh", "edamame", "miso"], excludes: [] },
  {
    id: "milk",
    label: "Milk",
    keywords: ["milk", "butter", "ghee", "cheese", "cheddar", "mozzarella", "feta", "paneer", "cream", "malai", "yogurt", "yoghurt", "curd", "dahi", "buttermilk", "khoya", "condensed milk"],
    excludes: ["coconut milk", "almond milk", "soy milk", "soya milk", "oat milk", "peanut butter", "cocoa butter", "shea butter", "milk free", "dairy free", "dairy-free"],
  },
  { id: "nuts", label: "Tree nuts", keywords: ["almond", "hazelnut", "walnut", "cashew", "kaju", "badam", "pecan", "brazil nut", "pistachio", "pista", "macadamia"], excludes: [] },
  { id: "celery", label: "Celery", keywords: ["celery", "celeriac"], excludes: [] },
  { id: "mustard", label: "Mustard", keywords: ["mustard", "sarson", "rai", "kasundi"], excludes: [] },
  { id: "sesame", label: "Sesame", keywords: ["sesame", "til", "tahini"], excludes: [] },
  { id: "sulphites", label: "Sulphur dioxide and sulphites", keywords: ["wine", "dried apricot", "sulphite", "sulfite"], excludes: [] },
  { id: "lupin", label: "Lupin", keywords: ["lupin", "lupine"], excludes: [] },
  { id: "molluscs", label: "Molluscs", keywords: ["mussel", "oyster", "squid", "calamari", "octopus", "clam", "scallop", "snail"], excludes: [] },
];

/** Assumed always-present staples, listed in the prompt so the AI stops asking. */
export const PANTRY_STAPLES = ["salt", "cooking oil", "drinking water", "sugar", "black pepper"];

export const DIETS = [
  { id: "none", label: "No restriction", rule: "" },
  { id: "vegetarian", label: "Vegetarian (no meat, fish or egg)", rule: "no meat, fish, shellfish or egg" },
  { id: "eggetarian", label: "Vegetarian + egg", rule: "no meat, fish or shellfish; egg is fine" },
  { id: "vegan", label: "Vegan", rule: "no animal products at all, including dairy, honey and ghee" },
  { id: "jain", label: "Jain", rule: "no onion, garlic or root vegetables" },
  { id: "no-gluten", label: "Gluten-free", rule: "no wheat, barley, rye or regular oats" },
  { id: "no-dairy", label: "Dairy-free", rule: "no milk, butter, ghee, curd, paneer or cheese" },
];

export const SKILL_LEVELS = [
  { id: "beginner", label: "Beginner", rule: "assume no knife skills and explain every technique in one line" },
  { id: "confident", label: "Confident home cook", rule: "use normal cooking vocabulary and skip basic explanations" },
  { id: "advanced", label: "Advanced", rule: "go straight to technique and ratios, no hand-holding" },
];

/**
 * Time bands used to tell the assistant what kind of dish is realistic.
 * These are the tool's own bands, not an external standard.
 */
export const TIME_BANDS = [
  { maxMinutes: 15, label: "Fast", note: "one pan, no long simmer, no marination" },
  { maxMinutes: 30, label: "Weeknight", note: "one or two pans, short simmer only" },
  { maxMinutes: 60, label: "Standard", note: "room for a proper bhuna, bake or braise start" },
  { maxMinutes: Infinity, label: "Project", note: "slow cooking, marination and resting are allowed" },
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const containsKeyword = (haystack, keyword) =>
  new RegExp(`(^|[^a-z])${escapeRegExp(keyword)}`, "i").test(haystack);

/** Split a comma / newline separated list into cleaned ingredient names. */
export function parseIngredients(text) {
  return String(text || "")
    .split(/[\n,;]+/)
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line.length > 0)
    .slice(0, MAX_INGREDIENTS);
}

/** Best-guess dish role for one ingredient. Returns null when unrecognised. */
export function classifyIngredient(name) {
  const value = String(name || "").toLowerCase();
  if (!value) return null;
  for (const [roleId, keywords] of ROLE_KEYWORDS) {
    if (keywords.some((keyword) => containsKeyword(value, keyword))) return roleId;
  }
  return null;
}

/** Declarable allergens present across the whole ingredient list. */
export function detectAllergens(ingredients) {
  const list = Array.isArray(ingredients) ? ingredients : [];
  return ALLERGENS.filter((allergen) =>
    list.some((raw) => {
      const value = String(raw).toLowerCase();
      if (allergen.excludes.some((phrase) => value.includes(phrase))) return false;
      return allergen.keywords.some((keyword) => containsKeyword(value, keyword));
    })
  ).map((allergen) => ({ id: allergen.id, label: allergen.label }));
}

export function timeBandFor(minutes) {
  if (!isFiniteNumber(minutes) || minutes <= 0) return null;
  return TIME_BANDS.find((band) => minutes <= band.maxMinutes) || TIME_BANDS[TIME_BANDS.length - 1];
}

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export function buildRecipePrompt(input) {
  const {
    ingredientsText = "",
    servings,
    maxMinutes,
    cuisine = "",
    diet = "none",
    skill = "confident",
    equipment = "",
    mustUse = "",
  } = input || {};

  const ingredients = parseIngredients(ingredientsText);
  if (ingredients.length < MIN_INGREDIENTS) {
    return { error: `List at least ${MIN_INGREDIENTS} ingredients, one per line or separated by commas.` };
  }

  const servingCount = Number(servings);
  if (!isFiniteNumber(servingCount) || !Number.isInteger(servingCount)) {
    return { error: "Servings must be a whole number." };
  }
  if (servingCount < MIN_SERVINGS || servingCount > MAX_SERVINGS) {
    return { error: `Servings should be between ${MIN_SERVINGS} and ${MAX_SERVINGS}.` };
  }

  const minutes = Number(maxMinutes);
  if (!isFiniteNumber(minutes)) return { error: "Enter the time you have as a number of minutes." };
  if (minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    return { error: `Cooking time should be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.` };
  }

  const classified = ingredients.map((name) => ({ name, role: classifyIngredient(name) }));
  const covered = new Set(classified.map((item) => item.role).filter(Boolean));
  const missingRoles = ROLES.filter((role) => !covered.has(role.id));
  const unknown = classified.filter((item) => !item.role).map((item) => item.name);
  const allergens = detectAllergens(ingredients);
  const band = timeBandFor(minutes);
  const dietEntry = DIETS.find((item) => item.id === diet) || DIETS[0];
  const skillEntry = SKILL_LEVELS.find((item) => item.id === skill) || SKILL_LEVELS[1];
  const coverageScore = Math.round((covered.size / ROLES.length) * 100);

  const byRole = ROLES.map((role) => ({
    ...role,
    items: classified.filter((item) => item.role === role.id).map((item) => item.name),
  }));

  const inventoryLines = byRole
    .filter((role) => role.items.length > 0)
    .map((role) => `- ${role.label}: ${role.items.join(", ")}`);
  if (unknown.length) inventoryLines.push(`- Unclassified: ${unknown.join(", ")}`);

  const constraints = [
    `Serves ${servingCount}. Give quantities for exactly ${servingCount} serving${servingCount === 1 ? "" : "s"}, in grams and household measures.`,
    `Total active plus passive time must be ${Math.round(minutes)} minutes or less — that is a "${band.label.toLowerCase()}" dish: ${band.note}.`,
    cuisine.trim() ? `Cuisine direction: ${cuisine.trim()}.` : null,
    dietEntry.rule ? `Dietary rule: ${dietEntry.rule}.` : null,
    equipment.trim() ? `I only have: ${equipment.trim()}. Do not use anything else.` : null,
    mustUse.trim() ? `${mustUse.trim()} must be used up — it is the reason I am cooking this.` : null,
    `Skill level: ${skillEntry.label} — ${skillEntry.rule}.`,
    `Assume I already have ${PANTRY_STAPLES.join(", ")}. Do not ask about them.`,
    missingRoles.length
      ? `My list has no ${missingRoles.map((role) => role.label.toLowerCase()).join(", ")}. Either work around that or name at most two cheap additions that would fix it — say which.`
      : "My list already covers protein, starch, vegetable, fat, acid and aromatic, so no shopping should be needed.",
    allergens.length
      ? `These declarable allergens are present in my list: ${allergens.map((item) => item.label.toLowerCase()).join(", ")}. Call them out in the final recipe and suggest one swap for each.`
      : "No common declarable allergens were detected in my list; say so and note anything you add that introduces one.",
    "Do not invent an ingredient I did not list unless you flag it clearly as an addition.",
  ].filter(Boolean);

  const outputSpec = [
    "1. Dish name and one line on why it fits what I have.",
    "2. Ingredient table with quantity, unit and any substitution.",
    "3. Numbered method with a time estimate per step and the pan or vessel used.",
    "4. The one step where this dish usually goes wrong, and how to tell.",
    "5. Storage and reheating instructions, with how long it keeps refrigerated.",
  ];

  const prompt = [
    "You are a practical home cook who writes tested, no-waste recipes.",
    "",
    `Create one recipe that uses up what I already have. Do not give me options — pick the single best dish and commit to it.`,
    "",
    "WHAT I HAVE",
    ...inventoryLines,
    "",
    "CONSTRAINTS",
    ...constraints.map((line) => `- ${line}`),
    "",
    "OUTPUT FORMAT",
    ...outputSpec,
    "",
    "Be exact with quantities and heat levels. If something in my list is spoiled-risk (cooked rice, cut fruit, leftover seafood), say how to judge whether it is still safe before I cook with it.",
  ].join("\n");

  const charCount = prompt.length;

  return {
    prompt,
    ingredients,
    byRole,
    unknown,
    missingRoles,
    allergens,
    coverageScore,
    coveredCount: covered.size,
    roleCount: ROLES.length,
    ingredientCount: ingredients.length,
    servings: servingCount,
    minutes: Math.round(minutes),
    timeBand: band.label,
    timeBandNote: band.note,
    dietLabel: dietEntry.label,
    wordCount: countWords(prompt),
    charCount,
    tokenEstimate: Math.ceil(charCount / CHARS_PER_TOKEN),
  };
}
