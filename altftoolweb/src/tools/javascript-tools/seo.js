const seo = {
  title: "JavaScript Formatter, Minifier and Complexity Checker",
  metaDescription:
    "Re-indent, strip comments and whitespace, or count lines, functions and McCabe cyclomatic complexity. A // inside a string is never a comment.",
  steps: [
    "Paste a snippet into the JavaScript box, then choose Format, Minify or Inspect under \"What to do\" and an indent of 2 spaces, 4 spaces or Tab.",
    "Format re-indents one statement per line, Minify strips comments and redundant whitespace while keeping every newline so automatic semicolon insertion is unchanged, and Inspect counts code, comment and blank lines, functions, console.* calls and TODO / FIXME / HACK markers.",
    "Read the headline figure — output lines, percentage saved, or cyclomatic complexity — then press Copy result to take the output or the inspection summary; Reset asks before replacing your code with the sample.",
  ],
  intro:
    "JavaScript Tools formats, minifies and inspects a JavaScript snippet entirely in your browser, using a lexical scanner that separates code from strings, template literals, regular expressions and comments before it touches a single character. Formatting re-indents one statement per line without adding or removing a token; minifying strips comments and redundant whitespace while keeping every newline, so automatic semicolon insertion behaves exactly as it did in the original. Inspection reports line and token counts plus McCabe cyclomatic complexity, which is the number of decision points plus one.",
  useCases: [
    "Re-indent a minified or badly pasted snippet from a bug report so you can read the control flow.",
    "Strip comments and indentation from a small inline script before dropping it into an HTML page.",
    "Check a pull-request snippet for leftover console.log calls, TODO markers and unbalanced brackets.",
  ],
  benefits: [
    ["Literal-aware", "A // inside a URL string or a template literal is never mistaken for a comment."],
    ["Behaviour preserving", "No identifier is renamed and no newline is removed, so ASI cannot change the meaning."],
    ["Nothing uploaded", "The scanner runs on the page; your code never leaves the browser."],
  ],
  faqs: [
    [
      "Does minifying here match what a bundler produces?",
      "No — this removes comments and whitespace only, typically 20–45% of an indented file, while a bundler such as esbuild or Terser also renames local variables and rewrites expressions and can reach 60–70%. Use this for a quick inline script, a bundler for production.",
    ],
    [
      "Is my code uploaded anywhere?",
      "No. Formatting, minification and inspection all run in the page's JavaScript, with no network request at any point, so pasting a proprietary snippet is safe.",
    ],
    [
      "What is cyclomatic complexity and what number is acceptable?",
      "It is the count of independent paths through the code: decision points (if, for, while, case, catch, &&, ||, ??) plus one, from T. J. McCabe's 1976 paper. A single function above roughly 10 is the usual refactoring threshold; this tool reports the figure for the whole snippet.",
    ],
    [
      "Why does the minified output still contain line breaks?",
      "Because JavaScript inserts semicolons at line ends in some situations (ECMA-262 automatic semicolon insertion). Deleting a newline after a bare `return` would silently change the result, so every newline is kept and only indentation, blank lines and comments are removed.",
    ],
  ],
};

export default seo;
