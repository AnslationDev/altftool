const seo = {
  intro:
    "The Leftover Ingredients Recipe Finder matches what is actually in your fridge against 100 recipes and splits the results into two lists: dishes you can cook right now with nothing missing, and dishes you are exactly one ingredient away from. You tick items from 80 common ingredients grouped into grains, dals and beans, vegetables and aromatics, dairy and eggs, sauces, and meat and seafood; basic staples — salt, oil, water, turmeric, chilli powder, cumin and mustard seeds — are assumed and left out of the matching. Each result carries its cuisine, cooking time in minutes, whether it needs a stove, and a written method with quantities.",
  useCases: [
    "There is a bowl of cold rice and half an onion left from last night and you want to know what that actually turns into before you order food instead.",
    "The gas has run out or it is too hot to cook, so you filter to no-stove dishes and see only what can be made without a flame.",
    "You have fifteen minutes before you have to leave and want the quick filter to hide anything that takes longer — matches are still ranked by how much of your fridge they use first, with faster ones only breaking ties.",
  ],
  benefits: [
    ["The one-item-away list", "Recipes missing exactly one required ingredient are shown separately, so a single stop at the shop unlocks a specific dish rather than a vague maybe."],
    ["Ranked by what you already have", "Matches are ordered by how many of the recipe's optional add-ins you ticked, then by cooking time, so the dish that uses up the most of your fridge rises to the top."],
    ["Methods with real quantities", "Each recipe gives the actual steps and amounts — two cups of rice, one tablespoon of soy sauce — rather than a name and a photo you have to search elsewhere."],
  ],
  faqs: [
    [
      "How does it decide what I can cook?",
      "Every recipe has a short list of required ingredients. If you have ticked all of them the dish appears under ready to cook; if exactly one is missing it appears in the one-item-away list with that item named. Optional add-ins never block a match — they only push a recipe higher in the order.",
    ],
    [
      "Do I need to tick salt, oil and basic spices?",
      "No. Salt, oil, water, turmeric, red chilli powder, cumin and mustard seeds are treated as always present and are excluded from matching, because listing them would make every recipe look further away than it is. Everything else has to be ticked.",
    ],
    [
      "Can I get only vegetarian or only quick recipes?",
      "Yes — three filters narrow the list: veg only, quick (15 minutes or less), and no stove for dishes that need no cooking flame. They combine, so you can ask for a vegetarian no-stove dish under 15 minutes in one go.",
    ],
    [
      "Is leftover rice safe to reheat?",
      "Cooked rice should be cooled quickly, refrigerated within about an hour or two, and reheated thoroughly until steaming — rice left at room temperature for long periods can grow Bacillus cereus, which reheating does not reliably make safe. If leftovers smell off, have been out overnight, or you are unsure how long they have been sitting, throw them out rather than cook with them.",
    ],
  ],
};

export default seo;
