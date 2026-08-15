const seo = {
  title: "Sukanya Samriddhi Yojana Calculator",
  metaDescription:
    "Project an SSY account: 15 years of deposits from ₹250 to ₹1.5 lakh, 8.2% compounded yearly, and the exact maturity date 21 years after opening.",
  steps: [
    "Enter your daughter's date of birth, then set Yearly deposit (₹) anywhere between the ₹250 minimum and the ₹1,50,000 maximum — or tap one of the ₹1,000 / month, ₹50,000 / year and Maximum ₹1.5L presets.",
    "Choose a Deposit start year (only years before her 10th birthday are listed) and set Interest rate (% p.a.) to the notified 8.2 or a newer figure; the projection recalculates as you type, and Reset to defaults restores the starting values.",
    "The Maturity after 21 years panel returns the amount and the date it is payable, plus Total deposited, Total interest, Effective multiple, Account opens, Last deposit due and Growth-only phase tiles, a 21-row Year-wise growth table (Year, Her age, Deposit, Interest earned, Closing balance), and a Copy summary button.",
  ],
  intro:
    "This Sukanya Samriddhi Yojana calculator projects the maturity value of a girl child's SSY account under the scheme's actual rules: deposits in each of the first 15 years, interest compounded annually at the notified rate (8.2% p.a. by default), and maturity 21 years after the account is opened. Enter her date of birth, the yearly deposit between ₹250 and ₹1.5 lakh and the opening year, and you get the maturity amount, the exact maturity date, her age on that date and a year-by-year table of deposit, interest and closing balance. It is for parents deciding how much to commit each year and when to open the account.",
  useCases: [
    "Your daughter is four and you are choosing between depositing ₹50,000 and the full ₹1.5 lakh a year, and want to see the difference in the final corpus before committing.",
    "Comparing opening the account now versus waiting two years, and seeing how many compounding years — and how much interest — the delay costs.",
    "Planning for her college admission at 18 and checking the half-balance withdrawal you would be allowed, and in which calendar year it becomes available.",
  ],
  benefits: [
    ["Models the real 15-and-21 structure", "Deposits stop after year 15 while interest keeps compounding to year 21, instead of assuming you pay in for the full term."],
    ["Dates, not just totals", "It returns the actual maturity date, the last deposit date and her age at each, calculated from her date of birth."],
    ["Year-by-year, not a single figure", "Every year's deposit, interest credited and closing balance is listed, so you can see when compounding starts to outrun contributions."],
  ],
  faqs: [
    [
      "How much can I deposit in a Sukanya Samriddhi account each year?",
      "A minimum of ₹250 and a maximum of ₹1.5 lakh per financial year, and deposits are only accepted for the first 15 years from opening. Skip a year and the account goes dormant until it is revived by paying ₹50 for each missed year plus the ₹250 minimum.",
    ],
    [
      "When does the account mature?",
      "21 years after the opening date, not on her 21st birthday. Deposits run for the first 15 years and the balance keeps earning interest for the remaining six years with no further contribution required.",
    ],
    [
      "What is the current SSY interest rate?",
      "The calculator defaults to the notified rate of 8.2% per annum, compounded yearly, and lets you change it. The government reviews small savings rates every quarter, so a 21-year projection at one fixed rate is an estimate, not a guarantee.",
    ],
    [
      "Can I take money out before maturity?",
      "Up to 50% of the balance at the end of the preceding financial year can be withdrawn once she turns 18, typically for higher education, and the calculator shows that figure and the year it applies. Full premature closure is allowed only in narrow situations such as her marriage after 18. For your own case, confirm with the post office or bank holding the account.",
    ],
  ],
};

export default seo;
