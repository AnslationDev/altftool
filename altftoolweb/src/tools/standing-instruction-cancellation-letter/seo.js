const seo = {
  title: "Auto-Debit Cancellation Letter, Working-Day Count",
  metaDescription:
    "Count the clear working days between lodging a NACH, e-mandate or UPI AutoPay cancellation and the next debit, then draft both letters.",
  steps: [
    "Pick the \"Type of standing instruction\", then set the date you are lodging the cancellation, the next scheduled debit date and the notice period asked for in working days.",
    "Choose the working week to count against and paste your state's bank holidays as YYYY-MM-DD, then fill in the mandate reference, account number, IFSC, amount per debit and the company collecting the money.",
    "Read the clear working days before the debit and the last day you could safely lodge, then press \"Copy bank letter\" and \"Copy notice\".",
  ],
  intro:
    "A standing instruction, NACH mandate, card e-mandate or UPI AutoPay authority does not stop because you cancelled the service — it stops when the payment authority itself is withdrawn, at the bank and at the company presenting the debit. The part people get wrong is the timing: a cancellation lodged two calendar days before the debit can be zero working days before it, once a Sunday and a second Saturday are taken out. This tool counts the clear working days between the day you lodge and the day of the debit under your chosen working week plus any bank holidays you paste in, tells you the last working day on which you could still have lodged it, and drafts the letter to the bank and the matching notice to the biller. If the debit has already gone through, it switches to the three working-day deadlines in the RBI circular on limiting customer liability in unauthorised electronic banking transactions.",
  useCases: [
    "Working out, before you post anything, whether a cancellation lodged today actually clears the notice period your bank asks for once Sundays, the 2nd and 4th Saturday and a state holiday are removed.",
    "Stopping a gym, OTT or app subscription that keeps charging a card, using the withdrawal right in the RBI e-mandate framework rather than arguing with the merchant.",
    "Cancelling a SIP mandate far enough ahead of the next instalment date that the AMC's own working-day requirement is met.",
    "Writing up a debit that has already been taken, with the zero-liability and limited-liability dates counted in working days rather than guessed.",
  ],
  benefits: [
    ["Working days, not calendar days", "Sundays, the 2nd and 4th Saturday of the month under the standard Indian bank week, and every holiday you paste in are excluded from the count."],
    ["Tells you the last safe date", "Not just whether you are late — the exact working day on which the cancellation had to be lodged to leave the required clear days."],
    ["Two letters, one set of facts", "The bank letter and the notice to the biller carry the same reference, amount, dates and day counts, so the two ends of the mandate cannot be told different things."],
  ],
  faqs: [
    [
      "How do I cancel a standing instruction or auto-debit in India?",
      "Withdraw the payment authority in writing at both ends: a cancellation letter to your bank branch quoting the mandate reference, the amount, the frequency and the next debit date, and a matching notice to the company that presents the debit. Keep the acknowledgement with its date and reference number. For a card e-mandate the withdrawal goes to the card issuer, and for UPI AutoPay you revoke the mandate inside the UPI app — the letter is then only your paper trail.",
    ],
    [
      "How many days before the debit do I have to cancel?",
      "It depends who holds the mandate, and the figure is a matter of practice rather than regulation for most channels — banks commonly ask for a few working days on a NACH mandate, and AMCs state their own number for a SIP in the scheme document. That is why the notice period box in this tool is editable. What the tool does with certainty is count the clear working days you actually have, which is the number people miscount.",
    ],
    [
      "Can a card auto-debit be stopped at any time?",
      "The RBI framework for processing e-mandates on cards for recurring transactions, dated 21 August 2019, provides that a cardholder must be able to withdraw an e-mandate at any point, after which no further recurring transaction is permitted on it. The same framework requires a pre-transaction notification at least 24 hours before each charge, which gives you a chance to opt out of that particular debit.",
    ],
    [
      "What if the money has already been debited?",
      "Report it in writing straight away. The RBI circular on limiting the liability of customers in unauthorised electronic banking transactions dated 6 July 2017 provides zero liability where the customer notifies the bank within three working days of receiving the bank's communication about the transaction, a limited and capped liability where the report comes between the fourth and the seventh working day, and it requires the bank to credit the amount involved within ten working days of the notification. This tool counts those three deadlines for you in working days; it does not, and cannot, contact your bank.",
    ],
  ],
};

export default seo;
