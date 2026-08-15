const seo = {
  title: "Solar Self-Consumption Optimizer: Best Appliance",
  metaDescription:
    "Paste Time | solar kWh | load kWh rows to get direct self-consumption, the highest-surplus start time and your percentage after one shifted load.",
  steps: [
    "Paste one row per interval into Generation and load intervals as Time | solar kWh | household load kWh, or tap the Day profile example.",
    "Set Flexible appliance energy (kWh) to the dishwasher, immersion heater or EV top-up you are willing to move to another hour.",
    "Read the highest-surplus start time, direct self-consumption in kWh and self-consumption after one shift, then Download the summary as .txt.",
  ],
  intro:
    "The Solar Self-Consumption Optimizer reads a list of time intervals with solar generation and household load in kWh, works out how much of each interval's output you already use directly (the smaller of generation and load), and points to the interval with the largest leftover surplus as the best moment to start a flexible appliance. It is built for rooftop solar owners who want to stop exporting cheap kWh and run the dishwasher, washing machine, water heater or EV charger inside the surplus window instead. You get total generation, direct self-consumption in kWh, your current self-consumption percentage, and what that percentage becomes after shifting one flexible load.",
  useCases: [
    "You have a 5 kW rooftop array and an inverter app that exports half-hourly generation and consumption figures — you paste a day's intervals in and find that midday carries the biggest surplus, so you move the washing machine off its 7pm habit.",
    "Your EV needs about 8 kWh of top-up and you want to know whether daytime surplus can actually absorb it, or whether you would still be pulling most of it from the grid.",
    "You are deciding whether a timer plug on the water heater is worth it, so you compare the self-consumption percentage as entered against the figure after one shifted load before spending anything.",
  ],
  benefits: [
    [
      "Interval-level arithmetic, not a daily average",
      "Direct use is computed per interval as min(generation, load), so a day that looks balanced in totals still shows the hours where solar spills over.",
    ],
    [
      "Names the start time, not just a percentage",
      "It sorts your intervals by surplus and reports the highest-surplus start time, so the output is an action rather than a score.",
    ],
    [
      "Shows the before-and-after in the same table",
      "Current self-consumption and self-consumption after one shift appear side by side, so the gain from moving a single appliance is immediately visible.",
    ],
  ],
  faqs: [
    [
      "What format do I enter the intervals in?",
      "One interval per line as time | solar kWh | household load kWh, for example 12:00 | 3.5 | 1.0. Anything after the third value is ignored, blank lines are skipped, and non-numeric fields are read as zero — so an export from your inverter app usually just needs the columns trimmed to three.",
    ],
    [
      "How is self-consumption calculated?",
      "Self-consumption is direct use divided by total solar generation, expressed as a percentage. Direct use is summed across intervals as the smaller of generation and load in each one, so in a 3.5 kWh interval with 1.0 kWh of load, 1.0 kWh counts as direct use and 2.5 kWh is surplus.",
    ],
    [
      "Does it account for my home battery or feed-in tariff?",
      "No. The model covers energy shifting between intervals only and ignores battery storage, export caps, tariff rates, forecast error, appliance power limits and run duration. It also assumes the flexible load fits inside a single interval, so a long cycle spanning several intervals will look better here than in reality.",
    ],
    [
      "Why does the result only shift one appliance?",
      "The calculation moves a single flexible load of the kWh you enter into the highest-surplus interval, capped at whatever surplus that interval actually has. If your flexible load is 2 kWh and the best interval only has 1.4 kWh spare, 1.4 kWh is credited — run the tool again with the remaining amount to plan a second shift.",
    ],
  ],
};

export default seo;
