const seo = {
  title: "Room Rent Proportionate Deduction: Rupees You Pay",
  metaDescription:
    "Eligible room rent divided by the actual rate cuts nursing, OT and surgeon fees. See the rupees you pay, and the sum insured a room tariff needs.",
  intro:
    "A room rent proportionate deduction calculator works out how much of a hospital bill a health insurer will refuse when the room you occupied costs more per day than your policy's room rent limit — and states the answer in rupees you pay, not in a ratio. It applies the standard formula reproduced in IRDAI-standardised policy wordings: associated medical expenses (room rent, nursing, operation theatre, and the surgeon, anaesthetist or specialist fees inside the same hospital) are paid in the same proportion that the admissible rate per day bears to the actual rate per day. It is for anyone choosing a room at admission, checking a settlement letter after discharge, or working backwards from a room tariff to the sum insured that would clear it.",
  useCases: [
    "Decide at the admission desk what a room above your 1%-of-sum-insured limit will actually cost, before signing the form",
    "Reconcile a claim settlement letter that paid far less than the bill, by separating the room rent excess from the proportionate cut, the sum insured shortfall, the copay and the non-payable items",
    "Find the sum insured a Rs 8,000-a-day private room needs under a 1% per day room cap, and the gap from your current cover",
    "Check whether pharmacy, implants and diagnostics were wrongly proportioned, since the standard definition of associated medical expenses excludes all three",
  ],
  benefits: [
    [
      "Answers in rupees, not ratios",
      "The headline is the out-of-pocket figure, broken into five lines — room rent excess, proportionate cut, sum insured shortfall, copay and non-payables — that add up to it exactly.",
    ],
    [
      "Keeps the non-proportioned items separate",
      "Pharmacy and consumables, implants and medical devices, and diagnostics sit in their own bucket the ratio never touches, matching the standard definition of associated medical expenses.",
    ],
    [
      "Handles the differential-billing carve-out",
      "Where a hospital does not price by room category, the standard wording says the proportion is not applied; one switch leaves the associated charges whole and deducts only the room rent excess.",
    ],
    [
      "Reverse mode from tariff to sum insured",
      "A percent-of-sum-insured cap inverts exactly, so a target room tariff converts straight into the sum insured that would carry it with no deduction.",
    ],
  ],
  faqs: [
    [
      "How is proportionate deduction calculated in health insurance?",
      "Divide the eligible room rent per day by the actual room rent per day, then pay the associated medical expenses at that ratio. On a Rs 5,00,000 sum insured with a 1% per day room cap, the eligible rate is Rs 5,000 a day; occupy a Rs 8,000 room and the ratio is 5,000 / 8,000 = 62.5%, so Rs 1,10,000 of nursing, operation theatre and surgeon fees is cut to Rs 68,750 — a Rs 41,250 deduction, on top of the Rs 3,000 a day room rent excess.",
    ],
    [
      "Which charges are not subject to proportionate deduction?",
      "Pharmacy and consumables, implants and medical devices, and diagnostics. The standard definition of Associated Medical Expenses in IRDAI-standardised policy wordings lists room rent, nursing charges, operation theatre charges and in-hospital practitioner fees as included, and expressly excludes those three heads. The same definition also says proportionate deductions are not applied where the hospital does not follow differential billing by room category.",
    ],
    [
      "What sum insured do I need to avoid room rent proportionate deduction?",
      "Target tariff per day multiplied by 100 and divided by the cap percent. Under the common 1% of sum insured per day room limit, a Rs 8,000 a day single private room needs a Rs 8,00,000 sum insured; at a 2% ICU sub-limit the same Rs 8,000 needs Rs 4,00,000. A policy with no room rent capping has no such requirement at all.",
    ],
    [
      "Does the deduction apply if the room is only slightly over the limit?",
      "Yes, but it scales smoothly rather than falling off a cliff. A Rs 5,001 room against a Rs 5,000 limit gives a ratio of 99.98%, so on the same Rs 1,10,000 of associated charges the cut is about Rs 22 over a four-day stay plus Rs 4 of room rent excess. The deduction grows in proportion to how far above the limit the tariff sits.",
    ],
  ],
  steps: [
    "Enter the sum insured from your policy schedule and the room rent limit, either as a percent of sum insured per day (commonly 1%, or 2% for ICU) or as a flat rupee amount per day.",
    "Enter the hospital's actual tariff for the room occupied and the number of days billed at that tariff.",
    "Split the bill into the charges the ratio applies to — room and board, nursing, operation theatre, surgeon and anaesthetist fees, consultations — and the charges it does not: pharmacy and consumables, implants and devices, diagnostics.",
    "Add any non-payable items and your copay percent, and set the two switches for whether the hospital bills differently by room category and whether your wording proportions diagnostics.",
    "Read the out-of-pocket figure and the five lines that make it up, then check the same numbers against your own policy wording and the settlement letter.",
  ],
};

export default seo;
