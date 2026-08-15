const seo = {
  title: "Solar System Explorer: Animated Orbits, Planet",
  metaDescription:
    "Watch all eight planets orbit at their real periods, from Mercury's 88 days to Neptune's 164.8 years, with radius, mass, gravity and temperature cards.",
  steps: [
    "Choose a world in the \"Planet Selection\" grid — all eight from Mercury to Neptune, with Earth selected by default.",
    "Drag the \"Orbit Speed Multiplier\" slider between 0.2x and 5x in 0.2 steps, and use \"Pause Orbits\" to freeze an alignment or \"Resume Orbits\" to start it moving again.",
    "The planet card lists Equatorial Radius, Mass, Surface Gravity, Mean Temp, Rotation Day and Orbital Year beside its AU distance, while the canvas is labelled \"Interactive Planetary Orbits (Not to scale for visibility)\"; Reset returns to Earth at 1x and time zero.",
  ],
  intro:
    "Solar System Explorer is an animated top-down planetarium that orbits all eight planets around the Sun at speeds set by their real orbital periods, from Mercury's 88 days to Neptune's 164.8 years, and shows a data card for whichever planet you select. It is aimed at students, teachers and anyone explaining why the outer planets crawl while the inner ones race — Kepler's Third Law, where the square of the orbital period scales with the cube of the orbital distance. Each card gives equatorial radius, mass, surface gravity, mean temperature, rotation day, orbital year and distance from the Sun in AU.",
  useCases: [
    "You are teaching a Year 7 class why a year on Jupiter is 11.86 Earth years and want the class to watch Earth lap Jupiter roughly a dozen times instead of reading it off a table.",
    "A child asks why Venus is hotter than Mercury even though Mercury is closer, and you want the mean temperatures — 464 °C against 167 °C — and the AU distances on screen at the same moment.",
    "You are checking planetary facts for a science poster and need radius, mass, gravity and rotation period for Saturn in one place without opening four reference pages.",
  ],
  benefits: [
    [
      "Orbit speeds follow the real periods",
      "Each planet's angular speed is derived from its actual orbital period, so the relative pacing between Mercury and Neptune is honest even though the distances on screen are compressed.",
    ],
    [
      "Seven data points per planet, not just a name",
      "Selecting a planet fills a card with equatorial radius, mass in kg, surface gravity, mean temperature, rotation day, orbital year and AU distance.",
    ],
    [
      "Pause and speed control for classroom pacing",
      "An orbit-speed multiplier from 0.2x to 5x plus a pause button lets you freeze an alignment mid-explanation or fast-forward through a full outer-planet orbit.",
    ],
  ],
  faqs: [
    [
      "Is the solar system drawn to scale?",
      "No — orbit radii and planet sizes are compressed so all eight planets fit on one screen. At true scale, Neptune sits 30.05 AU out against Earth's 1.00 AU, and Earth would be well under a pixel wide; only the orbital speeds are kept proportional to reality.",
    ],
    [
      "Which planets are included?",
      "All eight: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Pluto is not shown, since the IAU reclassified it as a dwarf planet in 2006, and moons, asteroids and comets are not simulated.",
    ],
    [
      "Why do the outer planets move so slowly?",
      "Because of Kepler's Third Law: orbital period squared is proportional to orbital semi-major axis cubed, so a planet 30 times further out takes far more than 30 times as long to go around. Neptune's year is 164.8 Earth years against Mercury's 88 days, and the animation preserves that ratio.",
    ],
    [
      "Can I change how fast the orbits run?",
      "Yes. The orbit speed multiplier runs from 0.2x to 5x in 0.2 steps, and the pause button freezes every planet where it stands. Reset returns the simulation to time zero, 1x speed, with Earth selected.",
    ],
  ],
};

export default seo;
