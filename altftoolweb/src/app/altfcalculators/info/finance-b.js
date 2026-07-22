const info = {
  "sip-calculator": {
    intro: [
      "A SIP (Systematic Investment Plan) calculator estimates the future value of investing a fixed amount every month, typically into a mutual fund. It assumes a steady expected rate of return and compounds each instalment for the time it stays invested.",
      "SIPs are popular because they enforce disciplined, automatic investing and average out your purchase price across market ups and downs (rupee-cost averaging), removing the pressure of timing the market.",
    ],
    formula: {
      expression: "FV = P × ((1 + i)^n − 1) / i × (1 + i)",
      where: [
        ["FV", "Future value of the investment"],
        ["P", "Monthly investment amount"],
        ["i", "Monthly return = annual rate ÷ 12 ÷ 100"],
        ["n", "Number of instalments = years × 12"],
      ],
      note: "This is the future value of an annuity-due (each SIP is invested at the start of the month). Actual mutual-fund returns vary and are not guaranteed.",
    },
    howToUse: [
      "Enter the fixed amount you plan to invest every month.",
      "Enter an expected annual return (equity funds are often modelled at 10–12%).",
      "Enter the number of years you will keep investing.",
      "Read the total value, along with how much you invested versus estimated returns.",
    ],
    goodToKnow: [
      "The projection uses a constant return; real markets fluctuate, so treat the figure as an estimate, not a promise.",
      "Longer durations dramatically increase returns because compounding has more time to work.",
      "A step-up SIP (raising the amount yearly) can grow the corpus much faster than a flat SIP.",
      "Returns from equity mutual funds may be subject to capital-gains tax depending on your holding period and jurisdiction.",
    ],
    faqs: [
      { q: "Is the expected return guaranteed?", a: "No. Mutual-fund returns depend on market performance. The calculator only shows what your corpus would be if the assumed rate held steady throughout." },
      { q: "Does it assume investment at the start or end of the month?", a: "It uses the annuity-due formula (the extra ×(1 + i) term), meaning each instalment is invested at the start of the month, which matches how most SIPs are debited." },
      { q: "What return rate should I assume?", a: "It depends on the fund type. Historically, diversified equity funds have been modelled around 10–12% per year and debt funds lower, but past performance does not guarantee future results." },
      { q: "What is the difference between SIP and lumpsum?", a: "A SIP spreads investment across many months (averaging your entry price), while a lumpsum invests the entire amount at once. Use the Lumpsum calculator for a one-time investment." },
    ],
  },

  "lumpsum-calculator": {
    intro: [
      "A lumpsum calculator projects how much a single, one-time investment will grow to over a given period at an assumed annual rate of return. It is the compound-growth counterpart to a SIP, where the whole amount is invested up front.",
      "It is useful for evaluating a one-off deposit into a mutual fund, an index fund or any instrument that compounds annually.",
    ],
    formula: {
      expression: "FV = P × (1 + r/100)^t",
      where: [
        ["FV", "Future value"],
        ["P", "One-time investment amount"],
        ["r", "Expected annual return (%)"],
        ["t", "Number of years"],
      ],
    },
    howToUse: [
      "Enter the one-time amount you are investing.",
      "Enter the expected annual rate of return.",
      "Enter how many years the money stays invested.",
      "See the projected total value, split into invested amount and estimated returns.",
    ],
    goodToKnow: [
      "Because the full amount compounds from day one, a lumpsum can outperform a SIP of the same total in a steadily rising market.",
      "In a volatile or falling market, spreading the money via a SIP reduces the risk of investing everything at a market peak.",
      "The model assumes annual compounding at a constant rate; actual fund NAVs move daily.",
    ],
    faqs: [
      { q: "SIP or lumpsum — which is better?", a: "Neither is universally better. Lumpsum benefits from full early compounding, while SIP reduces timing risk. Many investors combine both." },
      { q: "Does inflation affect this figure?", a: "The result is a nominal value. To gauge real purchasing power, subtract expected inflation from your return assumption before calculating." },
      { q: "What if the rate is negative?", a: "A negative return would shrink the corpus. The calculator expects a non-negative rate, but you can compare scenarios by lowering the rate." },
    ],
  },

  "fd-calculator": {
    intro: [
      "A Fixed Deposit (FD) calculator estimates the maturity amount of a lump-sum deposit that earns a fixed interest rate for a set tenure. Banks compound FD interest at a chosen frequency, and the calculator applies standard compound-interest growth.",
      "FDs are low-risk instruments with a guaranteed rate, making them popular for capital preservation and predictable returns.",
    ],
    formula: {
      expression: "A = P × (1 + r / (100 × f))^(f × t)",
      where: [
        ["A", "Maturity amount"],
        ["P", "Principal deposited"],
        ["r", "Annual interest rate (%)"],
        ["f", "Compounding periods per year"],
        ["t", "Tenure in years"],
      ],
    },
    howToUse: [
      "Enter the amount you are depositing (the principal).",
      "Enter the annual interest rate offered by the bank.",
      "Enter the tenure in years.",
      "Choose the compounding frequency (banks commonly compound quarterly) to see the maturity value and interest earned.",
    ],
    goodToKnow: [
      "More frequent compounding (e.g. quarterly vs yearly) yields a slightly higher maturity for the same rate.",
      "FD interest is generally taxable as income, and banks may deduct TDS above a threshold; this calculator shows the pre-tax maturity.",
      "Breaking an FD before maturity usually incurs a penalty and a lower effective rate.",
      "Senior citizens often receive a higher rate than the standard published rate.",
    ],
    faqs: [
      { q: "Which compounding frequency do banks use?", a: "Most Indian banks compound FD interest quarterly, though some products use monthly or half-yearly. Pick the option that matches your bank's terms." },
      { q: "Is the maturity amount shown before or after tax?", a: "Before tax. Interest earned is added to your taxable income, and TDS may apply, so your in-hand amount can be lower." },
      { q: "What is the difference between a cumulative and non-cumulative FD?", a: "A cumulative FD reinvests interest and pays it at maturity (what this calculator models). A non-cumulative FD pays interest periodically instead of compounding it." },
    ],
  },

  "rd-calculator": {
    intro: [
      "A Recurring Deposit (RD) calculator estimates the maturity value when you deposit a fixed amount every month for a chosen number of months at a fixed interest rate. Each instalment earns interest for the remaining time until maturity.",
      "RDs suit savers who want to build a corpus gradually with the safety of a fixed, guaranteed rate.",
    ],
    formula: {
      expression: "M = P × ((1 + i)^n − 1) / i × (1 + i)",
      where: [
        ["M", "Maturity amount"],
        ["P", "Fixed monthly deposit"],
        ["i", "Monthly rate = annual rate ÷ 12 ÷ 100"],
        ["n", "Number of monthly deposits"],
      ],
      note: "This uses a monthly-compounding approximation. Banks typically compound RD interest quarterly, so the exact maturity your bank quotes may differ slightly.",
    },
    howToUse: [
      "Enter the fixed amount you will deposit each month.",
      "Enter the annual interest rate offered on the RD.",
      "Enter the tenure in months.",
      "Read the maturity amount along with total deposited and interest earned.",
    ],
    goodToKnow: [
      "Early instalments earn more interest than later ones because they compound for longer.",
      "Banks generally compound RDs quarterly; a monthly approximation is close but not identical.",
      "Missing an instalment can attract a small penalty and reduce the maturity value.",
      "Like FDs, RD interest is taxable and may be subject to TDS.",
    ],
    faqs: [
      { q: "Why might my bank's figure differ slightly?", a: "This calculator compounds monthly for simplicity, while most banks compound RD interest quarterly. The difference is usually small." },
      { q: "Can I change my monthly deposit later?", a: "Traditional RDs fix the monthly amount for the whole tenure. To vary it, you would open a flexible RD or a separate account." },
      { q: "What happens if I withdraw early?", a: "Premature closure usually reduces the interest rate and may charge a penalty, lowering your maturity amount." },
    ],
  },

  "savings-calculator": {
    intro: [
      "A savings goal calculator projects the future balance of a savings plan where you deposit a fixed amount every month, optionally starting from an existing balance, at a given annual interest rate.",
      "It helps you see how regular saving plus compound interest builds toward a target, and how much of the final balance is your own contributions versus earned interest.",
    ],
    formula: {
      expression: "FV = S × (1 + i)^n + M × ((1 + i)^n − 1) / i",
      where: [
        ["FV", "Final balance"],
        ["S", "Starting balance"],
        ["M", "Monthly deposit"],
        ["i", "Monthly rate = annual rate ÷ 12 ÷ 100"],
        ["n", "Number of months = years × 12"],
      ],
    },
    howToUse: [
      "Enter the amount you plan to save each month.",
      "Optionally enter a starting balance you already have.",
      "Enter the annual interest rate your account or instrument earns.",
      "Enter the number of years to see your final balance, total contributions and interest.",
    ],
    goodToKnow: [
      "Even a modest interest rate produces meaningful growth over long horizons thanks to compounding.",
      "The total contributions figure is money you put in; the rest of the balance is earned interest.",
      "Automating the monthly transfer makes it far more likely you will stick to the plan.",
    ],
    faqs: [
      { q: "Does this assume deposits at month-end?", a: "Yes. Monthly deposits are treated as an ordinary annuity (end of each month), while any starting balance compounds from day one." },
      { q: "Can I use it for a specific goal amount?", a: "Yes — adjust the monthly deposit, rate or years until the final balance matches the goal you have in mind." },
      { q: "Is the interest rate before or after tax?", a: "It is the gross rate. If interest is taxable, your effective growth will be a little lower." },
    ],
  },

  "investment-calculator": {
    intro: [
      "An investment calculator projects the future value of a portfolio that combines an initial lump sum with ongoing monthly contributions, growing at an assumed annual rate of return.",
      "It is ideal for modelling a real-world plan where you invest a starting amount today and keep adding to it every month.",
    ],
    formula: {
      expression: "FV = I × (1 + i)^n + M × ((1 + i)^n − 1) / i",
      where: [
        ["FV", "Future value"],
        ["I", "Initial investment"],
        ["M", "Monthly contribution"],
        ["i", "Monthly return = annual rate ÷ 12 ÷ 100"],
        ["n", "Number of months = years × 12"],
      ],
    },
    howToUse: [
      "Enter your initial (one-time) investment amount.",
      "Enter the amount you will add every month.",
      "Enter the expected annual rate of return.",
      "Enter the number of years to see the future value, total invested and estimated returns.",
    ],
    goodToKnow: [
      "The initial lump sum and the monthly contributions each compound, so both matter to the final result.",
      "Total invested is the money you contributed; returns are everything the market added on top.",
      "Assumed returns are not guaranteed — market investments carry risk and can lose value.",
      "Increasing your monthly contribution over time (a step-up) can significantly boost the outcome.",
    ],
    faqs: [
      { q: "How is this different from the SIP calculator?", a: "The SIP calculator handles only monthly contributions. This one also lets you add an upfront lump sum that compounds alongside them." },
      { q: "What return should I assume?", a: "Use a rate appropriate to your asset mix and be conservative. Equity-heavy portfolios are often modelled around 8–12%, but returns vary widely." },
      { q: "Does it account for fees or taxes?", a: "No. Expense ratios, transaction costs and taxes would reduce the net result, so treat the figure as a gross estimate." },
    ],
  },

  "roi-calculator": {
    intro: [
      "A Return on Investment (ROI) calculator measures how profitable an investment was by comparing the net profit to the amount you originally invested, expressed as a percentage.",
      "When you also provide the holding period, it computes the annualized ROI, which lets you compare investments held for different lengths of time on an equal footing.",
    ],
    formula: {
      expression: "ROI = (Returned − Invested) / Invested × 100 ;  Annualized = ((Returned / Invested)^(1/t) − 1) × 100",
      where: [
        ["Invested", "Amount originally put in"],
        ["Returned", "Final value received"],
        ["t", "Holding period in years (for annualized ROI)"],
      ],
    },
    howToUse: [
      "Enter the amount you originally invested.",
      "Enter the final value you received (or expect to receive).",
      "Optionally enter the holding period in years to get the annualized ROI.",
      "Read the net profit, total ROI and, if applicable, the annualized return.",
    ],
    goodToKnow: [
      "A negative ROI means you lost money — the returned value was less than what you invested.",
      "Total ROI ignores time, so a 50% return over 1 year and over 10 years look identical; annualized ROI fixes this.",
      "Annualized ROI is the same idea as CAGR — the constant yearly growth rate that links the start and end values.",
      "ROI does not account for the timing of intermediate cash flows; use IRR for irregular multi-period flows.",
    ],
    faqs: [
      { q: "What is a good ROI?", a: "It depends on the risk and time frame. Compare against relevant benchmarks (like a market index) and against safer alternatives before judging." },
      { q: "Why compute annualized ROI?", a: "Total ROI can't compare investments held for different durations. Annualizing converts everything to a per-year rate for a fair comparison." },
      { q: "Should returned include dividends or income?", a: "Yes. For an accurate ROI, the returned value should include all proceeds — sale value plus any dividends, interest or payouts received." },
    ],
  },

  "cagr-calculator": {
    intro: [
      "The Compound Annual Growth Rate (CAGR) is the constant yearly rate at which an investment would have grown from its starting value to its ending value, assuming profits are reinvested each year.",
      "CAGR smooths out the ups and downs of returns into a single, comparable figure, making it one of the most common ways to describe the performance of an investment over multiple years.",
    ],
    formula: {
      expression: "CAGR = ((Final / Initial)^(1 / t) − 1) × 100",
      where: [
        ["Final", "Ending value"],
        ["Initial", "Beginning value"],
        ["t", "Number of years"],
      ],
    },
    howToUse: [
      "Enter the initial value of the investment.",
      "Enter the final value at the end of the period.",
      "Enter the number of years between the two values.",
      "Read the CAGR, the total growth percentage and the absolute gain.",
    ],
    goodToKnow: [
      "CAGR assumes steady compounding; it does not reflect the volatility or the actual year-by-year path of returns.",
      "It is mathematically identical to annualized ROI for a single lump-sum investment.",
      "Because it is a geometric mean, CAGR is always less than or equal to the simple average of yearly returns when returns vary.",
      "CAGR is a nominal figure — subtract inflation to estimate real growth.",
    ],
    faqs: [
      { q: "What's the difference between CAGR and total growth?", a: "Total growth is the overall percentage increase across the whole period, while CAGR expresses that increase as an equivalent constant per-year rate." },
      { q: "Can CAGR be negative?", a: "Yes. If the final value is below the initial value, CAGR is negative, indicating the investment shrank on average each year." },
      { q: "Does CAGR account for additional deposits?", a: "No. CAGR compares a single start and end value. For plans with ongoing contributions, use the SIP or investment calculator instead." },
    ],
  },

  "compound-interest-calculator": {
    intro: [
      "A compound interest calculator shows how a principal grows when interest is added to the balance at regular intervals, so that each period you earn interest on your interest as well as on the original amount.",
      "Compounding is the engine behind long-term wealth building — the more frequently interest is compounded and the longer the money stays invested, the faster it grows.",
    ],
    formula: {
      expression: "A = P × (1 + r / n)^(n × t)",
      where: [
        ["A", "Final amount"],
        ["P", "Principal"],
        ["r", "Annual interest rate (as a decimal)"],
        ["n", "Compounding periods per year"],
        ["t", "Time in years"],
      ],
    },
    howToUse: [
      "Enter the principal amount you are starting with.",
      "Enter the annual interest rate.",
      "Enter the time period in years.",
      "Choose how often interest compounds to see the final amount and interest earned.",
    ],
    goodToKnow: [
      "For the same rate, more frequent compounding (daily vs yearly) produces a slightly higher final amount.",
      "The difference between compound and simple interest widens dramatically over long periods.",
      "The 'Rule of 72' gives a quick estimate: dividing 72 by the annual rate approximates the years needed to double your money.",
    ],
    faqs: [
      { q: "How does compounding frequency affect returns?", a: "The more often interest is compounded, the more interest-on-interest you earn. Daily compounding beats annual compounding at the same nominal rate, though the gap is usually modest." },
      { q: "What is the difference between simple and compound interest?", a: "Simple interest is calculated only on the original principal, while compound interest is calculated on the principal plus all previously accumulated interest." },
      { q: "What does APY mean?", a: "Annual Percentage Yield is the effective yearly rate after accounting for compounding, which makes it easy to compare accounts with different compounding frequencies." },
    ],
  },

  "simple-interest-calculator": {
    intro: [
      "A simple interest calculator computes interest charged or earned only on the original principal, without compounding. The interest is the same for every period, which makes it easy to calculate and predict.",
      "Simple interest is commonly used for short-term loans, some car loans and certain fixed-income arrangements where interest does not build on itself.",
    ],
    formula: {
      expression: "Interest = P × r × t / 100 ;  Total = P + Interest",
      where: [
        ["P", "Principal"],
        ["r", "Annual interest rate (%)"],
        ["t", "Time in years"],
      ],
    },
    howToUse: [
      "Enter the principal amount.",
      "Enter the annual interest rate.",
      "Enter the time period in years.",
      "Read the interest and the total amount payable or receivable.",
    ],
    goodToKnow: [
      "Because interest never compounds, simple interest always yields less than compound interest at the same rate over more than one period.",
      "For a period given in months or days, convert it to years (e.g. 6 months = 0.5) before calculating.",
      "Many real-world loans use compound interest, so confirm which method applies to your agreement.",
    ],
    faqs: [
      { q: "When is simple interest used?", a: "It is typical for short-term or fixed-installment lending, some auto loans, and situations where interest is deliberately kept flat rather than compounding." },
      { q: "How do I handle a period in months?", a: "Divide the number of months by 12 to express the time in years — for example, 9 months is 0.75 years." },
      { q: "Is simple interest better for a borrower?", a: "Generally yes. For the same rate and term, simple interest costs a borrower less than compound interest because it never charges interest on unpaid interest." },
    ],
  },
};

export default info;
