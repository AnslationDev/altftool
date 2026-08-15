const seo = {
  title: "Credit Card Closure Letter: RBI 7-Working-Day",
  metaDescription:
    "Draft a closure request that names the card and nil dues, counts the 7 working days RBI allows, and totals Rs 500 a day delay compensation.",
  steps: [
    "Under Cardholder and card, fill in Cardholder name, Card issuer, Card variant, Card last 4 digits and Reason for closing.",
    "Under Dates and dues, set Closure request sent on, Status as on and Outstanding balance on the card (INR), then tick what you want confirmed in writing.",
    "Read the Closure due by date and the Delay compensation claimable figure, then press Copy letter to take the draft from Letter preview.",
  ],
  intro:
    "This tool drafts the letter that actually closes a credit card: a dated closure request naming the card, confirming nil dues, and demanding written confirmation, a no-dues certificate and a status update to the credit bureaus. It also applies para 7(b)(ii) of the RBI Master Direction on Credit Card and Debit Card - Issuance and Conduct Directions, 2022, which gives the issuer seven working days to complete closure and entitles you to Rs 500 for every day of delay once dues are nil. Enter the request date and the tool works out the deadline and the compensation you can claim.",
  useCases: [
    "Close a card whose annual fee has kicked in, and get the closure date in writing before the fee is billed again.",
    "Follow up on a closure request the issuer ignored, with the delay compensation already totalled up in the letter.",
    "Get an old card reported as 'Closed' rather than 'Active' to the bureaus before applying for a home loan.",
    "Cancel every add-on card and standing instruction linked to a card you are shutting down.",
  ],
  benefits: [
    ["Working-day deadline", "Counts seven working days from your request, skipping Saturdays, Sundays and any holidays you add."],
    ["Delay compensation totalled", "Multiplies the days past the deadline by Rs 500 and only claims it when the balance is nil."],
    ["Bureau follow-through", "Asks for the closed status to be reported to CIBIL, Experian, Equifax and CRIF High Mark."],
  ],
  faqs: [
    [
      "How many days does a bank have to close a credit card in India?",
      "Seven working days from the date of the closure request, once all dues are paid. This comes from para 7(b)(ii) of the RBI Master Direction on Credit Card and Debit Card - Issuance and Conduct Directions, 2022, and the issuer must inform you of the closure immediately by SMS or email.",
    ],
    [
      "What compensation can I claim if the bank does not close my card on time?",
      "Rs 500 for each day of delay beyond the seven-working-day window, payable to you, provided there is no outstanding balance on the card. The compensation runs until the account is actually closed.",
    ],
    [
      "Does closing a credit card hurt my credit score?",
      "It can, because closing a card reduces your total credit limit and raises your utilisation ratio, and closing your oldest card shortens your average account age. What matters most is that the account is reported as 'Closed' with a zero balance rather than left showing as active.",
    ],
    [
      "How long before a closed card shows as closed in my credit report?",
      "Roughly a fortnight after closure. Since 1 January 2025 lenders report credit information to the bureaus on a fortnightly cycle under RBI's August 2024 direction, so check your report after about 15 days and raise a bureau dispute if the status has not changed.",
    ],
  ],
};

export default seo;
