const seo = {
  intro:
    "The Mortgage Affordability Calculator applies the 28/36 debt-to-income rule to your gross income: it caps the housing payment at 28 percent of monthly gross income, or at 36 percent minus your existing monthly debts, whichever is lower, and then converts that payment back into the loan it supports at your rate and term using the standard annuity formula. Add your down payment and you get the home price the rule allows. It is for the stage before you talk to a lender, when you want a defensible ceiling rather than an estate agent's optimism. This is general information, not lending or financial advice — a lender's own underwriting will differ.",
  useCases: [
    "You are about to start viewing properties and want an upper bound on price before you fall for something you cannot finance.",
    "You are carrying a car loan and a student loan and need to see how much of your borrowing capacity those repayments have already used up under the 36 percent back-end limit.",
    "Rates have moved since you last checked, and you want to know how many thousands come off your maximum loan at the new rate on the same monthly payment.",
  ],
  benefits: [
    ["Both halves of the rule, not just one", "Most quick estimates apply only the 28 percent housing ratio; this takes the lower of that and the 36 percent total-debt limit after your existing repayments."],
    ["Payment converted into real principal", "The maximum payment is run back through the present-value annuity formula at your actual rate and term, so the loan figure reflects the cost of borrowing rather than a multiple of salary."],
    ["Shows the working", "Maximum monthly payment, maximum loan and your down payment are listed separately, so you can see which of the three is the binding constraint."],
  ],
  faqs: [
    [
      "What is the 28/36 rule?",
      "It is a lending guideline that caps housing costs at 28 percent of gross monthly income and total debt payments — housing plus everything else — at 36 percent. On a $90,000 salary, gross monthly income is $7,500, so the housing cap is $2,100 and the total-debt cap is $2,700; with $500 of other monthly debt the binding limit is the $2,100 front-end figure.",
    ],
    [
      "How much house can I afford on $90,000 a year?",
      "Under the 28/36 rule with $500 of other monthly debt, a 6.5 percent rate and a 30-year term, the $2,100 maximum payment supports a loan of roughly $332,000. Add a $40,000 down payment and the affordable price comes to about $372,000 — change the rate or term and that figure moves substantially.",
    ],
    [
      "Does the maximum payment include property taxes and insurance?",
      "No. The calculator turns the entire allowed payment into loan principal and interest, whereas lenders count taxes, homeowners insurance, HOA dues and any mortgage insurance inside the 28 percent limit. Subtract your estimate of those costs from the maximum monthly payment before treating the loan figure as realistic.",
    ],
    [
      "Why do my existing debts cut the amount so sharply?",
      "Because every rupee or dollar of other monthly repayment comes straight out of the 36 percent back-end allowance. At $7,500 gross monthly income the total-debt cap is $2,700, so $700 of car and card payments leaves $2,000 for housing — below the 28 percent limit, making existing debt the binding constraint.",
    ],
  ],
};

export default seo;
