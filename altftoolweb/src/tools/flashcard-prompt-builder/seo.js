const seo = {
  title: "Flashcard Prompt Builder: Anki-Ready AI Decks",
  metaDescription:
    "Build an AI prompt for one-fact-per-card decks — basic Q&A, term-definition or Anki cloze — output as tab-separated lines; decks over 40 cards auto-batch.",
  steps: [
    "Enter a Deck topic, set the Number of cards (1–500) and optionally paste Source notes so cards are limited to that material.",
    "Pick a Card format — Basic question → answer, Term → definition or Cloze deletion — and keep 'Tab-separated output for Anki import' ticked.",
    "Click Copy prompt; decks over 40 cards are split into near-equal batches so no AI response truncates mid-deck.",
  ],
  intro:
    "The Flashcard Prompt Builder creates an AI prompt that outputs a clean, importable flashcard deck — one fact per card, in basic Q&A, term-definition or Anki cloze format. The card rules follow the minimum information principle from SuperMemo's Twenty Rules of Formulating Knowledge, and output is tab-separated front/back lines that import directly into Anki. Decks over 40 cards are automatically split into batches so no response gets truncated.",
  useCases: [
    "A language learner turns a vocabulary list into 30 term-definition cards and imports the tab-separated output straight into Anki.",
    "A medical student pastes lecture notes as source material so every generated card is grounded in the actual course content.",
    "A teacher builds a 120-card review deck, delivered in three batches of 40 so the AI never truncates mid-deck.",
  ],
  benefits: [
    ["One fact per card", "The prompt enforces the minimum information principle — no compound questions, no yes/no cards, no duplicates."],
    ["Import-ready output", "Tab-separated front/back lines with no numbering or commentary paste directly into Anki's text import."],
    ["Batching for big decks", "Requests over 40 cards are split into near-equal batches, keeping every response complete and on-format."],
  ],
  faqs: [
    [
      "What is the minimum information principle for flashcards?",
      "It is the rule that each flashcard should test exactly one small fact with the shortest possible answer, formulated in SuperMemo's Twenty Rules of Formulating Knowledge. Cards built this way are faster to review and produce more reliable recall than cards that bundle several facts, so the generated prompt enforces it explicitly.",
    ],
    [
      "Can I import the generated cards into Anki?",
      "Yes. With the tab-separated option on, the AI outputs one card per line as front, a tab, then back — the plain-text format Anki's File > Import accepts directly. You can also add a third tag column for organising the deck.",
    ],
    [
      "What is a cloze deletion card?",
      "A cloze card hides a key word inside a full sentence, shown as {{c1::hidden text}} in Anki's cloze syntax. The prompt limits each card to a single deletion, because multi-blank sentences violate the one-fact-per-card rule and are harder to grade honestly during review.",
    ],
    [
      "Why does the tool split large decks into batches?",
      "A single AI response reliably holds format for roughly 40 cards; beyond that, decks get truncated or drift from the tab-separated layout. Decks up to 500 cards are therefore split into near-equal batches, and the prompt tells the AI to wait for \"next\" between batches.",
    ],
  ],
};

export default seo;
