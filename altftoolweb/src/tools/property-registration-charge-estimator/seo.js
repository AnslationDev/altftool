const seo = {
  title: "Stamp Duty & Property Registration Charge",
  metaDescription:
    "Add up stamp duty, cess, registration fee and its state cap, scanning and franking on the higher of agreement value or circle rate, plus 194-IA TDS.",
  steps: [
    "Pick your State — Maharashtra (Mumbai) through Haryana, or \"Other state — enter my own rates\" — then fill \"Agreement value (INR)\" and \"Circle / ready reckoner value (INR)\"; duty is charged on whichever of the two is higher.",
    "Edit the rates for your district: \"Stamp duty (% of chargeable value)\", \"Cess or surcharge (% of stamp duty)\", \"Registration fee (% of chargeable value)\" and its \"Registration fee cap (INR)\" (leave blank where the state does not cap it), plus \"Pages in the deed\" and \"Scanning charge per page (INR)\".",
    "Read the Charge/Amount table and the rows for \"Chargeable value\", \"Registration fee before any cap\", \"All-in cost including the price\" and \"Section 194-IA TDS at 1%\", then press \"Copy result\" for the plain-text estimate.",
  ],
  intro:
    "Registering a sale deed costs more than the stamp duty alone, and this estimator adds up every line: stamp duty, any cess or transfer duty, the state registration fee with its rupee cap where one exists, scanning charges per page, franking or e-stamping service fees and the deed-writer's fee. Duty is computed on the chargeable value, which is the higher of the agreement value and the government circle or ready reckoner rate, the basis states use under section 47-A of the Indian Stamp Act, 1899. It also flags the 1% TDS a buyer must deduct under section 194-IA when that value is Rs 50 lakh or more.",
  useCases: [
    "Budgeting the cash needed on registration day for a Rs 80 lakh flat in Mumbai, where the registration fee is capped at Rs 30,000.",
    "Comparing what the same purchase costs in Tamil Nadu, where the registration fee is 4%, against a state charging 1%.",
    "Checking whether the buyer must withhold Rs 50,000 of TDS because the circle rate pushes the chargeable value past Rs 50 lakh.",
  ],
  benefits: [
    [
      "Circle rate handled correctly",
      "Duty is applied to the higher of agreement value and notified value, which is how the sub-registrar assesses it.",
    ],
    [
      "Caps and cesses built in",
      "Rupee caps on the registration fee and cesses computed on the duty rather than the value are both supported.",
    ],
    [
      "Every rate editable",
      "State rates change and vary by district and buyer gender, so each figure can be overridden with the current one.",
    ],
  ],
  faqs: [
    [
      "Is the registration fee always 1% of the property value?",
      "In most states it is 1%, but not everywhere: Tamil Nadu charges 4% and Telangana 0.5%. Maharashtra caps the 1% fee at Rs 30,000 and Haryana at Rs 50,000, so on expensive property the effective rate falls well below 1%.",
    ],
    [
      "Is stamp duty charged on the agreement value or the circle rate?",
      "On whichever is higher. If the deed shows Rs 75 lakh but the ready reckoner value is Rs 80 lakh, duty and the registration fee are computed on Rs 80 lakh, and the Rs 5 lakh difference can also attract tax in the buyer's hands under section 56(2)(x).",
    ],
    [
      "When does the buyer have to deduct 1% TDS on a property purchase?",
      "Section 194-IA applies when the higher of the consideration and the stamp duty value is Rs 50,00,000 or more, at 1% of that amount, deposited using Form 26QB. Agricultural land is outside the section. Discuss your own case with a tax professional.",
    ],
    [
      "What are franking and scanning charges?",
      "Franking is one way of paying stamp duty — an authorised bank or agent stamps the document and charges a service fee on top of the duty. Scanning or document handling is charged per page of the deed, for example Rs 20 a page in Maharashtra, and covers digitising the record.",
    ],
  ],
};

export default seo;
