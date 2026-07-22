// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ohms-law-calculator",
  "title": "Ohms Law Calculator",
  "description": "Calculate voltage, current, or resistance using Ohm's Law.",
  "badge": "Science",
  "category": [
    "Science"
  ],
  "icon": "wrench",
  "iconColor": "text-emerald-600",
  "fields": [
    {
      "key": "voltage",
      "label": "Voltage (V)",
      "type": "number",
      "default": "12"
    },
    {
      "key": "current",
      "label": "Current (A)",
      "type": "number",
      "default": "1"
    },
    {
      "key": "resistance",
      "label": "Resistance (Ω)",
      "type": "number",
      "default": "10"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "voltage": "12"
      }
    }
  ],
  "note": "Ensure all values are in the correct units."
},
  compute: (values) => { let {voltage, current, resistance} = values; if (!voltage && !current && !resistance) return { result: 'Please enter at least one value.' }; if (voltage && current) resistance = voltage / current; else if (voltage && resistance) current = voltage / resistance; else if (current && resistance) voltage = current * resistance; else return { result: 'Invalid input combination.' }; return { result: `${resistance.toFixed(2)} Ω`, rows: [['Voltage', `${voltage} V`], ['Current', `${current} A`]] }; },
};

export default spec;
