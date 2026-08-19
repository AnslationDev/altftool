const seo = {
  title: "Sunny 16 Calculator — Aperture & Shutter Pairs",
  metaDescription:
    "Pick the lighting condition and ISO to get exact and nearest full-stop aperture and shutter pairs from EV = log2(N²/t), plus equivalent exposures.",
  steps: [
    "Pick the Lighting condition from the list and enter your ISO (preset values offered, any number accepted).",
    "Choose 'Shutter from aperture' or 'Aperture from shutter' under Solve for, set the fixed value, and add exposure compensation in stops if needed.",
    "Read 'Set your camera to' — the nearest full-stop pair beside the exact figure and rounding error — plus the equivalent-exposures table; 'Copy result' copies it.",
  ],
  intro:
    "Sunny 16 Exposure Helper converts a described lighting condition and an ISO into a working aperture and shutter speed using the APEX definition EV = log2(N²/t), with EV shifted for sensitivity by log2(ISO/100). Bright sun sits at EV 15 for ISO 100, and each softer condition on the list is exactly one stop down from the one above it. It is aimed at film shooters, fully manual cameras and anyone whose meter has failed mid-shoot.",
  useCases: [
    "Shooting a fully manual film body with no working meter and needing a starting exposure in direct sun.",
    "Loading ISO 400 film on an overcast day and wanting the shutter speed for f/8 without guessing.",
    "Choosing an equivalent exposure that keeps the shutter at 1/250 s to freeze movement while the light stays the same.",
    "Sanity-checking a digital camera's meter reading when a bright sky or snow is fooling it.",
  ],
  benefits: [
    ["Real EV maths", "Values come from EV = log2(N²/t), not a memorised chart, so any ISO and aperture works."],
    ["Full-stop rounding shown", "You see both the exact figure and the nearest dial position, plus how far apart they are."],
    ["Equivalent exposure table", "Swap depth of field for motion blur without changing overall brightness."],
  ],
  faqs: [
    [
      "What is the Sunny 16 rule?",
      "On a clear, sunny day set the aperture to f/16 and the shutter to roughly 1 divided by the ISO. At ISO 100 that is f/16 at about 1/125 s, which is EV 15 — the exact figure is 1/128 s, and 1/125 is the nearest marked speed.",
    ],
    [
      "What aperture do I use on a cloudy day?",
      "Open up one stop per step of softer light while keeping the 1/ISO shutter: f/11 in slight overcast, f/8 in full overcast, f/5.6 in heavy overcast with no shadows, and f/4 in open shade. Each step is one stop, which is 1 EV.",
    ],
    [
      "How does ISO change the Sunny 16 settings?",
      "Each doubling of ISO adds one EV, so it buys you one stop — either a faster shutter or a smaller aperture. In bright sun at f/16, ISO 100 wants about 1/125 s while ISO 400 wants about 1/500 s.",
    ],
    [
      "Does Sunny 16 work with digital cameras?",
      "Yes, because it describes the light rather than the medium. Digital sensors have less highlight headroom than colour negative film, so many photographers expose a third to two thirds of a stop under the Sunny 16 value and check the histogram.",
    ],
  ],
};

export default seo;
