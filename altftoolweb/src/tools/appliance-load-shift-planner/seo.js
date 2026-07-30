const seo = {
  intro:
    "The Appliance Load-Shift Planner takes your tariff windows with their per-kWh prices and a list of flexible appliance cycles with their energy use, sorts the windows cheapest first, and assigns each cycle to a window — filling the cheapest slot up to your maximum-parallel limit before moving to the next. For every appliance it shows the suggested window, the price in that window and the cycle cost as kWh × price, plus a total for the whole plan. It is aimed at anyone on a time-of-use or economy tariff who wants to know where the dishwasher, water heater and laundry should sit in the day.",
  useCases: [
    "You moved onto a time-of-use tariff with a cheap overnight rate and want to know, in money rather than vague advice, what running the 3 kWh water heater at the peak rate actually costs you versus the off-peak one.",
    "Your washing machine and dishwasher both have delay timers, and you can only run one at a time without tripping the circuit, so you set maximum parallel cycles to 1 and read off which appliance goes in which window.",
    "You are comparing two tariff offers by pasting each one's window prices in turn and seeing which produces a lower total for the same weekly set of flexible cycles.",
  ],
  benefits: [
    ["Cheapest-window-first ordering", "Windows are sorted by price per kWh and cycles are filled into them in that order, so the plan is an explicit cost ranking rather than a rule of thumb."],
    ["Respects a parallel-run limit", "The maximum parallel cycles setting controls how many appliances share a window before the next-cheapest one is used, matching a real circuit or hot-water constraint."],
    ["Per-cycle cost, not just a total", "Each row shows the cycle's kWh, its assigned window, that window's rate and the resulting cost, so you can see which single appliance dominates the bill."],
  ],
  faqs: [
    [
      "How does it choose which appliance goes in which window?",
      "Tariff windows are sorted from cheapest to most expensive per kWh, then appliances are assigned in the order you listed them, placing up to your maximum-parallel number of cycles in each window before moving to the next. It is a cost-ordering aid, not a scheduler that knows appliance run times.",
    ],
    [
      "How is the cost of each cycle worked out?",
      "Cycle cost = cycle energy in kWh × the price per kWh of the assigned window. A 1.2 kWh dishwasher cycle in a window priced at 5 per kWh costs 6; the total shown is the sum of every row.",
    ],
    [
      "What format do the tariff windows use?",
      "One window per line as start-end | price, for example 00:00-06:00 | 5. The price can be in any currency unit you like — pence, cents, rupees — because the tool only multiplies it by kWh and never converts. Lines without a numeric price are ignored.",
    ],
    [
      "Is it always safe to shift these loads overnight?",
      "Not always, and cost is only one input. Follow the appliance manual on unattended operation, keep water-heater temperatures high enough for hot-water hygiene, and consider noise, ventilation, fire safety and any demand limit on your supply before running cycles while you sleep.",
    ],
  ],
};

export default seo;
