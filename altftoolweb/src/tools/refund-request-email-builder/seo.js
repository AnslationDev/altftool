const seo = {
  title: "Refund Request Email Builder - Dated Reply Deadline",
  metaDescription:
    "Build a refund email with order facts, days since delivery counted for you, a dated reply deadline and the escalation route for India, UK, EU or US.",
  steps: [
    "Fill the order facts: 'Where you bought it' (India, United Kingdom, European Union or United States), 'What went wrong', the order number, item, Amount paid, and the Order, Delivery and sending dates. [pages/index.jsx:100-188; lib.js:27-61, 75-106]",
    "Set 'Days to reply' (3-60), pick a Tone - Firm, Polite or Final notice - and state 'What you want', or leave it blank for that reason's default ask. [pages/index.jsx:190-226; lib.js:16-18, 115-129]",
    "Check Days since delivery against the region's reference window and the checklist, then press Copy result for the subject plus body, or Copy body for the email alone. [pages/index.jsx:246-307]",
  ],
  intro:
    "The Refund Request Email Builder assembles a written refund request around the four things sellers respond to: the order facts, the number of days since delivery, one specific ask, and a dated deadline with a named escalation route. It counts the days from your delivery date to the date you send the email and compares them with the headline consumer-protection window for India, the UK, the EU or the US. Informational only — it drafts a letter, it does not give legal advice.",
  useCases: [
    "Chase a marketplace seller who has ignored two support tickets about a faulty delivery.",
    "Ask for a refund on an order that never arrived and record the date you first put it in writing.",
    "Send a final written notice before starting a card chargeback or filing a consumer complaint.",
    "Work out whether you are still inside the 14-day EU withdrawal period before you write.",
  ],
  benefits: [
    [
      "Deadline the reader can diary",
      "The reply-by date is calculated from the day you send, so the request has a hard edge instead of 'as soon as possible'.",
    ],
    [
      "Days elapsed, stated as a fact",
      "Delivery date, days since delivery and the applicable reference window appear in the email, not just in your head.",
    ],
    [
      "Named escalation route",
      "Each region maps to a real next step — the National Consumer Helpline, an ADR scheme, a European Consumer Centre or your card issuer.",
    ],
  ],
  faqs: [
    [
      "How do I write an email asking for a refund?",
      "Open with the request in one sentence, list the order number, item, amount and dates as a block, describe the problem factually, state exactly what you want, and give a date by which you expect a written reply. Keep it to one page and avoid restating the story more than once.",
    ],
    [
      "How long do I have to ask for a refund?",
      "It depends where you bought. Online orders in the EU carry a 14-day right of withdrawal from delivery; in the UK, faulty goods carry a 30-day short-term right to reject under the Consumer Rights Act 2015. In India and the US there is no single universal window, so the seller's published return policy governs — though a US credit-card billing error must be disputed with the issuer within 60 days of the statement.",
    ],
    [
      "How long should I give a company to respond to a refund request?",
      "Fourteen days is the customary notice period in a written complaint — long enough to be reasonable, short enough to keep pressure on. Anything under about a week reads as unreasonable if the matter later goes to an ombudsman or a small claims court.",
    ],
    [
      "What if the seller ignores my refund email?",
      "Escalate along the route named in the letter: in India the National Consumer Helpline on 1915 and then the District Consumer Disputes Redressal Commission; in the UK an ADR scheme then the small claims track; in the EU your European Consumer Centre. If you paid by card, a chargeback with your issuer runs in parallel. Speak to a consumer adviser before starting formal proceedings.",
    ],
  ],
};

export default seo;
