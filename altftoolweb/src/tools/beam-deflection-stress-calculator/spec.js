// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "beam-deflection-stress-calculator",
  "title": "Beam Deflection & Stress Calculator",
  "description": "Calculate deflection and bending stress for standard simply supported beam load cases.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "ruler",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "load_case",
      "label": "Simply supported load case",
      "type": "select",
      "default": "point",
      "choices": [
        {
          "value": "point",
          "label": "Center point load"
        },
        {
          "value": "uniform",
          "label": "Uniform load over full span"
        }
      ]
    },
    {
      "key": "load",
      "label": "Load P (N) or w (N/m)",
      "type": "number",
      "default": 1000,
      "min": 0
    },
    {
      "key": "length",
      "label": "Span L (m)",
      "type": "number",
      "default": 2,
      "min": 0.0001
    },
    {
      "key": "elasticity",
      "label": "Elastic modulus E (GPa)",
      "type": "number",
      "default": 200,
      "min": 0.0001
    },
    {
      "key": "inertia",
      "label": "Second moment I (cm⁴)",
      "type": "number",
      "default": 500,
      "min": 0.0001
    },
    {
      "key": "section_modulus",
      "label": "Section modulus Z (cm³)",
      "type": "number",
      "default": 100,
      "min": 0.0001
    }
  ],
  "presets": [
    {
      "label": "Steel center load",
      "values": {
        "load_case": "point",
        "load": 1000,
        "length": 2,
        "elasticity": 200,
        "inertia": 500,
        "section_modulus": 100
      }
    }
  ],
  "note": "Linear elastic, small-deflection, ideal simply supported formulas. It is not a structural design check; verify supports, load combinations, stability, shear, local effects, fatigue, safety factors, and governing code."
},
  compute: (values) => {
      const load = Math.max(0, Number(values.load) || 0), L = Number(values.length), E = Number(values.elasticity) * 1e9, I = Number(values.inertia) * 1e-8, Z = Number(values.section_modulus) * 1e-6;
      if (!(L > 0 && E > 0 && I > 0 && Z > 0)) return { result: "—", caption: "L, E, I, and Z must be positive" };
      const point = values.load_case === "point";
      const moment = point ? load * L / 4 : load * L * L / 8;
      const deflection = point ? load * L ** 3 / (48 * E * I) : 5 * load * L ** 4 / (384 * E * I);
      const stress = moment / Z;
      return { result: (deflection * 1000).toFixed(6) + " mm maximum deflection", caption: point ? "Center point load" : "Uniform load", rows: [["Maximum moment", moment.toFixed(4) + " N·m"], ["Bending stress", (stress / 1e6).toFixed(4) + " MPa"], ["Span / deflection", deflection ? (L / deflection).toFixed(1) : "—"], ["E", (E / 1e9).toFixed(3) + " GPa"], ["I", (I * 1e8).toFixed(3) + " cm⁴"]] };
    },
};

export default spec;
