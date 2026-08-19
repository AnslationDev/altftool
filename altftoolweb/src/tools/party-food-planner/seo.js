const seo = {
  title: "Party Food Calculator: Per-Guest Portions",
  metaDescription:
    "Guest count to kilos: 90 g raw rice and 2.5 rotis an adult for Indian dinner, 500 ml water and 500 g ice a head, +10% buffer, as a shopping list.",
  steps: [
    "Enter Adults and Kids (3-12 yrs), drag Party duration between 1 and 8 hours, and pick Meal type — Full dinner, Snacks & starters or High tea.",
    "Set Cuisine style to Indian buffet, Western or Mixed, move Appetite level to Light, Normal or Hearty, and leave Add 10% host buffer ticked.",
    "Each course table lists Item, Per adult, Kid share and Total to arrange; Copy list or Download writes party-food-shopping-list.txt.",
  ],
  intro:
    "The Party Food Quantity Planner turns a guest count into exact catering quantities using the standard per-head formula: per-adult portion x (adults + kid share x kids) x appetite multiplier x a 10% host buffer. It carries real caterer figures — 90 g of raw basmati and 2.5 rotis a head for an Indian dinner, 180 g of cooked main and 240 g of sides for a Western one, 500 ml of drinking water and 500 g of ice per person — across full dinner, snacks and high-tea formats in Indian, Western or mixed menus. Hosts get a rounded, printable shopping list instead of a guess.",
  useCases: [
    "You are hosting a 30-adult, 10-child family dinner and need to know how many kilos of rice and dal to buy, and how many rotis to order so they arrive in two warm rounds.",
    "A three-hour birthday party is all grazing food, and you want the starter counts scaled for the way people slow down after the first hour rather than multiplied flat by three.",
    "You are briefing a caterer for an office high tea and want a per-item list you can hand over, with the per-adult figure shown next to every total so their quote can be checked line by line.",
  ],
  benefits: [
    [
      "Children counted properly",
      "Every item carries its own child share — kids eat about half an adult's rice but the same or more ice cream — instead of counting a child as half a guest across the board.",
    ],
    [
      "Grazing hours modelled, not multiplied",
      "For snacks the first hour counts in full and every later hour at 70%, which matches how quickly appetite falls off and stops a four-hour party being over-catered.",
    ],
    [
      "Quantities rounded to how you buy",
      "Totals are rounded up to purchasable amounts — grams to the nearest 25, litres to the quarter, piece counts to the nearest 5 above 40 — and exported as a tick-box text list.",
    ],
  ],
  faqs: [
    [
      "How much food do you need per person for a party?",
      "For a full Indian dinner, plan roughly 90 g of raw rice, 80 g of raw dal, 100 g of vegetables, 50 g of paneer and 2.5 rotis per adult, plus 3-5 starter pieces. A Western dinner runs about 180 g of cooked main, 240 g of sides across two dishes and 5 appetiser pieces per adult.",
    ],
    [
      "How much water and drinks should I plan per guest?",
      "Budget 500 ml of drinking water and 300 ml of soft drinks or juice per person for a party up to three hours, adding 100 ml of water and 75 ml of soft drinks for each hour beyond that. Ice is planned at 500 g per person, and more in peak summer.",
    ],
    [
      "How much extra food should I make so I don't run out?",
      "A 10% buffer on everything is the usual caterer safety margin, and it is applied by default here. On top of that you can shift the whole plan 20% down for a light crowd or 20% up for a hungry one.",
    ],
    [
      "How do I count children in the guest list?",
      "Count them separately rather than as half-adults. Each dish has its own child ratio — around 0.5 for rice, dal and mains, 0.6 to 0.7 for starters and breads, and 1.0 or higher for dessert and ice cream, since children usually come back for seconds on sweets.",
    ],
  ],
};

export default seo;
