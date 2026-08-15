const seo = {
  title: "Quake Near Me: Recent USGS Earthquakes by Distance",
  metaDescription:
    "Enter coordinates or use device location to list USGS-catalogued quakes of magnitude 2.5+ within 500 km, with haversine distance in km.",
  steps: [
    "Type a Latitude and Longitude, or press \"Use device location\" to fill both from the browser's geolocation.",
    "Press \"Get current result\" to query the USGS FDSN event service for magnitude 2.5 and above within 500 km, newest first, capped at 50 events.",
    "Read the Current result table — magnitude, place, haversine distance in km and origin time — with the USGS query URL printed underneath as the source.",
  ],
  intro:
    "Quake Near Me queries the USGS earthquake catalog (the FDSN event API at earthquake.usgs.gov) for recent events around a latitude and longitude you supply, then lists each one with its magnitude, place name, origin time and the great-circle distance from your point computed with the haversine formula. By default it looks within a 500 km radius for events of magnitude 2.5 and above, newest first, up to 50 results. Enter coordinates by hand or tap the device-location button, and refresh whenever you want a current reading.",
  useCases: [
    "You felt a jolt and want to know within a minute whether USGS has already logged an event near you and how strong it was.",
    "Family live overseas and you saw a headline about a quake in their region, so you drop in their city's coordinates and check the magnitude and distance from their town.",
    "You are writing up a site or travel risk note and want the recent seismic history around a set of coordinates straight from the official catalog rather than a news summary.",
  ],
  benefits: [
    ["Distance to you, not just place names", "Each event's haversine distance from your coordinates is shown in kilometres, so \"120 km SE of somewhere\" becomes a number you can act on."],
    ["Straight from the USGS catalog", "Results come from the USGS FDSN event service in GeoJSON, and the response includes the exact query URL used so you can verify or re-run it."],
    ["Filtered before it reaches you", "The lookup asks for magnitude 2.5 and above within 500 km, ordered by time and capped at 50 events, so the list stays to what is actually near and notable."],
  ],
  faqs: [
    [
      "Where does the earthquake data come from?",
      "The United States Geological Survey's FDSN event web service at earthquake.usgs.gov, requested in GeoJSON format. USGS publishes a global catalogue, so coverage is not limited to the US, though detection thresholds vary by region and network density.",
    ],
    [
      "How far out does it search, and how small a quake will it show?",
      "By default 500 km around your coordinates, for events of magnitude 2.5 or greater, returning up to the 50 most recent. The service will accept radii up to 20,000 km, which is effectively the whole planet.",
    ],
    [
      "How is the distance to each earthquake calculated?",
      "With the haversine formula, using the epicentre's latitude and longitude from the USGS record and the coordinates you entered. That gives great-circle surface distance in kilometres, not accounting for the event's depth.",
    ],
    [
      "Is this an earthquake early-warning system?",
      "No. It reports events already recorded and published in the USGS catalog, which takes time to review, and it only updates when you request a fresh reading. For alerts before shaking arrives, use an official early-warning service for your region.",
    ],
  ],
};

export default seo;
