const seo = {
  intro:
    "The Emoji Remover strips emoji, flags, skin-tone modifiers, keycaps and leftover variation selectors out of text while leaving the words untouched. It matches whole emoji sequences as defined by Unicode TR51 — a flag is two regional-indicator code points, a family is several pictographs joined by U+200D zero width joiners, a keycap is a digit plus U+FE0F plus U+20E3 — so nothing is left half-deleted the way a naive character-by-character regex does it. It is for people cleaning pasted captions, imported CSVs, scraped comments or AI-written copy before it goes into a database, an email or a print layout.",
  useCases: [
    "Clean emoji out of social media comments before importing them into a spreadsheet that mangles four-byte characters.",
    "Strip decoration from AI-generated marketing copy so the text fits a plain-text email or an SMS gateway.",
    "Remove flags and skin-tone variants from usernames before storing them in a legacy database column.",
  ],
  benefits: [
    ["Whole sequences, not fragments", "Deletes a family or flag in one piece instead of leaving orphaned joiners behind."],
    ["Keeps real punctuation", "Bare ©, ® and ™ stay by default, because they are punctuation far more often than emoji."],
    ["Cleans the residue too", "Optionally removes stray variation selectors, other Unicode symbols, double spaces and blank lines."],
  ],
  faqs: [
    [
      "Why does removing emoji with a simple regex leave strange characters behind?",
      "Because most emoji are multi-code-point sequences. The family emoji is four pictographs joined by three U+200D zero width joiners, and a flag is two regional-indicator letters — strip one code point and the invisible joiners or a half flag remain. This tool matches the whole TR51 sequence instead.",
    ],
    [
      "How many characters does one emoji count as?",
      "Between 1 and 11 UTF-16 code units. A simple face is 2, a skin-toned wave is 4, a flag is 4, a keycap like 1 with the enclosing ring is 3, and the four-person family emoji is 11. That is why the character count can drop far more than the emoji count suggests.",
    ],
    [
      "Does this remove symbols like stars and ticks as well?",
      "Only if you tick 'other symbols'. By default the tool removes Extended_Pictographic emoji; the extra option also clears characters in the Unicode 'other symbol' category such as ▣ that are not classed as emoji but still look like decoration.",
    ],
    [
      "Is my text uploaded anywhere?",
      "No. The matching and replacement run entirely in your browser with JavaScript regular expressions — there is no request to a server, so pasted drafts, customer comments and private notes never leave the tab.",
    ],
  ],
};

export default seo;
