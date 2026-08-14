const seo = {
  title: "Habit Cost Calculator: 1, 5, 10 and 50-Year Totals",
  metaDescription:
    "Normalises any habit to a monthly cost, projects 1, 5, 10 and 50-year totals compounded at your chosen rate, and converts daily time into hours.",
  intro:
    "This calculator converts everyday habits — coffee, food delivery, cigarettes, subscriptions, commuting — into what they cost you in rupees and hours over 1, 5, 10 and 50 years. It normalises whatever frequency you enter to a monthly figure (daily spend × 30, weekly × 4, yearly ÷ 12), then compounds the annual outlay at a rate you set with a slider, defaulting to 12% a year, to show what the same money might have grown to instead. Alongside the money it converts your daily time spent into hours, days and a share of a 16-hour waking day.",
  useCases: [
    "You buy a ₹250 coffee most days and want the honest ten-year number before deciding whether to cut it to twice a week",
    "You are auditing streaming, gym and app subscriptions together and need one combined monthly and yearly total instead of separate bills",
    "You spend two hours a day scrolling and want that converted into hours per year to compare against the time a course or a skill would take",
  ],
  benefits: [
    [
      "Money and time in one model",
      "Every habit carries both a cost and a daily hours figure, so the yearly rupee total and the hours-lost total come from the same entry.",
    ],
    [
      "Opportunity cost, not just spend",
      "Compounds the yearly outlay at your chosen return rate so you see the gap between money spent and money grown.",
    ],
    [
      "A single habit impact score",
      "Scores the first habit in your list up to a maximum of 72 points from health, stress, productivity and relationship impact plus its cost and time load, giving you an at-a-glance severity read rather than a side-by-side ranking.",
    ],
  ],
  faqs: [
    [
      "How is the yearly cost of a habit worked out?",
      "Every habit is converted to a monthly cost first — daily spend is multiplied by 30, weekly by 4, and a yearly figure is divided by 12 — and the yearly total is that monthly figure times 12. A ₹200 daily habit therefore lands at ₹6,000 a month and ₹72,000 a year.",
    ],
    [
      "What return rate does the projection use?",
      "12% a year by default, compounded annually on each year's contribution, and you can move the slider to whatever rate you think is realistic. The rate is an assumption for comparison only — it is not a forecast, and it is not investment advice.",
    ],
    [
      "How is the habit impact score calculated?",
      "It has a maximum of 72 points. Health, stress, productivity and relationship impacts are each scored low/medium/high as 8, 16 or 24 and averaged (up to 24 points), then a cost component worth up to 24 points and a time component worth up to 24 points are added on top.",
    ],
    [
      "Where is my habit data stored?",
      "Your tracked habits, costs and calculations stay in your browser's local storage on this device only, under a single key, so the list survives a page reload but that data is never uploaded to a server. The exception is the AI-generated suggestions in Time Lost Calculator, Break This Habit and Future Loss Visualization — when those sections load, your habit names and computed totals are sent to Puter's third-party AI API to generate the suggestion text shown there. Clearing site data or opening the page in a different browser starts you with an empty list.",
    ],
  ],
  steps: [
    "In Add New Habit, pick a Category icon, type the habit into Habit Name (placeholder \"e.g., Morning coffee, Netflix subscription\", capped at 50 characters), then enter Cost (₹) and choose a Frequency of Daily, Weekly, Monthly or Yearly. Show Impact Assessment opens the optional Time per day (hrs) and Years active fields plus Low/Medium/High selects for Health, Stress, Productivity and Relationship Impact.",
    "Click Add Habit. The button reads Adding Habit... and then Habit added successfully!, the entry appears under Your Habits with its Monthly, Yearly and 5 Years cost, and the three cards at the top update Monthly Spending, Yearly Spending and 5-Year Spending.",
    "Read the projection in Future Loss Visualization: switch between 1 Year, 5 Years, 10 Years and Lifetime, drag the Interest Rate slider (1 to 30%, 12% by default) and compare 💸 Wasted against 📈 Invested Value, with ⏱️ Time Lost in Hours, Days and Months once a time per day is entered. The trash icon on any row deletes that habit.",
  ],
};

export default seo;
