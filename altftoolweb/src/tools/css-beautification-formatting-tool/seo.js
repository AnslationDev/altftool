const seo = {
  intro:
    "The CSS Beautification and Formatting Tool re-indents CSS with a real tokenizer that understands strings, comments and block at-rules, and at the same time returns a minified version and a validation report. It is for developers cleaning up inherited or minified stylesheets who want the formatted output, the byte savings, and a list of syntax problems in one pass. Indent width, bracket placement, line spacing and alphabetical property sorting are all switchable, and the validator flags missing braces, missing semicolons and duplicate properties.",
  useCases: [
    "You inherited a single-line minified stylesheet from a previous build and need it re-indented with 4 spaces before you can read the cascade and work out what to delete.",
    "A rule is not applying and you suspect a stray brace — the validator reports 'Missing closing brace' or an unexpected closing brace with the token position instead of leaving you to count.",
    "You are checking whether a hand-written stylesheet is worth minifying, and the stats panel gives you the input, formatted and minified character counts plus the percentage saved.",
  ],
  benefits: [
    [
      "Formats and validates in the same pass",
      "Alongside the indented output you get errors for missing braces or absent declarations, warnings for missing semicolons, and hints for duplicate properties inside a block.",
    ],
    [
      "Four formatting choices, not one house style",
      "Indent of 2 spaces, 4 spaces or tabs; compact or spacious line gaps; brace on the same line or the next; and optional alphabetical sorting of properties within each block.",
    ],
    [
      "Beautified and minified output together",
      "The same parse produces both, so you can copy the readable version for the repo and the stripped version for production without running the input twice.",
    ],
  ],
  faqs: [
    [
      "Does it minify CSS as well as beautify it?",
      "Yes — every format run also produces a minified string with comments removed, whitespace collapsed and the final semicolon before each closing brace dropped. The statistics panel shows the saving as a percentage of the original character count.",
    ],
    [
      "Will it break my media queries or keyframes?",
      "No. The formatter keeps a list of at-rules that open blocks — media, supports, container, document, layer, scope and keyframes — and indents their contents as nested blocks rather than mistaking the colon in a condition for a declaration.",
    ],
    [
      "What does the validation panel actually check?",
      "Four things: unbalanced braces, declarations missing a semicolon before the next token, blocks or files with no declarations at all, and the same property declared twice inside one block. If none of those fire it reports that the syntax looks valid.",
    ],
    [
      "What happens if I paste something that is not CSS?",
      "It is wrapped into a safe CSS block comment and you get a warning saying plain text was detected. Any `*/` sequence in the text is escaped so the resulting comment cannot terminate early and break the stylesheet around it.",
    ],
  ],
};

export default seo;
