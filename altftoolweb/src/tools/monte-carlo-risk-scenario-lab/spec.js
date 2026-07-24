// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "monte-carlo-risk-scenario-lab",
  "title": "Monte Carlo Risk Scenario Lab",
  "description": "Seeded simulations se outcome distribution aur percentiles dikhaye.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Finance",
    "Calculator"
  ],
  "icon": "dice-5",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "starting",
      "label": "Starting value",
      "type": "number",
      "default": 100000
    },
    {
      "key": "mean_return",
      "label": "Mean annual return (%)",
      "type": "number",
      "default": 7
    },
    {
      "key": "volatility",
      "label": "Annual volatility (%)",
      "type": "number",
      "default": 18,
      "min": 0
    },
    {
      "key": "years",
      "label": "Years",
      "type": "number",
      "default": 10,
      "min": 1,
      "max": 100
    },
    {
      "key": "simulations",
      "label": "Simulations",
      "type": "number",
      "default": 5000,
      "min": 100,
      "max": 20000
    },
    {
      "key": "seed",
      "label": "Seed",
      "type": "number",
      "default": 424242
    }
  ],
  "presets": [
    {
      "label": "10-year scenario",
      "values": {
        "starting": 100000,
        "mean_return": 7,
        "volatility": 18,
        "years": 10,
        "simulations": 5000,
        "seed": 424242
      }
    }
  ],
  "note": "Seeded lognormal illustration with constant independent annual return/volatility inputs. Real returns are not normally distributed or stable; no result is a forecast or investment advice."
},
  compute: (values) => {
      const starting = Number(values.starting), mean = Number(values.mean_return) / 100, vol = Math.max(0, Number(values.volatility) / 100), years = Math.max(1, Math.round(Number(values.years) || 1)), simulations = Math.max(100, Math.min(20000, Math.round(Number(values.simulations) || 1000)));
      let seed = (Math.round(Number(values.seed)) >>> 0) || 1;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return Math.max(1e-12, seed / 4294967296); };
      const normal = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
      const outcomes = [];
      for (let run = 0; run < simulations; run += 1) {
        let value = starting;
        for (let year = 0; year < years; year += 1) value *= Math.exp((mean - 0.5 * vol * vol) + vol * normal());
        outcomes.push(value);
      }
      outcomes.sort((a, b) => a - b);
      const q = (p) => outcomes[Math.floor(p * (outcomes.length - 1))];
      const lossChance = outcomes.filter((value) => value < starting).length / outcomes.length;
      return { result: q(0.5).toFixed(2) + " median outcome", caption: simulations + " seeded paths over " + years + " years", rows: [["5th percentile", q(0.05).toFixed(2)], ["25th percentile", q(0.25).toFixed(2)], ["75th percentile", q(0.75).toFixed(2)], ["95th percentile", q(0.95).toFixed(2)], ["Chance below start", (lossChance * 100).toFixed(2) + "%"], ["Seed", values.seed]] };
    },
};

export default spec;
