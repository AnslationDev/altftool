const seo = {
  title: "Ideal Gas Law Calculator – Solve PV=nRT for P",
  metaDescription:
    "Solve PV = nRT for pressure, volume, moles or kelvin temperature with R = 8.314462618 kPa·L/(mol·K); every substituted value is listed with the answer.",
  steps: [
    "Choose what to find in the 'Solve for' menu — Pressure P, Volume V, Amount n or Temperature T — and type the other three values as Pressure P (kPa), Volume V (L), Amount n (mol) and Temperature T (K).",
    "Use the '1 mol at 25°C' example chip to load 101.325 kPa, 24.465 L, 1 mol and 298.15 K, or press Reset in the Inputs panel to return to the defaults.",
    "Read the result with its 'PV = nRT' caption and the substituted P, V, n, T and R values, then Copy it or Download it as ideal-gas-law-calculator.txt.",
  ],
  intro:
    "This calculator solves the ideal gas law PV = nRT for whichever of the four variables you leave unknown — pressure in kPa, volume in litres, amount in moles or absolute temperature in kelvin — using the gas constant R = 8.314462618 kPa·L·mol⁻¹·K⁻¹. Enter the three quantities you know, pick the one to solve for, and it returns the answer with the substituted values listed underneath. It suits chemistry and physics students and anyone checking a gas calculation against consistent SI-derived units.",
  useCases: [
    "Checking a stoichiometry answer where you know the moles of gas produced and need the volume it occupies at the reaction temperature",
    "Working out what pressure a fixed amount of gas reaches in a sealed vessel after it is warmed from room temperature",
    "Confirming a lab result by solving for n from a measured pressure, volume and temperature before comparing it with the expected yield",
  ],
  benefits: [
    ["Solves in any direction", "One form handles all four rearrangements — P = nRT/V, V = nRT/P, n = PV/RT and T = PV/nR — so you never rewrite the equation by hand."],
    ["Units fixed and consistent", "kPa, litres, moles and kelvin are paired with R = 8.314462618 kPa·L·mol⁻¹·K⁻¹, the combination in which the units cancel exactly, removing the commonest source of a wrong answer."],
    ["Shows the substitution", "The result is listed alongside every value used, including R, so you can copy the working into a lab report rather than just a number."],
  ],
  faqs: [
    [
      "What value of R does this use?",
      "R = 8.314462618 kPa·L·mol⁻¹·K⁻¹, which is the SI gas constant expressed for pressure in kilopascals and volume in litres. If you are working in atmospheres and litres the equivalent constant is 0.082057, and in Pa·m³ it is 8.314462618 — convert your inputs to kPa and L rather than swapping R.",
    ],
    [
      "Why must temperature be in kelvin?",
      "Because PV = nRT requires an absolute scale, where zero means zero thermal energy. Celsius has an arbitrary zero, so 0 °C would wrongly make PV zero. Add 273.15 to a Celsius reading: 25 °C is 298.15 K, the default used here.",
    ],
    [
      "What volume does one mole of gas occupy?",
      "About 24.465 L at 25 °C and 101.325 kPa, which is the default case loaded in the calculator. At 0 °C (273.15 K) and the same pressure the molar volume is roughly 22.414 L — the figure usually quoted as standard molar volume at STP.",
    ],
    [
      "When does the ideal gas law stop being accurate?",
      "At high pressure, low temperature, near a phase boundary or with reactive and strongly polar gases. The law assumes molecules have no volume and no attraction between them; those assumptions fail as the gas approaches condensation. For those conditions use a real-gas equation such as van der Waals or a compressibility factor.",
    ],
  ],
};

export default seo;
