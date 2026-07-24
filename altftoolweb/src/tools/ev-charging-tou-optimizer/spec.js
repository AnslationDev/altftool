// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ev-charging-tou-optimizer",
  "title": "EV Charging TOU Optimizer",
  "description": "Tariff windows se lower-cost charging schedule calculate kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "battery-charging",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "needed",
      "label": "Energy needed at battery (kWh)",
      "type": "number",
      "default": 45,
      "min": 0
    },
    {
      "key": "power",
      "label": "Charger power (kW)",
      "type": "number",
      "default": 7.2,
      "min": 0.1
    },
    {
      "key": "efficiency",
      "label": "Charging efficiency (%)",
      "type": "number",
      "default": 90,
      "min": 1,
      "max": 100
    },
    {
      "key": "windows",
      "label": "Tariff windows",
      "type": "textarea",
      "default": "00:00-06:00 | 5.5\n06:00-18:00 | 8.0\n18:00-22:00 | 12.0\n22:00-24:00 | 6.0",
      "hint": "Start-end | price per kWh"
    }
  ],
  "presets": [
    {
      "label": "45 kWh overnight",
      "values": {
        "needed": 45,
        "power": 7.2,
        "efficiency": 90,
        "windows": "00:00-06:00 | 5.5\n06:00-18:00 | 8.0\n18:00-22:00 | 12.0\n22:00-24:00 | 6.0"
      }
    }
  ],
  "note": "Simplified full-power schedule; confirm charger/car limits, tapering, battery conditioning, departure time, demand charges, taxes, and utility tariff rules."
},
  compute: (values) => {
      const needed = Math.max(0, Number(values.needed) || 0), power = Number(values.power), efficiency = Math.max(0.01, Math.min(1, Number(values.efficiency) / 100));
      if (!(power > 0)) return { result: "—", caption: "Charger power must be positive" };
      const grid = needed / efficiency, hours = grid / power;
      const windows = String(values.windows || "").split(/\r?\n/).map((line) => { const [range, price] = line.split("|").map((cell) => cell.trim()); const [start, end] = String(range || "").split("-"); const toHour = (value) => { const [h, m] = String(value || "").split(":").map(Number); return (h === 24 ? 24 : h || 0) + (m || 0) / 60; }; return { range, price: Number(price), duration: Math.max(0, toHour(end) - toHour(start)) }; }).filter((row) => Number.isFinite(row.price) && row.duration > 0).sort((a, b) => a.price - b.price);
      let remaining = hours, cost = 0;
      const plan = windows.map((tariff) => { const use = Math.min(remaining, tariff.duration); remaining -= use; const energy = use * power, itemCost = energy * tariff.price; cost += itemCost; return [tariff.range, tariff.price, use.toFixed(3), energy.toFixed(3), itemCost.toFixed(2)]; }).filter((row) => Number(row[2]) > 0);
      return { result: cost.toFixed(2) + " estimated charging cost", caption: hours.toFixed(3) + " charging hours · " + (remaining > 0 ? remaining.toFixed(2) + " h do not fit" : "fits entered windows"), rows: [["Battery energy", needed + " kWh"], ["Grid energy", grid.toFixed(3) + " kWh"], ["Charger power", power + " kW"]], table: { headers: ["Window", "Price/kWh", "Hours", "Grid kWh", "Cost"], rows: plan } };
    },
};

export default spec;
