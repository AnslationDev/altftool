const info = {
  "vat-calculator": {
    intro: [
      "A VAT (Value Added Tax) calculator works out the tax portion of a price and separates the net (pre-tax) amount from the gross (tax-inclusive) amount. It handles both directions: adding VAT to a tax-exclusive price, or extracting the VAT already baked into a tax-inclusive price.",
      "It is handy for invoicing, quoting, expense claims and shopping in VAT regions, where you often need to know how much of a total is tax versus the underlying goods or service value.",
    ],
    formula: {
      expression: "Add: VAT = Net × rate/100,  Gross = Net + VAT   |   Remove: Net = Gross ÷ (1 + rate/100),  VAT = Gross − Net",
      where: [
        ["Net", "price excluding VAT"],
        ["Gross", "price including VAT"],
        ["VAT", "the tax amount"],
        ["rate", "VAT percentage"],
      ],
      note: "When removing VAT you must divide by (1 + rate/100), not simply subtract the percentage — subtracting the rate from a gross figure overstates the tax.",
    },
    howToUse: [
      "Choose Add VAT (price is tax-exclusive) or Remove VAT (price already includes tax).",
      "Enter the amount that matches the mode you picked.",
      "Enter the applicable VAT rate.",
      "Read off the VAT amount, net and gross values.",
    ],
    goodToKnow: [
      "VAT rates vary by country and product category — standard, reduced and zero rates all exist.",
      "'Remove VAT' answers the common question: given a tax-inclusive total, how much was actually tax?",
      "VAT is conceptually the same math as India's GST; only the name and rate schedule differ.",
    ],
    faqs: [
      {
        q: "Why can't I just subtract the VAT percentage from an inclusive price?",
        a: "Because the percentage was applied to the smaller net figure, not the larger gross figure. To reverse it you divide the gross by (1 + rate/100). For example, ₹120 at 20% VAT has a net of ₹100, not ₹96.",
      },
      {
        q: "What is the difference between net and gross?",
        a: "Net is the price before VAT (what the seller keeps); gross is the price after VAT is added (what the customer pays). The difference between them is the VAT.",
      },
      {
        q: "Does this calculator use a specific country's rate?",
        a: "No — you enter the rate yourself, so it works for any VAT jurisdiction. Just use the rate that applies to your goods or services.",
      },
    ],
  },

  "tax-calculator": {
    intro: [
      "This Income Tax Calculator gives a quick, indicative estimate of tax under India's New Tax Regime for FY 2024-25 (Assessment Year 2025-26). You enter your annual gross income and taxpayer type, and it applies the slab rates, the Section 87A rebate and the 4% health and education cess.",
      "It is meant for a fast ballpark figure — for example when comparing job offers or planning cash flow — not as a substitute for a full tax computation that accounts for every source of income and deduction.",
    ],
    formula: {
      expression: "Taxable = Gross − Standard deduction;  Tax = slab tax on Taxable;  Total = Tax × 1.04 (adds 4% cess)",
      where: [
        ["Gross", "annual gross income"],
        ["Standard deduction", "₹75,000 for salaried / pensioners, else ₹0"],
        ["Taxable", "income after the standard deduction"],
        ["cess", "4% health & education cess on the tax"],
      ],
      note: "New Regime slabs (FY 2024-25): up to ₹3L nil, ₹3L–7L 5%, ₹7L–10L 10%, ₹10L–12L 15%, ₹12L–15L 20%, above ₹15L 30%. A Section 87A rebate makes tax nil when taxable income is ₹7,00,000 or less. This is an indicative estimate for the New Regime only and excludes surcharge and special-rate income — consult a tax professional before filing.",
    },
    howToUse: [
      "Select whether you are salaried/pensioner (gets the ₹75,000 standard deduction) or other.",
      "Enter your annual gross income.",
      "Read the taxable income, tax before cess, cess and total tax.",
      "Check the effective rate to see tax as a share of your gross income.",
    ],
    goodToKnow: [
      "The New Regime offers lower slab rates but removes most deductions and exemptions available under the Old Regime.",
      "Because of the 87A rebate, a salaried person with gross income up to ₹7.75L can have zero tax.",
      "Effective tax rate is always lower than your top slab rate because slabs are applied progressively.",
      "Surcharge applies at higher income levels (above ₹50L) and is not included here.",
    ],
    faqs: [
      {
        q: "Old Regime or New Regime — which does this use?",
        a: "It uses the New Tax Regime, which is the default regime from FY 2023-24 onward. The Old Regime with its many deductions (80C, HRA, etc.) would need a different calculation.",
      },
      {
        q: "What is the Section 87A rebate?",
        a: "It is a rebate that reduces your tax to zero if your taxable income does not exceed ₹7,00,000 under the New Regime. Cross that threshold and tax is charged on the whole taxable amount per the slabs.",
      },
      {
        q: "Why is my effective rate so much lower than 30%?",
        a: "Slab rates are marginal — only the income within each band is taxed at that band's rate. The first ₹3L is tax-free, the next slice at 5%, and so on, so your blended (effective) rate is much lower than the top slab.",
      },
      {
        q: "Is this figure exact?",
        a: "No. It is an indicative estimate that ignores surcharge, special-rate income (like capital gains), and other adjustments. Use it as a planning guide and confirm with a professional or the official tax portal.",
      },
    ],
  },

  "salary-calculator": {
    intro: [
      "A Salary Calculator converts pay between periods — hourly, daily, weekly, monthly and yearly — so you can compare offers or understand what a rate really works out to over a year.",
      "It annualises whatever figure you enter using your working schedule (hours per week and days per week), then derives every other period from that annual total. This makes it easy to answer questions like 'what does ₹50,000 per month mean per hour?'.",
    ],
    formula: {
      expression: "Annual = amount annualised by period;  Hourly = Annual ÷ (hours/week × 52);  Monthly = Annual ÷ 12",
      where: [
        ["Annual", "total pay over one year"],
        ["hours/week", "scheduled working hours per week"],
        ["days/week", "scheduled working days per week"],
        ["52", "weeks per year used for the conversion"],
      ],
      note: "Daily = Annual ÷ (days/week × 52) and Weekly = Annual ÷ 52. A year is treated as 52 weeks.",
    },
    howToUse: [
      "Enter the pay amount and pick the period it is quoted in (hour, day, week, month or year).",
      "Set your hours per week and days per week (defaults are 40 and 5).",
      "The calculator annualises your input and shows the equivalent hourly, daily, weekly, monthly and yearly pay.",
      "Change the schedule to see how part-time or longer weeks shift the hourly rate.",
    ],
    goodToKnow: [
      "These are gross figures — taxes, PF and other deductions are not applied.",
      "The conversion assumes 52 weeks per year; some employers use 52.14 or count exact working days differently.",
      "Hourly rate depends heavily on hours per week, so two people on the same annual salary can have very different hourly rates.",
    ],
    faqs: [
      {
        q: "Is the result before or after tax?",
        a: "Before tax. This tool converts gross pay across periods; for in-hand pay after deductions use a take-home salary calculator.",
      },
      {
        q: "How many weeks does it assume in a year?",
        a: "52 weeks. Weekly pay is annual ÷ 52, and hourly is annual ÷ (hours per week × 52).",
      },
      {
        q: "Why does changing hours per week change my hourly rate but not my annual salary?",
        a: "If you enter a monthly or yearly figure, the annual total is fixed. Spreading the same annual pay over more or fewer hours simply changes what each hour is worth.",
      },
    ],
  },

  "take-home-salary-calculator": {
    intro: [
      "A Take-Home Salary Calculator estimates your in-hand pay from your annual CTC (Cost to Company) by subtracting common deductions: employee Provident Fund (PF), professional tax and income tax. CTC is the total an employer spends on you, which is always higher than what actually lands in your bank account.",
      "This is a simplified model to give you a realistic monthly figure quickly. Your actual pay slip depends on your specific salary structure, so treat the output as a well-informed estimate.",
    ],
    formula: {
      expression: "Basic = CTC × basic%;  PF = Basic × pf%;  Net annual = CTC − (PF + Professional tax + Income tax);  Net monthly = Net annual ÷ 12",
      where: [
        ["CTC", "annual cost to company"],
        ["Basic", "basic salary, a percentage of CTC"],
        ["PF", "employee provident fund, a percentage of basic"],
        ["Net", "take-home pay after deductions"],
      ],
      note: "This is a simplified estimate. It does not model HRA exemptions, gratuity, employer PF, variable pay or the exact tax computation.",
    },
    howToUse: [
      "Enter your annual CTC.",
      "Adjust the basic pay percentage and employee PF percentage if you know your structure (defaults: 40% and 12%).",
      "Enter professional tax and your estimated annual income tax.",
      "Read the net monthly (in-hand) figure and the deduction breakdown.",
    ],
    goodToKnow: [
      "Employee PF is typically 12% of basic salary; a matching employer contribution is part of CTC but not deducted from your salary.",
      "Professional tax is a small state-level levy, capped at ₹2,500 per year in most states.",
      "The gap between CTC and take-home comes mainly from PF, income tax and non-cash CTC components.",
      "Use an income tax calculator first to get a realistic tax figure to plug in here.",
    ],
    faqs: [
      {
        q: "Why is my take-home so much lower than my CTC?",
        a: "CTC bundles in employer PF, gratuity, insurance and other costs that never reach your bank account, plus your own deductions like PF and income tax. In-hand pay is CTC minus all of these.",
      },
      {
        q: "What basic percentage should I use?",
        a: "Basic is commonly 40–50% of CTC. Check your offer letter or pay slip for the exact figure, since PF and several allowances are calculated from it.",
      },
      {
        q: "Does this include employer PF?",
        a: "No. It only subtracts the employee's own deductions from CTC. Employer PF is part of CTC but is not a deduction from your salary in this simplified model.",
      },
      {
        q: "Is the income tax figure calculated automatically?",
        a: "No — you enter your estimated annual income tax. Use a dedicated income tax calculator to work it out, then plug the number in here for a better take-home estimate.",
      },
    ],
  },

  "currency-converter": {
    intro: [
      "This Currency Converter turns an amount from one currency into another using a bundled, offline rate table with the US Dollar as the base. Because the rates ship with the tool and never call the network, it works instantly and even without a connection.",
      "It is ideal for quick, approximate conversions while travelling, budgeting or shopping internationally. For exact figures — especially large transfers — use a live rate from your bank, since real exchange rates move constantly and include spreads and fees.",
    ],
    formula: {
      expression: "Converted = Amount ÷ rate[from] × rate[to]",
      where: [
        ["Amount", "value in the source currency"],
        ["rate[from]", "units of the source currency per 1 USD"],
        ["rate[to]", "units of the target currency per 1 USD"],
      ],
      note: "The amount is first converted to USD (the base), then to the target currency. Bundled rates are indicative and will drift from the live market.",
    },
    howToUse: [
      "Enter the amount to convert.",
      "Pick the From and To currencies.",
      "Use the swap button to reverse the direction instantly.",
      "Read the converted amount and the exchange rate used.",
    ],
    goodToKnow: [
      "Rates are bundled and offline, so they are approximate and can be out of date.",
      "Banks and card networks add a margin (spread) and sometimes fees, so real conversions cost slightly more than the mid-market rate.",
      "All conversions route through the USD base rate, which is standard practice for cross-rate calculation.",
    ],
    faqs: [
      {
        q: "Are these live exchange rates?",
        a: "No. The rates are bundled for offline use and are indicative only. For an exact, current rate check your bank, a card provider, or a live market source.",
      },
      {
        q: "Why is the amount I actually receive different?",
        a: "Real-world conversions include the provider's margin over the mid-market rate plus any fixed fees, so you typically get slightly less than a raw rate calculation suggests.",
      },
      {
        q: "How is a rate like EUR to INR worked out?",
        a: "Both currencies are quoted against the USD base. The tool converts your amount to USD first, then from USD to the target currency, which is how cross rates are normally derived.",
      },
    ],
  },

  "budget-calculator": {
    intro: [
      "A Budget Calculator based on the popular 50/30/20 rule splits your monthly after-tax income into three buckets: 50% for needs, 30% for wants and 20% for savings and debt repayment. It is a simple framework for turning a paycheck into a plan.",
      "The percentages are adjustable, so you can tailor the split to your own goals — for example dialing up savings during a debt payoff or a big savings push — while keeping the total at 100%.",
    ],
    formula: {
      expression: "Needs = Income × 50%,  Wants = Income × 30%,  Savings = Income × 20%",
      where: [
        ["Income", "monthly after-tax (take-home) income"],
        ["Needs", "essentials: rent, groceries, utilities, minimum debt payments"],
        ["Wants", "lifestyle: dining out, subscriptions, entertainment"],
        ["Savings", "savings, investments and extra debt repayment"],
      ],
      note: "The percentages are editable; keep them summing to 100% for an accurate split.",
    },
    howToUse: [
      "Enter your monthly after-tax income.",
      "Keep the default 50/30/20 split or edit the three percentages to match your goals.",
      "Make sure the percentages add up to 100%.",
      "Read the rupee amount allocated to needs, wants and savings.",
    ],
    goodToKnow: [
      "'Needs' are essentials you cannot easily avoid; 'wants' are discretionary lifestyle spending.",
      "The rule uses after-tax (take-home) income, not gross salary.",
      "If your needs exceed 50%, that is common in high-cost cities — trim wants or savings temporarily rather than abandoning the plan.",
      "The 50/30/20 split is a starting guideline, not a strict rule; adjust it to your situation.",
    ],
    faqs: [
      {
        q: "Should I use gross or net income?",
        a: "Net (after-tax, take-home) income. The 50/30/20 rule is designed around the money that actually reaches your account each month.",
      },
      {
        q: "What counts as a need versus a want?",
        a: "Needs are essentials you must pay to live and work — housing, utilities, groceries, transport and minimum debt payments. Wants are things you enjoy but could cut, like dining out, streaming services and holidays.",
      },
      {
        q: "Can I change the percentages?",
        a: "Yes. The split is fully editable — for instance 60/20/20 if your cost of living is high, or 50/20/30 to save more aggressively. Just keep the three numbers adding up to 100%.",
      },
    ],
  },

  "gst-calculator": {
    intro: [
      "A GST (Goods and Services Tax) calculator separates the tax portion of a price from the base value. It can add GST to a tax-exclusive amount or extract the GST already included in a tax-inclusive amount, showing the net value, the GST and the gross total.",
      "It is useful for billing, filing, and everyday shopping in India, where prices may be quoted with or without GST and you often need to know exactly how much tax is involved.",
    ],
    formula: {
      expression: "Add: GST = Net × rate/100, Gross = Net + GST   |   Remove: Net = Gross ÷ (1 + rate/100), GST = Gross − Net",
      where: [
        ["Net", "price excluding GST"],
        ["Gross", "price including GST"],
        ["GST", "the tax amount"],
        ["rate", "GST slab percentage (e.g. 5, 12, 18, 28)"],
      ],
      note: "To remove GST from an inclusive price you divide by (1 + rate/100); simply subtracting the percentage overstates the tax.",
    },
    howToUse: [
      "Choose Add GST (amount excludes tax) or Remove GST (amount already includes tax).",
      "Enter the amount for the mode you selected.",
      "Enter the GST rate for your product or service.",
      "Read the GST amount, net and gross values.",
    ],
    goodToKnow: [
      "Common Indian GST slabs are 0%, 5%, 12%, 18% and 28%.",
      "For intra-state sales GST splits into CGST and SGST (half each); inter-state sales use IGST — the total is the same.",
      "GST is the Indian equivalent of VAT; the underlying math is identical.",
    ],
    faqs: [
      {
        q: "How do I remove GST from a total that already includes it?",
        a: "Divide the inclusive total by (1 + rate/100). For 18% GST, divide by 1.18 to get the net; the difference is the GST. A ₹118 inclusive price has a ₹100 net and ₹18 GST.",
      },
      {
        q: "What are the standard GST rates in India?",
        a: "The main slabs are 0%, 5%, 12%, 18% and 28%, with the rate depending on the goods or service category.",
      },
      {
        q: "What is the difference between CGST, SGST and IGST?",
        a: "For sales within a state, GST is split equally into CGST (central) and SGST (state). For inter-state sales a single IGST is charged. The total tax rate is the same either way.",
      },
    ],
  },

  "discount-calculator": {
    intro: [
      "A Discount Calculator works out how much you save and the final price when a percentage discount is applied. Enter the original price and the discount percentage to instantly see the amount saved and what you actually pay.",
      "It is handy during sales and clearance shopping to check whether a deal is as good as advertised and to compare offers quickly.",
    ],
    formula: {
      expression: "Saved = Price × discount/100,  Final = Price − Saved",
      where: [
        ["Price", "original (list) price"],
        ["discount", "discount percentage"],
        ["Saved", "amount you save"],
        ["Final", "price you actually pay"],
      ],
    },
    howToUse: [
      "Enter the original price.",
      "Enter the discount percentage.",
      "Read the final price and the amount saved.",
      "Compare across offers to find the best deal.",
    ],
    goodToKnow: [
      "A final price of ₹X after a d% discount means the original was X ÷ (1 − d/100).",
      "Stacked discounts multiply, they don't add: 20% then 10% off is 28% total, not 30%.",
      "Taxes may be applied before or after the discount depending on the retailer, which changes the final amount.",
    ],
    faqs: [
      {
        q: "How do I find the original price from a sale price?",
        a: "Divide the sale price by (1 − discount/100). For example, ₹750 after a 25% discount implies an original price of 750 ÷ 0.75 = ₹1,000.",
      },
      {
        q: "How do two stacked discounts combine?",
        a: "Apply them one after another. 20% off then an extra 10% off leaves 0.8 × 0.9 = 0.72 of the price, i.e. a 28% total discount — not 30%.",
      },
      {
        q: "Does the calculator include tax?",
        a: "No, it works on the price you enter. If tax applies, add or remove it separately depending on whether your price is inclusive or exclusive of tax.",
      },
    ],
  },

  "tip-calculator": {
    intro: [
      "A Tip Calculator computes the gratuity on a bill and, optionally, splits the total across a group. Enter the bill, choose a tip percentage and the number of people to see the tip amount, the grand total and what each person owes.",
      "It removes the awkward mental math at the end of a meal and makes splitting fair, including the tip-per-person amount.",
    ],
    formula: {
      expression: "Tip = Bill × tip%/100;  Total = Bill + Tip;  Per person = Total ÷ people",
      where: [
        ["Bill", "pre-tip bill amount"],
        ["tip%", "chosen tip percentage"],
        ["Total", "bill plus tip"],
        ["people", "number of people splitting"],
      ],
    },
    howToUse: [
      "Enter the bill amount.",
      "Pick a preset tip percentage or type a custom one.",
      "Set the number of people sharing the bill.",
      "Read the tip amount, total and per-person share.",
    ],
    goodToKnow: [
      "Tipping norms vary widely by country — customary in the US, optional or uncommon elsewhere.",
      "Decide whether to tip on the pre-tax or post-tax amount; tipping on pre-tax is common.",
      "Some restaurants add a service charge already, in which case an extra tip may be unnecessary.",
    ],
    faqs: [
      {
        q: "Should I tip on the amount before or after tax?",
        a: "Either is acceptable, but tipping on the pre-tax bill is common and slightly cheaper. This calculator applies the tip to the bill amount you enter.",
      },
      {
        q: "How is the per-person amount calculated?",
        a: "The tip is added to the bill to get the total, and the total is divided equally by the number of people. It also shows the tip-per-person separately.",
      },
      {
        q: "What is a standard tip percentage?",
        a: "In the US, 15–20% is typical for good service. In many other countries tipping is optional or a small round-up, so use the custom field to match local norms.",
      },
    ],
  },

  "unit-price-calculator": {
    intro: [
      "A Unit Price Calculator compares two products by their price per unit so you can see which is genuinely the better value, even when pack sizes and prices differ. It divides each product's price by its quantity and highlights the cheaper option.",
      "This is the classic way to beat 'bigger pack looks cheaper' marketing — comparing per-unit cost reveals the real deal regardless of packaging.",
    ],
    formula: {
      expression: "Unit price = Price ÷ Quantity;  compare the two unit prices",
      where: [
        ["Price", "the pack price"],
        ["Quantity", "amount in the pack (units, ml, g, etc.)"],
        ["Unit price", "cost of one unit"],
      ],
      note: "Savings % = |unitA − unitB| ÷ the larger unit price × 100.",
    },
    howToUse: [
      "Enter the price and quantity for Product A.",
      "Enter the price and quantity for Product B.",
      "Use the same unit for both quantities so the comparison is fair.",
      "Read which product is cheaper per unit and by how much.",
    ],
    goodToKnow: [
      "Always compare in the same unit — convert one product if pack sizes use different units.",
      "The lowest unit price isn't always best if you'll waste a larger pack before using it.",
      "Loyalty prices, bulk discounts and coupons can flip which option is cheapest.",
    ],
    faqs: [
      {
        q: "What is unit price?",
        a: "It's the cost of a single unit of measure — per gram, millilitre, piece, etc. Dividing pack price by pack quantity lets you compare products of different sizes on equal terms.",
      },
      {
        q: "How is the savings percentage calculated?",
        a: "It's the difference between the two unit prices divided by the higher unit price, expressed as a percentage — so it tells you how much cheaper the better option is per unit.",
      },
      {
        q: "Is the cheapest unit price always the best buy?",
        a: "Usually, but not always. A larger pack with a lower unit price is only better value if you actually use it before it expires or spoils.",
      },
    ],
  },
};

export default info;
