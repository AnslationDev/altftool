const seo = {
  title: "Subscription Cost Tracker — Monthly Totals",
  h1: "Subscription Cost Tracker",
  metaDescription:
    "Free subscription cost tracker: converts weekly, monthly, quarterly and yearly plans into one ₹ monthly and yearly total, with CSV export.",
  intro:
    "The Subscription Cost Tracker puts every plan on a common monthly scale before it adds anything up: weekly amounts are multiplied by 52/12, quarterly by 1/3 and yearly by 1/12, and the yearly figure is that normalized monthly sum × 12. Plans you mark as paused drop out of the totals and are reported separately as paused monthly savings, while active plans are grouped by category and drawn as a Recharts bar chart and donut. All amounts are formatted with Intl.NumberFormat(\"en-IN\") in Indian rupees, rounded to whole rupees. Everything runs in React state in your own browser — there is no account, no server call and no stored data.",
  useCases: [
    "List every streaming, cloud, software and gym plan you pay for and see what the mix really costs per month once annual and quarterly billing is spread out.",
    "Set a monthly cap on the budget slider, then pause plans one at a time to see how much each one is holding back from the total.",
    "Export the full table as CSV — name, amount, cycle, category, status, renewal date, monthly cost, yearly cost — for a spreadsheet or a shared team budget.",
  ],
  benefits: [
    [
      "Every billing cycle on one scale",
      "Weekly × 52/12, monthly × 1, quarterly × 1/3 and yearly × 1/12, so a ₹3,999 annual plan and a ₹649 monthly one can be compared directly.",
    ],
    [
      "Pausing shows its value",
      "A plan toggled to Paused leaves the monthly and yearly totals and its monthly-equivalent amount moves to the Paused Savings card instead.",
    ],
    [
      "Renewal countdown on every row",
      "Each subscription shows days left, \"Renews today\", or how many days overdue, counted in whole days from local midnight to the renewal date.",
    ],
    [
      "Take the numbers with you",
      "One click exports an eight-column CSV; another copies an eight-line text summary of counts, totals, priciest plan and next renewal to the clipboard.",
    ],
  ],
  faqs: [
    [
      "How do I calculate my total monthly subscription cost?",
      "Convert every plan to a monthly figure first, then add them up. This tracker uses fixed factors — weekly × 52/12 (4.33), quarterly ÷ 3, yearly ÷ 12 — so a ₹3,999 yearly plan counts as roughly ₹333 a month. The yearly total is that monthly sum × 12, which makes it an annualized run rate rather than a calendar-year invoice total.",
    ],
    [
      "Does the subscription tracker save my list?",
      "No. Subscriptions live in the page's React state in the open tab only — no account, no localStorage, no server call — so a refresh brings back the five starter plans it ships with. Use Export CSV before you close the tab if you want to keep your list.",
    ],
    [
      "Can I track subscriptions in dollars or euros?",
      "Not with the currency symbol changed. Every amount is formatted in INR with Intl.NumberFormat(\"en-IN\") and rounded to whole rupees, so ₹ is fixed. The arithmetic itself is currency-agnostic, so you can enter amounts in whatever currency you pay in and read the totals in that currency, ignoring the symbol.",
    ],
    [
      "What happens to paused subscriptions in the totals?",
      "They are excluded from both the monthly and yearly active cost. Their monthly-equivalent amounts are summed into the Paused Savings card alongside a count of paused plans, and the Highest Cost and Next Renewal cards look only at active plans. Toggle a plan back to Active and it re-enters the totals immediately.",
    ],
    [
      "How does the monthly budget bar work?",
      "It is active monthly cost ÷ your monthly budget × 100, shown to one decimal place. The slider runs from 0 to ₹100,000 in ₹500 steps, or you can type an exact figure. When active plans exceed the cap, the headline figure and the bar turn red and an over-budget notice appears below the table.",
    ],
    [
      "What is included in the CSV export?",
      "Eight columns — Name, Amount, Cycle, Category, Status, Renewal Date, Monthly Cost and Yearly Cost — with the two cost columns rounded to whole numbers and every field quoted. Paused plans are included too. The file is built as a Blob in the browser and downloaded as subscription-cost-tracker.csv.",
    ],
    [
      "How are the days-until-renewal numbers counted?",
      "As whole days from today's local midnight to the renewal date, rounded up. Past dates show as \"Xd overdue\", the current date shows \"Renews today\", and the soonest-renewing active plan with a date set fills the Next Renewal card. The dates are labels only — nothing rolls forward automatically and no reminders are sent.",
    ],
    [
      "Is this subscription cost tracker free?",
      "Yes, and there is no signup. The whole tool is one client-side React component: the cycle conversion, category grouping, charts, clipboard summary and CSV export all run on your own device, with no upload, no paywall and no account step.",
    ],
  ],
  steps: [
    "Edit the five starter rows or type a name and click Add Plan, then set each subscription's amount, billing cycle (weekly, monthly, quarterly or yearly), category and renewal date.",
    "Enter your monthly cap in Budget Controls and use the Active/Paused toggle on plans you are considering dropping — totals, category charts and the budget bar recalculate as you type.",
    "Click Export CSV for the full eight-column table, or Copy Summary for a text recap of active and paused counts, monthly and yearly cost, paused savings, priciest plan and next renewal.",
  ],
};

export default seo;
