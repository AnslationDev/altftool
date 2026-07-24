// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "buffer-ph-calculator",
  "title": "Buffer pH Calculator",
  "description": "Henderson-Hasselbalch equation se buffer pH calculate kare.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "flask-conical",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "pka",
      "label": "Acid pKa",
      "type": "number",
      "default": 4.76
    },
    {
      "key": "acid",
      "label": "Acid concentration or moles",
      "type": "number",
      "default": 0.1,
      "min": 1e-9
    },
    {
      "key": "base",
      "label": "Conjugate-base concentration or moles",
      "type": "number",
      "default": 0.1,
      "min": 1e-9
    },
    {
      "key": "temperature",
      "label": "Temperature note (°C)",
      "type": "number",
      "default": 25
    }
  ],
  "presets": [
    {
      "label": "Equal acetate buffer",
      "values": {
        "pka": 4.76,
        "acid": 0.1,
        "base": 0.1,
        "temperature": 25
      }
    }
  ],
  "note": "Henderson–Hasselbalch approximation using entered activities as concentrations/moles. It ignores activity coefficients, dilution, multiple equilibria, ionic strength, and temperature-dependent pKa unless you supply it."
},
  compute: (values) => {
      const pKa = Number(values.pka), acid = Number(values.acid), base = Number(values.base), temperature = Number(values.temperature);
      if (!(acid > 0 && base > 0)) return { result: "—", caption: "Acid and base quantities must be positive" };
      const ratio = base / acid, pH = pKa + Math.log10(ratio);
      return { result: pH.toFixed(6) + " estimated pH", caption: "Henderson–Hasselbalch at entered pKa", rows: [["pKa", pKa], ["Base / acid ratio", ratio.toFixed(8)], ["Acid fraction", (acid / (acid + base)).toFixed(6)], ["Base fraction", (base / (acid + base)).toFixed(6)], ["Temperature note", temperature + " °C"]] };
    },
};

export default spec;
