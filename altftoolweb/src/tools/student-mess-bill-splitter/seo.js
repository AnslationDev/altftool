const seo = {
  title: "Mess Bill Splitter — Fixed Costs Equal, Food by Days",
  metaDescription:
    "Split a hostel mess bill fairly: cook, gas and wifi equally; food by days present at a per-day rate. Shares reconcile to the exact bill.",
  steps: [
    "Enter the 'Total bill for the period (INR)' and the 'Fixed charges within the bill (INR)' — cook's salary, gas, wifi; enter 0 to split everything by days.",
    "List each roommate with their 'Days present' (0–366), using 'Add roommate' and Remove to match your flat.",
    "Read the 'Per-day food rate' and each member's Fixed share, Food share and Pays columns — shares total the exact bill — then click 'Copy result'.",
  ],
  intro:
    "This splitter divides a shared mess or grocery bill the way hostel messes do: fixed charges like the cook's salary, gas and wifi are split equally among all roommates, while the food (variable) portion is divided in proportion to each person's days present. Each share is computed as fixed ÷ members plus per-day rate × days, rounded to the paisa with the remainder settled on the last member so the shares always add up to the exact bill.",
  useCases: [
    "Three flatmates settling a Rs 9,000 monthly kitchen bill where one of them was home only 15 days",
    "A hostel-style shared mess computing its per-day food rate to give absence rebates fairly",
    "A roommate who travelled all month checking that they still owe their equal share of the cook's salary and gas",
  ],
  benefits: [
    ["Fair to absentees", "Days-present weighting means nobody pays for food they were not there to eat."],
    ["Fixed costs stay equal", "Cook, gas and wifi are shared equally because they run whether or not anyone is home."],
    ["Adds up to the paisa", "Rounding is reconciled on the last member so shares always sum exactly to the bill."],
  ],
  faqs: [
    [
      "How do you split a mess bill fairly when someone was away?",
      "Split the bill in two parts: fixed costs (cook's salary, gas, wifi) equally among everyone, and the food cost by days present. Compute a per-day rate — food cost divided by total member-days — and charge each person that rate times their days, which is exactly the rebate logic hostel messes use.",
    ],
    [
      "Should a roommate who was absent the whole month pay anything?",
      "Yes, their equal share of the fixed charges — the cook's salary, gas cylinder and wifi cost the same whether they were home or not. With 0 days present they pay nothing toward groceries, so in a bill with Rs 1,500 fixed among three people, a fully absent roommate owes Rs 500.",
    ],
    [
      "What counts as a fixed charge in a shared kitchen?",
      "Anything that does not change with attendance: the cook or maid's salary, gas cylinder refills, water cans if billed flat, wifi, and utensil or appliance rent. Groceries, vegetables, milk and eggs are variable and should be split by days present.",
    ],
    [
      "How is the per-day mess rate calculated?",
      "Per-day rate = variable food cost ÷ total member-days, where member-days is the sum of every roommate's days present. If a Rs 7,500 food bill covers 75 member-days, the rate is Rs 100 per day, and someone present 15 days owes Rs 1,500 of food plus their equal share of fixed charges.",
    ],
  ],
};

export default seo;
