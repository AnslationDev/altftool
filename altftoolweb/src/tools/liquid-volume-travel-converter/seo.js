const seo = {
  intro:
    "This converter moves a liquid volume between millilitres, litres, US and imperial fluid ounces, four different cups, spoons and pints, using exact definitions rather than rounded factors — a US fluid ounce is 29.5735295625 ml and an imperial one is 28.4130625 ml. It then checks the container against the cabin-baggage liquids rule, which caps each container at 100 ml with everything inside a single transparent resealable bag of no more than one litre. It is aimed at travellers packing toiletries and at anyone reading a recipe or label written for another country.",
  useCases: [
    "Checking whether a bottle sold as 3.4 fl oz really meets a 100 ml limit.",
    "Working out how many 75 ml bottles fit a one-litre liquids bag.",
    "Reading a US recipe in cups when your measuring jug is in millilitres.",
  ],
  benefits: [
    ["Exact factors", "US and imperial ounces kept separate, so a 20 fl oz UK bottle is not mistaken for a US one."],
    ["Four different cups", "Recipe, nutrition-label, metric and imperial cups all listed, because they differ by up to 20%."],
    ["Cabin rule built in", "Tests the container size and the bag total against the 100 ml and 1 litre limits."],
  ],
  faqs: [
    [
      "How many ounces is 100 ml?",
      "3.38 US fluid ounces, or 3.52 imperial fluid ounces. The TSA states its rule as 3.4 ounces, which is actually 100.55 ml — very slightly above a strict 100 ml limit, and the reason a bottle labelled 3.4 oz can be accepted in the US and questioned elsewhere.",
    ],
    [
      "What is the liquid rule for hand luggage?",
      "Each container must hold no more than 100 ml, and all of them must fit inside one transparent resealable bag with a capacity of about one litre, one bag per passenger. The rule applies to the container's stated capacity rather than the amount inside, so a part-used 150 ml tube is still refused. Some airports with newer CT scanners have relaxed this — check each airport on your route.",
    ],
    [
      "Is a US cup the same as a metric cup?",
      "No. A US recipe cup is 8 US fluid ounces (236.59 ml), the US nutrition-label cup is defined as exactly 240 ml, the metric cup used in Australia and New Zealand is 250 ml, and an imperial cup is 284.13 ml. The spread between the smallest and largest is about 20%, which matters in baking.",
    ],
    [
      "Why is a UK pint bigger than a US pint?",
      "Because the imperial pint is 20 imperial fluid ounces (568.26 ml) while the US liquid pint is 16 US fluid ounces (473.18 ml) — the imperial pint is about 20% larger. The two systems diverged after the UK redefined the gallon in 1824 and the US kept the older wine gallon of 231 cubic inches.",
    ],
  ],
};

export default seo;
