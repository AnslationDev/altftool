const seo = {
  title: "Location Scout Notes: Sun Angle, Golden Hour, Score",
  metaDescription:
    "Log a recce with NOAA sun elevation and bearing at your shoot time, golden and blue hour windows, and a weighted score across eight criteria.",
  steps: [
    "Enter \"Location name\", \"Shoot date\", \"Planned shoot time (local)\", \"Latitude (north positive)\", \"Longitude (east positive)\" and \"UTC offset at the location (hours)\" — include daylight saving, as the tool does not look up time zones.",
    "Move the eight Scorecard sliders from 0 to 5: \"Quiet enough to record dialogue\" and \"Permission is straightforward\" carry weight 5, \"Light is usable and controllable\" weight 4, down to \"Signal and connectivity\" at weight 1. Add contacts and socket positions under \"Free notes\".",
    "\"Location score\" returns a weighted percentage and grade, with \"Sun at your shoot time\" as elevation and compass bearing, plus sunrise/sunset, solar noon, morning and evening golden hour and evening blue hour. \"Copy note\" copies the whole recce note.",
  ],
  intro:
    "This scouting tool records a location alongside the sun's actual position there, using the NOAA solar position equations to give sunrise, solar noon, sunset, golden hour and blue hour for the exact date and coordinates you enter, plus the sun's elevation and compass bearing at your planned shoot time. It then scores the location across eight criteria weighted by how often each one ruins a shoot — noise and permission count most. Built for anyone doing a recce who needs the note to survive the walk back to the car.",
  useCases: [
    "Check which way the light falls across a courtyard at 6:30 pm before promising a client that shot.",
    "Compare three candidate locations on one scale instead of arguing from memory.",
    "Work out how long the evening golden hour lasts on the shoot date at that latitude.",
    "Leave a written note a producer can act on: contact, power, noise, access and the score.",
  ],
  benefits: [
    ["Real solar geometry", "Sun elevation and bearing come from the NOAA algorithm, not a generic sunrise table."],
    ["Weighted, not averaged", "Noise and permission carry weight 5 because they cannot be fixed on the shoot day."],
    ["Flags what to fix", "Anything rated two or below is listed back with the weight it carries."],
  ],
  faqs: [
    [
      "How do I work out which way the sun will face at a location?",
      "You need the date, the time, and the latitude and longitude of the spot. The tool returns a compass bearing and a height above the horizon — for example in London on 21 June the sun is roughly 9° up bearing 64° (east-north-east) at 06:00 and due south at about 62° at solar noon.",
    ],
    [
      "How long does golden hour last?",
      "Golden hour is the period when the sun is between the horizon and about 6° elevation, so its length depends entirely on latitude and season. Near the equator it can be under half an hour; at 51° north in midsummer it runs to about 53 minutes, only crossing a full hour past roughly 55° north, and at high latitudes it can last most of the evening.",
    ],
    [
      "What should I check when scouting a location?",
      "Noise first, because you cannot fix it in post: traffic, an aircraft path, air conditioning, fridges. Then permission and who signs it, mains power and how far the cable run is, light direction and whether you can switch the overheads off, load-in and parking, the space between subject and background, and a wet-weather fallback.",
    ],
    [
      "Are the sunrise and sunset times exact?",
      "They are accurate to about a minute at mid latitudes, and they assume a flat, unobstructed horizon at sea level. Hills, buildings and trees take the light earlier than the calculation says, so treat the numbers as the outer limit and walk the site at roughly the shoot time if you can.",
    ],
  ],
};

export default seo;
