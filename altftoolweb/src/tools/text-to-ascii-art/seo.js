const seo = {
  intro:
    "This tool converts typed text into big ASCII banner letters — the block lettering you see at the top of a README, in a terminal login message or in an old BBS signature. Each character is drawn from a 5 by 7 bitmap font, the same glyph-cell proportion used by classic character LCD modules, which is why the letters stay readable at banner size. Because the letters come from a bitmap rather than fixed pre-drawn art, one font produces every style: change the ink character, or overlay an offset copy for a drop shadow.",
  useCases: [
    "Put a project name in block letters at the top of a README or a shell script's help output.",
    "Generate a terminal message-of-the-day banner using the solid block character █ instead of #.",
    "Make a plain-text header for a chat message or a code comment where images are not allowed.",
  ],
  benefits: [
    ["One font, many looks", "Solid and drop-shadow styles both come from the same 5 × 7 bitmap."],
    ["Any ink character", "Render with #, █, ▓, *, @, $ or any single character you type."],
    ["Alignment you can paste", "Fixed-width cells and optional trailing-space trimming keep the art aligned in monospaced text."],
  ],
  faqs: [
    [
      "How do I make ASCII art from text?",
      "Type the word, choose an ink character and copy the result. Each letter is drawn on a 5-column by 7-row grid, so a five-letter word with one column of letter spacing comes out 29 characters wide and 7 rows tall. Paste it somewhere that uses a monospaced font — a proportional font will shear the alignment.",
    ],
    [
      "Which characters can this font draw?",
      "All 26 letters, the digits 0 to 9, the space, and 26 punctuation marks including . , ! ? ' \" - + = : ; / \\ ( ) [ ] < > # $ % & @ * and the underscore. Lower-case input is drawn with the upper-case glyph. Anything else is replaced by a question mark and reported.",
    ],
    [
      "Why does my ASCII art look crooked when I paste it?",
      "Almost always because the destination uses a proportional font, where an 'i' is narrower than an 'm'. ASCII art only lines up in a monospaced font such as the one in a code block, a terminal or a code editor. Wrapping is the other cause — turn off soft wrap or reduce the wrap width setting.",
    ],
    [
      "Does this work offline and is my text sent anywhere?",
      "The whole font and renderer run in JavaScript in your browser, so no text leaves the page and no request is made. Input is capped at 200 characters and output at 400 columns per line to keep the render instant.",
    ],
  ],
};

export default seo;
