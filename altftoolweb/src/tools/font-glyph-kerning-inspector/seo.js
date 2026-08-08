const seo = {
  title: "Font Glyph Coverage Checker for Your Own Text",
  metaDescription:
    "Load a TTF, OTF, WOFF or WOFF2 locally and see which of your exact characters it renders. Coverage only — it does not read GPOS kern tables.",
  steps: [
    "Choose a TTF, OTF, WOFF or WOFF2 file with the Local file(s) picker — it is registered through the FontFace API in this tab, never uploaded.",
    "Paste the exact characters you need into the 'Characters, metadata edits, or processing notes' box, or leave it empty to test the default 63-character A-Z, a-z, 0-9 and space set, then press Run local workbench.",
    "The Verified result panel reports how many of the requested characters are supported and lists the font name plus every character that resolved.",
  ],
  intro:
    "This inspector loads a font file from your own machine with the browser's FontFace API and reports, character by character, which of the characters you asked for the font can actually render. You paste the exact string you care about — a headline, a name with diacritics, a currency symbol, a kerning-sensitive pair like AV or To — and it returns a supported-versus-requested count plus the list of characters that resolved, so you can see coverage gaps before the font ships. The font is registered only in your browser session; the file is never uploaded.",
  useCases: [
    "You bought or downloaded a display font and need to know whether it covers the accented characters in your client's name before setting their logotype in it",
    "A headline renders with boxes or fallback letters on one page and you want to confirm whether the font is missing those glyphs or the CSS stack is falling through",
    "You are shortlisting two fonts for a multilingual site and want to paste the same sample string into each and compare which characters come back supported",
  ],
  benefits: [
    ["Tests the exact characters you supply", "Paste your real copy instead of a generic pangram, so the report covers the ligatures, symbols and accents your project actually uses."],
    ["Answers per character, not per font", "The result lists which characters resolved, so a font that covers 60 of 63 tells you precisely which three are missing."],
    ["Nothing leaves the browser", "The file is registered through the FontFace API in your session only, which matters for licensed or unreleased fonts you cannot upload to a web service."],
  ],
  faqs: [
    [
      "How does it decide a character is supported?",
      "It registers your font under a temporary family name and asks the browser, for each unique character in your string, whether that family can render it at 24px. Characters that come back true are listed as covered; the rest are the gap.",
    ],
    [
      "What does it check if I do not enter any text?",
      "A default set of 63 unique characters: A-Z, a-z, 0-9 and a space. That is enough to confirm basic Latin coverage, but paste your own string if you need accents, currency symbols, punctuation or non-Latin scripts checked.",
    ],
    [
      "Does it read the font's kerning table?",
      "No. It reports glyph coverage from the browser's own font matching, not the GPOS kern pairs or OpenType feature list inside the file. To read raw kerning tables and feature tags you need a font editor such as FontForge or a table-dumping utility.",
    ],
    [
      "Which font file formats can I load?",
      "Whatever the browser's FontFace API accepts — typically TTF, OTF, WOFF and WOFF2. If a file fails to load, the tool reports the error rather than showing a partial result, which usually means the format is unsupported or the file is corrupt.",
    ],
  ],
};

export default seo;
