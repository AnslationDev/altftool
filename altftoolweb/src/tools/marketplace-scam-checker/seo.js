const seo = {
  intro:
    "Marketplace Scam Checker reads a buyer or seller message you paste and matches it against 17 deterministic rules grouped into nine warning categories — off-platform payment, fake escrow or courier stories, overpayment, OTP and PIN requests, remote access, urgency, advance fees, shipping pressure and account-takeover instructions — then returns a 0 to 100 signal score and the specific steps to verify before you act. Negations are detected, so a line like 'never share your OTP' does not count against the message. The score is triage, not a fraud verdict: nothing is checked live, and a clean result does not mean the person is genuine.",
  useCases: [
    "Selling a phone on Facebook Marketplace and getting a message saying payment is held in escrow until you ship and pay a release fee, and wanting to know which parts of that are known warning patterns.",
    "Being asked by a buyer to confirm a code that has just arrived by SMS, and needing to see plainly that an OTP request from another user is an account-takeover signal, not a delivery step.",
    "Getting a message that someone overpaid and needs the difference sent back by bank transfer, and wanting the check to spell out why the refund should not come from your own funds.",
  ],
  benefits: [
    [
      "Named patterns, not a vague risk grade",
      "Every point in the score traces to a rule with a title and an explanation, so you can see exactly which sentence triggered it.",
    ],
    [
      "Negation-aware matching",
      "Advice phrased as a warning — 'do not share', 'never send' — is excluded, so genuine safety messages do not inflate the score.",
    ],
    [
      "A report you can share without leaking the message",
      "The exported summary lists categories and counts but deliberately excludes the pasted text, names, links, amounts, codes and addresses.",
    ],
  ],
  faqs: [
    [
      "What does the score out of 100 mean?",
      "It is a signal count, not a probability of fraud. Findings each carry fixed points and the total is capped at 100; a score of 30 or one high-severity match raises the assessment to 'important checks needed', and 58 or more, two high-severity matches, any remote-access or account-takeover signal, or overpayment combined with an advance fee raises it to a strong warning cluster.",
    ],
    [
      "Does a score of zero mean the message is safe?",
      "No. Zero means none of the 17 configured rules matched, which is not confirmation that the listing, buyer, seller, payment, courier or shipment is legitimate. A scam written in wording the rules do not cover will still score zero, so verify payment and delivery inside the official marketplace regardless.",
    ],
    [
      "Should I ever share a verification code with a buyer?",
      "No. A one-time password, PIN or verification code sent to you authenticates you, and no genuine buyer, seller, courier or marketplace agent needs it — a request for one is flagged here as a high-severity account-takeover signal. If you have already shared one, change your credentials through the official app and review active sessions.",
    ],
    [
      "Is my message uploaded or stored anywhere?",
      "No, the analysis is pure pattern matching that runs in your browser, with no network call and nothing saved. Up to 40,000 characters are analysed per message, and anything past that is truncated with a note.",
    ],
  ],
};

export default seo;
