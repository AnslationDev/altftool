const seo = {
  intro:
    "Random Name Picker draws one name at random from a list you paste in, with an animated shuffle of 12 to 19 flickers before it settles on the winner. Names can be added one at a time or pasted in bulk separated by commas or line breaks, duplicates are rejected case-insensitively as you add them, and elimination mode removes each winner from the pool so a repeated draw works through the list without repeats. Every pick is logged to a winner history of the last 50 results with a timestamp.",
  useCases: [
    "You are running a giveaway from a list of entrants and want the draw to happen visibly on screen, with the winner and the time it was drawn recorded so you can screenshot it.",
    "You have to assign presentation order for a class or a standup and turn on elimination mode, drawing repeatedly until everyone has a slot and nobody is picked twice.",
    "Your team is deciding who takes an unpopular ticket and you paste the roster from a chat message — comma or newline separated, both work — rather than typing eight names by hand.",
  ],
  benefits: [
    ["Duplicate protection on entry", "Names that match one already in the list, ignoring case, are silently skipped when you add or paste, and a Remove Duplicates button cleans an imported list."],
    ["Elimination mode for ordering", "Each winner is taken out of the pool, turning repeated draws into a full random ordering instead of independent picks."],
    ["Auditable winner log", "The last 50 winners are kept with the date and time they were drawn, so a contested draw has a record."],
  ],
  faqs: [
    [
      "How do I paste a whole list of names at once?",
      "Paste them into the input separated by commas or line breaks and press Enter — the tool splits on both and adds each entry as its own name. Anything already in the list, ignoring capitalisation, is skipped.",
    ],
    [
      "What does elimination mode do?",
      "It removes the winner from the pool after each draw, so the next pick comes only from the names left. With it off, every name stays eligible on every draw and the same person can win twice in a row.",
    ],
    [
      "Is the draw genuinely random?",
      "Yes — the winner is a uniform random pick over the current list, so with 20 names each has a 1-in-20 chance. The flickering animation shows names that are not the result; the final winner is chosen when the spin stops.",
    ],
    [
      "Will my list still be there if I refresh the page?",
      "No. Names, winners and history live only in the open page, so a refresh or a closed tab clears them. Copy the winner or screenshot the history before leaving if you need a record.",
    ],
  ],
};

export default seo;
