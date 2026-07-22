const info = {
  "love-calculator": {
    intro: [
      "The Love Calculator is a light-hearted game that turns two names into a playful compatibility percentage. Type in both names and it returns a score from 0 to 100 with a fun verdict — anything from 'Keep trying!' to 'Perfect match!'.",
      "It is purely for entertainment. The score is worked out from the letters in the two names using a fixed rule, so the same pair of names always gives the same result — there is no randomness and nothing about the score reflects a real relationship.",
    ],
    formula: {
      expression: "Score = ( Σ letterCodes ) mod 101",
      where: [
        ["letterCodes", "character codes of every letter in both names"],
        ["Σ", "the sum of those codes after lowercasing and sorting the letters"],
        ["mod 101", "keeps the result in the 0–100 range"],
      ],
      note: "Because the letters are lowercased and sorted before adding, the order of the two names does not change the score — 'Alex & Riya' scores the same as 'Riya & Alex'.",
    },
    howToUse: [
      "Enter the first name in the first box.",
      "Enter the second name in the second box.",
      "Read the percentage and the matching message as soon as both names are filled in.",
      "Try nicknames or full names — each spelling gives its own fixed score.",
    ],
    goodToKnow: [
      "The result is deterministic: identical names always produce identical scores, so you can re-check any pairing.",
      "Only letters count — spaces, digits and punctuation are ignored when the score is calculated.",
      "It is a novelty, not a scientific measure. No compatibility test based on names has any predictive value.",
    ],
    faqs: [
      {
        q: "Is the love score real?",
        a: "No. It is just for fun. The number comes from a simple rule applied to the letters of the names and says nothing about a real relationship.",
      },
      {
        q: "Why do I always get the same result for the same names?",
        a: "The calculator uses a fixed formula with no randomness, so a given pair of names always produces the same percentage. That is by design, so results are repeatable.",
      },
      {
        q: "Does the order of the names matter?",
        a: "No. The letters of both names are combined and sorted before the score is worked out, so swapping the two names gives exactly the same result.",
      },
      {
        q: "Why did changing the spelling change the score?",
        a: "The score depends on the exact letters entered. A nickname, a middle name or a different spelling changes the set of letters, and therefore the total, so the percentage shifts.",
      },
    ],
  },

  "dice-roller": {
    intro: [
      "The Dice Roller throws virtual dice for board games, tabletop RPGs, classroom activities or any time you need a fair random number. Choose how many dice to roll and how many sides each has, then press Roll to see every face and the combined total.",
      "It supports the common polyhedral dice — d4, d6, d8, d10, d12 and d20 — and can roll up to ten at once. Six-sided dice are shown with traditional pip patterns, while the others display their number.",
    ],
    formula: {
      expression: "Average total = n × (s + 1) / 2",
      where: [
        ["n", "number of dice rolled"],
        ["s", "number of sides on each die"],
        ["s + 1) / 2", "the average value of a single fair die"],
      ],
      note: "Each face is equally likely, so a single die averages (s + 1) / 2 — for a d6 that is 3.5. The average total scales with the number of dice, but any individual roll can land anywhere in the possible range.",
    },
    howToUse: [
      "Set the number of dice (1 to 10).",
      "Choose the number of sides per die (d4, d6, d8, d10, d12 or d20).",
      "Press Roll to generate a new throw.",
      "Read each die face and the total shown below them; press Roll again to re-throw.",
    ],
    goodToKnow: [
      "Rolls use the browser's cryptographic random generator with rejection sampling, so every face is equally likely with no bias.",
      "The lowest possible total is the number of dice (all ones) and the highest is dice × sides (all maximum faces).",
      "With several dice, totals cluster around the average and extreme totals become rare — rolling three d6 is far more likely to sum near 10–11 than to hit 3 or 18.",
      "Each roll is independent: previous results never influence the next throw.",
    ],
    faqs: [
      {
        q: "What do d4, d6, d20 mean?",
        a: "The 'd' stands for die and the number is how many sides it has. A d6 is a standard six-sided cube; a d20 is the twenty-sided die used in many role-playing games.",
      },
      {
        q: "Are the rolls truly random?",
        a: "They are drawn from the browser's cryptographically secure random source, and rejection sampling removes modulo bias, so results are as fair as a well-made physical die.",
      },
      {
        q: "What is the range of the total?",
        a: "The minimum total equals the number of dice (all showing 1) and the maximum equals the number of dice multiplied by the sides. For example, three d6 range from 3 to 18.",
      },
      {
        q: "Can I roll a mix of different dice at once?",
        a: "Each roll uses one die type for all the dice. To combine types, roll one type, note the result, then change the sides and roll again.",
      },
    ],
  },
};

export default info;
