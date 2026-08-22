const seo = {
  title: "Section 44ADA Calculator: 50% Presumptive Income",
  steps: [
    "Enter Digital gross receipts (INR) and Cash gross receipts (INR), then pick the new or old tax regime and your age.",
    "Add any Chapter VI-A deductions, and the actual profit from your books if you want the section 44AB(d) audit warning.",
    "Read the presumptive income at 50%, the ceiling that applies, total tax and the advance tax due by 15 March, then press Copy result.",
  ],
  intro:
    "Section 44ADA lets an eligible professional declare half of gross receipts as taxable profit and skip formal books of account, and this calculator applies that 50% rate along with the receipts ceiling and the cash-receipts test that decides which ceiling you get. The limit is Rs 50,00,000, or Rs 75,00,000 where cash receipts stay within 5% of total receipts, a proviso inserted by the Finance Act 2023. It also prices the tax under the new or old regime and flags when declaring a lower profit would trigger a section 44AB audit.",
  useCases: [
    "A freelance software consultant billing Rs 72,00,000 almost entirely by bank transfer, checking that the higher Rs 75 lakh ceiling still applies.",
    "A doctor with Rs 5,00,000 of cash fees on Rs 75,00,000 of receipts finding out that the 5% cash test pushes them back to the Rs 50 lakh limit.",
    "Comparing the tax on presumptive income against the tax on the real profit shown by the books before deciding whether an audit is worth it.",
  ],
  benefits: [
    ["Both ceilings tested", "Computes the cash share and tells you which of the two limits your year falls under."],
    ["Regime comparison", "Prices the same presumptive income under the default and old regimes, including the section 87A rebate."],
    ["Audit warning", "Flags section 44AB(d) when profit below 50% is declared and income exceeds the exemption limit."],
  ],
  faqs: [
    [
      "What is the turnover limit for section 44ADA?",
      "Gross receipts must not exceed Rs 50,00,000, which rises to Rs 75,00,000 if cash receipts during the year are 5% or less of total gross receipts. Receipts by cheque or draft that are not account payee count as cash for that 5% test.",
    ],
    [
      "Who can opt for presumptive taxation under 44ADA?",
      "A resident individual or a resident partnership firm carrying on a profession listed in section 44AA(1) — legal, medical, engineering, architectural, accountancy, technical consultancy, interior decoration, and notified professions such as company secretary, film artist, authorised representative and information technology. An LLP or a company cannot use it.",
    ],
    [
      "Can I declare less than 50% of receipts under 44ADA?",
      "Yes, but section 44ADA(4) then requires you to maintain books under section 44AA and get them audited under section 44AB(d), and only where your total income exceeds the basic exemption limit. If the audit fee outweighs the tax saved, declaring the 50% figure is usually simpler.",
    ],
    [
      "When is advance tax due under presumptive taxation?",
      "Section 211(1)(b) allows a presumptive assessee to pay the entire advance tax liability in one instalment by 15 March of the financial year, instead of the usual four instalments. Advance tax applies only once the liability reaches Rs 10,000 under section 208.",
    ],
  ],
};

export default seo;
