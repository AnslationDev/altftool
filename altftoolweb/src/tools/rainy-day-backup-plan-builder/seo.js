const seo = {
  intro:
    "Turns a set of daily rain percentages into the number that actually matters for a trip: the chance of losing at least one outdoor day, calculated as one minus the product of each day staying dry. Each day's risk is the forecast probability scaled by how badly rain ruins that particular plan — a covered market survives a shower, a boat trip does not — and the tool then assigns your indoor alternatives to the riskiest days and flags day swaps that move an outdoor plan off the wettest slot.",
  useCases: [
    "Checking before a monsoon-season trip whether a 30% forecast every day is actually as harmless as it looks",
    "Deciding which of five outdoor days to protect with a booked indoor alternative when you only have two",
    "Rearranging an itinerary so the boat trip sits on the driest day and the museum day absorbs the wet one",
  ],
  benefits: [
    ["Compounds risk properly", "Six days at 30% is an 88% chance of losing one, not a 30% chance — the tool does that multiplication for you."],
    ["Weights by what rain ruins", "A market walk and a hike at the same forecast carry very different risk, and are scored differently."],
    ["Suggests the swap, not just the worry", "Names which activity to move to which day and how much expected loss it saves."],
  ],
  faqs: [
    [
      "What does a 40% chance of rain actually mean?",
      "It means a 40% chance that at least 0.01 inch (0.25 mm) of rain falls at any given point in the forecast area during the period. The US National Weather Service calculates it as confidence multiplied by area — 80% confident that rain hits half the area also gives 40%. It does not mean it will rain for 40% of the day or over 40% of the time.",
    ],
    [
      "If every day of my trip shows 30% rain, how likely am I to get wet?",
      "Over six days, about 88%, and you would expect to lose roughly 1.8 days on average. The chance of every day staying dry is 0.7 to the power of six, which is 12%. This assumes days are independent; a stalled weather system correlates them, so the real spread is narrower than the arithmetic suggests.",
    ],
    [
      "How many backup plans does a trip need?",
      "One properly researched indoor alternative for each day whose risk crosses about 30%, and at least one that does not need advance booking. A backup you can only book two weeks ahead is not a backup — the whole point is that you decide on the morning, looking out of the window.",
    ],
    [
      "Should I rearrange my itinerary based on the forecast?",
      "Only inside about five days, where forecasts are reliable enough to act on. Beyond that, build flexibility instead: keep the weather-critical activity unbooked, or book something with free cancellation. Moving an outdoor plan from an 80% day to a 10% day is one of the largest single improvements available to a trip plan, and it costs nothing.",
    ],
  ],
};

export default seo;
