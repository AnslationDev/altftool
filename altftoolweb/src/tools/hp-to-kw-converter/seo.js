const seo = {
  intro:
    "This converter moves a power figure between mechanical horsepower, metric PS, kilowatts, watts, BTU/h and related units using their exact definitions rather than rounded factors: mechanical horsepower is 550 ft·lbf/s = 745.6998716 W, metric horsepower is 75 kgf·m/s = 735.49875 W, and electrical horsepower is defined as exactly 746 W. It also separates crankshaft power from wheel power using a drivetrain-loss allowance, and reports power-to-weight in hp, kW and PS per tonne. Built for anyone comparing a German PS figure against a US horsepower figure, or a dyno printout against a manufacturer's claim.",
  useCases: [
    "Comparing a car advertised at 150 kW in Europe with one advertised at 201 hp in the US",
    "Translating a chassis-dyno wheel-horsepower result back to the crank figure a manufacturer quotes",
    "Working out power-to-weight in hp per tonne to compare two cars of different mass",
  ],
  benefits: [
    [
      "Exact definitions",
      "Uses 745.6998716 W and 735.49875 W rather than the rounded 746 and 735 that drift by a horsepower or more on big engines.",
    ],
    [
      "PS and hp kept apart",
      "Metric PS reads about 1.4% higher than mechanical hp for the same engine, which is why the same car is quoted differently in different markets.",
    ],
    [
      "Crank versus wheel",
      "Applies a drivetrain loss so a dyno figure and a brochure figure can be compared like for like.",
    ],
  ],
  faqs: [
    [
      "How many kW is 200 hp?",
      "149.14 kW. One mechanical horsepower is exactly 745.6998716 watts, so 200 hp × 745.6998716 = 149,140 W. Going the other way, 100 kW is 134.10 hp.",
    ],
    [
      "What is the difference between hp, bhp and PS?",
      "PS is a genuinely different unit — metric horsepower, 75 kgf·m/s or 735.49875 W — so 200 hp equals 202.77 PS, about 1.4% higher. Bhp is not a different unit at all: it is mechanical horsepower measured at the crankshaft on a brake dynamometer, as opposed to wheel horsepower measured at the tyres.",
    ],
    [
      "How much power is lost in the drivetrain?",
      "Roughly 10-15% for front- and rear-wheel drive and 20-25% for all-wheel drive, with automatics at the higher end of each range. A 300 hp crank figure through a rear-drive manual therefore reads around 255 hp at the wheels. These are rules of thumb, not measured constants — actual loss varies with gearing, tyres, temperature and the dyno itself.",
    ],
    [
      "Is 1 hp exactly 746 watts?",
      "Only electrical horsepower is, by definition, and that unit is used on US electric motor nameplates. Mechanical horsepower — the one used for engines — is 550 ft·lbf/s, which works out to 745.6998716 W. The difference is about 0.04%, negligible on a small motor but worth a fraction of a horsepower on a 500 hp engine.",
    ],
  ],
};

export default seo;
