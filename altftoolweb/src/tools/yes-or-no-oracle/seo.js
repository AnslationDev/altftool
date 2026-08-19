const seo = {
  title: "Yes or No Oracle: Weighted Random Answers",
  metaDescription:
    "Ask any yes/no question and get one of 30 fortune-teller phrases after a 2-second reveal — weighted 45% yes, 40% no, 15% hazy — with your last 20 asks.",
  steps: [
    "Type your question into the Your Question box.",
    "Press Ask the Oracle — after a 2-second 'Consulting the Cosmos' reveal, a random draw lands yes 45%, no 40% or undecided 15% and picks one of 30 phrasings.",
    "Read the colour-coded verdict card, and press History to review up to your last 20 questions and answers.",
  ],
  intro:
    "The Yes or No Oracle is a random answer generator that replies to any yes/no question you type with one of 30 fortune-teller phrases, weighted 45% yes, 40% no and 15% undecided. It is built for anyone who wants a coin flip with more personality — a two-second reveal animation, a colour-coded verdict, and a running log of your last 20 questions. The draw is a plain Math.random() call in your browser, so it is entertainment, not prediction.",
  useCases: [
    "Settle a stuck dinner-or-takeaway argument by typing the question and letting the draw decide instead of going round again.",
    "Break a tie in a group chat where two people have already voted and nobody wants to cast the deciding vote themselves.",
    "Test your own gut feeling — ask something you are torn on, then notice whether you are relieved or annoyed by the answer that comes back.",
  ],
  benefits: [
    [
      "Weighted three-way draw",
      "Not a straight 50/50: each ask rolls yes at 45%, no at 40% and a hazy 'ask again later' at 15%, so answers do not feel mechanically balanced.",
    ],
    [
      "Thirty distinct phrasings",
      "Ten wordings per outcome, from 'It is decidedly so' to 'Not in this lifetime', picked at random so repeat questions rarely read the same.",
    ],
    [
      "Keeps your last 20 asks",
      "Every question, its verdict and the time you asked it stack up in a colour-coded history panel you can scroll back through.",
    ],
  ],
  faqs: [
    [
      "How does the Yes or No Oracle decide the answer?",
      "It draws a single random number in your browser and maps it to an outcome: under 0.45 gives a yes, 0.45 to 0.85 gives a no, and the remaining 15% gives an undecided reply. It then picks one of ten phrasings for that outcome at random. Your question text is never read or analysed.",
    ],
    [
      "Is the oracle actually 50/50?",
      "No. Yes comes up 45% of the time, no 40%, and an undecided answer such as 'Reply hazy, try again' the other 15%. If you want a true even split, use a coin-flip tool instead.",
    ],
    [
      "Can I ask the same question again and get a different answer?",
      "Yes — every ask is an independent draw, so the same question can come back yes, no or hazy on consecutive tries. Nothing is remembered between asks apart from the display history.",
    ],
    [
      "Does it save my questions anywhere?",
      "No. The last 20 questions live in the page's memory for this visit only and are cleared when you reload, navigate away or press the clear control. Nothing is sent to a server.",
    ],
  ],
};

export default seo;
