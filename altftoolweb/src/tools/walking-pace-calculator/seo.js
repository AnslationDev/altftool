const seo = {
  title: "Walking Pace Calculator: Min/km, Min/mile & METs",
  metaDescription:
    "Enter distance and time to get pace per km and mile, speed, and the MET intensity from the Compendium scale, plus projected 5K to marathon finish times.",
  steps: [
    "Enter 'Distance walked' in Kilometres or Miles and the 'Time taken' in Hours, Minutes and Seconds.",
    "Optionally add 'Body weight (kg)' for the calorie estimate and 'Steps taken' for cadence and stride length.",
    "Read 'Pace per kilometre' with min/mile, speed, MET intensity and race projections, then click 'Copy result'.",
  ],
  intro:
    "Walking Pace Calculator divides your elapsed time by the distance covered to give pace in minutes per kilometre and minutes per mile, plus speed in km/h and mph. It then places that speed on the Compendium of Physical Activities walking scale so you can see the MET value and whether the effort counts as moderate or vigorous, and projects finish times for 5 km, 10 km, a half marathon and a marathon. Built for walkers training for an event or checking that their daily walk is actually brisk.",
  useCases: [
    "Check whether your lunchtime loop clears the 3 mph (4.83 km/h) brisk-walking line that defines moderate intensity.",
    "Convert a treadmill readout in mph to minutes per kilometre before a road event.",
    "Project a realistic half-marathon walk finish time from a measured 5 km training walk.",
    "Work out cadence and stride length from a step count to see whether you are over-striding.",
  ],
  benefits: [
    ["Both units at once", "Minutes per kilometre and minutes per mile side by side, from a single entry."],
    ["Intensity you can cite", "MET values interpolated from the published Compendium walking table, not invented multipliers."],
    ["Race planning built in", "Split times for 1 km through marathon distance at the pace you just walked."],
  ],
  faqs: [
    [
      "What is a good walking pace per km?",
      "Around 10 to 12 minutes per kilometre (5 to 6 km/h) is a typical healthy adult walking pace, and anything at or under 12:26 per km hits the 4.83 km/h brisk threshold. Competitive walkers hold well under 8 minutes per kilometre.",
    ],
    [
      "How do I convert minutes per kilometre to minutes per mile?",
      "Multiply your per-kilometre pace by 1.609344. A 9:00 min/km pace is 14:29 per mile; a 10:00 min/km pace is 16:05 per mile.",
    ],
    [
      "How fast is brisk walking?",
      "US and UK physical-activity guidance treats about 3 mph (4.83 km/h, roughly 12:26 per km) as brisk, which is 3.5 METs — just over the 3.0 MET moderate-intensity line. A cadence near 100 steps per minute is the same benchmark expressed in steps.",
    ],
    [
      "How many calories does walking burn per kilometre?",
      "Roughly 50 to 65 kcal per kilometre for a 70 kg adult, rising with speed and body weight. The calculator uses kcal/min = MET x 3.5 x kg / 200, the standard ACSM conversion; treat it as an estimate rather than a measurement and speak to a clinician before big changes to activity.",
    ],
  ],
};

export default seo;
