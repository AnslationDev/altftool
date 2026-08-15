const seo = {
  title: "Savings Goal Tracker - Exact Date You Hit Your Target",
  metaDescription:
    "Enter target, balance and monthly saving to get the date you hit the goal, 25/50/75% milestone dates, and the monthly top-up a deadline needs.",
  steps: [
    "Enter your Savings target (₹), Saved so far (₹), Adding each month (₹) and the Return on the balance (% per year), with an optional Deadline date to test.",
    "Set the Counting from date — there is no Calculate button; the countdown, progress bar and 25/50/75% Milestone dates table update as you type.",
    "Read the 'You hit the target on' date and, if you set a deadline, the 'Monthly amount that lands on time' in Against your deadline, then press Copy result.",
  ],
  intro:
    "This tracker answers one question exactly: on what date does a savings goal get met? It solves the future-value-of-an-annuity equation, FV = A(1+i)^n + C[((1+i)^n − 1)/i], for n — the number of months — using your current balance A, monthly contribution C and monthly return i, then converts n into a calendar date and marks the 25%, 50% and 75% points. Add a deadline and it works backwards to the monthly amount that lands on that date.",
  useCases: [
    "Checking whether ₹15,000 a month plus a ₹2 lakh head start reaches a ₹10 lakh target before a specific wedding date.",
    "Seeing how many months earlier the goal arrives if the contribution goes up by ₹5,000.",
    "Turning a vague 'save for a laptop' plan into a dated milestone you can put in a calendar.",
  ],
  benefits: [
    ["An actual date, not a vague 'someday'", "The month count is solved in closed form and converted to a calendar date with leap years handled."],
    ["Growth shown separately", "The split between what you contribute and what the return adds makes the value of starting early visible."],
    ["Deadline reverse-solve", "Give a target date and it returns the monthly amount required and the extra you need to find."],
  ],
  faqs: [
    [
      "How long will it take to save a specific amount?",
      "Solve n = ln[(target + C/i) ÷ (A + C/i)] ÷ ln(1 + i), where A is what you have, C the monthly deposit and i the monthly return. With ₹2 lakh saved, ₹15,000 a month and a 7% annual return, a ₹10 lakh goal takes 44 months — about three years and eight months.",
    ],
    [
      "What return should I assume on a savings goal?",
      "Match the assumption to the horizon. For a goal under three years, use the rate on a savings account, recurring deposit or liquid fund rather than an equity assumption, because a market fall right before the goal date cannot be recovered from. Enter 0% if the money sits in a current account.",
    ],
    [
      "Is it better to save more each month or for longer?",
      "For short goals the contribution does almost all the work; compounding needs years to matter. Over 44 months in the example above, contributions supply ₹6.6 lakh of the ₹8 lakh gap and growth only ₹1.4 lakh, so raising the monthly amount moves the date far more than raising the assumed return.",
    ],
    [
      "Does the tracker save my numbers?",
      "No. Everything runs in your browser and nothing is transmitted or stored, so refreshing the page clears it. Use the copy button to keep a record of the plan.",
    ],
  ],
};

export default seo;
