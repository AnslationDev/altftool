const seo = {
  intro:
    "This planner splits a Bangkok holiday into the two currencies it is actually paid in — rupees for the return airfare, visa and insurance, and baht for the room, food, BTS rides, temples and shopping — then converts the baht half at the rate you will really get after the forex markup. Rooms are charged for nights while daily spends are charged for nights + 1 days, rooms are counted as ceil(travellers ÷ people per room), and the season factor moves the room rate alone. It also estimates the 7% VAT you can reclaim on shopping at the airport under Thailand's VAT Refund for Tourists scheme.",
  useCases: [
    "Deciding between five nights in a Sukhumvit condo and three nights riverside before anyone puts money on a booking.",
    "Working out how many baht to load onto a forex card, and what the same spend would cost if you simply swiped an Indian credit card instead.",
    "Checking whether a planned shopping run clears the 5,000 baht threshold that makes the tourist VAT refund worth filing for.",
  ],
  benefits: [
    ["Two currencies kept apart", "Airfare and visa stay in rupees; on-ground spends stay in baht until one clean conversion."],
    ["Forex markup priced in", "Shows what a 3.5% card markup costs on this exact trip compared with a 1–2% forex card."],
    ["VAT refund estimated", "Applies the 7/107 rule to shopping and deducts the airport cash-refund fee."],
  ],
  faqs: [
    [
      "How much does a Bangkok trip cost from India for 5 days?",
      "On the comfort defaults here — a 4-star room shared two-up, a mix of food courts and restaurants, BTS with occasional Grab rides, and one paid attraction a day — four nights and five days works out near ₹84,000 per person including a return economy fare, a 2% forex markup and a 10% buffer. A backpacker version of the same trip lands closer to ₹38,000 per person, and a riverside five-star version around ₹2 lakh.",
    ],
    [
      "How do I claim the VAT refund in Thailand?",
      "Buy at a shop displaying the blue \"VAT Refund for Tourists\" sign, spend at least 2,000 baht at that shop on that day, ask for the P.P.10 form with your passport, and claim at the airport before departure once your trip total reaches 5,000 baht. Thailand's VAT is 7% and is already inside the shelf price, so the tax in a 10,000 baht bill is 10,000 × 7 ÷ 107, or about 654 baht, and a cash refund at the airport has a 100 baht administrative fee taken off.",
    ],
    [
      "Is it cheaper to carry cash or use a card in Bangkok?",
      "Cash changed at a Bangkok money changer usually beats both, at roughly 1% over mid-market, while a prepaid forex card loaded in India costs about 1–2% and an Indian debit or credit card typically carries a 3–3.5% cross-currency markup plus GST on that markup. Avoid changing large sums at the airport counters, and expect an ATM withdrawal fee of around 220 baht per transaction on top of your own bank's charge.",
    ],
    [
      "What is the cheapest time of year to visit Bangkok?",
      "The green season from June to October, when hotel rates fall roughly 20% below the hot-season baseline because of the afternoon rain. Songkran in mid-April and the New Year week are the most expensive: these short surge weeks push room rates about 50% above baseline, higher than any other stretch of the year. The cool dry season from November to February is the next priciest and the busiest for the rest of the year, with rooms hardest to get. These figures are informational planning estimates, not quotes — confirm current Thai visa, customs and tax rules before you book.",
    ],
  ],
};

export default seo;
