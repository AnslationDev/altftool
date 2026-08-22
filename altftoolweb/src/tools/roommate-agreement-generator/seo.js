const seo = {
  title: "Roommate Agreement Generator: Rent, Chores, Exit",
  metaDescription:
    "Split rent, utilities and deposit equally, by room area or custom percent, build a chore rotation and generate a ready-to-sign flatmate agreement.",
  steps: [
    "Enter the flat details — Flat address, City, Term (months), Move-in date — and the money: Total monthly rent (INR), Monthly utilities (INR) and Total security deposit (INR).",
    "Choose a Split method (Equal split, By private room area or Custom percentage) and use Add flatmate to list 2–8 people with each person's name and room area or share.",
    "Review the per-person split and the chore rotation, then press Copy agreement to take the full written agreement — guests, quiet hours, notice, exit — into a document.",
  ],
  intro:
    "A roommate agreement is a written contract between flatmates — not with the landlord — that records who pays what, who cleans what, and how someone leaves. This generator splits rent, utilities and the security deposit equally, by private room area or by a custom percentage, builds a weekly chore rotation, and produces a ready-to-sign document covering guests, quiet hours, notice period and deposit refunds. It flags a deposit above the two months' rent cap set by India's Model Tenancy Act, 2021.",
  useCases: [
    "Three people renting a 3BHK where one has the master bedroom and should pay a larger share of the rent.",
    "Settling in advance what happens to the deposit when one flatmate leaves mid-tenancy and a replacement moves in.",
    "Writing down guest limits and quiet hours before a new flatmate moves in, instead of arguing about it later.",
    "Recording who paid for the fridge and the washing machine so shared purchases can be bought out on exit.",
  ],
  benefits: [
    ["Room-weighted splits", "Charge by private room area so the master bedroom pays more than the box room."],
    ["Exit terms in writing", "Notice period, replacement duty and deposit refund are fixed before the first argument."],
    ["Deposit sanity check", "Warns when the deposit exceeds two months' rent, the cap in the Model Tenancy Act, 2021."],
  ],
  faqs: [
    [
      "Is a roommate agreement legally binding in India?",
      "Yes, a signed roommate agreement is enforceable as a contract between the flatmates under the Indian Contract Act, 1872, provided each person gets something in return and consents freely. It does not bind the landlord, and it cannot override the head tenancy or leave and licence agreement — only the people who signed it are bound by it.",
    ],
    [
      "How should flatmates split rent when the rooms are different sizes?",
      "The two common methods are an equal split and a split weighted by private room area in square feet, with shared space costs divided equally. A master bedroom of 180 sq ft against a 100 sq ft second room gives roughly a 64/36 rent split before any adjustment for an attached bathroom or balcony.",
    ],
    [
      "How much security deposit can a landlord ask for?",
      "Under the Model Tenancy Act, 2021, section 11(1), a residential security deposit cannot exceed two months' rent, and non-residential deposits are capped at six months. The Act only applies in states and union territories that have adopted it, so many cities still see deposits of six to ten months' rent under older state rent laws or plain contract.",
    ],
    [
      "What notice should a flatmate give before moving out?",
      "One month, or 30 days, is the usual contractual notice and it matches the standard month-to-month practice; the Transfer of Property Act, 1882, section 106, sets 15 days as the statutory minimum for a month-to-month residential tenancy. Whatever you choose, write it in the agreement along with who must find the replacement, and consult a lawyer if the tenancy itself has different terms.",
    ],
  ],
};

export default seo;
