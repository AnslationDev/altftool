// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "mortgage-affordability-calculator",
  "title": "Mortgage Affordability Calculator",
  "description": "Calculate your mortgage affordability based on income and loan details.",
  "badge": "Finance",
  "category": [
    "Finance"
  ],
  "icon": "mortgage",
  "iconColor": "text-teal-600",
  "fields": [
    {
      "key": "income",
      "label": "Annual Income",
      "type": "number",
      "default": "50000",
      "suffix": "$"
    },
    {
      "key": "loanamount",
      "label": "Desired Loan Amount",
      "type": "number",
      "default": "300000",
      "suffix": "$"
    },
    {
      "key": "interestrate",
      "label": "Interest Rate (%)",
      "type": "number",
      "default": "4.5"
    }
  ],
  "presets": [
    {
      "label": "Example",
      "values": {
        "income": "50000",
        "loanAmount": "300000",
        "interestRate": "4.5"
      }
    }
  ],
  "note": "This calculator provides a rough estimate and does not account for all financial factors."
},
  compute: (values, mode) => { const income = values.income; const loanAmount = values.loanAmount; const interestRate = values.interestRate / 100; if (income <= 0 || loanAmount <= 0 || isNaN(interestRate)) return { result: 'Invalid input', caption: 'Please enter valid numbers.' }; const monthlyIncome = income / 12; const monthlyInterestRate = interestRate / 12; const maxLoan = monthlyIncome * 36 * (1 - Math.pow(1 + monthlyInterestRate, -36)) / monthlyInterestRate; return { result: `Max Loan Amount: $${maxLoan.toFixed(0)}`, caption: 'Based on your income and interest rate.', rows: [['Desired Loan Amount', `$${loanAmount}`], ['Income', `$${income}`], ['Interest Rate', `${interestRate * 100}%`]] }; },
};

export default spec;
