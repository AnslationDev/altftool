// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "radioactive-decay-calculator",
  "title": "Radioactive Decay Calculator",
  "description": "Calculate a sample's remaining quantity, activity, or age from its half-life and elapsed time.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "atom",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "initial",
      "label": "Initial quantity / activity",
      "type": "number",
      "default": 100,
      "min": 0
    },
    {
      "key": "half_life",
      "label": "Half-life",
      "type": "number",
      "default": 5,
      "min": 0.0001
    },
    {
      "key": "time",
      "label": "Elapsed time (same units)",
      "type": "number",
      "default": 12,
      "min": 0
    },
    {
      "key": "target",
      "label": "Target remaining quantity",
      "type": "number",
      "default": 10,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "100 over 12 years",
      "values": {
        "initial": 100,
        "half_life": 5,
        "time": 12,
        "target": 10
      }
    }
  ],
  "note": "Single-isotope exponential decay estimate. Real samples may involve decay chains, branching, detector efficiency, background, shielding, contamination controls, or regulated handling."
},
  compute: (values) => {
      const initial = Math.max(0, Number(values.initial) || 0), half = Number(values.half_life), time = Math.max(0, Number(values.time) || 0), target = Math.max(0, Number(values.target) || 0);
      if (!(half > 0)) return { result: "—", caption: "Half-life must be positive" };
      const lambda = Math.log(2) / half, remaining = initial * Math.exp(-lambda * time), fraction = initial ? remaining / initial : 0;
      const validTarget = initial > 0 && target > 0 && target <= initial;
      const targetTime = validTarget ? Math.log(initial / target) / lambda : 0;
      return { result: remaining.toFixed(8) + " remaining", caption: (fraction * 100).toFixed(6) + "% of initial", rows: [["Decay constant", lambda.toFixed(8) + " per time unit"], ["Elapsed half-lives", (time / half).toFixed(6)], ["Decayed quantity", (initial - remaining).toFixed(8)], ["Time to entered target", validTarget ? targetTime.toFixed(8) : "Target must be >0 and ≤ initial"]] };
    },
};

export default spec;
