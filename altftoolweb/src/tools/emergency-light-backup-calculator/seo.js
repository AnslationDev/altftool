const seo = {
  title: "Emergency Light Backup Calculator with Peukert",
  metaDescription:
    "Runtime from battery V, Ah, depth of discharge and state of health against LED load and driver loss, derated by Peukert, plus recharge time.",
  steps: [
    "Under Battery, pick the Chemistry and enter Nominal voltage (V), Rated capacity (Ah) and State of health (%).",
    "Under Load, set Number of LED heads, Watts per head, Driver efficiency (%) and Control circuit standby (W), then your target hours.",
    "Read Backup time against that target, with usable Wh at the applied depth of discharge, the runtime after Peukert derating and the recharge time.",
  ],
  intro:
    "This calculator gives the run time of an emergency light as usable energy divided by drawn power: usable Wh = voltage x amp-hours x depth of discharge x state of health, and drawn watts = LED load / driver efficiency + standby load. It also applies the Peukert equation t = H x (C / (I x H))^n, which is why a 12 V 7.2 Ah lead-acid battery running a 9 W lamp lasts closer to three and a half hours than the four the arithmetic alone suggests. Intended for anyone specifying an emergency light, an inverter-backed LED circuit or a battery upgrade.",
  useCases: [
    "Checking whether an existing 12 V 7.2 Ah emergency light will hold a 3-hour duration test with two 9 W heads on it",
    "Sizing the amp-hours needed before buying, when the fire officer has asked for 1 hour of escape lighting",
    "Seeing how much run time is left in a battery that has aged to 70% of its rated capacity",
  ],
  benefits: [
    ["Depth of discharge applied", "Uses 50% for lead-acid and 80% for lithium instead of pretending the whole battery is usable."],
    ["Peukert derating", "Shows the shorter, realistic lead-acid run time at the actual discharge current."],
    ["Recharge time too", "Adds the charge factor, so you know how long the light is unprotected after a long outage."],
  ],
  faqs: [
    [
      "How do I calculate emergency light battery backup time?",
      "Multiply battery voltage by amp-hours to get watt-hours, multiply by the usable depth of discharge, then divide by the watts the load actually pulls from the battery. A 12 V 7.2 Ah lead-acid battery at 50% depth of discharge holds 43 Wh, and a 9 W LED behind an 85% efficient driver pulls about 11 W, giving roughly 3.9 hours before Peukert derating and about 3.4 hours after it.",
    ],
    [
      "How long must emergency lighting stay on?",
      "One hour is the minimum duration for escape lighting under EN 1838, rising to three hours where the building is occupied at night or evacuation will not be immediate; Indian practice under the National Building Code uses the same one-hour and three-hour bands. The duration your local fire authority signs off on is the one that counts, so confirm it before sizing the battery.",
    ],
    [
      "Why does a battery give less run time than its amp-hour rating suggests?",
      "Lead-acid capacity is quoted at the slow 20-hour rate, and discharging faster than that returns fewer amp-hours — the Peukert exponent of about 1.15 for VRLA is what quantifies the loss. On top of that, only half a lead-acid battery is usable in cyclic service, the driver wastes 10 to 20 per cent, and an aged battery may hold only 70 to 80 per cent of its printed capacity.",
    ],
    [
      "How often should emergency lights be tested?",
      "The usual regime is a short function test every month and a full-duration discharge test once a year, with the result written into the log book. A battery that fails to hold its rated duration in the annual test should be replaced rather than topped up, since lead-acid capacity fade is not recoverable by charging.",
    ],
  ],
};

export default seo;
