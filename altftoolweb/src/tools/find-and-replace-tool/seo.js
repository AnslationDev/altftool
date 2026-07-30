const seo = {
  intro:
    "Paste text, type what to find and what to put in its place, and every occurrence is swapped at once — the replacement always runs with the global flag, so it never stops at the first match. By default the search term is escaped and matched literally, so characters like a dot, a plus sign or a bracket mean themselves; flip the regex toggle to interpret the pattern as a JavaScript regular expression with capture groups, and flip the ignore-case toggle to add the case-insensitive flag. Output updates as you type and an invalid pattern prints the engine's own error instead of silently failing.",
  useCases: [
    "You exported a list of file paths and need every occurrence of an old folder name swapped for the new one before pasting it into a script",
    "A draft uses a product's old name in forty places and you want them all changed in one pass, including the capitalised versions at the start of sentences",
    "You have a column of dates written as 2026/07/29 and want to reorder them with a regex like (\\d{4})/(\\d{2})/(\\d{2}) replaced by $3-$2-$1",
  ],
  benefits: [
    [
      "Literal mode is genuinely literal",
      "With regex off, the search term is escaped before compiling, so searching for a period, an asterisk or a parenthesis matches that character instead of behaving as a wildcard.",
    ],
    [
      "Regex and case-insensitivity are separate switches",
      "You can run a case-insensitive plain-text swap without learning regex syntax, or a case-sensitive regex, instead of being forced into one combined mode.",
    ],
    [
      "Bad patterns tell you why",
      "An unbalanced bracket or a stray quantifier returns the JavaScript engine's message rather than an empty box, so you can see exactly which part of the pattern failed.",
    ],
  ],
  faqs: [
    [
      "Does it replace every match or only the first?",
      "Every match. The pattern is always compiled with the global flag, so a single run swaps all occurrences in the text — there is no first-only mode. Ignore case adds the case-insensitive flag on top of it.",
    ],
    [
      "How do I use capture groups in the replacement?",
      "Turn on the regex toggle, wrap the parts you want to keep in parentheses, then refer to them in the replacement as $1, $2 and so on. $& inserts the whole match, and $$ inserts a literal dollar sign — those replacement tokens are interpreted whether or not regex mode is on.",
    ],
    [
      "Why does my search for a dot match every character?",
      "That only happens when regex mode is on, where a dot is the any-character wildcard. Turn regex off and the term is escaped for you, or keep regex on and write the dot as \\. so it matches a literal period.",
    ],
    [
      "Can it replace line breaks or invisible characters?",
      "Yes, in regex mode: \\n matches a newline, \\t a tab and \\s any whitespace, so a pattern like \\n{2,} collapses runs of blank lines. In literal mode you can also paste the actual character into the find box and it will be matched as typed.",
    ],
  ],
};

export default seo;
