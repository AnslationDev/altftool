const seo = {
  intro:
    "Homophone Confusion Checker reads a block of text and does two separate things: it reports 32 patterns where the surrounding words make the error certain — 'their is', 'should of', 'to many', 'your welcome' — and it lists every word belonging to one of 41 confusable sets so you can re-read those sentences yourself. The split matters, because a spell checker cannot flag 'principle' when you meant 'principal': both are correctly spelled words. Everything runs in your browser and nothing is uploaded.",
  useCases: [
    "Proofread an email or a cover letter for the their/there and your/you're slips a spell checker will never catch.",
    "Check a student essay and get the reason for each correction, not just a highlight.",
    "Scan a report for affect versus effect and principal versus principle before it goes to a client.",
    "Review website copy for stationary versus stationery and complement versus compliment.",
  ],
  benefits: [
    [
      "Corrections only where they are certain",
      "A phrase is corrected only when the surrounding words make it unambiguous — no guessing at your meaning.",
    ],
    [
      "Everything else is flagged, not changed",
      "Words like lead, past and discreet are listed with each meaning so you decide, because only you know the intent.",
    ],
    [
      "Nothing leaves your browser",
      "The whole check runs locally on the text in the box; there is no upload and no account.",
    ],
  ],
  faqs: [
    [
      "What is a homophone?",
      "A homophone is a word that sounds the same as another but differs in meaning and usually in spelling — their, there and they're, or principal and principle. Because each spelling is a real word, spell checkers pass them all, which is why homophone errors survive into printed documents.",
    ],
    [
      "Why does a spell checker miss their and there?",
      "A spell checker compares each word against a dictionary and both words are in it. Catching the mistake requires looking at the words on either side — 'their is' can only be 'there is' — which is exactly what the 32 patterns in this tool do.",
    ],
    [
      "What is the rule for affect and effect?",
      "Affect is normally the verb, effect normally the noun: the delay affected the launch, and the effect was a lost quarter. The exceptions are real but narrow — effect as a verb means to bring about ('effect change'), and affect as a noun is a psychology term for observable emotion.",
    ],
    [
      "Is my text stored or sent anywhere?",
      "No. The analysis is a plain JavaScript function running in your own browser tab on the text you typed. Nothing is transmitted, logged or saved, so drafts and confidential documents stay on your machine.",
    ],
  ],
};

export default seo;
