const seo = {
  title: "Bajaj Bike Service Schedule Planner with Cost Estimate",
  metaDescription:
    "Plan every free and paid Bajaj service by km and month, price the parts due at each visit, and check a prepaid package against pay-per-visit totals.",
  steps: [
    "Enter Purchase / registration date, Current odometer (km), Average running (km per month) and Engine cooling — liquid-cooled models add coolant work that air-cooled bikes skip.",
    "Tune the chart to your coupon book: Free services in your package, First service due at (km), Periodic interval after that (km), Labour per paid service (INR) and Prepaid service package price (INR, 0 to skip).",
    "Read Next service due at with its date, the Service schedule table with Parts due and Cost per visit, the prepaid-vs-pay-per-visit verdict, then press Copy result.",
  ],
  intro:
    "This planner builds a dated Bajaj service schedule from the maintenance chart: it works out the kilometre and month at which each free and paid visit falls due, lists the consumables that land on each one, and totals the cost so you can compare it against a prepaid package. Bajaj models use a running-in service near 750 km or 1 month and then a periodic cycle of roughly 4,500-5,000 km. Liquid-cooled models such as the Pulsar 220F, RS200 and Dominar also pick up coolant replacement and a radiator check.",
  useCases: [
    "Scheduling the next free service on a new Pulsar or Platina that runs about 900 km a month",
    "Working out whether a dealer's prepaid service package beats paying per visit over the next four services",
    "Seeing which visit the chain kit, clutch plates or coolant change falls due on",
  ],
  benefits: [
    ["Air and liquid cooled handled apart", "Liquid-cooled models add coolant replacement and a radiator check that air-cooled bikes do not need."],
    ["Prepaid package check", "Compares the package price against the true pay-as-you-go total for the same visits."],
    ["Whichever comes first", "Each visit is dated at the earlier of the kilometre and month trigger, as the coupon reads."],
  ],
  faqs: [
    [
      "When is the first service due on a new Bajaj bike?",
      "At about 750 km or one month from purchase, whichever comes first. That visit drains the running-in oil carrying metal particles from the bedding-in process, and missing the window can void the coupon for that service.",
    ],
    [
      "How often should engine oil be changed on a Bajaj Pulsar?",
      "Most Bajaj models call for an engine oil change around every 5,000 km after the first service, using a 20W50 API SL grade unless your manual specifies otherwise. Heavy city riding, long idling and dusty routes justify changing at the shorter end of the range.",
    ],
    [
      "Do twin-spark Bajaj engines need two spark plugs?",
      "Yes. DTS-i twin-spark engines carry two plugs per cylinder, so budget for two units every time the plug replacement interval comes up, typically around 10,000 km. Using a single new plug alongside an old one causes uneven burn and rough idling.",
    ],
    [
      "Is a prepaid service package worth buying?",
      "It depends entirely on whether the package price is below the sum of labour and parts for the visits it covers, which is exactly what this planner compares. Read what the package excludes, because consumables such as brake pads, chain kits and coolant are often billed separately even inside a package. Confirm the inclusions in writing with the dealer.",
    ],
  ],
};

export default seo;
