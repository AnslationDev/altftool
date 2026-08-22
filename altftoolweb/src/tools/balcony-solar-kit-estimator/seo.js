const seo = {
  title: "Balcony Solar Kit Estimator: Vertical Tilt Loss",
  steps: [
    "Under 'The kit' enter Number of panels, 'Panel rating (Wp)', 'Micro-inverter AC limit (W)' and 'Installed kit cost (INR)'.",
    "Under 'Where it hangs' tap a mounting preset — 'Flat against the railing (90°)', 'Angled out on a bracket (45°)', 'Well-angled bracket (30°)' or 'Laid nearly flat on the floor (10°)' — then set 'Which way the balcony faces', 'Latitude, degrees (drop the N or S)', 'Peak sun hours a day', 'Extra shading loss (%)', 'Used in the home immediately (%)' and 'Your tariff (INR per unit)'.",
    "Read 'Estimated output a year' in kWh with the daily figure and monthly saving underneath, then 'Yield vs a well-aimed array' alongside the best tilt for your latitude, Specific yield, 'Saving a year' and 'Simple payback'. 'Copy result' copies the estimate.",
  ],
  intro:
    "This estimator models what a small plug-in balcony solar kit produces once its panels hang vertically off a railing instead of sitting on a well-aimed roof. The yield penalty is geometry, not guesswork: beam radiation scales with the cosine of the angle between the panel and the sun's noon position, so a vertical panel at 19° latitude collects only cos(71°) of the beam, while diffuse sky light scales with the sky view factor (1 + cos tilt) ÷ 2. The result is annual kWh, self-consumption savings and a simple payback.",
  useCases: [
    "Deciding whether a two-panel 800 W kit on a south-facing balcony is worth its price at your tariff.",
    "Testing what a tilt bracket buys you, by comparing a vertical 90° mount against 45° or 30°.",
    "Comparing a north-facing balcony against a south-facing one before choosing which flat to fit it to.",
  ],
  benefits: [
    ["Models tilt properly", "Beam and diffuse components handled separately, so vertical mounting is penalised realistically."],
    ["Latitude-aware", "The vertical penalty is worse near the equator, and the model reflects that."],
    ["Self-consumption first", "Values the units you actually use at your tariff, and exports at the feed-in rate you enter."],
  ],
  faqs: [
    [
      "How much does a balcony solar kit generate in a year?",
      "A two-panel 880 Wp kit hanging vertically on a south-facing balcony at about 19° latitude, with 5.5 peak sun hours and 10% shading, works out near 500 kWh a year — roughly 40% of what the same panels would make well-aimed on a roof. Angle the panels out to 30-45° on a bracket and that rises steeply.",
    ],
    [
      "Why do vertical balcony panels lose so much output?",
      "Because the sun is high at midday. At solar noon the angle between a vertical panel and the sun is roughly 90° minus your latitude plus the sun's declination, so near the equator a vertical panel faces the sun almost edge-on and collects only a fraction of the direct beam. It also sees half the sky instead of nearly all of it, halving the diffuse contribution.",
    ],
    [
      "What tilt is best for solar panels?",
      "For a fixed year-round array, a tilt roughly equal to your latitude facing the equator — about 19° in Mumbai, 28° in Delhi. On a balcony you rarely get that, but any bracket that moves the panels from 90° towards 30-45° recovers a large part of the loss, which is usually the cheapest upgrade available.",
    ],
    [
      "Can I just plug a solar kit into a socket in India?",
      "Not without approval. Unlike Germany, where plug-in balcony systems up to 800 W are expressly allowed, Indian grid-connectivity rules generally require an application to your DISCOM and an approved net-metering or behind-the-meter arrangement even for very small systems, and your housing society may have its own rules about railings and façades. Check with your DISCOM before buying.",
    ],
  ],
};

export default seo;
