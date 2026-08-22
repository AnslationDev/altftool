const seo = {
  title: "Add Line Numbers to Text — Start at Any Number",
  metaDescription:
    "Paste text and every line gets a sequential \"1. \" prefix instantly, blank lines included. Start counting at 0, 1 or any offset you choose.",
  steps: [
    "Paste or type your text in the Input box, or click 'Load sample' — the numbered Result appears live as you type, with no run button.",
    "Set 'Start at' to change the first line's number (default 1) — begin at 0 for arrays or mid-sequence to continue an earlier numbered list.",
    "Read the Result panel, where every line — blank ones included — is prefixed with a number, period and space, and click Copy to grab the numbered text.",
  ],
  intro:
    "Line Numbering Tool prefixes every line of pasted text with a sequential number and a full stop — \"1. \", \"2. \", \"3. \" — counting up one per line from whatever starting number you set, which defaults to 1. It splits on newlines and numbers every line including blank ones, so the numbering always matches the line positions in the original text. Useful whenever you need to reference specific lines by number rather than by quoting them.",
  useCases: [
    "Numbering a pasted code snippet or log excerpt before sending it to a colleague, so you can say \"the problem is on line 14\" and have it mean something",
    "Turning a plain list of steps into a numbered procedure for a runbook or checklist without hand-typing each number",
    "Continuing numbering across a split document — set the start value to 48 so the second half picks up exactly where the first half ended",
  ],
  benefits: [
    ["Numbering starts wherever you need", "The start value is an input, so you can begin at 0, at 1, or at any offset to continue a sequence from another page."],
    ["Blank lines keep their number", "Empty lines are counted rather than skipped, so the numbers stay aligned with the real line positions of the source text."],
    ["Consistent \"N. \" format", "Every line gets the number, a period and a single space, which pastes cleanly into documents, tickets and code comments."],
  ],
  faqs: [
    [
      "How do I add line numbers to text?",
      "Paste the text and the numbered version appears immediately, with each line prefixed \"1. \", \"2. \" and so on. Change the Start at value if you need the count to begin somewhere other than 1.",
    ],
    [
      "Can I start numbering at 0 or at another number?",
      "Yes — set Start at to any number and the first line takes that value, incrementing by 1 for each following line. Starting at 0 is common for arrays and byte offsets; starting mid-sequence is useful when continuing a numbered list from a previous section.",
    ],
    [
      "Are blank lines numbered too?",
      "Yes. Every line produced by splitting on newlines gets a number, including empty ones, so line 20 in the output is the twentieth line of your input. That keeps the numbers usable as references back into the original file.",
    ],
    [
      "Does it change my text in any other way?",
      "No. Nothing but the number, period and one space is added to the front of each line — indentation, punctuation, capitalisation and line order are all left untouched, so you can strip the prefixes later and get the original back.",
    ],
  ],
};

export default seo;
