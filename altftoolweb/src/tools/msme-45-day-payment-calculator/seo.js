const seo = {
  title: "MSME 45-Day Payment Rule: s.16 Interest, 43B(h)",
  metaDescription:
    "Enter the invoice and payment dates: get the MSMED s.15 due date (15 or 45 days), s.16 interest at 3x the RBI bank rate, and the 43B(h) deduction year.",
  steps: [
    "Pick \"What is the supplier?\" — a medium enterprise sits outside ss.15, 16 and 43B(h) — then enter the invoice / acceptance date and the invoice amount payable.",
    "Say whether a payment term is agreed in writing, set the agreed credit period in days (capped at 45), the actual or planned payment date, the RBI notified bank rate and your marginal tax rate.",
    "Read the 43B(h) verdict, the combined rupee cost of the delay, and the s.16 monthly-rest table with each rest date, opening balance and interest; press \"Copy result\".",
  ],
  intro:
    "This calculator works out what paying an MSME supplier late actually costs a buyer in rupees, by applying three rules together: the statutory due date under section 15 of the MSMED Act 2006 (15 days where there is no agreement in writing, and whatever the contract says up to a hard ceiling of 45 days where there is one), the section 16 charge of compound interest with monthly rests at three times the bank rate notified by the Reserve Bank, and section 43B(h) of the Income-tax Act 1961, under which a sum owed to a micro or small enterprise and paid beyond the section 15 limit is deductible only in the year it is actually paid. It is built for the buyer's accounts and finance team, and it opens by settling the question people get wrong most often: section 43B(h) reaches micro and small suppliers only, because section 2(n) of the MSMED Act defines a \"supplier\" as a micro or small enterprise and leaves medium enterprises out entirely.",
  useCases: [
    "Pricing the cost of holding back a supplier payment until after 31 March, when the deduction moves a whole financial year",
    "Checking whether a 60-day or 90-day purchase order term survives the 45-day ceiling in the proviso to section 15",
    "Working out the section 16 interest already accrued on an overdue payable before a year-end audit or an MSME Samadhaan claim",
    "Confirming that a medium-enterprise or trader supplier does not trigger a section 43B(h) disallowance",
  ],
  benefits: [
    [
      "The micro/small gate is answered first",
      "Section 2(n) of the MSMED Act covers only micro and small enterprises, so a medium supplier attracts neither section 16 interest nor a 43B(h) disallowance — the page says so before it shows a single number.",
    ],
    [
      "Monthly rests, shown rest by rest",
      "Section 16 requires compound interest with monthly rests at three times the RBI bank rate. The schedule shows each rest date, opening balance and interest so the figure can be checked line by line.",
    ],
    [
      "The 31 March cliff is priced",
      "Paying one day either side of the financial year end changes the deduction year. The calculator shows the extra tax carried in the accrual year and what a year of deferral costs at your own cost of funds.",
    ],
    [
      "Interest is treated as a post-tax cost",
      "Section 23 of the MSMED Act blocks any income-tax deduction for section 16 interest, so the tool also shows the pre-tax earnings needed to fund it.",
    ],
  ],
  faqs: [
    [
      "Is it 45 days or 15 days to pay an MSME supplier?",
      "It is 15 days unless there is an agreement in writing. Section 2(b) of the MSMED Act 2006 fixes the appointed day as the day following the expiry of fifteen days from acceptance, and section 15 requires payment before that day. Where a payment term is agreed in writing that term applies instead, but the proviso to section 15 says the agreed period shall not exceed forty-five days from the day of acceptance or deemed acceptance — so a 60-day or 90-day purchase order term is cut down to 45 days.",
    ],
    [
      "Does section 43B(h) apply to medium enterprises?",
      "No. Section 43B(h) is drafted for a sum payable to a micro or small enterprise, and section 2(n) of the MSMED Act defines \"supplier\" as a micro or small enterprise that has filed a memorandum, which leaves medium enterprises outside the delayed-payment chapter altogether. A payable owed to a medium enterprise is deductible on the normal accrual basis however late it is paid, and no section 16 interest arises either. Ministry of MSME Office Memoranda also restrict retail and wholesale traders holding Udyam registration to priority-sector-lending benefits, excluding the delayed-payment provisions.",
    ],
    [
      "What interest rate applies to a delayed MSME payment?",
      "Three times the bank rate notified by the Reserve Bank, compounded with monthly rests, under section 16 of the MSMED Act 2006. With the RBI Bank Rate at 5.50% as published on rbi.org.in and read on 29 July 2026, that is 16.5% a year with monthly rests — about 1.375% added to the balance each month. On 10 lakh rupees paid 141 days late that works out to roughly 65,216 rupees. Section 23 of the same Act says this interest is not allowed as a deduction when computing income under the Income-tax Act 1961.",
    ],
    [
      "Can I still claim the deduction if I pay before filing my return?",
      "Not under clause (h). The proviso to section 43B that allows a deduction where payment is made on or before the return due date under section 139(1) applies to the other clauses of section 43B but not to clause (h). For a micro or small supplier, payment beyond the section 15 limit is deductible only in the previous year in which it is actually paid. Section 43B(h) was inserted by the Finance Act 2023 and applies from FY 2023-24 (AY 2024-25) onwards; note that a payment made late but still inside the same financial year is not deferred, because that year is the year of actual payment.",
    ],
  ],
};

export default seo;
