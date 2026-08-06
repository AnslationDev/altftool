// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "appliance-load-shift-planner",
  "title": "Appliance Load-Shift Planner",
  "description": "Shift flexible appliance loads into your cheaper electricity tariff windows.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Productivity"
  ],
  "icon": "clock",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "windows",
      "label": "Tariff windows",
      "type": "textarea",
      "default": "00:00-06:00 | 5\n06:00-18:00 | 8\n18:00-22:00 | 12\n22:00-24:00 | 6",
      "hint": "Window | price per kWh"
    },
    {
      "key": "appliances",
      "label": "Flexible appliances",
      "type": "textarea",
      "default": "Dishwasher | 1.2\nWater heater | 3.0\nLaundry | 0.8",
      "hint": "Appliance | cycle kWh"
    },
    {
      "key": "max_parallel",
      "label": "Maximum parallel cycles",
      "type": "number",
      "default": 1,
      "min": 1
    }
  ],
  "presets": [
    {
      "label": "Three appliances",
      "values": {
        "windows": "00:00-06:00 | 5\n06:00-18:00 | 8\n18:00-22:00 | 12\n22:00-24:00 | 6",
        "appliances": "Dishwasher | 1.2\nWater heater | 3.0\nLaundry | 0.8",
        "max_parallel": 1
      }
    }
  ],
  "note": "Cost-ordering aid only. Respect appliance instructions, ventilation, noise, hot-water hygiene, fire/electrical safety, supervision, demand limits, and household needs."
},
  compute: (values) => {
      const windows = String(values.windows || "").split(/\r?\n/).map((line) => { const [window, price] = line.split("|").map((cell) => cell.trim()); return [window, Number(price)]; }).filter((row) => Number.isFinite(row[1])).sort((a, b) => a[1] - b[1]);
      const appliances = String(values.appliances || "").split(/\r?\n/).map((line) => { const [name, energy] = line.split("|").map((cell) => cell.trim()); return [name, Math.max(0, Number(energy) || 0)]; }).filter((row) => row[0]);
      const parallel = Math.max(1, Math.round(Number(values.max_parallel) || 1)), rows = appliances.map((item, index) => { const window = windows[Math.floor(index / parallel) % Math.max(1, windows.length)] || ["—", 0]; return [item[0], item[1].toFixed(3), window[0], window[1], (item[1] * window[1]).toFixed(2)]; });
      return { result: rows.reduce((sum, row) => sum + Number(row[4]), 0).toFixed(2) + " scheduled energy cost", caption: parallel + " parallel cycle(s) allowed", table: { headers: ["Appliance", "kWh", "Suggested window", "Price/kWh", "Cost"], rows } };
    },
};

export default spec;
