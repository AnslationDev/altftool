const seo = {
  title: "Bolt Torque to Preload Calculator (T = K x F x d)",
  metaDescription:
    "Converts torque in N·m to clamp load with T = K x F x d, and back: enter bolt diameter, nut factor K and a proof-load target in kN to get both figures.",
  steps: [
    "In the Inputs panel enter Nominal diameter (mm), Applied torque (N·m), Nut factor K and Proof load target (kN).",
    "Tap the M10 · 45 N·m example chip to load a worked set, or Reset to put every field back to its default — the Result recomputes on each change.",
    "Read the \"… kN estimated preload\" headline with the Torque for entered target and Estimated % of entered target rows, then use Copy or Download to save bolt-torque-preload-calculator.txt.",
  ],
  intro:
    "The Bolt Torque & Preload Calculator applies the short-form torque equation T = K x F x d, converting an applied torque in newton-metres into the clamp load a fastener of a given nominal diameter should produce for a chosen nut factor K, and working the same relationship backwards to give the torque needed to hit a target preload. It is for anyone specifying or sanity-checking a tightening spec — a mechanic questioning a workshop figure, or an engineer comparing a dry and a lubricated assembly. The equation is a first-order estimate; approved fastener procedures govern real assemblies.",
  useCases: [
    "You have a proof-load target in kilonewtons from a joint calculation and need the torque wrench setting that corresponds to it for an M10 bolt.",
    "A supplier quotes a torque figure but not the assumed friction, and you want to see how much clamp load changes between a dry K of about 0.2 and a lubricated one nearer 0.15.",
    "You are checking whether a specified torque actually reaches the preload the joint design assumes, or whether it lands well short of it.",
  ],
  benefits: [
    [
      "Works the equation in both directions",
      "Gives you preload from torque and the torque needed for a target preload in the same result, so you do not have to rearrange anything by hand.",
    ],
    [
      "Makes the friction assumption explicit",
      "K is an input rather than a hidden constant, which surfaces the fact that friction — not bolt strength — dominates the torque-to-preload relationship.",
    ],
    [
      "Scores the result against your target",
      "Reports the estimated preload as a percentage of the proof load you entered, so you can see immediately whether the spec is under or over.",
    ],
  ],
  faqs: [
    [
      "What is the formula for bolt torque and preload?",
      "T = K x F x d, where T is torque in newton-metres, K is the dimensionless nut factor, F is the preload in newtons and d is the nominal bolt diameter in metres. Rearranged, preload F = T / (K x d) — so 45 N·m on an M10 bolt with K = 0.2 gives about 22.5 kN of clamp load.",
    ],
    [
      "What K factor should I use?",
      "K = 0.2 is the conventional starting value for plain, as-received steel fasteners, with lubricated or coated threads typically falling lower and dry, rusty or galled ones running higher. K is not a material property — it lumps thread friction, under-head friction and thread geometry into one number, so it should come from test data or the fastener supplier for anything load-bearing.",
    ],
    [
      "Why does the same torque give different clamp loads?",
      "Because roughly 90 percent of applied torque is consumed by friction under the head and in the threads, so lubrication, plating, surface finish, reuse and even wash-down before assembly all shift the result. Torque control alone typically scatters preload by tens of percent, which is why critical joints use angle control, bolt stretch measurement or ultrasonic methods instead.",
    ],
    [
      "Can I use this to set a torque wrench on a safety-critical joint?",
      "No. This is a simplified first-order estimate that ignores joint stiffness, embedment relaxation, thermal effects, gasket creep and the fastener's actual grade and proof strength. Use the manufacturer's or standard's published tightening procedure for anything structural, pressure-retaining or safety-related, and treat this as a cross-check on the order of magnitude.",
    ],
  ],
};

export default seo;
