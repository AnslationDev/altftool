const seo = {
  intro:
    "Perfect Egg Timer works out how long to cook a boiled egg by taking a base time for the yolk you want — 6:00 soft, 7:00 jammy, 8:00 medium, 10:00 hard, 12:00 very hard — and adjusting it for egg size, whether the egg came out of the fridge, boiling versus steaming, and your altitude. The base times assume a large egg, fridge cold, lowered into already-boiling water at sea level, and the running countdown uses a fixed finish timestamp so it stays accurate in a background tab. It shows every adjustment as a separate line so you can see exactly where the minutes came from.",
  useCases: [
    "You want ramen-style jammy eggs and need to know whether your XL eggs straight from the fridge change the 7-minute rule",
    "You have moved to a city at 2,200 m and your usual boiled-egg timing now comes out underdone",
    "You switched to steaming because the eggs peel better, and need the timing corrected for the slower heat transfer",
  ],
  benefits: [
    ["Every adjustment itemised", "The breakdown lists base time, size, starting temperature, method and altitude separately, then totals them."],
    ["Drift-free countdown", "The timer stores an absolute end time rather than counting ticks, so backgrounding the tab does not slow it down."],
    ["Audible finish and ice-bath prompt", "A three-beep tone fires at zero with a reminder to chill immediately, because carry-over heat is what turns a jammy yolk chalky."],
  ],
  faqs: [
    [
      "How long do you boil an egg for a runny yolk?",
      "Six minutes for a large, fridge-cold egg lowered into water already at a rolling boil. A jammy, custardy centre takes 7 minutes, medium 8, hard 10 and very hard 12 — then adjust for your egg size and method.",
    ],
    [
      "Does egg size change the boiling time?",
      "Yes. Working from a large egg (about 60 g) as the baseline, a medium egg needs 30 seconds less, a small egg a full minute less, and an XL egg 30 seconds more. Room-temperature eggs also come off 30 seconds because they start closer to setting temperature.",
    ],
    [
      "How do I adjust egg cooking time for altitude?",
      "Add roughly 30 seconds per 500 m above 1,000 m. Below 1,000 m no correction is applied; water boils at a lower temperature as you climb, so the same time delivers less cooking. At 2,500 m that works out to about 90 extra seconds.",
    ],
    [
      "Why do my boiled eggs peel badly?",
      "Usually because they are too fresh or were not chilled fast enough. Eggs a week or two old have a higher internal pH and release from the membrane far more easily, and 10 minutes in iced water contracts the egg away from the shell. Steaming also sets the outer white before it bonds to the membrane, which is why this tool adds 30 seconds for the steam method.",
    ],
  ],
};

export default seo;
