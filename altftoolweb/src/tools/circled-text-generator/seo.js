const seo = {
  intro:
    "The Circled Text Generator swaps each letter and digit you type for its enclosed Unicode equivalent — ⓐ for a, ① for 1 — in four styles: Circled, Filled Circle, Double Circled and Parenthesized. It is for people writing bios, usernames, comments and captions in places that strip formatting, because the result is real text rather than an image or a font, so it survives copy and paste. Characters with no enclosed counterpart, including spaces and punctuation, pass through untouched.",
  useCases: [
    "You want a social bio or display name that stands out where bold and italic are unavailable, and need characters that paste intact into a plain-text field.",
    "You are numbering steps in a chat message or spreadsheet cell where a real numbered list is not an option, and want ①②③ inline instead of 1. 2. 3.",
    "You are labelling diagram callouts or footnote markers in a document and want single-character circled digits that sit on the baseline without extra styling.",
  ],
  benefits: [
    [
      "Four enclosed styles side by side",
      "Switch between Circled, Filled Circle, Double Circled and Parenthesized on the same input and pick whichever renders best where you are pasting.",
    ],
    [
      "Real characters, not a font",
      "The output is Unicode code points, so it keeps its shape in usernames, comments and messages where custom fonts and formatting are stripped away.",
    ],
    [
      "Non-destructive on the rest",
      "Spaces, punctuation and any character with no enclosed form are left exactly as typed, so a sentence stays readable rather than losing its gaps.",
    ],
  ],
  faqs: [
    [
      "What are circled letters actually made of?",
      "They are ordinary Unicode characters from the Enclosed Alphanumerics block, U+2460 to U+24FF. ① is U+2460, ⓪ is U+24EA and ⓐ is U+24D0 — each one is a single code point, not a letter with a drawn circle around it.",
    ],
    [
      "Will circled text work on Instagram, WhatsApp or Discord?",
      "Usually yes, because these are standard characters rather than formatting. Support depends on the font installed on the reader's device, so a style that renders on your phone may show as an empty box on someone else's — test the Circled style first, as it has the widest coverage.",
    ],
    [
      "Can I circle numbers above 9?",
      "Not as one character here — the mapping covers the digits 0 through 9 individually, so typing 10 produces ①⓪ rather than the single glyph ⑩. Multi-digit enclosed numerals exist in Unicode but are not part of this converter's digit map.",
    ],
    [
      "Is circled text readable by screen readers and searchable?",
      "Often not. Assistive technology and search indexes may read enclosed characters as symbols rather than as the letters they resemble, so keep circled text for decorative touches and leave anything that must be found or read aloud in plain letters.",
    ],
  ],
};

export default seo;
