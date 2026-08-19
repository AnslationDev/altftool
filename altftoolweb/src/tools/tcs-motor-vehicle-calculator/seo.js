const seo = {
  title: "TCS on Car Purchase Calculator: 1% Above ₹10 Lakh",
  metaDescription:
    "Section 206C(1F) charges 1% on the whole invoice once a vehicle crosses Rs 10,00,000. Covers the 5% no-PAN rate and exempt buyers.",
  steps: [
    "Pick \"What is being sold\" — Motor vehicle (car, SUV, two-wheeler, commercial vehicle) or Notified luxury good — and enter the Sale consideration on the invoice (INR).",
    "Clear \"Buyer has furnished a PAN\" to apply the 5% rate under section 206CC, or tick \"Buyer is an exempt entity\" for a government body, foreign mission or PSU carrier.",
    "\"TCS the seller collects\" shows the amount, with Rate applied, Threshold crossed? and Total the buyer pays listed under it — Copy result takes the summary.",
  ],
  intro:
    "Section 206C(1F) of the Income-tax Act requires a seller to collect 1% tax at source from the buyer when a motor vehicle sells for more than Rs 10,00,000, and this calculator works out the amount and the total the buyer actually pays. The Rs 10,00,000 figure is a trigger rather than an exemption slab, so once the value is crossed the 1% runs on the entire sale consideration. The same 1% now extends to notified luxury goods above Rs 10,00,000 from 22 April 2025, and the tool also covers the exempt buyer categories and the 5% no-PAN rate under section 206CC.",
  useCases: [
    "A buyer booking a Rs 12 lakh car wants the full cheque amount including the TCS line on the invoice",
    "A dealer confirms that a Rs 9 lakh sale attracts nothing while a Rs 11 lakh sale attracts Rs 11,000",
    "A luxury retailer checks the collection on a Rs 25 lakh notified item sold after 22 April 2025",
  ],
  benefits: [
    ["Whole-value rule applied", "Charges 1% on the entire consideration, not on the amount above Rs 10 lakh."],
    ["Per-sale test", "Judges each sale on its own value instead of a yearly aggregate."],
    ["Carve-outs covered", "Handles exempt buyers and the manufacturer-to-dealer clarification in Circular 22/2016."],
  ],
  faqs: [
    [
      "What is the TCS rate on a car above Rs 10 lakh?",
      "1% of the sale consideration under section 206C(1F). Because the section applies where the value exceeds Rs 10,00,000, a Rs 12,00,000 car attracts Rs 12,000 on the full amount, not 1% of the Rs 2,00,000 excess.",
    ],
    [
      "Is TCS on a car applied on the aggregate of purchases in a year?",
      "No. The test is applied to each sale, so two vehicles of Rs 8,00,000 each attract nothing while a single vehicle of Rs 11,00,000 attracts the collection. This differs from section 206C(1G), where the threshold runs on the financial-year aggregate.",
    ],
    [
      "Can I claim back the TCS the car dealer collected?",
      "Yes. The collection appears in your Form 26AS and Annual Information Statement and is set off against your income-tax liability for the year, with any excess refunded when you file your return. Quote the same PAN to the dealer that you use on your return so the credit matches.",
    ],
    [
      "Who does not have to pay TCS on a vehicle purchase?",
      "The Central or a State Government, an embassy, High Commission, legation, consulate or trade representation of a foreign State, a local authority, and a public sector company engaged in carrying passengers. A manufacturer selling to a dealer or distributor also does not collect, since CBDT Circular 22/2016 confirms the provision targets retail sales. Confirm your category with your tax adviser.",
    ],
  ],
};

export default seo;
