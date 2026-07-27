const seo = {
  intro:
    "Multiline Prompt Joiner collapses a prompt written across many lines into a single string literal, escaped for the language you are pasting it into. It applies the real grammar rules — RFC 8259 for JSON, ECMA-262 for JavaScript strings and template literals, the Python and Java literal grammars, YAML 1.2 double-quoted scalars, and POSIX shell quoting — so quotes, backslashes and control characters cannot break your file. Built for developers who keep long system prompts in config files, test fixtures or curl commands.",
  useCases: [
    "Move a 30-line system prompt into a JSON request body without hand-escaping every quote mark.",
    "Paste a prompt containing Windows paths and regex patterns into a Python script where each backslash must be doubled.",
    "Wrap a prompt that mentions dollar-brace placeholders in a JavaScript template literal without triggering interpolation.",
    "Put a multi-line prompt inside a curl command using POSIX single quotes, where an apostrophe in the text would otherwise end the argument.",
  ],
  benefits: [
    [
      "Grammar-accurate escaping",
      "Each target uses its own rules — Python gets two-digit hex escapes, Java skips the vertical-tab escape it does not have.",
    ],
    [
      "Impossible combinations are blocked",
      "Asking for a backslash-n inside POSIX single quotes returns an explanation instead of a literal that silently misbehaves.",
    ],
    [
      "Runs entirely in the browser",
      "Prompt text is never uploaded, so internal or client-confidential instructions stay on your machine.",
    ],
  ],
  faqs: [
    [
      "How do I put a multi-line prompt into a JSON string?",
      "Replace each line break with the two-character sequence backslash-n and escape every double quote and backslash. RFC 8259 also requires escaping every character below U+0020, so a stray tab must become backslash-t rather than a raw tab byte.",
    ],
    [
      "Why does my prompt break the shell when it contains an apostrophe?",
      "Inside POSIX single quotes no character can be escaped, so the first apostrophe ends the quoted string. The standard workaround is to replace each apostrophe with the four-character sequence quote, backslash, apostrophe, quote — which closes the string, adds a literal apostrophe, and reopens it.",
    ],
    [
      "Does a JavaScript template literal need escaping at all?",
      "Yes, in two places: a backtick would end the literal, and a dollar sign followed by an opening brace starts an interpolation that evaluates your prompt text as code. Both are escaped with a leading backslash; real line breaks are legal inside backticks.",
    ],
    [
      "Should I join the lines with backslash-n or with a space?",
      "Keep backslash-n when line structure matters to the model — numbered steps, sections or output templates all rely on it. Join with a space only for prose paragraphs that were wrapped for editing convenience, since collapsing structured instructions can change how a model segments them.",
    ],
  ],
};

export default seo;
