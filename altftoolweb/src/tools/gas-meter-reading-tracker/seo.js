const seo = {
  intro:
    "This tracker converts a log of piped natural gas meter readings into SCM per day, a projected next bill, and the LPG-cylinder equivalent of what the kitchen burns. Consumption is the difference between two readings in standard cubic metres, and the bill is rebuilt the way a city gas distributor computes it: telescopic slabs where each block of SCM is charged at its own rate, plus a fixed charge per cycle and state VAT — domestic PNG is outside GST. Slab limits, rates, the cycle length and the tax rate are all yours to set from your latest bill, because tariff cards differ by distributor and are revised regularly.",
  useCases: [
    "Estimate the next bi-monthly PNG bill mid-cycle, before it arrives, from your own meter readings.",
    "Check whether a bill jump came from higher usage or from a tariff revision, by comparing SCM per day across cycles.",
    "Compare the cost of piped gas against the LPG cylinders it replaced, in kilograms and cylinders.",
  ],
  benefits: [
    ["Telescopic slabs done right", "Only the units above a slab boundary are repriced, exactly as the distributor bills them."],
    ["Cycle-length neutral", "Compares SCM per day, so a 59-day cycle and a 62-day cycle can be read side by side."],
    ["LPG equivalence built in", "Converts projected SCM into 14.2 kg cylinders using calorific value, not guesswork."],
  ],
  faqs: [
    [
      "What is SCM in a piped gas bill?",
      "SCM is the standard cubic metre — one cubic metre of gas measured at a reference temperature and pressure, and the unit your PNG meter counts. Domestic tariffs are quoted in rupees per SCM, and a typical Indian household kitchen uses somewhere around 12 to 25 SCM a month depending on family size and whether a gas geyser is connected.",
    ],
    [
      "How many SCM of PNG equal one LPG cylinder?",
      "Roughly 16 to 17 SCM. A 14.2 kg domestic LPG cylinder carries about 11,000 kcal per kilogram, and PNG delivers around 9,350 kcal per SCM, so the cylinder's energy works out near 16.7 SCM of piped gas. Compare on energy rather than on volume, because the two fuels are billed in different units.",
    ],
    [
      "How do telescopic gas slabs work?",
      "Each slab prices only the units that fall inside it. If the first 30 SCM are charged at one rate and the next block at a higher one, using 39 SCM means 30 units at the lower rate and 9 at the higher rate — crossing a boundary never reprices the whole bill. That is why a small increase in usage produces only a small increase in the bill.",
    ],
    [
      "Is GST charged on domestic piped natural gas?",
      "No. Natural gas is one of the petroleum products kept outside GST, so domestic PNG bills carry state VAT instead, at a rate set by the state government. The rate varies, so take the percentage from your own bill rather than assuming a national figure.",
    ],
  ],
};

export default seo;
