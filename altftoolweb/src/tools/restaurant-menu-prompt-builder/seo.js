const seo = {
  title: "Menu Prompt Builder: EU 14 / US 9 Allergens",
  metaDescription:
    "Build a menu-writing prompt and screen ingredients against the EU's 14 allergens, the US's 9 or the Codex list — each flag names the trigger word.",
  steps: [
    "Fill in Restaurant name, Cuisine and Menu section, then list Dishes — one per line and their ingredients, comma separated.",
    "Pick the Allergen declaration regime — EU/UK 14, United States 9 or the Codex-aligned list — plus pricing presentation and words per description.",
    "Copy prompt lifts the finished prompt; Allergen groups flagged and the Matched by keyword table name the ingredient behind each hit.",
  ],
  intro:
    "This builder turns a dish list and its ingredients into a menu-writing prompt, and screens those ingredients for the allergen groups your jurisdiction requires you to declare. You can select the EU list of 14 groups from Regulation (EU) No 1169/2011 Annex II, the nine United States major food allergens under FALCPA including sesame, or the Codex-aligned list that underpins several national rules including the FSSAI labelling regulations. Every match is shown with the ingredient word that triggered it, so a chef can confirm or correct it rather than trusting the software.",
  useCases: [
    "Rewrite a 40-dish menu in a consistent house style without letting the model invent ingredients.",
    "Spot that cashew paste puts a tree nut in a dish the front-of-house team lists as nut-free.",
    "Draft the allergen line for each dish before it goes to your food safety adviser for sign-off.",
    "Keep menu descriptions to a scannable 15-20 words instead of a paragraph nobody reads.",
  ],
  benefits: [
    ["Regime you actually trade under", "EU, US and Codex-aligned lists differ; pick the one that binds you rather than a generic list of eight."],
    ["Ingredient-level evidence", "Each flagged group names the word that triggered it, including South Asian terms like paneer, ghee, kaju and til."],
    ["No invented provenance", "The prompt bans farm names, breeds, regions and 'authentic' unless you supplied them as facts."],
  ],
  faqs: [
    [
      "How many allergens must be declared on a menu in the EU and UK?",
      "Fourteen. Regulation (EU) No 1169/2011, Annex II lists cereals containing gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, tree nuts, celery, mustard, sesame seeds, sulphur dioxide and sulphites, lupin and molluscs. The information must be available for non-prepacked food, though not necessarily printed on the menu itself.",
    ],
    [
      "Is sesame a major allergen in the United States?",
      "Yes. Sesame became the ninth major food allergen under the FASTER Act with effect from 1 January 2023, joining milk, eggs, fish, crustacean shellfish, tree nuts, peanuts, wheat and soybeans.",
    ],
    [
      "Can a keyword allergen check replace a proper kitchen check?",
      "No. A keyword screen only sees the ingredient words you type. It cannot detect cross-contact from shared fryers or utensils, allergens hidden in a stock, marinade, thickener or garnish, or a supplier changing a recipe. Treat it as a first pass and verify every dish against your recipe records.",
    ],
    [
      "How long should a menu description be?",
      "Most menu-engineering guidance lands on roughly 15 to 25 words: enough to name the main ingredient, the method and one supporting detail. Past that, diners tend to skim, and the extra words rarely earn their place on the page.",
    ],
  ],
};

export default seo;
