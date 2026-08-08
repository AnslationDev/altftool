const seo = {
  title: "ISS Live Position and Distance From Your Location",
  metaDescription:
    "Live position of the ISS (NORAD 25544) with altitude, speed, sunlit or eclipsed state, and the great-circle distance from your coordinates.",
  steps: [
    "Enter your Latitude and Longitude — they start at 19.076 and 72.8777 — or press 'Use device location' to fill them from the browser's geolocation.",
    "Press 'Get current result'; while it runs the button reads 'Checking source…' and it queries the Where the ISS at? live position API for satellite 25544.",
    "Read the summary 'ISS is N km from your ground coordinates' plus the ISS latitude, ISS longitude, Altitude, Velocity, Visibility and Ground distance rows, with the update time and the source named underneath.",
  ],
  intro:
    "The ISS Pass Finder reports where the International Space Station (NORAD catalogue number 25544) is right now and how far that sub-satellite point is from your own coordinates, using the great-circle haversine distance. Enter a latitude and longitude — or let the browser supply them — and you get the station's current ground track position, altitude, orbital speed and whether it is sunlit or in Earth's shadow. It is a live position readout rather than a pass prediction: a true visible pass also depends on orbital propagation, twilight timing, your horizon and the weather.",
  useCases: [
    "You just saw a bright moving point crossing the sky and want to check whether the ISS was anywhere near your location at that moment",
    "You are teaching an orbital-mechanics lesson and want a live number for the station's altitude and speed instead of a textbook figure",
    "You are building or testing something that consumes satellite position data and want a quick sanity check of latitude, longitude and ground distance",
  ],
  benefits: [
    ["Ground distance, not just coordinates", "Raw lat/lon means little on its own, so the haversine distance from your point is computed for you in kilometres."],
    ["Sunlit or eclipsed is shown", "The visibility field tells you whether the station is currently lit by the Sun, which is the precondition for seeing it at all."],
    ["Honest about what it is not", "The readout states plainly that a live position is not a predicted pass, so you are not misled into waiting for the wrong sky."],
  ],
  faqs: [
    [
      "Does this tell me when the ISS will next fly over me?",
      "No — it shows where the station is at this moment, not a future pass. Pass prediction needs orbital propagation from current TLE elements plus your local twilight window and horizon profile; this page deliberately stops at live position and ground distance so it never implies a sighting that will not happen.",
    ],
    [
      "How high and how fast is the ISS?",
      "The tool reads both live from the station's telemetry, and they sit in a narrow band: roughly 410–420 km altitude and about 27,600 km/h, which is one orbit every 90 minutes or so. The altitude drifts down between reboost manoeuvres, which is why a live figure is more useful than a fixed one.",
    ],
    [
      "What does the visibility field mean?",
      "It says whether the ISS is in daylight or in Earth's shadow (eclipsed). You can only see the station when it is sunlit while your own sky is dark, which is why sightings cluster in the couple of hours after sunset and before sunrise.",
    ],
    [
      "Which satellite is 25544?",
      "25544 is the ISS's NORAD catalogue number, assigned to the Zarya module launched in 1998, and it is the identifier the tool queries. Every tracked object has one, so quoting it removes any ambiguity about which spacecraft the numbers describe.",
    ],
  ],
};

export default seo;
