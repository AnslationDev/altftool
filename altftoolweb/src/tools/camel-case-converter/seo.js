const seo = {
  title: "camelCase Converter: Also PascalCase",
  metaDescription:
    "Splits your phrase at spaces and punctuation, then returns camelCase, PascalCase and CONSTANT_CASE from the same word split.",
  intro:
    "A camel case converter turns an ordinary phrase into a valid identifier: it splits your text on every run of non-alphanumeric characters, lowercases the first word, capitalises the first letter of each word after it, and joins them with no separator — so \"my variable name here\" becomes \"myVariableNameHere\". The same split also produces PascalCase and CONSTANT_CASE in one pass, which are the two other conventions you usually need alongside it. Useful whenever you are naming a variable, JSON key, class or environment constant and want all three forms without retyping.",
  useCases: [
    "You are turning a spreadsheet column header like \"Total Order Value (USD)\" into a JSON key and need the punctuation and spaces gone in one step",
    "A designer handed you field labels in plain English and you need the camelCase property names plus matching PascalCase component names",
    "You are adding a config option and want both the camelCase key in code and the CONSTANT_CASE environment variable name to line up exactly",
  ],
  benefits: [
    ["Three conventions from one input", "camelCase, PascalCase and CONSTANT_CASE are produced from the same word split, so the three names for a concept can never drift apart."],
    ["Punctuation-tolerant splitting", "Hyphens, underscores, dots, slashes, brackets and repeated spaces are all treated as word boundaries, so messy headings convert cleanly without pre-cleaning."],
    ["Predictable casing of the rest of each word", "Every word after the first is capitalised then lowercased throughout, so SHOUTED or MiXeD input comes out uniform instead of preserving stray capitals."],
  ],
  faqs: [
    [
      "What is the difference between camelCase and PascalCase?",
      "Only the first character. camelCase leaves the first word lowercase (myVariableName); PascalCase capitalises it too (MyVariableName). By convention JavaScript and Java use camelCase for variables, functions and object keys, and PascalCase for classes, types and React components.",
    ],
    [
      "How does it decide where the words are?",
      "It breaks the text at every run of characters that are not letters or digits — spaces, hyphens, underscores, dots, commas, brackets and so on — and discards them. So \"user-id\", \"user_id\" and \"user id\" all produce the same result, userId.",
    ],
    [
      "Why does an already-camelCase input come back as one lowercase word?",
      "Because the split is based on separator characters, not on capital letters. \"myVariableName\" contains no separators, so it is treated as a single word and lowercased to \"myvariablename\". Insert spaces or hyphens between the words first if you want it recased.",
    ],
    [
      "What happens to numbers and leading digits?",
      "Digits are kept as part of a word — \"order 2 total\" gives order2Total — because 0-9 counts as alphanumeric in the split. Be aware that a phrase starting with a digit produces an identifier starting with a digit, which is not valid in most languages, so prefix it yourself.",
    ],
  ],
};

export default seo;
