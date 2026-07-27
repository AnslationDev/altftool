const seo = {
  intro:
    "This calculator gives the weight of a piece of wood as volume multiplied by density, and adjusts that density for moisture using the USDA Wood Handbook relation density(M) = 1000 x Gb x (1 + M/100) / (1 - 0.265 x a x Gb), where Gb is the basic specific gravity and a tapers to zero at the 30% fibre saturation point. It covers Indian species such as teak, sal and sheesham alongside engineered boards like plywood and MDF. Carpenters, shippers and site engineers use it to plan lifting, transport and shelf loads.",
  useCases: [
    "Checking whether a stack of planks is within a vehicle's payload before loading it",
    "Working out the shelf or bracket load a run of solid wood shelving will impose",
    "Comparing the weight of green versus seasoned timber before agreeing a freight rate",
  ],
  benefits: [
    ["Moisture is modelled, not ignored", "Green timber can weigh 30% more than the same seasoned board."],
    ["Indian and imported species", "Teak, sal, sheesham, mango and rubberwood alongside oak, maple and pine."],
    ["Engineered boards included", "Plywood, MDF, particle board and blockboard use their manufactured density."],
  ],
  faqs: [
    [
      "How much does teak wood weigh per cubic foot?",
      "Seasoned teak at 12% moisture has a density of about 650 kg per cubic metre, which is roughly 18.4 kg per cubic foot or 40.6 lb per cubic foot. Freshly felled teak at 60% moisture works out closer to 850 kg per cubic metre, about 30% heavier.",
    ],
    [
      "How do you calculate the weight of wood?",
      "Multiply the volume by the density at the wood's current moisture content. A 25 mm x 200 mm x 2 m teak plank is 0.01 cubic metres, so at 650 kg per cubic metre it weighs 6.5 kg.",
    ],
    [
      "Why does wet wood weigh more than dry wood?",
      "Water itself adds mass, and below about 30% moisture content the wood cell walls also swell, changing the volume. That 30% figure is the fibre saturation point: above it the timber has stopped swelling and every extra percent of moisture is simply water in the cell cavities.",
    ],
    [
      "How much does an 8 x 4 sheet of 18 mm MDF weigh?",
      "A standard 2440 x 1220 x 18 mm MDF sheet is 0.0536 cubic metres, and at a typical 750 kg per cubic metre that is about 40 kg. Plywood of the same size at around 600 kg per cubic metre comes in near 32 kg, which is why sheet goods usually need two people to handle.",
    ],
  ],
};

export default seo;
