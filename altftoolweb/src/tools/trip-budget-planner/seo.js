const seo = {
  intro:
    "The Trip Budget Planner totals a trip against two lines you set yourself — the budget you are aiming at and the money you have already saved — and reports how far over or under each one you are. Every expense is entered once with the way it scales (trip total, per day, per night, per person, per person per day, or a percentage buffer on all the other lines), so changing the party size or adding a night updates the whole plan, including the per-person split and the pre-trip versus on-trip breakdown. It is for anyone deciding whether a trip is affordable as planned, or which line has to come down.",
  useCases: [
    "You have set aside a fixed amount for a holiday and want to see, line by line, whether the current plan clears it or overshoots and by how much.",
    "You have saved part of the cost so far and need to know the shortfall still to be funded before the pre-trip payments fall due.",
    "A friend wants to join, so you change the traveller count from 2 to 3 and want per-person costs, meals and activity tickets to rescale without touching the flight total.",
  ],
  benefits: [
    [
      "Two separate gaps, not one number",
      "The target gap says whether the plan fits the budget; the savings gap says how much money still has to be found — they are rarely the same answer.",
    ],
    [
      "Nights and days kept apart",
      "Accommodation multiplies by nights while daily transport multiplies by days, so a 5-day, 4-night trip is not silently overcharged for a fifth hotel night.",
    ],
    [
      "Costs sorted by when they are paid",
      "Pre-trip, on-trip and reserve totals are tracked separately, so you can see how much has to clear your account before departure.",
    ],
  ],
  faqs: [
    [
      "How do I plan a trip budget?",
      "List each cost with the unit it is actually quoted in — flights as a trip total, hotels per night, meals per person per day, activities per person — then let the tool scale them against your days, nights and traveller count. Totalling per-person and per-night items by hand is where most trip budgets go wrong.",
    ],
    [
      "How much should I set aside as a travel emergency fund?",
      "The default here is a 10 percent buffer calculated on all your other active expenses, so it grows automatically as the plan does. Raise it for long-haul, remote or multi-country travel where a missed connection or medical cost is harder to absorb; this is general planning guidance, not financial advice.",
    ],
    [
      "What do the budget, comfort and premium styles do to my numbers?",
      "They scale every amount you entered before totalling: budget applies a 0.82 multiplier, balanced leaves your figures untouched, comfort applies 1.28 and premium 1.72. It is a quick way to price a leaner or more relaxed version of the same trip without re-typing each line.",
    ],
    [
      "How is the per-person cost worked out?",
      "It is the trip total divided by the number of travellers, after each expense has already been scaled — shared costs like a trip-total flight or a per-night room stay fixed while per-person and per-person-per-day lines multiply. So adding a traveller raises the total but spreads the fixed lines further, which is exactly the trade-off the per-person figure exposes.",
    ],
  ],
};

export default seo;
