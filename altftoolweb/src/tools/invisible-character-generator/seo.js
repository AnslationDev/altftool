const seo = {
  title: "Invisible Character Generator: U+200B, ZWJ, ZWNJ",
  metaDescription:
    "Copy Zero-Width Space (U+200B), ZWNJ, ZWJ, Non-Breaking Space (U+00A0) and 6 more, each with its code point and a preview toggle.",
  steps: [
    "Tick \"Show invisible character previews\" to render each blank character between brackets before you take it.",
    "Find the one you need by code point — U+200B Zero-Width Space, U+200C ZWNJ, U+200D ZWJ, U+00A0 Non-Breaking Space, U+2009 Thin Space.",
    "Press Copy on that card; the label flips to \"Copied!\" and the character is on your clipboard, with its Usage note printed underneath.",
  ],
  intro:
    "The Invisible Character Generator gives you 10 zero-width and blank Unicode characters — including Zero-Width Space (U+200B), Zero-Width Non-Joiner (U+200C), Zero-Width Joiner (U+200D), Non-Breaking Space (U+00A0), Thin Space (U+2009) and Invisible Separator (U+2063) — each with a one-click copy button. Every entry shows its official code point, what it does and where it is normally used, plus an optional preview mode that reveals the otherwise unseeable characters. It is for anyone who needs a blank-looking character that a form will still accept as text.",
  useCases: [
    "A game or app rejects an empty display name, so you copy a Zero-Width Space (U+200B) to submit a name that renders as blank.",
    "You are formatting a document and want '100 km' or a date to never wrap across lines, so you paste a Non-Breaking Space (U+00A0) between the number and the unit.",
    "You are debugging why a pasted string fails an equality check, and you copy each candidate zero-width character to test which one is hiding inside the input.",
  ],
  benefits: [
    [
      "Code points, not mystery blanks",
      "Each character is labelled with its exact Unicode code point (U+200B, U+200D, U+205F and so on) so you know precisely what you pasted.",
    ],
    [
      "Preview toggle",
      "A show-previews checkbox makes the invisible characters visible in place, so you can confirm you copied the right one before pasting.",
    ],
    [
      "Purpose noted for each",
      "Explains the real job of every character — ZWJ builds emoji sequences, ZWNJ blocks ligatures, LRM and RLM control bidirectional text — instead of listing them as interchangeable blanks.",
    ],
  ],
  faqs: [
    [
      "What is a zero-width space?",
      "U+200B is a Unicode character with no visible width that still counts as text and marks a valid line-break point. It lets you satisfy fields that require a non-empty value, and it prevents URLs or handles from being auto-linked when inserted mid-string.",
    ],
    [
      "What is the difference between a zero-width joiner and a non-joiner?",
      "The Zero-Width Joiner (U+200D) tells the renderer to combine adjacent characters, which is how multi-person emoji sequences are built, while the Zero-Width Non-Joiner (U+200C) does the opposite and blocks a ligature or cursive connection from forming. Both are invisible on their own.",
    ],
    [
      "Will an invisible character work in a username or bio?",
      "Sometimes. Many platforms strip or reject zero-width characters, and some treat repeated use as spam or impersonation, so test with a single character first and follow the site's own naming rules rather than assuming it will pass.",
    ],
    [
      "Which space stops a line from breaking?",
      "The Non-Breaking Space, U+00A0. Unlike an ordinary space it renders at normal width but forbids a line break at that point, which is why it is the standard choice between a number and its unit or between initials in a name.",
    ],
  ],
};

export default seo;
