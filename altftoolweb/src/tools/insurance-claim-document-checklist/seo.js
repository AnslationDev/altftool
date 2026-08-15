const seo = {
  title: "Insurance Claim Document Checklist + IRDAI Deadline",
  metaDescription:
    "Pick health, motor or life claim and get the exact documents an Indian insurer asks for, plus the 15- or 30-day IRDAI settlement deadline as a date.",
  steps: [
    "Choose a 'Claim type' — health cashless or reimbursement, motor own damage or theft, life death or maturity — and tick the conditions that apply.",
    "Enter 'Date the last document was submitted' to turn the IRDAI limit into a calendar 'Settlement deadline for the insurer'.",
    "Tick documents off your generated list, then press 'Copy checklist' to take the ticked and unticked items with you.",
  ],
  intro:
    "This checklist builder produces the document set an Indian insurer will ask for on a health, motor or life claim, adding conditional paperwork such as an FIR, implant sticker or post-mortem report only when your situation calls for it. It also applies the IRDAI settlement timelines — 15 days for a health reimbursement claim from the last necessary document, 30 days for a general insurance claim from the last document you submit, and 30 days for a life claim, extended to 120 days where an investigation is ordered. Cashless health treatment runs on its own hour-based clock instead — decided within 1 hour for pre-authorisation and 3 hours for discharge. Claimants use it to assemble a complete file the first time instead of losing weeks to document queries.",
  useCases: [
    "Assembling a hospital reimbursement file that will not bounce back for a missing discharge summary or implant sticker",
    "Knowing exactly which police documents a vehicle theft claim needs before the non-traceable report arrives",
    "Preparing a nominee's death claim file where the death was unnatural and a post-mortem was conducted",
  ],
  benefits: [
    ["Conditional, not generic", "Extra documents appear only when the accident, implant or theft applies to you."],
    ["Deadline you can hold them to", "Converts the IRDAI timeline into a calendar date from your submission day."],
    ["Portable list", "Copy the ticked and unticked list into a message or note before you visit the branch."],
  ],
  faqs: [
    [
      "How long does an insurance company have to settle a claim in India?",
      "Under the IRDAI master circular on health insurance, a reimbursement claim must be settled or rejected within 15 days of the last necessary document, with cashless authorisation decided within 1 hour of the request and discharge approval within 3 hours. A general insurance claim requiring a survey must typically be settled within 30 days of the last necessary document you submit (insurers usually need a surveyor's report first, but this tool's 30-day clock runs from your submission date, not a separate survey date), and a life claim within 30 days of receiving all documents.",
    ],
    [
      "What documents are needed for a health insurance reimbursement claim?",
      "The core set is the signed claim form, the original itemised hospital bill and payment receipts, the discharge summary, all investigation reports, prescriptions matching every pharmacy bill, a cancelled cheque and KYC. An accident adds the FIR or MLC papers, and any implant adds the invoice with its batch sticker.",
    ],
    [
      "What happens if the insurer delays my claim beyond the deadline?",
      "The insurer must pay interest on the delayed amount at the bank rate plus 2% per annum from the date the claim became payable. If it is still unresolved, escalate to the insurer's grievance officer, then to IRDAI's Bima Bharosa portal, and then to the Insurance Ombudsman, which handles claims up to Rs 50 lakh free of cost.",
    ],
    [
      "Can a life insurance claim be rejected after three years?",
      "No. Section 45 of the Insurance Act 1938 bars an insurer from calling a life policy in question on any ground after three years from the date of commencement, revival or rider addition. Within those three years the insurer may investigate and repudiate for proven fraud or material non-disclosure, which is why early claims attract extra document requests.",
    ],
  ],
};

export default seo;
