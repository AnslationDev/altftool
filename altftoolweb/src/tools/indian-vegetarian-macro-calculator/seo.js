const seo = {
  intro:
    "The Indian Vegetarian Macro Calculator sets daily protein, fat and carbohydrate targets for a lacto-vegetarian diet and then converts them into the portions Indian households actually measure in — chapatis, katoris of dal and rice, grams of paneer, glasses of milk and teaspoons of ghee. Calories come from the Mifflin-St Jeor equation multiplied by an activity factor and adjusted for your goal, with protein raised by a quality adjustment because cereals and pulses score lower than dairy on digestibility scales. The plate builder totals what you plan to eat and shows exactly how far it falls short of, or overshoots, each target.",
  useCases: [
    "Finding out why a four-roti, two-katori-dal lunch leaves you short on protein but ahead on carbohydrate.",
    "Setting a realistic protein goal on a vegetarian diet without moving to supplements first.",
    "Planning a 500 kcal deficit that still fits three home-cooked Indian meals a day.",
    "Comparing paneer against soya chunks and rajma for the protein they add per portion.",
  ],
  benefits: [
    ["Portions you actually use", "Chapatis, katoris, glasses and teaspoons rather than abstract grams of macronutrient."],
    ["Protein quality accounted for", "An adjustable 1.0-1.25 factor reflects the cereal-and-pulse base of most Indian vegetarian diets."],
    ["Live gap analysis", "Every food you add updates how much protein, fat and carbohydrate is still left in the day."],
  ],
  faqs: [
    [
      "How much protein is in one chapati and one katori of dal?",
      "A medium chapati made from about 30 g of atta supplies roughly 3.6 g of protein and 102 kcal, and a 150 g katori of thick toor dal about 10 g of protein and 180 kcal. Values move with the thickness of the dal and how much oil goes into the tempering, so weigh once to calibrate your own portions.",
    ],
    [
      "Can you hit a high protein target on an Indian vegetarian diet?",
      "Yes, but it needs deliberate choices: paneer at about 18 g per 100 g, soya chunks at roughly 52 g per 100 g dry, and rajma or chana at around 9 g per 150 g katori do most of the work, with curd and milk topping it up. Roti and rice contribute steadily but at a high carbohydrate cost, which is exactly what the plate builder makes visible.",
    ],
    [
      "Why does a vegetarian protein target need an adjustment?",
      "Cereal and pulse proteins score lower on PDCAAS and DIAAS than dairy or animal protein, largely because of limiting amino acids and lower digestibility, so intake targets are commonly raised by 10-20%. A lacto-vegetarian diet with regular milk, curd and paneer sits at the lower end of that range, which is why the default here is 1.1.",
    ],
    [
      "How many calories should an Indian vegetarian eat to lose weight?",
      "Start from your maintenance calories — resting metabolic rate times an activity factor — and subtract about 500 kcal a day, which projects to roughly 0.45 kg a week. This tool holds the target at 1,200 kcal for women and 1,500 for men and goes no lower; it is informational only, so discuss any substantial change with a doctor or registered dietitian.",
    ],
  ],
};

export default seo;
