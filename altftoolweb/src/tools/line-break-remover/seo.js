const seo = {
  title: "Line Break Remover: Join Lines into One Single",
  metaDescription:
    "Paste multi-line text and join it with a space, a comma, or nothing. Lines are trimmed, blank lines dropped, Windows and Unix endings both handled.",
  intro:
    "Line Break Remover collapses multi-line text into a single line by splitting on every newline (both \\n and Windows \\r\\n), trimming whitespace from each line, dropping empty lines, and rejoining what remains with a space, a comma-and-space, or nothing at all. It is for anyone holding a column of text that needs to become one string — a pasted list, a wrapped paragraph, a set of IDs. It also reports how many lines were joined and how long the result is, so you can check the count matches what you pasted.",
  useCases: [
    "Turning a column of email addresses copied from a spreadsheet into one comma-separated string you can paste into a To: field",
    "Unwrapping a paragraph that arrived from a PDF or plain-text email with a hard break every 70 characters, so it reflows properly in a document",
    "Flattening a list of product codes into a single space-separated line for a search box or a command-line argument",
  ],
  benefits: [
    ["Blank lines disappear, not double up", "Empty and whitespace-only lines are filtered out before joining, so you never get a stray double comma from a gap in your list."],
    ["Each line is trimmed first", "Leading and trailing spaces from indented or copy-pasted text are stripped, so joining with a comma gives clean separators."],
    ["Handles Windows and Unix line endings", "The split matches \\r\\n as well as \\n, so text from Notepad or an email client joins the same way as text from a code editor."],
  ],
  faqs: [
    [
      "How do I remove line breaks from text?",
      "Paste the text, choose whether to join with a space, a comma, or nothing, and the single-line result appears immediately. Every newline is removed, each line is trimmed, and blank lines are dropped rather than becoming empty separators.",
    ],
    [
      "How do I make a list comma-separated?",
      "Choose the Comma option — lines are joined with a comma followed by a space, which is the format most email fields, CSV cells and search boxes expect. A 12-line list becomes 12 items separated by 11 commas, with no trailing comma at the end.",
    ],
    [
      "Does it join words without any space?",
      "Yes — the Nothing option concatenates the lines directly, which is what you want for a hash, key or code that got wrapped across several lines. Because each line is trimmed first, no accidental spaces survive in the middle of the joined string.",
    ],
    [
      "What happens to blank lines and indentation?",
      "Blank lines are removed entirely and each remaining line has its leading and trailing whitespace stripped before joining. The counter shows how many lines actually survived, so if you pasted 20 lines and see 17 joined, three of them were blank.",
    ],
  ],
};

export default seo;
