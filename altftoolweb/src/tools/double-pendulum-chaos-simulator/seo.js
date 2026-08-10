const seo = {
  title: "Double Pendulum Simulator – RK4 Chaos You Can Watch",
  metaDescription:
    "Runge-Kutta double pendulum with live sliders for mass, length, gravity and damping, plus a comparison mode offset by 0.001 rad to make chaos visible.",
  steps: [
    "Set the Parameters sliders — Mass 1 and Mass 2 (0.5–5 kg), Length 1 and Length 2 (0.5–3 m), Gravity (0.5–30 m/s²), Damping and Speed — plus the Initial Angles θ₁ and θ₂ in radians.",
    "Press Start, use Apply & Restart after moving the angle sliders or Randomize for a random pair, and toggle Compare to run a second pendulum offset by 0.001 rad.",
    "Watch the trails draw while the Live Stats panel updates FPS, θ₁, θ₂, ω₁ and ω₂; in comparison mode separate Pendulum A and Pendulum B stats show the divergence.",
  ],
  intro:
    "The Double Pendulum Chaos Simulator integrates the standard double-pendulum equations of motion with a fourth-order Runge-Kutta solver and draws the resulting swing in real time with fading motion trails. You set both masses, both rod lengths, gravity, damping and the two starting angles, then watch θ₁, θ₂, ω₁ and ω₂ update live. A comparison mode runs a second pendulum whose lower angle is offset by just 0.001 radians so you can see sensitive dependence on initial conditions with your own eyes.",
  useCases: [
    "A physics student has been told a double pendulum is chaotic and wants to actually watch two near-identical starts diverge instead of taking it on faith.",
    "A teacher needs a live demo for a lesson on nonlinear dynamics and wants to change gravity or a rod length mid-discussion and show what happens.",
    "Someone is building their own pendulum simulation and wants a reference to sanity-check their integrator against, using the same masses, lengths and starting angles.",
  ],
  benefits: [
    [
      "RK4, not Euler",
      "Each frame advances the state with a four-stage Runge-Kutta step, so the motion stays coherent far longer than a naive forward-Euler simulation.",
    ],
    [
      "Divergence you can watch side by side",
      "Comparison mode draws two pendulums whose only difference is 0.001 rad in the second angle, making the exponential separation visible rather than theoretical.",
    ],
    [
      "Every physical parameter is a live slider",
      "Masses from 0.5 to 5 kg, lengths from 0.5 to 3 m, gravity from 0.5 to 30 m/s² and damping from 0 to 0.5 all take effect without restarting.",
    ],
  ],
  faqs: [
    [
      "Why is a double pendulum chaotic?",
      "Because its equations of motion are nonlinear and coupled, so the difference between two nearby starting states grows exponentially rather than staying small. In comparison mode a 0.001 rad offset — under a twentieth of a degree — produces completely unrelated motion within seconds.",
    ],
    [
      "What are the default settings?",
      "Both masses are 1 kg, both rods are 1 m, gravity is 9.81 m/s², damping is 0.01 and both arms start horizontal at 90°. Reset all returns to exactly these values.",
    ],
    [
      "Is the simulation physically accurate?",
      "It solves the standard Lagrangian equations for a double pendulum with point masses and massless rigid rods, using RK4 with a timestep capped at 0.05 s per frame. It is a faithful model of that idealisation, but it ignores rod mass, air resistance and joint friction beyond the linear damping term you set.",
    ],
    [
      "What is the damping slider doing?",
      "It subtracts a term proportional to each angular velocity from that arm's angular acceleration, which is a simple linear drag model. Set it to 0 for an energy-conserving pendulum that swings indefinitely; the default 0.01 makes the motion settle slowly so the trails stay readable.",
    ],
  ],
};

export default seo;
