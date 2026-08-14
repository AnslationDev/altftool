const seo = {
  title: "Speed Converter: km/h, mph, Knots + Stopping Distance",
  metaDescription:
    "Convert a speed between km/h, mph, knots, m/s, ft/s and Mach, and see the reaction and braking distance it needs on dry, wet, gravel, snow or ice.",
  steps: [
    "Enter the figure in Speed and choose its Unit — Kilometres per hour (km/h), Miles per hour (mph), Knots (kn), Metres per second (m/s), Feet per second (ft/s) or Mach.",
    "Pick a Road surface with its mu value (Dry asphalt / concrete 0.7 down to Ice 0.1), set 'Driver reaction time (seconds)' or press the 'Alert driver (1s)' / 'Design value (2.5s)' preset, and add a Road grade (%) for a slope.",
    "Total stopping distance shows in metres with Reaction distance, Braking distance, Deceleration and Time spent braking, beside a 'Same speed in every unit' table; Copy result copies both.",
  ],
  intro:
    "This converter turns one vehicle speed into km/h, mph, knots, metres per second, feet per second and Mach at once, using the exact SI definitions — 1 mile is 1609.344 m, 1 nautical mile is 1852 m and 1 foot is 0.3048 m. It then applies the standard road-design stopping model to the same speed: reaction distance is speed multiplied by reaction time, and braking distance is v² ÷ (2 × 9.80665 × (µ + grade)). Drivers, riders, fleet trainers and students get both the unit answer and the real-world distance that speed needs.",
  useCases: [
    "Read a speed limit sign abroad in mph and know what to hold on a km/h speedometer.",
    "Show a new driver how much further the car travels at 100 km/h than at 60 km/h before it stops.",
    "Convert a boat's knots or an aircraft's Mach reading into km/h for a log or a report.",
  ],
  benefits: [
    ["Exact definitions", "Uses the legally defined metre values for mile, nautical mile and foot, not rounded factors."],
    ["Speed with consequence", "Shows reaction and braking distance beside the converted number so the speed means something."],
    ["Surface and slope", "Switch between dry asphalt, wet, gravel, snow and ice, and set an uphill or downhill grade."],
  ],
  faqs: [
    [
      "How many mph is 100 km/h?",
      "100 km/h is 62.14 mph. The conversion is exact: divide by 1.609344, because one international mile is defined as 1609.344 metres.",
    ],
    [
      "What is the stopping distance at 100 km/h?",
      "About 126 metres on dry asphalt using a 2.5 second reaction time — roughly 69 m covered while the driver reacts and 56 m of actual braking. On wet asphalt the braking part alone grows to about 87 m, because braking distance rises with the square of speed and falls with the friction coefficient.",
    ],
    [
      "Why is 1 knot not 1 km/h?",
      "A knot is one nautical mile per hour, and a nautical mile is 1852 metres — originally one minute of latitude — so 1 knot is 1.852 km/h. That is why marine and aviation charts, which are laid out in degrees of latitude, use knots rather than km/h.",
    ],
    [
      "Does doubling my speed double the braking distance?",
      "No, it roughly quadruples it. Braking distance is proportional to the square of speed, so going from 50 to 100 km/h multiplies the braking part by four, while the reaction part only doubles. This is an estimate for a car in good condition; a loaded vehicle, worn tyres or a wet road will need more.",
    ],
  ],
};

export default seo;
