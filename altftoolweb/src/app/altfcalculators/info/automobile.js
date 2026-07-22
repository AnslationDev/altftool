const info = {
  "mileage-calculator": {
    intro: [
      "The Mileage Calculator works out how far your vehicle travels per unit of fuel — its fuel economy. Enter the distance covered and the fuel consumed, and it returns the efficiency in your chosen units along with the common alternatives so you can compare figures from any source.",
      "It supports both metric (kilometres and litres) and US customary (miles and gallons) inputs, and always shows km/L, miles per gallon (mpg) and litres per 100 km side by side. This is the quickest way to check a tank-to-tank reading or verify a manufacturer's claimed economy.",
    ],
    formula: {
      expression: "Economy = Distance ÷ Fuel used",
      where: [
        ["Distance", "distance travelled (km or miles)"],
        ["Fuel used", "fuel consumed over that distance (litres or gallons)"],
        ["km/L ↔ mpg", "1 US mpg = 0.425144 km/L (1.609344 km per mile ÷ 3.785412 L per US gallon)"],
        ["L/100km", "= 100 ÷ (km/L)"],
      ],
      note: "US gallons are used for mpg. One Imperial (UK) gallon is larger (4.546 L), so UK mpg figures are about 20% higher for the same real economy.",
    },
    howToUse: [
      "Pick your units: km & litres, or miles & gallons.",
      "Enter the distance travelled on the tank or trip.",
      "Enter the amount of fuel used to cover that distance.",
      "Read the economy plus the equivalent figure and L/100km consumption.",
    ],
    goodToKnow: [
      "For the most accurate tank-to-tank reading, brim the tank, note the odometer, drive, then refill to the same level and record the litres/gallons added.",
      "A higher km/L or mpg means better economy; a lower L/100km means better economy — they move in opposite directions.",
      "Economy varies with speed, load, tyre pressure, air-conditioning use and driving style, so a single reading is only a snapshot.",
    ],
    faqs: [
      {
        q: "What is the difference between km/L, mpg and L/100km?",
        a: "km/L and mpg measure distance per unit of fuel (higher is better). L/100km measures fuel per fixed distance (lower is better). All three describe the same efficiency, just expressed differently.",
      },
      {
        q: "Why does the mpg here differ from my UK figure?",
        a: "This calculator uses the US gallon (3.785 L). The UK Imperial gallon is 4.546 L, so an Imperial mpg figure is roughly 1.2 times the US mpg for the same actual fuel economy.",
      },
      {
        q: "How do I convert km/L to mpg?",
        a: "Divide km/L by 0.425144 (or multiply by about 2.352) to get US mpg. To go the other way, multiply mpg by 0.425144 to get km/L.",
      },
      {
        q: "How many kilometres should I drive before measuring?",
        a: "Use a full tank or at least 200–300 km for a reliable figure. Short trips and cold starts distort economy, so a full tank averaged over mixed driving is best.",
      },
    ],
  },

  "gas-mileage-calculator": {
    intro: [
      "The Gas Mileage Calculator computes miles per gallon (mpg) from a trip's distance and the fuel it consumed. It also converts the result to km/L and litres per 100 km, and — if you enter a fuel price — estimates the total fuel cost of the trip and the cost per mile.",
      "It is built around US units (miles and US gallons), making it ideal for tracking real-world fuel economy between fill-ups and for budgeting the fuel portion of a road trip.",
    ],
    formula: {
      expression: "mpg = Miles ÷ Gallons   •   Trip cost = Gallons × Price per gallon",
      where: [
        ["Miles", "trip distance driven"],
        ["Gallons", "US gallons of fuel used"],
        ["km/L", "= mpg × 0.425144"],
        ["L/100km", "= 235.215 ÷ mpg"],
        ["Price per gallon", "fuel price used for the cost estimate"],
      ],
      note: "Uses the US gallon (3.785412 L). L/100km and km/L are exact conversions of the mpg figure, not separate measurements.",
    },
    howToUse: [
      "Enter the trip distance in miles.",
      "Enter the fuel used in US gallons (e.g. the amount added at the pump to refill).",
      "Optionally enter the price per gallon to see the trip's fuel cost.",
      "Read your mpg, the metric equivalents and, if priced, the trip cost and cost per mile.",
    ],
    goodToKnow: [
      "Best practice is the fill-to-fill method: fill up, reset the trip meter, drive, then divide the miles driven by the gallons needed to fill up again.",
      "City driving typically returns lower mpg than highway driving because of stop-start traffic and idling.",
      "A well-inflated set of tyres, steady speeds and removing roof racks or extra weight all raise real-world mpg.",
      "Cost per mile scales with fuel price: at the same mpg, a 10% rise in fuel price raises the per-mile cost by 10%.",
    ],
    faqs: [
      {
        q: "How do I calculate mpg?",
        a: "Divide the miles you drove by the number of gallons used to refill the tank. For example, 300 miles on 12 gallons is 300 ÷ 12 = 25 mpg.",
      },
      {
        q: "Does this use US or Imperial gallons?",
        a: "US gallons (3.785 litres). If you filled up in the UK or another country using Imperial gallons (4.546 L), your Imperial mpg will read higher for the same real economy.",
      },
      {
        q: "How is the trip cost worked out?",
        a: "Trip cost = gallons used × price per gallon. Cost per mile is that total divided by the miles driven, which is handy for comparing routes or vehicles.",
      },
      {
        q: "What is a good mpg?",
        a: "It depends on the vehicle class. Small hatchbacks and hybrids often exceed 40 mpg, mid-size cars sit around 25–35 mpg, and large trucks or SUVs may be 15–20 mpg. Compare against your own past readings for a fair benchmark.",
      },
    ],
  },

  "fuel-cost-calculator": {
    intro: [
      "The Fuel Cost Calculator estimates how much fuel a journey will need and what it will cost. Enter the trip distance, your vehicle's mileage (km per litre) and the current fuel price, and it returns the litres required, the total cost and the cost per kilometre.",
      "It is useful for budgeting road trips, splitting fuel costs among passengers, or comparing the running cost of different routes and vehicles.",
    ],
    formula: {
      expression: "Fuel needed = Distance ÷ Mileage   •   Cost = Fuel needed × Price per litre",
      where: [
        ["Distance", "trip distance (km)"],
        ["Mileage", "fuel economy of the vehicle (km/L)"],
        ["Price per litre", "current pump price of fuel"],
        ["Cost per km", "= Total cost ÷ Distance"],
      ],
    },
    howToUse: [
      "Enter the trip distance in kilometres.",
      "Enter your vehicle's mileage in km/L.",
      "Enter the current fuel price per litre.",
      "Read the litres needed, the total fuel cost and the cost per kilometre.",
    ],
    goodToKnow: [
      "Use your real-world mileage rather than the brochure figure — actual economy is usually lower, especially in city traffic.",
      "For a return trip, double the one-way distance before calculating.",
      "Cost per km makes it easy to compare vehicles or to charge a fair rate when sharing rides.",
    ],
    faqs: [
      {
        q: "How much fuel will my trip use?",
        a: "Divide the distance by your mileage. A 300 km trip in a car that does 18 km/L needs 300 ÷ 18 ≈ 16.7 litres.",
      },
      {
        q: "How do I estimate the fuel cost?",
        a: "Multiply the litres needed by the price per litre. Using the example above, 16.7 L at ₹100/L is about ₹1,670 for the trip.",
      },
      {
        q: "Should I use city or highway mileage?",
        a: "Use the figure that matches your trip. Highway mileage is higher, city mileage is lower; for mixed driving, use your averaged real-world economy for the most realistic estimate.",
      },
      {
        q: "Does the calculator account for traffic or terrain?",
        a: "No — it uses a single mileage figure. Hilly routes, heavy traffic, air-conditioning and a loaded vehicle all reduce economy, so treat the result as a baseline estimate.",
      },
    ],
  },
};

export default info;
