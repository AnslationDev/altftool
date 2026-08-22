const seo = {
  title: "Series & Parallel DC Circuit Simulator",
  metaDescription:
    "Set 1-48 V and two 1-100 ohm resistors, wire them in series or parallel, open the switch: resistance, current and power update with the electron flow.",
  steps: [
    "Under \"Circuit Configuration\" choose \"Series Circuit\" or \"Parallel Circuit\", then drag \"Battery Voltage\" between 1 and 48 V and the \"Resistor R1\" and \"Bulb Resistance R2\" sliders between 1 and 100 ohms.",
    "Use \"Close Switch\" and \"Open Switch\" to complete or break the loop — an open switch halts the electron animation on the canvas and the bulb stops glowing.",
    "\"Live Multimeter Readout\" reports Total Resistance, Current, Power and a Circuit Status of Closed (Flowing) or Open (Broken), recalculated as I = V ÷ R and P = V × I on every change; \"Reset\" restores the defaults.",
  ],
  intro:
    "Electric Circuit Builder is an interactive DC circuit schematic that solves Ohm's law live as you change the parts: set the battery from 1 V to 48 V, set two resistors between 1 Ω and 100 Ω each, wire them in series or parallel, and open or close the switch. It computes total resistance (R₁ + R₂ in series, R₁R₂ ÷ (R₁ + R₂) in parallel), current as I = V ÷ R and power as P = V × I, then animates electron flow around the loop and brightens the bulb in proportion to the power dissipated. It is built for students and teachers who want to see cause and effect rather than work through the algebra on paper.",
  useCases: [
    "A student cannot see why swapping a series circuit for a parallel one raises the current, and wants to watch total resistance drop and the ammeter reading climb on the same components.",
    "A teacher is demonstrating that an open switch means zero current everywhere in a series loop, not just at the switch, and needs the electron animation to stop on screen.",
    "Someone revising for a physics exam wants to check their hand calculation of P = I²R by setting the same voltage and resistances and comparing with the live multimeter readout.",
  ],
  benefits: [
    [
      "Three readings update together",
      "Total resistance, current and power are recalculated on every slider move, so the trade-off between them is visible instead of being three separate exercises.",
    ],
    [
      "Series and parallel on identical components",
      "One toggle rewires the same two resistors, which isolates the effect of topology from the effect of changing a component value.",
    ],
    [
      "Bulb brightness tied to real power",
      "The glow scales with computed watts rather than being decorative, so doubling the voltage visibly does more than doubling the light.",
    ],
  ],
  faqs: [
    [
      "What is Ohm's law?",
      "Ohm's law states V = I × R: current equals voltage divided by resistance. With the default 12 V battery and a 10 Ω and 20 Ω resistor in series, total resistance is 30 Ω and the current is 12 ÷ 30 = 0.4 A.",
    ],
    [
      "How do I calculate total resistance in series and in parallel?",
      "In series resistances simply add, so 10 Ω and 20 Ω give 30 Ω. In parallel the equivalent is R₁R₂ ÷ (R₁ + R₂), so the same pair gives 200 ÷ 30 ≈ 6.7 Ω — always lower than the smaller resistor, which is why parallel wiring draws more current from the same battery.",
    ],
    [
      "Why does the current stop when the switch is open?",
      "An open switch breaks the conducting loop, and charge cannot flow unless there is a complete path back to the battery. The readout drops to 0 A and 0 W, and the electron animation halts, regardless of how high the battery voltage is set.",
    ],
    [
      "How is electrical power calculated here?",
      "As P = V × I, which is equivalent to I²R. At 12 V with a 30 Ω series total the current is 0.4 A, giving 4.8 W; rewiring the same resistors in parallel raises the current to about 1.8 A and the power to roughly 21.6 W from the same battery.",
    ],
  ],
};

export default seo;
