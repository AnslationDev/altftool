const seo = {
  title: "Coffee Brew Ratio Calculator: Grams and Water",
  metaDescription:
    "Exact coffee and water for pour-over 1:16, French press 1:15, AeroPress 1:14, moka 1:10, cold brew 1:5 and espresso 1:2, with absorption allowed for.",
  intro:
    "The Coffee Brew Ratio Calculator turns a brew method and a strength setting into an exact coffee dose in grams and a water weight in millilitres, using each method's own ratio band — 1:16 for pour-over, 1:15 for French press, 1:14 for AeroPress, 1:10 for moka, 1:5 for cold brew concentrate and 1:2 dose-to-yield for espresso. It also subtracts the water the grounds absorb, so it tells you how much coffee actually lands in the cup, not just how much you poured. Work forward from a dose you have already weighed, or backward from the number of cups you want to fill.",
  useCases: [
    "You want two 240 ml mugs of V60 and need to know how many grams to grind and how much water to pour, allowing for the water the bed will keep.",
    "You bought a 350 g bag and want to plan a 1:5 cold brew concentrate in a jar, then know how far it stretches once you dilute it.",
    "Your espresso tastes thin and you want to see what an 18 g dose looks like at 1:1.5 versus 1:2.5 before touching the grinder.",
  ],
  benefits: [
    ["Accounts for retained water", "Each method carries an absorption figure — about 2 g of water per gram of grounds for pour-over and French press, 2.5 for cold brew — so the predicted yield matches the cup."],
    ["Works in both directions", "Enter a dose and get the water, or enter cups and cup size and get the dose back out."],
    ["Ships the whole recipe, not just numbers", "Every method comes with its grind description, water temperature, brew time and step-by-step method you can copy in one click."],
  ],
  faqs: [
    [
      "What is the standard coffee to water ratio?",
      "Around 1:16 by weight for pour-over — 1 gram of coffee to 16 grams of water — which is the default here. The calculator uses a different centre for each brewer: 1:15 for French press, 1:14 for AeroPress and South Indian filter, 1:10 for moka pot, 1:5 for cold brew concentrate, and 1:2 for espresso.",
    ],
    [
      "How much coffee do I need for a 240 ml mug?",
      "About 15 g of coffee for a 240 ml pour-over mug at the default strength, because the grounds hold back roughly 2 ml of water per gram. The calculator does this net-yield step for you when you enter cups and cup size instead of a dose.",
    ],
    [
      "Why is the espresso ratio so much smaller than the others?",
      "Espresso ratios are dose-to-yield, not dose-to-water. A 1:2 shot means 18 g of dry coffee produces 36 g of liquid espresso in the cup, typically in 25 to 30 seconds, so the absorption adjustment does not apply.",
    ],
    [
      "How strong should cold brew be?",
      "Brewed at 1:5 it is a concentrate, not a drink — dilute it 1:1 to 1:3 with water or milk before serving. The strength slider moves cold brew between 1:8 and 1:4, and it steeps 12 to 18 hours at room temperature or in the fridge.",
    ],
  ],
};

export default seo;
