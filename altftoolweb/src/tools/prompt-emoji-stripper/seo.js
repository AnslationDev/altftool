const seo = {
  title: "Prompt Emoji Remover: Strip Zero-Width Characters",
  metaDescription:
    "Removes emoji as whole grapheme clusters plus zero-width space, ZWJ, word joiner, soft hyphen and BOM, and reports the exact UTF-8 bytes saved.",
  steps: [
    "Paste or type into the 'Your prompt' textarea, which opens pre-filled with a five-line sample prompt carrying rocket, tick and cross emoji.",
    "Leave or clear the five checkboxes — Remove emoji and pictographs, Remove invisible characters, Remove decorative symbols, Strip variation selectors, Tidy leftover spacing — and use 'Replace each removed symbol with (optional)', capped at 16 characters, to swap a status emoji for a marker like [ok] instead of deleting it.",
    "Read the Symbols removed headline with the Characters and UTF-8 bytes before-and-after rows and the 'What was taken out' chips, then press Copy result for the stripped prompt; Reset restores the sample and all five toggles.",
  ],
  intro:
    "Prompt Emoji Stripper removes emoji, decorative symbols and invisible zero-width characters from a prompt, and reports the exact UTF-8 byte saving. Emoji are identified by the Unicode Extended_Pictographic property defined in UTS #51 and counted as whole grapheme clusters, so a country flag, a skin-tone modifier or a zero-width-joiner family sequence each count as one symbol rather than as their component code points. The invisible characters it catches — zero-width space, zero-width joiner, word joiner, soft hyphen and byte order mark — render as nothing but still consume tokens.",
  useCases: [
    "Clean a system prompt copied out of a Notion or Google Doc that silently carried zero-width characters into your codebase.",
    "Strip decorative emoji from a long prompt template before committing it, so diffs stay readable in a terminal.",
    "Replace status emoji with plain markers like [ok] instead of deleting them, keeping the meaning while dropping the multi-byte characters.",
    "Diagnose why a prompt string is longer in bytes than it looks on screen, by seeing exactly which invisible characters are present.",
  ],
  benefits: [
    [
      "Grapheme-correct counting",
      "A flag or skin-tone emoji is one symbol, not two or three code points, so the counts match what you actually see.",
    ],
    [
      "Invisible characters surfaced",
      "Zero-width and formatting characters are the ones you cannot spot by eye, and they are the most likely to have arrived by accident.",
    ],
    [
      "Honest token arithmetic",
      "Byte savings are exact and token savings are given as a range, because no single token count is correct across models.",
    ],
  ],
  faqs: [
    [
      "Do emoji use more tokens than regular text?",
      "Yes, substantially more per visible character. Most emoji sit outside the Basic Multilingual Plane and take four UTF-8 bytes each, and in common byte-pair vocabularies a single emoji typically costs between one and four tokens, against roughly four characters per token for plain English.",
    ],
    [
      "What are zero-width characters and why do they matter?",
      "They are code points that occupy no visual space: zero-width space U+200B, zero-width non-joiner U+200C, zero-width joiner U+200D, word joiner U+2060, soft hyphen U+00AD and byte order mark U+FEFF. Text copied from web pages and rich editors often carries them, and they still cost tokens, break exact string matching, and can corrupt a regex or a diff without any visible clue.",
    ],
    [
      "Should I remove emoji from my prompts?",
      "Usually yes for structural ornament — decorative bullets and rocket icons add cost without adding instruction. Keep them where they carry meaning, such as a status marker the model is asked to reproduce. Setting a replacement string rather than deleting preserves the signal at a fraction of the byte cost.",
    ],
    [
      "What is a variation selector and why strip it?",
      "U+FE0F and U+FE0E are invisible code points that tell a renderer whether to draw the preceding character as a colourful emoji or as plain text. Stripping U+FE0F keeps the base symbol, such as a check mark, but drops the emoji styling and its extra bytes.",
    ],
  ],
};

export default seo;
