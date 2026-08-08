const seo = {
  intro:
    "The Gig Earnings & Mileage Analyzer turns a list of shifts into a real hourly rate using net = (gross + tips − business km × cost per km − other expenses) × (1 − tax reserve %), then divides that net by hours worked. You paste one line per shift as Date | gross | hours | business km | other expenses | tips, set your vehicle cost per kilometre and the share you hold back for tax, and it returns a per-shift table plus a blended effective rate across every shift. It is aimed at delivery riders, rideshare drivers and any gig worker whose payout screen shows gross earnings and says nothing about fuel, wear or tax.",
  useCases: [
    "You drove 75 km on an 8-hour shift for a 4,200 payout and want to know what is actually left once fuel and vehicle wear at 8 per km and a 10% tax reserve come off.",
    "You are deciding whether long-distance orders are worth taking, so you enter a week of shifts and compare the net-per-hour column on high-km days against short-radius days.",
    "You are weighing a gig week against a fixed hourly job offer and need the after-expenses hourly figure, not the gross the platform advertises.",
  ],
  benefits: [
    [
      "Costs mileage at your own rate",
      "Vehicle cost is business kilometres multiplied by the per-km figure you set, so you can use fuel-only, fuel-plus-maintenance, or your tax authority's published mileage rate.",
    ],
    [
      "Sets tax aside before the hourly rate",
      "The reserve percentage is deducted after expenses, so the net-per-hour you see is money you can actually spend, not a figure you will owe part of later.",
    ],
    [
      "Per-shift and blended in one view",
      "Each shift gets its own gross, vehicle cost, expense, net and net-per-hour row, with totals for gross, hours, business km and net across the whole period.",
    ],
  ],
  faqs: [
    [
      "How is my effective hourly rate calculated?",
      "Net for a shift is gross earnings plus tips, minus (business km × your cost per km), minus other expenses, and that result is then reduced by your tax reserve percentage; net divided by hours gives the shift rate. The headline figure is total net across all shifts divided by total hours, so long low-paying shifts pull the blended rate down.",
    ],
    [
      "What should I use for cost per kilometre?",
      "Use whichever figure matches what you are trying to measure — fuel alone if you only want out-of-pocket cost, or fuel plus tyres, servicing, insurance and depreciation for a true cost of running the vehicle. The field defaults to 8 per km and accepts any currency; many drivers instead enter their tax authority's standard mileage rate so the number lines up with what they can deduct.",
    ],
    [
      "What format does the shift list need?",
      "One shift per line, fields separated by pipes, in the order Date | gross earnings | total hours | business km | other expenses | tips included — for example 2026-07-20 | 4200 | 8 | 75 | 12 | 300. Missing numbers are treated as zero, and hours are floored at 0.01 so a mistyped zero cannot blow up the per-hour figure.",
    ],
    [
      "Does this tell me what tax I owe?",
      "No — the reserve percentage is a set-aside you choose, not a tax calculation, and the tool applies it as a flat share of your after-expense earnings. Real self-employment tax depends on your total income, deductible expenses and local rules, so treat the output as informational planning and confirm the actual liability with a tax professional.",
    ],
  ],
};

export default seo;
