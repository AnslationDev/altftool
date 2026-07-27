const seo = {
  intro:
    "The Car Battery Replacement Planner estimates how much service life is left in a starter battery by taking its typical life for the construction fitted — flooded, maintenance-free, EFB or AGM — adjusting it for heat and charging pattern, then subtracting a penalty for the failure symptoms you are already seeing. It is for drivers deciding whether to replace a battery now or wait, especially before a long trip or a cold season. The two adjustments that matter most are sustained under-bonnet heat and habitual short trips, because both leave a lead-acid battery permanently undercharged.",
  useCases: [
    "Deciding whether a three-year-old battery will survive one more winter before a long highway trip",
    "Working out why a start-stop car keeps eating batteries every 18 months",
    "Checking a used car's battery age against the symptoms the seller dismissed as normal",
  ],
  benefits: [
    ["Type-aware baseline", "Uses a separate typical life for flooded, MF, EFB and AGM instead of one generic number."],
    ["Symptoms count", "Jump starts, slow cranking and warning lights reduce the estimate, not just the calendar."],
    ["Actionable output", "Returns a clear verdict plus the specific habit changes that would extend the battery's life."],
  ],
  faqs: [
    [
      "How long does a car battery last?",
      "Typically 3 to 5 years, varying by construction: around 36 months for a conventional flooded battery, 48 months for a sealed maintenance-free one, and 54 to 60 months for EFB and AGM batteries fitted to start-stop cars. Sustained heat is the biggest single reducer — lead-acid life roughly halves for every 10 to 15 °C of extra sustained temperature.",
    ],
    [
      "What are the signs a car battery is failing?",
      "The clearest sign is slow cranking that is worst first thing in the morning, followed by needing a jump start, headlights dimming at idle, the battery warning light appearing, and the clock or radio presets resetting. A swollen or bulging case is different — that battery is gassing internally and should be replaced immediately, whatever its age.",
    ],
    [
      "Why does my battery keep dying on short trips?",
      "Starting the engine takes a large slug of charge, and a drive of under 15 minutes does not give the alternator enough time to put it back. Repeating that daily leaves the battery permanently at a partial state of charge, which sulphates the plates and permanently reduces capacity. One 30-minute continuous run a week, or a monthly session on a smart charger, largely prevents it.",
    ],
    [
      "Can I fit a normal battery in a start-stop car?",
      "It will physically work but will fail early, often within half the normal life. Start-stop systems cycle the battery constantly at a partial state of charge, which is exactly what EFB and AGM constructions are designed for and what a plain flooded battery is not. Many cars also need the new battery registered to the energy-management system, so have it fitted by someone with the right tool.",
    ],
  ],
};

export default seo;
