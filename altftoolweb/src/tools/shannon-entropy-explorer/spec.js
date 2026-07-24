// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "shannon-entropy-explorer",
  "title": "Shannon Entropy Explorer",
  "description": "Text ya probability distribution ka entropy visualize kare.",
  "badge": "Finance & Statistics Workbenches",
  "category": [
    "Education & Science",
    "Developer"
  ],
  "icon": "binary",
  "iconColor": "text-primary",
  "modes": [
    {
      "id": "text",
      "label": "Text symbols"
    },
    {
      "id": "probabilities",
      "label": "Probabilities"
    }
  ],
  "fields": [
    {
      "key": "input",
      "label": "Text or comma-separated probabilities",
      "type": "textarea",
      "default": "abracadabra"
    },
    {
      "key": "base",
      "label": "Logarithm base",
      "type": "select",
      "default": "2",
      "choices": [
        {
          "value": "2",
          "label": "2 · bits"
        },
        {
          "value": "2.718281828",
          "label": "e · nats"
        },
        {
          "value": "10",
          "label": "10 · hartleys"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "abracadabra",
      "values": {
        "input": "abracadabra",
        "base": "2"
      },
      "mode": "text"
    },
    {
      "label": "Fair four outcomes",
      "values": {
        "input": "0.25, 0.25, 0.25, 0.25",
        "base": "2"
      },
      "mode": "probabilities"
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values, mode) => {
      const base = Number(values.base) || 2;
      let probabilities = [], labels = [];
      if (mode === "probabilities") {
        const raw = String(values.input || "").split(/[\s,;]+/).map(Number).filter((value) => Number.isFinite(value) && value >= 0);
        const total = raw.reduce((sum, value) => sum + value, 0);
        probabilities = total ? raw.map((value) => value / total) : [];
        labels = raw.map((_, index) => "p" + (index + 1));
      } else {
        const counts = new Map();
        for (const symbol of [...String(values.input || "")]) counts.set(symbol, (counts.get(symbol) || 0) + 1);
        const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
        labels = [...counts.keys()].map((symbol) => symbol === " " ? "␠" : symbol);
        probabilities = [...counts.values()].map((count) => count / Math.max(1, total));
      }
      const entropy = probabilities.reduce((sum, p) => p > 0 ? sum - p * (Math.log(p) / Math.log(base)) : sum, 0);
      const maximum = probabilities.length > 1 ? Math.log(probabilities.length) / Math.log(base) : 0;
      return { result: entropy.toFixed(8) + (base === 2 ? " bits" : base === 10 ? " hartleys" : " nats"), caption: probabilities.length + " normalized outcome(s)", rows: [["Maximum entropy", maximum.toFixed(8)], ["Normalized entropy", maximum ? (entropy / maximum).toFixed(6) : "0"], ["Perplexity (base 2)", Math.pow(2, entropy * Math.log(base) / Math.log(2)).toFixed(6)]], table: { headers: ["Outcome", "Probability", "Information"], rows: probabilities.map((p, index) => [labels[index], p.toFixed(8), p > 0 ? (-Math.log(p) / Math.log(base)).toFixed(8) : "0"]) } };
    },
};

export default spec;
