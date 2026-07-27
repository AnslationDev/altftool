const seo = {
  intro:
    "This calculator estimates the cooling load of a bedroom in BTU per hour and converts it to air-conditioner tonnage, where one ton of refrigeration equals 12,000 BTU/hr. It starts from a base load of about 80 BTU/hr per square foot at a 10 ft ceiling under Indian summer design conditions, then applies the standard field corrections: ceiling height, a sun-exposed roof overhead, window sun exposure, climate zone, occupants beyond two at 600 BTU/hr each, and the waste heat of electronics at 3.41 BTU/hr per watt. The result is rounded up to the nearest capacity actually sold — 0.8, 1, 1.5, 2 or 2.5 ton.",
  useCases: [
    "Deciding between a 1 ton and 1.5 ton AC for a 12 x 12 ft bedroom on the top floor of a Delhi flat",
    "Checking whether a north-facing, heavily shaded 10 x 11 ft guest room really needs more than a 0.8 ton unit",
    "Sizing for a children's room where three people sleep and a desktop plus router run all night",
  ],
  benefits: [
    ["Corrects for the roof", "A sun-baked slab directly overhead adds roughly 15% to the load — the single biggest reason top-floor bedrooms feel undercooled."],
    ["Shows the working", "Every multiplier and every BTU of internal gain is listed, so you can argue the number with a dealer."],
    ["Warns about oversizing", "Reports spare capacity, because an oversized AC short-cycles and leaves the room cold but clammy."],
  ],
  faqs: [
    [
      "Is 1 ton AC enough for a 12x12 room?",
      "Usually yes for a shaded 144 sq ft bedroom on a middle floor, but not on the top floor. At the base rate of about 80 BTU/hr per sq ft, 144 sq ft needs roughly 11,500 BTU/hr, which is just under 1 ton — add the 15% roof uplift for a top-floor room and it crosses 13,000 BTU/hr, which needs a 1.5 ton unit.",
    ],
    [
      "How many square feet does a 1.5 ton AC cover?",
      "About 225 sq ft at base conditions. A 1.5 ton unit delivers 18,000 BTU/hr, and at roughly 80 BTU/hr per sq ft that covers around 225 sq ft with a 10 ft ceiling, average sun and no exposed roof. Coverage drops to about 170-190 sq ft on a top floor or with a long west-facing window.",
    ],
    [
      "Does the top floor need a bigger AC?",
      "Yes — plan on roughly 15% more capacity if an uninsulated RCC roof sits directly above the room and is exposed to the sun. The slab absorbs heat all afternoon and re-radiates it into the room well after sunset, which is why top-floor bedrooms stay warm at night.",
    ],
    [
      "Is it bad to buy an AC bigger than I need?",
      "Yes, beyond about 25% headroom. An oversized unit cools the air fast, hits the setpoint and switches off before it has run long enough to condense moisture out of the room, leaving a cold but humid feel, and the frequent starts wear the compressor. Sizing close to the calculated load, then choosing an inverter model to handle part-load, works better.",
    ],
  ],
};

export default seo;
