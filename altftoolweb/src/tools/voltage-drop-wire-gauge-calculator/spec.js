// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "voltage-drop-wire-gauge-calculator",
  "title": "Voltage Drop & Wire Gauge Calculator",
  "description": "Estimate voltage loss along a wire run from its length, current, and conductor type or gauge.",
  "badge": "Engineering & Science Calculators",
  "category": [
    "Electronics",
    "Calculator"
  ],
  "icon": "cable",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "system",
      "label": "Circuit",
      "type": "select",
      "default": "dc",
      "choices": [
        {
          "value": "dc",
          "label": "DC / single-phase 2-wire"
        },
        {
          "value": "three",
          "label": "Balanced three-phase"
        }
      ]
    },
    {
      "key": "voltage",
      "label": "Nominal voltage (V)",
      "type": "number",
      "default": 230,
      "min": 0.1
    },
    {
      "key": "current",
      "label": "Current (A)",
      "type": "number",
      "default": 20,
      "min": 0
    },
    {
      "key": "length",
      "label": "One-way length (m)",
      "type": "number",
      "default": 30,
      "min": 0
    },
    {
      "key": "material",
      "label": "Conductor",
      "type": "select",
      "default": "copper",
      "choices": [
        {
          "value": "copper",
          "label": "Copper"
        },
        {
          "value": "aluminum",
          "label": "Aluminium"
        }
      ]
    },
    {
      "key": "area",
      "label": "Conductor area (mm²)",
      "type": "number",
      "default": 4,
      "min": 0.01
    },
    {
      "key": "limit",
      "label": "Target maximum drop (%)",
      "type": "number",
      "default": 3,
      "min": 0.1
    }
  ],
  "presets": [
    {
      "label": "230 V copper",
      "values": {
        "system": "dc",
        "voltage": 230,
        "current": 20,
        "length": 30,
        "material": "copper",
        "area": 4,
        "limit": 3
      }
    }
  ],
  "note": "Resistance-only room-temperature estimate. It does not size a conductor for ampacity, temperature, insulation, grouping, fault current, starting current, reactance, terminals, or local code."
},
  compute: (values) => {
      const V = Number(values.voltage), I = Math.max(0, Number(values.current) || 0), L = Math.max(0, Number(values.length) || 0), area = Number(values.area), rho = values.material === "aluminum" ? 0.0282 : 0.0175, factor = values.system === "three" ? Math.sqrt(3) : 2;
      if (!(V > 0 && area > 0)) return { result: "—", caption: "Voltage and conductor area must be positive" };
      const resistance = rho * factor * L / area, drop = I * resistance, percent = drop / V * 100, limit = Math.max(0.1, Number(values.limit) || 3), requiredArea = rho * factor * L * I / (V * limit / 100);
      return { result: drop.toFixed(4) + " V drop", caption: percent.toFixed(3) + "% · " + (percent <= limit ? "within entered target" : "above entered target"), rows: [["Loop/equivalent resistance", resistance.toFixed(6) + " Ω"], ["Load voltage", (V - drop).toFixed(4) + " V"], ["Entered area", area + " mm²"], ["Minimum area for target (resistance only)", requiredArea.toFixed(3) + " mm²"], ["Target", limit + "%"]] };
    },
};

export default spec;
