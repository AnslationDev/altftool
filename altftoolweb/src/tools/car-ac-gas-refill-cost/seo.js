const seo = {
  title: "Car AC Gas Refill Cost: R134a vs R1234yf with GST",
  metaDescription:
    "Cost a regas by charge weight and rate per gram, plus labour, parts and 18% GST, and compare R134a against the far pricier R1234yf.",
  steps: [
    "Pick a Refrigerant (R134a or R1234yf) and a Vehicle size, or type the exact Charge weight (grams) from the underbonnet AC label.",
    "Set Gas rate (₹ per gram) and Labour (₹), tick anything under Parts being replaced, and leave Add 18% GST on the invoice ticked.",
    "Read the itemised gas, labour, parts and tax lines beside the same job on the other refrigerant, then press Copy result.",
  ],
  intro:
    "The Car AC Gas Refill Cost calculator builds a regas estimate the way a workshop builds the invoice: refrigerant charged by weight at a rate per gram, plus labour, plus any parts and service-bay charges, with 18% GST — the Indian rate on motor vehicle servicing — applied to the total. Every money figure is editable, because rates differ sharply by city and workshop, while the charge weight itself is fixed by the manufacturer and printed on the underbonnet AC label. It also compares the same job on R134a and R1234yf, which is where most of the price difference between an older and a newer car comes from.",
  useCases: [
    "Sanity-checking a workshop quote for a regas before agreeing to the job",
    "Budgeting for a newer car that runs R1234yf rather than the cheaper R134a",
    "Working out how much of a quoted bill is gas and how much is labour, parts and tax",
  ],
  benefits: [
    ["Itemised like the invoice", "Separates gas, labour, parts and service charges instead of quoting one lump sum."],
    ["Refrigerant aware", "Handles R134a and R1234yf separately, and flags R12 systems as needing a retrofit, not a refill."],
    ["Editable rates", "Defaults are indicative; replace them with your workshop's actual figures for a real comparison."],
  ],
  faqs: [
    [
      "How much does a car AC gas refill cost?",
      "The gas itself is charged by weight, so cost depends on the refrigerant and the charge your car takes — typically 400 to 500 g for a hatchback and 650 to 900 g for an SUV. R134a is inexpensive per gram, while R1234yf costs many times more, which is why the same job on a newer car can run several times the bill. Add labour, any parts, and 18% GST.",
    ],
    [
      "How often should car AC gas be refilled?",
      "Ideally never on a schedule. Refrigerant is not consumed the way oil or fuel is — it circulates in a sealed loop. If the system has lost enough gas to cool poorly, it has a leak, and refilling without finding that leak simply means paying for the same gas again in a few months.",
    ],
    [
      "What is the difference between R134a and R1234yf?",
      "R1234yf is the newer refrigerant introduced to cut climate impact: its global warming potential is about 4, against roughly 1430 for R134a. It costs far more per gram, is mildly flammable, and requires its own recovery and charging machine, so not every workshop can service it. The two are not interchangeable — check the underbonnet label before any work.",
    ],
    [
      "Why does my car AC stop cooling after a few months?",
      "Almost always a leak that was never found. Common leak points are the condenser at the front of the car, where stone chips and corrosion attack it, the O-rings at every joint, and the compressor shaft seal. Ask for a UV dye or electronic sniffer leak test, and for the O-rings and receiver drier to be replaced whenever the system has been opened.",
    ],
  ],
};

export default seo;
