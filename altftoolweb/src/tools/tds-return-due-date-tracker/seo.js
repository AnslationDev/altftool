const seo = {
  title: "TDS Return Due Date Tracker: 24Q, 26Q, 27Q & 27EQ",
  metaDescription:
    "Quarterly 24Q/26Q/27Q deadlines (31 Jul, 31 Oct, 31 Jan, 31 May), Form 16/16A/27D dates, the monthly deposit calendar and the Rs 200-a-day 234E fee.",
  steps: [
    "Pick the 'Financial year' (FY 2023-24 through 2027-28) and set the 'Count days from' date — it defaults to today and the current Indian financial year.",
    "Read the 'Next statement deadline' countdown, then each quarter's card listing due dates for Forms 24Q, 26Q and 27Q, Form 27EQ (TCS), Form 16A to deductees and Form 27D to collectees.",
    "Enter 'Days past the due date' and 'Tax in the statement (INR)' to see the section 234E late fee with its cap, then press 'Copy calendar' for the full year's dates.",
  ],
  intro:
    "This tracker lays out every quarterly TDS and TCS deadline for an Indian financial year: Forms 24Q, 26Q and 27Q under Rule 31A, Form 27EQ under Rule 31AA, and the Form 16, 16A and 27D certificate dates that follow them. Statements are due on 31 July, 31 October, 31 January and 31 May for the four quarters, with TCS statements a fortnight earlier on the 15th. It also gives the monthly deposit calendar under Rule 30 and works out the Rs 200 a day fee under section 234E when a statement slips.",
  useCases: [
    "A payroll team checks how many days are left before the Q2 Form 24Q deadline",
    "An accountant confirms the date by which Form 16A must reach vendors after filing Form 26Q",
    "A finance manager estimates the section 234E fee on a statement that is thirty days late",
  ],
  benefits: [
    ["Every form in one view", "Statements, certificates and deposit dates for the whole year on one page."],
    ["Live countdown", "Shows days remaining or days overdue against the date you choose."],
    ["Late cost estimated", "Applies the Rs 200 a day section 234E fee with its cap at the tax deducted."],
  ],
  faqs: [
    [
      "What are the TDS return due dates for the four quarters?",
      "31 July for April to June, 31 October for July to September, 31 January for October to December and 31 May for January to March. These apply to Forms 24Q, 26Q and 27Q under Rule 31A; the TCS statement in Form 27EQ is due on the 15th of the same months.",
    ],
    [
      "When must Form 16 and Form 16A be issued?",
      "Form 16 for salary is due by 15 June following the financial year. Form 16A must be issued within fifteen days of the statement due date, which works out to 15 August, 15 November, 15 February and 15 June for the four quarters. Form 27D for TCS follows the same fifteen-day rule from the Form 27EQ date.",
    ],
    [
      "What is the penalty for filing a TDS return late?",
      "Section 234E charges Rs 200 for every day of delay, and the fee can never exceed the tax deducted in that statement. Section 271H adds a separate penalty of Rs 10,000 to Rs 1,00,000, which is not levied if the statement is filed within one year of the due date and the tax, interest and fee have been paid.",
    ],
    [
      "By when must TDS deducted in a month be deposited?",
      "By the 7th of the following month for every month except March, where tax deducted must be deposited by 30 April. Depositing late attracts interest under section 201(1A) at 1.5% for every month or part of a month from the date of deduction to the date of payment, which is separate from the section 234E filing fee. Confirm any extension notified by the CBDT before relying on a date.",
    ],
  ],
};

export default seo;
