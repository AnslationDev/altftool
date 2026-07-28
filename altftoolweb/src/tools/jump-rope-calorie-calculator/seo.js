const seo = {
  intro:
    "This calculator estimates skipping calories using the ACSM energy equation, kcal per minute = METs x 3.5 x body weight in kg / 200, with MET values taken from the 2011 Compendium of Physical Activities: 8.8 METs below 100 skips a minute, 11.8 at 100-120 and 12.3 at 120-160. Because almost nobody skips continuously, it also takes your work and rest interval and blends the working intensity with a 1.5 MET standing rest, so a 20-minute session at 60 seconds on and 30 seconds off is costed as the 13 minutes of rope time it really is.",
  useCases: [
    "Cost a boxing-style warm-up of three-minute rounds with one-minute rests before logging it in a food diary.",
    "Compare a 10-minute continuous effort with a 20-minute interval session at the same skip rate.",
    "Work out how many skips it takes to burn 100 kcal at your body weight.",
    "Decide whether to raise the skip rate or extend the work interval to add calories to a session.",
  ],
  benefits: [
    [
      "Interval-aware",
      "Splits the session into rope time and rest time instead of pretending you skipped for the whole block.",
    ],
    [
      "Compendium MET values",
      "Uses the published rope-jumping MET bands rather than a single average figure.",
    ],
    [
      "Gross and net",
      "Reports the exercise cost separately from the resting calories you would have burned anyway.",
    ],
  ],
  faqs: [
    [
      "How many calories does 15 minutes of jump rope burn?",
      "About 220 kcal for a 70 kg person skipping continuously at 120 skips a minute, which works out at roughly 14.7 kcal a minute. With 60 seconds on and 30 seconds off, the same 15 minutes costs about 156 kcal because only 10 minutes are actual rope time.",
    ],
    [
      "Is jumping rope better than running for burning calories?",
      "Minute for minute they are close: skipping at 120 skips a minute is about 12 METs, similar to running at roughly 10 km/h. Skipping wins on convenience and needs no space, while running is easier to sustain for long durations, so the higher total usually goes to whichever you can keep doing.",
    ],
    [
      "How many skips burn 100 calories?",
      "Roughly 820 skips for a 70 kg person at 120 skips a minute, since that pace burns about 14.7 kcal a minute and covers 120 skips in that time. A lighter person needs more skips and a heavier person fewer, because energy cost scales almost directly with body mass.",
    ],
    [
      "Do double unders burn more calories than single unders?",
      "Per skip, yes — each jump is higher and the effort is greater — but per minute the difference is smaller than it feels, because double unders are usually done in short bursts with more rest. The honest way to account for it is to enter the shorter work interval and the longer rest you actually used.",
    ],
  ],
};

export default seo;
