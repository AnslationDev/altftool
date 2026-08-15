const seo = {
  title: "ROC Filing Calendar: AOC-4, MGT-7 Dates & Late",
  metaDescription:
    "From your incorporation date: AGM, AOC-4, MGT-7/7A, ADT-1 and LLP Form 11/8 due dates, plus the MCA additional fee accrued on anything late.",
  steps: [
    "Choose the \"Entity type\", then enter the \"Date of incorporation\", the \"Financial year end\" and the \"Accrue additional fee to\" date.",
    "Enter the paid-up share capital (or, for an LLP, contribution and turnover) and, under \"Dates the forms were filed\", the dates for ADT-1, AOC-4 and MGT-7 / MGT-7A.",
    "Read \"Timeline and fee per form\" for each due date, normal fee and additional fee with the section that produced it, then press \"Copy result\".",
  ],
  intro:
    "The MCA / ROC Filing Calendar & Penalty Calculator derives your annual Registrar of Companies deadlines from a single input — the date of incorporation — and then prices the additional fee that has accrued on anything already late. It works backwards from Companies Act 2013 section 96(1): the first AGM falls within 9 months of the close of the first financial year, every later AGM within 6 months of the year end and never more than 15 months after the previous one. AOC-4 then follows within 30 days of that AGM under section 137(1), MGT-7 or MGT-7A within 60 days under section 92(4), and ADT-1 within 15 days of the appointment meeting under section 139(1). An OPC, which section 96 excludes from holding an AGM at all, files AOC-4 within 180 days of the year end instead. An LLP files Form 11 within 60 days of 31 March and Form 8 within 30 days of the six-month point, so 30 May and 30 October. It is built for company secretaries, practising CAs and founders who need the exact date and the exact rupee figure, with the section that produced each one printed beside it.",
  useCases: [
    "A private limited company incorporated in August 2025 working out that its first AGM runs to 31 December 2026, not 30 September 2026, and that AOC-4 therefore falls on 30 January 2027.",
    "A CS pricing a delayed MGT-7 for a client: 47 days past 29 November means Rs 4,700 of additional fee on top of the normal fee, because MGT-7 carries a flat Rs 100 a day and not a multiplier.",
    "A small LLP with Rs 5,00,000 contribution checking that a Form 11 filed 361 days after 30 May costs 15 times the Rs 100 normal fee plus Rs 10 for the one day past 360.",
    "An OPC confirming that its AOC-4 is due 27 September, 180 days after the 31 March year end, while its MGT-7A is due 29 November, 60 days after the deemed AGM date.",
  ],
  benefits: [
    [
      "Per-form penalties, not one flat counter",
      "AOC-4 and MGT-7 run at a flat Rs 100 a day with no cap. ADT-1 uses the 1x / 2x / 4x / 6x / 10x / 12x slab table. LLP Form 8 and Form 11 use their own slabs that halve for a small LLP. DIR-3 KYC is a flat Rs 5,000. All four engines run side by side.",
    ],
    [
      "AGM derived, not assumed",
      "The first AGM uses the 9-month proviso, later AGMs the 6-month rule, and if you enter the previous AGM date the 15-month gap limit in section 96(1) is applied and the tool names which of the two limbs bound the date.",
    ],
    [
      "The rule sits next to every figure",
      "Each due date carries its section or rule number and each fee carries the amendment that set it, including the LLP fee slabs in force from 1 April 2022 and the DIR-3 KYC fee notified on 21 April 2026.",
    ],
    [
      "Accrual to a date you choose",
      "Unfiled forms accrue additional fee up to whatever date you set, so you can price the position today or the position on a planned filing date.",
    ],
  ],
  faqs: [
    [
      "When is the first AGM of a newly incorporated company due?",
      "Within 9 months of the close of the first financial year, under the first proviso to section 96(1). A company incorporated on 10 August 2025 closes its first financial year on 31 March 2026 under section 2(41), so its first AGM runs to 31 December 2026. Every later AGM is due within 6 months of the year end, i.e. 30 September, and no more than 15 months after the previous AGM.",
    ],
    [
      "What is the penalty for filing AOC-4 or MGT-7 late?",
      "A flat Rs 100 for every day of delay, with no upper cap, on top of the normal filing fee. That rate came from the note inserted in the Table of Fees by the Companies (Registration Offices and Fees) Second Amendment Rules, 2018, in force from 1 July 2018. AOC-4 due 30 October and filed 77 days later therefore costs Rs 7,700 of additional fee plus the normal fee, which is Rs 400 for a company with paid-up capital between Rs 5 lakh and Rs 25 lakh.",
    ],
    [
      "Is DIR-3 KYC still due every year by 30 September?",
      "No. Rule 12A of the Companies (Appointment and Qualification of Directors) Rules, 2014 was substituted by G.S.R. 943(E) dated 31 December 2025 with effect from 31 March 2026, making DIR-3 KYC Web triennial and due on or before 30 June. A DIN holder whose KYC is current through FY 2025-26 next files by 30 June 2028. Filing after the due date or reactivating a DIN costs a flat Rs 5,000 per DIN under G.S.R. 300(E) dated 21 April 2026, and Rs 500 applies to a later filing that only updates KYC particulars.",
    ],
    [
      "How much does a late LLP Form 11 or Form 8 cost?",
      "It depends on the delay and on whether the LLP is a small LLP under section 2(1)(ta), which needs contribution up to Rs 25 lakh and turnover up to Rs 40 lakh. Under the LLP Rules, 2009 Annexure A as substituted from 1 April 2022, a small LLP pays 1x, 2x, 4x, 6x, 10x and 15x the normal fee across the up-to-15-day, 30-day, 60-day, 90-day, 180-day and 360-day bands, and 15x plus Rs 10 a day beyond 360 days. Any other LLP pays 1x, 4x, 8x, 12x, 20x and 30x, and 30x plus Rs 20 a day beyond 360 days. The normal fee itself runs from Rs 50 for contribution up to Rs 1 lakh to Rs 600 above Rs 1 crore.",
    ],
  ],
};

export default seo;
