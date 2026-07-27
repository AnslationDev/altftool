/**
 * Builds a menu-writing prompt and screens the ingredient list against the
 * allergen groups that have to be declared in the chosen jurisdiction.
 *
 * The allergen lists are statutory:
 *  - EU / UK: Regulation (EU) No 1169/2011, Annex II — 14 groups.
 *  - United States: FALCPA major food allergens — 9 groups, sesame added by the
 *    FASTER Act with effect from 1 January 2023.
 *  - Codex-aligned: the basis of many national lists, including the FSSAI
 *    labelling regulations in India. Codex groups peanuts and soybeans on one
 *    line, so the same list is quoted as either eight or nine entries.
 *
 * The keyword screen is an aid to a human check, not a substitute for one.
 */

/** Regulation (EU) No 1169/2011, Annex II. */
export const EU_ALLERGENS = [
  "Cereals containing gluten",
  "Crustaceans",
  "Eggs",
  "Fish",
  "Peanuts",
  "Soybeans",
  "Milk",
  "Tree nuts",
  "Celery",
  "Mustard",
  "Sesame seeds",
  "Sulphur dioxide and sulphites",
  "Lupin",
  "Molluscs",
];

/** FALCPA major food allergens, including sesame from 1 January 2023. */
export const US_ALLERGENS = [
  "Milk",
  "Eggs",
  "Fish",
  "Crustacean shellfish",
  "Tree nuts",
  "Peanuts",
  "Wheat",
  "Soybeans",
  "Sesame",
];

/** Codex-aligned list used as the basis of many national labelling rules. */
export const CODEX_ALLERGENS = [
  "Cereals containing gluten",
  "Crustaceans",
  "Eggs",
  "Fish",
  "Peanuts",
  "Soybeans",
  "Milk",
  "Tree nuts",
  "Sulphites at 10 mg/kg or more",
];

export const ALLERGEN_REGIMES = [
  {
    id: "eu",
    label: "EU / UK — 14 declarable allergens",
    citation: "Regulation (EU) No 1169/2011, Annex II",
    allergens: EU_ALLERGENS,
  },
  {
    id: "us",
    label: "United States — 9 major food allergens",
    citation: "FALCPA, with sesame added by the FASTER Act from 1 January 2023",
    allergens: US_ALLERGENS,
  },
  {
    id: "codex",
    label: "Codex-aligned list (basis of FSSAI and others)",
    citation: "Codex General Standard for the Labelling of Prepackaged Foods; basis of several national lists including the FSSAI labelling regulations",
    allergens: CODEX_ALLERGENS,
  },
];

/**
 * Ingredient words that indicate an allergen group. Deliberately includes South
 * Asian ingredient names, which a plain English keyword list would miss.
 * The canonical group name is the key; the EU/US label variants are mapped later.
 */
export const ALLERGEN_KEYWORDS = {
  "Cereals containing gluten": [
    "wheat", "atta", "maida", "suji", "semolina", "rava", "barley", "rye", "oats",
    "spelt", "flour", "bread", "naan", "roti", "paratha", "pasta", "noodle",
    "seitan", "couscous", "breadcrumb", "puff pastry", "malt", "beer",
  ],
  Crustaceans: ["prawn", "shrimp", "crab", "lobster", "crayfish", "langoustine", "jhinga"],
  Eggs: ["egg", "anda", "mayonnaise", "meringue", "aioli", "albumen", "custard"],
  Fish: ["fish", "anchovy", "cod", "salmon", "tuna", "pomfret", "bhetki", "surmai", "worcestershire", "fish sauce", "machli"],
  Peanuts: ["peanut", "groundnut", "moongphali", "mungfali", "satay"],
  Soybeans: ["soy", "soya", "tofu", "edamame", "miso", "tempeh", "soy sauce"],
  Milk: [
    "milk", "cream", "malai", "butter", "ghee", "cheese", "paneer", "khoya",
    "mawa", "curd", "dahi", "yoghurt", "yogurt", "whey", "casein", "lactose",
    "condensed milk", "buttermilk", "chaas", "kulfi", "ice cream",
  ],
  "Tree nuts": [
    "almond", "badam", "cashew", "kaju", "pistachio", "pista", "walnut", "akhrot",
    "hazelnut", "pecan", "macadamia", "brazil nut", "chironji", "praline", "marzipan",
  ],
  Celery: ["celery", "celeriac"],
  Mustard: ["mustard", "sarson", "rai", "kasundi", "dijon"],
  "Sesame seeds": ["sesame", "til", "tahini", "gingelly", "hummus", "halva"],
  "Sulphur dioxide and sulphites": ["sulphite", "sulfite", "sulphur dioxide", "dried apricot", "wine", "vinegar (sulphited)"],
  Lupin: ["lupin", "lupine"],
  Molluscs: ["mussel", "oyster", "clam", "squid", "calamari", "octopus", "scallop", "snail"],
};

/** Group names differ slightly between regimes; map them onto the canonical keys. */
const REGIME_ALIASES = {
  Wheat: "Cereals containing gluten",
  "Crustacean shellfish": "Crustaceans",
  Sesame: "Sesame seeds",
  "Sulphites at 10 mg/kg or more": "Sulphur dioxide and sulphites",
};

const canonicalName = (label) => REGIME_ALIASES[label] || label;

export const PRICING_TONES = [
  { id: "plain", label: "Plain numerals", note: "Price as a bare number, no currency symbol, no trailing zeros." },
  { id: "symbol", label: "With currency symbol", note: "Standard symbol and two decimals where the market expects it." },
  { id: "narrative", label: "Price inside the line", note: "Price sits at the end of the description rather than in a right-hand column." },
  { id: "tasting", label: "Set or tasting menu", note: "One price for the whole menu; individual items priced only as supplements." },
];

export const MENU_SECTIONS = [
  "Small plates",
  "Starters",
  "Mains",
  "Breads and rice",
  "Sides",
  "Desserts",
  "Drinks",
];

/**
 * Menu research consistently finds short descriptions outperform long ones;
 * 15-25 words is the range most menu-engineering guidance settles on.
 */
export const DESCRIPTION_WORDS_MIN = 8;
export const DESCRIPTION_WORDS_MAX = 45;
export const DESCRIPTION_WORDS_DEFAULT = 18;

/** Split a textarea or comma list into clean items. */
export function parseList(raw, { limit = 120 } = {}) {
  if (typeof raw !== "string") return [];
  const items = [];
  for (const piece of raw.split(/[\n,;]+/)) {
    const value = piece.trim().replace(/\s+/g, " ");
    if (!value) continue;
    items.push(value);
    if (items.length >= limit) break;
  }
  return items;
}

/** Look up a regime by id. */
export function getRegime(regimeId) {
  return ALLERGEN_REGIMES.find((item) => item.id === regimeId) || ALLERGEN_REGIMES[0];
}

/**
 * Screen free text for allergen keywords.
 *
 * @returns {object} { detected, notDetected, regime } where detected entries carry
 * the ingredient words that triggered them.
 */
export function screenAllergens(text, regimeId = "eu") {
  const regime = getRegime(regimeId);
  const haystack = ` ${String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ")} `;

  const detected = [];
  const notDetected = [];

  for (const label of regime.allergens) {
    const key = canonicalName(label);
    const keywords = ALLERGEN_KEYWORDS[key] || [];
    const matches = keywords.filter((word) => haystack.includes(` ${word.toLowerCase().replace(/[^a-z0-9]+/g, " ")} `));
    if (matches.length > 0) detected.push({ allergen: label, matches });
    else notDetected.push(label);
  }

  return { regime, detected, notDetected };
}

function section(heading, lines) {
  const body = lines.filter(Boolean).join("\n");
  return body ? `${heading}\n${body}` : "";
}

/**
 * @returns {object} Either { error } or { prompt, screen, stats, warnings }.
 */
export function buildMenuPrompt({
  restaurantName = "",
  cuisine = "",
  sectionName = MENU_SECTIONS[2],
  dishesRaw = "",
  ingredientsRaw = "",
  regimeId = "eu",
  pricingTone = PRICING_TONES[0].id,
  descriptionWords = DESCRIPTION_WORDS_DEFAULT,
  houseStyle = "",
  dietaryLabels = true,
  includeUpsell = false,
} = {}) {
  const name = String(restaurantName).trim();
  if (!name) return { error: "Enter the restaurant name." };

  const dishes = parseList(dishesRaw);
  if (dishes.length === 0) return { error: "List at least one dish, one per line." };
  if (dishes.length > 60) return { error: "Keep it to 60 dishes per run so each description gets real attention." };

  const ingredients = parseList(ingredientsRaw);
  if (ingredients.length === 0) {
    return { error: "List the key ingredients so the allergen screen has something to check." };
  }

  if (
    !Number.isFinite(descriptionWords) ||
    descriptionWords < DESCRIPTION_WORDS_MIN ||
    descriptionWords > DESCRIPTION_WORDS_MAX
  ) {
    return { error: `Description length must be between ${DESCRIPTION_WORDS_MIN} and ${DESCRIPTION_WORDS_MAX} words.` };
  }

  const tone = PRICING_TONES.find((item) => item.id === pricingTone) || PRICING_TONES[0];
  const screen = screenAllergens(`${dishesRaw} ${ingredientsRaw}`, regimeId);

  const warnings = [];
  if (screen.detected.length === 0) {
    warnings.push("No allergen keywords matched. That is unusual for a full menu — check the ingredient list is complete before relying on it.");
  }
  if (screen.detected.length > 0) {
    warnings.push(`${screen.detected.length} allergen group(s) matched by keyword. A keyword screen cannot see cross-contact, stock, oil or garnish — a person must confirm each dish.`);
  }
  if (descriptionWords > 25) {
    warnings.push("Menu descriptions past about 25 words are commonly skimmed; the detail tends to be better spent on the ingredient that justifies the price.");
  }
  if (dishes.length > 12) {
    warnings.push(`${dishes.length} dishes in one section is a lot to scan. Consider splitting the section.`);
  }

  const blocks = [
    section("ROLE", [
      "You are writing menu copy. Appetite comes from concrete ingredients and method, not adjectives.",
    ]),
    section("RESTAURANT", [
      `Name: ${name}`,
      cuisine ? `Cuisine: ${String(cuisine).trim()}` : "",
      `Menu section: ${String(sectionName).trim()}`,
      houseStyle ? `House style: ${String(houseStyle).trim()}` : "",
      `Pricing presentation: ${tone.label} — ${tone.note}`,
    ]),
    section(
      "DISHES",
      dishes.map((dish, index) => `${index + 1}. ${dish}`),
    ),
    section(
      "AVAILABLE INGREDIENTS (use only these)",
      ingredients.map((item, index) => `${index + 1}. ${item}`),
    ),
    section(`ALLERGEN REGIME — ${screen.regime.label}`, [
      screen.regime.citation,
      screen.detected.length
        ? `Keyword screen flagged: ${screen.detected.map((item) => item.allergen).join(", ")}`
        : "Keyword screen flagged nothing — verify manually.",
      `Declarable groups in this regime: ${screen.regime.allergens.join(", ")}`,
    ]),
    section("OUTPUT", [
      `1. For each dish: a description of about ${Math.round(descriptionWords)} words. Lead with the main ingredient, then the method, then one supporting detail.`,
      dietaryLabels
        ? "2. Dietary markers per dish, chosen only from: V (vegetarian), Ve (vegan), GF (no gluten-containing ingredient), N (contains nuts). Mark [CONFIRM] where the ingredient list does not settle it."
        : "",
      "3. An allergen line per dish naming the declarable groups from the regime above that the ingredients imply, each followed by the ingredient that causes it.",
      includeUpsell ? "4. One suggested pairing per dish drawn only from the dish list above." : "",
    ]),
    section("RULES", [
      "Use only the ingredients listed. Never infer a stock, oil, thickener or garnish that is not written down.",
      "Never state that a dish is free from an allergen; write 'no [allergen] ingredient listed — kitchen to confirm cross-contact'.",
      "No health, nutritional or medical claims. No 'authentic', 'world famous', 'award winning' unless supplied as a fact.",
      "No more than one adjective per ingredient. Cut 'succulent', 'mouth-watering', 'to die for'.",
      "Do not invent provenance, breed, farm or region names.",
    ]),
  ];

  const prompt = blocks.filter(Boolean).join("\n\n");

  return {
    prompt,
    screen,
    dishes,
    ingredients,
    tone,
    warnings,
    stats: {
      promptChars: prompt.length,
      promptWords: prompt.split(/\s+/).filter(Boolean).length,
      dishCount: dishes.length,
      ingredientCount: ingredients.length,
      allergensDetected: screen.detected.length,
      allergensInRegime: screen.regime.allergens.length,
      wordBudget: dishes.length * Math.round(descriptionWords),
      descriptionWords: Math.round(descriptionWords),
    },
  };
}
