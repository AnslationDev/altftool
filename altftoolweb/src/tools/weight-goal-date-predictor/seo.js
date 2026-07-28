const seo = {
  intro:
    "The Weight Goal Date Predictor estimates the calendar date you reach a target weight by simulating your energy balance one week at a time, recalculating maintenance calories from the Mifflin-St Jeor equation as your weight changes. It uses roughly 7,700 kcal per kilogram of tissue (3,500 kcal per pound), so the projected rate slows as you get lighter instead of assuming a flat weekly loss. It also reports the weight your current intake would eventually settle at, which is the honest answer to 'will this actually get me there?'",
  useCases: [
    "Find out whether a 12-week target is realistic at your current intake before you commit to it publicly.",
    "Compare a 1,800 kcal plan against a 2,000 kcal plan and see how many extra weeks the gentler deficit costs.",
    "See the maintenance calories you will need at your goal weight, so the plan does not end with an unplanned regain.",
    "Work out the intake needed for a lean bulk by setting a target above your current weight and adjusting until the date fits.",
  ],
  benefits: [
    ["Adaptive, not linear", "Maintenance is recomputed every simulated week, so the projection does not overshoot the way deficit-divided-by-7700 does."],
    ["Shows the settling point", "Reports the weight at which your intake becomes maintenance, so an unreachable target is flagged instead of silently extrapolated."],
    ["Safety thresholds built in", "Warns when intake drops under the 1,200 kcal (women) / 1,500 kcal (men) unsupervised floor or when weekly loss exceeds 1% of body weight."],
  ],
  faqs: [
    [
      "How long does it take to lose 10 kg?",
      "At a 500 kcal daily deficit, roughly 7,700 kcal per kilogram means about 15 weeks in a simple linear model — but expenditure falls as you get lighter, so the realistic figure is nearer 17-20 weeks. This tool simulates that slowdown week by week rather than dividing once.",
    ],
    [
      "Is 7,700 calories per kilogram accurate?",
      "It is a useful approximation, not a law. The 3,500 kcal-per-pound figure comes from the energy density of adipose tissue, but real weight change includes water and some lean mass, and the body partially adapts its expenditure. Expect the projected date to be indicative within a few weeks, not exact.",
    ],
    [
      "What is a safe rate of weight loss per week?",
      "Around 0.5-1 kg (1-2 lb) per week, or 0.5-1% of body weight, is the range most guidance treats as sustainable. Faster loss increases the share that comes from lean mass and is harder to maintain; this tool flags a first week above 1% of body weight.",
    ],
    [
      "Why does my weight stall even though I am still eating in a deficit?",
      "Because maintenance calories fall with body weight — every kilogram lost cuts roughly 10 kcal from BMR before the activity multiplier. Eventually your intake equals your new maintenance and the deficit disappears. The 'weight this intake settles at' figure shows exactly where that happens for your numbers.",
    ],
  ],
};

export default seo;
