const seo = {
  title: "Subscript Generator: Type H₂O and CO₂ Anywhere",
  metaDescription:
    "Turns typed digits into real Unicode subscripts, U+2080 to U+2089, plus the + − = ( ) operators, so H₂SO₄ pastes as plain text anywhere.",
  steps: [
    "Type or paste your formula into the Input Text box — the character count updates beneath it.",
    "Open the info button for the Supported Characters list, and watch the amber 'Unsupported characters' warning for anything with no subscript form.",
    "Press Copy to take the Subscript Output as plain Unicode text, or Reset to clear the input.",
  ],
  intro:
    "The Subscript Generator rewrites typed text using Unicode subscript characters — digits 0–9 become the real subscript code points U+2080 to U+2089 and the operators + − = ( ) become U+208A to U+208E — so the result is plain text you can paste anywhere without formatting. It is for anyone who needs H₂O or CO₂ in a field that has no formatting toolbar: chemistry notes, social bios, spreadsheet headers, filenames. Characters with no subscript form are passed through unchanged and listed so you know exactly what did not convert.",
  useCases: [
    "Typing a chemical formula like H₂SO₄ into a Google Sheets header, a Slack message or a YouTube title where there is no subscript button.",
    "Labelling variables as x₁, x₂, x₃ in a plain-text assignment, a code comment or a README table that has to stay ASCII-friendly apart from the subscripts.",
    "Adding a subscripted flourish to a social media display name or bio, where the platform strips HTML but keeps Unicode.",
  ],
  benefits: [
    ["Output is characters, not formatting", "The result survives copy-paste into any field, because each subscript is its own Unicode code point rather than a styled span."],
    ["Flags what it could not convert", "Any character with no subscript equivalent is listed in a warning instead of silently coming out looking normal."],
    ["Shows the full supported set", "An inline reference lists every character the converter handles, so you can check coverage before retyping a formula."],
  ],
  faqs: [
    [
      "Which characters have real Unicode subscripts?",
      "All ten digits, at U+2080 through U+2089, plus plus, minus, equals and the two parentheses at U+208A through U+208E. Those are the code points this converter uses for numbers and operators.",
    ],
    [
      "Why doesn't every letter convert properly?",
      "Unicode never defined a complete subscript alphabet — only a partial set of letters exists in the U+2090 block, and several common ones, including most capitals, have no subscript form at all. Letters outside that set fall back to the nearest available modifier-letter code point or stay as typed.",
    ],
    [
      "Will subscript text work on Instagram, Twitter/X and Word?",
      "Yes in almost all cases, because the output is standard Unicode rather than rich text. The exception is an app or font that lacks glyphs for these code points, where you may see boxes — subscript digits are the most widely supported and safest to use.",
    ],
    [
      "Is subscript text searchable and readable by screen readers?",
      "Only partially. Search engines and screen readers treat U+2082 as a separate character from the digit 2, so subscripted words can be missed by search and read out oddly. Use it for formulas and short labels, not for body text you want indexed.",
    ],
  ],
};

export default seo;
