const seo = {
  title: "Street Food Budget Planner: Trips & Splurge Meals",
  metaDescription:
    "Build a trip food budget from daily street meals, café stops, snacks and drinks — and see how many splurge dinners fit, costing only the price difference.",
  steps: [
    "Set the trip basics — Currency, Days of eating, Travellers and an optional 'Total food budget (0 to skip)'.",
    "Describe a typical day per person — street meals, café meals, snacks and drinks with their prices — then Splurge meals over the trip and the Planning buffer (%), where 15% is the usual convention.",
    "Read the Total food budget with its per-person-per-day figure, the extra cost of one splurge meal over the meal it replaces, and 'Splurge meals that fit inside this budget'; Copy plan copies it.",
  ],
  intro:
    "Builds a complete trip food budget from a repeating daily pattern of street meals, café meals, snacks and drinks, plus a chosen number of splurge meals, and then solves the same equation backwards to say how many splurge meals a fixed budget actually allows. The detail most hand-written food budgets get wrong is handled explicitly: a splurge meal replaces a meal you were already paying for, so only the difference between the two prices is new money.",
  useCases: [
    "Setting a realistic daily cash allowance before a two-week trip through South-East Asia",
    "Deciding whether three tasting menus fit the budget or only one, without redoing the sums by hand",
    "Splitting a shared food kitty fairly between travellers who eat different numbers of meals a day",
  ],
  benefits: [
    ["Splurge meals costed correctly", "Only the price difference over the meal it replaces is added, not the whole bill."],
    ["Answers the reverse question", "Enter a budget and it returns the number of nice meals that fit inside it."],
    ["Snacks and water counted", "The two lines travellers forget, and often the reason a food budget runs out early."],
  ],
  faqs: [
    [
      "How much should I budget per day for street food?",
      "Work it up from real prices rather than a single figure: a typical day is one or two street meals, one café meal, one or two snacks and two or three bottles of water per person. The total varies enormously between cities, so the reliable method is to check three actual stall prices at your destination and multiply, then add a buffer of about 15%.",
    ],
    [
      "Does a nice restaurant meal really add its full price to my budget?",
      "No — it replaces a meal you would have bought anyway, so the extra cost is the difference between the two. A 1,500 splurge dinner replacing an average 137 routine meal adds 1,363 per person, not 1,500. Budgeting the full price is the most common reason a trip food budget looks unaffordable when it is not.",
    ],
    [
      "How much buffer should a travel food budget have?",
      "Around 15% is the usual planning convention. It absorbs the day the cheap place is closed, prices that moved since the blog post you read, and the drinks and tea stops nobody counts in advance. Below 10% the plan tends to break within the first few days.",
    ],
    [
      "Is street food cheaper than cooking in a hostel?",
      "In most of South and South-East Asia, yes — a single street meal often costs less than the ingredients for one, and hostel kitchens rarely stock oil, spices and staples you would need to buy whole. In Western Europe, Japan and Australia the balance reverses and self-catering usually wins. Compare a real stall price against a real supermarket basket at your destination rather than assuming either way.",
    ],
  ],
};

export default seo;
