const seo = {
  intro:
    "The Dice Roller rolls up to 10 dice of d4, d6, d8, d10, d12, d20 or d100 with a modifier from −99 to +99 and an optional drop-lowest rule, drawing each result from the browser's crypto.getRandomValues with rejection sampling so no face is even slightly favoured. It shows every individual die, marks natural maximums and natural 1s, and keeps a running average, highest and lowest alongside the last 20 rolls. It is for tabletop players without their dice bag, and for anyone who wants a roll they can show the table.",
  useCases: [
    "You are rolling a new D&D character over video call and need 4d6 drop lowest six times, with the dropped die visible so nobody has to take your word for the ability scores.",
    "Your d20 is missing mid-session and you need a 1d20+5 attack roll where the natural 20 and natural 1 are unmistakable.",
    "You are checking whether a homebrew damage expression feels right, so you roll it repeatedly and read the running average rather than doing the probability by hand.",
  ],
  benefits: [
    ["Genuinely unbiased results", "Uses the Web Crypto generator with modulo-rejection sampling, so a d100 is not skewed by the leftover values a plain remainder would introduce."],
    ["Shows the working", "Displays every die face, which one was dropped, the dice subtotal and the modifier applied, so the total is auditable rather than asserted."],
    ["Keeps score across rolls", "Tracks roll count, average total, highest and lowest, plus a copyable history of the last 20 rolls in standard notation."],
  ],
  faqs: [
    [
      "How many dice can I roll at once?",
      "Between 1 and 10 dice per roll, in any of the seven standard sizes from d4 to d100, plus a modifier between −99 and +99. Quick presets cover 2d6, 3d6, 1d20 and 4d6 drop lowest.",
    ],
    [
      "Is an online dice roller actually random?",
      "This one draws from the browser's cryptographic random source rather than Math.random, and discards values in the final partial block so every face has exactly equal probability. That removes the modulo bias that makes naive random-number code slightly favour low faces.",
    ],
    [
      "How does drop lowest work for character stats?",
      "Turn on drop lowest with more than one die and the single lowest result is excluded from the total — the classic 4d6 drop lowest ability-score roll. The dropped die stays visible and greyed out so the table can see what was removed.",
    ],
    [
      "Can I copy my rolls into a chat?",
      "Yes — the history keeps the last 20 rolls in standard notation such as 4d6dl+2 with their totals, and copies as plain text you can paste into a virtual tabletop or group chat.",
    ],
  ],
};

export default seo;
