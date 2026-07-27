const seo = {
  intro:
    "A solar panel cleaning planner works out how fast dust eats your generation and how often washing is actually worth paying for. It models soiling as a daily loss rate — typically 0.1% of output per day on wet coastal sites up to about 1% per day near deserts and quarries — scaled for panel tilt and any dust source upwind, then finds the interval where the value of lost units and the cost of washing balance. That optimum follows the square-root rule T = √(2C ÷ (daily generation value × soiling rate)).",
  useCases: [
    "Deciding whether a monthly cleaning contract on a rooftop system pays for itself",
    "Estimating how many units a dusty pre-monsoon month is quietly costing you",
    "Checking whether a shallow-tilt terrace array needs washing more often than a sloped roof one",
    "Settling an argument with an installer who insists on fortnightly cleaning",
  ],
  benefits: [
    ["Costs both sides of the trade", "Compares the rupees lost to dust against the rupees spent on washing, instead of only one."],
    ["Credits the rain", "Rain of 10 mm or more washes panels free, so the planner never recommends an interval longer than that."],
    ["Tilt-aware", "A near-flat terrace array fouls about 40% faster than the same panels at 25° because dust never slides off."],
  ],
  faqs: [
    [
      "How often should solar panels be cleaned?",
      "It depends far more on dust and rainfall than on any fixed rule, but most Indian rooftop systems land between 3 and 8 paid washes a year. In a semi-arid area losing about 0.55% of output per day, with rain every 45 days and washing costing ₹500, the cost-optimal interval works out to roughly 34 days.",
    ],
    [
      "How much output do dirty solar panels lose?",
      "Soiling typically costs 3–10% of annual generation for rooftop systems, and 15–25% at the worst moment in a long dry spell. The loss builds roughly linearly between washes, so a 0.5%/day rate reaches about 15% after a month without rain.",
    ],
    [
      "Does rain clean solar panels?",
      "Rain of about 10 mm or more in one event does a reasonable job, which is why a monsoon month usually needs no manual washing at all. Light drizzle is worse than nothing — it wets the dust into a film that dries as a uniform haze across the glass.",
    ],
    [
      "What is the right way to clean solar panels?",
      "Wash early morning or after sunset with soft or deionised water and a soft brush or microfibre head on an extension pole. Never spray cold water on hot glass — the thermal shock can crack a module — and never stand on panels or use detergent, abrasives or a pressure washer. If the array is on a sloped or high roof, hire someone with fall protection rather than doing it yourself.",
    ],
  ],
};

export default seo;
