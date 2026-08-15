const seo = {
  title: "ROI Calculator - Percentage, Multiple, Profit",
  metaDescription:
    "Enter amount invested and amount returned to get ROI %, net profit or loss, the return multiple (1.50x for a half gain) and profit margin.",
  steps: [
    "Type the Amount Invested in the Inputs panel - it starts at 5000. [pages/index.jsx:6-11; _shared/batch/CalcTool.jsx:66-82]",
    "Type the Amount Returned; the Result panel recomputes as you type, with no Calculate button to press. [pages/index.jsx:12-17; _shared/batch/CalcTool.jsx:25-32]",
    "Read the headline such as '50.00% ROI' captioned Profit, Loss or Break-even, plus the Net Profit / Loss, Return Multiple and Profit Margin cards - the Copy button takes the whole breakdown. [pages/index.jsx:44-65; _shared/batch/CalcTool.jsx:125-149]",
  ],
  intro:
    "The ROI Calculator works out return on investment as a percentage using ROI = ((amount returned − amount invested) ÷ amount invested) × 100. Enter what you put in and what came back, and it reports the ROI percentage, the net profit or loss, the return multiple (returned ÷ invested) and the profit margin measured against the amount returned. It is built for anyone settling whether a spend actually paid for itself — a campaign, a side project, a resale, a piece of equipment.",
  useCases: [
    "You spent 5,000 on a month of ads and the campaign brought back 7,500 in tracked sales — you want the ROI percentage to put in the report, not just the raw profit number.",
    "You bought a used machine, repaired it and resold it, and you want to know whether the return multiple beats what the same money would have done sitting in a deposit.",
    "Two freelance projects earned similar profit but tied up very different amounts of cash, and you want ROI side by side to decide which type of work to take more of.",
  ],
  benefits: [
    [
      "Profit and ROI in one view",
      "Shows net profit or loss alongside the percentage, so a big-sounding return on a large outlay is immediately visible for what it is.",
    ],
    [
      "Return multiple as well as percentage",
      "Reports returned ÷ invested as a multiple (2.00× for a doubling), the form investors and pitch decks usually ask for.",
    ],
    [
      "Labels break-even honestly",
      "Marks the result as Profit, Loss or Break-even, and handles a negative ROI without hiding the minus sign.",
    ],
  ],
  faqs: [
    [
      "How do you calculate ROI?",
      "ROI = ((amount returned − amount invested) ÷ amount invested) × 100. Investing 5,000 and getting back 7,500 gives a profit of 2,500, so ROI is (2,500 ÷ 5,000) × 100 = 50%. The calculator applies exactly this formula and also shows the 1.50× return multiple.",
    ],
    [
      "What is a good ROI?",
      "There is no universal figure — it depends on the risk, the time taken and what else you could have done with the money. A 50% ROI earned over five years is far weaker than the same 50% in three months, because this formula ignores time entirely. Compare against a realistic alternative use of the same cash before calling a number good.",
    ],
    [
      "What is the difference between ROI and profit margin?",
      "ROI divides profit by the amount invested, while profit margin divides profit by the amount returned. On a 5,000 investment returning 7,500, ROI is 50% but profit margin is 2,500 ÷ 7,500 = 33.33%. The calculator shows both so the two are not confused.",
    ],
    [
      "Does this account for how long the investment was held?",
      "No — this is simple ROI, not an annualised figure, so a 40% return over one year and over four years both read as 40%. For time-adjusted comparison you would need an annualised return or IRR. This tool is informational; for investment decisions of any size, speak to a licensed financial adviser.",
    ],
  ],
};

export default seo;
