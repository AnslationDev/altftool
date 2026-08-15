const seo = {
  title: "SIP Calculator with Annual Step-Up and Maturity",
  metaDescription:
    "Project monthly SIP maturity from ₹500 to ₹2,00,000 over 1-40 years with a 0-25% annual step-up, and see invested versus returns split.",
  steps: [
    "Drag the Monthly SIP, Expected annual return, Investment period and Annual SIP step-up sliders — ₹500 to ₹2,00,000, 1% to 30%, 1 to 40 years and 0% to 25% — or load the Balanced wealth preset.",
    "Read the four cards the sliders update live: Total invested, Estimated returns, Maturity amount and Final monthly SIP, with the Portfolio split bar showing how much of the maturity is your own money.",
    "Press Copy report, or Download to save sip-calculation-report.txt, which carries every input plus the maturity amount and the gain over the invested amount.",
  ],
  intro:
    "The SIP Calculator projects what a monthly mutual fund SIP grows to, compounding each instalment monthly at your expected annual return and optionally raising the instalment by a fixed percentage every twelve months. It reports four figures — total invested, estimated returns, maturity amount and what your final monthly SIP will have grown to — so you can see how much of the corpus is your own money and how much is compounding. Inputs run from ₹500 to ₹2,00,000 a month, 1 to 40 years, returns of 1% to 30% and a step-up of 0% to 25%.",
  useCases: [
    "You are starting a SIP for a child's college fund 15 years out and want to know whether ₹10,000 a month gets you there, or whether the number has to be ₹15,000.",
    "You get an annual raise and want to see what committing 10% of it to a yearly SIP step-up does to the final corpus versus keeping the instalment flat.",
    "Two funds are being pitched at different expected returns and you want to see, at the same instalment and horizon, how much of a difference two percentage points actually makes.",
  ],
  benefits: [
    ["Annual step-up is modelled properly", "The instalment rises once every 12 months and each raised instalment compounds for the time it actually has left, rather than being approximated on the average."],
    ["Invested versus gained, split out", "A single bar shows what share of maturity is your contributions and what share is growth, which is the honest way to read a large projected number."],
    ["The whole calculation is exportable", "Copy or download a plain-text report carrying every input and output, so a projection you showed someone can be checked later against the same assumptions."],
  ],
  faqs: [
    [
      "How much does a ₹10,000 monthly SIP become in 15 years?",
      "At an assumed 12% annual return, roughly ₹50.5 lakh — of which ₹18 lakh is your own contributions and about ₹32.5 lakh is growth. That is a projection at a constant rate, not a promise; actual fund returns vary year to year.",
    ],
    [
      "What is a SIP step-up and is it worth doing?",
      "A step-up raises your monthly instalment by a set percentage every year, usually in line with a salary increase. On the same ₹10,000 start at 12% over 15 years, a 10% annual step-up lifts the projected corpus from about ₹50.5 lakh to about ₹86.8 lakh, because you contribute roughly ₹38 lakh instead of ₹18 lakh.",
    ],
    [
      "What return rate should I assume?",
      "There is no correct figure — it is your assumption, not a rate the fund owes you. Many people model equity funds in a 10-12% band and debt funds lower, then re-run at a few points below to see how the goal holds up if markets underperform.",
    ],
    [
      "Does this account for tax, exit load or expense ratio?",
      "No. The projection is a gross figure before capital gains tax, exit loads and any fund expenses, so the amount you actually receive will be lower. This is an estimate for planning, not investment advice — check the scheme documents and speak to a registered adviser before committing.",
    ],
  ],
};

export default seo;
