const seo = {
  title: "Unicode to ASCII Converter — Both Directions",
  h1: "Unicode to ASCII Converter",
  metaDescription:
    "Convert Unicode to ASCII escapes and back — JavaScript, U+XXXX, decimal and HTML entity notations. Surrogate pairs handled. Free, runs in your browser.",
  intro:
    "The Unicode / ASCII Converter escapes text into six code-point notations — JavaScript \\uXXXX, ES2015 \\u{XXXX}, U+XXXX, decimal, &#NNN; and &#xHH; — and parses all of them, plus \\xHH and plain decimal lists, back into readable characters. It walks the string with Array.from and codePointAt so astral characters stay whole, then builds UTF-16 surrogate pairs using the arithmetic in the Unicode Standard §3.9 D91, which is why an emoji survives a round trip instead of splitting in half. \"ASCII\" here means the printable ANSI X3.4-1986 range U+0020 to U+007E; anything outside it is escaped, and UTF-8 byte counts come from the browser's built-in TextEncoder. Every step is plain client-side JavaScript, so the text you paste never leaves the page.",
  useCases: [
    "Rewriting an accented product or brand name as \\u escapes so it can sit in an ASCII-only source file, .properties file or legacy config",
    "Tracking down the invisible character breaking a CSV or JSON import by escaping every character in the offending line",
    "Turning a pasted emoji into its U+1F600 code point to look it up in the Unicode character database or quote it in a bug report",
  ],
  benefits: [
    [
      "Six notations, both directions",
      "\\uXXXX, \\u{XXXX}, U+XXXX, decimal, &#NNN; and &#xHH; all encode. The decoder additionally accepts \\xHH and bare decimal lists separated by spaces, commas or semicolons, and you can mix forms in one input.",
    ],
    [
      "Surrogate pairs done right",
      "Characters above U+FFFF are split into the correct high/low pair for JavaScript output, and a lone \\uD83D half re-pairs with its partner on decode instead of erroring — an unpaired one is reported rather than silently mangled.",
    ],
    [
      "Three counts that disagree on purpose",
      "Code points, UTF-16 units and UTF-8 bytes are reported separately, because for a single emoji they are 1, 2 and 4. Non-ASCII and beyond-the-BMP character counts are shown alongside them.",
    ],
    [
      "Nothing leaves the page",
      "Encoding, decoding and the byte count all run in your browser tab. There is no upload, no server request and no account — the only limit is 100,000 characters per conversion.",
    ],
  ],
  faqs: [
    [
      "How do I convert Unicode to ASCII?",
      "Paste the text and pick an output notation — every non-ASCII character is replaced by its code point, so \"Café\" becomes Café in JavaScript notation or Caf&#233; as an HTML entity. Only the printable ASCII range U+0020 to U+007E is left alone; switch the second dropdown to \"every character\" if you need the plain letters escaped too.",
    ],
    [
      "Can I convert the escapes back to normal text?",
      "Yes — switch to \"Codes → text\". The decoder accepts \\uXXXX, \\u{XXXX}, \\xHH, U+XXXX, &#NNN;, &#xHH; and plain decimal lists like \"72 105 33\", and different forms can be mixed in the same input. The Swap button pushes whatever is in the output box straight into the other direction.",
    ],
    [
      "What is the difference between \\uXXXX and \\u{XXXX}?",
      "\\uXXXX takes exactly four hex digits and addresses one UTF-16 code unit, so anything above U+FFFF needs two of them — an emoji becomes 😀. \\u{XXXX}, added in ES2015, takes one to six digits and addresses the code point directly, so the same emoji is just \\u{1F600}.",
    ],
    [
      "Why does one emoji count as two characters?",
      "Because JavaScript strings are UTF-16. An emoji like U+1F600 sits above U+FFFF, so it is stored as a surrogate pair and .length reports 2, even though it is one code point and one visible character. The same emoji is 4 bytes in UTF-8 — this tool shows all three numbers side by side.",
    ],
    [
      "What is the highest valid Unicode code point?",
      "U+10FFFF, which is 1,114,111 in decimal. Anything above that is rejected, and so is the surrogate range U+D800 to U+DFFF, because those values exist only as halves of a UTF-16 pair and are not characters in their own right.",
    ],
    [
      "Which characters count as ASCII here?",
      "The printable range U+0020 to U+007E — space through tilde, as defined by ANSI X3.4-1986. Everything outside it is treated as non-ASCII and escaped in \"only non-ASCII\" mode, including tabs, newlines and the control characters below U+0020.",
    ],
    [
      "Why do the decimal and U+XXXX outputs escape ordinary letters too?",
      "Because both are lists of numbers rather than inline escapes. The other four notations leave printable ASCII untouched in \"only non-ASCII\" mode, but a number list with letters dropped into it would be unreadable, so those two convert every character and join the values with a space.",
    ],
    [
      "Is the Unicode to ASCII converter free, and is my text uploaded?",
      "It is free and nothing is uploaded. The conversion runs as JavaScript inside your own browser tab, with no server request and no signup. Input is capped at 100,000 characters per conversion — a guard so pasting a whole document cannot lock up the tab.",
    ],
  ],
  steps: [
    "Paste your text and choose an output notation — JavaScript \\uXXXX, ES2015 \\u{XXXX}, U+XXXX, decimal, or an HTML entity.",
    "Choose whether to escape only non-ASCII characters or every character, then copy the result.",
    "To go the other way, switch to \"Codes → text\" (or press Swap) and paste escapes, entities or a decimal list.",
  ],
};

export default seo;
