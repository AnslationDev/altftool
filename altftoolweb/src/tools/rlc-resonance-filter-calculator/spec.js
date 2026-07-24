// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "rlc-resonance-filter-calculator",
  "title": "RLC Resonance & Filter Calculator",
  "description": "Resonant frequency, Q factor aur cutoff calculate kare.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Electronics",
    "Calculator"
  ],
  "icon": "audio-waveform",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "resistance",
      "label": "Resistance R (Ω)",
      "type": "number",
      "default": 50,
      "min": 0
    },
    {
      "key": "inductance",
      "label": "Inductance L (mH)",
      "type": "number",
      "default": 10,
      "min": 0.0001
    },
    {
      "key": "capacitance",
      "label": "Capacitance C (µF)",
      "type": "number",
      "default": 1,
      "min": 0.0001
    },
    {
      "key": "topology",
      "label": "Topology",
      "type": "select",
      "default": "series",
      "choices": [
        {
          "value": "series",
          "label": "Series RLC"
        },
        {
          "value": "parallel",
          "label": "Parallel RLC approximation"
        }
      ]
    }
  ],
  "presets": [
    {
      "label": "50 Ω · 10 mH · 1 µF",
      "values": {
        "resistance": 50,
        "inductance": 10,
        "capacitance": 1,
        "topology": "series"
      }
    }
  ],
  "note": "Deterministic browser calculation. Check units, assumptions, standards, and rounding before using the result in a financial, engineering, scientific, or safety decision."
},
  compute: (values) => {
      const R = Math.max(0, Number(values.resistance) || 0), L = Number(values.inductance) / 1000, C = Number(values.capacitance) / 1000000;
      if (!(L > 0 && C > 0)) return { result: "—", caption: "L and C must be positive" };
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const q = values.topology === "parallel" ? (R ? R * Math.sqrt(C / L) : 0) : (R ? Math.sqrt(L / C) / R : 0);
      const bandwidth = q ? f0 / q : 0, lower = Math.max(0, f0 - bandwidth / 2), upper = f0 + bandwidth / 2;
      return { result: f0.toFixed(4) + " Hz resonance", caption: values.topology + " approximation", rows: [["Angular frequency", (2 * Math.PI * f0).toFixed(4) + " rad/s"], ["Q factor", q.toFixed(5)], ["Bandwidth", bandwidth.toFixed(4) + " Hz"], ["Approx. lower / upper", lower.toFixed(4) + " / " + upper.toFixed(4) + " Hz"], ["Characteristic impedance", Math.sqrt(L / C).toFixed(4) + " Ω"]] };
    },
};

export default spec;
