const seo = {
  intro:
    "UV Safety Window pulls the hourly UV index forecast for a set of coordinates from the Open-Meteo forecast API and lists only the hours where the UV index is 2 or below — the WHO 'Low' exposure band — across the next three days. Each row shows the local hour, the forecast UV index and the clear-sky UV index for the same hour, so you can see how much of the low reading depends on expected cloud cover. It is for people planning outdoor time around sun exposure who would rather read the actual hourly forecast than guess from the time of day.",
  useCases: [
    "Planning a long run or a walk with a baby and wanting the hours in the next three days when UV is forecast at 2 or below.",
    "A gardener or field worker deciding which morning and evening blocks to schedule outdoor work in during a hot week.",
    "Someone on a photosensitising medication who has been told to limit sun exposure and wants to see which hours the forecast currently puts in the low band.",
  ],
  benefits: [
    [
      "Filters instead of charting",
      "Rather than a full 72-hour UV curve to interpret, it returns only the qualifying hours — up to 48 of them — so the answer is a list of times, not a graph.",
    ],
    [
      "Shows the clear-sky value beside the forecast",
      "When the forecast UV is low but the clear-sky figure for the same hour is high, the low reading is coming from expected cloud, which can break before you go out.",
    ],
    [
      "Works from exact coordinates",
      "You can type a latitude and longitude or take them from the device, and the API returns times in the local timezone for that point, not yours.",
    ],
  ],
  faqs: [
    [
      "What UV index counts as safe?",
      "This tool uses the WHO 'Low' band, UV index 0–2, as its threshold. The standard bands are 0–2 low, 3–5 moderate, 6–7 high, 8–10 very high and 11+ extreme; sun protection is generally advised from 3 upwards, though low does not mean no risk.",
    ],
    [
      "How far ahead does the forecast go?",
      "Three days. It requests hourly uv_index and uv_index_clear_sky for a 3-day forecast window and lists the first 48 hours that meet the threshold, so a period of persistently high UV can return few rows or none.",
    ],
    [
      "Why does a low-UV hour still need sun protection?",
      "Because the index describes the forecast intensity, not your personal risk. Skin type, medication, altitude, reflection off snow, water or sand, and how long you stay out all change how much exposure you accumulate — treat this as informational and speak to a doctor or dermatologist about your own protection needs.",
    ],
    [
      "Where does the UV data come from?",
      "The Open-Meteo forecast API, queried live with your coordinates and timezone=auto. Each result is stamped with the time it was fetched, and coverage, refresh frequency and accuracy are whatever that provider offers.",
    ],
  ],
};

export default seo;
