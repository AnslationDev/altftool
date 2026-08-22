const seo = {
  title: "Grade-1 Braille Draft Maker with BRF Download",
  metaDescription:
    "Convert basic Latin text to uncontracted Grade-1 Braille cells, wrap at 20 to 42 cells per line, and download braille-draft.brf for a transcriber.",
  steps: [
    "Type or paste into Latin source text: a-z plus space, full stop, comma, question mark, exclamation mark, hyphen and apostrophe.",
    "Drag Cells per line anywhere from 20 to 42 (32 by default) to match your embosser's line width.",
    "Check the Unicode Braille preview for placeholder cells where a character was not supported, then press Download BRF draft to save braille-draft.brf.",
  ],
  intro:
    "The Braille Embosser Sheet Maker transliterates basic Latin text into uncontracted Grade-1 Braille one character at a time, showing it as Unicode Braille cells and exporting a BRF-style ASCII draft wrapped to a chosen line length. You set cells per line anywhere from 20 to 42 — 32 is the default and a common embosser width — and download the result as braille-draft.brf. It is a first-pass drafting aid for sighted staff preparing material for review, not a certified transcription: contractions, capital and number indicators and embosser page setup all still need a competent Braille reader or transcriber.",
  useCases: [
    "You are preparing a short handout label or shelf sign and want a Grade-1 draft to send to a transcriber rather than describing the text over email.",
    "You are checking how a line of text will wrap on an embosser set to 32 cells per line before committing paper to a run.",
    "You are teaching or learning the Grade-1 alphabet and want to see the exact six-dot cell for each letter of a familiar sentence.",
  ],
  benefits: [
    ["Shows the wrap, not just the characters", "Text is broken into fixed-width lines at your chosen cell count, so the preview reflects how the sheet will actually sit on the embosser."],
    ["Two views of the same output", "The Unicode Braille preview is readable on screen and by a refreshable display, while the downloaded .brf holds the ASCII-Braille equivalent embossers expect."],
    ["Marks what it could not convert", "Any character outside the supported set is replaced with a visible placeholder rather than silently dropped, so gaps are obvious before the file leaves your machine."],
  ],
  faqs: [
    [
      "What characters does this convert?",
      "The 26 Latin letters a–z plus space, full stop, comma, question mark, exclamation mark, hyphen and apostrophe. Anything else — digits, accented letters, other punctuation — is replaced with a visible placeholder cell so you can see exactly what needs manual attention.",
    ],
    [
      "Is this Grade 1 or Grade 2 Braille?",
      "Grade 1 only, meaning uncontracted, letter-for-letter Braille with no contractions or shortforms. Grade 2 contractions, which are what most published Braille uses, are not applied and have to be added by a transcriber.",
    ],
    [
      "Why are capital letters and numbers not handled?",
      "Because both need indicator cells that this draft does not insert — input is lowercased before conversion, so the capital sign and the number sign are simply absent. Any text containing names, headings or figures needs those indicators added before it is embossed.",
    ],
    [
      "Can I send the downloaded BRF file straight to an embosser?",
      "Treat it as a draft, not a production file. Page dimensions, margins, line and page counts, and the specific BRF profile your embosser expects are not set here, and the transliteration has the Grade-1 limits above — have the file checked by a competent Braille user or a qualified transcription service before it is embossed for someone to read.",
    ],
  ],
};

export default seo;
