const seo = {
  intro:
    "PHP Beautifier Studio reformats PHP source in the browser using Prettier with the official @prettier/plugin-php parser, so the output follows the same deterministic rules a Prettier-based CI check would apply. You control indent width (2, 4 or 8 spaces, or tabs), print width (80, 120 or 160 characters), single versus double quotes and brace placement, and the formatted file can be copied or downloaded as formatted.php. If a snippet has a syntax error that Prettier refuses to parse, a built-in brace-and-semicolon fallback still re-indents it and tells you why, instead of returning nothing.",
  useCases: [
    "You inherit a legacy PHP file with mixed tabs and spaces and inconsistent brace placement, and want it normalised to 4-space indent and 1TBS before you start reading it.",
    "A pull request is failing a Prettier check and you want to see the exact formatted output for one file without installing Node modules on the machine you are on.",
    "Pasting a snippet copied out of a forum answer or a log where the line breaks were mangled, just to get it back into readable, properly indented form.",
  ],
  benefits: [
    [
      "Real Prettier, not a regex re-indenter",
      "Formatting goes through the actual @prettier/plugin-php parser, so line breaking, argument wrapping and operator placement match what Prettier produces in a project's own toolchain.",
    ],
    [
      "It still gives you something on broken code",
      "When the parser rejects the input, a fallback pass re-indents on braces and semicolons — string- and escape-aware, so quotes are not split — and shows the parser's error message alongside the result.",
    ],
    [
      "The four settings that actually cause diffs",
      "Indent width, print width, quote style and brace style are the options teams argue about; each is a direct control here, and the byte size before and after is reported for the result.",
    ],
  ],
  faqs: [
    [
      "What formatting engine does this use?",
      "Prettier standalone with the @prettier/plugin-php plugin, both loaded into the page and reused across passes. That means the output is byte-identical to running Prettier with the same options locally, which is what makes it safe to paste back into a repo governed by a Prettier check.",
    ],
    [
      "Does beautifying change how my PHP behaves?",
      "No. Formatting only rewrites whitespace, line breaks and quote style — the parsed program is the same. The one thing to be careful about is quote style, since switching a double-quoted string to single quotes stops variable interpolation; Prettier accounts for this and leaves interpolating strings alone.",
    ],
    [
      "What is the difference between 1TBS, Perl and Allman brace style?",
      "1TBS keeps the opening brace on the same line as the statement, Allman puts it on its own new line beneath, and Perl style sits between the two. PSR-12, the widely used PHP standard, calls for the opening brace on the same line for control structures and on a new line for classes and methods.",
    ],
    [
      "Is my code sent to a server?",
      "No. Prettier and the PHP plugin run inside the page, so the source you paste is formatted locally and never uploaded — which matters when the file contains database credentials or an API key you have not stripped out yet.",
    ],
  ],
};

export default seo;
