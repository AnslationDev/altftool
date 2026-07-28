const seo = {
  intro:
    "The Skipping Rope Outdoor Calorie Tool estimates the energy cost of an interval skipping session by scoring the work rounds and the recovery gaps separately, then adding them. It uses the ACSM metabolic equation kcal/min = MET x 3.5 x body mass in kg / 200, with rope-jumping MET values taken from the 2011 Compendium of Physical Activities: 8.8 METs under 100 skips per minute, 11.8 METs at 100-120, and 12.3 METs at 120-160. Built for anyone doing timed rounds outdoors — park sessions, boxing-style circuits, or a rope block bolted onto a run.",
  useCases: [
    "Work out what a 10 x 60 seconds on, 30 seconds off rope session in the park actually costs you in calories.",
    "Compare a dense 20 x 30/30 circuit against 5 long 3-minute rounds to see which burns more for the same total time outdoors.",
    "Find how many minutes of skipping at your usual pace it takes to reach a 300 kcal target.",
    "Check whether standing, stretching or walking during the rest gaps meaningfully changes the session total.",
  ],
  benefits: [
    [
      "Rounds and rest counted separately",
      "Recovery gaps are scored at their own MET value instead of being treated as skipping time.",
    ],
    [
      "Published MET values",
      "Each skip-rate band maps to a specific 2011 Compendium row rather than a single generic jump-rope number.",
    ],
    [
      "Gross and net calories",
      "Net figures subtract the calories you would have burned at rest, which is the number to use for energy balance.",
    ],
  ],
  faqs: [
    [
      "How many calories does 10 minutes of skipping burn?",
      "For a 70 kg person skipping at 120 skips per minute, 10 minutes of actual rope time works out to roughly 150 kcal, using the 12.3 MET fast-pace value. Lighter bodies burn less for the same time because the MET formula scales directly with body mass.",
    ],
    [
      "Is skipping better than running for burning calories?",
      "At 120-160 skips per minute skipping is rated 12.3 METs, which sits close to running at about 8 mph (12.8 METs), so per minute of work they are comparable. The practical difference is that most people cannot sustain a fast rope pace continuously, which is why skipping is usually done in intervals.",
    ],
    [
      "Should I count the rest periods in my session calories?",
      "Yes, but at a much lower rate. Standing recovery is about 1.3 METs, light stretching about 2.3 and slow walking about 2.8, so a 30-second gap contributes only a small fraction of what a work round does — this tool adds them at their own value rather than ignoring them.",
    ],
    [
      "What is the difference between gross and net calories here?",
      "Gross calories are the total energy used during the session; net calories subtract the roughly 1 MET you would have burned just resting for the same length of time. Net is the more honest number when you are tracking a calorie deficit. These are population-average estimates and are not a substitute for advice from a clinician or a qualified coach.",
    ],
  ],
};

export default seo;
