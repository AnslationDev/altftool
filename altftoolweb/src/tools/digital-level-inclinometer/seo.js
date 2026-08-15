const seo = {
  title: "Phone Digital Level & Inclinometer (Tilt in Degrees)",
  metaDescription:
    "Use your phone's orientation sensor as a spirit level: logs beta, gamma and combined tilt in degrees, keeping the last 200 readings in your browser.",
  intro:
    "This turns a phone into a spirit level and inclinometer by reading the DeviceOrientation sensor and logging the combined tilt off horizontal, computed as the hypotenuse of the front-back (beta) and left-right (gamma) angles. Each timestamped row keeps beta, gamma and alpha alongside that single tilt figure in degrees, so you can see whether a surface is off in one axis or both. It starts only after you press start and grant sensor permission, and readings never leave the browser.",
  useCases: [
    "You are hanging a shelf and want to check the bracket line is level before the second screw goes in, without a bubble level in the toolbox",
    "A washing machine walks across the floor on spin and you need to know which corner foot to raise and by roughly how much",
    "You want to record the slope of a driveway, ramp or gutter run at several points and read the tilt values back as a list",
  ],
  benefits: [
    ["One tilt number plus both axes", "The combined tilt is shown next to the raw beta and gamma, so a 3-degree reading tells you whether it is pitch, roll, or a bit of each."],
    ["A log, not just a live needle", "The last 200 readings are kept with ISO timestamps, so you can sample several spots along a run and compare them afterwards."],
    ["Sensor access on your say-so", "The orientation listener is attached only when you press start, and it is fully removed when you stop."],
  ],
  faqs: [
    [
      "How accurate is a phone used as a level?",
      "Typically within about one degree once the phone is resting flat on the surface rather than held in your hand, which is fine for shelves, appliances and picture frames but not for machining or structural work. Accuracy depends on the device's accelerometer calibration, so check it against a known-flat reference before trusting a small reading.",
    ],
    [
      "What do beta and gamma mean?",
      "Beta is front-to-back tilt and gamma is left-to-right tilt, both in degrees from the DeviceOrientation event; the tool reports the combined tilt as the square root of beta squared plus gamma squared. A surface reading 0 on both is horizontal in every direction.",
    ],
    [
      "How do I convert degrees of tilt into a percent slope or a fall per metre?",
      "Percent grade is the tangent of the angle times 100, so 1 degree is about 1.75%, and 2 degrees about 3.5%. For fall over a run, multiply the run by the tangent: a 1-degree slope drops roughly 17 mm per metre.",
    ],
    [
      "Why does the reading drift or refuse to start?",
      "On iOS 13 and later the browser gives no orientation data at all until DeviceOrientationEvent.requestPermission() is accepted, which is what the start button triggers. Drift usually means the phone is being held rather than laid down, or the accelerometer needs recalibrating — set the device flat on a surface you know is level and see whether it reads near zero.",
    ],
  ],
};

export default seo;
