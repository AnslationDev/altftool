const seo = {
  title: "Colombo Trip Budget: Service Charge, SSCL & VAT",
  metaDescription:
    "Prices a Colombo trip in LKR and rupees, compounding 10% service charge, 2.5% SSCL and 18% VAT (1.3305x) onto quoted room and restaurant prices.",
  steps: [
    "Pick Travel style (Backpacker, Comfort or Premium), Season, how you pay in Sri Lanka, Travellers and Nights in Colombo.",
    "Leave \"My room and food prices are quoted before service charge and taxes\" ticked so 10%, 2.5% and 18% compound, and edit any per-night or per-day LKR rate.",
    "Read the line-by-line table in LKR and rupees with the per-person-per-day figure and the cost of one extra night, then press Copy result.",
  ],
  intro:
    "This planner splits a Colombo trip into rupee costs booked in India — return airfare, ETA and insurance — and Sri Lankan rupee costs spent on the ground, then applies the one adjustment most trip budgets get wrong: hotel and restaurant prices in Sri Lanka are usually quoted before the service charge, the Social Security Contribution Levy and VAT, and those three compound rather than add. At the common 10% service charge, 2.5% SSCL and the 18% VAT in force since January 2024 the multiplier is 1.10 × 1.025 × 1.18 = 1.3305, so a quoted price lands about 33% higher on the bill. Rooms are charged for nights, daily spends for nights + 1 days, and the season factor moves the room rate alone.",
  useCases: [
    "Checking whether a hotel's quoted nightly rate is a \"nett\" price or a \"++\" price, and what the difference costs across four nights.",
    "Budgeting a short Colombo stopover on a longer Sri Lanka itinerary without under-counting the restaurant bills.",
    "Comparing a monsoon-season trip against the December dry season, when west-coast room rates are at their highest.",
  ],
  benefits: [
    ["Add-ons compounded, not summed", "Service charge, then SSCL, then VAT — the sequence a Sri Lankan bill actually uses."],
    ["Inclusive prices handled too", "Turn the toggle off and street food, tuk-tuks and inclusive quotes are left alone."],
    ["Both currencies visible", "Every line shows Sri Lankan rupees and Indian rupees, so you know how much cash to carry."],
  ],
  faqs: [
    [
      "How much tax is added to a restaurant bill in Sri Lanka?",
      "A typical Colombo hotel or restaurant bill carries a 10% service charge, a 2.5% Social Security Contribution Levy and 18% VAT, which Sri Lanka raised from 15% on 1 January 2024. Because each is applied to the running total, the combined effect is 1.10 × 1.025 × 1.18 = 1.3305, or about 33% on top of the menu price rather than the 30.5% you would get by adding them. Small eateries, street food and tuk-tuks generally quote inclusive prices, so the gross-up applies mainly to hotels and licensed restaurants.",
    ],
    [
      "How much does a Colombo trip cost from India?",
      "On the comfort defaults here — a 4-star or serviced apartment shared two-up in the December-to-March dry season, restaurant meals, PickMe rides and a paid activity most days — four nights and five days works out near ₹84,000 per person including a return economy fare, the ETA, a 2% forex markup and a 10% buffer. A guesthouse-and-rice-and-curry version lands closer to ₹38,000 per person, and a Galle Face five-star version past ₹2 lakh.",
    ],
    [
      "What does \"plus plus\" or \"++\" mean on a Sri Lankan hotel rate?",
      "It means the rate excludes the service charge and government taxes, which are added at checkout — the opposite of a \"nett\" rate, which already includes them. On a room quoted at 22,000 rupees ++ you would actually pay close to 29,300 rupees a night once 10%, 2.5% and 18% are compounded on. Always ask which basis a quote is on before comparing two hotels; one quoting nett can be cheaper than a lower ++ rate.",
    ],
    [
      "When is the cheapest time to visit Colombo?",
      "The southwest monsoon from May to September, when west-coast room rates fall to roughly three-quarters of their inter-monsoon level because the rain and rough sea keep beach visitors away. December to March is the driest stretch on that coast and the most expensive, with a further surge over Christmas and New Year. These are informational planning estimates rather than quotes — Sri Lanka's visa fees and tax rates have changed several times in recent years, so confirm current rules before you book.",
    ],
  ],
};

export default seo;
