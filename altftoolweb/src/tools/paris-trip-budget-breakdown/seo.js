const seo = {
  title: "Paris Trip Cost: Per-Person Budget & Tourist Tax",
  metaDescription:
    "Split a Paris trip into flights, room, food, metro and activities, with taxe de séjour at the real rate plus 10% and 15% surtaxes, per person per day.",
  steps: [
    "Pick a Travel style — Budget, Comfort or Premium — to seed the rates, then set Season (moves the room rate), Adults (18 and over), Under-18s (tax exempt) and Nights in Paris.",
    "Set Accommodation category to fill the 'Municipal taxe de séjour per adult per night', from €1 for a hostel to €8 for a 5-star hotel, and overwrite any rate line: return fare, room, food, metro, activities or museum passes.",
    "The Line / Party / Per person / Share table splits the trip and the rows below give the taxe de séjour per adult per night, its 10% plus 15% surtax part and the cost of one extra night; Copy result takes the breakdown.",
  ],
  intro:
    "This planner breaks a Paris trip into flights or rail, accommodation, taxe de séjour, food, metro travel, activities and a contingency buffer, then reports the cost per person and per person per day. The tourist tax follows the French rule rather than a flat guess: it is charged per person per night by accommodation category, guests under 18 are exempt, and the municipal rate carries a 10% departmental additional tax plus the 15% Île-de-France regional tax that funds the Grand Paris transport works. Rooms are billed for nights while meals and travel are billed for the extra arrival day.",
  useCases: [
    "Comparing a three-night and a five-night Paris break when the flight cost is fixed and only the daily spend changes.",
    "Working out what a family of four actually pays in taxe de séjour once the two children are excluded.",
    "Splitting a per-head share for a group booking two or three twin rooms at different occupancy.",
  ],
  benefits: [
    ["Tourist tax done properly", "Applies the per-person-per-night rule, the under-18 exemption and both additional taxes instead of a flat percentage."],
    ["Nights versus days", "Charges the room for nights and the food, metro and activities for the extra arrival day."],
    ["Season on the room only", "The factor moves the hotel line, which is the part that actually reprices in high summer."],
  ],
  faqs: [
    [
      "How much does a 3-night trip to Paris cost?",
      "On the comfort defaults here — a 3-star room shared two-up, one sit-down meal a day, metro travel and a museum pass — two adults come to roughly €2,440 in total, about €1,220 each including return travel and a 10% buffer. A hostel-and-bakery version of the same three nights lands nearer €700 per person, and a 5-star version comfortably passes €2,500 per person.",
    ],
    [
      "What is the tourist tax in Paris and who pays it?",
      "The taxe de séjour is charged per person per night, on top of the room rate, at a municipal rate set by accommodation category — a hostel pays a fraction of what a 5-star hotel pays. Two additional taxes are then added to that rate: 10% departmental and, in Île-de-France, 15% regional, so the guest pays 1.25 times the municipal figure. Guests under 18 are exempt.",
    ],
    [
      "Do I need to tip in Paris restaurants?",
      "No. French prices are displayed TTC, meaning VAT and service are already inside the number on the menu, so the bill is what you read. Leaving small change for good service is common but entirely optional, and there is no expected percentage as there is in the United States.",
    ],
    [
      "When is Paris cheapest to visit?",
      "Mid-January to March and the first half of November, when hotel rates drop well below the spring and autumn shoulder and the queues are shortest. High summer, Christmas week and the big trade-fair weeks are the expensive end, and rooms are where the difference shows — flights and daily spending move far less than the nightly rate does.",
    ],
  ],
};

export default seo;
