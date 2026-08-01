// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "three-phase-power-calculator",
  "title": "Three-Phase Power Calculator",
  "description": "Convert three-phase voltage, current and power factor into kW, kVA and output power.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Electronics",
    "Calculator"
  ],
  "icon": "zap",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "voltage",
      "label": "Line-to-line voltage (V)",
      "type": "number",
      "default": 400,
      "min": 0
    },
    {
      "key": "current",
      "label": "Line current (A)",
      "type": "number",
      "default": 50,
      "min": 0
    },
    {
      "key": "power_factor",
      "label": "Power factor",
      "type": "number",
      "default": 0.9,
      "min": 0,
      "max": 1,
      "step": 0.01
    },
    {
      "key": "efficiency",
      "label": "Efficiency (%)",
      "type": "number",
      "default": 95,
      "min": 0,
      "max": 100
    }
  ],
  "presets": [
    {
      "label": "400 V · 50 A",
      "values": {
        "voltage": 400,
        "current": 50,
        "power_factor": 0.9,
        "efficiency": 95
      }
    }
  ],
  "note": "Balanced three-phase estimate using line voltage/current. Confirm system topology, harmonics, waveform, phase balance, motor duty, cable limits, and applicable electrical standards with a qualified professional."
},
  compute: (values) => {
      const V = Math.max(0, Number(values.voltage) || 0), I = Math.max(0, Number(values.current) || 0), pf = Math.max(0, Math.min(1, Number(values.power_factor) || 0)), efficiency = Math.max(0, Math.min(1, Number(values.efficiency) / 100));
      const va = Math.sqrt(3) * V * I, watts = va * pf, output = watts * efficiency, reactive = Math.sqrt(Math.max(0, va * va - watts * watts));
      return { result: (watts / 1000).toFixed(4) + " kW input", rows: [["Apparent power", (va / 1000).toFixed(4) + " kVA"], ["Reactive power", (reactive / 1000).toFixed(4) + " kVAr"], ["Estimated output", (output / 1000).toFixed(4) + " kW"], ["Power factor", pf], ["Efficiency", (efficiency * 100).toFixed(2) + "%"]] };
    },
};

export default spec;
