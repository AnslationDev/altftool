const seo = {
  intro:
    "The AI Scam Message Awareness Quiz shows you realistic texts, emails, chat messages and call transcripts — including genuine ones — and scores your verdicts using standard classification metrics: recall (the share of scams you caught), specificity (the genuine messages you left alone) and balanced accuracy, the average of the two. Because generative AI removed the broken-grammar tell, the quiz trains the signals that still hold: one-time-code requests, irreversible payment methods, lookalike domains, manufactured deadlines and contact arriving on an unexpected channel. Built for staff security training, older relatives and anyone who wants to test their instincts rather than assume them.",
  useCases: [
    "Run a five-minute security refresher with a team before a phishing simulation.",
    "Sit down with a parent or grandparent and work through bank, delivery and 'family emergency' messages together.",
    "Check whether you over-flag: marking everything suspicious scores 100% recall but only 50% balanced accuracy.",
    "Give new finance staff practice on gift-card and invoice-redirection requests before they hold payment authority.",
  ],
  benefits: [
    ["Genuine messages included", "A third of the bank is real notifications, so the score punishes crying wolf as well as missing scams."],
    ["Red flags named", "Every reveal lists the specific tactics in play — urgency, code requests, lookalike domain, secrecy."],
    ["Honest scoring", "Recall, specificity and balanced accuracy are reported separately instead of a single flattering percentage."],
  ],
  faqs: [
    [
      "How can I tell if a message was written by AI?",
      "You usually cannot, and that is the point — generative text removed the spelling and grammar errors people were trained to look for. Judge the request instead of the prose: what is being asked for, how urgent it claims to be, which payment or verification method it pushes, and whether the channel is one you already use with that organisation.",
    ],
    [
      "Will my bank ever ask for a one-time passcode?",
      "No. A one-time passcode exists specifically to prove it is you, so any caller or message asking you to read one back is an attack, including callers who already know your name, address and recent transactions. Genuine code messages arrive on their own and typically say the sender will never ask you for the code.",
    ],
    [
      "What should I do if a relative calls asking urgently for money?",
      "Hang up and call them back on the number you already have for them, or message a second family member to confirm. Voice cloning needs only a few seconds of audio, so a familiar voice is no longer evidence — agreeing a family code word in advance gives you a fast, offline check.",
    ],
    [
      "What is balanced accuracy and why is it used here instead of a simple score?",
      "Balanced accuracy is the average of recall (scams correctly flagged) and specificity (genuine messages correctly cleared), which prevents a good-looking score from a lazy strategy. Marking every message as a scam gives 100% recall but 0% specificity, so balanced accuracy lands at 50% — the same as guessing.",
    ],
  ],
};

export default seo;
