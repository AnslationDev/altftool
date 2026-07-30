const seo = {
  intro:
    "The Mocktail & Drink Mixer matches what is actually on your shelf against 46 alcohol-free recipes and returns each one as an exact pour in millilitres, plus a ratio bar showing what share of the glass is fizz, sour, sweet, creamy or flavour. Tick ingredients from 56 items across seven shelf groups — juices, fizz, lemon-mint-ginger, fresh fruit, syrups, dairy and masala extras — and the list splits into drinks you can make right now and drinks that are one ingredient short. Quantities scale straight from a single glass to a pitcher for eight, and separate sweetness and tang dials rewrite only the sugar and citrus amounts.",
  useCases: [
    "It is 40 degrees outside, the fridge has lemon, mint, black salt and soda, and you want to know which cooler that actually adds up to instead of guessing at a shikanji ratio.",
    "You are hosting eight people and need one pitcher recipe with the total litres worked out before you decide how much soda to buy.",
    "Someone at the table does not want their drink cloyingly sweet, so you set sweetness to 'less sweet' and get the syrup cut to 60 percent while the citrus and fizz stay untouched.",
  ],
  benefits: [
    ["Sorted by what you can make now", "Recipes with nothing missing are listed first; the 'almost' list shows drinks blocked by exactly one ingredient, so you know the single thing worth buying."],
    ["Ratios, not vague 'top up'", "Every pour is given in millilitres with a colour bar showing each component's share of total volume, so the balance is visible before you mix."],
    ["Scaling that survives the maths", "Servings multiply every quantity at once, with millilitres snapped to the nearest 5 ml and countables shown in quarter units like ½ tsp rather than decimals."],
  ],
  faqs: [
    [
      "How many mocktail recipes does it cover?",
      "46 alcohol-free drinks, matched against 56 possible ingredients grouped into juices, sodas and fizz, lemon/mint/ginger, fresh fruit, syrups and sweeteners, dairy, and masala extras. Ice, drinking water and plain salt are assumed to be on hand and are not part of the matching.",
    ],
    [
      "Can I scale a recipe up for a party?",
      "Yes — the serving presets are 1, 2, 4 and 8 glasses, and choosing the 'party pitcher' occasion filter jumps straight to 8. Every millilitre figure and every countable quantity multiplies together, and the card reports the total liquid volume so you know whether it fits your jug.",
    ],
    [
      "What do the sweetness and tang controls actually change?",
      "They multiply only the sweet and sour ingredients by 0.6 for 'less sweet' or 'milder', 1 for as-written, or 1.4 for 'sweeter' or 'sharper'. Bases, fizz, dairy and spices are left alone, so the drink keeps its volume and character while the balance shifts.",
    ],
    [
      "Why does the tool keep recommending sugar syrup instead of sugar?",
      "Loose sugar does not dissolve in a cold drink, so recipes that are stirred rather than shaken call for syrup. Dissolve 1 cup of sugar in 1 cup of hot water, cool it, and it keeps in a bottle in the fridge for about two weeks.",
    ],
  ],
};

export default seo;
