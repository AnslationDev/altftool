const seo = {
  intro:
    "This calculator returns the professional tax deductible in West Bengal for a monthly salary, using Schedule Entry 1 of the West Bengal State Tax on Professions, Trades, Callings and Employments Act, 1979 as amended from 1 April 2023. It applies the five salary bands from nil up to Rs 10,000 a month through Rs 200 a month above Rs 40,000, multiplies by head count, and lays out the employer's month-by-month deposit calendar. Payroll and compliance teams can use it to size a monthly PT challan.",
  useCases: [
    "Sizing the monthly PT challan for a Kolkata office with several employees in one salary band",
    "Checking whether an employee earning just over Rs 15,000 moves from Rs 110 to Rs 130 a month",
    "Building a deposit calendar so no month's professional tax payment is missed",
  ],
  benefits: [
    ["Five bands, exact", "Uses the post-2023 schedule with the Rs 10,000 exemption limit."],
    ["Employer view", "Multiplies by head count to give the amount actually deposited."],
    ["Deposit calendar", "Lists each wage month with the date the payment is due."],
  ],
  faqs: [
    [
      "What are the professional tax slabs in West Bengal?",
      "Nil up to Rs 10,000 a month, Rs 110 from Rs 10,001 to Rs 15,000, Rs 130 from Rs 15,001 to Rs 25,000, Rs 150 from Rs 25,001 to Rs 40,000 and Rs 200 above Rs 40,000. The top band works out to Rs 2,400 for a full year.",
    ],
    [
      "When must a West Bengal employer deposit professional tax?",
      "The tax deducted from a month's salary must be paid to the state within 21 days of the end of that month, so April's deduction is due by 21 May. Late payment attracts interest, and employers must also hold a certificate of registration under the Act.",
    ],
    [
      "Did West Bengal raise its professional tax exemption limit?",
      "Yes. The exemption limit for salary and wage earners was raised to Rs 10,000 a month with effect from 1 April 2023, so employees below that figure now have no professional tax deducted at all.",
    ],
    [
      "Is professional tax the same for every employee at a company?",
      "No. It is charged on each individual's monthly gross salary, so employees in different bands at the same company pay different amounts. The employer adds up all the individual deductions and deposits one consolidated payment.",
    ],
  ],
};

export default seo;
