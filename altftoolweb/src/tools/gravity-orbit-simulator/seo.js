const seo = {
  intro:
    "The Gravity Orbit Simulator integrates Newton's inverse-square law, a = −GM·r/r³, step by step to draw the path a small body takes around a fixed central star, and classifies the result as circular, elliptical, escape or decaying crash. You set the star's mass, the starting radius and the initial tangential speed, and the panel shows live distance and speed against the escape velocity √(2GM/r) for that radius. It is a teaching tool for anyone trying to see why a satellite that is too slow spirals in and one that is too fast never comes back.",
  useCases: [
    "You are learning orbital mechanics and want to watch what changes when speed drops just below the circular value — the orbit turns elliptical rather than falling straight in, which is hard to believe until you see it.",
    "A physics class is covering escape velocity and you want a live demonstration that the threshold is exactly √2 times circular speed, at the same radius and the same star mass.",
    "You are checking your own intuition about why a spacecraft speeds up near periapsis and slows near apoapsis, using the live speed and radius readouts as the ellipse is traced.",
  ],
  benefits: [
    [
      "Names the orbit as it evolves",
      "Circular, elliptical, escape trajectory and decaying crash are classified live from the current speed against the circular and escape thresholds, not just drawn.",
    ],
    [
      "One-click regime presets",
      "Buttons set the launch speed to the exact circular value, 75% of it for a bound ellipse, 110% of escape velocity, or 25% for a guaranteed crash — so each regime is one click away.",
    ],
    [
      "Live telemetry beside the trail",
      "Current radius and speed update continuously next to the escape-velocity figure for your chosen mass and radius, making the energy trade-off visible.",
    ],
  ],
  faqs: [
    [
      "What speed gives a perfectly circular orbit?",
      "v = √(GM/r), where M is the central mass and r the orbital radius. The simulator computes this for your slider settings and its circular preset applies it exactly; any deviation from that value turns the path into an ellipse.",
    ],
    [
      "How is escape velocity related to orbital velocity?",
      "Escape velocity is √(2GM/r), which is exactly √2 — about 1.414 — times the circular orbital velocity at the same radius. Below it the orbit is bound and closed; at or above it the body follows an open parabolic or hyperbolic path and never returns.",
    ],
    [
      "Why does my orbit crash into the star?",
      "Because the tangential speed is too low for the radius, so the ellipse's closest approach falls inside the star's surface. The crash preset uses 25% of circular speed to show this deliberately; the run stops when the body reaches the star's radius.",
    ],
    [
      "Are the units realistic?",
      "No — the simulation uses scaled units with G set to 1, star masses from 1,000 to 15,000 and radii from 60 to 240, advancing time in fixed steps. The proportions and the physics are faithful, but the numbers are not kilometres and kilograms, so use it to understand the relationships rather than to plan a real transfer.",
    ],
  ],
};

export default seo;
