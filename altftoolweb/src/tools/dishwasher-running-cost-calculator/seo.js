const seo = {
  title: "Dishwasher vs Hand Washing Cost per Load Calculator",
  metaDescription:
    "Price a dishwasher cycle against hand washing: label kWh and litres vs tap flow x minutes, hot-water energy from real physics. Per load and per year.",
  steps: [
    "Pick a Programme (each listed with its kWh and litres) or override with your machine's label figures, and set 'Detergent per cycle (INR)'.",
    "Describe the hand wash with 'Tap flow rate (litres per minute)' and 'Minutes at the running tap', then set the electricity tariff, water price per 1000 litres and 'Loads washed per week'.",
    "Read 'Difference per load' with the winner and the yearly saving, then click 'Copy result'.",
  ],
  intro:
    "This calculator prices a single dishwasher cycle against washing the same load by hand, using the appliance's label energy and water figures on one side and tap flow rate times minutes on the other. Hand-wash heating is computed from physics rather than a rule of thumb: energy equals litres times temperature rise times water's specific heat of 4.186 kJ per kg per kelvin, divided by 3600 to reach kilowatt-hours. It is aimed at anyone deciding whether a dishwasher is worth its running cost.",
  useCases: [
    "Checking whether a new dishwasher's eco cycle really costs less per load than 15 minutes at a running hot tap",
    "Quantifying the litres of water a machine saves each year in a city with metered supply",
    "Seeing how much the answer changes once you put a value on the time spent washing up",
  ],
  benefits: [
    ["Physics, not guesswork", "Hand-wash heating uses the specific heat of water and your actual temperature rise."],
    ["Every cost line", "Electricity, metered water, detergent and optional labour are all priced separately."],
    ["Your own label figures", "Override the programme defaults with the kWh and litres printed on your machine."],
  ],
  faqs: [
    [
      "Is a dishwasher cheaper than washing by hand?",
      "Usually yes when the machine runs full, because a modern eco cycle uses roughly 9 to 11 litres while 15 minutes at an 8 litre-per-minute tap uses about 120 litres. Heating that extra water dominates the cost — the hand wash in this example needs about 1.76 kWh against the machine's 0.83 kWh.",
    ],
    [
      "How many units of electricity does a dishwasher use per cycle?",
      "A full-size 60 cm dishwasher on its eco programme typically uses 0.7 to 1.0 kWh per cycle, with intensive programmes reaching about 1.4 to 1.6 kWh. At 8 INR per kWh, an eco cycle costs roughly 6 to 8 INR in electricity before detergent.",
    ],
    [
      "How much water does a dishwasher use compared to hand washing?",
      "A modern eco cycle uses about 9 to 12 litres for a full load. Hand washing under a running tap uses whatever the flow rate multiplied by the time is — commonly 100 litres or more — though filling a basin instead can bring hand washing down to 20 to 30 litres and closes much of the gap.",
    ],
    [
      "Does the eco programme really cost less even though it runs longer?",
      "Yes. Eco cycles save energy by washing at a lower temperature and soaking for longer, and heating water is where nearly all dishwasher electricity goes, so the longer run time costs far less than the higher temperature it avoids. That is why the eco programme is the one manufacturers must declare on the energy label.",
    ],
  ],
};

export default seo;
