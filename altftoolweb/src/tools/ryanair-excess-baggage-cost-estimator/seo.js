const seo = {
  title: "Ryanair Excess Baggage Calculator: Per-Flight Fees",
  metaDescription:
    "Totals Ryanair bag fees per passenger per one-way flight from your own booking's prices, and ranks every 10 kg/20 kg bag combo against per-kg excess.",
  steps: [
    "Set Passengers and 'One-way flights (a return is 2)', tick 'Priority & 2 Cabin Bags' if bought, and enter the 10 kg/20 kg bags and hold weight packed per passenger.",
    "Fill 'Prices from your booking' — Priority, each check-in bag size, 'Excess weight, per kg at the airport', gate-bag and airport check-in fees.",
    "Read the trip total with the per-passenger-per-flight figure, and the 'Cheapest way to carry that weight' table ranking every legal combination of up to 3 hold bags.",
  ],
  intro:
    "This estimator totals what Ryanair baggage actually costs by applying the two rules that catch people out: every fee is charged per passenger per one-way flight, and no allowance is ever pooled across a booking. It prices Priority & 2 Cabin Bags, 10 kg and 20 kg hold bags, per-kilogram excess weight, gate-bag fees and airport check-in from the figures your own booking quotes, then enumerates every legal combination of up to three hold bags to show whether a second bag beats paying for the overweight.",
  useCases: [
    "Checking whether a family of four on a return trip is paying eight bag fees rather than the four they budgeted for.",
    "Deciding between one 20 kg bag plus 5 kg of excess weight and simply buying a second 10 kg bag.",
    "Costing the gate fee for a cabin bag that will not fit under the seat when Priority was not bought.",
  ],
  benefits: [
    ["Per-flight maths done for you", "Fees multiply by passengers and by one-way flights, which is where most budgets go wrong."],
    ["Cheapest bag combination ranked", "Every legal mix of 10 kg and 20 kg bags is priced against per-kilogram excess at your own rates."],
    ["No invented prices", "Bag prices move with route, season and booking date, so every figure comes from the booking in front of you."],
  ],
  faqs: [
    [
      "How much is Ryanair excess baggage per kg?",
      "Weight above the hold allowance you bought is billed per kilogram at the bag drop, and the published headline rate has long been 11 euro or 11 pounds per kilo depending on the market. Because it is charged on every one-way flight, 5 kg of excess on a return trip is ten kilo-charges rather than five — which is usually more than the price of a second hold bag bought online in advance.",
    ],
    [
      "What can I take on Ryanair for free?",
      "One small personal bag measuring 40 x 20 x 25 cm that fits under the seat in front of you. Everything else is a paid extra: Priority & 2 Cabin Bags adds a 55 x 40 x 20 cm bag of up to 10 kg in the overhead locker, and hold bags are sold separately in 10 kg and 20 kg sizes, up to three per passenger.",
    ],
    [
      "Can passengers on the same Ryanair booking share a baggage allowance?",
      "No. Ryanair assesses each passenger's bags individually, so two 20 kg bags on one booking are not a 40 kg pot. A 24 kg suitcase is 4 kg over even if a companion's bag weighs only 16 kg, and the excess is charged on the individual bag. Legacy carriers commonly do pool within a booking, which is why the assumption travels badly to Ryanair.",
    ],
    [
      "What happens if my cabin bag does not fit at the Ryanair gate?",
      "It is taken from you and placed in the hold, and a gate-bag fee is charged on the spot — the published headline figure has long been 70 euro or 70 pounds, far above the price of a hold bag bought online. The fee applies per bag per flight, so the cheapest fix is always to buy the right cabin or hold product before you get to the airport.",
    ],
  ],
};

export default seo;
