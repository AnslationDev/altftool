const seo = {
  title: "Recipe Remix Prompt Builder for Leftovers",
  metaDescription:
    "Turns a dish, the ingredients you have and a diet constraint into one AI prompt demanding substitutions, exact quantities, timings and storage notes.",
  steps: [
    "Fill in Original dish, Remix goal / diet constraint, Available ingredients and Servings; the form loads with a paneer butter masala example you can overwrite.",
    "The Recipe prompt panel rebuilds as you type, restating the dish, constraint and servings and instructing the assistant to keep the soul of the original and explain every substitution.",
    "Press Copy output to take the prompt into the AI assistant you already use, or Reset to restore the sample dish and ingredient list.",
  ],
  intro:
    "Recipe Remix Prompt Builder sorts a free-text list of leftovers into six dish roles — protein, starch, vegetable, fat, acid and aromatic — and writes a recipe prompt that states what is missing, what must be used up and which allergens are present. Allergen detection covers the 14 allergens declarable under Regulation (EU) No 1169/2011, Annex II, a list that already contains all nine recognised by the US FASTER Act. It is for anyone who wants one committed recipe from what is already in the fridge rather than a page of vague suggestions.",
  useCases: [
    "Using up cooked rice from last night before it becomes a food-safety risk, with a prompt that names it as the ingredient that must be finished.",
    "Cooking with a single kadhai on a gas hob and needing the recipe to stay inside that equipment limit.",
    "Checking whether a leftovers list is missing an acid or an aromatic before asking for a recipe, so the result does not taste flat.",
    "Flagging that milk, gluten and sesame are already in the list so the generated recipe calls them out for a guest with a restriction.",
  ],
  benefits: [
    ["Gap detection", "Shows which of the six dish components you are missing before the recipe is written."],
    ["Allergen aware", "Keyword screening against the 14 EU-declarable allergens, with exclusions so coconut milk is not flagged as dairy."],
    ["One answer, not five", "The prompt instructs the assistant to pick a single dish and commit to quantities and timings."],
  ],
  faqs: [
    [
      "What makes a dish feel complete?",
      "A dish usually needs a protein, a starch or base, a vegetable, a fat, an acid and an aromatic. The most common omission in a leftovers cook is acid — a squeeze of lemon, a spoon of curd or a splash of vinegar — which is why a dish can taste heavy even when everything else is right.",
    ],
    [
      "Which allergens have to be declared on food?",
      "The EU and UK require 14: cereals containing gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, tree nuts, celery, mustard, sesame, sulphur dioxide and sulphites, lupin, and molluscs. The United States recognises nine major allergens under the FASTER Act of 2021, which added sesame to the previous list of eight.",
    ],
    [
      "How long is leftover rice safe to use?",
      "Cooked rice should be cooled quickly, refrigerated within an hour or two, and used within about a day, because Bacillus cereus spores survive cooking and produce toxins if rice sits at room temperature. Reheat it until steaming hot all the way through, once only, and throw it out if it smells sour or looks slimy.",
    ],
    [
      "Does the tool cook or just write the prompt?",
      "It writes the prompt and the analysis; you paste the prompt into the AI assistant you already use. That keeps the ingredient classification, gap list and allergen flags deterministic, so the same list always produces the same brief.",
    ],
  ],
};

export default seo;
