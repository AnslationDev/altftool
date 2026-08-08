const seo = {
  title: "GST Delivery Challan Generator (Rule 55 Format)",
  metaDescription:
    "Build a Rule 55 delivery challan for job work or branch transfer: GSTIN check-digit validation, CGST/SGST or IGST split and the ₹50,000 e-way bill flag.",
  steps: [
    "Fill in Challan number (16 characters max), Date of issue and Reason for movement, then the consigner and consignee names, GSTINs and addresses.",
    "Add each line under \"Goods being moved\" with description, HSN code, unit, quantity and rate — the two state codes decide CGST/SGST or IGST.",
    "Check the Challan summary — consignment value, tax split, movement type and the e-way bill flag — then press Copy challan.",
  ],
  intro:
    "A GST delivery challan is the document that legally moves goods when no tax invoice can be raised yet, and this generator builds one to the nine particulars listed in Rule 55 of the CGST Rules, 2017. It validates both GSTINs with the base-36 check-digit test, keeps the challan number inside the 16-character limit, splits tax into CGST/SGST or IGST from the two state codes, flags the Rule 138 e-way bill trigger above ₹50,000 and dates the Section 143 job-work return deadline. It is built for manufacturers sending goods for job work, traders doing branch transfers, and anyone moving stock for repair, exhibition or sale-on-approval.",
  useCases: [
    "A Pune fabricator sending 200 kg of steel plate to a powder-coating job worker and needing the challan plus the one-year Section 143 return-by date printed on it.",
    "A retailer transferring stock between two branches on the same GSTIN, where a tax invoice cannot be raised because there is no supply.",
    "An equipment dealer moving a demo machine to a trade exhibition and back, and checking whether the consignment value crosses the ₹50,000 e-way bill limit.",
  ],
  benefits: [
    ["Rule 55 particulars checked", "Warns when the HSN code, consignee details, place of supply or signature required by Rule 55(1) are missing."],
    ["GSTIN validated, not just typed", "Runs the 15-character format, state-code and base-36 check-digit tests before the challan is built."],
    ["Job-work clock and e-way flag", "Dates the one-year (inputs) or three-year (capital goods) return deadline and marks consignments above ₹50,000."],
  ],
  faqs: [
    [
      "When do I issue a delivery challan instead of a tax invoice?",
      "Rule 55(1) allows a delivery challan in four situations: supply of liquid gas where the quantity at removal is not known, transportation of goods for job work, transportation for any reason other than a supply, and other cases notified by the Board. Branch transfers under one GSTIN, goods sent for repair, exhibition stock and sale-or-approval despatches all fall under the third head.",
    ],
    [
      "How many copies of a delivery challan are needed?",
      "Three, when goods are being supplied. Rule 55(2) requires the original marked 'Original for consignee', the duplicate marked 'Duplicate for transporter' and the triplicate marked 'Triplicate for consigner'. For movement that is not a supply, the triplicate copy is not mandatory.",
    ],
    [
      "Do I need an e-way bill with a delivery challan?",
      "Yes, once the consignment value exceeds ₹50,000. Rule 138(1) makes the e-way bill compulsory before movement begins regardless of whether the document is an invoice, a bill of supply or a delivery challan, and the challan number goes into Part-A. Several states set a higher threshold for purely intra-state movement, so check your state notification.",
    ],
    [
      "How long can goods stay with a job worker?",
      "One year for inputs and three years for capital goods from the date they are sent out, under Section 143 of the CGST Act. If they are not received back or supplied from the job worker's premises within that period, the original despatch is treated as a supply on the day it was sent, with interest. Moulds, dies, jigs, fixtures and tools are excluded from the time limit, and despatches are reported in Form ITC-04.",
    ],
  ],
};

export default seo;
