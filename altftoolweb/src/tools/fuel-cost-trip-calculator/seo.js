const seo = {
  title: "Trip Fuel Cost Calculator: Split Per Person",
  metaDescription:
    "Distance, mileage and pump price give litres burned, total cost with tolls and each person's share. Works in km or miles, km/l, l/100 km or mpg.",
  steps: [
    "Enter the Trip distance in Kilometres or Miles, your Fuel efficiency in km/l, l/100 km or miles per US or UK gallon, and the Fuel price; tick Round trip to double the distance.",
    "Add Tolls, parking (Rs) and set People sharing (1 to 100) so extras are included before the per-person split.",
    "Read the Total trip cost with Fuel needed in litres, cost per km and 'Each person pays', then press Copy result for the full breakdown.",
  ],
  "intro": "Fuel Cost Trip Calculator estimates what a drive will cost in petrol or diesel. Give it the distance, your vehicle's mileage and the pump price and it works out the litres burned, the total spend including tolls, the cost per kilometre and each passenger's share. Distance can be in kilometres or miles, and mileage can be entered as km/l, l/100 km or miles per US or UK gallon.",
  "useCases": [
    "Budget a road trip before you leave and see whether it beats the train fare.",
    "Split fuel fairly among carpool colleagues on a shared weekly commute.",
    "Compare two cars — say 18 km/l against 12 km/l — over the same route to see the yearly difference."
  ],
  "benefits": [
    [
      "Mixed units handled",
      "km or miles, km/l or l/100 km or mpg, price per litre or per gallon — all converted for you."
    ],
    [
      "Round trip in one tap",
      "A single toggle doubles the distance so you are not budgeting for the outbound leg alone."
    ],
    [
      "Fair per-person split",
      "Tolls and parking are added before the split, so everyone's share reflects the real cost."
    ]
  ],
  "faqs": [
    [
      "How do I calculate fuel cost for a trip?",
      "Divide the distance by your mileage to get the litres needed, then multiply by the price per litre. A 450 km trip at 18 km/l needs 25 litres, which at ₹102 a litre costs ₹2,550."
    ],
    [
      "What mileage figure should I use?",
      "Use your own recent tank-to-tank average rather than the manufacturer's claim, which is measured under test conditions. Real-world highway mileage is usually better than city mileage."
    ],
    [
      "How do I convert mpg to km/l?",
      "Multiply US mpg by 0.4251 to get km/l (a UK gallon is larger, so UK mpg is multiplied by 0.3540). The tool does this conversion automatically and shows your mileage in all three units."
    ],
    [
      "Does this include wear, tyres or servicing?",
      "No — it covers fuel plus any tolls or parking you enter. The full cost of running a car per kilometre is higher once depreciation, insurance and maintenance are counted."
    ]
  ]
};

export default seo;
