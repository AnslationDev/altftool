const seo = {
  intro:
    "This converter rewrites text as Unicode code points — JavaScript \\uXXXX escapes, ES2015 \\u{XXXX} code-point escapes, U+XXXX notation, decimal values or HTML entities — and parses every one of those forms back into readable characters. It handles surrogate pairs correctly, so emoji and other characters above U+FFFF survive the round trip. It is for developers debugging encoding problems, and for anyone who needs to paste non-ASCII text into a system that only accepts ASCII.",
  useCases: [
    "Turn an accented brand name into \\u escapes so it can live in an ASCII-only source file or properties file",
    "Work out which invisible character is breaking a CSV import by escaping every character in the offending row",
    "Convert an emoji to its U+1F600 code point to look it up in the Unicode character database",
  ],
  benefits: [
    ["Six notations, both directions", "\\uXXXX, \\u{XXXX}, U+XXXX, decimal, &#NNN; and &#xHH; all encode and all decode."],
    ["Surrogate pairs done right", "Characters above U+FFFF are split into the correct high/low pair for JavaScript output."],
    ["Counts that actually differ", "Code points, UTF-16 units and UTF-8 bytes are reported separately, because for emoji they are three different numbers."],
  ],
  faqs: [
    [
      "What is the difference between \\uXXXX and \\u{XXXX}?",
      "\\uXXXX takes exactly four hex digits and addresses a single UTF-16 code unit, so anything above U+FFFF needs two of them — an emoji becomes \\uD83D\\uDE00. \\u{XXXX}, added in ES2015, takes one to six digits and addresses the code point directly, so the same emoji is just \\u{1F600}.",
    ],
    [
      "What is the highest valid Unicode code point?",
      "U+10FFFF, which is 1,114,111 in decimal. Anything above that is rejected, and so is the surrogate range U+D800 to U+DFFF, because those values only exist as halves of a UTF-16 pair and are not characters in their own right.",
    ],
    [
      "Why does one emoji count as two characters?",
      "Because JavaScript strings are UTF-16. An emoji like U+1F600 sits above U+FFFF, so it is stored as a surrogate pair and .length reports 2, even though it is one code point and one visible character. In UTF-8 the same emoji takes 4 bytes — this tool shows all three numbers side by side.",
    ],
    [
      "Which characters count as ASCII here?",
      "The printable range U+0020 to U+007E — space through tilde, as defined by ANSI X3.4-1986. Everything outside it, including tabs, newlines and control characters below U+0020, is treated as non-ASCII and escaped when you choose \"only non-ASCII characters\".",
    ],
  ],
};

export default seo;
