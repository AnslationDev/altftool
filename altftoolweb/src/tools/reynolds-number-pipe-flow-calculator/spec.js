// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "reynolds-number-pipe-flow-calculator",
  "title": "Reynolds Number & Pipe Flow Calculator",
  "description": "Flow regime, Reynolds number aur head loss calculate kare.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Education & Science",
    "Calculator"
  ],
  "icon": "waves",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "density",
      "label": "Fluid density (kg/m³)",
      "type": "number",
      "default": 998,
      "min": 0.0001
    },
    {
      "key": "viscosity",
      "label": "Dynamic viscosity (mPa·s)",
      "type": "number",
      "default": 1.002,
      "min": 0.0001
    },
    {
      "key": "velocity",
      "label": "Mean velocity (m/s)",
      "type": "number",
      "default": 2,
      "min": 0
    },
    {
      "key": "diameter",
      "label": "Pipe inside diameter (mm)",
      "type": "number",
      "default": 50,
      "min": 0.0001
    },
    {
      "key": "length",
      "label": "Pipe length (m)",
      "type": "number",
      "default": 20,
      "min": 0
    },
    {
      "key": "roughness",
      "label": "Absolute roughness (mm)",
      "type": "number",
      "default": 0.045,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "Water in 50 mm pipe",
      "values": {
        "density": 998,
        "viscosity": 1.002,
        "velocity": 2,
        "diameter": 50,
        "length": 20,
        "roughness": 0.045
      }
    }
  ],
  "note": "Steady, fully developed single-phase pipe-flow estimate using Darcy–Weisbach and a Swamee–Jain turbulent approximation. Verify fittings, entrances, elevation, temperature, compressibility, cavitation, and code."
},
  compute: (values) => {
      const rho = Number(values.density), mu = Number(values.viscosity) / 1000, velocity = Math.max(0, Number(values.velocity) || 0), diameter = Number(values.diameter) / 1000, length = Math.max(0, Number(values.length) || 0), roughness = Math.max(0, Number(values.roughness) || 0) / 1000;
      if (!(rho > 0 && mu > 0 && diameter > 0)) return { result: "—", caption: "Density, viscosity, and diameter must be positive" };
      const Re = rho * velocity * diameter / mu;
      const regime = Re < 2300 ? "Laminar" : Re < 4000 ? "Transitional" : "Turbulent";
      const friction = Re > 0 ? (Re < 2300 ? 64 / Re : 0.25 / Math.pow(Math.log10(roughness / (3.7 * diameter) + 5.74 / Math.pow(Re, 0.9)), 2)) : 0;
      const pressureDrop = friction * (length / diameter) * (rho * velocity * velocity / 2), headLoss = pressureDrop / (rho * 9.80665), flow = velocity * Math.PI * diameter * diameter / 4;
      return { result: Re.toFixed(2) + " Reynolds number", caption: regime, rows: [["Darcy friction factor", friction.toFixed(7)], ["Pressure drop", pressureDrop.toFixed(3) + " Pa"], ["Head loss", headLoss.toFixed(5) + " m"], ["Volumetric flow", (flow * 1000).toFixed(5) + " L/s"], ["Relative roughness", (roughness / diameter).toFixed(7)]] };
    },
};

export default spec;
