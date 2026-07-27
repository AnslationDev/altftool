const seo = {
  intro:
    "This cheat sheet turns a rupees-per-franc exchange rate into arithmetic you can do on a Swiss platform without unlocking a phone. It splits the rate into a decimal shift — for the franc that is simply adding two zeros — and a working multiplier, then searches a whole-or-half multiplier, the same multiplier with an easy percentage nudge such as 5% or 10%, and the nearest simple fraction, reporting the fixed percentage error of each. It is aimed at Indian travellers, students and business visitors dealing with one of the most expensive currencies they will meet.",
  useCases: [
    "Judging whether a CHF 45 restaurant main is worth ordering once you have seen it in rupees.",
    "Converting a CHF 250 mountain railway ticket before committing to a day trip.",
    "Turning a ₹2,00,000 trip budget into francs so you know how many days it actually covers.",
  ],
  benefits: [
    ["Built on a round anchor", "Adding two zeros gets you most of the way; the sheet tells you the exact percentage to add or subtract after that."],
    ["Error stated for every rule", "Each shortcut carries the percentage it is out by, so you know which purchases deserve a real check."],
    ["Reverse rule included", "It derives the francs-per-rupee shortcut too, which matters when you are budgeting rather than shopping."],
  ],
  faqs: [
    [
      "How do I convert Swiss francs to rupees in my head?",
      "Add two zeros, then adjust. At around ₹107 per franc, CHF 45 becomes 4,500 plus about 5% — roughly ₹4,725, against an exact ₹4,815. Enter the day's rate above and the sheet recalculates the nudge for it.",
    ],
    [
      "Is there a 500 franc note?",
      "No. The Swiss National Bank's ninth series runs 10, 20, 50, 100, 200 and 1000 francs, so the sequence jumps straight from 200 to 1000. The 1000-franc note remains in general circulation, which is unusual among major currencies.",
    ],
    [
      "Can I pay in euros in Switzerland?",
      "Sometimes, but you should not plan on it. Switzerland is not in the euro area; larger shops, stations and tourist sites may accept euro notes at a rate they choose, and your change comes back in francs. Paying by card in francs, or in cash you have exchanged properly, almost always costs less.",
    ],
    [
      "Why is my card statement higher than the mental estimate?",
      "The rate you convert against is the mid-market rate. Indian cards typically add a foreign-currency markup of around 2% to 3.5% plus GST on that fee, and if a Swiss terminal offers to bill you in rupees — dynamic currency conversion — that adds several per cent more. Decline it and pay in francs.",
    ],
  ],
};

export default seo;
