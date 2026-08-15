const seo = {
  title: "Wildfire Smoke Mask Selector: OSHA Protection Factors",
  metaDescription:
    "From PM2.5 or AQI, shows the exposure behind an N95, PAPR or full facepiece using OSHA factors, and how long you can stay out. Cloth gets no credit.",
  steps: [
    "Pick I have a PM2.5 reading or I only have the AQI, then enter the figure in Outdoor PM2.5 (µg/m³) or US EPA AQI.",
    "Choose the Mask you plan to wear — No mask, Cloth face covering, NIOSH N95, fit-checked, no valve, Loose-fitting PAPR with hood, Full-facepiece respirator with P100 filters and more — plus Minutes outdoors, How hard you will be working, Indoor air for the rest of the day, and an Exposure target to stay under.",
    "Read PM2.5 inhaled this trip, Particulate avoided, Your 24-hour average and Outdoor time before the target is passed, plus the Lightest mask that meets the target, then press Copy result.",
  ],
  intro:
    "The Wildfire Smoke Mask Selector matches a mask class to a smoke level using the assigned protection factors published in OSHA 29 CFR 1910.134 — 10 for N95 and other filtering facepiece respirators, 25 for a loose-fitting PAPR, 50 for a full-facepiece respirator, and none at all for cloth or surgical masks. From the PM2.5 concentration or the AQI, it shows the exposure you would still be breathing behind each mask, the micrograms inhaled during your trip, and how long you can be outside before your 24-hour average passes a chosen guideline.",
  useCases: [
    "Decide whether an N95 is enough for a 45-minute errand when PM2.5 is 180 µg/m³.",
    "Show a family member why the surgical mask in the drawer will not help during a smoke event.",
    "Work out how much a portable HEPA cleaner changes the day's total exposure when the outdoor air is bad.",
    "Check whether hard outdoor work is realistic in a respirator or should simply be postponed.",
  ],
  benefits: [
    ["Real protection factors", "Uses the OSHA APF table rather than filter-media percentages that assume a perfect seal."],
    ["Whole-day arithmetic", "Combines outdoor and indoor hours into a 24-hour average against WHO and EPA reference levels."],
    ["Honest about cloth masks", "Cloth and surgical masks are given no protection credit, matching CDC and EPA guidance."],
  ],
  faqs: [
    [
      "Do cloth or surgical masks help against wildfire smoke?",
      "No. Both the CDC and the US EPA state that cloth face coverings and surgical masks do not protect against the fine particles in wildfire smoke, because the material is too open and neither seals to the face. Only a NIOSH-approved respirator such as an N95, or an equivalent FFP2/KN95 worn with a good seal, gives meaningful protection.",
    ],
    [
      "How much protection does an N95 actually give?",
      "OSHA assigns filtering facepiece respirators a protection factor of 10, meaning the wearer's exposure is reduced to one tenth of the ambient concentration — a 90% reduction. That figure assumes correct sizing, no exhalation valve, a seal check before each use and no facial hair along the seal; a loose or bearded fit can lose most of that benefit.",
    ],
    [
      "What PM2.5 level is considered unsafe?",
      "The WHO 2021 24-hour guideline is 15 µg/m³ and its first interim target is 75 µg/m³; the US EPA 24-hour standard is 35 µg/m³. Wildfire smoke events routinely push outdoor PM2.5 above 150 µg/m³, which is why keeping indoor air clean matters as much as any mask.",
    ],
    [
      "Should I exercise outdoors wearing a respirator during a smoke event?",
      "Generally no. A respirator adds breathing resistance that rises with effort, sweat degrades the seal, and heavy breathing multiplies the volume of air drawn in — EPA inhalation rates go from about 0.0042 m³/min at rest to 0.049 m³/min at high intensity. Move the session indoors instead, and follow your clinician's advice if you have a heart or lung condition.",
    ],
  ],
};

export default seo;
