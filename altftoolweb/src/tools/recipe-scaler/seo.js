const seo = {
  title: "Recipe Scaler: Servings or Pan Size, in Fractions",
  metaDescription:
    "Scales ingredients by servings or pan area, an 8-inch to 9-inch round is 1.27x, into 1 1/2 style fractions, and flags salt, spice, leavening and eggs.",
  steps: [
    "Build the ingredient list with Add row, or open Paste list, drop the recipe into Paste ingredients — one per line and press Parse & add; it reads 1/2, half-symbol fractions and 1 1/2 alongside cups, tbsp, tsp, g and ml.",
    "Pick By servings and set Original servings and Target servings, using the Half it, x1.5, Double and Triple chips, or pick By pan size and set the Original pan and Target pan, which scales on area rather than diameter.",
    "Scale factor shows the multiplier, the Scaled recipe list rewrites every amount as a cook-friendly fraction, and Watch-outs for this scale flags salt, spices, leavening and eggs; Copy recipe copies the list and Download saves scaled-recipe.txt.",
  ],
  intro:
    "Recipe Scaler multiplies every ingredient in a recipe by one factor, worked out either from servings (target ÷ original) or from baking pan area, and rewrites the results as kitchen-friendly fractions instead of decimals. Pan mode uses real area maths — π × (diameter ÷ 2)² for round tins, side² for square — so moving an 8-inch round to a 9-inch round comes out at 1.27x, not 1.13x. It also flags the ingredients that should not be scaled linearly: leavening, salt, spices and eggs each get their own advisory instead of a blind multiplication.",
  useCases: [
    "A recipe serves 4, eight people are coming, and you want the whole ingredient list rewritten at 2x with the amounts still readable as 1 1/2 tsp rather than 1.5.",
    "You own a 9-inch tin but the cake recipe was written for an 8-inch one, and you need the correct 1.27x factor rather than guessing and ending up with a thin, overbaked layer.",
    "You are halving a bake and hit '1 egg' and '1 tsp baking powder', where straight division either does not work or ruins the rise, and you want the tool to tell you what to do instead.",
  ],
  benefits: [
    [
      "Fractions a cook can actually measure",
      "Scaled amounts snap to 1/8, 1/4, 1/3, 1/2, 2/3, 3/4 or 7/8 within a 0.02 tolerance, falling back to a decimal only when nothing fits.",
    ],
    [
      "Pan conversion by area, not diameter",
      "Round, square and rectangular tins in inches or centimetres, with presets, so tin swaps use the ratio that actually governs batter depth.",
    ],
    [
      "Warns where linear scaling fails",
      "Leavening, salt and salty sauces, spices and extracts, and eggs are detected by name and each carries its own adjustment note.",
    ],
  ],
  faqs: [
    [
      "How do I scale a recipe from an 8-inch to a 9-inch pan?",
      "Multiply everything by 1.27. Pan capacity follows area, which grows with the square of the diameter, so a 9-inch round holds about 27% more than an 8-inch round even though it is only an inch wider. Pan mode computes this ratio for any pair of tins you enter.",
    ],
    [
      "Should I double the baking powder when I double a cake?",
      "No — start at about 75-90% of the doubled amount. Leavening acts on the batter's surface and structure rather than scaling linearly with volume, and a full double tends to make bakes dome and then collapse.",
    ],
    [
      "How do I handle half an egg?",
      "Round to the nearest whole egg, or whisk one egg and weigh out about 25 g, which is roughly half a large egg. Eggs are flagged automatically because they cannot simply be divided in the bowl.",
    ],
    [
      "Do cooking time and temperature scale too?",
      "No. Keep the oven temperature the same and extend the time modestly — a doubled cake is deeper, not twice as fast, so it needs longer but not double. Salt and spice also intensify in larger batches, which is why the tool suggests starting at roughly 75% for salt and 80% for spices and adjusting by taste at the end.",
    ],
  ],
};

export default seo;
