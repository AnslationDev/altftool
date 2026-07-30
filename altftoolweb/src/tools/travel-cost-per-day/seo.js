const seo = {
  intro:
    "Travel Cost Per Day converts a list of trip expenses into a single daily figure by scaling each line by how it actually accrues — per trip, per day, per night, per person, per person per day, or as a percentage buffer on everything else — then dividing the total by your number of days and travellers. Enter the destination, days, nights, party size and each cost once, and you get total cost, cost per day, cost per person per day, a category breakdown and a check against your daily target. It suits anyone comparing two destinations, or working out whether the cash they are carrying covers the on-trip spend.",
  useCases: [
    "You are choosing between a 5-day Goa trip and a 7-day Kerala trip for two people and want the per-person-per-day number, because the totals are not comparable when the lengths differ.",
    "Your hotel is quoted per night, food per person per day and flights as one lump sum, and you need them combined correctly instead of averaged by hand.",
    "You want to know how much cash to carry: the tool separates pre-trip payments from on-trip and reserve spend and flags the gap against the cash you plan to take.",
  ],
  benefits: [
    [
      "Each cost scales the way it really behaves",
      "A per-night hotel multiplies by nights, food multiplies by travellers and days, and a flight stays fixed — so the daily figure does not drift when you change party size.",
    ],
    [
      "Buffer computed on the real base",
      "A percentage line is applied to the sum of all non-percentage costs, so the emergency margin moves automatically when any other item changes.",
    ],
    [
      "Payment timing, not just totals",
      "Costs are split into pre-trip, on-trip and reserve, so you can see how much has to be paid before departure versus carried as spending money.",
    ],
  ],
  faqs: [
    [
      "How do you calculate cost per day for a trip?",
      "Add every expense converted to its trip total, then divide by the number of days. Fixed costs like flights count once, per-night costs multiply by nights rather than days, and per-person costs multiply by the party size — which is why a 5-day trip with 4 hotel nights is not simply the hotel rate times five.",
    ],
    [
      "What is the difference between cost per day and cost per person per day?",
      "Cost per day is the whole party's spend for one day; cost per person per day divides that again by the number of travellers. Two people spending 13,000 a day are at 6,500 each per day, and the per-person figure is the one to use when comparing trips with different group sizes.",
    ],
    [
      "How much emergency buffer should a travel budget include?",
      "A common starting point is 10 percent of all other costs, which is the default here, and the tool recalculates it whenever another line changes. Push it higher for long-haul, remote or multi-country trips where a missed connection or a medical cost is harder to absorb — this is planning guidance, not financial advice.",
    ],
    [
      "Do the budget, comfort and premium styles change my numbers?",
      "Yes — the style setting multiplies every amount you entered before totalling: budget scales to 0.85, balanced leaves them as typed, comfort to 1.25 and premium to 1.65. Use it to sketch a cheaper or more relaxed version of the same trip without re-entering each cost.",
    ],
  ],
};

export default seo;
