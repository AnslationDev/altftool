const seo = {
  intro:
    "A transition word suggester lists connectives by the relationship they express — contrast, cause, result, sequence, concession, condition and six more — rather than as one undifferentiated word bank. Each of the 94 entries is tagged with its grammatical type, which is what decides the punctuation: a conjunctive adverb like however takes a semicolon before it and a comma after, a coordinating conjunction like but takes a comma before it, and a subordinating conjunction like although takes a comma only when its clause comes first. A built-in scan reads a paragraph back and reports which connectives you are repeating.",
  useCases: [
    "Replace the third 'however' in a paragraph with nevertheless, on the other hand or whereas without changing the meaning.",
    "Find out why 'The trial failed, however the data were useful' is wrong and what punctuation the sentence actually needs.",
    "Pick a formal alternative to 'so' or 'besides' when moving a blog draft into an academic register.",
    "Scan a 300-word paragraph before submission to see whether it is signposted every sentence.",
  ],
  benefits: [
    ["Sorted by meaning, not alphabet", "Choose the relationship first, so you never pick a connective that says the wrong thing."],
    ["Punctuation rule attached", "Every entry names its grammatical type and the comma or semicolon that goes with it."],
    ["Repetition check", "Paste your draft and see which transitions you have used three or more times."],
  ],
  faqs: [
    [
      "Do you use a semicolon or a comma before however?",
      "A semicolon, when however joins two independent clauses: \"The trial failed; however, the data were still useful.\" A comma there is a comma splice. If however simply opens a new sentence, a full stop before it and a comma after it is correct.",
    ],
    [
      "What can I use instead of however?",
      "For a straight contrast, nevertheless, nonetheless, on the other hand, in contrast, but, yet and whereas all work, and each carries a slightly different weight — nevertheless concedes, whereas compares two things side by side. Conversely should be kept for a genuine reversal rather than any contrast.",
    ],
    [
      "Do you put a comma after although?",
      "No. Although introduces a subordinate clause, and the comma goes at the end of that clause rather than after the word itself: \"Although the sample was small, the effect was unmistakable.\" When the although clause comes second, no comma is normally needed at all.",
    ],
    [
      "How many transition words should a paragraph have?",
      "Fewer than most drafts contain. Roughly one connective every three or four sentences is enough; above about eight per 100 words you are signposting almost every sentence, which reads as mechanical. A transition earns its place only when the relationship between two sentences would otherwise be unclear.",
    ],
  ],
};

export default seo;
