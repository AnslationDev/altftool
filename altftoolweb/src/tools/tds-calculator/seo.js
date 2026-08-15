const seo = {
  title: "TDS Calculator FY 2025-26: 194J, 194C, 194-I, 194Q",
  metaDescription:
    "Compute TDS on Indian payments under 194J, 194C, 194H, 194-I, 194Q and 194T with FY 2025-26 thresholds and the section 206AA no-PAN rate built in.",
  steps: [
    "Pick the TDS section (194J, 194C, 194H, 194-I, 194Q, 194T and more), the payee or payment type, and enter the Payment amount and what you already paid this payee this year.",
    "Set 'PAN furnished by the deductee' to Yes or No — choosing No applies section 206AA, the higher of the section rate or 20%.",
    "Read the 'TDS to deduct' figure with the threshold test, section rate, amount taxed and net payable to the deductee, then press Copy result for the full working.",
  ],
  intro:
    "A TDS calculator tells a deductor how much tax to withhold from an Indian payment: it applies the section rate, checks the payment against the section threshold and applies the higher no-PAN rate under section 206AA. It is built for accountants, small-business payers and freelancers who need the exact figure for a bill under 194J, 194C, 194H, 194-I, 194Q or 194T. Rates and thresholds are the ones in force for FY 2025-26 after the Finance Act 2025 raised most limits with effect from 1 April 2025.",
  useCases: [
    "Check whether a Rs 45,000 consultancy bill under section 194J crosses the Rs 50,000 yearly limit once earlier bills to the same consultant are counted.",
    "Deduct on a Rs 35,000 single contractor bill even though the year total is under Rs 1,00,000, because 194C also has a Rs 30,000 per-bill limit.",
    "Work out the 5% rate on a purchase under 194Q when the seller has not given a PAN, instead of the usual 0.1%.",
  ],
  benefits: [
    ["Threshold test built in", "Enter what you have already paid this year and the tool decides whether TDS starts on this bill."],
    ["206AA handled", "Switches to the higher of the section rate or 20% — or 5% for 194-O and 194Q — when there is no PAN."],
    ["Whole payment vs excess", "Knows that 194Q and 194N tax only the amount above the limit, while other sections tax the full payment."],
  ],
  faqs: [
    [
      "What is the TDS rate on professional fees under section 194J?",
      "10% on professional services, royalty and a director's fee, and 2% on technical services, call-centre work and royalty for the sale of cinematographic films. The threshold from FY 2025-26 is Rs 50,000 in a financial year per category, up from Rs 30,000. A director's sitting fee has no threshold at all.",
    ],
    [
      "What happens if the deductee has not given a PAN?",
      "Section 206AA applies and tax is deducted at the higher of the section rate or 20%. So a 2% commission under 194H becomes 20%, and a 1% contractor payment under 194C becomes 20%. Sections 194-O and 194Q have a lower 206AA floor of 5%.",
    ],
    [
      "Is TDS deducted on the whole payment or only on the amount above the threshold?",
      "On the whole payment for almost every section. If a consultant crosses Rs 50,000 under 194J, the 10% applies to the full amount, not to the Rs 50,000 excess. The exceptions are 194Q and 194N, which deduct only on the amount above Rs 50,00,000 and Rs 1,00,00,000 respectively.",
    ],
    [
      "What are the FY 2025-26 TDS thresholds after the Finance Act 2025?",
      "Bank interest under 194A rose to Rs 50,000, or Rs 1,00,000 for senior citizens; rent under 194-I is now Rs 50,000 a month instead of Rs 2,40,000 a year; commission under 194H and 194G rose to Rs 20,000; dividend under 194 rose to Rs 10,000; and a new section 194T deducts 10% on payments to a partner above Rs 20,000.",
    ],
  ],
};

export default seo;
