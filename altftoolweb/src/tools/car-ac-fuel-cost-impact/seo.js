const seo = {
  title: "Car AC Fuel Cost Calculator: Real Mileage Penalty",
  metaDescription:
    "Prices the compressor load using your engine's fuel per kWh — 300 g/kWh petrol, 220 diesel — for the km/l penalty and the extra cost per month.",
  steps: [
    "Under The car, choose Car size and Fuel, then enter Mileage without AC and Fuel price.",
    "Under Conditions set Outside temperature (°C), Cabin setpoint (°C), Sun exposure, People in the car and Average moving speed (km/h), then AC hours per driving day and Driving days per month.",
    "Read Extra cost per month with the mileage penalty, plus Average compressor shaft power and Engine fuel per kWh of shaft work in the breakdown; Copy result saves it.",
  ],
  intro:
    "Car air conditioning costs fuel because the compressor is a mechanical load on the engine, and this calculator prices that load properly: average compressor shaft power multiplied by the engine's brake specific fuel consumption — about 300 g/kWh for a petrol engine at part load and 220 g/kWh for a diesel — then converted to litres at the fuel's density. Compressor power itself scales with how far the cabin is being pulled below outside temperature, sun exposure and how many people are adding body heat, so the answer changes with conditions instead of being a fixed percentage.",
  useCases: [
    "You crawl through 38°C city traffic for two hours a day and want to know what the AC alone adds to the monthly fuel bill.",
    "You are deciding whether to run the AC or open the windows on a highway drive and want the real size of the penalty.",
    "Your mileage dropped sharply in summer and you want to check whether the AC explains it or something else is wrong.",
  ],
  benefits: [
    ["Load, not a flat percentage", "Compressor power moves with the temperature gap, sun and occupant count, so a mild morning and a 45°C afternoon give different answers."],
    ["Speed changes the percentage", "The AC costs the same per hour whether you crawl or cruise, so the mileage penalty is far larger in traffic — the tool shows both."],
    ["Fuel-specific engine efficiency", "Diesel engines burn about a third less fuel per kilowatt-hour of shaft work, so the same AC costs a diesel less."],
  ],
  faqs: [
    [
      "How much mileage does car AC reduce?",
      "Typically 10–20% in city driving and 5–10% on a highway. The compressor draws roughly the same power per hour either way, so the penalty is proportionally much bigger when the engine is otherwise doing little — a car at 16 km/l crawling at 30 km/h in 38°C heat loses about 19%, while the same car at 80 km/h loses about 8%.",
    ],
    [
      "Is it cheaper to use AC or open the windows?",
      "Below roughly 60–80 km/h, open windows generally cost less; above that the extra aerodynamic drag from open windows usually exceeds the compressor's fuel draw. In stop-start traffic the AC is at its most expensive relative to the fuel you are burning anyway, which is where opening the windows saves most.",
    ],
    [
      "Does setting a lower temperature use more fuel?",
      "Yes, because the compressor has to remove more heat to hold a bigger gap between cabin and outside air. Dropping the setpoint from 24°C to 20°C in 38°C weather raises the temperature gap from 14 to 18 degrees — about a 29% larger cooling load, and a proportionally larger fuel cost.",
    ],
    [
      "Why does a diesel car lose less mileage to the AC?",
      "Because a diesel engine converts fuel into shaft work more efficiently. It burns roughly 220 grams of fuel per kilowatt-hour of work against about 300 for a petrol engine, so the same compressor load costs it noticeably less fuel — before you account for diesel's higher energy content per litre.",
    ],
  ],
};

export default seo;
