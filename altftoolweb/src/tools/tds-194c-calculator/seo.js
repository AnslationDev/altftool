const seo = {
  intro:
    "This calculator applies section 194C of the Income-tax Act to a contractor bill: 1% where the payee is an individual or HUF and 2% for every other payee, tested against the Rs 30,000 single-payment ceiling and the Rs 1,00,000 financial-year aggregate ceiling in section 194C(5). It also handles separately billed material under Explanation (iv) to the section, the small goods-carriage exemption in section 194C(6), and the 20% no-PAN rate under section 206AA. Built for accounts payable teams and small business owners settling labour, transport, catering and job-work bills.",
  useCases: [
    "A company paying a proprietor Rs 60,000 for civil repair work needs the 1% deduction and the net cheque figure",
    "A finance team whose running total with a transport vendor has just crossed Rs 1,00,000 needs the catch-up deduction on earlier bills",
    "A manufacturer whose job worker bills material separately wants TDS only on the labour portion of the invoice",
  ],
  benefits: [
    ["Both threshold tests", "Checks the Rs 30,000 single bill and the Rs 1,00,000 yearly aggregate together."],
    ["Material carve-out", "Excludes separately shown material value so you do not over-deduct on job work."],
    ["Transporter rule included", "Applies the section 194C(6) nil deduction when the declaration and PAN are on file."],
  ],
  faqs: [
    [
      "What is the TDS rate for contractors under section 194C?",
      "1% when the contractor is an individual or a Hindu Undivided Family, and 2% when the contractor is a company, firm, LLP, AOP, BOI, society or trust. No surcharge or health and education cess is added for resident payees.",
    ],
    [
      "What is the threshold limit for TDS under 194C?",
      "Two limits run together: no deduction while a single sum stays at or below Rs 30,000, but deduction becomes compulsory once the aggregate of such sums to that contractor exceeds Rs 1,00,000 in the financial year. Breaching either one triggers deduction, and when the annual limit is crossed the catch-up applies to the earlier bills as well.",
    ],
    [
      "Is TDS deducted on the GST portion of a contractor invoice?",
      "No. Where GST is shown separately in the invoice, TDS under Chapter XVII-B is deducted on the amount excluding that GST, as clarified by CBDT Circular 23/2017. If the invoice shows only a consolidated figure, tax is deducted on the whole amount.",
    ],
    [
      "When is no TDS deducted on payments to a transporter?",
      "Under section 194C(6) no tax is deducted from a contractor in the business of plying, hiring or leasing goods carriages who owns ten or fewer goods carriages at any time during the year and furnishes a declaration to that effect along with a PAN. The payment is still reported in the quarterly Form 26Q with the appropriate remark. Without a PAN the exemption fails and the payment falls back to the ordinary 194C thresholds at the 20% no-PAN rate under section 206AA once those thresholds are breached.",
    ],
  ],
};

export default seo;
