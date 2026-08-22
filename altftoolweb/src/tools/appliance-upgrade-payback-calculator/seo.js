const seo = {
  title: "Appliance Upgrade Payback Calculator",
  metaDescription:
    "Enter old and new kWh per year, price, trade-in and tariff to get simple and discounted payback plus lifetime NPV, and CO2 avoided at 0.71 kg per kWh.",
  steps: [
    "Enter 'Current appliance uses (kWh a year)', 'Replacement uses (kWh a year)', the new price, trade-in value and your electricity tariff per kWh.",
    "Set the expected tariff rise, discount rate and appliance life — or convert 'Rated power (watts)' and 'Hours used per day' if you lack an annual kWh figure.",
    "Read 'Simple payback' alongside the discounted payback and NPV, then click 'Copy result'.",
  ],
  intro:
    "Appliance upgrade payback is the number of years the energy saving takes to repay the cost of buying the more efficient model. This calculator works it out three ways: simple payback (net cost divided by first-year saving), discounted payback that accounts for a rising electricity tariff and the return the same money could earn elsewhere, and net present value across the appliance's full life. It also converts the units saved into CO2 avoided at roughly 0.71 kg per kWh on the Indian grid.",
  useCases: [
    "Deciding whether to scrap a working 10-year-old refrigerator for a 5-star model",
    "Comparing a cheaper 3-star air conditioner against a costlier 5-star one over ten summers",
    "Justifying an office equipment replacement with a discounted payback figure rather than a guess",
  ],
  benefits: [
    ["Discounted, not just simple", "Applies your tariff escalation and discount rate, so the payback is honest."],
    ["Handles the trade-in", "Exchange or scrap value is netted off the purchase price before payback is worked out."],
    ["Wattage helper built in", "No annual kWh figure? Enter watts and daily hours and it converts for you."],
  ],
  faqs: [
    [
      "How do you calculate appliance payback period?",
      "Divide the net upfront cost by the annual energy saving in money. If a new fridge costs 45,000 after a 3,000 trade-in and saves 700 units a year at 8 per unit, that is 42,000 divided by 5,600, or 7.5 years. Discounted payback is longer than simple payback whenever your discount rate exceeds the tariff escalation.",
    ],
    [
      "Is it worth replacing an old appliance with an energy-efficient one?",
      "Only if the payback lands comfortably inside the new appliance's expected life, typically 8 to 15 years for large white goods. A 7-year payback on a 12-year appliance leaves five years of pure saving; a 14-year payback on the same appliance loses money, however good the star rating looks.",
    ],
    [
      "What does the BEE star rating actually tell me?",
      "The label carries the model's measured annual energy consumption in kWh, and that number — not the star count — is what you put into a payback calculation. Star bands are periodically tightened, so a 5-star model from several years ago may only rate 3 stars against the current table.",
    ],
    [
      "Should I use my average electricity rate or my slab rate?",
      "Use the marginal slab rate, the price of the next unit you consume. Savings come off the top of your consumption, so they are priced at your highest slab, which in tiered domestic tariffs can be well above the average rate printed on the bill.",
    ],
  ],
};

export default seo;
