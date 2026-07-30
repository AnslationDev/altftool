const seo = {
  intro:
    "CSS Beautifier re-indents minified or messy stylesheets by normalising the spacing around braces, semicolons, colons and commas, then re-indenting each nesting level with 2, 4 or 8 spaces. It is for anyone who has a stylesheet collapsed onto one line — from a build output, a CMS field, or a copied snippet — and needs it readable again. Blank lines between top-level rules can be switched on or off, and the result copies to the clipboard or downloads as styles.beautified.css.",
  useCases: [
    "You copied a compiled stylesheet out of DevTools and it is one continuous line — you need it expanded before you can find the rule that is overriding your layout.",
    "A teammate's CSS uses 4-space indentation and yours uses 2, so you run their file through at 2 spaces before pasting it into the shared stylesheet to keep the diff clean.",
    "You are preparing CSS for a tutorial or code review and want generous blank lines between rules so each block reads as a separate example.",
  ],
  benefits: [
    [
      "Three indent widths, chosen by button",
      "2, 4 or 8 spaces applied per nesting level, so nested rules inside a media query line up at the depth your project already uses.",
    ],
    [
      "Rule spacing you control",
      "A single toggle switches between a blank line after every top-level rule and a compact layout with no gaps, which matters when the file is long.",
    ],
    [
      "Sample CSS built in",
      "A deliberately messy sample with a media query loads in one click, so you can see exactly how the formatter treats nesting before pasting your own file.",
    ],
  ],
  faqs: [
    [
      "How do I make minified CSS readable again?",
      "Paste it in and beautify — the formatter puts each declaration on its own line, moves opening braces onto the selector line, and indents block contents by your chosen width. It handles nested blocks such as media queries by tracking brace depth, so inner rules are indented one level deeper.",
    ],
    [
      "What indentation sizes are available?",
      "2, 4 or 8 spaces. The tool indents with spaces rather than tab characters, so the output looks identical in every editor regardless of the reader's tab width setting.",
    ],
    [
      "Are my comments preserved?",
      "Yes. Block comments in `/* ... */` form are kept and pushed onto their own line, so section headings written as comments survive the reformat instead of being stripped like a minifier would.",
    ],
    [
      "Can I save the result as a file?",
      "Yes — the formatted output downloads as `styles.beautified.css` with the text/css MIME type, or copies to the clipboard in one click. The file is generated in the browser, so nothing is uploaded.",
    ],
  ],
};

export default seo;
