const seo = {
  title: "DIY vs Garage Car Service Cost Calculator (India)",
  metaDescription:
    "Price a car service twice — DIY parts vs a garage bill with parts markup, labour and 18% GST — and see when a tool kit pays for itself.",
  steps: [
    "Enter each part's Qty and Unit price (INR) under Parts and consumables (price excluding GST), using Add part for extra rows",
    "Fill the Workshop quote — Parts markup at the garage (%), Labour rate (INR per hour, ex-GST) and Labour hours billed — and the comparison recalculates with 18% GST on parts and labour as you type",
    "Read the You save per service figure and the Tool kit payback row (counted in services), then press Copy result to copy the line-by-line breakdown",
  ],
  intro:
    "This calculator prices a routine car service twice — once with parts you buy yourself and once as a workshop invoice with parts markup, billed labour hours and 18% GST — and reports the cash difference per service. It also amortises a one-time tool kit over the services it will cover, so you can see how many oil changes it takes before the spanners pay for themselves. Useful for owners of out-of-warranty cars deciding whether a minor service is worth doing in the driveway.",
  useCases: [
    "Deciding whether to change engine oil, the oil filter and the air filter yourself on a five-year-old hatchback instead of booking a minor service",
    "Checking whether a ₹3,500 jack-and-spanner kit is worth buying if you service two cars twice a year",
    "Sanity-checking a workshop estimate by pricing the same parts online and adding realistic labour hours",
  ],
  benefits: [
    ["Both taxes handled", "Applies 18% GST to parts and to labour separately, the way a real invoice splits them."],
    ["Time priced honestly", "Shows what your DIY hours effectively earn, so a small saving over a long afternoon is obvious."],
    ["Tool payback in services", "Converts a one-time kit purchase into the number of services before it breaks even."],
  ],
  faqs: [
    [
      "Is it cheaper to service my car myself?",
      "For a minor service it usually is, because the two big garage line items — parts markup and billed labour — both disappear. On the default numbers here a basic oil-and-filter service costs about ₹3,700 in the driveway against roughly ₹5,200 at a workshop, a saving near 29%. The gap narrows fast if you price your own time in.",
    ],
    [
      "What GST rate applies to car servicing in India?",
      "18%. Maintenance and repair of motor vehicles falls under SAC 998714 at 18% GST, and the common service consumables — lubricating oils under HSN 2710 and filters under HSN 8421 — are also in the 18% slab, so both halves of a service bill carry the same rate.",
    ],
    [
      "Does doing my own service void the warranty?",
      "It can. Manufacturers generally require scheduled services to be carried out at an authorised centre with approved parts while the vehicle is under warranty, and a claim can be rejected if the service history is missing. Once the warranty period is over that restriction no longer applies — read your owner's manual and warranty booklet, and ask the manufacturer if you are unsure.",
    ],
    [
      "What should I do with the used engine oil?",
      "Take it to an authorised used-oil collector or a workshop that accepts it — used engine oil is classified as hazardous waste under India's Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016, and pouring it down a drain or onto soil is an offence. Budget for a container and the trip; the calculator has a disposal field for exactly that.",
    ],
  ],
};

export default seo;
