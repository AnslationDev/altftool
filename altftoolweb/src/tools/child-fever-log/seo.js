const seo = {
  title: "Child Fever Log: Core-Equivalent Temps and Fluids",
  metaDescription:
    "Logs each reading with site, fluids and medicine, corrects armpit and oral temps to core, and sets a Holliday-Segar fluid target from weight.",
  intro:
    "The Child Fever Log records each temperature reading with the time, the measurement site, the fluids your child drank and any medicine given, then converts every reading to a core-equivalent temperature so the numbers are comparable. It uses the standard fever definition of 38.0 °C (100.4 °F) core, adds the usual site corrections of about 0.5 °C for armpit and 0.4 °C for oral readings, and estimates daily fluid needs with the Holliday-Segar 100/50/20 mL/kg maintenance rule plus roughly 12% extra per degree of fever. The output is a plain summary you can read out at a clinic or paste into a message.",
  useCases: [
    "Keeping an accurate overnight record of a toddler's temperature so the GP sees the actual pattern rather than a vague recollection.",
    "Checking how much water, milk or ORS a 12 kg child has taken against the roughly 1,100 mL a day they need before fever is added.",
    "Tracking when the last dose of paracetamol was given so nobody repeats it inside the four-hour minimum gap.",
    "Spotting that a fever has now run five days, the point at which most guidance says to have the child reviewed.",
  ],
  benefits: [
    ["Comparable readings", "Armpit, oral and ear readings are corrected to a common core-equivalent figure so a rise or fall is real, not a thermometer artefact."],
    ["Fluid target, not guesswork", "Daily fluid need is calculated from weight with the Holliday-Segar rule and increased for the height of the fever."],
    ["A summary a clinician can use", "One copy button produces the timeline, peak, duration, fluids and dose timing in the order a doctor asks for them."],
  ],
  faqs: [
    [
      "What temperature counts as a fever in a child?",
      "A core temperature of 38.0 °C (100.4 °F) or higher is a fever. Armpit readings run about 0.5 °C below core and oral readings about 0.4 °C below, so an armpit reading of 37.5 °C already corresponds to a fever. Ear and forehead thermometers are usually calibrated to display the core-equivalent value directly.",
    ],
    [
      "When should I take a child with fever to a doctor?",
      "Immediately for any fever of 38.0 °C or more in a baby under three months, and the same day for a temperature of 39.0 °C or more in an infant aged three to six months. Also seek urgent help at any age for a non-blanching rash, laboured breathing, unusual drowsiness or floppiness, a seizure, or if the child simply seems seriously unwell.",
    ],
    [
      "How much fluid does a child with fever need each day?",
      "Start from maintenance fluids: 100 mL per kg for the first 10 kg, 50 mL per kg for the next 10 kg and 20 mL per kg above that. A 12 kg child therefore needs about 1,100 mL a day at baseline, and roughly 12% more for each degree of fever above 37 °C. Small, frequent sips are usually easier than large drinks.",
    ],
    [
      "How often can fever medicine be given to a child?",
      "Paracetamol is normally spaced at least four hours apart with a maximum of four doses in 24 hours, and ibuprofen at least six hours apart with a maximum of four doses. The actual dose depends on the child's weight and must come from the product label, a pharmacist or a doctor — this log tracks timing only and never suggests an amount.",
    ],
  ],
};

export default seo;
