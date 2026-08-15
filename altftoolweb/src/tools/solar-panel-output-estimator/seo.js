const seo = {
  title: "Solar Panel Output Estimator: kWh After Real Losses",
  metaDescription:
    "Daily, monthly and annual kWh from panel wattage and peak sun hours, with system, shading, temperature and inverter losses set separately — plus savings.",
  steps: [
    "Under Panel Setup enter \"Panel wattage\", \"Number of panels\" and \"Peak sun hours / day\" — or start from a Quick Preset: Balcony 800W, Home 3kW, Home 5kW, Shop 10kW or Portable 200W.",
    "Under Loss Factors set \"System loss %\", \"Shading loss %\", \"Temperature loss %\" and \"Inverter efficiency %\"; the four multiply into the performance ratio that is applied to peak kW × sun hours, and \"Self-use %\", \"Tariff INR / kWh\" and \"Available area sqm\" drive the savings and roof-fit checks.",
    "Read Output Result — daily kWh, peak capacity, performance ratio and panel area — with the Monthly Output Curve and the self-used versus exported split; \"Copy\" takes the summary and \"CSV\" saves solar-panel-output-estimator.csv.",
  ],
  intro:
    "The Solar Panel Output Estimator works out daily, monthly and annual generation from array size and peak sun hours using the standard derating chain: kWp multiplied by sun hours multiplied by a performance ratio built from system loss, shading loss, temperature loss and inverter efficiency. It is for homeowners and small businesses sizing a rooftop or balcony array who want to see how each loss eats into the headline panel rating before a vendor quote arrives. With the default 10% system, 4% shading and 8% temperature losses and a 96% inverter, the performance ratio lands near 76%, so a 3 kWp array at 5.1 sun hours produces roughly 11.7 kWh a day rather than the 15.3 kWh the panel label implies.",
  useCases: [
    "An installer has quoted you a 5 kW rooftop system and an annual generation figure, and you want to check that number against your own sun hours and shading before signing.",
    "One corner of your roof is shaded by a water tank until mid-morning, and you want to see what raising shading loss from 4% to 20% does to the annual kWh and the payback conversation.",
    "You are choosing between a 2-panel balcony setup and a full rooftop array and need to know whether the panel area at roughly 2.2 m2 each even fits the space you have.",
  ],
  benefits: [
    ["Every loss is a separate dial", "System, shading, temperature and inverter losses are entered independently and multiplied together, so you can see which one is actually costing you the output."],
    ["Self-consumption split out", "Generation is divided into the share you use on site and the share exported, because only the self-used part is valued at your retail tariff in the savings figure."],
    ["Seasonal shape, not a flat average", "A twelve-month profile scales output between 0.78 and 1.12 of the average, so the monsoon dip and the pre-monsoon peak are visible instead of hidden in an annual number."],
  ],
  faqs: [
    [
      "How is daily solar output calculated?",
      "Array size in kWp multiplied by peak sun hours multiplied by the performance ratio. Performance ratio here is (1 - system loss) x (1 - shading loss) x (1 - temperature loss) x inverter efficiency, which with the default 10%, 4%, 8% and 96% works out to about 76%.",
    ],
    [
      "What is a realistic performance ratio?",
      "A well-installed rooftop system typically lands somewhere in the 70-80% range once wiring, soiling, heat and inverter conversion are counted. This tool flags a ratio below 70% as moderate and below 55%, or shading above 25%, as a high loss risk worth investigating before you buy.",
    ],
    [
      "How much roof area do I need?",
      "The estimator assumes about 2.2 m2 per panel, so ten panels need roughly 22 m2 of clear, unshaded area, and it warns you when the panel area exceeds the roof area you entered. Real installations need extra room for walkways, tilt spacing and edge setbacks, so treat that as a floor rather than a target.",
    ],
    [
      "Are the savings and payback figures reliable?",
      "Treat them as an indicative estimate, not a quote. Savings are calculated as generation multiplied by your self-use share multiplied by the tariff you type in, which ignores slab tariffs, net-metering and export rates, subsidies, fixed charges and future price changes — get a site survey and a written quote before committing.",
    ],
  ],
};

export default seo;
