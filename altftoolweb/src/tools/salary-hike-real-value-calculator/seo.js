const seo = {
  title: "Salary Hike Calculator: After-Tax Real Value",
  metaDescription:
    "See what a 10% hike is worth after your marginal slab, 4% cess, surcharge and inflation — extra in hand per month plus the break-even hike to stay level.",
  steps: [
    "Enter your Current annual gross / CTC and Current annual take-home in rupees, the Hike offered (% of gross) — or tap a 5% to 20% preset — and Inflation over the year.",
    "Pick Your top slab rate (%) and the Surcharge on income tax from the dropdowns; the Health and Education Cess field defaults to 4%.",
    "Read the Real gain in purchasing power, the bar showing the share of the raise you keep after tax, and the Hike needed just to stay level; Copy result copies the summary.",
  ],
  intro:
    "This calculator converts a headline appraisal percentage into the rupees of purchasing power you actually gain. The increment sits on top of your existing income, so it is taxed at your marginal slab rate grossed up by surcharge and the 4% Health and Education Cess; inflation is then applied to the whole take-home using the Fisher relation, not only to the raise. It also reports the break-even hike — the percentage that leaves you exactly where you started.",
  useCases: [
    "You have been offered 10% and want to know how much of it survives a 31.2% effective marginal rate and 6% inflation.",
    "Comparing two offers where one has a bigger headline hike but pushes you past the ₹50 lakh surcharge threshold.",
    "Working out, before an appraisal conversation, the minimum percentage that keeps your real income flat.",
  ],
  benefits: [
    ["Marginal, not average", "The raise is taxed at your top slab rate plus cess, which is much higher than your overall tax rate."],
    ["Inflation applied correctly", "Prices rise on your entire salary, so the erosion is far larger than inflation times the increment."],
    ["A number to negotiate with", "The break-even hike tells you the floor below which the raise is a real-terms pay cut."],
  ],
  faqs: [
    [
      "How much of a salary hike do I actually keep?",
      "One minus your effective marginal rate. At a 30% slab with 4% cess and no surcharge the effective rate is 31.2%, so about ₹68.80 of every ₹100 of the raise reaches you before inflation. Add a 10% surcharge above ₹50 lakh of total income and the effective rate becomes 34.32%.",
    ],
    [
      "What hike do I need just to keep up with inflation?",
      "More than the inflation rate, because tax takes a share of the raise but inflation hits your whole take-home. With ₹15 lakh gross, ₹11 lakh take-home, a 31.2% effective marginal rate and 6% inflation, the break-even hike is about 6.4% of gross — anything below that is a real-terms pay cut.",
    ],
    [
      "Why is my in-hand increase so much smaller than the percentage I was told?",
      "Three reasons: the percentage is usually quoted on gross or CTC rather than in-hand; the increment is taxed at your marginal rate rather than your average rate; and part of a CTC increase can go into employer PF and other non-cash components that never reach your bank account.",
    ],
    [
      "Is the 4% cess charged on the tax or on the income?",
      "On the tax, not the income. Health and Education Cess is levied at 4% of income tax plus surcharge, which is why a 30% slab rate becomes an effective 31.2%. Slab rates and surcharge thresholds are set by the Finance Act each year, so confirm the current ones — this tool is informational and not tax advice.",
    ],
  ],
};

export default seo;
