const seo = {
  intro:
    "The GPS Speedometer reads your device's own satellite fix through the browser Geolocation API and logs a timestamped row of speed, latitude, longitude and position accuracy for every update your phone reports. Speed comes straight from the GPS receiver's Doppler-derived value in metres per second and is converted to km/h by multiplying by 3.6 — it is not estimated from distance between points. It is for anyone who wants a speed readout and a private trip trace without installing a tracking app that uploads the route.",
  useCases: [
    "Your car's analogue speedometer reads a few km/h optimistic and you want an independent satellite-derived figure on a straight stretch to see how far off the dial is.",
    "You are cycling or running and want a live speed number plus the accuracy figure in metres, so you can tell whether a sudden jump was real or just a poor fix under trees.",
    "You are diagnosing a phone whose maps app keeps drifting, and you need to see the raw accuracy radius and whether a speed value is being reported at all before blaming the app.",
  ],
  benefits: [
    [
      "Shows accuracy alongside every reading",
      "Each row carries the fix's accuracy radius in metres, so you can judge how much to trust the speed instead of reading a bare number.",
    ],
    [
      "Honest about missing data",
      "When the device does not supply a velocity value the row reads 'Unavailable' rather than back-calculating a fake speed from two coordinates.",
    ],
    [
      "The trip trace never leaves the device",
      "Coordinates are held in the page's memory only and are discarded when you stop or close the tab — there is no account, upload or stored history.",
    ],
  ],
  faqs: [
    [
      "How accurate is a GPS speedometer compared with my car's dial?",
      "GPS speed is usually the more truthful of the two. Car speedometers are legally required to never under-read and typically show a few percent high, while a satellite fix reports actual ground speed. GPS accuracy degrades under bridges, in tunnels and beside tall buildings, which is why the accuracy radius in metres is logged next to every reading.",
    ],
    [
      "Why does the speed column say 'Unavailable'?",
      "Because your device reported a position without a velocity value. The Geolocation API's speed field is optional — many laptops and desktops positioning by Wi-Fi or IP never populate it, and phones may leave it null until the GPS chip has a stable fix. Moving outdoors for a minute usually makes it appear.",
    ],
    [
      "Does the tool record where I have been?",
      "Only in the current browser tab. Readings are kept in a rolling in-page buffer of the most recent 200 rows, with the newest 100 shown in the table, and nothing is written to a server or to permanent storage. Closing or reloading the page erases the trace.",
    ],
    [
      "Why does it ask for location permission every time?",
      "The browser requires an explicit grant before any page can watch your position, and this tool requests a live watch with high accuracy enabled and cached positions disabled so every row is a fresh fix. It also needs a secure HTTPS context; geolocation is blocked on plain HTTP pages.",
    ],
  ],
};

export default seo;
