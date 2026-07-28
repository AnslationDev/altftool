const seo = {
  intro:
    "The Stair Running Calorie Calculator estimates the energy cost of a stair session from the number of flights, the riser height and your body weight, counting the climb and the way back down separately. Calories come from the ACSM metabolic equation kcal/min = MET x 3.5 x body mass in kg / 200, with 2011 Compendium of Physical Activities values of 15.0 METs for running up stairs, 8.8 for a fast walk up, 4.0 for a slow walk up and 3.5 for walking back down. It also shows the pure vertical work, m x g x h, as an independent physics cross-check.",
  useCases: [
    "Score a stadium or tower stair workout of 10 flights repeated to failure instead of guessing at a treadmill equivalent.",
    "Compare running up 20 flights and taking the lift down against walking both ways for the same total time.",
    "Work out how many flights of your office stairwell add up to a 300 kcal target.",
    "See how much of a climb is genuine vertical work once the riser height of your building is entered.",
  ],
  benefits: [
    [
      "Ascent and descent split out",
      "Walking down stairs is only 3.5 METs, so counting it at climbing intensity would badly overstate a session.",
    ],
    [
      "Riser height matters",
      "A 20 cm stadium step lifts you far more per stride than a 15 cm home step, and the vertical-work figure reflects it.",
    ],
    [
      "Physics cross-check",
      "The m x g x h calculation shows how much of the estimate is real lifting work rather than modelling assumptions.",
    ],
  ],
  faqs: [
    [
      "How many calories does climbing one flight of stairs burn?",
      "For a 70 kg person running up a 13-step flight, roughly 2.4 kcal per flight at 15 METs and a cadence of 100 steps per minute. Walking the same flight at a slow pace is closer to 0.6 kcal because the MET value drops from 15.0 to 4.0.",
    ],
    [
      "Is running stairs better than running on flat ground?",
      "Per minute, yes — running up stairs is rated 15.0 METs against about 9.8 METs for running at 6 mph on the flat, because you are lifting your body mass vertically as well as moving it forward. The trade-off is that few people can sustain stair running for long, so total session calories may still favour a longer flat run.",
    ],
    [
      "How many steps are in a flight of stairs?",
      "Most residential and office flights have 12 to 16 steps, with 13 a common average, and a single storey is often two flights with a landing between them. Count your own stairwell once and enter the real number for a much more accurate result.",
    ],
    [
      "Why is the vertical-work number lower than the MET calories?",
      "The m x g x h calculation only counts the energy that ends up as height gained; at the roughly 23% gross efficiency measured for stair climbing it accounts for about two-thirds of the MET-based figure. The rest goes into arm swing, balance, the horizontal part of each stride and heat. Both are estimates, not measurements — see a clinician before starting high-intensity stair work if you have a heart or joint condition.",
    ],
  ],
};

export default seo;
