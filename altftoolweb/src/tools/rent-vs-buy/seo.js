const seo = {
  title: "Rent vs Buy Calculator with Opportunity Cost",
  metaDescription:
    "Compares net buying cost — EMI, registration, maintenance, tax and insurance minus future value — against rent minus your invested corpus.",
  steps: [
    "Press 'Start Calculating', then enter Property Price (₹), Down Payment (%), Interest Rate (%), Loan Tenure (Years), Monthly Rent (₹) and Rent Increase (%/yr).",
    "Fill the rest — Maintenance/Month (₹), Property Tax/Year (₹), Insurance/Year (₹), Furnishing (₹), Registration (%), Investment Return (%/yr) and Security Deposit (₹) — then press 'Calculate'.",
    "Read the 'Buying is Better!' or 'Renting is Better!' banner and the Cost Comparison table down to the NET COST row; 'Reset' clears every field.",
  ],
  intro:
    "Rent vs Buy Calculator settles whether buying a property beats renting it over your loan tenure by comparing two net numbers: total ownership outflow minus the property's future value, against total rent paid minus the corpus you would have built by investing the down payment and every month you saved by renting. It uses the standard reducing-balance EMI formula, compounds property appreciation annually and investment returns monthly, and prices in registration charges, furnishing, maintenance, property tax, insurance, the security deposit and annual rent escalation. The output is a side-by-side cost breakdown and a plain verdict on which option leaves you better off.",
  useCases: [
    "You have been renting a ₹20,000-a-month flat for years and the same building is selling at ₹50 lakh — you want to know whether a 20-year loan at 8.5% actually beats staying put.",
    "You can put down 20% or 35% and want to see how much the larger down payment changes the verdict once the money you did not invest stops earning 10% a year.",
    "Your city's rents are climbing 5% a year while property prices are flat, and you want to find the appreciation rate at which buying finally wins.",
  ],
  benefits: [
    ["Counts the opportunity cost of the down payment", "Your down payment, registration charges and furnishing money are invested at your chosen return instead of vanishing from the comparison."],
    ["Ownership costs beyond the EMI", "Maintenance, property tax, insurance, registration at a percentage of price and one-time furnishing all sit inside the buying total."],
    ["Rent that rises the way real rent does", "Rent escalates by your chosen percentage every twelve months, so a long horizon is not compared against today's rent frozen in place."],
  ],
  faqs: [
    [
      "How is the EMI calculated?",
      "With the standard reducing-balance formula, EMI = P x r x (1+r)^n / ((1+r)^n - 1), where P is the loan amount after your down payment, r is the annual rate divided by 12 and n is the tenure in months. At ₹40 lakh borrowed for 20 years at 8.5%, that works out to roughly ₹34,700 a month.",
    ],
    [
      "What does the verdict actually compare?",
      "Two net figures over the loan tenure. Buying = every rupee paid out (down payment, registration, furnishing, EMIs, maintenance, tax, insurance) minus what the property is worth at the end. Renting = all rent paid minus your refunded deposit minus the investment corpus built from the money you did not sink into the house. The lower net cost wins.",
    ],
    [
      "Why does a higher investment return make renting look better?",
      "Because the down payment, registration and furnishing money is assumed invested from day one and compounded monthly, along with every month's difference between owning cost and rent. Raise the return from 10% to 12% and that corpus grows sharply, cutting the net cost of renting.",
    ],
    [
      "Should I decide purely on this number?",
      "No — treat it as one input. The result is highly sensitive to two assumptions you are guessing at, property appreciation and investment return, and it ignores tax deductions, transaction costs on selling, and the non-financial value of owning. Run a few scenarios and talk to a qualified financial adviser before committing.",
    ],
  ],
};

export default seo;
