const seo = {
  title: "Travel Budget Planner: Daily Spend & Contingency",
  metaDescription:
    "Total a trip from per-person one-offs, per-room nights and daily spending, add a contingency buffer, and get a monthly saving target before departure.",
  steps: [
    "Pick a Currency (INR, USD, EUR, GBP, AED or SGD), then set Travellers, 'Nights away' and 'People per room' — rooms are costed as ceil(travellers ÷ occupancy).",
    "Fill in flights and visa per person, 'Room rate per night', food, local transport and activities per person per day, plus 'Contingency buffer (%)', 'Already saved' and 'Months until departure'.",
    "Read the 'Total trip cost' with per-person, per-day and 'Save each month' figures and the category share table, then press 'Copy budget' to copy the breakdown.",
  ],
  intro:
    "The Travel Budget Planner totals a trip by splitting it into three cost types: per-person one-offs (flights, visa, insurance), per-room per-night accommodation, and per-person per-day spending on food, local transport and activities. It counts a trip of N nights as N + 1 spending days, adds a contingency buffer you set, and converts the result into a monthly saving target. It is for anyone costing a holiday before booking, from a weekend away to a two-week family trip.",
  useCases: [
    "Costing a 5-day family trip for four people sharing two rooms before deciding on dates",
    "Working out how much to set aside each month for a trip that is six months away",
    "Comparing a budget and a mid-range version of the same holiday by changing only the nightly room rate and daily food spend",
  ],
  benefits: [
    ["Rooms, not just people", "Accommodation uses ceil(travellers ÷ occupancy) rooms, so a group of three in double rooms is costed as two rooms."],
    ["Contingency built in", "A percentage buffer is applied to the whole subtotal, so it scales with the trip instead of being a flat guess."],
    ["Monthly saving target", "The shortfall after existing savings is divided across the months left before departure."],
  ],
  faqs: [
    [
      "How much contingency should a travel budget include?",
      "This planner defaults to 10% of the subtotal, which covers ordinary surprises like a taxi surge, a paid bag or a pricier meal. Raise it towards 15-20% for long-haul, multi-country or monsoon-season trips where flight and weather disruption is likelier.",
    ],
    [
      "Is a 4-night trip counted as 4 days or 5 days?",
      "Five spending days. Accommodation is billed per night (4 nights), but you eat and move around on both the arrival and departure days, so daily costs are multiplied by nights + 1. That single rule prevents the classic under-estimate of one full day of food and transport.",
    ],
    [
      "How do I budget for a group sharing rooms?",
      "Enter the total number of travellers and the people per room; the planner books ceil(travellers ÷ occupancy) rooms. Six travellers at two per room costs three rooms per night, while five travellers at two per room still needs three rooms because the odd person cannot share half a bed.",
    ],
    [
      "Does this planner convert currencies?",
      "No — it works in one currency you pick (INR, USD, EUR, GBP, AED or SGD) and every figure you enter must be in that same currency. Exchange rates move daily, so building them in would give you a number that is wrong by the time you travel.",
    ],
  ],
};

export default seo;
