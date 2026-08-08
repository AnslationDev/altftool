const seo = {
  title: "Fuel Cost Per Km Calculator: Petrol, Diesel, CNG, EV",
  metaDescription:
    "Divide fuel price by mileage for petrol, diesel, CNG or EV, add servicing, insurance and depreciation, and see the km a CNG kit takes to pay back.",
  steps: [
    "Pick the Fuel — Petrol, Diesel, CNG or Electric — then enter its price per litre, kilogram or kWh, your mileage and Kilometres driven a month.",
    "Under 'Standing costs a year' add servicing and tyres, insurance premium, parking and tolls, the vehicle's current value and Value lost a year (%).",
    "Read 'True cost of one kilometre' with the fuel share split out, then use 'Would switching fuel pay off?' for the kilometres and months to recover a CNG kit or EV premium.",
  ],
  intro:
    "Fuel cost per kilometre is the price of one unit of fuel divided by the distance that unit covers — rupees per litre divided by kilometres per litre for petrol and diesel, rupees per kilogram divided by kilometres per kilogram for CNG, and rupees per kWh divided by kilometres per kWh for an electric vehicle. This calculator adds the standing costs most people forget, spreading annual servicing, insurance, tolls and depreciation over the distance actually driven, so you see the true cost of a kilometre rather than just the pump cost. It also works out how many kilometres a CNG kit or an electric vehicle's price premium takes to pay back.",
  useCases: [
    "Setting a fair per-kilometre reimbursement rate for staff who use their own car for work",
    "Deciding whether a Rs 60,000 CNG kit pays for itself before you sell the car",
    "Comparing the running cost of a petrol hatchback against an electric one at your home electricity tariff",
  ],
  benefits: [
    ["Fuel and standing costs separately", "Shows what share of a kilometre is fuel and what share is everything else."],
    ["Every fuel type", "Handles litres, kilograms and kilowatt-hours with the right units on screen."],
    ["Payback in kilometres", "Turns a conversion cost into the distance and months needed to recover it."],
  ],
  faqs: [
    [
      "How do you calculate fuel cost per km?",
      "Divide the price of one litre by the mileage in kilometres per litre. Petrol at Rs 105 a litre in a car doing 18 km per litre costs Rs 5.83 of fuel per kilometre. For CNG use price per kilogram and km per kilogram, and for an electric vehicle use the tariff per kWh and km per kWh.",
    ],
    [
      "Why is my real cost per kilometre higher than the fuel cost?",
      "Because servicing, insurance, tyres, tolls and depreciation all have to be paid whether you drive or not, and they get spread over the kilometres you cover. A car doing 12,000 km a year with Rs 1.8 lakh of annual standing costs carries Rs 15 a kilometre before a drop of fuel is burnt, which is why low-mileage cars cost far more per kilometre than high-mileage ones.",
    ],
    [
      "How many kilometres does a CNG kit take to pay for itself?",
      "Divide the kit cost by the saving per kilometre. If CNG costs Rs 3.46 a kilometre against Rs 5.83 on petrol, the saving is Rs 2.37 a kilometre and a Rs 60,000 kit pays back in about 25,300 kilometres — roughly two years at 1,000 km a month. Factor in the lost boot space and the three-yearly cylinder hydro test before deciding.",
    ],
    [
      "Should depreciation be counted in cost per kilometre?",
      "Yes if you are comparing owning a vehicle against a cab or a lease, because the value the vehicle loses is a real cost even though no cash leaves your account. Set it to zero if you only want the out-of-pocket cash cost of driving a kilometre in a car you already own.",
    ],
  ],
};

export default seo;
