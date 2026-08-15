const seo = {
  title: "Eclipse Simulator: Umbra and Penumbra Shadow",
  metaDescription:
    "Drag orbital alignment and Earth-Moon distance to watch the umbra and penumbra cones decide total, annular, partial or penumbral. Not drawn to scale.",
  steps: [
    "Press Solar Eclipse for the Sun-Moon-Earth arrangement or Lunar Eclipse for Sun-Earth-Moon.",
    "Drag Orbital Alignment Shift across its -45 to 45 range and move Earth-Moon Distance between Perigee (Near) and Apogee (Far).",
    "Read Umbra Coverage and the Shadow Zone label of Umbra Cone, Penumbra Cone or Outside Shadow, or press Animate Transit to sweep the whole alignment range.",
  ],
  intro:
    "Solar & Lunar Eclipse Simulator draws the Sun–Moon–Earth shadow geometry on a live canvas so you can see why an eclipse is total, annular, partial or penumbral. You switch between the solar arrangement (Sun → Moon → Earth) and the lunar one (Sun → Earth → Moon), slide the alignment off centre, and move the Moon between perigee and apogee, while the umbra and penumbra cones and the resulting eclipse classification update in real time. It is a schematic teaching model rather than a to-scale ephemeris, aimed at students and teachers who need to see the shadow cones rather than compute a date.",
  useCases: [
    "A physics teacher needs to show a class why the Moon's shadow misses Earth most months, by dragging the alignment slider and watching the eclipse type collapse from total to partial to none.",
    "A student cannot picture the difference between a total and an annular solar eclipse, and wants to move the Moon toward apogee and see the umbra cone fall short.",
    "Someone is explaining to a child why lunar eclipses last hours while solar totality lasts minutes, using the relative sizes of the two shadow cones on screen.",
  ],
  benefits: [
    [
      "Umbra and penumbra drawn as actual cones",
      "The shadow is rendered as tangent-line geometry from the Sun's limbs rather than a flat disc, which is what makes the total-versus-partial distinction visible.",
    ],
    [
      "Distance and alignment as separate variables",
      "Perigee-to-apogee distance and orbital alignment offset are independent sliders, so you can isolate which one turns a total eclipse into an annular one.",
    ],
    [
      "Animated transit",
      "One button sweeps the alignment through the full range so the eclipse progresses from outside the shadow, through partial, to maximum and out again — switch to Lunar mode first to also see the penumbral stage.",
    ],
  ],
  faqs: [
    [
      "What is the difference between the umbra and the penumbra?",
      "The umbra is the inner cone where the light source is completely blocked; the penumbra is the surrounding region where only part of the Sun's disc is hidden. Standing in the umbra during a solar eclipse gives you totality, while the penumbra gives a partial eclipse — the simulator shades the two regions differently so you can see which one a location falls in.",
    ],
    [
      "Why is a solar eclipse annular instead of total?",
      "Because the Moon is too far from Earth for its umbra to reach the surface, so a ring of the Sun's disc stays visible. In the simulator, pushing the Earth–Moon distance slider past the perigee/apogee midpoint switches a perfectly aligned solar eclipse from total to annular for exactly that reason.",
    ],
    [
      "Why isn't there an eclipse every month?",
      "The Moon's orbit is tilted about 5 degrees to the plane of Earth's orbit, so at most new and full moons the shadow cone passes above or below its target. Moving the alignment slider away from zero reproduces this: past a small offset the umbra misses entirely and only a partial or penumbral event remains.",
    ],
    [
      "Is this simulator drawn to scale?",
      "No — the Sun, Earth and Moon are drawn at exaggerated relative sizes and distances so the shadow cones fit on one screen. The geometry of how the cones form and which eclipse type results is faithful; the numbers are not, so use it to understand mechanism rather than to predict a real eclipse.",
    ],
  ],
};

export default seo;
