const seo = {
  intro:
    "An overtime register records every extra hour a worker puts in and the wages paid for it, and this generator builds that register in the Form IV layout prescribed by rule 25(2) of the Minimum Wages (Central) Rules 1950. It prices each entry at twice the ordinary hourly rate, the rate section 59(1) of the Factories Act 1948 fixes for overtime, and flags days over the 10-hour cap or quarters over the 50-hour overtime ceiling. HR teams, factory supervisors and small employers can produce an inspection-ready register without setting up a spreadsheet.",
  useCases: [
    "Preparing the overtime register a labour inspector asks for during a Factories Act or Minimum Wages inspection",
    "Working out how much overtime wage is owed to a machine operator who worked 2 extra hours on six days in a wage period",
    "Checking, before rosters are approved, whether a worker is about to cross the 50-hour quarterly overtime ceiling",
  ],
  benefits: [
    ["Statutory double rate", "Overtime wages are computed at 2× the ordinary hourly rate, not at plain time."],
    ["Built-in limit checks", "Warns when a day exceeds 10 total hours or a quarter exceeds 50 overtime hours."],
    ["Spreadsheet-ready output", "Copies the whole register as CSV with the Form IV column order intact."],
  ],
  faqs: [
    [
      "What is the overtime rate in India?",
      "Overtime is paid at twice the ordinary rate of wages under section 59(1) of the Factories Act 1948, and rule 25 of the Minimum Wages (Central) Rules 1950 applies the same double rate to scheduled employments. The ordinary rate means basic wages plus allowances such as dearness allowance, but excludes bonus.",
    ],
    [
      "How do I calculate the overtime hourly rate from a monthly salary?",
      "Divide the monthly wage by the number of paid days in the wage period, then by the normal hours in a working day, and multiply by two. For a wage of Rs 26,000 with 26 paid days and 8-hour days, the ordinary rate is Rs 125 an hour and overtime is Rs 250 an hour.",
    ],
    [
      "Is there a maximum number of overtime hours allowed?",
      "Yes. Section 64(4) of the Factories Act 1948 caps total daily hours at 10 including overtime and caps overtime at 50 hours in any one quarter, and section 51 keeps ordinary weekly work at 48 hours. Several states notify their own higher or lower limits, so confirm the rule notified for your state.",
    ],
    [
      "What must an overtime register contain?",
      "Form IV under rule 25(2) of the Minimum Wages (Central) Rules 1950 requires the worker's name and designation, the dates on which overtime was worked, the overtime hours, the normal and overtime rates, the overtime wages due and the date those wages were actually paid. Keeping the payment date blank is the most common defect found in inspections.",
    ],
  ],
};

export default seo;
