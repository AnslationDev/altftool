const seo = {
  title: "Section 138 Cheque Bounce Notice Draft + 30-Day Date",
  metaDescription:
    "Turn cheque, amount, return-memo date and reason into a To/From/Subject demand skeleton with a 30-day review target. Drafting aid, not legal advice.",
  steps: [
    "Enter Cheque drawer, Payee / claimant, Cheque number, Cheque amount (₹), Cheque date and the Bank return memo date.",
    "Type the Return reason exactly as the bank memo words it, and record the Underlying liability and evidence — invoice number, delivery acknowledgement and date.",
    "Read the Draft structure: the To/From/Subject block, the factual and demand paragraphs, and the initial issue-review target dated 30 days after the return memo; use Download to save section-138-notice-draft-assistant.txt for a lawyer to review.",
  ],
  intro:
    "The Section 138 Notice Draft Assistant turns the details of a dishonoured cheque — drawer, payee, cheque number, amount, cheque date, bank return-memo date, return reason and the underlying liability — into a structured demand-notice skeleton with a To/From/Subject block, a factual paragraph and a demand paragraph, and it dates an issue-review target 30 days after the bank return memo. It exists because the Negotiable Instruments Act attaches strict timing to a cheque-bounce demand notice and the sequence is easy to lose track of when the memo is sitting on your desk. It is a drafting and checklist aid for the payee organising the facts before a lawyer takes over — it is not legal advice and produces no filing-ready document.",
  useCases: [
    "A customer's cheque for an invoice came back marked \"funds insufficient\" and you want the memo date, cheque particulars and invoice evidence assembled in one place before you call a lawyer.",
    "You have three bounced cheques from different months and need to see which one's 30-day review target from its return memo is closest, so you know which to act on first.",
    "You are briefing a lawyer and want the drawer, payee, cheque number, amount, return date and reason laid out in the order a demand notice states them, rather than as a pile of scans.",
  ],
  benefits: [
    [
      "Dates the clock from the right event",
      "The review target counts 30 days from the bank return-memo date you enter, not from the cheque date — the return memo is what starts the notice window under the Act.",
    ],
    [
      "Keeps the liability on the record",
      "A dedicated field carries the underlying debt and its evidence — invoice number, delivery acknowledgement, date — into the draft, because a demand over a cheque given as a gift or security is a different matter from one for a legally enforceable debt.",
    ],
    [
      "Formats the amount unambiguously",
      "The cheque sum is rendered in Indian rupee notation with the lakh/crore digit grouping, so the figure that appears in the draft reads the same way it does on the instrument.",
    ],
  ],
  faqs: [
    [
      "How long do I have to send a cheque-bounce notice?",
      "The Negotiable Instruments Act requires the demand notice to be made within 30 days of receiving information from the bank that the cheque was returned unpaid, which is why this tool dates its review target 30 days from the return-memo date you enter. Whether your particular memo date, receipt date and mode of service satisfy that proviso is a question for an Indian lawyer, not for a form.",
    ],
    [
      "Does this generate a notice I can send?",
      "No. It produces a structured draft skeleton and checklist — parties, cheque particulars, return reason, recorded liability and a demand paragraph — with the demand deliberately worded as \"within the legally applicable period\" rather than a fixed number. The final wording, the statutory period, the mode of service and the proof of service all need a lawyer's review before anything is sent.",
    ],
    [
      "What happens after the notice is served?",
      "Under the Act the drawer is given 15 days from receipt of a valid notice to pay, and only if that period passes without payment does a cause of action arise, with the complaint itself subject to a further statutory time limit. Those steps depend on when service was actually effected and on current law and case law, so confirm every date with a lawyer rather than working from a calculator.",
    ],
    [
      "Which return reasons does this cover?",
      "The return reason is a free-text field, so you enter exactly what the bank memo says — \"funds insufficient\", \"account closed\", \"payment stopped\", \"signature differs\" and so on. The wording matters because not every return reason is treated the same way in cheque-dishonour proceedings; copy the memo verbatim rather than paraphrasing it.",
    ],
  ],
};

export default seo;
