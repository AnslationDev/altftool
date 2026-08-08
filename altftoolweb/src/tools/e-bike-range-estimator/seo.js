const seo = {
  title: "E-Bike Range Estimator: Wh per Km, Assist, Grade",
  metaDescription:
    "Estimate e-bike range from battery watt-hours, assist level, gradient and headwind, with the 250 W / 25 km/h pedelec cap and cold derating applied.",
  steps: [
    "Enter Battery voltage (V) and Battery capacity (Ah), then Rider weight (kg), E-bike weight (kg) and Cargo and luggage (kg).",
    "Set Riding speed (km/h), Bike and surface, Assist level, E-bike class, Average gradient (%), Headwind (km/h) and Ambient temperature (deg C).",
    "Read the range in km with its Wh per km and riding hours, compare the Range at every assist level list, then press Copy result.",
  ],
  intro:
    "This estimator works out electric bicycle range from first principles rather than quoting a brochure figure. It computes the power needed to hold your chosen speed against rolling resistance, air drag and gradient, splits that between you and the motor at the assist ratio you select, caps the motor at the legal limit for your class — 250 W and 25 km/h for an EU or Indian pedelec, 750 W for US classes — and then divides usable battery watt-hours by the resulting watt-hours per kilometre. Battery capacity is derated for the reserve the BMS keeps and for cold weather, where lithium-ion delivers roughly 82% of its rated capacity at freezing point.",
  useCases: [
    "Checking whether a 504 Wh battery will cover a 40 km round-trip commute in Tour mode with something in reserve",
    "Seeing how much range a hilly route costs compared with the same distance on the flat",
    "Working out whether Eco mode is enough to get home when the battery is already half empty",
  ],
  benefits: [
    ["Assist level modelled properly", "Support percentages are applied to rider power, the way real pedelec systems define them."],
    ["Legal caps applied", "Flags when the motor hits its wattage ceiling or the speed cut-off."],
    ["Cold weather included", "Battery capacity is derated with temperature, which brochures never do."],
  ],
  faqs: [
    [
      "How far can an e-bike go on one charge?",
      "A 500 Wh e-bike on flat tarmac in a mid assist level typically covers 70-90 km at around 5-6 watt-hours per kilometre. Sustained climbing can triple the energy use to 15 Wh per km, cutting the same battery to roughly 30 km.",
    ],
    [
      "Do I need a licence or registration for an e-bike in India?",
      "Not if the motor is rated at 250 W or less and assistance cuts out at 25 km/h — such e-bicycles are exempt from registration, driving licence and insurance requirements. Anything more powerful or faster is treated as a motor vehicle and must be registered. Confirm the current position with your local RTO before buying.",
    ],
    [
      "Why does my range drop so much in winter?",
      "Lithium-ion cells deliver less usable capacity when cold: around 92% of rated at 10 °C, 82% at 0 °C and about 70% at -10 °C. Storing the battery indoors and fitting it just before you ride recovers most of that loss.",
    ],
    [
      "How many watt-hours does an e-bike use per kilometre?",
      "Between roughly 4 and 8 Wh per km on flat ground in a low to mid assist level, rising past 15 Wh per km on sustained climbs or with heavy cargo. Multiply your battery's usable watt-hours by that figure's reciprocal to get range — a 500 Wh pack at 6 Wh/km gives about 83 km.",
    ],
  ],
};

export default seo;
