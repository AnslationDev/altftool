const seo = {
  title: "Chladni Plate Simulator: Nodal Patterns",
  metaDescription:
    "Set drive frequency, plate side, thickness and material - steel, aluminium, brass, glass or acrylic - to draw the Chladni figure from thin-plate theory.",
  steps: [
    "Enter the \"Drive frequency (Hz)\" and pick a Plate material — Mild steel, Aluminium 6061, Brass, Soda-lime glass or Acrylic (PMMA).",
    "Set \"Plate side (mm)\" and \"Thickness (mm)\", then move the \"Damping ratio\" slider to sharpen or flatten the resonance peak.",
    "Read the Nearest plate mode (m, n), its resonant frequency and the Fundamental (1,1) row beside the rendered Chladni canvas, then press Copy summary.",
  ],
  intro:
    "A cymatics simulator draws the Chladni figure a vibrating plate produces: the set of lines where the standing wave has zero displacement, which is exactly where sand collects. Plate resonances come from Kirchhoff-Love thin-plate theory — f(m,n) = (pi/2) x sqrt(D / rho h) x [(m/L)^2 + (n/L)^2], with flexural rigidity D = E h^3 / 12(1 - v^2) — and the figure is the nodal set of the classic two-term Chladni superposition. It is for physics teachers, students and makers planning a real Chladni plate before cutting metal.",
  useCases: [
    "Predict which frequencies will give clean figures on a 200 mm steel plate before building the rig with a speaker and a signal generator",
    "Show a class why a thinner or larger plate drops every resonance, since frequency scales with thickness and with one over side squared",
    "Compare aluminium, brass and glass plates of the same size to see how stiffness and density set the fundamental",
  ],
  benefits: [
    ["Real plate equations", "Frequencies come from thin-plate theory with published material constants, not from an arbitrary lookup."],
    ["Damping actually matters", "The response uses the standard magnification factor, so a low-damping plate shows a sharp resonance peak."],
    ["Runs at 60 fps in the browser", "The field is sampled on a grid and drawn to canvas — no audio hardware or plugin required."],
  ],
  faqs: [
    [
      "What exactly is a Chladni figure?",
      "It is the pattern of nodal lines on a vibrating plate — the places where displacement stays zero while the rest of the plate moves. Sand sprinkled on the plate is thrown off the moving antinodes and piles up along those still lines. Ernst Chladni demonstrated this in 1787 by bowing the edge of a metal plate.",
    ],
    [
      "What frequency will make a pattern appear on my plate?",
      "Only the plate's own resonances, and they depend on its size, thickness and material. A 200 mm square mild-steel plate 1 mm thick has a computed fundamental near 120 Hz, with the next mode around 300 Hz. Double the thickness and every frequency doubles; double the side length and every frequency drops by a factor of four.",
    ],
    [
      "Why does a thicker plate need a higher frequency?",
      "Because flexural rigidity D grows with the cube of thickness while the mass per unit area grows only linearly, so sqrt(D / rho h) scales with h — the frequency is directly proportional to thickness for a plate of fixed size and material.",
    ],
    [
      "Does the sand pattern move once it forms?",
      "No. The nodal set of a standing wave is fixed in space — only the amplitude oscillates, passing through zero twice per cycle. That is why the figure looks frozen even though the plate is vibrating hundreds of times a second, and why this simulation is time-independent.",
    ],
  ],
};

export default seo;
