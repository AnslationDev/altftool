const seo = {
  intro:
    "This cymatics simulator draws Chladni-style nodal figures by scattering thousands of particles across a virtual plate and keeping only the ones that land where the standing wave is near zero — the same thing that makes sand collect into lines on a bowed metal plate. Set a frequency from 50 to 2000 Hz, pick one of six vibration modes (radial, star, mandala, square, hex, spiral) and adjust damping, and the pattern redraws live on canvas. It is built for physics and music teachers, students and sound-art tinkerers who want to see how pitch changes geometry without setting up a signal generator and a plate.",
  useCases: [
    "Showing a class why a bowed plate makes sand jump to lines: pause on 200 Hz, then jump to 880 Hz and count how the nodal rings multiply",
    "Explaining what a node is in a standing-wave lesson, with a visible field where particles sit only where displacement is effectively zero",
    "Sketching ideas for a poster or generative artwork by stepping through the six modes at the same frequency to compare the geometry each one produces",
  ],
  benefits: [
    ["Musical pitch, not just numbers", "Twenty-one note buttons from C3 to B5 set the frequency directly, so A4 lands on 440 Hz and A5 on 880 Hz."],
    ["Damping is a control, not a constant", "Sweeping damping from 0.001 to 0.030 widens or tightens the band of particles that count as sitting on a node."],
    ["Density you can dial for your machine", "Particle count runs from 6,000 to 26,000 and a live FPS readout tells you when to back it off."],
  ],
  faqs: [
    [
      "What frequency range can I simulate?",
      "50 Hz to 2000 Hz on the slider, or any of 21 preset musical notes from C3 (130.81 Hz) to B5 (987.77 Hz). Six starting presets are included at 200, 440, 528, 880, 1200 and 1760 Hz, each paired with a different nodal mode.",
    ],
    [
      "Does the simulator play the sound too?",
      "No — it is a visual model only, with no audio output and no microphone input. Frequency here is a parameter that sets the wavenumber of the standing wave being drawn, so you can run it silently in a classroom or record the screen without capturing tones.",
    ],
    [
      "Are these real Chladni patterns?",
      "They are illustrative, not a numerical solution of the plate equation. The figures come from analytic standing-wave expressions per mode, so they behave the right way — more nodal lines at higher frequency, tighter lines at low damping — but they will not match a specific real plate's material, thickness or clamping.",
    ],
    [
      "Why is the pattern shimmering instead of holding still?",
      "Particles are re-sampled at random every frame, so the nodal lines stay put while the dots filling them refresh. Press Pause to freeze a single frame for a screenshot, or raise the particle count toward 26,000 for a denser, steadier-looking figure.",
    ],
  ],
};

export default seo;
