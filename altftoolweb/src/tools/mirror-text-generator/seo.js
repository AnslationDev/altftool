const seo = {
  title: "Mirror Text Generator — Reverse Text Backwards",
  metaDescription:
    "Reverses the character order of your text as you type — 'Hello world' becomes 'dlrow olleH'. Letters keep their normal shapes; copy in one click.",
  steps: [
    "Type or paste into the Input pane, or click Load sample to insert 'Hello world'.",
    "The Result pane reverses the character order live — 'Hello world' becomes 'dlrow olleH', with spaces and punctuation moved too.",
    "Click Copy above the Result pane to take the reversed text; Clear empties the input.",
  ],
  intro:
    "The Mirror Text Generator reverses the character order of whatever you type, so \"Hello world\" becomes \"dlrow olleH\" and reads back-to-front. It rewrites the sequence only — the letters keep their normal shapes rather than being replaced with mirrored glyphs — and the reversed result updates as you type, ready to copy. It suits anyone making a puzzle, a novelty username or a string that has to be read right to left.",
  useCases: [
    "You are writing a treasure hunt or escape-room clue and want one line that only makes sense when the players hold it up to a mirror or read it backwards.",
    "You want a social handle or display name that looks like a scrambled version of your own, and you need the exact reversed spelling to check it is still available.",
    "You are testing how your app renders an unusual string and want a quick reversed version of a sentence to paste into the field.",
  ],
  benefits: [
    ["Exact character reversal", "Every character, including spaces and punctuation, is moved to the mirrored position — nothing is dropped, added or re-cased."],
    ["Live output", "The reversed text appears as you type rather than behind a convert button, so you can adjust wording and see the result immediately."],
    ["Copy in one click", "The result has its own copy button, so a reversed name or clue goes straight into the field you need it in."],
  ],
  faqs: [
    [
      "Does this flip the letters or just the order?",
      "Just the order. Reversing \"Hello world\" gives \"dlrow olleH\" with normal upright letters; producing genuinely mirror-imaged glyphs would need a different character set or a CSS transform, not a reordering.",
    ],
    [
      "Will my text still read correctly in a mirror?",
      "Only partly. Holding reversed text to a mirror restores the left-to-right order, but each letter is also flipped by the mirror, so asymmetric letters like R, S and G look wrong. For a true mirror-writing effect, print the normal text and flip the image instead.",
    ],
    [
      "What happens to emoji and accented characters?",
      "Emoji, flags and letters written as a base character plus a combining accent can break, because reversal works on individual code units rather than on whole grapheme clusters. Plain Latin text, digits and punctuation reverse cleanly; check any output containing emoji before using it.",
    ],
    [
      "Can I reverse the word order instead of the characters?",
      "Not here — this reverses characters, which also reverses the words as a side effect but spells each one backwards. If you want \"world Hello\", you need a word-order reversal tool rather than a character mirror.",
    ],
  ],
};

export default seo;
