const seo = {
  intro:
    "The Unicode Escape Tool converts every non-ASCII character in your text — anything above code point 127 — into a \\uXXXX escape with four lowercase hex digits, and reverses the same escapes back into readable characters. Escaping leaves plain ASCII untouched, so \"Café\" becomes \"Caf\\u00e9\" and nothing else in the string changes. It is the form JavaScript, JSON and Java source files use, so the output pastes straight into code that has to survive an ASCII-only pipeline.",
  useCases: [
    "A build step or legacy log system mangles accented characters, so you escape the strings in your locale file to \\uXXXX and let the runtime decode them.",
    "You received a JSON payload full of \\u00e9 and \\u2019 sequences and want to read what it actually says before deciding whether the encoding is broken.",
    "You are pasting a name with a non-Latin script into a config file whose parser is not reliably UTF-8, and you need an escaped form that is safe to commit.",
  ],
  benefits: [
    [
      "ASCII passes through untouched",
      "Only characters above U+007F are escaped, so code, punctuation and markup around the special characters stay readable.",
    ],
    [
      "Round-trips both directions",
      "One switch flips between escaping and unescaping, so you can verify a conversion by running the output back through.",
    ],
    [
      "Standard four-digit form",
      "Escapes are emitted as \\u plus exactly four hex digits, the syntax accepted by JavaScript, JSON, Java and C# string literals.",
    ],
  ],
  faqs: [
    [
      "Which characters get escaped?",
      "Every character with a code unit above 127 — accented letters, curly quotes, CJK, symbols and emoji — while the ASCII range 0 to 127 is passed through unchanged. That means a line of English text with one accented word comes back almost identical, with a single escape where the accent was.",
    ],
    [
      "How are emoji and other characters beyond the BMP handled?",
      "They are escaped as a surrogate pair, so a single emoji produces two \\uXXXX escapes — U+1F600 becomes \\ud83d\\ude00. This is the same representation JavaScript and JSON use internally, and unescaping the pair restores the original character.",
    ],
    [
      "Does this escape newlines, tabs or quotes?",
      "No. Those are ASCII characters, so they are left as-is rather than turned into \\n, \\t or \\\". If you need a fully escaped string literal, escape those separately after running the Unicode conversion.",
    ],
    [
      "What is the difference between \\uXXXX and \\u{XXXXX} or &#x...;?",
      "\\uXXXX is the fixed four-hex-digit form used by JSON and older JavaScript, \\u{...} is the ES6 code-point form that can hold more than four digits, and &#x...; is the HTML numeric reference. This tool reads and writes the four-digit \\uXXXX form only, which is the one JSON accepts.",
    ],
  ],
};

export default seo;
