const seo = {
  intro:
    "This calculator converts a voiceover slot length into a word count using the words-per-minute model: words = speaking seconds × wpm ÷ 60. It subtracts the seconds you reserve for breaths, beats and an end tag first, so the number you get is the copy that will actually fit on air. Copywriters, radio producers and e-learning narrators use it to size a draft before it reaches the booth.",
  useCases: [
    "Writing a 30-second radio spot and needing to know whether 85 words will fit once a 3-second music tag is reserved at the end",
    "Trimming an over-long client script by seeing exactly how many words to cut instead of guessing",
    "Checking whether a legal disclaimer can be delivered inside a 10-second window without pushing past a 195 wpm speed read",
  ],
  benefits: [
    ["Pauses counted properly", "Breaths and end tags come off the slot before the word budget is worked out."],
    ["Draft check built in", "Paste the script and see the over/under in words and in seconds."],
    ["Pace target, not just a cut list", "Shows the words-per-minute you would need to fit the copy as written."],
  ],
  faqs: [
    [
      "How many words is a 30 second voiceover?",
      "About 75 words at a conversational broadcast pace of 150 words per minute, since 30 × 150 ÷ 60 = 75. Reserve 2-3 seconds for breaths or an end tag and the practical budget drops to roughly 65-70 words.",
    ],
    [
      "What is a normal voiceover reading speed?",
      "Around 150 words per minute for a natural conversational read. Slow narration and e-learning sit near 110-135 wpm, upbeat retail promos near 170 wpm, and legal disclaimers are often delivered at 190-200 wpm or faster.",
    ],
    [
      "How many words fit in a 60 second slot?",
      "Roughly 150 words at 150 wpm with no pauses reserved. Most 60-second commercials land between 130 and 160 words once breaths, a beat before the call to action and a closing tag are allowed for.",
    ],
    [
      "Why does my script run long even though the word count matches?",
      "Word count ignores how long individual words take. Numbers, URLs, product names and legal phrasing take far longer per word than plain copy, and directed pauses add seconds that no word count captures. Time a rehearsal read against a stopwatch to confirm.",
    ],
  ],
};

export default seo;
