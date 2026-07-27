const seo = {
  intro:
    "Prompt Escape Helper converts a prompt into a string literal that survives being pasted into source code, applying the real quoting rule of the target: backslash escapes for C-family strings, doubled single quotes for SQL and single-quoted YAML, the '\\'' idiom for POSIX shell, RFC 4180 quoting for CSV, and doubled braces for Python str.format and C# interpolated strings. It reports how many backslashes, quotes, braces and line breaks had to be handled, so you can see what would have broken. Useful for anyone hard-coding a long prompt into an application, a test fixture or a shell script.",
  useCases: [
    "Paste a multi-line system prompt containing quotes and braces into a JavaScript file without hunting down the one unescaped character that breaks the build.",
    "Wrap a prompt safely for a shell command when it contains $VARIABLES, backticks and apostrophes that the shell would otherwise expand.",
    "Escape a prompt for Python's str.format so {placeholders} you want kept literal are not substituted away.",
    "Turn a prompt into a valid JSON string value for an API request body or a fixtures file.",
  ],
  benefits: [
    ["Correct per-language rules", "Each target uses its own real escaping rule rather than one generic backslash pass."],
    ["Shows the damage", "Counts the backslashes, quotes, braces, dollars, tabs and line breaks that needed handling."],
    ["Runs locally", "The prompt never leaves your browser, which matters when it contains proprietary instructions."],
  ],
  faqs: [
    [
      "How do I escape a single quote inside a single-quoted shell string?",
      "You cannot escape it inside the quotes — POSIX single quotes make every character literal, including the backslash. The standard idiom is to close the string, emit an escaped quote and reopen it: '\\''. So O'Brien becomes 'O'\\''Brien', which the shell concatenates back into one word.",
    ],
    [
      "Why do my curly braces disappear in a Python prompt?",
      "Because str.format and f-strings treat { and } as placeholder syntax. Write each literal brace twice — {{ and }} — and the output contains a single brace. The same rule applies to C# interpolated strings written with $\"...\".",
    ],
    [
      "What is the difference between escaping for JSON and for a JavaScript string?",
      "They are close but not identical. JSON allows only the escapes \\\" \\\\ \\/ \\b \\f \\n \\r \\t and \\uXXXX, and forbids single quotes as delimiters, whereas JavaScript also accepts single-quoted strings, template literals and escapes such as \\'. A JSON string is always valid JavaScript, but not the other way round.",
    ],
    [
      "Does escaping make my input safe from injection?",
      "No. Escaping makes a string safe to embed in source code; it does not make untrusted input safe to execute. For databases use bound parameters rather than building SQL by concatenation, and never assemble a shell command from user input even when the quoting is correct.",
    ],
  ],
};

export default seo;
