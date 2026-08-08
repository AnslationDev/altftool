const seo = {
  title: "Live AQI by Coordinates: US and European Index",
  metaDescription:
    "Current US AQI and European AQI for any latitude and longitude, with PM2.5, PM10, ozone, NO2, SO2 and CO readings from Open-Meteo CAMS data.",
  steps: [
    "Enter a Latitude and Longitude, or press Use device location to fill both from your device's reported position.",
    "Press Get current result to request the reading for those coordinates from the Open-Meteo Air Quality API.",
    "Read the Current result panel: US AQI and European AQI plus PM2.5, PM10, ozone, nitrogen dioxide, sulphur dioxide and carbon monoxide, each with its unit and update timestamp.",
  ],
  intro:
    "The AQI Live Dashboard reports the current air quality index for a set of coordinates along with the pollutant-by-pollutant readings behind it — PM2.5, PM10, ozone, nitrogen dioxide, sulphur dioxide and carbon monoxide — pulled on demand from the Open-Meteo Air Quality API, which is built on the Copernicus CAMS model. It shows both the US AQI and the European AQI for the same location, because the two scales are computed differently and rarely agree. Enter a latitude and longitude or use your device location, and each reading comes back with its unit and an update timestamp.",
  useCases: [
    "You are deciding whether to take the morning run outside and want the PM2.5 figure itself, not just a colour, before you commit.",
    "An app shows one AQI number for your city while a neighbour's app shows another, and you want to see the US and European index for the same coordinates side by side to understand the gap.",
    "You are logging conditions for an asthma diary and need the individual pollutant concentrations with units at a specific time and place.",
  ],
  benefits: [
    ["Two index scales, one location", "US AQI and European AQI are returned together for the same coordinates, making it obvious when a headline number depends on which standard is being used."],
    ["Component readings, not just the index", "The six modelled pollutants are listed with their units, so you can see whether the index is being driven by particulates or by ozone."],
    ["Coordinate-level, not city-level", "Readings are requested for the exact latitude and longitude you enter or the position your device reports, rather than a citywide average."],
  ],
  faqs: [
    [
      "Why do the US AQI and European AQI numbers differ so much?",
      "They use different pollutant breakpoints and averaging windows. US AQI runs 0-500 with bands at 50 (Good), 100 (Moderate), 150 (Unhealthy for Sensitive Groups), 200 (Unhealthy) and 300 (Very Unhealthy); the European index is scaled so that 100 marks the extremely poor threshold. The same air can score very differently on each.",
    ],
    [
      "Where does the data come from, and is it a real sensor?",
      "It comes from the Open-Meteo Air Quality API, which serves Copernicus CAMS model output rather than a reading from a monitoring station at your doorstep. It is a modelled estimate for your coordinates, so a nearby regulatory monitor is the better reference for official figures.",
    ],
    [
      "Which pollutants are reported?",
      "Six: PM2.5 and PM10 particulates, ozone, nitrogen dioxide, sulphur dioxide and carbon monoxide, each with the unit returned by the source — micrograms per cubic metre for most of them.",
    ],
    [
      "Does this run entirely in my browser?",
      "No, and it says so. The latitude and longitude you enter are sent to ALTFTool's server, which requests the named public air quality source and returns the reading with its timestamp; nothing else about you is transmitted. Treat the result as informational and follow local health authority guidance if you have a respiratory or cardiac condition.",
    ],
  ],
};

export default seo;
