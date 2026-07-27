const seo = {
  intro:
    "This planner counts the smoke and carbon monoxide alarms a dwelling needs using the NFPA 72 coverage rule — one smoke alarm inside every sleeping room, one outside each separate sleeping area, and one on every level including the basement — and returns the mounting distances that decide whether each alarm actually works. Those distances are stated rather than guessed: at least 4 in (100 mm) from a sidewall on a ceiling, 4-12 in (100-300 mm) below the ceiling on a wall, within 3 ft (0.9 m) of a peak but outside the top 4 in (100 mm), and never within 10 ft (3 m) of a cooking appliance. Enter the manufacture year printed on your existing units and it dates the 10-year replacement.",
  useCases: [
    "Working out how many alarms to buy for a specific layout before a trip to the hardware shop",
    "Checking whether an existing installation actually covers every level and sleeping area",
    "Finding out whether alarms fitted years ago are already past their 10-year replacement date",
  ],
  benefits: [
    ["Counts by layout, not by floor area", "Bedrooms, sleeping areas and levels each drive the count the way the code does."],
    ["Real mounting distances", "Every rule comes with the number in both inches and millimetres, and the reason behind it."],
    ["Dates the replacement", "The 10-year life runs from the manufacture date on the back of the unit, and the planner does that arithmetic."],
  ],
  faqs: [
    [
      "How many smoke alarms do I need in my house?",
      "One inside every sleeping room, one outside each separate sleeping area, and at least one on every level including the basement. For a three-bedroom home on two floors with all bedrooms upstairs, that is five: three in the bedrooms, one on the landing and one downstairs. A level that already has a sleeping-area alarm does not need a second one just to satisfy the per-level rule.",
    ],
    [
      "Where should a smoke alarm be placed on the ceiling or wall?",
      "On a ceiling, keep it at least 4 in (100 mm) away from any sidewall, because air stagnates in that corner and smoke reaches it last. On a wall, the top of the alarm goes 4-12 in (100-300 mm) below the ceiling. On a peaked or cathedral ceiling, mount within 3 ft (0.9 m) horizontally of the peak but not inside the top 4 in, where a dead-air pocket forms.",
    ],
    [
      "How far should a smoke alarm be from the kitchen?",
      "At least 10 ft (3 m) from a stationary cooking appliance. Between 10 and 20 ft, use a photoelectric alarm or one with an alarm-silencing button, because ionization sensors respond strongly to cooking aerosols. Also keep alarms 3 ft (0.9 m) clear of a bathroom door with a shower, of forced-air supply registers, and of ceiling fan blade tips.",
    ],
    [
      "Do I need a carbon monoxide alarm as well?",
      "Yes, if the home has any fuel-burning appliance — a gas hob, boiler, geyser, generator, fireplace or wood stove — or an attached garage. Fit them outside each separate sleeping area and on every level, following the same pattern as smoke alarms. Carbon monoxide is colourless and odourless, so an alarm is the only warning a sleeping person gets, and its symptoms are easily mistaken for flu.",
    ],
  ],
};

export default seo;
