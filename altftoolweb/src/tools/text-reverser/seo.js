const seo = {
  title: "Text Reverser: Flip Characters, Words or Line Order",
  metaDescription:
    "Reverse text four ways — whole-string characters, word order, letters inside each word, or line order — then copy it or download reversed-text.txt.",
  steps: [
    "Type or paste your text into the Original Input Text box.",
    "Pick a mode — Reverse Characters, Reverse Word Order, Reverse Words Internally or Reverse Lines; the output updates as you type.",
    "Read the Reversed Output box, then Copy it to the clipboard or Download it as reversed-text.txt.",
  ],
  intro:
    "This tool flips text in four distinct ways: reverse every character in the whole block, reverse the order of words while leaving each word readable, reverse the letters inside each word while keeping the words in place, or reverse the order of whole lines. Pick a mode and the output updates as you type, ready to copy or download as reversed-text.txt. It is useful whenever the order of something — characters, words or rows — is what you actually need changed.",
  useCases: [
    "You want a chat handle or bio line written backwards as a small visual joke and need the exact character-for-character flip",
    "You pasted a log or a list that came out newest-last and you need the lines in the opposite order without re-sorting in a spreadsheet",
    "You are setting a word puzzle, a cipher exercise or a class activity and want each word scrambled backwards while the sentence structure stays recognisable",
  ],
  benefits: [
    ["Four reversal levels, one input", "Characters, word order, letters-within-words and line order are separate modes, so you are not stuck with a single blunt flip."],
    ["Word order without gibberish", "Reverse Word Order keeps every word spelled correctly and only changes the sequence, which plain character reversal cannot do."],
    ["Copy or save the result", "The output can go straight to the clipboard or download as a reversed-text.txt file for longer blocks."],
  ],
  faqs: [
    [
      "What is the difference between reversing characters and reversing word order?",
      "Reverse Characters flips the entire string end to end, so 'Hello World' becomes 'dlroW olleH'. Reverse Word Order keeps each word spelled normally and only swaps their positions, giving 'World Hello'. A third mode, Reverse Words Internally, keeps the sequence but flips each word's letters: 'olleH dlroW'.",
    ],
    [
      "Can I reverse the order of lines in a list?",
      "Yes — the Reverse Lines mode splits on line breaks and reverses that sequence, so the last line becomes the first. The text within each line is untouched, which is what you want for flipping a chronological log or a ranked list.",
    ],
    [
      "Does it handle emoji and accented characters correctly?",
      "Character reversal works on individual code units, so plain letters, digits and punctuation flip cleanly, but emoji, flag sequences and some combining accents can break apart when reversed character by character. If your text contains those, the word-order and line modes are safe because they never split inside a word.",
    ],
    [
      "Is reversed text a form of encryption?",
      "No. Reversal is trivially undone by reversing again, so treat it as a puzzle or formatting trick rather than protection. Anything that genuinely needs to stay private needs real encryption, not a flipped string.",
    ],
  ],
};

export default seo;
