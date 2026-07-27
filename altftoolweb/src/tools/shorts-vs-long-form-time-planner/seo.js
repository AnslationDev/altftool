const seo = {
  intro:
    "Shorts Vs Long Form Time Planner allocates a fixed weekly production budget between short and long content by solving a small integer knapsack exactly: it evaluates every feasible whole-piece combination inside your publishing caps and keeps the one with the highest expected return. Expected value per piece is views divided by 1,000 multiplied by RPM, and value per hour is that figure divided by the hours the piece takes to make. Built for creators who have a hard limit on time rather than on ideas.",
  useCases: [
    "Decide whether twelve hours a week is better spent on three long videos or a run of Shorts.",
    "See the point at which a rising Shorts RPM makes the short format worth more per hour than long form.",
    "Plan around a realistic cap, such as never publishing more than one long video a week.",
    "Switch the objective from revenue to views when the goal is reach rather than income.",
  ],
  benefits: [
    ["Exact, not a rule of thumb", "Every feasible whole-piece split is evaluated, so the answer is the true optimum for your numbers."],
    ["Value per hour made explicit", "Both formats are reduced to expected return per production hour, the only figure that compares them fairly."],
    ["Caps and leftovers surfaced", "Tells you when a publishing cap is what is limiting the plan and how many hours are left unusable."],
  ],
  faqs: [
    [
      "Are YouTube Shorts or long videos more profitable?",
      "It depends entirely on your own numbers. Long-form ad RPM is usually several times higher per thousand views, but Shorts often gather far more views per hour of work, so compare expected revenue per production hour rather than RPM alone.",
    ],
    [
      "How do I calculate revenue per production hour?",
      "Multiply average views by RPM and divide by 1,000 to get revenue per piece, then divide by the hours that piece takes. A Short earning 6,000 views at an RPM of 40 returns 240 per piece, or 320 per hour if it takes 45 minutes to make.",
    ],
    [
      "Should I put all my time into one format?",
      "Rarely, because publishing caps and hour remainders usually make a mix better. The planner shows the all-in figure for each format next to the optimal split so you can see how much the mix is actually worth.",
    ],
    [
      "Why does the plan leave hours unused?",
      "Because pieces are whole units. If both weekly caps are reached, or the hours left are too few for another piece of either format, that time cannot be scheduled — the tool reports it as idle hours rather than pretending it produced something.",
    ],
  ],
};

export default seo;
