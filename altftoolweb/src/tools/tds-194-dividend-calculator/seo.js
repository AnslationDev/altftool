const seo = {
  intro:
    "This calculator works out the TDS a domestic company must deduct on dividend paid to a resident shareholder under Section 194 of the Income-tax Act, 1961 — 10% of the dividend, or 20% under Section 206AA where no valid PAN is on record. It applies the proviso threshold that exempts an individual receiving up to ₹10,000 of dividend in a year by a non-cash mode (₹5,000 up to FY 2024-25, raised by the Finance Act 2025), and checks whether a Form 15G or 15H declaration under Section 197A would actually hold. It is for retail investors reading a dividend credit that came in short, and for company secretaries and accountants running the deduction.",
  useCases: [
    "An investor who received ₹18,000 of dividend from one company and wants to know why only ₹16,200 hit the bank account.",
    "A retired shareholder aged 67 with no taxable income, checking whether Form 15H stops the deduction on a large dividend before the record date.",
    "A company secretary preparing the dividend payout run, separating shareholders below the ₹10,000 threshold from those with no PAN who must be deducted at 20%.",
  ],
  benefits: [
    ["Correct threshold by year", "Uses ₹5,000 up to FY 2024-25 and ₹10,000 from FY 2025-26, and withdraws it for cash payouts and non-individual shareholders."],
    ["15G against 15H tested separately", "Applies the Section 197A(1B) basic-exemption ceiling to Form 15G and correctly leaves Form 15H free of it."],
    ["Order of precedence shown", "Names which rule decided the rate — declaration, Section 197 certificate, threshold, or the standard 10%."],
  ],
  faqs: [
    [
      "What is the TDS rate on dividend under Section 194?",
      "10% of the dividend paid to a resident shareholder by a domestic company. It rises to 20% under Section 206AA if the shareholder has not furnished a valid PAN, and there is no surcharge or cess on TDS for a resident.",
    ],
    [
      "What is the dividend TDS threshold limit?",
      "₹10,000 of aggregate dividend from one company in a financial year, from FY 2025-26 onwards — the Finance Act 2025 raised it from ₹5,000. It applies only to an individual shareholder paid by a mode other than cash, so an HUF, a firm or a company faces deduction on the first rupee.",
    ],
    [
      "Can I file Form 15G or 15H to avoid TDS on dividend?",
      "Yes, if your estimated tax for the whole year is nil. Form 15H is for a resident individual aged 60 or above and has no ceiling on the amount. Form 15G is for anyone else who is not a company or a firm, and the total income covered by it must stay within the basic exemption limit — ₹4,00,000 under the new regime from FY 2025-26.",
    ],
    [
      "Is dividend TDS the final tax on my dividend?",
      "No. Since April 2020 dividend is taxed in the shareholder's hands at their slab rate, and the 10% deducted is only a credit against that liability. It appears in Form 26AS and the AIS, and you claim it when you file — so a 30%-slab investor still owes the balance, while a nil-tax investor gets a refund.",
    ],
  ],
};

export default seo;
