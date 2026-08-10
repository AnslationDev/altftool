const seo = {
  title: "RLC Resonance Calculator: Q Factor and Bandwidth",
  metaDescription:
    "Enter R in ohms, L in mH and C in µF for a series or parallel RLC circuit: resonant frequency, Q factor, −3 dB bandwidth and √(L/C) impedance.",
  steps: [
    "In the Inputs panel type Resistance R (Ω), Inductance L (mH) and Capacitance C (µF), or tap the '50 Ω · 10 mH · 1 µF' example chip to load them.",
    "Set Topology to Series RLC or Parallel RLC approximation — the result recomputes on every keystroke, so there is nothing to submit; Reset restores R 50, L 10 and C 1.",
    "Read the headline resonance in Hz plus Angular frequency, Q factor, Bandwidth, Approx. lower / upper and Characteristic impedance, then use Copy or Download to save rlc-resonance-filter-calculator.txt.",
  ],
  intro:
    "This calculator returns the resonant frequency of an RLC circuit as f₀ = 1 / (2π√(LC)), then the Q factor, −3 dB bandwidth, approximate lower and upper corner frequencies and the characteristic impedance √(L/C) for either a series or a parallel topology. Enter resistance in ohms, inductance in millihenries and capacitance in microfarads and it handles the unit conversion. Q is computed as √(L/C)/R for series and R·√(C/L) for parallel, which is why the same three components give very different selectivity in the two arrangements.",
  useCases: [
    "Picking L and C for a band-pass filter at a target centre frequency and checking whether the resulting bandwidth is narrow enough for the job.",
    "Working out why a series tank with 50 Ω of damping resistance is far less selective than expected — Q of √(L/C)/R falls as R rises in series and climbs as R rises in parallel.",
    "Checking a lab measurement: a 10 mH inductor with 1 µF should ring at about 1591.5 Hz, so a bench reading far from that points at a wrong component value or stray capacitance.",
  ],
  benefits: [
    ["Both topologies, correct Q each time", "It applies √(L/C)/R for series and R·√(C/L) for parallel rather than reusing one formula, so parallel tanks are not silently mis-rated."],
    ["Bandwidth and corners, not just f₀", "Every run also gives f₀/Q as bandwidth and the approximate −3 dB edges, which is what you actually need to judge a filter."],
    ["Datasheet units in, SI handled inside", "mH and µF are converted to henries and farads internally, removing the exponent slips that make resonance calculations go wrong by orders of magnitude."],
  ],
  faqs: [
    [
      "How do you calculate resonant frequency of an RLC circuit?",
      "f₀ = 1 / (2π√(LC)), with L in henries and C in farads. Resistance does not appear in it — 10 mH with 1 µF resonates at about 1591.5 Hz whether R is 1 Ω or 100 Ω, though R does set how sharp that resonance is.",
    ],
    [
      "What is the Q factor and how is it found here?",
      "Q is the ratio of stored to dissipated energy per cycle and sets selectivity: Q = √(L/C)/R for a series RLC and Q = R·√(C/L) for a parallel one. With 10 mH, 1 µF and 50 Ω in series the characteristic impedance √(L/C) is 100 Ω, giving Q = 2.",
    ],
    [
      "How is bandwidth related to Q?",
      "Bandwidth = f₀/Q, measured between the −3 dB points. At f₀ of 1591.5 Hz and Q of 2 that is about 795.8 Hz wide, so a higher Q narrows the passband and a lower Q broadens it.",
    ],
    [
      "Why does adding resistance help a parallel tank but hurt a series one?",
      "Because R sits differently in the two loops: in series it dissipates the circulating current, so Q falls as R rises, while in parallel a larger R bleeds off less of the tank current, so Q rises with R. The parallel result here is an approximation that ignores inductor winding resistance and other real losses, which will pull measured Q lower than the calculated figure.",
    ],
  ],
};

export default seo;
