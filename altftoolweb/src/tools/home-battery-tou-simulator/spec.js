// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "home-battery-tou-simulator",
  "title": "Home Battery TOU Simulator",
  "description": "Tariffs aur load profile se charging/discharging scenarios compare kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "battery-charging",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "intervals",
      "label": "Load and price intervals",
      "type": "textarea",
      "default": "00:00 | 1.0 | 5\n06:00 | 1.5 | 8\n18:00 | 3.0 | 12\n22:00 | 1.2 | 6",
      "hint": "Time | load kWh | price per kWh"
    },
    {
      "key": "capacity",
      "label": "Usable battery capacity (kWh)",
      "type": "number",
      "default": 8,
      "min": 0
    },
    {
      "key": "power",
      "label": "Charge/discharge per interval (kWh)",
      "type": "number",
      "default": 3,
      "min": 0
    },
    {
      "key": "efficiency",
      "label": "Round-trip efficiency (%)",
      "type": "number",
      "default": 90,
      "min": 1,
      "max": 100
    }
  ],
  "presets": [
    {
      "label": "Four tariff intervals",
      "values": {
        "intervals": "00:00 | 1.0 | 5\n06:00 | 1.5 | 8\n18:00 | 3.0 | 12\n22:00 | 1.2 | 6",
        "capacity": 8,
        "power": 3,
        "efficiency": 90
      }
    }
  ],
  "note": "Simplified price-arbitrage illustration that charges at the cheapest entered interval and discharges at expensive intervals. It omits interval duration, solar, reserve, degradation, demand charges, export, controls, and tariff rules."
},
  compute: (values) => {
      const capacity = Math.max(0, Number(values.capacity) || 0), perInterval = Math.max(0, Number(values.power) || 0), efficiency = Math.max(0.01, Math.min(1, Number(values.efficiency) / 100));
      const rows = String(values.intervals || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => { const [time, load, price] = line.split("|").map((cell) => cell.trim()); return { time, load: Math.max(0, Number(load) || 0), price: Math.max(0, Number(price) || 0) }; });
      const baseline = rows.reduce((sum, row) => sum + row.load * row.price, 0), cheapest = [...rows].sort((a, b) => a.price - b.price)[0], expensive = [...rows].sort((a, b) => b.price - a.price);
      let stored = Math.min(capacity, perInterval * efficiency), chargeInput = stored / efficiency, simulated = baseline + (cheapest ? chargeInput * cheapest.price : 0), discharged = 0;
      const plan = expensive.map((row) => { const use = Math.min(stored, perInterval, row.load); stored -= use; discharged += use; simulated -= use * row.price; return [row.time, row.price, use.toFixed(3), (use * row.price).toFixed(2)]; }).filter((row) => Number(row[2]) > 0);
      return { result: Math.max(0, baseline - simulated).toFixed(2) + " estimated savings", caption: "Baseline " + baseline.toFixed(2) + " · simulated " + simulated.toFixed(2), rows: [["Charge interval", cheapest?.time || "—"], ["Grid energy charged", chargeInput.toFixed(3) + " kWh"], ["Energy discharged", discharged.toFixed(3) + " kWh"], ["Capacity", capacity + " kWh"]], table: { headers: ["Discharge time", "Price", "Battery kWh", "Avoided cost"], rows: plan } };
    },
};

export default spec;
