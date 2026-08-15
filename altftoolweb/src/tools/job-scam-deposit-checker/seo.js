const seo = {
  title: "Job Scam Deposit Checker — 8 Signals, Scored",
  metaDescription:
    "Paste a job offer or recruiter chat and see eight scam signals scored 0-100: deposits, gift cards, money-mule forwarding, domain mismatch. Runs locally.",
  steps: [
    "Paste the message into Job offer text, or use Choose text file for a local TXT, MD, EML, HTML or HTM file under 1 MB, and set the source to Email, WhatsApp, Telegram, Job portal or Other.",
    "Optionally add the Recruiter contact and the Official company site/domain you found independently, then press Review job offer.",
    "Read the band and the eight signal categories — upfront fee or deposit, hard-to-recover payment, money movement or reshipping, personal-account payment, urgency, contact or domain mismatch, compensation claim and identity-document pressure — then use Copy safe summary, or Download safe summary to save job-offer-deposit-check-safe-summary.txt.",
  ],
  intro:
    "The Job Scam Deposit Checker reads a job offer, recruiter message or chat transcript in your browser and flags the patterns associated with advance-fee and money-mule recruitment: candidate payments, gift-card or crypto demands, receive-and-forward money instructions, personal-account payment destinations, urgency pressure, recruiter-domain mismatch, outsized pay claims and early identity-document requests. Each matched rule carries a weight, the weights add up to a signal score capped at 100, and the score plus the mix of high-severity categories sets one of four bands. It is deterministic triage of the wording you paste — it verifies no company, person, domain or bank account, so a clean result is not proof an offer is genuine.",
  useCases: [
    "A recruiter who found you on a job site says the role is confirmed but a refundable security deposit is needed for the laptop, and you want to see the pattern named before you pay anything",
    "A remote 'payment processing' role asks you to receive client funds in your own bank account, keep a commission and forward the rest, and you want to know why that is treated as the most serious signal",
    "The offer letter looks official but the reply address is a free webmail account, and you want the mismatch against the company's real domain spelled out",
  ],
  benefits: [
    ["Eight signal categories, not one blocklist", "Fees, hard-to-recover payment methods, money movement, personal payment destinations, urgency, contact mismatch, pay claims and identity pressure are scored separately."],
    ["Negation-aware matching", "Wording like 'we will never ask you to pay a fee' is recognised as reassurance and not counted as a fee demand."],
    ["Money-mule wording escalates on its own", "A receive-and-forward or reshipping instruction pushes the result to the strongest band regardless of the numeric score, because that is the pattern with legal exposure."],
  ],
  faqs: [
    [
      "Should a real employer ever ask me to pay a deposit?",
      "Legitimate employers do not charge candidates to be hired — no application, registration, training, background-check, equipment or uniform fee, and no 'refundable' security deposit. The checker treats any candidate payment tied to a hiring step as a high-severity signal precisely because calling it refundable says nothing about who receives it or whether it can be recovered.",
    ],
    [
      "How is the score calculated and what do the bands mean?",
      "Matched rules contribute their weight, repeated matches add up to 6 more, and the total is capped at 100. A score of 58 or more, two or more high-severity findings, any money-movement signal, or a fee plus an untraceable payment method together produce the strongest band; one high-severity finding or a score of 30 or more produces the caution band; anything above zero is a review notice.",
    ],
    [
      "Why is my offer flagged for the salary figure?",
      "Because the pay claim crosses a comparison threshold — roughly 300,000 INR, 15,000 USD, 12,000 EUR or 11,000 GBP a month, or 10,000 INR and 700 USD a day. That is a prompt to compare the figure against the employer's own published listing, not an accusation; high pay is flagged only as a medium-severity signal.",
    ],
    [
      "Does a clean result mean the offer is safe?",
      "No. The tool only matches configured wording patterns in the text you paste; it performs no live check of the company, the recruiter, the domain, the job listing or the payment destination. Verify the employer through contact details you find independently, and if money or documents were already sent, secure the affected accounts and contact your bank and local police or fraud-reporting body.",
    ],
  ],
};

export default seo;
