const seo = {
  title: "City + Highway Mileage: Combined km/l Calculator",
  metaDescription:
    "Blends city and highway km/l with the fuel-weighted harmonic mean — the simple average overstates economy — and prices your monthly litres in rupees.",
  steps: [
    "Enter 'City mileage (km per litre)', 'Highway mileage (km per litre)' and the 'Share of distance driven in the city (%)' — or tap a preset chip like 'EPA 55/45' or 'Mostly highway'.",
    "Add 'Distance per month (km)' and 'Fuel price (per litre)' to turn the blend into litres and rupees.",
    "Read the combined km/l headline, the 'Simple average (wrong method)' row showing how much it overstates economy, and the monthly fuel and cost rows, then press 'Copy result'.",
  ],
  intro:
    "This estimator blends a vehicle's city and highway km/l into one combined figure using the fuel-weighted harmonic formula: combined km/l = 1 ÷ (city share ÷ city km/l + highway share ÷ highway km/l). That is the only correct way to mix the two, because the thirsty city kilometres consume a bigger share of the fuel than of the distance — averaging the two mileage numbers directly always flatters the result. It also converts the blend into litres and rupees for your monthly running distance.",
  useCases: [
    "Estimating true running cost when your week is 60% city traffic and 40% weekend highway",
    "Checking a car's real combined figure against the number a brochure or label quotes",
    "Seeing how much of your monthly fuel bill the city portion of your driving is responsible for",
  ],
  benefits: [
    ["Correct blending maths", "Uses the harmonic fuel-weighted mean, not the misleading simple average."],
    ["Shows the error", "Displays how much a plain average would have overstated your economy."],
    ["Rupee view", "Converts the blended figure into monthly and yearly fuel spend at your pump price."],
  ],
  faqs: [
    [
      "How do I calculate combined city and highway mileage?",
      "Use combined km/l = 1 ÷ (city share ÷ city km/l + highway share ÷ highway km/l). At 11 km/l in the city and 18 km/l on the highway with 60% city driving, that is 1 ÷ (0.6/11 + 0.4/18) = 13.03 km/l — not the 13.8 km/l a simple average suggests.",
    ],
    [
      "Why can't I just average the two mileage figures?",
      "Because mileage is distance per litre, not litres per distance. Over 100 km with a 60/40 split, city driving eats 5.45 litres and highway 2.22 litres, so city driving accounts for 71% of the fuel while being only 60% of the distance. A straight average ignores that and typically overstates economy by 4-8%.",
    ],
    [
      "What is the standard city/highway weighting used on labels?",
      "The US EPA combined label figure weights city and highway 55% to 45% by distance, computed on the same fuel-weighted basis. India's certified figure comes from the Modified Indian Driving Cycle, which has an urban and an extra-urban phase rather than two separate published numbers.",
    ],
    [
      "Why is city mileage so much worse than highway mileage?",
      "Stop-start traffic means constant acceleration from rest, long idling periods that burn fuel while covering zero distance, and low gears where the engine runs off its efficient load point. Air conditioning also draws a larger share of a small engine's output at crawl speeds.",
    ],
  ],
};

export default seo;
