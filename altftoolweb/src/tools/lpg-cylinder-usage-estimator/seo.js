const seo = {
  title: "LPG Cylinder Usage Estimator: Days per Refill",
  metaDescription:
    "Enter each burner's kW rating and daily minutes to get days per 14.2 kg cylinder, cost per day and the date to book the next refill.",
  steps: [
    "For each burner, enter the Rating (kW) from your stove manual, How many you have, and Minutes a day (each) it runs.",
    "Pick your Cylinder size, the Refill price you pay, the Stove thermal efficiency (%) and, optionally, the date this cylinder was connected.",
    "Read how many days a cylinder lasts, gas burned per day in kg, the run-out date and the Book the refill by date, then click Copy result.",
  ],
  intro:
    "How long an LPG cylinder lasts is set by physics, not by household size: a burner's kilowatt rating is its heat input, so gas burned per hour equals that rating divided by the fuel's calorific value of about 46.1 MJ per kg. This estimator takes the minutes each burner runs in a typical day, converts that to kilograms of gas, and divides a 14.2 kg domestic cylinder by it to give days per refill, cost per day and the date to book the next one.",
  useCases: [
    "Predicting when a cylinder will run out so the refill is booked before the kitchen stops",
    "Comparing gas cost per day against an induction hob or piped gas connection",
    "Checking whether a cylinder that emptied unusually fast points to a leak or a heavy-use month",
  ],
  benefits: [
    ["Built on burner ratings", "Uses the kW figure from your stove manual instead of guessing by family size."],
    ["Gives you a refill date", "Enter the connection date and get both the run-out day and a booking reminder."],
    ["Shows wasted heat", "Splits the daily energy into what reaches the pan and what escapes around it."],
  ],
  faqs: [
    [
      "How many days does a 14.2 kg LPG cylinder last?",
      "For a household burning roughly 280 g of gas a day — about an hour on a medium burner plus half an hour on a large one — a 14.2 kg cylinder lasts around 50 days. Heavy cooking can halve that and a single-person household can stretch it past three months, so burner minutes are the number that matters.",
    ],
    [
      "How much gas does one burner use per hour?",
      "Divide the burner's kW rating by the calorific value of LPG. A 3 kW large burner uses about 234 grams an hour, a 1.75 kW medium burner about 137 grams, and a 1 kW simmer burner about 78 grams. Those figures assume the burner is on full; a flame turned down uses proportionally less.",
    ],
    [
      "How much energy is in a kilogram of LPG?",
      "About 46.1 MJ, which is roughly 12.8 kWh, on a net calorific value basis. A full 14.2 kg domestic cylinder therefore holds around 654 MJ, or 182 kWh, of heat input before stove efficiency is taken into account.",
    ],
    [
      "Does a more efficient gas stove make the cylinder last longer?",
      "Only if you cook for less time. Efficiency describes how much of the burner's heat reaches the pan, so a better stove boils the same pot faster and you turn it off sooner. The cylinder empties at a rate set purely by burner rating and burner minutes — IS 4246 requires at least 68% efficiency from a domestic stove.",
    ],
  ],
};

export default seo;
