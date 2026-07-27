const seo = {
  intro:
    "A water tank refill time calculator divides the litres still missing from the tank by the net rate water enters it — the pump's discharge minus anything drawn off taps at the same time — to give the minutes the pump must run. It then prices the fill using the hydraulic power equation P = ρgQH with ρ = 998 kg/m³ and g = 9.80665 m/s², divided by the pump's wire-to-water efficiency, so you see both the running time and the units of electricity each fill consumes.",
  useCases: [
    "Setting a phone timer so a 1,000 litre roof tank never overflows down the outside wall",
    "Comparing what a 0.5 HP and a 1 HP monoblock would cost per fill before buying either",
    "Explaining a jump in the electricity bill after the borewell water table dropped and the lift increased",
  ],
  benefits: [
    ["Net rate, not gross", "Subtracts taps running during the fill instead of assuming a closed system."],
    ["Real pump physics", "Uses the ρgQH hydraulic power equation and your own efficiency figure."],
    ["Cost per fill", "Turns running minutes into kilowatt-hours and rupees at your tariff."],
  ],
  faqs: [
    [
      "How long does a 1 HP pump take to fill a 1,000 litre tank?",
      "A typical 1 HP domestic monoblock delivering about 60 litres a minute fills an empty 1,000 litre tank in roughly 17 minutes. The real figure depends on the lift: discharge falls along the pump curve as head rises, so the same pump lifting 30 m may deliver only half its rated flow.",
    ],
    [
      "How much electricity does filling a water tank use?",
      "Filling 1,000 litres to a 12 m head takes about 0.033 kWh of hydraulic energy, which becomes roughly 0.055 kWh at the meter for a pump running at 60% wire-to-water efficiency — under one rupee at a ₹8 per unit tariff. Cost scales directly with both the litres and the height they are lifted.",
    ],
    [
      "What is total head and how do I estimate mine?",
      "Total head is the vertical distance from the water level in the sump to the tank inlet, plus friction losses in the pipe and fittings. For a short, correctly sized domestic line, adding about 10% to the static lift is the usual allowance; long runs, narrow pipe or many bends need considerably more.",
    ],
    [
      "Why does the tank take longer to fill than the calculator says?",
      "The three usual causes are a pump discharging below its rated flow because of the head, taps or a flush drawing water during the fill, and a partly clogged foot valve or strainer. Enter your measured flow — time how long the pump takes to fill a known bucket — rather than the rating on the nameplate.",
    ],
  ],
};

export default seo;
