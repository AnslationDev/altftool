const seo = {
  title: "Late Payment Reminder Builder: 5 Chase Levels",
  metaDescription:
    "Draft an overdue-invoice chase letter at the right rung — courtesy to final notice — with UK 1998 Act, EU Directive 2011/7 or MSMED Act 2006 wording.",
  steps: [
    "Fill in Invoice number, Outstanding amount, Currency, Invoice date, Due date and \"Date you are sending this\", then Client company, Contact person, Your name and Your company.",
    "Leave Escalation level on \"Auto — match the days overdue\" or pick Courtesy reminder, First reminder (0-6 days late), Second reminder (7-29 days late), Firm demand (30-59 days late) or Final notice (60+ days late); choose a Statutory reference — United Kingdom (B2B), European Union (B2B), India — registered MSME supplier, or the contract clause — and tick \"Quote accrued interest in the letter\".",
    "Invoice age shows the days overdue and the level chosen, with rows for Interest accrued, Amount plus interest and the Payment deadline set in the letter; the Subject line and Letter sections hold the draft, and Copy letter copies both.",
  ],
  intro:
    "This builder writes the chase letter for an unpaid invoice at the right point on the collections escalation ladder — courtesy reminder, first chase, second chase, firm demand, final notice — choosing the rung from the whole days between the due date and the day you send it. It fills in the invoice reference, the amount, a dated payment deadline and, if you want it, simple interest on the overdue balance at actual/365. Optional paragraphs cite the actual statutory footing: the UK Late Payment of Commercial Debts (Interest) Act 1998, EU Directive 2011/7/EU, or the MSMED Act 2006 for registered Indian MSME suppliers.",
  useCases: [
    "Send a warm nudge three days before a large invoice falls due so it clears the client's payment run.",
    "Escalate from a friendly chase to a firm demand once an invoice passes 30 days overdue.",
    "Draft a final notice that states a dated deadline before the debt goes to a recovery agent.",
  ],
  benefits: [
    ["Tone matched to age", "The letter hardens in fixed steps at 7, 30 and 60 days past due instead of by guesswork."],
    ["Real statutory citations", "Quotes the UK 1998 Act, EU Directive 2011/7/EU or the Indian MSMED Act rather than vague legal-sounding wording."],
    ["A deadline, not a plea", "Every chase past the first one names a specific calendar date for payment."],
  ],
  faqs: [
    [
      "How soon should I chase an unpaid invoice?",
      "Send the first reminder the day after the due date passes, while the amount is still small in the client's mind. Standard practice is then to escalate at roughly 7 days, 30 days and 60 days overdue, with each letter naming a firmer consequence.",
    ],
    [
      "Can I charge interest on a late invoice?",
      "Usually yes, either under your contract's late-fee clause or under statute. UK business-to-business debts carry statutory interest at 8 percentage points above the Bank of England base rate plus fixed compensation of £40 to £100; EU Directive 2011/7/EU sets at least 8 points above the ECB reference rate plus a €40 minimum recovery cost.",
    ],
    [
      "What should a final notice before legal action say?",
      "It should identify the invoice and amount, confirm that earlier reminders went unanswered, give one clear final date for payment, and state exactly what happens next — referral to a recovery agent or court proceedings. Keep it factual; threats you do not intend to carry out weaken the letter.",
    ],
    [
      "How long does a client legally have to pay in India?",
      "Where the supplier is a registered MSME, sections 15 and 16 of the MSMED Act 2006 require payment within 45 days of acceptance of goods or services, after which compound interest accrues monthly at three times the RBI notified bank rate. For other suppliers the contract terms govern, so confirm your position with a professional before relying on it.",
    ],
  ],
};

export default seo;
