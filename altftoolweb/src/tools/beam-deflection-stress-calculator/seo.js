const seo = {
  title: "Simply Supported Beam Deflection & Stress",
  metaDescription:
    "Max deflection, bending moment, bending stress and span/deflection ratio for a simply supported beam under a centre point load or a uniform load.",
  steps: [
    "Under Simply supported load case pick Center point load or Uniform load over full span.",
    "Enter Load P (N) or w (N/m), Span L (m), Elastic modulus E (GPa), Second moment I (cm⁴) and Section modulus Z (cm³) — or press the Steel center load example.",
    "Read the maximum deflection in mm in the Result panel, with the Maximum moment (N·m), Bending stress (MPa) and Span / deflection rows beneath it.",
  ],
  intro:
    "The Beam Deflection & Stress Calculator solves the two standard simply supported cases — a central point load and a uniformly distributed load — returning maximum deflection, maximum bending moment, bending stress and the span-to-deflection ratio. It uses the textbook closed-form results PL³/48EI and 5wL⁴/384EI for deflection, PL/4 and wL²/8 for moment, and σ = M/Z for stress. It is for students, makers and engineers sanity-checking a section size, and it assumes linear-elastic small-deflection behaviour rather than performing a code design check.",
  useCases: [
    "You are sizing a steel lintel over a 2 m opening and want to see whether the deflection under the design load lands anywhere near a serviceability limit before you commit to a section.",
    "A workbench or shelf spanning between two supports feels bouncy, and you want to know whether doubling the beam depth or halving the span does more for stiffness.",
    "You are working through a mechanics of materials problem set and need to check your hand-calculated moment and stress against the closed-form result.",
  ],
  benefits: [
    ["Deflection and stress from one input set", "Both serviceability and strength come out of the same run, so you are not entering the section twice in two tools."],
    ["Handles the unit conversions", "E in GPa, I in cm⁴ and Z in cm³ are the units section tables actually publish; the conversion to SI happens internally."],
    ["Gives the span/deflection ratio directly", "The L/δ figure is the number serviceability limits are written in, so it can be compared to a limit without extra arithmetic."],
  ],
  faqs: [
    [
      "What formulas does this use?",
      "For a simply supported beam with a central point load, maximum moment is PL/4 and maximum deflection is PL³/(48EI). For a uniformly distributed load over the full span, maximum moment is wL²/8 and maximum deflection is 5wL⁴/(384EI). Bending stress in both cases is the maximum moment divided by the section modulus Z.",
    ],
    [
      "What is a reasonable deflection limit?",
      "Serviceability limits are usually written as a fraction of the span, and L/360 under live load is a widely used figure for floors, with L/240 or L/180 applied to less sensitive members. The governing value depends on your local building code, the material and what the member supports, so check the code that applies rather than treating any one ratio as universal.",
    ],
    [
      "Why does span matter so much more than load?",
      "Because deflection scales with the cube of span for a point load and the fourth power for a distributed load, while it scales only linearly with the load. Doubling a span under a uniform load increases deflection sixteen-fold; doubling the load only doubles it.",
    ],
    [
      "Can I use this to design a real structural member?",
      "No. These are ideal simply supported, linear-elastic, small-deflection formulas that ignore shear deflection, buckling, lateral-torsional stability, local effects, fatigue, connection behaviour, load combinations and safety factors. Use it to build intuition or check a hand calculation, and have anything load-bearing verified by a qualified structural engineer against the governing code.",
    ],
  ],
};

export default seo;
