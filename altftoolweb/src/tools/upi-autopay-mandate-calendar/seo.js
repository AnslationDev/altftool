const seo = {
  title: "Plan UPI AutoPay Debit Dates and Export an ICS",
  metaDescription:
    "Project recurring mandate dates across nine frequencies, add reminders 0-30 days ahead, and download a tentative ICS. It cannot change the mandate.",
  steps: [
    "Enter a Merchant or mandate label and the Planned amount in INR, then choose a Planner frequency and an Estimated debit day from 1 to 31.",
    "Set the Planning start date and Planning end date, add Debit reminder lead days between 0 and 30 plus any pause-review or revoke-review dates, then press Build estimated calendar.",
    "Press Download ICS calendar for upi-autopay-mandate-plan.ics, or Copy counts-only summary for a version carrying no merchant, amount or dates.",
  ],
  intro:
    "The UPI AutoPay Mandate Calendar projects the dates a recurring UPI e-mandate is likely to debit — across nine recurrence patterns from daily and fortnightly through monthly, quarterly and yearly — and exports them as an ICS file you can import into any calendar app. It adds an optional advance reminder 0 to 30 days before each estimated debit, plus separate pause-review and revoke-review reminders so you decide about a subscription before the money moves rather than after. The plan is a private estimate built in your browser: it has no connection to your UPI app or bank and cannot create, pause or revoke anything.",
  useCases: [
    "You have six or seven autopay subscriptions on the same UPI ID and want them all on one calendar so you can see which week of the month is heaviest.",
    "A free trial converts to an annual mandate and you want a review reminder a week before the first debit, while you can still decide whether to keep it.",
    "You are budgeting a month where rent, an insurance premium and a quarterly mandate all fall due, and you need the actual dates laid out rather than remembered.",
  ],
  benefits: [
    [
      "Month-end dates handled honestly",
      "A debit day of 29, 30 or 31 is clamped to the month's last calendar day and the plan tells you how many occurrences were adjusted, instead of silently shifting them.",
    ],
    [
      "Reminders before the debit, not after",
      "Each estimated debit can carry a calendar alarm 0 to 30 days ahead, and pause-review and revoke-review dates are separate events you set independently.",
    ],
    [
      "A summary you can share safely",
      "The counts-only report gives occurrence and reminder totals while deliberately excluding the merchant name, amount, dates and any account or UPI identifier.",
    ],
  ],
  faqs: [
    [
      "What happens if my debit day is the 31st and the month is shorter?",
      "The planner moves that occurrence to the last calendar day of the month — 28 or 29 February, or the 30th in a 30-day month — and reports how many occurrences were adjusted this way. Your bank or the merchant may apply a different rule, so treat those specific dates as approximate and confirm them in your UPI app.",
    ],
    [
      "Does adding a mandate here actually set up or cancel an autopay?",
      "No. This is a planning aid only; it never contacts NPCI, your bank or the merchant, and the exported calendar events cannot initiate, approve, pause, unpause or revoke a mandate. To change a mandate, use the mandate or autopay section of your own UPI app or your bank's channels.",
    ],
    [
      "Which recurrence options are supported?",
      "Nine: one time, daily, weekly, fortnightly, monthly, every two months, quarterly, half-yearly and yearly. Day-based patterns are anchored to the start date at 7 or 14 day intervals; month-based patterns repeat on the debit day you choose, from 1 to 31.",
    ],
    [
      "Why are the exported calendar events marked tentative?",
      "Because they are estimates, not confirmed bank debits — each event is written with STATUS:TENTATIVE and marked as free rather than busy, so it will not make your calendar look booked. Always verify the real debit date, amount and pre-debit notification in your UPI app or bank statement; this page is informational and is not financial advice.",
    ],
  ],
};

export default seo;
