const seo = {
  intro:
    "Who Pays the Bill? is a random picker that takes a list of names and draws exactly one of them, with every name having the same chance of being chosen. Type names one at a time or paste a comma- or newline-separated list, hit the button, and a short shuffle animation lands on a single payer. It keeps a running history of the last 20 draws so a group can see who has already been picked.",
  useCases: [
    "Eight of you finish dinner, nobody wants to split the cheque fourteen ways, and you need one person picked in front of everyone rather than argued over",
    "The team does a coffee run every morning and you want a fair rotation without keeping a spreadsheet — the draw history shows who got caught recently",
    "A group chat is deciding who covers the taxi or the ticket booking, so you paste the names straight out of the chat and let the pick settle it",
  ],
  benefits: [
    ["Paste a whole group at once", "Names split on commas or line breaks, and duplicates are dropped case-insensitively so \"Sam\" and \"sam\" count as one person."],
    ["Draw history you can point at", "The last 20 results are timestamped and kept on screen, which is what stops the \"you picked me last time too\" argument."],
    ["A visible draw, not a silent answer", "The shuffle runs through 15 to 25 names before it settles, so everyone watching sees the pick happen rather than a number appearing."],
  ],
  faqs: [
    [
      "Is the pick actually random or does it favour someone?",
      "Every name has an equal chance on every draw. The winner is chosen with a uniform random index across the current list, so with 5 people each has a 1-in-5 chance — and that resets each round, meaning being picked once does not lower or raise your odds next time.",
    ],
    [
      "How many people can I add?",
      "There is no fixed limit — the list is only bounded by what fits on screen, and pasting a block of names adds them all in one go. Practical group sizes of 2 to 50 all work the same way; the draw animation length does not change with the count.",
    ],
    [
      "Can I stop the same person being picked twice in a row?",
      "Not automatically — each draw is independent, so a repeat is possible and with 4 people it will happen roughly 1 time in 4. If you want a strict rotation, remove the last winner from the list before the next draw and add them back once everyone has had a turn.",
    ],
    [
      "Are the names I enter saved anywhere?",
      "No. The participant list and the draw history live only in the page while it is open, and refreshing or closing the tab clears both. Nothing is uploaded, so you can use real names without them leaving the device.",
    ],
  ],
};

export default seo;
