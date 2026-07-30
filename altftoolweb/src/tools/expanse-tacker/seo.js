const seo = {
  intro:
    "The Expense Tracker logs what you spend — description, amount, date and one of seven categories — and turns the running list into a live dashboard: total spent, your biggest category, entry count, a category pie chart and a bar chart of the last six months. Entries are stored in your browser's local storage, so the list is still there when you come back, and amounts are formatted in Indian rupees. Add, filter by category and delete entries; the totals and both charts recalculate on every change.",
  useCases: [
    "You suspect food delivery is eating your month but have never counted — log every order for four weeks and let the highest-category card settle it.",
    "You are splitting a trip and need a per-category breakdown for transport, food and entertainment before working out who owes what.",
    "You want to see whether this month is genuinely worse than the last few or just feels that way — the six-month bar chart puts them side by side.",
  ],
  benefits: [
    ["Totals that keep up", "Total spend, largest category and entry count are derived from the list on every add or delete, so nothing goes stale."],
    ["Two views of the same data", "A pie chart answers where the money goes and a six-month bar chart answers whether it is getting worse — both from one entry list."],
    ["Filter without losing the record", "Narrowing the list to a single category hides nothing permanently; switch back to All Categories and every entry is still there."],
  ],
  faqs: [
    [
      "What categories can I file spending under?",
      "Seven: Food & Dining, Transportation, Entertainment, Shopping, Utilities, Health & Medical, and Other. The pie chart only draws the categories with a total above zero, so it stays readable when you use three of them.",
    ],
    [
      "Where is my data stored, and will it sync to my phone?",
      "It is saved in local storage in the browser you used, under the key 'expenses' — nothing is sent to a server and nothing syncs across devices. Clearing site data or using private browsing will remove the entries.",
    ],
    [
      "How far back does the trend chart go?",
      "Six months, counting the current month back. Entries dated outside that window are still counted in the total and the pie chart, but they will not appear as a bar.",
    ],
    [
      "Can I change the currency from rupees?",
      "Not from the interface — amounts are formatted as INR. If you are tracking another currency you can still enter the numbers and read the totals as unit-less figures; this tool is for personal record-keeping and is not a substitute for advice from an accountant or financial adviser.",
    ],
  ],
};

export default seo;
