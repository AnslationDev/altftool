const seo = {
  title: "Concrete Volume Calculator: m³, Cement Bags, Sand",
  metaDescription:
    "Slab, column or sloped-footing volume in m³ and cft, then 50 kg cement bags, sand, aggregate and water by IS 456 mix from M5 to M25.",
  steps: [
    "Choose the Member shape — Rectangular (slab, beam, footing, square column), Circular column / pile or Trapezoidal (sloped footing) — and the Dimension unit in m, cm, mm, ft or in.",
    "Type the dimensions and Number of identical members, then pick a Concrete grade such as \"M20 — 1 : 1.5 : 3\", a Wastage allowance (%) and a Water-cement ratio.",
    "Read \"Concrete to order\" in m³ and cft with the Dry material volume (x 1.54) line and Cement bags (50 kg), then press Copy result.",
  ],
  intro:
    "A concrete volume calculator converts the dimensions of a slab, beam, column, pile or sloped footing into the cubic metres of concrete to order and the cement, sand, aggregate and water inside it. Volumes come straight from the geometry — length × width × depth for rectangular members, πr²h for circular columns and the frustum formula h/3 × (A₁ + A₂ + √(A₁A₂)) for sloped footings — then the placed volume is multiplied by the 1.54 dry-volume factor and split by the IS 456:2000 nominal mix ratio you pick. It is written for site engineers, contractors and self-builders who need a purchase list, not just a number.",
  useCases: [
    "Ordering ready-mix for a 5 m × 4 m × 125 mm roof slab and knowing how much to add for spillage before the pump arrives",
    "Costing the cement bags, sand and 20 mm aggregate for twelve identical 300 mm × 300 mm columns mixed on site at M20",
    "Checking the concrete in a sloped footing where the base is 2 m × 2 m and the top pedestal is only 1 m × 1 m",
  ],
  benefits: [
    ["Geometry plus take-off", "Gives the volume and the bag, sand, aggregate and water quantities in one pass, in m³ and cft."],
    ["Standard mix ratios built in", "M5 to M25 nominal proportions from IS 456:2000, with the typical application for each grade."],
    ["Any unit on site", "Enter metres, centimetres, millimetres, feet or inches — the conversion happens before the maths."],
  ],
  faqs: [
    [
      "How many cement bags are needed for 1 m³ of M20 concrete?",
      "About 8 bags of 50 kg cement, or roughly 400 kg. The 1 : 1.5 : 3 nominal mix over a dry volume of 1.54 m³ gives 0.28 m³ of cement, and each 50 kg bag occupies 0.0347 m³ at a bulk density of 1440 kg/m³.",
    ],
    [
      "Why is concrete volume multiplied by 1.54?",
      "Because loose dry ingredients lose their air voids once they are mixed, compacted and placed, so you need about 54% more dry material than the finished wet volume. Indian site practice uses 1.54 for concrete and around 1.30–1.33 for mortar; the accepted band for concrete is 1.52 to 1.57.",
    ],
    [
      "How do I calculate the concrete for a slab?",
      "Multiply length × width × thickness in consistent units. A 5 m × 4 m slab that is 125 mm thick is 5 × 4 × 0.125 = 2.5 m³, and with a 5% wastage allowance you would order 2.63 m³ or about 92.7 cubic feet.",
    ],
    [
      "How much water goes into a concrete mix?",
      "Water is set by the water-cement ratio, typically 0.45 to 0.55 for nominal mixes without a plasticiser — so 400 kg of cement takes about 200 litres. Lower ratios give higher strength but stiffer concrete; the exact figure for a structural pour should come from the approved mix design, not a rule of thumb.",
    ],
  ],
};

export default seo;
