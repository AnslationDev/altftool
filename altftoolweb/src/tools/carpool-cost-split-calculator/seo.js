const seo = {
  title: "Carpool Cost Split Calculator: Fuel, Tolls, Per Rider",
  metaDescription:
    "Splits running cost by person-kilometres and tolls and parking equally, then shows each rider's per-trip and monthly share.",
  steps: [
    "Under \"The trip\", enter One-way route distance (km), Trips per month, Fuel price (INR per litre), Fuel efficiency (km per litre), Wear allowance (INR per km) and the tolls and parking per trip.",
    "In \"Who rides, and how far\" press Add rider for each person, set \"Kilometres in the car, one way\", mark one of them \"This is the driver\", and untick \"The driver also pays a share\" if the driver rides free.",
    "Read \"Cost of one trip\" with the Running cost per km, Total person-kilometres per trip and \"Driver saves versus driving alone\" rows, then the Rider / Km each way / Per trip / Per month / Share table under \"What each person owes\", and press Copy result.",
  ],
  intro:
    "This carpool cost split calculator divides a shared commute into the two kinds of cost that behave differently: running cost, which is fuel price divided by fuel efficiency plus a per-kilometre wear allowance, and fixed cost per trip such as tolls and parking. Running cost is shared by person-kilometres so a rider who joins halfway pays for half the distance, while tolls and parking are split equally. It reports each person's share per trip and per month, and how much the car owner saves against driving alone.",
  useCases: [
    "Settling a monthly office carpool where three colleagues board at different points on the route",
    "Deciding a fair per-trip figure before a school run rota starts, so nobody negotiates every week",
    "Showing a reluctant car owner what the carpool actually saves them versus commuting alone",
  ],
  benefits: [
    ["Distance-fair, not headcount-fair", "Person-kilometre weighting stops short-hop riders from subsidising long-hop ones."],
    ["Wear is counted, not just fuel", "A per-km allowance covers tyres, servicing and depreciation that fuel price alone ignores."],
    ["Driver-waiver option", "One toggle reassigns the driver's share to the passengers when that is the arrangement."],
  ],
  faqs: [
    [
      "How should carpool costs be split fairly?",
      "Split distance-related costs — fuel and vehicle wear — in proportion to the kilometres each person is actually in the car, and split tolls and parking equally between everyone aboard. Splitting the whole bill by headcount overcharges anyone who joins partway along the route.",
    ],
    [
      "How do I calculate the fuel cost of a carpool trip?",
      "Divide the fuel price per litre by the vehicle's kilometres per litre to get cost per kilometre, then multiply by the distance travelled. At ₹105 a litre and 15 km/l that is ₹7 per kilometre, so a 40 km round trip burns about 2.67 litres and ₹280 of fuel.",
    ],
    [
      "Should the driver pay a share of the carpool cost?",
      "Both arrangements are common. If the driver pays a share, everyone including the driver contributes by distance. If the driver rides free, their share is reassigned to the passengers as compensation for owning the vehicle and doing the driving — worth roughly one extra passenger's contribution.",
    ],
    [
      "What should I use for the wear-and-tear allowance?",
      "Take a year of service bills, tyres, brake pads and any battery or clutch replacement, then divide by the kilometres you drove that year. For an ordinary hatchback or sedan the figure usually lands between ₹1.5 and ₹3 per kilometre, which is why fuel-only splits understate the true cost of a commute.",
    ],
  ],
};

export default seo;
