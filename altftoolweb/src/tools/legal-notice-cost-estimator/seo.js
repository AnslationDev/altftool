const seo = {
  intro:
    "The Legal Notice Cost Estimator adds up the total cash cost of sending a legal notice by summing five buckets: the advocate's drafting fee (plus 18% GST where the firm bills under forward charge), non-judicial stamp paper and notarisation, printing every addressee copy and the record copy, postage per addressee, and the reminder notices that usually follow. It is built for individuals and small businesses deciding whether a demand notice, cease-and-desist or s.138 cheque-bounce notice is worth sending before they engage counsel. Every rate is editable, because postal tariffs, stamp paper values and advocate fees differ by state and vendor.",
  useCases: [
    "Budget a cheque-bounce notice under s.138 of the Negotiable Instruments Act before the 30-day window from the bank's return memo closes.",
    "Compare sending a notice to four defaulting tenants by registered post with A/D versus private courier, when the postage is multiplied by every addressee.",
    "Check whether recovering a small unpaid invoice is worth it once drafting fees, GST, printing and two reminder notices are added up.",
  ],
  benefits: [
    ["Per-addressee maths", "Printing, postage and reminders scale with the number of addressees, which is where most estimates go wrong."],
    ["GST handled correctly", "Toggle the 18% GST off when an advocate bills a business entity under reverse charge, so the fee is not inflated."],
    ["Dispatch mode comparison", "See the same notice priced by registered post with A/D, Speed Post, courier and email side by side."],
  ],
  faqs: [
    [
      "How much does it cost to send a legal notice in India?",
      "For a straightforward demand notice most of the cost is the advocate's drafting fee, commonly a few thousand rupees, with the remaining charges typically running to a few hundred rupees: non-judicial stamp paper, notarisation, printing and postage of roughly Rs 45-60 per addressee by Speed Post or registered post with A/D. Complex commercial disputes and senior counsel cost substantially more, so treat any figure here as an estimate and confirm with the advocate you engage.",
    ],
    [
      "Is GST charged on an advocate's fee for drafting a legal notice?",
      "Legal services carry the standard 18% GST rate, but where an individual advocate or a firm of advocates supplies services to a business entity the tax falls on the recipient under reverse charge (Notification 13/2017-Central Tax (Rate)), so the advocate's bill carries no GST line. A law firm or consultancy billing under forward charge will add 18%. Turn the GST toggle on or off to match the invoice you expect.",
    ],
    [
      "What is the best way to send a legal notice so it counts as served?",
      "Registered post with acknowledgement due is the safest, because the signed A/D card is direct proof of delivery and courts have treated a notice sent to the correct address as served even when the addressee refuses it. Speed Post with the India Post delivery record is widely accepted too. Email or WhatsApp alone is risky when a statute prescribes a mode of service, so use it in addition to post rather than instead of it.",
    ],
    [
      "Does this estimate include court fees if the matter goes to litigation?",
      "No. It covers only the cost of drafting and serving the notice itself. Court fees, ad valorem stamp duty on a plaint, vakalatnama charges and hearing fees are separate and depend on the claim value and the state's Court Fees Act. This tool is informational and is not legal advice; consult an advocate before acting on a notice.",
    ],
  ],
};

export default seo;
