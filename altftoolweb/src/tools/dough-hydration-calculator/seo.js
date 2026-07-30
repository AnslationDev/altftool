const seo = {
  intro:
    "The Dough Hydration Calculator works in baker's percentages, where flour is always 100% and every other ingredient is expressed as a share of the flour weight, then reports true hydration as total water divided by total flour times 100. For sourdough it splits your starter into its flour and water halves using the starter's own hydration, so a 20% starter at 100% hydration correctly contributes half its weight to each side of the ratio. Bakers get an exact gram breakdown, a hydration band telling them how the dough will feel, and a solver that works out how much water to add to hit a target.",
  useCases: [
    "You are following a sourdough recipe that claims 72% hydration and want to know what to actually pour in once the levain's own water is counted.",
    "Your ciabatta came out tight and you want to compare the recipe's real hydration against the 75-85% range that gives an open, hole-filled crumb.",
    "You have a 500 g formula but need to feed twelve people, so you scale the flour and want every other weight recalculated from its percentage rather than doing it by hand.",
  ],
  benefits: [
    [
      "Starter is counted properly",
      "A sourdough starter is decomposed into flour and water using its stated hydration, so the true hydration figure is not inflated the way a naive water-over-flour sum is.",
    ],
    [
      "Type in either column",
      "Enter a baker's percentage and the grams update, or type grams and the percentage back-solves, so you can work from whichever number your recipe gives.",
    ],
    [
      "Tells you what the number means",
      "Every result lands in a labelled band from very stiff through sandwich, rustic, ciabatta and focaccia, each with a note on how the dough will handle.",
    ],
  ],
  faqs: [
    [
      "How do you calculate dough hydration?",
      "Divide total water by total flour and multiply by 100. At 340 g water to 500 g flour that is 68% hydration; for sourdough you must first add the starter's flour and water into the two totals, which is what this tool does automatically.",
    ],
    [
      "What hydration should I use for pizza dough?",
      "Neapolitan-style pizza sits around 62%, which stays workable by hand and puffs in a hot oven, while pan styles like Sicilian and Detroit go far higher. The 65-75% band covers rustic loaves, baguettes and most pizza; above 85% the dough is slack enough that it is easier handled in a tray.",
    ],
    [
      "How much salt and yeast should go in bread dough?",
      "Salt is typically 2% of flour weight and instant yeast anywhere from 0.2% for a long cold ferment up to about 1.2% for a same-day enriched loaf. On 500 g of flour that is 10 g of salt, and between 1 g and 6 g of yeast depending on how long you want the rise to take.",
    ],
    [
      "Why does wholewheat flour need more water?",
      "Bran and germ absorb considerably more water than white flour, so an 80% wholewheat dough handles roughly like a 65% white dough. Add the last of the water gradually and rest the dough about 30 minutes before judging the feel, since absorption continues during that autolyse.",
    ],
  ],
};

export default seo;
