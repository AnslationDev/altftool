const seo = {
  title: "Kebab Case Converter: snake_case & dot.case",
  metaDescription:
    "Turn any phrase into kebab-case, snake_case and dot.case at once — splits on non-alphanumerics, lowercases and collapses separators for clean URL slugs.",
  intro:
    "The Kebab Case Converter rewrites a phrase as kebab-case by splitting it on every run of characters outside ASCII A-Z, a-z and 0-9, lowercasing each surviving piece and joining them with single hyphens. The same word list is also shown as snake_case and dot.case, so one paste covers the three naming conventions most projects switch between. It is for developers naming CSS classes, URL slugs, branch names and config keys who want a consistent result instead of hand-hyphenating.",
  useCases: [
    "You have a page title like \"2026 Annual Report (Draft)\" and need the URL slug for it without stray brackets, double hyphens or trailing punctuation.",
    "A design handoff lists component names in Title Case and your CSS convention is kebab-case, so you need them converted in one pass.",
    "You are creating a config key and the same name has to exist as kebab-case in YAML and snake_case in the Python that reads it.",
  ],
  benefits: [
    ["No double or trailing separators", "Runs of spaces, punctuation and symbols collapse to a single hyphen, and empty segments are dropped, so the output is always a clean slug."],
    ["Three conventions from one input", "The same tokens are returned as kebab-case, snake_case and dot.case, so you can copy whichever the file you are editing expects."],
    ["Safe for URLs and class names", "Because only ASCII letters and digits survive the split, the result never contains a character that would need percent-encoding in a path."],
  ],
  faqs: [
    [
      "What is kebab-case?",
      "Kebab-case is all-lowercase words joined by hyphens, as in my-variable-name. It is the standard for URL slugs, CSS class and custom property names, HTML attributes, and npm package names, because hyphens are legal and readable in all of those.",
    ],
    [
      "Does it split camelCase input?",
      "No — the split happens only at non-alphanumeric characters, so myVariableName is treated as one token and becomes myvariablename. Put spaces, hyphens or underscores between the words first if you want them separated.",
    ],
    [
      "What happens to punctuation, symbols and accents?",
      "Anything outside A-Z, a-z and 0-9 is treated as a separator and removed, so \"Café & Bar!\" becomes caf-bar. Transliterate accented or non-Latin text to plain ASCII before converting if those letters need to survive in the slug.",
    ],
    [
      "When should I use snake_case instead of kebab-case?",
      "Use snake_case wherever the name is an identifier in code — Python variables, SQL columns, Ruby methods — because a hyphen there reads as a minus sign. Kebab-case belongs in URLs, CSS and file names, where a hyphen is just a character.",
    ],
  ],
};

export default seo;
