const seo = {
  title: "Paint Recoat Time Calculator: Temp and Humidity",
  metaDescription:
    "Tin drying times assume 30 C and 60% RH. Enter real temperature and humidity to get touch-dry, recoat and hard-dry times per coat.",
  steps: [
    "Choose the Paint type — Interior acrylic emulsion, Synthetic / oil-based enamel, 2K PU wood finish and six more — then enter Air temperature (C), Relative humidity (%) and Number of coats.",
    "Set First coat starts on and At (24-hour); the plan recalculates as you type and reports the Temperature effect, Humidity effect and Combined slowdown against the times printed on the tin.",
    "Read the Coat schedule table for each coat's Start, Touch dry and Next coat can go on times, then press Copy plan to copy the whole schedule.",
  ],
  intro:
    "This planner adjusts the drying times printed on a paint tin — which are measured at about 30 C and 60% relative humidity — for the temperature and humidity you are actually painting in, then lays each coat out on the clock. It applies the two effects that matter: drying time roughly doubles for every 10 C drop, and for waterborne paints it scales with the inverse of the vapour-pressure deficit, so 80% humidity roughly doubles the wait again. Painters, site supervisors and homeowners use it to decide whether the second coat can go on today.",
  useCases: [
    "A supervisor deciding whether a second emulsion coat will be safe to apply before the shift ends on a humid monsoon day",
    "A homeowner painting an unheated room in winter and finding the four-hour recoat has become twelve",
    "A polisher checking when a 2K PU topcoat will be hard enough to move the furniture back in",
  ],
  benefits: [
    ["Real conditions, not lab conditions", "Applies temperature and humidity factors to the datasheet times."],
    ["Clock times, not just hours", "Every coat, its touch-dry point and the recoat window appear as actual times."],
    ["Flags when to stop", "Warns below the minimum application temperature and when conditions push drying past the reliable range."],
  ],
  faqs: [
    [
      "How long should I wait between coats of emulsion paint?",
      "About 4 hours in the reference condition of roughly 30 C and 60% relative humidity. At 20 C that becomes about 8 hours, and at 20 C with 80% humidity closer to 16 hours — the tin's figure is a floor, not a promise.",
    ],
    [
      "Does humidity slow down paint drying?",
      "Yes, sharply for water-based paints, because the film dries by evaporating water into air that is already carrying moisture. Going from 60% to 80% relative humidity roughly halves the drying rate; solvent-based enamels are much less affected because their solvent leaves regardless.",
    ],
    [
      "What is the minimum temperature for painting?",
      "Most water-based emulsions specify application above 10 C, because below their minimum film-forming temperature the binder particles never coalesce and the film stays weak no matter how long it sits. Solvent-based enamels usually go down to about 5 C. Painting below the stated minimum is not fixed by waiting longer.",
    ],
    [
      "What is the difference between touch dry, hard dry and full cure?",
      "Touch dry means the surface no longer transfers to a finger; hard dry means the film resists light pressure and the surface can take gentle use; full cure is when the film reaches its final hardness and washability, typically about seven days for emulsions and enamels. Wash or scrub a wall before full cure and you will burnish it.",
    ],
  ],
};

export default seo;
