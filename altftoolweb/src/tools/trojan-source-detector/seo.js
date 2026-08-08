const seo = {
  title: "Trojan Source Detector: Bidi & Homoglyph Scanner",
  metaDescription:
    "Scan pasted code for 12 bidirectional controls, 8 invisible characters and mixed-script identifiers, each reported with line, column and code point.",
  steps: [
    "Paste code into the Source text box (limit 1,000,000 characters) or use Choose file for a .js, .py, .go, .rs or other listed text source; Load Unicode sample drops in a Cyrillic-homoglyph example.",
    "Press Run local inspection — nothing is parsed or executed, the scan only looks for the 12 bidirectional controls, 8 invisible characters and Latin/Cyrillic/Greek identifier mixes.",
    "Read the Characters, Findings, Retained, High and Review metrics, each finding's line and column with its escaped evidence, and the \"Controls made visible\" preview of the first 12,000 characters; Download report saves trojan-source-redacted-report.txt.",
  ],
  intro:
    "The Trojan Source Detector scans pasted source code for the Unicode tricks that make a file read differently to a human than it compiles — the 12 bidirectional formatting controls behind the Trojan Source attack, 8 normally invisible characters such as zero-width space and soft hyphen, and identifiers that mix Latin letters with look-alike Cyrillic or Greek ones. Every hit is reported with its line, column, code point and an escaped rendering, and the on-page preview echoes back up to 12,000 characters of the source with each control made visible as \\u{...}. It is for reviewers and maintainers who have to decide whether a patch really says what it appears to say, without running the code.",
  useCases: [
    "A pull request from an unfamiliar contributor touches an access-control check, and you want to confirm no right-to-left override is reordering the comment and the condition on screen.",
    "Two functions in a diff look identically named but the linker disagrees, and you need to see which one has a Cyrillic 'о' or 'а' standing in for the Latin letter.",
    "You are pasting a dependency snippet from a forum or gist into your codebase and want to check it for zero-width characters before it enters version control.",
  ],
  benefits: [
    [
      "Invisible characters rendered visible",
      "The on-page preview (up to 12,000 characters) is echoed with every control rewritten as \\u{202E}-style notation, so you read the file as the compiler does rather than as the font draws it. The downloadable report is a separate, redacted findings summary rather than a full-text export.",
    ],
    [
      "Homoglyphs mapped to their Latin twin",
      "Mixed-script identifiers are reported with a skeleton that folds confusable Cyrillic and Greek letters to Latin, which is what exposes two names that render alike.",
    ],
    [
      "High findings never crowded out",
      "When a file produces more than 300 findings, high-severity hits displace lower ones in the retained list instead of being lost off the end.",
    ],
  ],
  faqs: [
    [
      "What is a Trojan Source attack?",
      "It is a technique that uses Unicode bidirectional formatting controls to make source code display in a different order than it is actually parsed, so a reviewer approves logic that the compiler never sees. It was published in 2021 as CVE-2021-42574, alongside the related homoglyph issue CVE-2021-42694, and affects most languages because the trick lives in the text encoding rather than in any one compiler.",
    ],
    [
      "Which Unicode characters does the scan look for?",
      "Twelve bidirectional controls — including RIGHT-TO-LEFT OVERRIDE (U+202E), the LTR and RTL embeddings, and the isolate characters U+2066 to U+2069 — plus eight invisible characters such as ZERO WIDTH SPACE (U+200B), ZERO WIDTH JOINER (U+200D), SOFT HYPHEN (U+00AD) and the byte-order mark U+FEFF. Overrides and isolates are rated high; marks and invisible characters are rated review.",
    ],
    [
      "Is a finding always malicious?",
      "No. Bidirectional controls are legitimate and necessary in Arabic, Hebrew and other right-to-left text, and a zero-width joiner can be a real part of a string literal or an emoji sequence. Treat each finding as something to explain rather than something to remove blindly, and pay closest attention when a control appears inside code rather than inside a string or comment.",
    ],
    [
      "Does a clean scan mean the code is safe?",
      "No — this is a focused heuristic inspection, not a full implementation of the Unicode security profiles, and it does not execute or otherwise analyse the code. It scans up to 1,000,000 characters and retains 300 findings for display, so treat a clean result as one review signal alongside normal code review and your CI security checks.",
    ],
  ],
};

export default seo;
