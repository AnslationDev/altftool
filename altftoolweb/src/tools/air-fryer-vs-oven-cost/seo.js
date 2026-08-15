const seo = {
  title: "Air Fryer vs Oven Electricity Cost Calculator",
  metaDescription:
    "Compare a meal's kWh and cost in an air fryer vs an electric oven — preheat at full watts, cooking at the duty cycle — plus yearly INR and time savings.",
  steps: [
    "Enter each appliance's Rated power (watts), Preheat time (minutes), Cook time (minutes) and Element duty cycle while cooking (0-1) for both the air fryer and the conventional electric oven.",
    "Set your Electricity tariff (INR per kWh) and Meals cooked this way per week — the comparison recalculates as you type, with no submit button.",
    "Read the Saving per meal figure and the per-meal table of Energy used, Electricity cost and Total time (preheat + cook), then press Copy result for the text summary or Reset to restore defaults.",
  ],
  intro:
    "This calculator compares the electricity a meal costs in an air fryer against the same meal in a conventional electric oven, splitting each cook into a preheat phase at full rated power and a cooking phase at the thermostat's duty cycle. Energy equals rated watts divided by 1000, multiplied by preheat hours plus cook hours times the duty cycle. It exists because the headline wattage alone is misleading: a short preheat and a small cavity matter as much as the rating on the plate.",
  useCases: [
    "Deciding whether reheating a small tray in the air fryer beats firing up the oven for 12 minutes of preheat",
    "Estimating the yearly saving before buying an air fryer to replace most weekday oven cooking",
    "Checking how the answer flips when the dish is big enough to need two air-fryer batches",
  ],
  benefits: [
    ["Preheat counted properly", "The preheat runs at full rated wattage; only the cooking phase is duty-cycled."],
    ["Time as well as money", "Reports minutes saved per meal and hours saved per year, not just rupees."],
    ["Editable duty cycles", "Change the on-fraction to match a well-insulated oven or a leaky small cavity."],
  ],
  faqs: [
    [
      "Is an air fryer cheaper to run than an oven?",
      "For small portions, yes, typically by 50 to 65 percent per meal. A 1500 W air fryer with a 3-minute preheat and 18 minutes of cooking uses about 0.37 kWh, while a 2400 W oven preheating 12 minutes and cooking 25 uses about 0.88 kWh — roughly 4 INR a meal apart at 8 INR per kWh.",
    ],
    [
      "How many units of electricity does an air fryer use per hour?",
      "A 1500 W air fryer would use 1.5 kWh if the element ran flat out for an hour, but once up to temperature the thermostat cycles it on only about two-thirds of the time, so real consumption is nearer 1.0 kWh per hour of cooking. Most air-fryer cooks last well under half an hour anyway.",
    ],
    [
      "Why does an air fryer use less power than an oven for the same food?",
      "Two reasons: the cavity is a fraction of the volume, so preheating it takes about 3 minutes instead of 10 to 15, and the rated element is smaller — typically 1400 to 1800 W against 2000 to 3000 W. Less air and metal to heat means less energy wasted on everything that is not the food.",
    ],
    [
      "When is the oven actually the better choice?",
      "When the quantity exceeds one basket. An oven pays its preheat once and then cooks a full tray, so two or three air-fryer batches — each with its own preheat — can end up using more total energy as well as more of your time.",
    ],
  ],
};

export default seo;
