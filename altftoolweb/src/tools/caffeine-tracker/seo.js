const seo = {
  intro:
    "This tracker logs each coffee, tea, cola or energy drink with the time you had it, then models how much caffeine is still in your body using a 5-hour half-life — every dose decays as mg × 0.5^(hours ÷ 5). It plots the resulting curve across the day, compares your running total against a 400 mg daily reference (200 mg if you tick the pregnancy option), and works backwards from your bedtime to tell you the latest hour you can have a given drink and still be under 50 mg when you sleep. It is an informational estimate for people trying to work out why they are lying awake, not a clinical measurement.",
  useCases: [
    "You fall asleep fine but wake at 3am, and want to see whether the 4pm cold brew is still at meaningful levels by midnight",
    "You are cutting back and need to know whether four cups plus an energy drink actually crossed the 400 mg mark or just felt like it",
    "You want a personal cutoff time — not the generic \"no coffee after 2pm\" — based on your real bedtime and what you have already had today",
  ],
  benefits: [
    [
      "Models decay, not just a daily total",
      "A 120 mg filter coffee at 8am and the same coffee at 6pm count identically toward your daily total but land completely differently on the bedtime curve, and the chart shows that.",
    ],
    [
      "Twenty real serving sizes",
      "Presets carry measured amounts — 63 mg for a single espresso, 155 mg for a 300 ml cold brew, 47 mg for black tea, 200 mg for a caffeine tablet — with 0.5x to 2x multipliers for odd servings.",
    ],
    [
      "Yesterday's caffeine carries over",
      "Late-night doses from the previous day are folded into today's curve, so an 11pm energy drink still shows its tail on the morning baseline.",
    ],
  ],
  faqs: [
    [
      "How long does caffeine stay in your system?",
      "This tool uses a 5-hour half-life, the commonly cited average for healthy adults. That means a 200 mg dose is down to about 100 mg after 5 hours, 50 mg after 10, and 25 mg after 15 — which is why an afternoon coffee can still be active at bedtime. Individual clearance varies widely with genetics, pregnancy, liver function and some medications, so treat the curve as a rough model.",
    ],
    [
      "What is the daily caffeine limit?",
      "Health authorities generally put up to 400 mg a day as not associated with harmful effects for most healthy adults, and around 200 mg during pregnancy — this tool uses those two figures and switches to 200 mg when you tick the pregnancy option. Roughly 400 mg is three 240 ml filter coffees, or two large energy drinks plus a cola.",
    ],
    [
      "When should I stop drinking coffee before bed?",
      "The tool computes your personal cutoff as bedtime minus 5 hours × log₂(drink mg ÷ your remaining budget), where the budget is 50 mg minus whatever your existing log already projects at bedtime. In practice a single 120 mg filter coffee on an otherwise clean day needs roughly six hours before sleep to fall under the 50 mg line.",
    ],
    [
      "Where is my log stored?",
      "In your browser's local storage only — the last 14 days are kept and older days are pruned automatically, with a 7-day bar showing recent totals. Nothing is uploaded. If caffeine is affecting your sleep, heart rate or anxiety, discuss it with a doctor rather than relying on this estimate.",
    ],
  ],
};

export default seo;
