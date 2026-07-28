const seo = {
  intro:
    "Stair Climbing Tracker converts the stair steps you climbed into vertical elevation gain, Fitbit-style floors and an energy cost, using the definition every major tracker shares: one floor equals 10 feet (3.048 m) of climb. Calories come from physics rather than a black-box algorithm — body mass times gravity times height, divided by the roughly 23% mechanical efficiency of stair ascent. It suits anyone using stairs as deliberate exercise and wanting a figure they can check by hand.",
  useCases: [
    "Log the office stairwell twice a day and see whether it clears a 10-floor daily target.",
    "Compare the calorie cost of 200 stair steps against a 20-minute walk before choosing a lunchtime workout.",
    "Check the MET intensity of your stair session to see whether it counts as vigorous activity under the WHO 150-minute guideline.",
    "Work out how many stair steps a building's flight actually represents when the riser is a steep 19 cm instead of the usual 17.8 cm.",
  ],
  benefits: [
    ["Physics, not guesswork", "Energy comes from mass x gravity x height at 23% efficiency, so every figure is reproducible."],
    ["Matches your tracker", "Uses the same 10-foot-per-floor rule Fitbit and Apple Health apply, so counts line up."],
    ["Intensity in METs", "Adds a MET value and a light/moderate/vigorous band when you enter the session duration."],
  ],
  faqs: [
    [
      "How many stairs is one flight or floor?",
      "Trackers count one floor as 10 feet (3.048 m) of elevation gain, which is about 17 steps on a standard 7-inch (17.8 cm) riser. Buildings vary, so a tall lobby floor can be two tracker floors and a shallow half-landing may be less than one.",
    ],
    [
      "How many calories does climbing stairs burn?",
      "Roughly 0.71 kcal per metre climbed for a 70 kg adult, so about 2.2 kcal per 10-foot floor and 22 kcal for 10 floors. The figure scales directly with body weight: someone at 90 kg burns about 29% more for the same climb.",
    ],
    [
      "Does walking down stairs burn calories too?",
      "Yes, but far less — descending is eccentric muscle work and costs about one third of the energy of climbing the same height. Tick the descent box to add it, and expect roughly 0.24 kcal per metre descended at 70 kg.",
    ],
    [
      "Is stair climbing vigorous exercise?",
      "Usually yes: continuous stair climbing typically lands between 6 and 9 METs, above the 6 MET vigorous-intensity threshold used by ACSM and the Compendium of Physical Activities. Vigorous minutes count double toward the WHO target of 150 moderate minutes a week. This is general information, not medical advice — check with a clinician if you have joint or heart conditions.",
    ],
  ],
};

export default seo;
