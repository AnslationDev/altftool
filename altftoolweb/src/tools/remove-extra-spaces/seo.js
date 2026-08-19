const seo = {
  title: "Remove Extra Spaces: Collapse Spaces & Tabs",
  metaDescription:
    "Paste text and every run of spaces or tabs collapses to one space, with each line trimmed at both ends. Line breaks stay, so your paragraphs keep shape.",
  steps: [
    "Paste your text into the Input box, or press Load sample to try a line padded with too many spaces.",
    "The cleanup runs live as you type: runs of spaces and tabs inside each line collapse to a single space and both ends of every line are trimmed, while line breaks stay untouched.",
    "Read the cleaned text in the Result panel, where the line count matches your input, and press Copy to grab it.",
  ],
  intro:
    "Remove Extra Spaces collapses every run of spaces and tabs inside a line down to a single space, then trims the leading and trailing whitespace off each line. Line breaks are left alone, so the shape of your document survives while the messy spacing inside it disappears. It is the quick fix for text that came out of a PDF, a scraped web page, or a spreadsheet cell with padded values.",
  useCases: [
    "You copied a paragraph out of a PDF and it arrived with double spaces after every full stop and stray tabs mid-sentence before you paste it into a CMS.",
    "A list of names exported from a spreadsheet has leading spaces on some rows, so lookups and de-duplication keep failing on values that look identical.",
    "You are tidying scraped product descriptions where indentation from the source HTML left several spaces at the start of every line.",
  ],
  benefits: [
    ["Handles tabs as well as spaces", "Runs of spaces and tab characters mixed together collapse to one space, so tab-indented text cleans up in the same pass."],
    ["Line structure is preserved", "Only whitespace inside each line changes — your line breaks and paragraph layout stay exactly as pasted."],
    ["Trims both ends of every line", "Leading and trailing whitespace is stripped line by line, not just at the start and end of the whole block."],
  ],
  faqs: [
    [
      "Does it remove line breaks or blank lines?",
      "No. Every newline is kept, so a blank line stays a blank line and the number of lines in the output matches the input. Only spaces and tabs within a line are affected.",
    ],
    [
      "Will it collapse double spaces after a full stop?",
      "Yes. Any run of two or more spaces becomes one, including the traditional double space after sentence-ending punctuation, which most modern style guides no longer use.",
    ],
    [
      "Does it fix indentation in code?",
      "It removes it. Because every leading space and tab is trimmed, indented code loses its structure — use a code formatter instead if you are working with source files.",
    ],
    [
      "What about non-breaking spaces copied from a web page?",
      "Those are left in place. Only ordinary spaces and tab characters are collapsed, so a non-breaking space pasted from HTML survives and can still make two lines look identical but compare as different.",
    ],
  ],
};

export default seo;
