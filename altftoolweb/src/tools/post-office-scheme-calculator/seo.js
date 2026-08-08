const seo = {
  title: "Post Office NSC, KVP and MIS Maturity Calculator",
  steps: [
    "Pick a Scheme: 'NSC — compound maturity estimate', 'KVP — maturity estimate' or 'MIS — monthly income estimate'.",
    "Fill in Deposit (₹), the Annual rate (%) from the current India Post quarterly notification, Term (years) and Compounds per year.",
    "The result gives the estimated maturity, or estimated monthly income for MIS, with Deposit and Estimated interest rows; Download saves post-office-scheme-calculator.txt.",
  ],
  intro:
    "The Post Office Scheme Calculator estimates what an NSC, KVP or MIS deposit returns for a rate and term you supply: NSC and KVP use the compound formula A = P(1 + r/n)^(nt), while MIS reports monthly income as principal x rate ÷ 12 with the deposit returned separately at the end. Enter the amount, the annual rate from the current India Post quarterly notification and the term, and you get maturity value, interest earned and a row-by-row breakdown. It is for savers comparing small-savings schemes before walking into a post office. Verify rates, limits and tax treatment officially before you commit.",
  useCases: [
    "You have ₹5 lakh sitting idle and want to see whether NSC's compounded maturity beats the monthly payout you would get from MIS on the same amount.",
    "A retired parent needs predictable monthly income and you want to know what a given deposit actually pays out each month at the current MIS rate.",
    "You are deciding between a bank fixed deposit and KVP, and need both maturity figures on the same deposit and term to compare like with like.",
  ],
  benefits: [
    [
      "MIS is modelled as income, not growth",
      "The monthly scheme shows monthly, annual and full-term interest with the principal listed separately, because MIS pays interest out rather than compounding it.",
    ],
    [
      "Compounding frequency is yours to set",
      "NSC compounds annually by default, but the frequency is an input, so you can test how a different compounding assumption changes the maturity figure.",
    ],
    [
      "No stale rates baked in",
      "The rate is a field you fill from the current quarterly notification, so the estimate cannot silently be built on a figure that changed last quarter.",
    ],
  ],
  faqs: [
    [
      "How is NSC maturity calculated?",
      "With the standard compound interest formula, maturity = P x (1 + r/n)^(nt), where P is the deposit, r the annual rate as a decimal, n the compounding periods per year and t the term in years. NSC interest is conventionally compounded annually and paid out only at maturity, so nothing is credited to you in between.",
    ],
    [
      "How much monthly income does the Monthly Income Scheme pay?",
      "Deposit x annual rate ÷ 12. On a ₹1,00,000 deposit at a 7.4% rate that is about ₹617 a month, with the ₹1,00,000 itself returned at the end of the term — MIS pays interest out, so the principal never grows.",
    ],
    [
      "Where do I find the current rate to enter?",
      "India Post small-savings rates are notified quarterly by the Ministry of Finance and published on the India Post website. The calculator preloads 7.7% for NSC and 7.4% for MIS as example figures only; replace them with the rate in force for your quarter.",
    ],
    [
      "Is the interest taxable?",
      "Interest from these schemes is generally taxable, and the details differ by scheme, by whether TDS applies and by your own slab. NSC deposits may also qualify for a deduction under the relevant section. This tool does not model tax at all — treat its output as a gross estimate and confirm the treatment with a tax professional.",
    ],
  ],
};

export default seo;
