const seo = {
  title: "Sunset & Golden Hour Planner with Hike Departure",
  metaDescription:
    "NOAA solar equations give sunset, golden hour and civil twilight for any coordinates and date; Naismith's rule works back to when you must leave home.",
  steps: [
    "Enter 'Latitude (north positive)', 'Longitude (east positive)', the Date and 'UTC offset on that date (hours)', or tap a preset such as Box Hill, UK or Nandi Hills, India.",
    "Fill in 'Travel to the trailhead (min)', 'Walking distance one way (km)', 'Total ascent (m)' and a Pace factor, then choose 'The start of golden hour (sun at +6°)' or 'Sunset itself' under 'Be in position for'.",
    "Read the 'Leave home at' time, the sunset, golden hour and civil twilight rows, and 'The evening, in order' timeline; press 'Copy plan' to copy the whole plan.",
  ],
  intro:
    "Calculates sunset, golden hour and the end of civil twilight for any latitude, longitude and date using the NOAA solar position equations, then works backwards through the climb with Naismith's rule — one hour per 5 km plus one hour per 600 m of ascent — to give the time you have to leave home. Sunset is solved at a zenith of 90.833 degrees, the standard allowance for refraction and the solar disc, and golden hour is taken as the sun between +6 and −4 degrees elevation.",
  useCases: [
    "Timing a hill walk so you are set up at the top before the light turns rather than watching it from the path",
    "Checking how much usable light is left after sunset before you need a head torch for the descent",
    "Planning a viewpoint drive on a specific date months ahead, when no weather app will give you the times yet",
  ],
  benefits: [
    ["Real solar geometry", "NOAA's published equations, not a fixed offset from sunset — golden hour length changes with latitude and season."],
    ["Naismith with corrections", "Ascent time and Langmuir's descent correction included, plus an honest pace factor for camera gear or children."],
    ["Polar cases handled", "At high latitudes it tells you the sun does not set that day instead of returning a nonsense time."],
  ],
  faqs: [
    [
      "When exactly is golden hour?",
      "Conventionally when the sun sits between +6 and −4 degrees of elevation, which straddles sunset itself. Its length depends entirely on latitude and season: in London in late June it runs about 80 minutes, while near the equator it can be under 40, because the sun drops through those degrees almost vertically.",
    ],
    [
      "How long does the light last after sunset?",
      "Until civil twilight ends, when the sun reaches 6 degrees below the horizon — enough light to walk and read outdoors without artificial light. In mid-latitudes that is roughly 30 to 45 minutes after sunset in summer and shorter in winter; in the tropics it can be under 25 minutes. Past that point you need a torch on any rough ground.",
    ],
    [
      "How do you calculate hiking time?",
      "Naismith's rule, published in 1892: allow one hour for every 3 miles (5 km) of distance, plus one extra hour for every 2,000 feet (600 m) of ascent. Langmuir's correction adjusts for descent — subtract 10 minutes per 300 m on moderate slopes of 5 to 12 degrees, add 10 minutes per 300 m on anything steeper. The rule assumes fit walkers, good ground and no significant stops, so add a margin for anything else.",
    ],
    [
      "How early should I get to a viewpoint for sunset?",
      "At least 20 to 30 minutes before golden hour starts, which is roughly an hour before sunset in mid-latitudes. That leaves time to find the actual composition rather than the first gap in the trees, and covers the walk being slower than planned. Always plan the descent as well — the light after golden hour goes quickly, and a route that was obvious on the way up rarely is on the way down.",
    ],
  ],
};

export default seo;
