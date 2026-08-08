const seo = {
  title: "Resignation Date Optimizer: Gratuity, Notice, Tax Year",
  metaDescription:
    "Prices every candidate last working day in rupees: gratuity at 15÷26, notice buyout, leave encashment, bonus clawback and the tax year it lands in.",
  intro:
    "A resignation date optimizer prices every candidate last working day in rupees, so you can see what changes between them: gratuity, notice pay, leave encashment, a bonus or retention clause, and which financial year the settlement is taxed in. It applies the Payment of Gratuity Act, 1972 — gratuity of 15 ÷ 26 × last drawn monthly basic plus DA × qualifying years under section 4(2), five years of continuous service under section 4(1), and the 240-day (190-day for a five-day week) continuous service test in section 2A(2)(a) — alongside the section 10(10) and section 10(10AA) exemption limits of the Income-tax Act, 1961. It is built for salaried employees in India who have an offer in hand and a gratuity anniversary, a clawback date or 31 March sitting close to their exit, and it reports figures rather than telling anyone when to resign.",
  useCases: [
    "Check whether you cross the five-year gratuity line under section 4(1) before your notice period ends, and what the payout is worth if you do",
    "See exactly what a notice buyout costs once you add the salary you forgo, the recovery deducted from full and final settlement, and the tax on salary you never keep",
    "Price a retention bonus clawback date against the extra weeks of salary and leave accrual you would earn by staying past it",
    "Compare a 31 March last working day against 1 April to see which financial year the gratuity, leave encashment and bonus fall into",
  ],
  benefits: [
    [
      "Both gratuity readings, side by side",
      "The settled five-year date under section 4(1) and the contested 4-years-plus-240-days date built on section 2A(2)(a) are shown separately, never merged.",
    ],
    [
      "Every rupee traced to a rule",
      "Gratuity uses 15 ÷ 26 and the section 4(3) ceiling of ₹20,00,000; leave encashment uses the four-limb least-of test in section 10(10AA)(ii) with its ₹25,00,000 lifetime cap.",
    ],
    [
      "Notice buyout costed honestly",
      "Section 16 of the Income-tax Act allows no deduction for notice pay recovered, so the page shows the pre-tax earnings needed to fund the recovery, not just the recovery itself.",
    ],
    [
      "Month and financial year boundaries surfaced",
      "Candidate dates include each month end, 31 March and 1 April, so a settlement that shifts between years of assessment is visible rather than assumed away.",
    ],
  ],
  faqs: [
    [
      "Can I get gratuity after 4 years and 240 days?",
      "It is contested, not settled. Section 4(1) of the Payment of Gratuity Act, 1972 requires continuous service of not less than five years, while section 2A(2)(a) deems a year of continuous service where an employee has actually worked 240 days in the preceding twelve months — 190 days where the establishment works less than six days a week. Reading the two together, the Madras High Court in Mettur Beardsell Ltd. v. Regional Labour Commissioner (1998) held that 4 years plus 240 days in the fifth year qualifies, and the Kerala High Court followed it in Sreeja B. v. Regional Joint Labour Commissioner (2015). There is no binding Supreme Court ruling, many employers decline to pay on it, and enforcing it usually means a claim before the Controlling Authority.",
    ],
    [
      "How is gratuity calculated on the last drawn salary?",
      "Gratuity = 15 ÷ 26 × last drawn monthly basic plus dearness allowance × qualifying years, under section 4(2) of the Payment of Gratuity Act, 1972. A part of a year in excess of six months counts as a full year, so 5 years 7 months pays for 6 years while 5 years 6 months pays for 5. On a basic plus DA of ₹60,000 with 5 qualifying years the figure is ₹1,73,077. The statutory ceiling is ₹20,00,000 under section 4(3), raised from ₹10,00,000 by the Payment of Gratuity (Amendment) Act, 2018 with effect from 29 March 2018. HRA, bonus, overtime and commission are excluded from wages by section 2(s).",
    ],
    [
      "Is notice pay recovery deductible from my taxable salary?",
      "In the general position, no. Section 16 of the Income-tax Act, 1961 lists no deduction for notice pay recovered by an employer, so most employers deduct TDS on gross salary and report the un-netted figure in Form 16 — meaning tax is paid on salary you never keep. Funding a ₹1,80,000 recovery at a 30% marginal rate plus 4% cess therefore takes about ₹2,61,628 of pre-tax earnings. The ITAT Ahmedabad bench held otherwise in Nandinho Rebello v. DCIT (ITA No. 2378/Ahd/2013, order dated 18 April 2017), taxing only salary actually received, but that order binds no other assessee. Separately, no GST arises on notice pay recovery, per CBIC Circular No. 178/10/2022-GST dated 3 August 2022.",
    ],
    [
      "How much leave encashment is tax free when I resign?",
      "For non-government employees the exemption under section 10(10AA)(ii) is the least of four amounts: ₹25,00,000, the encashment actually received, ten months' average basic plus DA, and the cash value of leave credited at 30 days per completed year of service. The ₹25,00,000 figure comes from CBDT Notification No. 31/2023 dated 24 May 2023, which raised it from ₹3,00,000 with effect from 1 April 2023. The limit is a lifetime one across all employers, so moving a payout into a later financial year does not reset it. Anything above the least of those four amounts is taxable as salary.",
    ],
  ],
  steps: [
    "Enter your date of joining, today's date, the date you plan to give notice and the notice period your contract requires.",
    "Select whether your establishment works five or six days a week — this sets the 190-day or 240-day continuous service test in section 2A(2)(a).",
    "Enter monthly gross and monthly basic plus DA separately, since gratuity and leave encashment are computed on basic plus DA alone.",
    "Add your leave balance, monthly leave accrual and the encashment day basis your employer uses, then any bonus or retention amount with its clause date.",
    "Read the gratuity eligibility panel for the settled five-year date and the contested 4-years-plus-240-days date, then compare the ranked dates and the component table for the rupee difference against leaving today.",
  ],
};

export default seo;
