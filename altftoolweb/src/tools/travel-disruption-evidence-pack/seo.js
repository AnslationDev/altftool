const seo = {
  intro:
    "The Travel Disruption Evidence Pack turns scattered delay notices, receipts and booking references into one structured claim index, mapping every record to seven fixed columns: evidence item, date and time, provider, booking or claim reference, amount, file or message reference, and why it matters. You type one record per line with pipe separators and it counts complete rows, flags any row with a missing field, and lays the whole set out as a table you can work from. It is for a traveller assembling a delay, cancellation or baggage claim who needs the paperwork ordered before they open the airline's form.",
  useCases: [
    "Your connection was cancelled overnight, you paid for a hotel and two meals, and you need every receipt tied to the delay notification that caused it before you file with the airline.",
    "An insurer has asked for supporting documents and you want a single index listing which file covers which expense, so nothing is submitted twice and nothing is missing.",
    "Two people on the same booking each kept screenshots and receipts on their own phone, and you want one shared list showing exactly which file reference belongs to which incident.",
  ],
  benefits: [
    [
      "Completeness checked, not assumed",
      "Turn on the row check and it counts exactly how many records are missing a field, so gaps surface before a claims handler finds them.",
    ],
    [
      "Cause linked to cost",
      "The 'why it matters' column forces each receipt to be tied to the disruption that caused it, which is the link most consequential-expense claims turn on.",
    ],
    [
      "A file index, not a file dump",
      "Each row names the screenshot, PDF or message that backs it up, so the pack stays a readable map of your evidence even when the attachments live elsewhere.",
    ],
  ],
  faqs: [
    [
      "What evidence do I need for a flight delay claim?",
      "At minimum: the official delay or cancellation notice with its timestamp, your booking reference, and dated receipts for any expense you want reimbursed. This tool tracks seven fields per record — item, date and time, provider, booking or claim reference, amount, file reference, and why it matters — which covers what most airline and insurer forms ask for.",
    ],
    [
      "How do I record expenses caused by a cancellation?",
      "Log each one as its own record with the amount and a note linking it to the disruption, such as a replacement hotel booked after an overnight cancellation. Consequential expenses are normally assessed against the original incident, so a receipt with no stated cause is the weakest kind of evidence.",
    ],
    [
      "Am I entitled to compensation for my delay?",
      "That depends on the route, the carrier, the length of the delay and the reason for it, and the rules differ between jurisdictions and between airline policy and travel insurance. This tool organises your evidence and does not assess eligibility — check the airline's conditions of carriage, your insurer's policy and the relevant passenger-rights regulator, and get professional advice for a disputed claim.",
    ],
    [
      "How many records can the pack hold?",
      "Add as many lines as you need; the on-screen table renders the first 100 records. Keep the original files, message headers and booking terms as well — the index points to your evidence, it does not replace it.",
    ],
  ],
};

export default seo;
