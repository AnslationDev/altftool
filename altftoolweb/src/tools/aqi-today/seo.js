const seo = {
  title: "AQI Today: 36 Indian Cities Ranked, Worst Air",
  metaDescription:
    "Live CPCB AQI for 36 cities, worst first, with the dominant pollutant, all six sub-indices and each city's band. Modelled data, not station readings.",
  steps: [
    "The board fetches current PM2.5, PM10, NO2, SO2, CO and O3 for 36 cities from Open-Meteo; narrow it with Find a city or the Zone list.",
    "Press Sub-indices on a row for each pollutant's concentration, its 24-hour or 8-hour averaging window, hours used and CPCB sub-index.",
    "Copy board writes the whole ranking as text; Refresh re-fetches, and any city whose request fails is marked unavailable instead of showing a stale figure.",
  ],
  intro:
    "AQI Today is a national air-quality board that ranks 36 Indian cities worst-first on the CPCB National Air Quality Index and shows, for each one, the dominant pollutant and all six sub-indices behind the headline number. Current PM2.5, PM10, NO₂, SO₂, CO and O₃ concentrations are fetched live in your browser from the Open-Meteo Air Quality API, averaged over the CPCB windows — 24 hours for the particulates, NO₂ and SO₂, 8 hours for CO and ozone — and converted with the CPCB 2014 sub-index formula Ip = ((IHi − ILo) ÷ (BPHi − BPLo)) × (Cp − BPLo) + ILo, the AQI being the worst of the six. It is for anyone comparing cities at a glance, and the concentrations are modelled grid values, not official CPCB station telemetry.",
  useCases: [
    "Compare 36 Indian cities on one screen and see which are above the CPCB Poor threshold of 201 right now",
    "Find out which pollutant is actually driving a city's AQI, since the headline figure reports only the worst sub-index and hides the other five",
    "Check the CPCB band and its published advisory text for a specific city before planning outdoor work or travel",
    "See how a summer ozone-driven AQI differs from a winter PM2.5-driven one, with both sets of sub-indices side by side",
  ],
  benefits: [
    [
      "Worst-first ranking, not an alphabetical list",
      "Cities are sorted by AQI descending with ties broken alphabetically, so the top row always answers 'where is the air worst'.",
    ],
    [
      "CPCB averaging windows, not spot readings",
      "PM2.5, PM10, NO₂ and SO₂ use a 24-hour rolling mean needing at least 16 valid hours; CO and O₃ use an 8-hour mean.",
    ],
    [
      "All six sub-indices exposed",
      "Every city opens to a table of concentration, averaging window, hours used and sub-index for each pollutant, so the dominant one is visible rather than inferred.",
    ],
    [
      "Honest about failure and provenance",
      "A city whose request fails is marked unavailable with the reason instead of showing a stale number, and the page states that concentrations are modelled rather than CPCB station data.",
    ],
  ],
  faqs: [
    [
      "How is the AQI calculated in India?",
      "Each pollutant's averaged concentration is converted to a sub-index by linear interpolation inside its CPCB breakpoint band using Ip = ((IHi − ILo) ÷ (BPHi − BPLo)) × (Cp − BPLo) + ILo, and the AQI is the highest of those sub-indices. For PM2.5 the breakpoints are 30, 60, 90, 120 and 250 µg/m³, so a 24-hour mean of 75 µg/m³ gives ((200 − 101) ÷ (90 − 60)) × (75 − 60) + 101 = 150.5, reported as 151. CPCB notified this method on 17 October 2014.",
    ],
    [
      "What AQI value is considered unhealthy in India?",
      "The CPCB bands are 0–50 Good, 51–100 Satisfactory, 101–200 Moderate, 201–300 Poor, 301–400 Very Poor and 401–500 Severe. CPCB's own advisory says Moderate 'may cause breathing discomfort to people with lung disease such as asthma', and Severe 'may cause respiratory effects even in healthy people'. Those are CPCB's general public-health descriptions, not personal medical advice.",
    ],
    [
      "Are these figures the official CPCB station readings?",
      "No. The concentrations come from the Open-Meteo Air Quality API, which serves CAMS-family modelled and reanalysis values on a grid, queried by city-centre coordinate. Only the index arithmetic is CPCB's. Numbers here will differ from the CPCB National Air Quality Index bulletin, which is computed from Continuous Ambient Air Quality Monitoring Station telemetry.",
    ],
    [
      "Why does ozone show up as the dominant pollutant in summer?",
      "Because ozone is photochemically produced by sunlight and its CPCB sub-index uses an 8-hour mean with breakpoints at 50, 100, 168, 208 and 748 µg/m³, so an afternoon 8-hour mean near 142 µg/m³ already scores about 162 — above the same city's PM2.5 sub-index once the monsoon has washed particulates out. In winter the ranking flips and PM2.5, with a 24-hour breakpoint of just 60 µg/m³ for AQI 100, usually dominates.",
    ],
  ],
};

export default seo;
