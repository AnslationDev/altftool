const seo = {
  title: "Geyser Capacity Selector: Litres for Bath or Shower",
  metaDescription:
    "Size a water heater from the mixing balance — a 20 L bucket at 40 °C from a 60 °C tank draws 10 L — plus reheat minutes and kWh per heat.",
  steps: [
    "Choose the Bucket bath or Shower chip, then set Bucket size (litres) and Buckets per person — or Shower time per person (minutes) and Shower flow (litres per minute) — plus \"People bathing back to back\".",
    "Enter Comfortable bathing temperature (°C), Mains water temperature (°C), Thermostat setting (°C) and Element rating (W), and optionally an electricity tariff per unit.",
    "Read the Recommended tank size in litres with the Hot water drawn per person, Cold mixed in per person, \"Time to heat a full tank from cold\" in minutes and Energy per full heat in kWh rows, then press Copy result.",
  ],
  intro:
    "This selector sizes a storage water heater from the mixing balance rather than a rule of thumb: hot water drawn equals bath volume multiplied by (bath temperature minus mains temperature) divided by (tank temperature minus mains temperature). A 20 litre bucket at 40 °C from a 60 °C tank with 20 °C mains therefore draws only 10 litres, which is why a 15 litre geyser suits one bucket bath and 25 litres suits two in a row. Reheat time and energy come from Q = m x c x dT with water's specific heat of 4,186 J/kg·K.",
  useCases: [
    "Decide between a 15 L and a 25 L geyser for a bathroom two people use back to back each morning.",
    "Check whether an existing tank can cover an eight-minute shower before switching from bucket baths.",
    "Work out how long a geyser needs to be switched on before the first bath in winter.",
  ],
  benefits: [
    ["Mixing maths, not guesswork", "Accounts for the cold water you actually add, so the tank is not oversized."],
    ["Reheat time included", "Shows the minutes on your element rating, so you know when to switch it on."],
    ["Seasonal by design", "Drop the mains temperature to a winter figure and watch the required size and time rise."],
  ],
  faqs: [
    [
      "What size geyser do I need for one bathroom?",
      "15 litres covers one bucket bath comfortably, and 25 litres covers two people bathing back to back. A single 8-minute shower at 8 litres a minute draws about 32 litres of 60 °C water, which needs a 35 litre tank or an instant heater.",
    ],
    [
      "How many bucket baths from a 15 litre geyser?",
      "About one and a third at typical settings. A 15 litre tank delivers roughly 13.5 litres of usable hot water, and a 20 litre bucket at 40 °C from a 60 °C tank with 20 °C mains needs 10 litres, so the second bath runs short unless you wait for a reheat.",
    ],
    [
      "How long does a geyser take to heat water?",
      "A 15 litre tank rising 40 °C on a 2,000 W element takes about 22 minutes; 25 litres over the same rise takes around 37 minutes. The maths is litres x 4,186 J/kg·K x temperature rise, divided by the element wattage.",
    ],
    [
      "What temperature should I set a geyser to?",
      "60 °C is the usual compromise: hot enough to suppress bacteria and to stretch the stored water further when mixed, but not so hot that scalding and limescale become problems. Lowering the thermostat cuts standing loss but also cuts how many baths one tank gives, because you mix in less cold.",
    ],
  ],
};

export default seo;
