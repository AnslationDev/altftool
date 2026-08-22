const seo = {
  title: "Bulk Find and Replace with Regex & Match Counts",
  metaDescription:
    "Run many find-and-replace rules over text in one pass — regex with $1 capture groups, case and whole-word options, and a live match count per rule.",
  steps: [
    "Paste your text into \"Original text\" and fill each rule's \"Find\" and \"Replace with\" fields; \"Add rule\" chains more rules that run top to bottom.",
    "Toggle \"Use regular expressions\" (with $1 capture groups), \"Case sensitive\" or \"Whole words only\" — each rule shows its live match count.",
    "Read the replaced text in \"Result\" with the \"Total replacements\" count, then \"Copy result\" or \"Apply to input\" to run another pass.",
  ],
  "intro": "Bulk Find and Replace applies as many search-and-replace rules as you need to a block of text in a single pass, showing the match count for every rule and the total number of replacements. Switch on regular expressions for patterns and $1 capture groups, or keep it literal so characters like . and ? are matched exactly. Case sensitivity and whole-word matching are one click away, and everything runs in your browser.",
  "useCases": [
    "Swap an old company name, product name and support address across a whole email template at once.",
    "Reformat every date in a data dump from DD/MM/YYYY to YYYY-MM-DD with one regex rule.",
    "Clean a CSV export by stripping stray tags and double spaces before importing it."
  ],
  "benefits": [
    [
      "Many rules, one pass",
      "Rules run top to bottom over the same text, so you can chain edits instead of pasting between tools."
    ],
    [
      "Match counts per rule",
      "See exactly how many times each rule fired, which instantly reveals a typo in a pattern."
    ],
    [
      "Safe regex handling",
      "Invalid patterns show a clear error instead of breaking the page, and zero-width patterns are skipped."
    ]
  ],
  "faqs": [
    [
      "How do I use capture groups in the replacement?",
      "Turn on regular expressions, wrap the parts you want to reuse in parentheses, then reference them as $1, $2 and so on in the replace field. For example (\\d{2})/(\\d{2})/(\\d{4}) with $3-$2-$1 converts 12/03/2026 into 2026-03-12."
    ],
    [
      "What does whole words only do?",
      "It wraps your search term in word boundaries, so searching for 'cat' changes the standalone word but leaves 'category' untouched. It works with both literal and regex mode."
    ],
    [
      "Do the rules run at the same time or one after another?",
      "One after another, from the top down. Each rule sees the output of the rules above it, so ordering matters if one rule's replacement could be matched by a later rule."
    ],
    [
      "Is my text sent to a server?",
      "No. All matching and replacing happens locally in your browser, so contracts, customer data and unpublished copy stay on your device."
    ]
  ]
};

export default seo;
