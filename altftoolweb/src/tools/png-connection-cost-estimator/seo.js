const seo = {
  title: "PNG Connection Cost Estimator: Deposit vs Real Cost",
  metaDescription:
    "Itemise registration, refundable deposit, piping past the free length and extra points, then pay back only the non-refundable part against LPG.",
  steps: [
    "Under Connection charges enter Registration or application fee (₹), Refundable security deposit (₹), Installation and commissioning (₹) and Hob or appliance conversion (₹)",
    "Under Piping and points set Internal piping needed (m) against Piping included free (m) with the Piping rate (₹ per m), plus extra gas points and Core-drilled wall holes; under Compared with your LPG enter Cylinders used per month (14.2 kg), Cylinder price you pay (₹), PNG rate (₹ per SCM) and PNG fixed charge per month (₹)",
    "Cost you never get back heads the panel, with Refundable security deposit, Total paid upfront, Net cash needed today, LPG cost per month now, Piped gas per month in SCM, Saving per month and Payback on non-refundable charges beneath it; Copy result copies the estimate and Reset restores the defaults",
  ],
  intro:
    "This estimator itemises what a new domestic piped natural gas connection costs and separates the part you get back from the part you do not. A distributor's connection bill is a registration fee, an interest-free security deposit, installation and commissioning of the riser, meter and regulator, internal piping charged per metre beyond the length included free, extra gas points, core drilling and hob conversion. Because only the non-refundable charges are a true cost, the payback against LPG is computed on those, comparing the two fuels on energy — a 14.2 kg cylinder carries about the same energy as 16.7 SCM of piped gas.",
  useCases: [
    "Check a city gas distributor's connection quote line by line before paying the registration fee.",
    "Work out how long piped gas takes to repay its non-refundable charges at your cylinder consumption.",
    "Compare the cost of running the internal pipe to a far kitchen against a meter position closer to it.",
  ],
  benefits: [
    ["Refundable split out", "Shows the deposit separately so the payback is computed only on money you never see again."],
    ["Piping priced past the free length", "Charges only the metres beyond the allowance included in a standard installation."],
    ["Compared on energy, not volume", "Converts cylinders to SCM by calorific value instead of guessing an equivalence."],
  ],
  faqs: [
    [
      "What does a new PNG connection cost in India?",
      "The bill is made of a one-time registration fee, a refundable interest-free security deposit that is the largest single line, installation and commissioning, and internal piping beyond the free length. The deposit comes back when the connection is surrendered, so the actual cost is the rest — commonly a few thousand rupees, though the exact schedule differs by distributor and city.",
    ],
    [
      "Is the PNG security deposit refundable?",
      "Yes. Domestic PNG security deposits are interest-free and refundable when the connection is permanently surrendered, subject to the distributor's process and clearing any outstanding bill. Keep the receipt — the refund is claimed against it, and it is usually the largest amount you pay at connection time.",
    ],
    [
      "Is piped gas cheaper than an LPG cylinder?",
      "Usually, but the margin depends on your city's PNG rate and the cylinder price you pay. Compare on energy: one 14.2 kg cylinder is roughly 16.7 SCM of piped gas, so multiply your monthly cylinders by 16.7, apply the per-SCM rate and add the fixed charge before comparing. Subsidised cylinders narrow the gap considerably.",
    ],
    [
      "Does my LPG stove work with piped natural gas?",
      "Not without a change of jets. LPG and natural gas are supplied at different pressures and carry different calorific values, so the burner nozzles have to be sized for the gas being burnt. Conversion is a small job but must be done by the distributor's authorised technician — never modify a gas appliance yourself.",
    ],
  ],
};

export default seo;
