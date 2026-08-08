const seo = {
  title: "Proforma Invoice Generator with Incoterms and CIF",
  metaDescription:
    "Builds an export proforma: line items with HS codes, freight, insurance and packing, an Incoterms 2020 rule, the CIF value and the total in words.",
  steps: [
    "Fill Seller / exporter and Buyer / consignee, choose an Incoterms 2020 rule with its Named place or port, and set Currency, Issue date and Validity (days).",
    "Press Add line for each item and give Description of goods, HS code, Quantity, Unit price, Discount (%) and Tax (%), then Freight, Insurance, Packing and Other charges.",
    "Read the Grand total with the amount spelled out in words and the CIF value used for customs row, then press Copy invoice.",
  ],
  intro:
    "A proforma invoice is a binding quotation issued before goods ship — customs authorities accept it for valuation and import licensing, and buyers use it to release an advance payment or open a letter of credit, but it is not a demand for payment and no input tax can be claimed against it. This generator totals each line as quantity x unit price less discount plus tax, adds freight, insurance, packing and other charges, reports the CIF value customs will use, applies an Incoterms 2020 rule, works out the validity date and spells the grand total out in words the way banks require.",
  useCases: [
    "An exporter sending a quotation the buyer will present to their bank to open a letter of credit, where the total must appear in words.",
    "A supplier needing to state a CIF value so the importer can estimate duty before committing to the order.",
    "A business collecting a 30% advance before production starts, with the balance due before dispatch clearly shown on the document.",
  ],
  benefits: [
    ["Incoterm and charges agree", "Picking the trade term shows whether the seller carries freight and insurance, so the figures match the term quoted."],
    ["CIF value separated", "Goods value plus freight plus insurance is reported on its own, which is the figure customs values the shipment on."],
    ["Total in words", "Spells the amount out in the short scale, which banks and customs commonly require on the document."],
  ],
  faqs: [
    [
      "What is the difference between a proforma invoice and a commercial invoice?",
      "A proforma invoice is issued before shipment as a binding quotation; a commercial invoice is issued at or after shipment as the actual demand for payment and the document of record for the sale. Only the commercial invoice creates a receivable in the accounts and supports an input tax claim.",
    ],
    [
      "Can a buyer pay against a proforma invoice?",
      "Yes — that is one of its main uses. Buyers commonly release an advance or open a letter of credit against a proforma. The seller should still issue a commercial invoice once the goods ship, because the proforma is not a tax document.",
    ],
    [
      "What should a proforma invoice include?",
      "Seller and buyer details, a unique reference number and issue date, a validity period, a full description of the goods with HS codes and quantities, unit prices and the currency, the Incoterms 2020 rule and named place, freight and insurance if the seller carries them, the total in figures and in words, and the payment terms.",
    ],
    [
      "How long is a proforma invoice valid?",
      "As long as it says — 30 days is the most common period, because prices, freight rates and exchange rates move. State the expiry date explicitly; after it passes the quoted prices lapse and you can requote without breaching the offer.",
    ],
  ],
};

export default seo;
