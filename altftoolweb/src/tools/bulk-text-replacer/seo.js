const seo = {
  title: "Bulk Text Replacer — Free Find and Replace Online",
  h1: "Bulk Text Replacer — Find and Replace Every Match at Once",
  metaDescription:
    "Paste text, enter a find and replace pair, and swap every match in one click. Regex supported, case-sensitive toggle, runs in your browser — no uploads.",
  intro:
    "The Bulk Text Replacer swaps every occurrence of a word, phrase or pattern across a whole block of pasted text in a single pass. It compiles whatever you type in the Find field into a JavaScript RegExp — with the flags `gi` by default, or `g` when you tick Case sensitive — and runs String.replace() once over your input, so the global flag catches all matches instead of stepping through them one at a time. Because the Find field is a real regular expression, patterns like \\d{4} or (draft|DRAFT) work, and $1 backreferences work in the Replace field. Everything executes in client-side JavaScript in your own browser: no upload, no account, no server call.",
  useCases: [
    "Renaming a variable, API endpoint or class name across a pasted block of code or JSON before you commit it.",
    "Filling placeholder tokens — {{name}}, [CITY], Lorem ipsum — with real values in an email, invoice or template draft.",
    "Cleaning bulk exports: normalising product names, fixing one misspelled brand across hundreds of CSV rows, or stripping a repeated prefix from a URL list.",
  ],
  benefits: [
    [
      "Every match in a single pass",
      "The global regex flag is always on, so one click on Replace Text updates all occurrences — whether that's three instances or ten thousand lines. There is no next-match button to click through.",
    ],
    [
      "Real regex, not just literal words",
      "The Find field is passed straight to JavaScript's RegExp constructor, so character classes, quantifiers, anchors and alternation all work. Replacement tokens work too: $1 inserts the first capture group, $& inserts the whole match.",
    ],
    [
      "Case handling you control",
      "Matching ignores case by default, so Product, product and PRODUCT are all caught in one run. Tick Case sensitive and the i flag is dropped, restricting replacements to exact-case matches.",
    ],
    [
      "Nothing leaves your browser",
      "The replacement runs entirely in client-side JavaScript — the source contains no fetch call, no upload and no login. Your original text stays in the Input box while the result is written to a separate read-only Output box.",
    ],
  ],
  faqs: [
    [
      "how to replace multiple instances of a word at once",
      "Paste your text, type the word in Find text, type the new value in Replace with, then click Replace Text — every occurrence is swapped in one pass, because the pattern is always compiled with the global regex flag. You never confirm matches individually, and the result appears in the Output box on the right.",
    ],
    [
      "is this bulk find and replace tool free",
      "Yes — it is free with no signup, no account and no usage limit. The replacement is done by JavaScript running in your browser, so there is no server processing to meter and nothing is uploaded when you paste text in.",
    ],
    [
      "does the bulk text replacer support regex",
      "Yes. Whatever you type in Find text is handed to JavaScript's RegExp constructor, so \\d+, [A-Z]{2}, ^\\s+ and (cat|dog) all behave as patterns. The Replace with field supports the standard replacement syntax as well — $1 for the first capture group, $& for the entire match, and $$ for a literal dollar sign.",
    ],
    [
      "why is my find and replace not working",
      "Usually a regex metacharacter in the Find field. Because your input is treated as a regular expression, characters like . * + ? ( ) [ ] { } | ^ $ and \\ have special meaning — to match them literally, escape each with a backslash, e.g. \\$29\\.99 rather than $29.99. Two other causes: an empty Find field does nothing at all, and an unbalanced bracket or parenthesis is an invalid pattern that produces no output.",
    ],
    [
      "how do I make find and replace case sensitive",
      "Tick the Case sensitive checkbox beside the Replace with field. Unticked, the tool runs with the gi flags so iPhone, iphone and IPHONE all match the same search. Ticked, it uses g only, and just exact-case matches are replaced.",
    ],
    [
      "can I replace several different words at the same time",
      "Not as separate rows — the tool takes one Find and one Replace pair per run. There are two workarounds: run the tool again on its own output for each further pair, or use a regex alternation such as (colour|behaviour|favourite) in the Find field when they all share the same replacement text.",
    ],
    [
      "how much text can I paste into the bulk text replacer",
      "There is no character limit set anywhere in the code. The full input is held in browser memory and processed in a single replace() call, so the practical ceiling is your device's memory — very large pastes may make the tab pause for a moment while the pattern runs.",
    ],
    [
      "does it change my original text",
      "No. The Input box keeps your original text untouched and the result is written to a separate read-only Output box, so you can tweak the Find or Replace value and run it again without re-pasting. Copy Output puts the result on your clipboard using the browser's Clipboard API.",
    ],
  ],
  steps: [
    "Paste the text, code, JSON or CSV you want to edit into the Input box.",
    "Enter your search term or regex pattern in Find text, enter the new value in Replace with, and tick Case sensitive if exact capitalisation matters.",
    "Click Replace Text to update every match, review the Output box, then click Copy Output to copy the result.",
  ],
};

export default seo;
