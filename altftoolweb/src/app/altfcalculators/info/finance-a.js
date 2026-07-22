const info = {
  "loan-emi-calculator": {
    intro: [
      "An EMI (Equated Monthly Instalment) calculator works out the fixed amount you repay every month on a loan. Each instalment covers part of the interest for that month plus part of the principal, so the outstanding balance falls steadily to zero by the end of the term.",
      "It is the quickest way to check whether a loan fits your budget before you borrow, and to compare offers with different amounts, rates and tenures on a like-for-like monthly basis.",
    ],
    formula: {
      expression: "EMI = P × i × (1 + i)^n / ((1 + i)^n − 1)",
      where: [
        ["P", "loan principal (amount borrowed)"],
        ["i", "monthly interest rate = annual rate ÷ 12 ÷ 100"],
        ["n", "number of monthly instalments (tenure in months)"],
      ],
      note: "When the interest rate is 0%, the EMI is simply P ÷ n.",
    },
    howToUse: [
      "Enter the loan amount you plan to borrow.",
      "Enter the annual interest rate quoted by the lender.",
      "Set the tenure and switch between months and years.",
      "Read off the monthly EMI, total interest and total payable.",
    ],
    goodToKnow: [
      "A longer tenure lowers the EMI but increases the total interest you pay.",
      "The interest portion is highest in the early instalments and shrinks over time.",
      "This assumes a fixed rate; on a floating-rate loan the EMI or tenure can change if the rate moves.",
    ],
    faqs: [
      { q: "What does EMI stand for?", a: "Equated Monthly Instalment — a fixed monthly payment that repays both interest and principal over the loan term." },
      { q: "Does a higher down payment reduce the EMI?", a: "Yes. Borrowing less means a smaller principal, which directly lowers both the EMI and the total interest." },
      { q: "Is the EMI the same every month?", a: "On a fixed-rate loan, yes. On a floating-rate loan the rate can change, which usually adjusts either the EMI or the number of instalments." },
      { q: "How can I reduce the total interest?", a: "Choose a shorter tenure, negotiate a lower rate, or make prepayments — each reduces the interest you pay over the life of the loan." },
    ],
  },

  "home-loan-calculator": {
    intro: [
      "A home loan calculator estimates the monthly EMI on a housing loan and shows how much of your repayment goes towards interest over the full term. Because home loans are large and long, even a small change in rate or tenure has a big effect on the total cost.",
      "Use it to size a loan you can comfortably afford, to compare lenders, and to see the trade-off between a lower monthly payment and a lower total interest bill.",
    ],
    formula: {
      expression: "EMI = P × i × (1 + i)^n / ((1 + i)^n − 1)",
      where: [
        ["P", "loan amount (principal)"],
        ["i", "monthly rate = annual rate ÷ 12 ÷ 100"],
        ["n", "tenure in months"],
      ],
      note: "Total interest = EMI × n − P. Total payable = EMI × n.",
    },
    howToUse: [
      "Enter the home loan amount.",
      "Enter the annual interest rate offered by your bank.",
      "Choose the tenure in years or months.",
      "Review the EMI, total interest and total amount payable.",
    ],
    goodToKnow: [
      "Home loan tenures often run 15-30 years, so the total interest can approach or exceed the principal.",
      "Lenders usually cap the EMI at around 40-50% of your monthly income.",
      "Prepaying even a few instalments a year can shorten the tenure and cut interest significantly.",
      "Processing fees, stamp duty and insurance are extra costs not included in the EMI.",
    ],
    faqs: [
      { q: "How much home loan can I get?", a: "Lenders assess your income, existing obligations and the property value. As a rule of thumb, they keep your total EMIs within about 40-50% of your net monthly income." },
      { q: "Should I pick a longer or shorter tenure?", a: "A longer tenure gives a smaller, more affordable EMI but a much larger total interest cost. A shorter tenure costs more per month but far less overall." },
      { q: "Does the calculator include taxes and insurance?", a: "No. It shows only principal and interest. Property tax, home insurance and registration charges are separate — use the Mortgage Calculator to fold taxes and insurance into the monthly figure." },
      { q: "What happens if interest rates change?", a: "Most home loans are floating-rate. If the rate rises or falls, the lender typically keeps the EMI fixed and adjusts the tenure, or keeps the tenure and adjusts the EMI." },
    ],
  },

  "personal-loan-calculator": {
    intro: [
      "A personal loan calculator estimates the EMI on an unsecured loan taken for needs such as a wedding, travel, medical bills or debt consolidation. Personal loans are not backed by collateral, so they carry higher interest rates and shorter tenures than home or car loans.",
      "It helps you check the monthly outgo and the true cost of borrowing before you commit, and to compare offers from different lenders.",
    ],
    formula: {
      expression: "EMI = P × i × (1 + i)^n / ((1 + i)^n − 1)",
      where: [
        ["P", "loan amount (principal)"],
        ["i", "monthly rate = annual rate ÷ 12 ÷ 100"],
        ["n", "tenure in months"],
      ],
      note: "Total interest = EMI × n − P.",
    },
    howToUse: [
      "Enter the personal loan amount you need.",
      "Enter the annual interest rate.",
      "Set the tenure in months or years.",
      "Check the EMI, total interest and total repayment.",
    ],
    goodToKnow: [
      "Personal loan rates are typically higher (often 11-24% a year) because they are unsecured.",
      "Tenures usually range from 12 to 60 months.",
      "Many lenders charge a processing fee (often 1-3% of the amount) that is not part of the EMI.",
      "Watch for prepayment or foreclosure charges before planning to close the loan early.",
    ],
    faqs: [
      { q: "Why is a personal loan rate higher than a home loan rate?", a: "It is unsecured — there is no asset the lender can claim if you default — so the lender prices in more risk with a higher interest rate." },
      { q: "Can I prepay a personal loan?", a: "Usually yes, though some lenders apply a foreclosure fee. Prepaying reduces the outstanding principal and the remaining interest." },
      { q: "What decides the interest rate I am offered?", a: "Mainly your credit score, income, employer and existing debts. A stronger profile generally earns a lower rate." },
      { q: "Does the EMI include the processing fee?", a: "No. The processing fee is a one-time charge, often deducted upfront, and is separate from the monthly EMI shown here." },
    ],
  },

  "car-loan-calculator": {
    intro: [
      "A car loan calculator works out the monthly EMI on a vehicle loan after your down payment. You borrow the on-road price minus whatever you pay upfront, and repay it in fixed monthly instalments over the chosen term.",
      "It lets you see how the down payment, interest rate and tenure change the monthly payment and the total interest, so you can structure the deal to fit your budget.",
    ],
    formula: {
      expression: "EMI = L × i × (1 + i)^n / ((1 + i)^n − 1),  L = price − down payment",
      where: [
        ["L", "loan amount = on-road price − down payment"],
        ["i", "monthly rate = annual rate ÷ 12 ÷ 100"],
        ["n", "tenure in months"],
      ],
      note: "Total interest = EMI × n − L.",
    },
    howToUse: [
      "Enter the on-road price of the car.",
      "Enter your down payment — the loan is the difference.",
      "Enter the annual interest rate and the tenure.",
      "Read the loan amount, EMI, total interest and total payable.",
    ],
    goodToKnow: [
      "A larger down payment lowers both the EMI and the total interest.",
      "Car loan tenures usually run 1-7 years; longer terms mean more interest overall.",
      "On-road price includes ex-showroom price, registration, road tax and insurance.",
      "Cars depreciate, so a very long loan can leave you owing more than the car is worth.",
    ],
    faqs: [
      { q: "How much down payment should I make?", a: "Lenders often finance up to 80-90% of the on-road price. A bigger down payment reduces your loan, EMI and total interest, and can help you secure approval." },
      { q: "Is the on-road price the same as the ex-showroom price?", a: "No. On-road price adds registration, road tax, insurance and any handling charges on top of the ex-showroom price." },
      { q: "Can I foreclose a car loan early?", a: "Usually yes. Prepaying reduces the remaining interest, but check whether the lender charges a foreclosure fee." },
      { q: "Does a longer tenure make the car cheaper?", a: "No. It only lowers the monthly EMI. The total interest — and therefore the overall cost — rises with a longer tenure." },
    ],
  },

  "mortgage-calculator": {
    intro: [
      "A mortgage calculator estimates the full monthly cost of owning a home, not just the loan repayment. It adds property tax and home insurance to the principal-and-interest instalment so you see the real amount leaving your account each month.",
      "This all-in view is useful when budgeting, because taxes and insurance can add a meaningful sum on top of the loan EMI.",
    ],
    formula: {
      expression: "Monthly = P&I + (annual tax + annual insurance) ÷ 12",
      where: [
        ["P&I", "principal & interest EMI on (price − down payment)"],
        ["annual tax", "home price × property tax rate"],
        ["annual insurance", "yearly home insurance premium"],
      ],
      note: "P&I uses the standard EMI formula: L × i × (1+i)^n / ((1+i)^n − 1), with L = price − down payment, i = annual rate ÷ 12 ÷ 100, n = term in months.",
    },
    howToUse: [
      "Enter the home price and your down payment.",
      "Enter the interest rate and loan term in years.",
      "Optionally add the property tax rate and annual insurance premium.",
      "See the principal & interest, taxes & insurance and total monthly payment.",
    ],
    goodToKnow: [
      "Property tax is entered as a yearly percentage of the home's value and is spread across 12 months.",
      "Home insurance is entered as a yearly amount and likewise divided by 12.",
      "The principal & interest portion stays fixed on a fixed-rate loan, but taxes and insurance can rise over time.",
      "This estimate excludes maintenance, HOA/society fees and one-time closing costs.",
    ],
    faqs: [
      { q: "What is included in the total monthly payment?", a: "The principal-and-interest EMI plus one-twelfth of the yearly property tax and one-twelfth of the yearly home insurance." },
      { q: "How is property tax calculated here?", a: "It is taken as a percentage of the home price per year. That annual amount is divided by 12 and added to each monthly payment." },
      { q: "Why is my payment higher than a plain EMI calculator shows?", a: "Because this tool bundles taxes and insurance into the monthly figure, whereas a basic EMI calculator shows only principal and interest." },
      { q: "Can I leave tax and insurance blank?", a: "Yes. Set them to zero to see only the principal-and-interest payment." },
    ],
  },

  "mortgage-payoff-calculator": {
    intro: [
      "A mortgage payoff calculator shows how much faster you can clear your loan, and how much interest you save, by paying a little extra each month. It simulates the loan month by month, applying every rupee above the interest due straight to the principal.",
      "Because interest is charged on the outstanding balance, cutting the principal early has a compounding effect — small extra payments can save years of instalments and a large amount of interest.",
    ],
    formula: {
      expression: "Each month: interest = balance × i,  principal = payment − interest,  balance = balance − principal",
      where: [
        ["balance", "current outstanding loan amount"],
        ["i", "monthly rate = annual rate ÷ 12 ÷ 100"],
        ["payment", "monthly payment (base + any extra)"],
      ],
      note: "The loan is repaid when the balance reaches zero. If the payment is less than or equal to the monthly interest, the balance never reduces.",
    },
    howToUse: [
      "Enter your current outstanding balance and interest rate.",
      "Enter your current monthly payment.",
      "Enter the extra amount you could add each month.",
      "Compare the payoff time and total interest with and without the extra payment.",
    ],
    goodToKnow: [
      "Extra payments go entirely towards principal, so they shorten the loan and cut future interest.",
      "The earlier in the loan you start paying extra, the greater the saving.",
      "If your payment barely covers the interest, the balance shrinks very slowly — raising the payment has an outsized effect.",
      "Check that your lender allows penalty-free prepayment before relying on these savings.",
    ],
    faqs: [
      { q: "How does paying extra save interest?", a: "Interest is charged on the remaining balance. Every extra rupee lowers that balance immediately, so less interest accrues in all the months that follow." },
      { q: "Why does it say the balance will never reduce?", a: "If your monthly payment is less than or equal to the interest charged that month, nothing is left to pay down the principal, so the loan can never be repaid at that payment level." },
      { q: "Is it better to pay extra monthly or make one lump sum?", a: "Both help. Regular extra payments start reducing principal sooner, while a lump sum makes a large immediate dent. Earlier is always better because of compounding." },
      { q: "Does this account for rate changes?", a: "No. It assumes a fixed interest rate for the whole payoff period. On a floating-rate loan the actual timeline will shift if the rate changes." },
    ],
  },

  "loan-calculator": {
    intro: [
      "A loan calculator computes the fixed monthly payment on any amortising loan and breaks down how each instalment splits between interest and principal. It works for personal, education, business or any equal-instalment loan.",
      "Alongside the summary it shows an amortization schedule for the first year, so you can see exactly how your balance falls month by month.",
    ],
    formula: {
      expression: "EMI = P × i × (1 + i)^n / ((1 + i)^n − 1)",
      where: [
        ["P", "loan amount (principal)"],
        ["i", "monthly rate = annual rate ÷ 12 ÷ 100"],
        ["n", "term in months = years × 12"],
      ],
      note: "Each month: interest = balance × i, principal = EMI − interest, and the balance falls until it reaches zero.",
    },
    howToUse: [
      "Enter the loan amount.",
      "Enter the annual interest rate.",
      "Enter the term in years.",
      "Review the monthly payment, totals and the first 12 rows of the amortization schedule.",
    ],
    goodToKnow: [
      "Early instalments are mostly interest; later ones are mostly principal.",
      "Total interest equals the monthly payment times the number of months, minus the amount borrowed.",
      "A shorter term raises the monthly payment but lowers total interest.",
      "The schedule assumes payments are made on time and the rate does not change.",
    ],
    faqs: [
      { q: "What is an amortization schedule?", a: "A month-by-month table showing how much of each payment goes to interest, how much to principal, and the balance remaining after the payment." },
      { q: "Why is so much of my early payment interest?", a: "Interest is charged on the outstanding balance, which is highest at the start. As the balance falls, the interest share shrinks and the principal share grows." },
      { q: "How do I lower the total interest?", a: "Borrow less, secure a lower rate, choose a shorter term, or make prepayments — each reduces the interest paid over the loan's life." },
      { q: "Does this work for any loan type?", a: "Yes, for any loan repaid in equal monthly instalments at a fixed rate. For loans with taxes and insurance or extra payments, use the dedicated mortgage tools." },
    ],
  },
};

export default info;
