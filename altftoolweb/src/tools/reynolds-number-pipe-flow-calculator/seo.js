const seo = {
  title: "Reynolds Number Calculator for Pipe Flow",
  metaDescription:
    "Re = ρvD/μ with the laminar, transitional or turbulent regime, plus the Darcy friction factor, pressure drop, head loss and volumetric flow.",
  steps: [
    "Enter fluid density in kg/m³, dynamic viscosity in mPa·s, mean velocity in m/s, and pipe inside diameter, length and absolute roughness — or load the 'Water in 50 mm pipe' example.",
    "The result recalculates as you type, taking the friction factor from 64/Re below Re 2300 and the Swamee–Jain correlation above it.",
    "Read the Reynolds number with its laminar, transitional or turbulent caption, then Copy or Download the friction factor, pressure drop, head loss and volumetric flow.",
  ],
  intro:
    "This calculator works out the Reynolds number of a fluid in a round pipe as Re = ρvD/μ, classifies the flow as laminar, transitional or turbulent, and then returns the Darcy friction factor, pressure drop, head loss and volumetric flow for that run of pipe. It is built for piping and HVAC engineers, process technicians and fluid-mechanics students who have density, viscosity, velocity, diameter, length and roughness in hand and want the whole set of numbers at once. Friction factor comes from 64/Re in the laminar range and the Swamee–Jain explicit approximation to Colebrook–White above it, with pressure drop from Darcy–Weisbach: Δp = f · (L/D) · ρv²/2.",
  useCases: [
    "Sizing a 50 mm water line at 2 m/s and needing to know whether the 20 m run costs you a fraction of a metre of head or something the pump cannot cover.",
    "Checking whether a viscous fluid is still laminar after a velocity increase, because the friction factor jumps from 64/Re to the turbulent branch the moment Re crosses about 2300.",
    "Comparing commercial steel at 0.045 mm absolute roughness against smoother tubing to see how much of the pressure drop is actually down to wall roughness.",
  ],
  benefits: [
    ["Full result set, not just Re", "One run returns Reynolds number, regime, friction factor, pressure drop, head loss, volumetric flow and relative roughness."],
    ["Regime-correct friction factor", "It switches automatically between 64/Re below Re 2300 and the Swamee–Jain turbulent correlation, instead of applying one formula everywhere."],
    ["Practical input units", "Viscosity in mPa·s, diameter and roughness in mm, length in m — the units on real datasheets, converted internally to SI."],
  ],
  faqs: [
    [
      "What Reynolds number means turbulent flow in a pipe?",
      "Above roughly Re = 4000 pipe flow is treated as turbulent. Below Re = 2300 it is laminar, and the band between 2300 and 4000 is transitional, where behaviour is unstable and pressure-drop predictions are least reliable. This calculator labels the result using those same two thresholds.",
    ],
    [
      "How is the Reynolds number calculated here?",
      "Re = ρvD/μ, using fluid density in kg/m³, mean velocity in m/s, the pipe's inside diameter in metres and dynamic viscosity in Pa·s. Your inputs in mPa·s and mm are converted first, so 998 kg/m³ water at 1.002 mPa·s moving 2 m/s through a 50 mm pipe gives Re of about 99,600 — firmly turbulent.",
    ],
    [
      "Which friction factor formula does it use?",
      "It uses f = 64/Re for laminar flow and the Swamee–Jain explicit approximation for turbulent flow, an algebraic stand-in for the implicit Colebrook–White equation that stays within about 1% of it over the usual range of relative roughness and Reynolds number. Pressure drop then follows Darcy–Weisbach.",
    ],
    [
      "Does the head loss include bends, valves and elevation change?",
      "No — it is straight-pipe friction loss only, for steady, fully developed, single-phase flow. Minor losses from fittings, entrances, valves and elevation change must be added separately, and the note on the tool flags temperature effects, compressibility and cavitation as things to check before committing to a design.",
    ],
  ],
};

export default seo;
