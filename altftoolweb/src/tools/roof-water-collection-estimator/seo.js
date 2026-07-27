const seo = {
  intro:
    "This estimator applies the standard rainwater harvesting formula — litres = plan roof area in square metres x rainfall in millimetres x runoff coefficient — because one millimetre of rain on one square metre is exactly one litre. It uses the runoff coefficients published in Central Ground Water Board rooftop harvesting guidance (about 0.85 for an RCC terrace, 0.9 for metal sheet, 0.75 for clay tile) and subtracts a first-flush diversion of roughly one litre per square metre from every storm. Written for homeowners and society committees sizing a sump before they commit to plumbing.",
  useCases: [
    "Checking whether a 1,000 sqft terrace can fill a 5,000 litre sump in one 50 mm monsoon downpour",
    "Sizing storage for a housing society before applying for a rainwater harvesting completion certificate",
    "Working out how many tanker loads a year of harvesting would replace at the local per-kilolitre rate",
  ],
  benefits: [
    ["Plan area, correctly", "Uses the horizontal footprint, which is what a roof actually catches, rather than the sloped surface."],
    ["First flush accounted for", "Deducts the dirty opening millimetre of every storm instead of counting it as yield."],
    ["Overflow made visible", "Shows how much of a big storm your tank simply cannot hold, which is what decides the sump size."],
  ],
  faqs: [
    [
      "How much rainwater can I collect from my roof?",
      "Multiply the roof's plan area in square metres by the rainfall in millimetres and by the runoff coefficient. A 100 sqm RCC terrace with a coefficient of 0.85 yields about 4,165 litres from a 50 mm storm after a 1 mm first flush, and roughly 71,000 litres over a year of 900 mm rainfall.",
    ],
    [
      "What is a runoff coefficient for a roof?",
      "It is the share of rainfall that reaches the downpipe rather than being lost to wetting, splashing and evaporation — about 0.9 for smooth metal sheet, 0.85 for a plastered RCC terrace, 0.75 for clay tiles and 0.6 for a gravel or green roof. Multiplying by it is what separates a realistic yield from the theoretical maximum.",
    ],
    [
      "Do I use the sloped roof area or the flat plan area?",
      "The plan area, because rain falls vertically and a pitched roof only intercepts what its horizontal shadow covers. A 6-in-12 roof has 11.8% more surface than its footprint but collects no extra water, so using the sloped figure over-states the harvest by that amount.",
    ],
    [
      "Why is a first-flush diverter needed?",
      "The opening millimetre or two of a storm washes dust, leaves and bird droppings off the roof, and sending that into the tank is what spoils stored water. Diverting about one litre per square metre of roof costs only around 1% of a heavy storm's yield while removing most of the contamination load.",
    ],
  ],
};

export default seo;
