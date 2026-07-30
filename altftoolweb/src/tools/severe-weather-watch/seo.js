const seo = {
  intro:
    "Severe Weather Watch pulls the active official weather alerts for a set of coordinates straight from the U.S. National Weather Service and lists each one with its severity, event type, headline and expiry time. You either let the browser supply your latitude and longitude or type them in, and the tool resolves them to an NWS forecast zone before fetching that zone's live alerts. It is for anyone who wants the government warning text itself rather than an app's paraphrase of it.",
  useCases: [
    "A tornado or flash flood warning is trending on social media and you want to check whether your own forecast zone is actually under an active alert, and when it expires.",
    "You are deciding whether to start a two-hour drive and want the exact NWS headline for the zone you are heading into, not the county-wide app banner.",
    "You are running an outdoor event and need to see, in one list, every active warning, watch and advisory covering the site with their expiry timestamps.",
  ],
  benefits: [
    [
      "Official wording, unedited",
      "Each row is the severity, event name, headline and expiry as published by the National Weather Service, with nothing summarised away.",
    ],
    [
      "Zone-level, not city-level",
      "Your coordinates are resolved to the NWS forecast zone that alerts are actually issued for, so you see what applies where you are standing.",
    ],
    [
      "Fetched fresh every time",
      "The request runs with caching disabled, so pressing refresh gives the current alert list rather than a stored copy.",
    ],
  ],
  faqs: [
    [
      "Where does the alert data come from?",
      "The U.S. National Weather Service public API. The tool first calls the points endpoint with your latitude and longitude to find your forecast zone, then requests the active alerts for that zone.",
    ],
    [
      "Does it work outside the United States?",
      "No. Coverage is the United States and its territories only, because the National Weather Service is the sole source. Anywhere else, use your national meteorological authority — the Met Office, IMD, Environment Canada, BOM and so on.",
    ],
    [
      "What do the severity levels mean?",
      "They are the Common Alerting Protocol levels the NWS publishes: Extreme, Severe, Moderate, Minor or Unknown. Extreme and Severe indicate an extraordinary or significant threat to life or property, and each row also shows the expiry time so you can see whether an alert is close to lapsing.",
    ],
    [
      "Can I rely on this instead of an emergency alert app?",
      "No. This is an informational lookup that only updates when you refresh it — it will not wake your phone, and a network or API failure simply shows an error rather than a warning. Keep Wireless Emergency Alerts, a NOAA weather radio, or your local emergency service as your primary channel and always follow the instructions of local authorities.",
    ],
  ],
};

export default seo;
