const seo = {
  title: "Regex Cheatsheet Builder for JavaScript, PCRE2, Python",
  metaDescription:
    "Build a regex cheatsheet filtered to JavaScript, PCRE2 or Python re — unsupported tokens hidden, 7 toggleable sections, copy as Markdown or print.",
  steps: [
    "Choose your engine in the \"Regex flavor\" dropdown — JavaScript (ECMA-262), PCRE2 (PHP, grep -P) or Python re module.",
    "Tick or untick the seven \"Sections to include\" checkboxes: Anchors & boundaries, Character classes, Quantifiers, Groups & backreferences, Lookaround, Flags / modifiers, and Escapes & literals.",
    "Read the Token / Meaning / Example tables — tokens your flavor does not support are hidden, and the counter shows how many were filtered — then click \"Copy Markdown\" or \"Print\".",
  ],
  intro:
    "The Regex Cheatsheet Builder generates a reference sheet of regular-expression tokens filtered to a single flavor — JavaScript (ECMA-262), PCRE2 or Python's re module — so every token shown is one your engine actually supports. Developers pick the feature groups they use (anchors, classes, quantifiers, groups, lookaround, flags, escapes) and get a copyable Markdown or printable sheet with per-token examples and cross-flavor notes.",
  useCases: [
    "Generate a JavaScript-only cheatsheet before a code review so nobody pastes PCRE-only syntax like \\A or possessive quantifiers into a Node.js validator.",
    "Print a Python re reference for a data-cleaning sprint that shows (?P<name>...) group syntax instead of the (?<name>...) form Python rejects.",
    "Copy a Markdown cheatsheet of just lookaround and groups into your team wiki when onboarding developers to an existing log-parsing codebase.",
  ],
  benefits: [
    [
      "Flavor-accurate",
      "Tokens unsupported by your engine are hidden entirely, so nothing on the sheet fails when pasted.",
    ],
    [
      "Only what you use",
      "Toggle seven feature groups on or off to keep the sheet short enough to actually scan.",
    ],
    [
      "Markdown export",
      "One click copies the whole sheet as GitHub-flavored Markdown tables for wikis and READMEs.",
    ],
  ],
  faqs: [
    [
      "What is the difference between JavaScript, PCRE and Python regex?",
      "The core syntax is shared, but each flavor has exclusive features: JavaScript has the g, y and u flags but no \\A or \\z anchors; PCRE2 adds possessive quantifiers, atomic groups and \\x{...} code points; Python uses (?P<name>...) for named groups and re.VERBOSE for extended mode. This builder tracks those differences per token so the sheet only shows what your engine accepts.",
    ],
    [
      "Does JavaScript regex support lookbehind?",
      "Yes — both positive (?<=...) and negative (?<!...) lookbehind have been part of JavaScript since ES2018 and work in all current browsers and Node.js. Python also supports lookbehind but requires it to be fixed-width, which the sheet notes on the token.",
    ],
    [
      "Why is \\A not working in my JavaScript regex?",
      "JavaScript has no \\A or \\z anchors at all — in a regex literal \\A just matches the letter A. Use ^ and $ without the m flag to anchor to the start and end of the whole string; \\A and \\z (or \\Z in Python) exist only in flavors like PCRE and Python.",
    ],
    [
      "Do possessive quantifiers like \\d++ work in Python?",
      "Only from Python 3.11 onward — earlier versions raise a re.error for possessive quantifiers and atomic groups. In JavaScript they are not supported in any version; the usual workaround is a plain greedy quantifier or restructuring the pattern to avoid catastrophic backtracking.",
    ],
  ],
};

export default seo;
