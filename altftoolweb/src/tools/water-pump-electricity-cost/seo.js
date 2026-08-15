const seo = {
  title: "Water Pump Electricity Cost per Month and 1000",
  metaDescription:
    "Costs a 1 HP pump at its real 1.04 kW draw, not 746 W. Runtime comes from tank litres and flow rate; shows cost per month and per 1000 litres.",
  steps: [
    "Enter the pump in the Pump rating (HP) and Motor efficiency (%) fields — they open at 1 and 72, with a hint that small single-phase motors run 70-78% and a rewound one can drop below 60%.",
    "Describe the job in Flow rate (litres per minute), Total head (metres), Tank capacity (litres), Tank fills per day, Days used per month and Electricity tariff (₹ per unit); every figure recomputes as you type, with no calculate button.",
    "Read Cost per month at the top, then the breakdown rows — Power drawn from the meter in W and amps at 230 V, Time to fill the tank once, Cost per 1000 litres pumped and Wire-to-water efficiency — plus the Same job, different pump rating table. Copy result puts the summary on the clipboard; Reset restores the defaults.",
  ],
  intro:
    "This calculator works out what a domestic water pump costs to run by separating two things people usually confuse: the horsepower on the nameplate is shaft output, while the meter records motor input, which is higher by the motor's efficiency. A 1 HP pump at 72% motor efficiency draws about 1.04 kW, not 0.75 kW. Runtime is derived from the physical job — tank litres divided by flow rate — and the pump equation (density × 9.81 × flow × head) checks how much of that electricity actually becomes lifted water.",
  useCases: [
    "Your overhead tank is filled twice a day and you want the pump's share of the monthly electricity bill isolated from everything else.",
    "You are deciding between a 1 HP and a 1.5 HP pump for a building and want the running-cost difference before the plumber decides for you.",
    "The pump seems to run far longer than it used to, and you want to check the flow rate against the cost per thousand litres.",
  ],
  benefits: [
    ["Shaft power versus input", "Costing a 1 HP pump at 746 W understates the bill by nearly 40% — motor efficiency is applied explicitly."],
    ["Cost per 1000 litres", "A per-kilolitre figure lets you compare pumping cost directly against a tanker delivery or a borewell."],
    ["Efficiency sanity check", "Wire-to-water efficiency flags an oversized pump, a choked foot valve or an undersized delivery line."],
  ],
  faqs: [
    [
      "How much electricity does a 1 HP water pump use per hour?",
      "About 1.04 units an hour, assuming a typical single-phase motor efficiency of 72%. The arithmetic is 1 HP × 745.7 W ÷ 0.72, which comes to 1036 W — the 746 W figure people quote is the shaft output, not what the meter sees.",
    ],
    [
      "How long does a 1 HP pump take to fill a 1000 litre tank?",
      "Roughly 17 minutes at a flow of 60 litres a minute, which is typical for a 1 HP pump lifting to about 25 metres. Flow drops sharply as head rises, so the same pump on a fifth floor may need twice as long — time one fill with a stopwatch to get your real number.",
    ],
    [
      "Does a bigger pump cost more to run?",
      "Per hour, yes, in almost direct proportion to horsepower. Per tank filled, not necessarily: a larger pump moves the same water in less time, so if the flow rises proportionally the energy per thousand litres barely changes. An oversized pump only wastes money when it is throttled or runs far off its best efficiency point.",
    ],
    [
      "Why does my pump use more electricity than the rating suggests?",
      "Three reasons, in order of how often they apply: the nameplate figure is shaft power and the motor adds its own losses; low supply voltage makes the motor draw more current for the same work; and a worn impeller, choked strainer or partly closed valve pushes the pump off its efficiency curve so it runs longer for the same tank.",
    ],
  ],
};

export default seo;
