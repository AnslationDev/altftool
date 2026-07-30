const seo = {
  intro:
    "Magnetic Field Visualizer draws the field of bar magnets and a solenoid on an interactive canvas by treating each magnet as a north and a south point pole whose contribution falls off as an inverse square of distance, then summing those vectors and tracing field lines by streamline integration outward from the north pole. You can switch between a single magnet, two magnets set to attract or repel, and an electromagnet, and drop a compass probe anywhere on the canvas to read the flux density magnitude, its vector angle and its x and y components. It is a teaching visual for physics students and teachers covering dipoles, poles and lines of force.",
  useCases: [
    "Teaching a class why like poles repel, by flipping the two-magnet mode from attract to repel and showing the field lines stop joining up and push apart in the gap instead.",
    "Working out which way a compass needle would point at a given spot near a bar magnet, by dragging the probe there and reading the vector angle in degrees.",
    "Showing that a solenoid produces a field like a bar magnet's, by switching to electromagnet mode where the coil is modelled as three stacked dipoles and comparing the external line pattern with the single-magnet view.",
  ],
  benefits: [
    [
      "Lines are traced, not drawn from a template",
      "Each field line is integrated step by step through the computed vector field, up to 150 steps of 4 pixels, so the shape is a genuine result of the pole positions.",
    ],
    [
      "A probe that reports components, not just a picture",
      "Click anywhere and you get the magnitude, the angle and the separate x and y components, which is what a vector question actually asks for.",
    ],
    [
      "Density and strength you can sweep live",
      "Line density runs from 12 to 48 seed lines per pole and field strength from 10 to 100 percent, so you can thin the picture out to trace a single line by eye.",
    ],
  ],
  faqs: [
    [
      "How is the magnetic field calculated here?",
      "Each bar magnet is treated as two point poles, north and south, and the field from each pole falls off with the inverse square of distance and is summed as a vector. This magnetic-pole model reproduces the familiar dipole line pattern; a real coil field is derived from the Biot-Savart law, dB = (mu0 I dl x r-hat) / 4 pi r squared.",
    ],
    [
      "Are the millitesla readings real measurements?",
      "No, they are illustrative values scaled from the on-screen model, not calibrated SI figures for any physical magnet. Use them to compare one point on the canvas with another — the ratios and the direction are meaningful, the absolute number is not.",
    ],
    [
      "Which way do magnetic field lines point?",
      "Outside the magnet they run from the north pole to the south pole, and inside the magnet they continue from south back to north, so every line is a closed loop. That is why the lines here are seeded in a ring around each north pole and traced along the field direction.",
    ],
    [
      "Why do the lines look different when magnets attract versus repel?",
      "When opposite poles face each other the lines cross the gap and connect the two magnets; when like poles face each other the fields oppose and the lines bend away, leaving a neutral point between them where the two contributions cancel. Toggle the two-magnet mode between attract and repel to see both patterns on the same canvas.",
    ],
  ],
};

export default seo;
