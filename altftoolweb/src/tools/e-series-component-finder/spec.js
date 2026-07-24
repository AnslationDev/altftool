// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "e-series-component-finder",
  "title": "E-Series Component Finder",
  "description": "Nearest standard resistor/capacitor value suggest kare.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Electronics",
    "Calculator"
  ],
  "icon": "resistor",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "target",
      "label": "Target value (Ω, F, or H)",
      "type": "number",
      "default": 4720,
      "min": 1e-9
    },
    {
      "key": "series",
      "label": "Preferred-number series",
      "type": "select",
      "default": "24",
      "choices": [
        {
          "value": "6",
          "label": "E6"
        },
        {
          "value": "12",
          "label": "E12"
        },
        {
          "value": "24",
          "label": "E24"
        },
        {
          "value": "48",
          "label": "E48"
        },
        {
          "value": "96",
          "label": "E96"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "4.72 kΩ in E24",
      "values": {
        "target": 4720,
        "series": "24"
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const target = Number(values.target), count = Number(values.series);
      if (!(target > 0 && count > 0)) return { result: "—", caption: "Target and series must be positive" };
      const decade = Math.floor(Math.log10(target)), candidates = [];
      for (let d = decade - 1; d <= decade + 1; d += 1) for (let index = 0; index < count; index += 1) candidates.push(Math.pow(10, d) * Math.pow(10, index / count));
      candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
      const unique = [...new Set(candidates.map((value) => Number(value.toPrecision(count <= 24 ? 2 : 3))))].sort((a, b) => Math.abs(a - target) - Math.abs(b - target)).slice(0, 6);
      const closest = unique[0];
      return { result: closest.toLocaleString(undefined, { maximumSignificantDigits: count <= 24 ? 2 : 3 }) + " nearest E" + count + " value", caption: (((closest - target) / target) * 100).toFixed(4) + "% error", rows: [["Target", target], ["Nearest below", Math.max(...unique.filter((value) => value <= target), 0)], ["Nearest above", Math.min(...unique.filter((value) => value >= target), Number.MAX_SAFE_INTEGER)]], table: { headers: ["Candidate", "Error %"], rows: unique.map((value) => [value, (((value - target) / target) * 100).toFixed(5)]) } };
    },
};

export default spec;
