const seo = {
  intro:
    "The Baking Pan Size Converter divides your pan's brim volume by the recipe pan's brim volume to give the exact multiplier for every ingredient, then adds bake-time advice and an overflow warning based on how deep the batter would sit. Round volumes come from pi x radius squared x depth, rectangles from length x width x depth, with bundt and cupcake tins using their real published capacities. It is for home bakers who own the wrong tin and want the recipe scaled properly instead of guessed.",
  useCases: [
    "The recipe calls for a 9-inch round and all you own is a 9 x 13 rectangle — you need the multiplier before you start weighing flour.",
    "You want to turn a single layer cake batter into cupcakes and need to know roughly how many liners it fills and how much sooner to check them.",
    "You are halving a 9 x 13 traybake into an 8-inch square and want to know whether the shallower batter means pulling it out early.",
  ],
  benefits: [
    [
      "Scales by volume, not by diameter",
      "It compares actual brim capacity, which is why a 9-inch square holds about 27 percent more batter than a 9-inch round even though both are called nine inches.",
    ],
    [
      "Warns you before the batter goes over",
      "It works out what fraction of the new pan unscaled batter would fill and flags anything above the two-thirds line as an overflow risk or below one-third as too thin.",
    ],
    [
      "Bake-time advice tied to batter depth",
      "The advice is driven by the computed depth ratio, so a deeper bake gets a 15 C (25 F) temperature drop and a 15 to 30 percent longer estimate rather than generic guidance.",
    ],
  ],
  faqs: [
    [
      "How do I convert a 9-inch round recipe to a 9 x 13 pan?",
      "Multiply every ingredient by the ratio of the two pan volumes, which the tool computes for you and rounds to a practical kitchen figure like 1 1/2x or 2x. A 9-inch round at 2 inches deep holds roughly 2.1 L to the brim against about 3.8 L for a 9 x 13.",
    ],
    [
      "How full should I fill a cake pan?",
      "Between one-half and two-thirds full. Above two-thirds the batter is likely to rise over the rim, and below one-third you get a flat, dry layer — the fill bar marks both thresholds.",
    ],
    [
      "Do I need to change the oven temperature when I change pans?",
      "Only when the batter depth changes materially. If the new pan makes the batter more than about 15 percent deeper, drop the temperature by 15 C (25 F) and expect 15 to 30 percent more time; bundt pans get the same drop plus 20 to 40 percent more time.",
    ],
    [
      "How do I scale eggs when the multiplier is not a whole number?",
      "Multiply, then round to the nearest half egg. For half an egg, whisk one whole egg and weigh out about 25 g, which is roughly 2 tablespoons.",
    ],
  ],
};

export default seo;
