// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "heat-pump-vs-furnace-estimator",
  "title": "Heat Pump vs Furnace Estimator",
  "description": "Climate, efficiency aur tariffs se running cost compare kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "thermometer-sun",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "heat_need",
      "label": "Annual useful heat need (kWh)",
      "type": "number",
      "default": 12000,
      "min": 0
    },
    {
      "key": "cop",
      "label": "Seasonal heat-pump COP",
      "type": "number",
      "default": 3.2,
      "min": 0.1
    },
    {
      "key": "electric_price",
      "label": "Electricity price / kWh",
      "type": "number",
      "default": 8,
      "min": 0
    },
    {
      "key": "fuel_price",
      "label": "Fuel price / kWh input",
      "type": "number",
      "default": 4,
      "min": 0
    },
    {
      "key": "furnace_efficiency",
      "label": "Furnace seasonal efficiency (%)",
      "type": "number",
      "default": 90,
      "min": 1,
      "max": 100
    },
    {
      "key": "fixed_hp",
      "label": "Heat-pump annual fixed cost",
      "type": "number",
      "default": 0,
      "min": 0
    },
    {
      "key": "fixed_furnace",
      "label": "Furnace annual fixed cost",
      "type": "number",
      "default": 0,
      "min": 0
    }
  ],
  "presets": [
    {
      "label": "12 MWh heat need",
      "values": {
        "heat_need": 12000,
        "cop": 3.2,
        "electric_price": 8,
        "fuel_price": 4,
        "furnace_efficiency": 90,
        "fixed_hp": 0,
        "fixed_furnace": 0
      }
    }
  ],
  "note": "Running-cost comparison only. Real sizing requires climate/load calculations, design temperatures, capacity at low temperature, defrost, ducts/radiators, backup heat, tariffs, maintenance, installation, and emissions factors."
},
  compute: (values) => {
      const heat = Math.max(0, Number(values.heat_need) || 0), cop = Number(values.cop), electric = Math.max(0, Number(values.electric_price) || 0), fuel = Math.max(0, Number(values.fuel_price) || 0), efficiency = Math.max(0.01, Number(values.furnace_efficiency) / 100);
      if (!(cop > 0)) return { result: "—", caption: "COP must be positive" };
      const hpEnergy = heat / cop, furnaceEnergy = heat / efficiency, hpCost = hpEnergy * electric + Number(values.fixed_hp), furnaceCost = furnaceEnergy * fuel + Number(values.fixed_furnace), difference = furnaceCost - hpCost;
      return { result: (difference >= 0 ? "Heat pump lower by " : "Furnace lower by ") + Math.abs(difference).toFixed(2), rows: [["Heat-pump electricity", hpEnergy.toFixed(2) + " kWh"], ["Heat-pump cost", hpCost.toFixed(2)], ["Furnace fuel input", furnaceEnergy.toFixed(2) + " kWh"], ["Furnace cost", furnaceCost.toFixed(2)], ["Break-even COP", electric > 0 ? (heat * electric / Math.max(1e-9, furnaceCost - Number(values.fixed_hp))).toFixed(3) : "—"]] };
    },
};

export default spec;
