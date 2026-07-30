const seo = {
  intro:
    "The Emoji Translator swaps whole words for emoji using a fixed dictionary of 377 English words — greetings, feelings, animals, food, weather, verbs, family terms and the numbers one to ten — while leaving everything it does not recognise as plain text. Type a sentence and it converts as you go in live mode, keeping trailing punctuation attached so 'happy!' becomes '😊!'. It is a word-for-word substitution, not a meaning-based translation, so the same input always produces the same output.",
  useCases: [
    "You are writing an Instagram or TikTok bio and want a few key words — love, coffee, travel, music — rendered as emoji instead of spelled out.",
    "You are setting a birthday message or party invite in a group chat and want the food, cake and party words replaced automatically rather than hunting through the emoji picker.",
    "You are making an emoji-guessing game and need a sentence converted into symbols for other people to decode back into words.",
  ],
  benefits: [
    [
      "Punctuation survives the swap",
      "Each word is stripped to its letters for lookup, then any trailing comma, full stop or exclamation mark is re-attached to the emoji so sentence rhythm holds.",
    ],
    [
      "Unknown words are kept, not dropped",
      "Anything outside the dictionary passes through unchanged, so a translated sentence stays readable instead of collapsing into gaps.",
    ],
    [
      "Deterministic dictionary",
      "The same word always maps to the same emoji, which makes converted text reproducible — useful when you want a bio or a game clue to stay identical every time.",
    ],
  ],
  faqs: [
    [
      "How many words can it translate?",
      "377 distinct English words, grouped into greetings and reactions, emotions, people and family, animals, food and drink, places and weather, common verbs, time words and the number words one through ten. Words outside that list are left exactly as typed.",
    ],
    [
      "Does it translate emoji back into words?",
      "No — the conversion runs one way, from text to emoji. There is no reverse lookup, so an emoji-only message pasted in will come back unchanged.",
    ],
    [
      "Why did only some of my words turn into emoji?",
      "Matching is on the whole word after lowercasing and removing non-alphanumeric characters, so it hits 'happy' but not 'happier' or 'happiness', and it never matches part of a longer word. Plurals only convert when the plural itself is in the dictionary, as with hugs, hearts and books.",
    ],
    [
      "Is the output safe to paste into any app?",
      "Yes, these are standard Unicode emoji, so they work in Instagram, WhatsApp, Discord, X and SMS. A few entries use multi-character sequences — 👨‍🍳 for cook and 👩‍👧 for mother, for example — which older systems may render as two separate figures.",
    ],
  ],
};

export default seo;
