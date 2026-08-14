const seo = {
  title: "Projectile Motion Simulator With Drag and Gravity",
  metaDescription:
    "Animate a launch from 0-90° and 5-100 m/s, read R, H and T from the vacuum formulas, and watch quadratic drag fall short of the dashed ideal path.",
  steps: [
    "Under Launch Parameters drag Launch Angle across 0-90° and Initial Velocity across 5-100 m/s, then pick an Environment Gravity preset: Earth (9.81m/s²), Moon (1.62m/s²), Mars (3.71m/s²) or Jupiter (24.79m/s²).",
    "Tick Air Resistance Drag and set the Drag Coefficient between 0.01 and 0.5, then press Launch; the ball is drawn with a red Vx Vector, a green Vy Vector and an amber Resultant V arrow, and Pause halts it.",
    "'Telemetry & Real-Time Stats' gives Max Height, Total Range and Flight Time from the vacuum formulas plus live Current Speed, while the solid trail falls short of the dashed ideal parabola; Reset clears the trail.",
  ],
  intro:
    "This simulator launches a projectile at a chosen angle and speed and draws its path against the vacuum equations of 2D kinematics — range R = v₀²·sin2θ/g, peak height H = (v₀·sinθ)²/2g and flight time T = 2v₀·sinθ/g — while animating the horizontal and vertical velocity vectors as it flies. Switch on air resistance and it integrates a quadratic drag force, F_d = ½·C_d·v², with Euler steps of 0.03 s, drawing the real trajectory against the dashed ideal one so the gap between them is visible. It is built for physics students and teachers who want the formulas and the picture side by side.",
  useCases: [
    "You are working through a kinematics problem set and want to check that your hand-calculated range for a 30 degree launch matches the curve.",
    "Demonstrating in class why 45 degrees maximises range in a vacuum but a lower angle wins once drag is switched on.",
    "Comparing the same throw on Earth and on the Moon to show a group how much of a trajectory's shape is just the value of g.",
  ],
  benefits: [
    ["Ideal and real path in one frame", "The dashed vacuum parabola stays on screen while the drag-affected trail is drawn over it, so the shortfall is measured, not described."],
    ["Gravity you can change", "Four presets — Earth 9.81, Moon 1.62, Mars 3.71 and Jupiter 24.79 m/s² — plus a free g value, so the same launch can be replayed under any of them."],
    ["Vectors while it moves", "Horizontal, vertical and resultant velocity arrows are drawn at the projectile each frame, which is where the 'vy reaches zero at the apex' idea becomes obvious."],
  ],
  faqs: [
    [
      "What launch angle gives the maximum range?",
      "45 degrees, in a vacuum. Range is v₀²·sin2θ/g and sin2θ peaks at 1 when θ = 45 degrees, so any other angle travels less at the same speed. With air resistance switched on the optimum drops below 45 degrees, which you can see by comparing runs.",
    ],
    [
      "What ranges can I set for angle, speed and drag?",
      "Launch angle from 0 to 90 degrees, initial speed from 5 to 100 m/s, and a drag coefficient from 0.01 to 0.5 with a mass in kilograms. Gravity comes from the four planet presets or any value you enter.",
    ],
    [
      "Do the height, range and flight-time readouts include air resistance?",
      "No — those three figures are always the vacuum results from the standard formulas, so they act as the ideal benchmark. When drag is on, the actual flight falls short of them, and the difference is what the solid trail against the dashed curve shows.",
    ],
    [
      "How accurate is the air-resistance model?",
      "It is a teaching approximation, not an aerodynamics tool. Drag is modelled as a quadratic force opposing velocity and integrated with forward Euler steps of 0.03 s, so it captures the shape of the effect — a shortened, asymmetric arc with a steeper descent — but it folds air density and cross-sectional area into one coefficient and accumulates step error over long flights.",
    ],
  ],
};

export default seo;
