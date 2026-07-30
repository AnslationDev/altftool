const seo = {
  intro:
    "A time-of-use battery simulator estimates how much a home battery saves by charging when electricity is cheap and discharging when it is expensive. Paste your tariff intervals as time | load kWh | price per kWh, set usable capacity, per-interval charge power and round-trip efficiency, and this tool charges the battery in the cheapest interval, discharges it into the highest-priced intervals first, and reports the difference against your unshifted baseline bill. It is a price-arbitrage illustration for comparing scenarios, not a control system or a quote.",
  useCases: [
    "Your utility has just moved you onto a peak/off-peak tariff and you want to see whether an 8 kWh battery would recover enough on the evening peak to be worth quoting",
    "Comparing two battery sizes from the same installer by rerunning your own evening load numbers at 5 kWh and at 13 kWh instead of trusting the brochure figure",
    "Checking how much of the saving a lower round-trip efficiency eats — 90% versus 85% — before deciding between a lithium-iron and an older chemistry",
  ],
  benefits: [
    ["Your tariff, not a generic one", "Every interval takes its own price and load, so a three-band or four-band TOU schedule is entered as it actually reads on your bill."],
    ["Efficiency losses are priced in", "Grid energy drawn to charge is grossed up by the round-trip efficiency, so the kWh you pay for is larger than the kWh you get back."],
    ["Shows the discharge plan, not just a total", "A table lists which interval the stored energy was spent in, at what price, and the cost each block avoided."],
  ],
  faqs: [
    [
      "How does the simulator decide when to charge and discharge?",
      "It charges once, in the lowest-priced interval you entered, then discharges into the remaining intervals in descending price order. Each interval takes the smallest of three limits — energy still stored, the per-interval charge/discharge figure, and that interval's own load — so the battery never exports more than the house is using.",
    ],
    [
      "What does round-trip efficiency do to the numbers?",
      "It sets how much grid energy you must buy to store one usable kWh. At the 90% default, storing 2.7 kWh takes 3.0 kWh off the meter, so the 10% loss is billed at the cheap charging price and never comes back out at the peak price.",
    ],
    [
      "Does this account for solar, export payments or battery degradation?",
      "No. The model deliberately omits solar generation, export or feed-in tariffs, reserve state-of-charge, degradation, demand charges and any utility control scheme, and it treats each interval as one charge or discharge block rather than modelling its duration. Treat the output as a comparison between scenarios, not a payback calculation.",
    ],
    [
      "Is the estimated saving per day or per year?",
      "Per cycle of the intervals you entered. If your rows cover one 24-hour day, multiply by roughly 365 for an annual figure — but only if that day is typical, since summer and winter load profiles usually differ enough to change the answer materially.",
    ],
  ],
};

export default seo;
