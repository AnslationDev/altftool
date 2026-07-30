const seo = {
  intro:
    "This is a browser compass that reads your device's orientation sensor and logs a heading in degrees, along with the raw alpha, beta and gamma angles behind it, each row timestamped. On iOS it uses the webkitCompassHeading value the magnetometer supplies; elsewhere it falls back to the alpha rotation of the DeviceOrientation event. It only runs after you tap start and grant sensor permission, and the readings stay on the phone — nothing is transmitted.",
  useCases: [
    "You are mounting a satellite dish or solar panel and need to know which way a wall actually faces before drilling",
    "A rental listing says the balcony is south-facing and you want to check it on the spot without installing an app",
    "You want a timestamped log of headings while walking a boundary, so you can read back the sequence of directions afterwards",
  ],
  benefits: [
    ["Raw angles alongside the heading", "Every row shows alpha, beta and gamma next to the derived bearing, so you can tell a genuine reading from a tilted phone."],
    ["Timestamped rolling log", "The last 200 readings are kept in a table with ISO timestamps instead of a single needle you have to watch live."],
    ["Explicit permission, then local only", "The orientation listener attaches only after you press start, and no heading, coordinate or timestamp leaves the browser."],
  ],
  faqs: [
    [
      "Does a web page compass work without an app?",
      "Yes, on a phone with a magnetometer: the browser exposes the DeviceOrientation event, and this page converts it to a 0-360 degree heading. Desktop machines almost never have a magnetometer, so the reading will be missing or meaningless there.",
    ],
    [
      "Why do I have to grant permission before it shows anything?",
      "Because iOS 13 and later require an explicit user gesture — DeviceOrientationEvent.requestPermission() is called when you press start, and Safari will not deliver a single orientation event until you accept. Nothing is logged before that tap.",
    ],
    [
      "Is this magnetic north or true north?",
      "Magnetic north. The page reports the sensor value as-is with no magnetic declination correction, and declination can exceed 20 degrees in parts of the world, so for surveying, aviation or navigation apply the local declination yourself or use an instrument that does.",
    ],
    [
      "Why is my heading jumping around or reading wrong?",
      "Nearby metal and magnets are the usual cause — speakers, magnetic phone mounts, car dashboards, steel desks and laptop lids all distort the field. Hold the phone flat and away from metal, and if it stays wrong, recalibrate by moving the device in a figure-eight, which is what most phones' magnetometer calibration routine expects.",
    ],
  ],
};

export default seo;
