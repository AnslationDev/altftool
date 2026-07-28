const seo = {
  intro:
    "The Kayaking Calorie Burn Calculator converts a paddle — distance, time on the water and water type — into an energy estimate using the ACSM equation kcal/min = MET x 3.5 x body mass in kg / 200. On flat water the boat speed you actually achieved selects the published 2011 Compendium of Physical Activities band: 2.8 METs below 4 mph, 5.8 METs at 4.0-5.9 mph and 12.5 METs above 6 mph. Sea touring and whitewater use their own Compendium rows (5.0 METs each) because speed is a poor proxy for effort in those conditions.",
  useCases: [
    "Log a two-hour flat-water session on a reservoir and see whether your pace counted as light or moderate effort.",
    "Compare a slow 8 km lake paddle against a short, hard whitewater run of the same duration.",
    "Work out how far you would need to paddle at your usual pace to burn 500 kcal.",
    "Check the per-kilometre energy cost of a sea kayak tour when planning food for a multi-day trip.",
  ],
  benefits: [
    [
      "Speed decides intensity",
      "Flat-water METs come from your measured boat speed instead of a single generic kayaking number.",
    ],
    [
      "Water type handled honestly",
      "Whitewater and sea kayaking use their own published rows rather than pretending speed reflects effort.",
    ],
    [
      "Per-km and per-hour figures",
      "Useful for trip planning and food packing, not just a single session total.",
    ],
  ],
  faqs: [
    [
      "How many calories does an hour of kayaking burn?",
      "For a 70 kg paddler at a moderate 5.0 MET intensity, about 368 kcal per hour. A relaxed flat-water paddle under 4 mph drops to roughly 206 kcal per hour at 2.8 METs, and competitive paddling at 12.5 METs rises to about 919 kcal per hour.",
    ],
    [
      "Is kayaking a good workout for weight loss?",
      "It is a solid moderate-intensity activity — around 5 METs for typical touring, which is comparable to a brisk walk — and it loads the back, shoulders and core rather than the legs. Because much of a recreational paddle is spent gliding, average intensity is usually lower than paddlers expect.",
    ],
    [
      "What is a normal kayaking speed?",
      "Recreational flat-water paddling typically averages 4-6 km/h (2.5-3.7 mph), touring sea kayaks often hold 6-8 km/h, and racing boats exceed 10 km/h. Entering your real distance and time is the most reliable way to know which band applies.",
    ],
    [
      "Does whitewater kayaking burn more calories than flat water?",
      "Not necessarily per hour. The Compendium lists whitewater kayaking at 5.0 METs, the same as moderate flat-water kayaking, because bursts of hard paddling are interspersed with drifting and scouting. These are population averages and informational only, not a substitute for advice from a clinician or coach.",
    ],
  ],
};

export default seo;
