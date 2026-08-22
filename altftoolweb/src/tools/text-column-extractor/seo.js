const seo = {
  title: "Text Column Extractor: cut -f for CSV & Logs",
  metaDescription:
    "Pull columns out of pasted CSV, TSV or fixed-width text — RFC 4180 quotes, ranges like 2,4-6, -1 for the last column, up to 200,000 lines in-browser.",
  steps: [
    "Paste up to 200,000 lines into 'Text to extract from' and pick a Splitting mode — delimited (CSV, TSV, pipe) or fixed width; Detect separator can find the delimiter for you.",
    "List 'Columns to keep' as 1-based numbers — 2,4 for a set, 2-5 for a range, -1 for the last column — or character positions like 1-10,12-20 in fixed-width mode.",
    "Choose an Output separator (Tab, Comma, New line, Space or Pipe) and click Copy result to take every extracted row.",
  ],
  intro:
    "A text column extractor takes a block of pasted rows and returns only the columns you name — the browser equivalent of `cut -d, -f2,4` or `awk '{print $2}'`. It is for anyone cleaning a log dump, an exported report or a CSV where only two of fifteen columns matter. Splitting follows RFC 4180 for quoted CSV fields, so a comma inside \"Rao, Kiran\" stays inside that one field instead of shifting every column after it.",
  useCases: [
    "Take just the email column out of a 4,000-row CSV export before pasting it into a mailing list.",
    "Pull columns 2 and 4 from a fixed-width bank statement by character position, where there is no separator at all.",
    "Grab the last field of every line in a log file with -1, even though the lines have different numbers of fields.",
  ],
  benefits: [
    ["Quoted fields survive", "Commas inside double-quoted CSV values do not break the column alignment."],
    ["Ranges and negatives", "Write 2,4-6 for a set of columns or -1 to take whatever the last column happens to be."],
    ["Fixed-width mode", "Cut by character position for padded report output that has no separator character."],
  ],
  faqs: [
    [
      "How do I extract a single column from a CSV?",
      "Paste the text, set the separator to comma, set Header rows to skip to 1 if the file has a header, and type the column number — columns are numbered from 1, so the third column is 3. Leave the quoted-fields option on so values like \"Rao, Kiran\" stay in one piece.",
    ],
    [
      "What does a negative column number do?",
      "It counts backwards from the end of each line, so -1 is the last column and -2 the second-to-last. This is useful for log lines where the number of fields varies but the value you want is always at the end.",
    ],
    [
      "Can I extract columns from text that has no delimiter?",
      "Yes — switch to fixed-width mode and give character positions such as 1-10,12-20. Positions are 1-based and inclusive, and a bare number like 25 means \"from character 25 to the end of the line\". This is how mainframe and bank-statement exports are usually laid out.",
    ],
    [
      "Is my pasted data sent anywhere?",
      "No. All splitting runs in JavaScript inside your browser tab, so nothing is uploaded and nothing is stored. The tool handles up to 200,000 lines in one paste.",
    ],
  ],
};

export default seo;
