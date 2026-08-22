const seo = {
  title: "Ohm's Law Calculator — Solve V, I or R plus Power",
  metaDescription:
    "Enter any two of voltage, current and resistance to get the third from V = I x R, plus power in watts — volts, amps, ohms and watts shown together.",
  intro:
    "The Ohm's Law Calculator solves V = I × R for whichever of voltage, current or resistance you leave blank, then reports the power dissipated as P = V × I. Fill in any two of the three fields and it returns the missing quantity plus a full breakdown in volts, amps, ohms and watts. It is built for electronics hobbyists, students and anyone sizing a resistor or checking whether a supply can carry a load.",
  useCases: [
    "Picking a current-limiting resistor for an LED: you know the 5 V supply and want 20 mA through the LED, so you enter voltage and current to get the resistance and the wattage the resistor has to survive.",
    "Checking whether a bench supply is safe for a heating element you measured at 8 Ω — enter 12 V and 8 Ω and see the current draw and power before you connect it.",
    "Working backwards from a measured current: your multimeter reads 0.45 A through an unknown load on a 9 V rail, and you want its effective resistance and how much heat it is producing.",
  ],
  benefits: [
    ["Solves for whichever value is missing", "Leave any one of the three fields blank and it rearranges V = I × R for you instead of making you pick a formula."],
    ["Power comes with every answer", "Every result includes P = V × I in watts, which is the number that decides resistor and heatsink ratings."],
    ["Full four-row breakdown", "Voltage, current, resistance and power are all shown together, so you can sanity-check the whole circuit at a glance."],
  ],
  faqs: [
    [
      "What is the formula for Ohm's law?",
      "Ohm's law is V = I × R: voltage in volts equals current in amps multiplied by resistance in ohms. Rearranged, I = V / R and R = V / I, which is exactly what this calculator does depending on which field you leave empty.",
    ],
    [
      "How do I calculate power from voltage and current?",
      "Power in watts is P = V × I — multiply the voltage across the component by the current through it. A 12 V supply pushing 2 A delivers 24 W, and substituting Ohm's law also gives the equivalent forms P = I² × R and P = V² / R.",
    ],
    [
      "What resistor do I need for an LED?",
      "Subtract the LED's forward voltage from the supply voltage, then divide by the target current. For a typical red LED with a 2 V forward drop on a 5 V supply at 20 mA, R = (5 − 2) / 0.02 = 150 Ω, dissipating about 0.06 W, so a standard 1/4 W resistor is ample.",
    ],
    [
      "Does Ohm's law apply to AC circuits?",
      "Only in the simple form for purely resistive loads; with capacitors or inductors you replace resistance with impedance (Z) and use V = I × Z. This calculator handles the DC or resistive-AC case, where reactance is zero and the arithmetic stays as V = I × R.",
    ],
  ],
};

export default seo;
