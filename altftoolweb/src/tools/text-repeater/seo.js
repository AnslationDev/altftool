const seo = {
  title: "Text Repeater: Repeat Text Up to 10,000 Times Online",
  metaDescription:
    "Repeat a word, line or block up to 10,000 times, joined by a new line, space, comma or nothing. The output rebuilds as you type, ready to copy.",
  steps: [
    "Type or paste the text into the Input box — a multi-line block repeats as one unit.",
    "Set Times (clamped to a maximum of 10,000) and pick a Separator: New line, Space, Comma or None.",
    "The Result pane rebuilds as you type; click Copy to take the repeated text.",
  ],
  intro:
    "Type a word, line or block of text, set how many copies you want, and this tool joins that many repetitions together with the separator you choose — a new line, a space, a comma or nothing at all. The count is clamped to a maximum of 10,000 repetitions, and the output rebuilds as you type so you can copy it straight out. It is the quickest way to produce padded filler, repeated list rows or a long block of the same string without holding down paste.",
  useCases: [
    "You need a chunk of placeholder text of roughly the right length to see how a card or table behaves before the real copy exists",
    "You are seeding a spreadsheet or test fixture with the same value across hundreds of rows and want it as newline-separated lines to paste into one column",
    "You are checking that an input field, database column or API payload actually enforces its length limit by feeding it a deliberately long repeated string",
  ],
  benefits: [
    ["Four join modes, not just line breaks", "Separate copies by new line, a single space, a comma and space, or run them together with no separator at all."],
    ["Predictable ceiling", "Counts are clamped between 0 and 10,000, so a stray extra zero cannot lock up the page with a runaway string."],
    ["Repeats blocks, not only words", "Multi-line input is treated as one unit, so a whole paragraph or a formatted row repeats intact with your separator between copies."],
  ],
  faqs: [
    [
      "What is the maximum number of repetitions?",
      "10,000. Anything higher is clamped down to that, and negative values or non-numeric entries are treated as 0, which returns an empty result.",
    ],
    [
      "How do I get each copy on its own line?",
      "Choose 'New line' as the separator — it is the default. The separator is inserted between copies rather than after each one, so 5 repetitions produce 5 lines with no trailing blank line at the end.",
    ],
    [
      "Can I repeat a whole paragraph or several lines at once?",
      "Yes. Whatever is in the input box, including line breaks, is repeated as a single block, with your chosen separator placed between the blocks. Pairing multi-line input with the 'New line' separator is the usual way to build repeated records.",
    ],
    [
      "Does the repeated text get sent anywhere?",
      "No. The repetition is a plain string join running in your browser, and the result never leaves the page — which matters if you are padding out something that contains real customer data.",
    ],
  ],
};

export default seo;
