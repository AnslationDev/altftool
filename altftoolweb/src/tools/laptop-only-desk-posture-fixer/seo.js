const seo = {
  intro:
    "This calculator works out how many centimetres a laptop has to be raised so the top of its screen sits about 5 cm below your seated eye height — the position ANSI/HFES 100 and the OSHA computer-workstation guidance both recommend. It derives your seated eye and elbow heights from your body height and seat height using 50th-percentile adult proportions, converts the screen diagonal and aspect ratio into a real vertical screen height, and reports the downward gaze angle before and after the fix. It is aimed at anyone whose laptop is their only display and who wants numbers rather than 'sit up straight'.",
  useCases: [
    "Find out how tall a laptop stand you actually need before buying one, instead of picking a random riser height.",
    "Check whether stacking books under the laptop is enough, or whether you also need a separate keyboard and mouse.",
    "See how much of your neck strain comes from the screen height and how much from a desk that is too high for your chair.",
    "Set up a hotel or hot-desk workstation quickly by measuring the desk and seat once and reading off the adjustments.",
  ],
  benefits: [
    [
      "One measurement, three fixes",
      "Screen riser height, chair adjustment and footrest height all fall out of the same set of measurements.",
    ],
    [
      "Shows the neck angle",
      "Reports the downward gaze angle now and after the change, so the benefit is a number rather than a feeling.",
    ],
    [
      "Real screen geometry",
      "Vertical screen height is computed from the diagonal and aspect ratio, so a 14-inch 16:10 panel is not treated like a 14-inch 16:9 one.",
    ],
  ],
  faqs: [
    [
      "How high should I raise my laptop?",
      "Raise it until the top of the screen is at, or up to about 5 cm below, your seated eye height. For someone 170 cm tall on a 45 cm seat at a 74 cm desk with a 14-inch 16:10 screen, that works out to roughly 29 cm of riser — which is why a laptop stand alone is rarely enough without a separate keyboard.",
    ],
    [
      "Do I need an external keyboard with a laptop stand?",
      "Yes, in almost every case. Once the laptop comes up more than a couple of centimetres, its built-in keyboard is above your elbow height, so your shoulders lift and your wrists extend. A separate keyboard and mouse let the screen and the hands sit at their own correct heights.",
    ],
    [
      "How far should a laptop screen be from my eyes?",
      "About 50 to 70 cm for a 13 to 16-inch screen. ANSI/HFES 100 puts the comfortable monitor range at 50 to 100 cm, but small laptop text pushes people to lean in at the far end of that band; increase the system text size rather than moving the screen closer.",
    ],
    [
      "Does looking down at a laptop really strain the neck?",
      "The further your head tilts forward, the more load your neck muscles hold. Hansraj's 2014 measurements put the effective load at about 5 kg with the head neutral, 12 kg at 15 degrees, 18 kg at 30 degrees and 27 kg at 60 degrees. Raising the screen reduces the tilt angle, which is the single most effective change for laptop-only work.",
    ],
  ],
};

export default seo;
