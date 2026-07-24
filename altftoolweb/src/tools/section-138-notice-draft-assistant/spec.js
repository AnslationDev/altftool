// AUTO-GENERATED tool spec. Rendered by _shared/toolkit/ToolRuntime.
export const spec = {
  ...{
  "slug": "section-138-notice-draft-assistant",
  "title": "Section 138 Notice Draft Assistant",
  "description": "Versioned checklist ke saath cheque-bounce notice draft structure kare.",
  "badge": "India-Specific Utilities",
  "category": [
    "Text & Writing",
    "India",
    "Legal"
  ],
  "icon": "file-pen-line",
  "iconColor": "text-primary",
  "fields": [
    {
      "key": "drawer",
      "label": "Cheque drawer",
      "type": "text",
      "default": "Example Customer"
    },
    {
      "key": "payee",
      "label": "Payee / claimant",
      "type": "text",
      "default": "Example Business"
    },
    {
      "key": "cheque",
      "label": "Cheque number",
      "type": "text",
      "default": "123456"
    },
    {
      "key": "amount",
      "label": "Cheque amount (₹)",
      "type": "number",
      "default": 50000,
      "min": 0
    },
    {
      "key": "cheque_date",
      "label": "Cheque date",
      "type": "date",
      "default": "2026-07-01"
    },
    {
      "key": "return_date",
      "label": "Bank return memo date",
      "type": "date",
      "default": "2026-07-10"
    },
    {
      "key": "reason",
      "label": "Return reason",
      "type": "text",
      "default": "Funds insufficient"
    },
    {
      "key": "facts",
      "label": "Underlying liability and evidence",
      "type": "textarea",
      "default": "Invoice INV-104 and delivery acknowledgement dated 2026-06-15."
    }
  ],
  "presets": [
    {
      "label": "Example notice",
      "values": {
        "drawer": "Example Customer",
        "payee": "Example Business",
        "cheque": "123456",
        "amount": 50000,
        "cheque_date": "2026-07-01",
        "return_date": "2026-07-10",
        "reason": "Funds insufficient",
        "facts": "Invoice and delivery record."
      }
    }
  ],
  "outputLabel": "Draft structure",
  "note": "Drafting and checklist aid only, not legal advice. Section 138 timelines and service requirements are strict; have an Indian lawyer verify dates, parties, evidence, wording, and current law."
},
  compute: (values) => {
      const amount = Math.max(0, Number(values.amount) || 0);
      const returnDate = new Date(values.return_date + "T00:00:00");
      const reviewBy = new Date(returnDate);
      if (!Number.isNaN(reviewBy.getTime())) reviewBy.setDate(reviewBy.getDate() + 30);
      const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
      const paragraphs = [
        "To: " + values.drawer,
        "From: " + values.payee,
        "Subject: Demand concerning dishonour of cheque " + values.cheque,
        "The cheque dated " + values.cheque_date + " for " + money + " was returned on " + values.return_date + " with the reason: " + values.reason + ".",
        "Recorded liability/evidence: " + values.facts,
        "Demand: pay the cheque amount within the legally applicable period after receipt of a valid notice.",
      ];
      return { result: "Draft checklist for cheque " + values.cheque, caption: "Initial issue-review target: " + (Number.isNaN(reviewBy.getTime()) ? "verify return date" : reviewBy.toISOString().slice(0, 10)), rows: [["Amount", money], ["Drawer", values.drawer], ["Payee", values.payee], ["Return reason", values.reason]], list: paragraphs };
    },
};

export default spec;
