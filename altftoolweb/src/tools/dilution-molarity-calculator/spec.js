// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "dilution-molarity-calculator",
  "title": "Dilution & Molarity Calculator",
  "description": "Calculate dilution concentrations and volumes with C1V1 = C2V2, or find molarity from a solute's mass and molar mass.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "beaker",
  "iconColor": "text-primary",
  "modes": [
    {
      "id": "dilution",
      "label": "C₁V₁ = C₂V₂"
    },
    {
      "id": "molarity",
      "label": "Molarity from mass"
    }
  ],
  "fields": [
    {
      "key": "c1",
      "label": "Stock concentration C₁",
      "type": "number",
      "default": 2,
      "min": 0,
      "mode": "dilution"
    },
    {
      "key": "v1",
      "label": "Stock volume V₁ (mL)",
      "type": "number",
      "default": 25,
      "min": 0,
      "mode": "dilution"
    },
    {
      "key": "c2",
      "label": "Final concentration C₂",
      "type": "number",
      "default": 0.5,
      "min": 0.0001,
      "mode": "dilution"
    },
    {
      "key": "mass",
      "label": "Solute mass (g)",
      "type": "number",
      "default": 5.844,
      "min": 0,
      "mode": "molarity"
    },
    {
      "key": "molar_mass",
      "label": "Molar mass (g/mol)",
      "type": "number",
      "default": 58.44,
      "min": 0.0001,
      "mode": "molarity"
    },
    {
      "key": "volume_l",
      "label": "Solution volume (L)",
      "type": "number",
      "default": 1,
      "min": 0.0001,
      "mode": "molarity"
    }
  ],
  "presets": [
    {
      "label": "Dilute 2 M to 0.5 M",
      "values": {
        "c1": 2,
        "v1": 25,
        "c2": 0.5
      },
      "mode": "dilution"
    },
    {
      "label": "NaCl example",
      "values": {
        "mass": 5.844,
        "molar_mass": 58.44,
        "volume_l": 1
      },
      "mode": "molarity"
    }
  ],
  "note": "Arithmetic aid only. Follow laboratory safety, compatibility, volumetric-glassware, temperature, purity, hydration, significant-figure, and hazardous-material procedures."
},
  compute: (values, mode) => {
      if (mode === "molarity") {
        const mass = Number(values.mass), molarMass = Number(values.molar_mass), volume = Number(values.volume_l);
        if (!(molarMass > 0 && volume > 0)) return { result: "—", caption: "Molar mass and volume must be positive" };
        const moles = mass / molarMass, molarity = moles / volume;
        return { result: molarity.toFixed(8) + " mol/L", rows: [["Moles", moles.toFixed(8)], ["Mass", mass + " g"], ["Molar mass", molarMass + " g/mol"], ["Volume", volume + " L"]] };
      }
      const c1 = Number(values.c1), v1 = Number(values.v1), c2 = Number(values.c2);
      if (!(c2 > 0)) return { result: "—", caption: "Final concentration must be positive" };
      const v2 = c1 * v1 / c2, diluent = v2 - v1;
      return { result: v2.toFixed(8) + " mL final volume", rows: [["Stock volume", v1 + " mL"], ["Diluent to add", diluent.toFixed(8) + " mL"], ["Dilution factor", c1 && c2 ? (c1 / c2).toFixed(8) : "—"], ["C₁V₁", (c1 * v1).toFixed(8)]] };
    },
};

export default spec;
