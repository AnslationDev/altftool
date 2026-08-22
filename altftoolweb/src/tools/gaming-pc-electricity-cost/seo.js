const seo = {
  title: "Gaming PC Electricity Cost & PSU Size Calculator",
  metaDescription:
    "Turn GPU and CPU watts into wall-socket draw through PSU efficiency, then get the monthly bill at your tariff plus a suggested PSU size.",
  steps: [
    "Enter GPU board power / TGP, CPU package power limit and platform watts, or tap a preset from Entry (60-class) to Flagship (90-class).",
    "Pick your 80 PLUS rating under Power supply efficiency rating, then set Hours per day under load and the Electricity tariff (INR per kWh).",
    "Read the Estimated monthly electricity cost, wall draw under load in watts and the Suggested PSU size, then use Copy result to share it.",
  ],
  intro:
    "This calculator turns a gaming PC's parts list into a wall-socket power figure and a monthly electricity bill. It sums GPU board power, CPU package power and platform draw under a chosen workload, divides by the power supply's efficiency to get true socket draw, then prices gaming, idle and sleep hours separately at your tariff. PSU efficiency uses the 80 PLUS thresholds at 50 percent load — 82 percent for White up to 94 percent for Titanium.",
  useCases: [
    "Estimating how much a 320 W GPU build adds to the monthly bill before committing to the upgrade",
    "Deciding whether a Gold power supply pays back against a Bronze one over a few years of daily gaming",
    "Sizing a power supply from peak GPU plus CPU plus platform load with 30 percent headroom",
  ],
  benefits: [
    ["PSU losses included", "Socket draw is component load divided by efficiency, not the component load itself."],
    ["Separate idle pricing", "Idle and sleep hours are billed at their own wattage rather than the gaming figure."],
    ["PSU sizing built in", "Returns the smallest 50 W-step supply that covers peak load plus headroom."],
  ],
  faqs: [
    [
      "How much electricity does a gaming PC use per hour?",
      "A mainstream build with a 320 W GPU and a 125 W CPU pulls roughly 440 W from the components in a AAA game, which becomes about 490 W at the socket through a 90 percent efficient Gold power supply, or around 520 W with a monitor. That is roughly 0.5 kWh per hour of play.",
    ],
    [
      "How much does it cost to run a gaming PC each month?",
      "At 8 INR per kWh, three hours of AAA gaming plus five idle hours a day on that same build works out near 63 kWh and about 500 INR a month. Halving the gaming hours or capping frame rates cuts the load portion almost proportionally.",
    ],
    [
      "Does an 80 PLUS Gold PSU actually save money?",
      "It saves the difference in wasted heat: at 439 W of component load, a 90 percent Gold unit draws 488 W from the wall while an 85 percent Bronze draws 516 W — about 28 W more, or roughly 30 kWh a year at three hours daily. That is real but modest, so buy the higher rating for build quality and quieter operation as much as for the bill.",
    ],
    [
      "What size power supply do I need for my GPU and CPU?",
      "Add the GPU board power, the CPU package power limit and about 60 W for board, RAM, drives and fans, then add roughly 30 percent headroom for transient spikes and future upgrades. A 320 W GPU with a 125 W CPU totals 505 W, so a 700 W unit is the sensible next step up.",
    ],
  ],
};

export default seo;
