const seo = {
  title: "Legal Notice Reply Deadline & Service Date Tracker",
  metaDescription:
    "Board your sent legal notices: service date (actual or deemed, S.27 General Clauses Act), reply deadline and next step - s.138 and s.80 CPC included.",
  intro:
    "The Legal Notice Dispatch Tracker keeps a board of the notices you have sent and works out, for each one, the date it was served, the date a reply falls due, and what the next step is after that. Enter the dispatch mode and date and it computes service either from the actual delivery date in the tracking record or, where none is recorded, from an assumed transit period — the deemed-service principle in Section 27 of the General Clauses Act, 1897, under which a properly addressed and prepaid registered letter is treated as served in the ordinary course of post. Notice types carry their own periods: a cheque dishonour demand under Section 138 of the Negotiable Instruments Act gives the drawer 15 days from receipt, and Section 80 CPC requires two months before suing the government. This is an informational planning aid, not legal advice — dates that matter should be confirmed with your advocate.",
  useCases: [
    "You sent a Section 138 cheque dishonour notice by registered post and need to know the exact date the 15-day payment period ends and when the one-month window to file the complaint opens and closes.",
    "You are running nine or ten recovery notices at once and want a single board showing which are still in transit, which are awaiting reply and which have gone past their deadline.",
    "A notice went out three weeks ago with no delivery date on the tracking record, and you want it flagged so you chase the postal record before the reply period is argued about.",
  ],
  benefits: [
    ["Service date, not just posting date", "Each row separates the dispatch date from the date of service and marks whether service is taken from the actual delivery record or from an assumed transit period."],
    ["Statutory periods built into the notice type", "Choosing cheque dishonour, government or consumer applies the period attached to that provision instead of leaving you to count days by hand."],
    ["Gaps flagged before they cost you", "Missing tracking references, deliveries with no confirmation after two weeks past expected transit, a weak dispatch mode for a Section 138 notice, and a limitation period with under 90 days left are all surfaced as issues."],
  ],
  faqs: [
    [
      "How long does the recipient get to reply to a cheque bounce notice?",
      "15 days from receipt of the demand notice to make the payment, under the proviso to Section 138 of the Negotiable Instruments Act, 1881. The notice itself must be sent within 30 days of the bank's return memo, and if payment is not made, the complaint has to be filed within one month of that 15-day period expiring.",
    ],
    [
      "What date counts as service when there is no delivery confirmation?",
      "Under Section 27 of the General Clauses Act, 1897, a correctly addressed, prepaid and posted registered letter is deemed served at the time it would be delivered in the ordinary course of post, unless the contrary is proved. This board applies working transit assumptions in that situation — 7 days for registered post with acknowledgement due, 5 for speed post and courier, and same-day for email, messaging apps and hand delivery — and any actual delivery date you enter overrides the assumption.",
    ],
    [
      "Which dispatch mode gives the strongest proof of service?",
      "Registered post with acknowledgement due, because the signed AD card comes back to you, followed by speed post, where the India Post tracking record and delivery confirmation are independent of both parties. Private courier PODs, email receipts and messaging screenshots are all used in practice but are contested far more often, and the board flags a courier or messaging dispatch on a Section 138 notice for that reason.",
    ],
    [
      "How long do I have to file a consumer complaint?",
      "Two years from the date the cause of action arose, under Section 69 of the Consumer Protection Act, 2019. The notice stage sits inside that period rather than extending it, which is why a consumer notice on the board shows the limitation expiry date and warns once fewer than 90 days remain. Confirm the applicable limitation for your own facts with a lawyer, since the date the cause of action arose is itself often disputed.",
    ],
  ],
};

export default seo;
