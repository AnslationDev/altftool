// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "ev-road-trip-charge-planner",
  "title": "EV Road-Trip Charge Planner",
  "description": "Battery, range aur route legs se charging stops plan kare.",
  "badge": "Energy, Mobility & Quantified-Self",
  "category": [
    "Lifestyle",
    "Calculator"
  ],
  "icon": "route",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "battery",
      "label": "Usable battery (kWh)",
      "type": "number",
      "default": 60,
      "min": 0.1
    },
    {
      "key": "efficiency",
      "label": "Consumption (kWh/100 km)",
      "type": "number",
      "default": 18,
      "min": 0.1
    },
    {
      "key": "start_soc",
      "label": "Start state of charge (%)",
      "type": "number",
      "default": 90,
      "min": 0,
      "max": 100
    },
    {
      "key": "reserve_soc",
      "label": "Arrival reserve (%)",
      "type": "number",
      "default": 15,
      "min": 0,
      "max": 90
    },
    {
      "key": "legs",
      "label": "Route legs",
      "type": "textarea",
      "default": "Home to Stop 1 | 180\nStop 1 to Stop 2 | 210\nStop 2 to Destination | 160",
      "hint": "Leg | distance km"
    },
    {
      "key": "target_soc",
      "label": "Charge-to target at stops (%)",
      "type": "number",
      "default": 80,
      "min": 1,
      "max": 100
    }
  ],
  "presets": [
    {
      "label": "550 km trip",
      "values": {
        "battery": 60,
        "efficiency": 18,
        "start_soc": 90,
        "reserve_soc": 15,
        "legs": "Home to Stop 1 | 180\nStop 1 to Stop 2 | 210\nStop 2 to Destination | 160",
        "target_soc": 80
      }
    }
  ],
  "note": "Energy arithmetic, not a live charger/route planner. Weather, elevation, speed, traffic, battery temperature, HVAC, degradation, charging curve, detours, outages, and reserve needs can materially change the trip."
},
  compute: (values) => {
      const battery = Number(values.battery), consumption = Number(values.efficiency) / 100, reserve = Number(values.reserve_soc), target = Number(values.target_soc);
      if (!(battery > 0 && consumption > 0)) return { result: "—", caption: "Battery and consumption must be positive" };
      let soc = Math.max(0, Math.min(100, Number(values.start_soc))), totalCharge = 0;
      const rows = String(values.legs || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index, all) => {
        const [name, distanceRaw] = line.split("|").map((cell) => cell.trim()), distance = Math.max(0, Number(distanceRaw) || 0), energy = distance * consumption, usedSoc = energy / battery * 100, arrival = soc - usedSoc;
        let charge = 0;
        if (index < all.length - 1 && arrival < target) { charge = Math.max(0, target - arrival) / 100 * battery; soc = target; } else soc = arrival;
        totalCharge += charge;
        return [name || "Leg", distance, energy.toFixed(2), arrival.toFixed(1) + "%", arrival >= reserve ? "Above reserve" : "Below reserve", charge.toFixed(2) + " kWh"];
      });
      return { result: totalCharge.toFixed(2) + " kWh planned stop charging", caption: reserve + "% entered reserve", table: { headers: ["Leg", "km", "Energy", "Arrival SOC", "Reserve", "Charge before next"], rows } };
    },
};

export default spec;
