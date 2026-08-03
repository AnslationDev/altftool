// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ideal-gas-law-calculator",
  "title": "Ideal Gas Law Calculator",
  "description": "Solve for pressure, volume, amount, or temperature in the ideal gas law (PV = nRT) with automatic unit conversion.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "flask-round",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "solve",
      "label": "Solve for",
      "type": "select",
      "default": "pressure",
      "choices": [
        {
          "value": "pressure",
          "label": "Pressure P"
        },
        {
          "value": "volume",
          "label": "Volume V"
        },
        {
          "value": "moles",
          "label": "Amount n"
        },
        {
          "value": "temperature",
          "label": "Temperature T"
        }
      ]
    },
    {
      "key": "pressure",
      "label": "Pressure P (kPa)",
      "type": "number",
      "default": 101.325
    },
    {
      "key": "volume",
      "label": "Volume V (L)",
      "type": "number",
      "default": 24.465
    },
    {
      "key": "moles",
      "label": "Amount n (mol)",
      "type": "number",
      "default": 1
    },
    {
      "key": "temperature",
      "label": "Temperature T (K)",
      "type": "number",
      "default": 298.15
    }
  ],
  "presets": [
    {
      "label": "1 mol at 25°C",
      "values": {
        "solve": "pressure",
        "pressure": 101.325,
        "volume": 24.465,
        "moles": 1,
        "temperature": 298.15
      }
    }
  ],
  "note": "Ideal-gas approximation with R=8.314462618 kPa·L·mol⁻¹·K⁻¹. Real gases can deviate at high pressure, low temperature, phase boundaries, or reactive conditions."
},
  compute: (values) => {
      const R = 8.314462618, P = Number(values.pressure), V = Number(values.volume), n = Number(values.moles), T = Number(values.temperature);
      let result, unit;
      if (values.solve === "pressure") { if (!(V > 0)) return { result: "—", caption: "Volume must be positive" }; result = n * R * T / V; unit = "kPa"; }
      else if (values.solve === "volume") { if (!(P > 0)) return { result: "—", caption: "Pressure must be positive" }; result = n * R * T / P; unit = "L"; }
      else if (values.solve === "moles") { if (!(R * T > 0)) return { result: "—", caption: "Temperature must be positive" }; result = P * V / (R * T); unit = "mol"; }
      else { if (!(n * R > 0)) return { result: "—", caption: "Moles must be positive" }; result = P * V / (n * R); unit = "K"; }
      return { result: result.toFixed(8) + " " + unit, caption: "PV = nRT", rows: [["P", P + " kPa"], ["V", V + " L"], ["n", n + " mol"], ["T", T + " K"], ["R", R + " kPa·L/(mol·K)"]] };
    },
};

export default spec;
