const seo = {
  title: "Snake Case Converter — Text to snake_case Online",
  metaDescription:
    "Converts any phrase to snake_case: splits at every space, hyphen or punctuation run, lowercases and joins with single underscores. Instant, free.",
  steps: [
    "Type or paste your phrase into the Input box, or click Load sample to try \"My Variable Name Here\".",
    "The converter splits the text at every run of spaces, hyphens or punctuation, lowercases each piece and joins them with single underscores as you type — no convert button.",
    "Read the snake_case identifier in the Result panel and click Copy to put it on your clipboard.",
  ],
  intro:
    "The Snake Case Converter rewrites a phrase as snake_case by splitting the text at every run of non-alphanumeric characters, lowercasing each piece and joining them with single underscores. It is for developers and data people who need identifiers that match a Python, Ruby, SQL or JSON naming convention — \"My Variable Name Here\" comes back as my_variable_name_here. Spaces, hyphens, dots, slashes and punctuation are all treated as the same separator, so messy input collapses to one clean identifier.",
  useCases: [
    "You are renaming spreadsheet headers such as \"Order Date\" and \"Total (USD)\" before loading them into a Postgres table that expects lowercase underscore column names.",
    "You are following PEP 8 in a Python module and want function and variable names generated from the plain-English description you already wrote in the ticket.",
    "You are normalising a list of event names for analytics so that \"Sign-Up Completed\" and \"Sign up completed\" both end up as the same key.",
  ],
  benefits: [
    ["One rule for every separator", "Hyphens, dots, slashes, punctuation and any run of spaces all collapse to a single underscore, so double separators never produce a double underscore."],
    ["No leading or trailing underscores", "Empty pieces are dropped before joining, so input that starts or ends with punctuation still returns a valid identifier."],
    ["Predictable digit handling", "Numbers already set off by a space or punctuation become their own segment, so \"HTTP Response Code 404\" becomes http_response_code_404 rather than losing the number. Digits already touching a letter stay fused instead of being split out — \"item2Value\" becomes item2value, not item_2_value."],
  ],
  faqs: [
    [
      "Does it split camelCase into separate words?",
      "No — case boundaries are not treated as separators, so getUserName becomes getusername rather than get_user_name. Add spaces or hyphens at the word boundaries first if you are converting existing camelCase identifiers.",
    ],
    [
      "What happens to accented or non-English characters?",
      "They are treated as separators and removed, because the split matches anything outside a-z, A-Z and 0-9. That means \"Café order\" comes back as caf_order, so transliterate accented text to plain ASCII before converting.",
    ],
    [
      "Is snake_case the right convention for my code?",
      "It is the standard for Python identifiers under PEP 8, for Ruby methods and variables, and for SQL column names in Postgres, where unquoted identifiers are folded to lowercase anyway. JavaScript, Java and C# use camelCase or PascalCase instead, so match whichever your project's style guide sets.",
    ],
    [
      "Can an identifier start with a number after conversion?",
      "Yes, and that is worth checking — the converter keeps the leading digit, but most languages and databases reject an identifier that begins with one. Prefix a word such as col_ or n_ in your source text when the phrase starts with a number.",
    ],
  ],
};

export default seo;
