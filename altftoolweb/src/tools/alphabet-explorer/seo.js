const seo = {
  title: "Alphabet Explorer: 19 Scripts, Character by Character",
  metaDescription:
    "Latin, Greek, Cyrillic, Arabic, Hangul, Thai and 13 more scripts, each letter with its name, pronunciation, U+ code point and an example word.",
  intro:
    "Alphabet Explorer is a character-by-character reference for 19 writing systems — Latin, Greek, Cyrillic, Arabic, Hebrew, Devanagari, Hiragana, Katakana, Hangul, Thai, Urdu and eight Indic scripts — where tapping any letter shows its name, its romanised pronunciation, its Unicode code point and an example word in the language. It lays each script out in its own reading direction, so the three right-to-left scripts render and navigate right-to-left, and it can read a character aloud through the browser's speech synthesis. Each letter can be copied straight to the clipboard.",
  useCases: [
    "You are learning Hiragana and want to drill all 46 characters with the romanisation and a real example word next to each one",
    "You need the Unicode code point for a specific Devanagari or Greek letter to paste into a regex or a font-subset config",
    "You are setting a menu or a poster in Bengali and want to check you have copied the right character rather than a lookalike",
  ],
  benefits: [
    ["Reading direction is respected", "Arabic, Hebrew and Urdu grids lay out and arrow-key through right-to-left instead of being forced into Latin order."],
    ["Four facts per character", "Name, pronunciation, U+ code point and an example word — not just a glyph you have to identify yourself."],
    ["Searchable within a script", "Filter by glyph, letter name or pronunciation, so \"theta\" and \"θ\" both land on the same tile."],
  ],
  faqs: [
    [
      "How many letters are in the Greek alphabet?",
      "24, from Alpha (Α, U+0391) to Omega (Ω, U+03A9). Greek is the oldest documented alphabet still in use, and its letters double as standard symbols across mathematics and the sciences.",
    ],
    [
      "How many Hiragana characters are there?",
      "46 basic characters, listed here alongside the 45 basic Katakana. The two are parallel syllabaries for the same sounds — Hiragana is used for native Japanese words and grammar, Katakana mainly for loanwords and emphasis.",
    ],
    [
      "Which of these scripts are written right to left?",
      "Three of the 19: Arabic, Hebrew and Urdu. The grid switches to RTL layout for those, and the left and right arrow keys swap so that \"next character\" always means the next one in reading order.",
    ],
    [
      "How do I find a character's Unicode code point?",
      "Select the character and its U+ value is shown in the detail panel — Greek Alpha is U+0391, Cyrillic А is U+0410, Latin A is U+0041. Code points are what you need when writing a regex range, subsetting a font or debugging text that renders as boxes.",
    ],
  ],
};

export default seo;
