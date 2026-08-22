const seo = {
  title: "Driveway Sealer Calculator: Gallons, Pails, Coats",
  metaDescription:
    "Turn driveway area, surface porosity and coat count into gallons, litres and 5-gallon pails at ~75 sq ft/gal asphalt or 250 for concrete sealer.",
  steps: [
    "Set \"Measure by\" to Length × width or Total area and enter the driveway in Feet or Metres, plus any extra apron or pad.",
    "Choose the surface and sealer type — asphalt emulsion/coal-tar or concrete acrylic/silane-siloxane — the surface condition, the number of coats (1-4) and the waste / overlap allowance (%).",
    "Read \"Sealer to buy\" in 5-gallon pails with the total gallons and litres, check the coat-by-coat table, then press \"Copy result\".",
  ],
  intro:
    "This calculator turns a driveway's area, surface porosity and coat count into gallons, litres and 5-gallon pails of sealer, using the spread rates manufacturers actually publish — roughly 75 square feet per gallon per coat for asphalt emulsion or coal-tar sealer on an average surface, and about 250 for a concrete acrylic or silane-siloxane sealer. It applies a 25% higher coverage to the second and later coats, because the first coat has already filled the surface pores, and adds a waste allowance for overlap and spillage. Intended for homeowners buying sealer once and not wanting to make a second trip.",
  useCases: [
    "Working out how many pails a 60 × 12 ft asphalt driveway needs for two coats before going to the store",
    "Checking whether the 'covers up to 500 sq ft' claim on a pail holds for a weathered surface with aggregate showing",
    "Budgeting a resealing job including pourable crack filler for the linear feet of cracks you have measured",
  ],
  benefits: [
    [
      "Second coat costs less",
      "Later coats cover about 25% more area than the first, so assuming equal coats over-buys by roughly a fifth.",
    ],
    [
      "Porosity drives the answer",
      "A never-sealed, rough surface drinks nearly twice the sealer of a smooth new one at the same area.",
    ],
    [
      "Whole pails, not fractions",
      "Rounds to purchasable 5-gallon pails and shows how much will be left over.",
    ],
  ],
  faqs: [
    [
      "How much driveway sealer do I need for 1,000 square feet?",
      "About 24 gallons — five 5-gallon pails, with roughly 1 gallon left over — for two coats on an average asphalt surface. That is 1,000 ft² at roughly 75 ft² per gallon for the first coat (13.3 gallons) plus about 94 ft² per gallon for the second (10.7 gallons), before any waste allowance.",
    ],
    [
      "How many square feet does a 5 gallon bucket of driveway sealer cover?",
      "Around 375 square feet for one coat on average asphalt, or roughly 208 square feet if you are applying two coats (the second coat covers more per gallon, but you are buying enough gallons to cover the same footprint twice). Pails often claim 'up to 500 sq ft', which assumes a smooth, tight surface and thin application; a porous or never-sealed driveway can drop coverage to about 50 square feet per gallon.",
    ],
    [
      "Do I need one coat or two coats of driveway sealer?",
      "Two coats on a driveway that has not been sealed in several years, one coat for routine maintenance every two to three years. The first coat is absorbed into the surface and rarely looks uniform on its own; the second builds the wear layer that does the actual protecting.",
    ],
    [
      "When should you not seal a driveway?",
      "Do not seal below about 10 °C (50 °F), with rain forecast in the next 24 hours, or on asphalt laid less than 90 days ago — fresh asphalt still needs to cure and release its oils. Keep vehicles off for 24 to 48 hours; foot traffic is usually fine after 4 to 8 hours.",
    ],
  ],
};

export default seo;
