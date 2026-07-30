const seo = {
  intro:
    "Three-Phase Power Calculator turns line-to-line voltage, line current, power factor and efficiency into apparent power, real power, reactive power and shaft output, using the balanced three-phase relationships S = √3 × V × I, P = S × pf and Q = √(S² − P²). It is aimed at electricians, panel builders and plant engineers sizing a feeder or checking a nameplate. At the default 400 V, 50 A, pf 0.9 and 95% efficiency it returns 34.64 kVA apparent, 31.18 kW input and about 29.62 kW output.",
  useCases: [
    "Reading a motor nameplate that gives 400 V, 50 A and pf 0.9 and needing the kW figure to check it against the drive rating you were quoted.",
    "Sizing a generator or UPS in kVA when the load list is written in kW — the calculator shows both, so you can see how much headroom a 0.8 power factor eats compared with 0.95.",
    "Estimating the reactive load in kVAr before specifying power-factor correction capacitors, so you can size the bank against a measured pf rather than a guess.",
  ],
  benefits: [
    [
      "kVA, kW and kVAr from one set of inputs",
      "Apparent, real and reactive power are all derived from the same voltage and current, so you can see the power triangle instead of converting between units by hand.",
    ],
    [
      "Efficiency applied separately from power factor",
      "Power factor gives electrical input power and efficiency then gives mechanical output, which keeps the two figures people most often conflate on a motor nameplate distinct.",
    ],
    [
      "Line-to-line convention stated up front",
      "The voltage field is explicitly line-to-line and the current is line current, removing the √3 mistake that comes from mixing phase and line quantities.",
    ],
  ],
  faqs: [
    [
      "What is the formula for three-phase power?",
      "Apparent power S = √3 × V_line-to-line × I_line, and real power P = S × power factor. So 400 V at 50 A gives √3 × 400 × 50 = 34,641 VA, or 34.64 kVA, and at a power factor of 0.9 that is 31.18 kW.",
    ],
    [
      "What is the difference between kW and kVA?",
      "kVA is apparent power, the total the supply must carry; kW is real power, the part that does work. They are related by power factor: kW = kVA × pf, so at pf 0.9 a 100 kVA supply delivers 90 kW, and the shortfall shows up as reactive power in kVAr.",
    ],
    [
      "What power factor should I assume if I do not know it?",
      "Use the nameplate value if there is one. Failing that, induction motors under load typically sit around 0.85 to 0.90, resistive loads such as heaters are close to 1.0, and lightly loaded motors can drop below 0.7 — assume low rather than high, because underestimating pf sizes conductors and generators conservatively.",
    ],
    [
      "Does this account for unbalanced loads or harmonics?",
      "No. The maths assumes a balanced sinusoidal three-phase system, so it does not model phase imbalance, harmonic distortion from VFDs and rectifiers, inrush, or duty cycle. Treat the result as an estimate and have a qualified electrical engineer confirm cable sizing, protection and compliance with the standards that apply where you are.",
    ],
  ],
};

export default seo;
