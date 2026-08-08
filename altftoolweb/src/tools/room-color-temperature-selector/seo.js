const seo = {
  title: "Room Color Temperature: Kelvin, CRI and Lumens",
  metaDescription:
    "Pick a room and mood to get a kelvin target, minimum CRI and an EN 12464-1 lux level, converted to lamp lumens and watts for your room size.",
  steps: [
    "Choose Room and Mood, then enter Room length (m) and Room width (m).",
    "Set \"Lighting the…\" to the whole room or a task area, and adjust Lumens per fitting, Utilisation factor, Maintenance factor and LED efficacy.",
    "Read the recommended kelvin with its colour swatch, plus Illuminance target, Lamp lumens needed, Fittings and LED load, then press Copy result.",
  ],
  intro:
    "This selector recommends a light colour temperature in kelvin, a minimum CRI and an illuminance target for each room, then converts that target into the lamp lumens and wattage a room your size actually needs. Colour temperature follows the conventional bands — 2200–3000 K where people relax, 4000–5000 K where they work — shifted by the mood you choose, while light levels follow EN 12464-1 and the equivalent IES figures, such as 500 lux for writing and typing and 300 lux for general kitchen work. Lumens come from lux × area ÷ (utilisation factor × maintenance factor), so light that never reaches the working plane is accounted for.",
  useCases: [
    "Choosing between 2700 K and 4000 K downlights for an open kitchen and dining space without the two zones clashing",
    "Working out how many 800 lumen lamps a 4.5 × 3.5 m living room needs to reach a comfortable ambient level",
    "Specifying 5000 K at CRI 95 for a craft or art space where colour has to be judged accurately",
  ],
  benefits: [
    ["Kelvin and lux together", "Colour temperature only works at the right light level, so both are recommended from the same room profile."],
    ["Real lumen maths", "Utilisation and maintenance factors are applied, not just lux × area, so the fitting count is realistic."],
    ["Colour preview", "Every temperature is shown as a swatch derived from the Planckian locus, so warm and cool are visible rather than abstract."],
  ],
  faqs: [
    [
      "What colour temperature is best for a living room?",
      "2700 K to 3000 K — warm white — which matches the incandescent light people associate with relaxing at home. Anything above about 4000 K reads as clinical in a room lit to 100–300 lux, which is the usual domestic ambient level.",
    ],
    [
      "Should a kitchen use warm or cool white light?",
      "3000 K to 4000 K works best: warm enough not to feel like an office, neutral enough to see food and knife work clearly. Aim for around 300 lux of general light and 500 lux on the worktop, with CRI 85 or better so ingredients look their real colour.",
    ],
    [
      "How many lumens do I need per square metre?",
      "It depends on the lux target: at 300 lux with a 0.6 utilisation factor and 0.8 maintenance factor you need about 625 lamp lumens per square metre, and at 100 lux about 208. Multiply by the floor area, then divide by the output of one fitting to get the number of lamps.",
    ],
    [
      "What is the Kruithof effect and why does it matter at home?",
      "It is the observation that warm light looks pleasant when it is dim while cool light only looks natural when it is bright, so a 5000 K lamp dimmed to a low level reads as gloomy and a 2200 K lamp at high output reads as oppressively yellow. Match the colour temperature to the light level you actually plan to run, and use warm-dim lamps if you dim a room deeply in the evening.",
    ],
  ],
};

export default seo;
