const seo = {
  intro:
    "Duplicate Line Remover strips repeated lines from any block of text, keeping the first occurrence of each line in its original order and discarding every later copy. It compares lines through a normalisation step you control — case-insensitive matching, whitespace trimming and empty-line removal are on or off by choice — so 'Apple', 'apple' and '  apple  ' can count as the same entry or as three different ones. Paste a list, keyword export, log file or code block and you get the deduplicated text plus a count of total lines, unique lines, removed lines and the duplicate percentage.",
  useCases: [
    "You exported 12,000 keywords from three different tools into one text file and need a single clean list before importing it into a rank tracker, without the same phrase appearing in different capitalisations.",
    "A support log has the same error line repeated hundreds of times and you want the distinct set of messages so you can see how many genuinely different failures occurred.",
    "You merged two mailing lists pasted as plain text and need to know how much overlap there was — the duplicate percentage tells you before you send anything.",
  ],
  benefits: [
    [
      "Matching rules you set",
      "Case sensitivity, whitespace trimming and empty-line handling are three independent switches, so 'apple' vs 'Apple' is your call, not a fixed behaviour.",
    ],
    [
      "Original order and formatting preserved",
      "The first occurrence of each line is kept exactly as typed — indentation and capitalisation intact — rather than being sorted or normalised in the output.",
    ],
    [
      "Tells you how much was duplicated",
      "Alongside the cleaned text you get total, unique and removed line counts plus a duplicate percentage, which is often the number you actually needed.",
    ],
  ],
  faqs: [
    [
      "Does it treat 'Apple' and 'apple' as the same line?",
      "By default yes — matching is case-insensitive unless you tick Case Sensitive Match. With that box ticked, 'Apple' and 'apple' are stored as two separate unique lines; with it unticked only the first of the two survives.",
    ],
    [
      "Which copy of a duplicate line is kept?",
      "The first one, in the order it appears in your input. Later matches are dropped, and the surviving line keeps its original characters — so if trimming is on for matching purposes, the kept line still shows whatever spacing it originally had.",
    ],
    [
      "What does the duplicate percentage mean?",
      "It is removed lines divided by total input lines, expressed as a percentage to one decimal place. Ten repeated entries out of 100 input lines reads as 10.0%, and blank lines count toward the removed total when Remove Empty Lines is on.",
    ],
    [
      "Is my text uploaded anywhere?",
      "No. Deduplication runs in JavaScript in your own browser tab, so pasted content, logs and email lists never leave the device — which matters when the list contains customer data.",
    ],
  ],
};

export default seo;
