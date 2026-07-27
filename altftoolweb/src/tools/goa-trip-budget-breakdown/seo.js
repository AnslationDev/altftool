const seo = {
  intro:
    "This planner turns a Goa holiday into a six-line budget — return travel, stay, food, local transport, activities and a contingency buffer — and divides it into cost per person and cost per person per day. It uses the multipliers that decide the real bill: rooms are charged for nights while food and scooters are charged for the extra arrival day, rooms are counted as ceil(travellers ÷ people per room), and a season factor is applied to the room rate alone because that is the line Goa reprices. Enter a group budget cap and it also solves for the number of nights that cap actually buys.",
  useCases: [
    "Settling on a nights-and-style combination before a group of friends books anything, so nobody discovers the cost after the flights are paid for.",
    "Comparing a monsoon trip against the same itinerary over New Year, when North Goa room rates roughly double.",
    "Splitting a shared bill fairly when three people share a two-bed room and the room line has to be spread across an odd headcount.",
  ],
  benefits: [
    ["Nights and days handled separately", "Rooms are billed for nights, meals and scooter hire for the extra arrival day."],
    ["Season priced on the room only", "The factor moves the stay line, not flights or food, which is how Goa actually reprices."],
    ["Answers the cap question", "Tells you how many nights your ceiling buys instead of only whether you are over it."],
  ],
  faqs: [
    [
      "How much does a 4-night Goa trip cost per person?",
      "On the comfort defaults here — a mid-range room shared two-up, cafe and shack meals, a rented scooter and one paid activity a day — four nights works out near ₹39,000 per person including return flights and a 10% buffer, or roughly ₹7,800 per person per day. A backpacker version of the same trip lands closer to ₹19,000 per person, and a beach-resort version well past ₹75,000.",
    ],
    [
      "What is the cheapest time of year to go to Goa?",
      "The monsoon, June to September, when room rates fall to roughly 60% of shoulder-season levels because the beach shacks close and the sea is unswimmable. The peak is Christmas and New Year week, when hotels commonly quote two to three times their normal rate and insist on a compulsory gala dinner charge on 31 December.",
    ],
    [
      "Is a scooter cheaper than cabs in Goa?",
      "Almost always. A rented scooter runs about ₹400 to ₹600 a day plus fuel and covers unlimited distance, whereas Goa has no metered street taxis and single point-to-point cab runs between North and South Goa can cost more than a full day of scooter hire. Budget for a licence, a helmet and a deposit, and price cabs instead if you plan to drink.",
    ],
    [
      "How much contingency should a trip budget include?",
      "10% is a sensible floor for a domestic trip where you already have real quotes, and 15% to 20% is safer when flights or rooms are still unbooked or you are travelling with children. The buffer absorbs surge pricing, a missed connection and the meals that overrun the daily figure; treat these numbers as informational planning estimates, not quotes.",
    ],
  ],
};

export default seo;
