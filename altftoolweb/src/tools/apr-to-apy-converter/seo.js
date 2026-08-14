const seo = {
  title: "APR to APY Converter: Effective Yield to 6 Decimals",
  steps: [
    "Enter the Nominal APR (%) and Compounds per year (12 for monthly, 4 for quarterly, 365 for daily), or apply the 12% monthly preset.",
    "Tick the Continuous compounding toggle (Use e^APR instead of periodic compounding) when a model or contract specifies it — the result recalculates instantly.",
    "Read the Effective APY to six decimal places alongside the Nominal APR and Effective uplift rows in percentage points, and use the Copy button to grab the summary.",
  ],
  metaDescription:
    "Convert nominal APR to effective APY for periodic or continuous compounding, with six-decimal results and the compounding uplift.",
  intro:
    "The APR-to-APY Converter turns a nominal annual percentage rate into the effective annual yield using APY = (1 + APR ÷ n)^n − 1, where n is the number of compounding periods per year, or APY = e^APR − 1 when you switch on continuous compounding. It reports the APR, the resulting APY and the uplift between them in percentage points, all to six decimal places. It exists because two accounts quoting the same headline rate can pay different amounts once compounding frequency differs.",
  useCases: [
    "Two savings accounts both advertise 6%, but one compounds monthly and the other quarterly, and you want the effective yield on each before moving the money.",
    "A lender quotes a monthly rate and you need the annual figure that is actually comparable with a competitor's advertised APY.",
    "You are checking a spreadsheet model that assumes daily compounding and want to confirm the effective rate it should be using for 365 periods.",
  ],
  benefits: [
    ["Six-decimal output", "Results are shown to six decimal places, enough to see the difference between quarterly and monthly compounding on the same nominal rate."],
    ["Shows the uplift explicitly", "Alongside the APY it reports how many percentage points compounding adds over the nominal APR, which is the number that actually decides between two offers."],
    ["Continuous compounding included", "A single toggle switches from the periodic formula to e^APR − 1, the theoretical upper bound used in options and fixed-income maths."],
  ],
  faqs: [
    [
      "What is the difference between APR and APY?",
      "APR is the nominal rate ignoring compounding within the year; APY is what you actually earn or pay once interest compounds. At 12% APR compounded monthly the APY is 12.682503%, an uplift of about 0.68 percentage points over the headline figure.",
    ],
    [
      "What is the formula for converting APR to APY?",
      "APY = (1 + APR ÷ n)^n − 1, with the rate as a decimal and n the compounding periods per year — 12 for monthly, 4 for quarterly, 365 for daily. With n = 1 the APY equals the APR, because there is no intra-year compounding.",
    ],
    [
      "How much more does daily compounding pay than monthly?",
      "Less than most people expect. A 12% nominal rate gives 12.682503% APY compounded monthly and roughly 12.7475% compounded daily — a gap of about 0.065 percentage points, or ₹65 per ₹100,000 per year.",
    ],
    [
      "When should I use continuous compounding?",
      "Use it when a model or contract specifies it, typically in derivatives pricing and academic finance, not for ordinary deposit accounts. Continuous compounding gives e^APR − 1, which is the ceiling any periodic frequency approaches: 12.749685% for a 12% nominal rate. This is an arithmetic conversion, not financial advice — check the compounding basis in your product's terms and talk to a licensed adviser about the decision itself.",
    ],
  ],
};

export default seo;
