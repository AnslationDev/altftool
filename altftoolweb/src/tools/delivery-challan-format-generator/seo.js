const seo = {
  title: "Delivery Challan Format: Rule 55 CGST, E-Way Bill",
  metaDescription:
    "Lays out all nine Rule 55(2) particulars in triplicate, totals consignment value per Explanation 2 to Rule 138(1), and dates the e-way bill validity.",
  steps: [
    "Enter the challan number and date, pick why the goods are moving, and fill the consigner and consignee blocks with GSTIN and State.",
    "Add each line of goods — description, HSN code, unit, quantity, value per unit — then the transport mode, vehicle number and approximate distance in km.",
    "Check the consignment value and the e-way bill verdict, choose ORIGINAL FOR CONSIGNEE, DUPLICATE FOR TRANSPORTER or TRIPLICATE FOR CONSIGNER, and press Copy challan.",
  ],
  intro:
    "A delivery challan is the document that lets goods move without a tax invoice, and Rule 55 of the CGST Rules, 2017 is what governs it: Rule 55(1) lists the four situations it covers, Rule 55(2) lists the nine particulars it must carry, and Rule 55(3) requires three copies marked for the consignee, the transporter and the consigner. This generator lays out that document from what you type, adds up the consignment value the way Explanation 2 to Rule 138(1) defines it, tells you whether an e-way bill is triggered and for how many days it would stay valid under Rule 138(10), and dates the section 143 job-work return along with the ITC-04 that follows it. It is aimed at accounts and despatch staff in manufacturing, textiles and trading who send goods out for job work, to a branch, on approval or for repair.",
  useCases: [
    "Send fabric to a dyeing job worker in another State and see immediately that an e-way bill is due whatever the value, because of the first proviso to Rule 138(1).",
    "Move stock between your own godowns inside one State and check the consignment value against your State's own intra-State e-way bill threshold.",
    "Date the one-year return clock on inputs sent for job work and the ITC-04 due date that goes with them, straight from the despatch date.",
    "Verify a counterparty's GSTIN against its mod-36 check digit before the challan is printed, instead of after the vehicle has left.",
  ],
  benefits: [
    [
      "Every Rule 55(2) particular accounted for",
      "The nine clauses are listed and the ones your form has not filled are named, clause by clause, before you print.",
    ],
    [
      "Consignment value the way Rule 138 defines it",
      "Taxable value plus the tax actually charged, which is the figure the ₹50,000 e-way bill threshold is tested against — not the invoice subtotal.",
    ],
    [
      "Job work dates, not guesswork",
      "One year for inputs and three for capital goods under section 143(1), the Commissioner's extension, and the ITC-04 period and due date that follow from your turnover.",
    ],
  ],
  faqs: [
    [
      "When is a delivery challan issued instead of a tax invoice?",
      "In the four cases in Rule 55(1): supply of liquid gas where the quantity at removal is not known, transportation of goods for job work, transportation for any reason other than by way of supply — branch transfers, exhibitions, repairs, goods sent on approval — and other supplies the Board notifies. Rule 55(4) adds the case where goods move for supply but the invoice could only be issued after delivery.",
    ],
    [
      "How many copies of a delivery challan are needed?",
      "Three, under Rule 55(3): the original marked ORIGINAL FOR CONSIGNEE, the duplicate marked DUPLICATE FOR TRANSPORTER, and the triplicate marked TRIPLICATE FOR CONSIGNER. The marking is part of the rule, not a convention.",
    ],
    [
      "Is an e-way bill needed for goods sent on a delivery challan?",
      "Once the consignment value crosses ₹50,000 under Rule 138(1), yes — the challan number goes in Part A of FORM GST EWB-01. Two situations need one whatever the value: goods sent by a principal in one State to a job worker in another, and handicraft goods moved inter-State by a person exempt from registration. Several States have notified a higher threshold for movement entirely inside the State, so check the limit where you are.",
    ],
    [
      "How long is an e-way bill valid?",
      "Under Rule 138(10), one day for a distance of up to 200 km and one extra day for every 200 km or part of it after that, counted from when the e-way bill is generated. Over dimensional cargo, and multimodal movement that includes a ship leg, get one day per 20 km instead.",
    ],
  ],
};

export default seo;
