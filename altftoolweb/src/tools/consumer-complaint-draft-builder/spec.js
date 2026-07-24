// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "consumer-complaint-draft-builder",
  "title": "Consumer Complaint Draft Builder",
  "description": "Facts, relief aur evidence se complaint format banaye.",
  "badge": "India-Specific Utilities",
  "category": [
    "Text & Writing",
    "India",
    "Legal"
  ],
  "icon": "file-warning",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "consumer",
      "label": "Consumer name",
      "type": "text",
      "default": "Example Consumer"
    },
    {
      "key": "business",
      "label": "Business / service provider",
      "type": "text",
      "default": "Example Seller"
    },
    {
      "key": "purchase",
      "label": "Purchase / service date",
      "type": "date",
      "default": "2026-07-01"
    },
    {
      "key": "amount",
      "label": "Amount paid (₹)",
      "type": "number",
      "default": 2499,
      "min": 0
    },
    {
      "key": "facts",
      "label": "Facts in date order",
      "type": "textarea",
      "default": "Product delivered damaged on 2026-07-03. Replacement request denied on 2026-07-05."
    },
    {
      "key": "relief",
      "label": "Relief requested",
      "type": "textarea",
      "default": "Replacement or full refund, plus documented delivery expense."
    },
    {
      "key": "evidence",
      "label": "Evidence available",
      "type": "textarea",
      "default": "Invoice, delivery photos, support emails, payment receipt."
    }
  ],
  "presets": [
    {
      "label": "Damaged delivery",
      "values": {
        "consumer": "Example Consumer",
        "business": "Example Seller",
        "purchase": "2026-07-01",
        "amount": 2499,
        "facts": "Damaged item delivered; support denied replacement.",
        "relief": "Replacement or refund.",
        "evidence": "Invoice, photos, email."
      }
    }
  ],
  "note": "Creates an organized draft, not legal advice or a guaranteed filing format. Confirm jurisdiction, limitation, pecuniary jurisdiction, portal requirements, and current consumer law."
},
  compute: (values) => {
      const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Math.max(0, Number(values.amount) || 0));
      const sections = [
        "Complainant: " + values.consumer,
        "Opposite party: " + values.business,
        "Transaction: " + values.purchase + " · " + money,
        "Facts: " + values.facts,
        "Deficiency / grievance: The recorded facts should be reviewed and tied to the promised product or service.",
        "Relief requested: " + values.relief,
        "Evidence index: " + values.evidence,
        "Verification: dates, amounts, names, and annexures should be checked before submission.",
      ];
      return { result: "Complaint draft organized", caption: sections.length + " review sections", rows: [["Consumer", values.consumer], ["Business", values.business], ["Amount", money], ["Purchase date", values.purchase]], list: sections };
    },
};

export default spec;
