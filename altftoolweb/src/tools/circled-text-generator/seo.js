const seo = {
  title: "Circled Text Generator - 4 Enclosed Unicode Styles",
  metaDescription:
    "Convert letters to enclosed Unicode in four styles: Circled, Filled Circle, Filled Square and Parenthesized. Real Unicode characters, not a font.",
  intro:
    "The Circled Text Generator swaps supported letters for enclosed Unicode equivalents — ⓐ for a — in four styles: Circled, Filled Circle, Filled Square and Parenthesized. Filled Square uses Unicode's Negative Squared Latin Capital Letter characters. Circled and Filled Circle map digits 0 through 9, Parenthesized maps 1 through 9, and Filled Square has no digit mapping. It is real text rather than an image or font; characters with no mapping, including spaces, punctuation and unsupported digits, pass through untouched.",
  useCases: [
    "You want a social bio or display name that stands out where bold and italic are unavailable, and need characters that paste intact into a plain-text field.",
    "You are numbering steps in a chat message or spreadsheet cell where a real numbered list is not an option, and want ①②③ inline instead of 1. 2. 3.",
    "You are labelling diagram callouts or footnote markers in a document and want single-character circled digits that sit on the baseline without extra styling.",
  ],
  benefits: [
    [
      "Four enclosed letter styles side by side",
      "Switch between Circled, Filled Circle, Filled Square and Parenthesized on the same input. Circled and Filled Circle map 0-9, Parenthesized maps 1-9, and Filled Square changes letters only.",
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
      "Not as one character here. Circled turns 10 into ①⓪, while Parenthesized turns it into ⑴0 because Unicode has parenthesized digits 1-9 but no matching parenthesized zero. Filled Square has no digit mapping and leaves 10 unchanged. Multi-digit enclosed numerals are not part of this converter.",
    ],
    [
      "Is circled text readable by screen readers and searchable?",
      "Often not. Assistive technology and search indexes may read enclosed characters as symbols rather than as the letters they resemble, so keep circled text for decorative touches and leave anything that must be found or read aloud in plain letters.",
    ],
  ],
};

export default seo;
