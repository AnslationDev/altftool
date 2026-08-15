const seo = {
  title: "Superscript Generator — Unicode Text You Can",
  metaDescription:
    "Turn digits, letters and + − = ( ) into real Unicode superscript that survives a paste anywhere. Characters with no raised form are listed, not hidden.",
  steps: [
    "Type or paste into the Input Text box ('Type or paste your text here…'); a live character count sits underneath it.",
    "The Superscript Output panel converts as you type — digits become ⁰¹²³⁴⁻⁹, + − = ( ) become their U+207A-U+207E forms — and anything with no raised form, such as lowercase q, is listed under 'Unsupported characters' and left exactly as typed.",
    "Press Copy to put the Unicode superscript on your clipboard, use the info button to see the full Supported Characters list, or press Reset to empty the box.",
  ],
  intro:
    "The Superscript Generator rewrites typed text as Unicode superscript characters — digits become ⁰ ¹ ² ³ ⁴–⁹ (U+2070, U+00B9–00B3 and U+2074–2079), the operators + − = ( ) become U+207A–U+207E, and most letters map to their raised modifier-letter forms. Because the output is real characters rather than formatting, it survives a paste into a tweet, a spreadsheet cell, a filename or a plain-text field with no formatting toolbar. Anything with no superscript form is left as typed and listed so you know what did not convert.",
  useCases: [
    "Writing m² or 10⁶ in a Google Sheets column header, a Slack message or a marketplace listing where superscript formatting is not available.",
    "Adding footnote markers such as ¹ and ² to a plain-text document, an email signature or a code comment.",
    "Styling a social bio or display name with raised text on a platform that strips HTML but keeps Unicode.",
  ],
  benefits: [
    ["Output is characters, not styling", "Each superscript is its own Unicode code point, so it survives copy-paste anywhere a styled span would be flattened."],
    ["Names the characters it cannot convert", "Unsupported input is listed in a warning rather than quietly passing through looking like ordinary text."],
    ["Covers operators, not only digits", "Plus, minus, equals and parentheses have true superscript forms here, so an exponent like x⁽ⁿ⁺¹⁾ comes out complete."],
  ],
  faqs: [
    [
      "How do I type squared and cubed as plain text?",
      "Use ² (U+00B2) and ³ (U+00B3), which are the same characters this converter produces from 2 and 3. They date back to Latin-1, so they render correctly in practically every font and application.",
    ],
    [
      "Which letters have no superscript version?",
      "Lowercase q has no superscript form, and among capitals C, F, Q, S, X, Y and Z are missing from Unicode. Those characters are left exactly as you typed them, and the tool lists them as unsupported.",
    ],
    [
      "Will superscript text work on Twitter/X, Instagram and Word?",
      "Yes in nearly all cases, since it is standard Unicode rather than rich text. Superscript digits are the most reliably supported; some raised letters may show as boxes in fonts that lack the glyph.",
    ],
    [
      "Does superscript text hurt SEO or accessibility?",
      "It can. Search engines and screen readers treat ² as a distinct character from the digit 2, so superscripted words may not match a search and can be read out strangely. Keep it to formulas, exponents and short markers rather than body copy.",
    ],
  ],
};

export default seo;
