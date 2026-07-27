const seo = {
  intro:
    "The Golden Hour Time Estimator calculates the exact clock times when the Sun sits between 6° above and 4° below the horizon — the golden hour — plus blue hour, sunrise, sunset, solar noon and all three twilights, for any date, latitude and longitude. It uses the NOAA Solar Calculator equations, which are accurate to about one minute between 72°N and 72°S, and shows the Sun's elevation across the whole day so you can see how quickly the light will change. It is made for photographers, videographers and drone pilots planning a shoot.",
  useCases: [
    "Find the exact minute evening golden hour starts in Mumbai so a portrait session begins with the right light.",
    "Compare how long golden hour lasts in London in December (about 1 h 27 min) against Delhi in July (about 49 min).",
    "Plan a blue-hour cityscape by reading when the Sun passes from 4° to 6° below the horizon.",
  ],
  benefits: [
    ["Astronomy, not guesswork", "NOAA equations, cross-checked against a full ephemeris to within a minute."],
    ["Every light window", "Golden hour, blue hour, and civil, nautical and astronomical twilight in one table."],
    ["Honest about the poles", "Above the Arctic and Antarctic circles it says the Sun never crosses, instead of inventing a time."],
  ],
  faqs: [
    [
      "What exactly is the golden hour?",
      "It is the period when the Sun's centre is between 6° above and 4° below the horizon, giving warm, low-contrast light. It is rarely a full hour: near the equator it can be under 50 minutes, while in London in midwinter it stretches to about 1 hour 27 minutes because the Sun climbs at a shallower angle.",
    ],
    [
      "What is blue hour and when does it happen?",
      "Blue hour is when the Sun is between 4° and 6° below the horizon — after golden hour in the evening and before it in the morning. It typically lasts 20-40 minutes at mid latitudes and ends at civil twilight, the -6° mark.",
    ],
    [
      "How long is golden hour where I am?",
      "It depends on latitude and season, because the duration is set by how steeply the Sun crosses the horizon. Near the equator expect roughly 45-60 minutes; at 51°N in December it is nearly 90 minutes; inside the polar circles in midsummer the Sun may never drop to 4° below the horizon at all.",
    ],
    [
      "Why do these times differ slightly from my weather app?",
      "Most apps quote sunrise and sunset for a flat sea-level horizon with 0.833° of refraction and solar radius applied, which is what this tool does too, so times normally agree within a minute. Real terrain — hills, tall buildings, or standing on a beach versus a rooftop — moves the visible sunset by several minutes.",
    ],
  ],
};

export default seo;
