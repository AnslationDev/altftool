const seo = {
  intro:
    "Paste your notes and this maker turns them into two-sided flashcards by pattern-matching four shapes of line: 'Term: definition', 'Question? answer', 'X is / means / refers to / is defined as Y' (which becomes 'What is X?'), and a fallback that turns any longer sentence into a prompt from its first three words. You can then edit the cards, tag each easy, medium or hard, and study the deck three ways — review, typed quiz, or a rapid round with a 15-second countdown per card. Decks live in your browser's local storage and export as a dated JSON file.",
  useCases: [
    "You have a page of lecture notes written as 'Term: definition' lines and want a deck out of them in one paste instead of typing 60 cards",
    "You keep recognising answers without recalling them, so you want the typed quiz mode that only accepts the exact answer text rather than a flip-and-nod",
    "You are cramming the night before and want a shuffled 15-second-per-card round to find which terms you still stall on",
  ],
  benefits: [
    [
      "Four extraction patterns, not one",
      "Colon definitions, question lines, 'is/means/refers to' sentences and long fallback sentences are each handled, so mixed-format notes still yield cards.",
    ],
    [
      "Typed answers are actually checked",
      "Quiz mode compares your typed answer to the card back after trimming and lowercasing, so it tests recall rather than recognition.",
    ],
    [
      "Duplicates are dropped as cards are built",
      "Generated cards are deduplicated on the front text, so a term repeated across several lines of notes does not become several identical cards.",
    ],
  ],
  faqs: [
    [
      "What format should my notes be in?",
      "One item per line. A line with a colon becomes term on the front and definition on the back; a line ending in a question mark splits at the question mark; and a sentence like 'Osmosis is the movement of water across a membrane' becomes 'What is Osmosis?' on the front. Lines under 10 characters are ignored.",
    ],
    [
      "How does rapid mode differ from review?",
      "Rapid shuffles the deck and gives you 15 seconds per card, auto-advancing when the countdown hits zero. Review keeps the deck in its saved order and waits for you; quiz mode also shuffles but asks you to type the answer before revealing the back.",
    ],
    [
      "Where are my decks stored?",
      "In your browser's local storage under a single key on this device — there is no account and no sync. Use the export button to save the decks as a JSON file named with the current date if you want a backup or want them on another machine.",
    ],
    [
      "Why did my typed answer get marked wrong?",
      "The check is an exact match after trimming whitespace and lowercasing both sides, so 'Paris.' with a full stop does not match a card back of 'Paris'. Keep card backs short and single-phrase if you plan to use quiz mode heavily.",
    ],
  ],
};

export default seo;
