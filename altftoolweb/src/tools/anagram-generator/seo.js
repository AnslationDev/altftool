const seo = {
  title: "Anagram Generator: Up to 100 Letter",
  metaDescription:
    "Shuffles every letter of your word into up to 100 unique orderings, filtered by prefix, suffix or substring, and exports as TXT, CSV or JSON.",
  intro:
    "The Anagram Generator rearranges the letters of any word or phrase into random distinct orderings using a Fisher-Yates shuffle, returning up to 100 unique results per run with the original spelling kept as the first entry. It shows how many arrangements exist in total (n factorial for the letters you typed — 720 for a six-letter word), and lets you narrow the output by starting letters, ending letters, a required substring or letters to exclude. Results can be sorted alphabetically or by length and exported as TXT, CSV or JSON. It shuffles letters rather than checking a dictionary, so the output is raw material for wordplay, not a list of confirmed words.",
  useCases: [
    "You are naming a band, a startup or a D&D character and want to see what the letters of an existing word can be pushed into",
    "You are setting a puzzle for a school newsletter and need a scrambled version of each answer word, exported as a CSV you can drop into the layout",
    "You are stuck on a crossword or word-game rack and want to scan the letter orderings that start with a given prefix",
  ],
  benefits: [
    ["Constrain the search, not just the output", "Filter by prefix, suffix, required substring and excluded letters, so \"must start with st, no vowel y\" is one query."],
    ["Tells you the size of the space", "The permutation count is shown alongside the results, so you know whether you are seeing a sample or nearly all of it."],
    ["Exports in three formats", "Copy all as plain lines, or download TXT, CSV with index and length columns, or JSON keyed to the original input."],
  ],
  faqs: [
    [
      "How many anagrams can a word have?",
      "n factorial, where n is the number of letters — 6 letters give 720 orderings, 8 give 40,320, and 12 give 479,001,600. Repeated letters reduce the number of distinct results, which is why a word like \"letter\" yields far fewer unique strings than its raw factorial suggests.",
    ],
    [
      "Does this only generate real dictionary words?",
      "No. It shuffles the letters you give it and returns distinct orderings, most of which will not be words in any language. Treat the list as candidates to scan by eye — that is what makes it useful for names and puzzles, where a pronounceable non-word is often exactly the point.",
    ],
    [
      "How many results do I get per run?",
      "Up to 100 unique arrangements, and the generator stops after 1,000 shuffle attempts even if it has not reached your requested count. Short inputs with repeated letters hit that ceiling quickly, because there simply are not that many distinct orderings to find.",
    ],
    [
      "What counts as an anagram?",
      "A rearrangement that uses every letter of the original exactly once — \"listen\" and \"silent\" is the classic example. That is stricter than a scramble that drops or adds letters, and it is why the permutation count is a factorial rather than a count of possible substrings.",
    ],
  ],
  steps: [
    "Type or paste into the Input Workspace box, which prompts you to type or paste any word or phrase, or click one of the Quick Examples chips — listen, triangle, conversation, education, developer or creative. The line under the box counts Chars and Words and shows Est. Permutations for what you typed.",
    "Set Number of Anagrams with the 1–100 slider or its 10 / 20 / 30 / 50 / 100 presets, choose a Sorting Order of Random, A - Z or Length, then click Generate Anagrams. The button reads Rearranging... while it runs and the dashboard badge updates to a count of Variations Found; the set always includes your original spelling, and the generator gives up after 1,000 shuffle attempts, so short words with repeated letters return fewer results than you asked for.",
    "Click Copy All to put the results on the clipboard one per line, or TXT, CSV or JSON to download anagrams-<your-input>.txt, .csv or .json — the CSV carries Index, Anagram and Length columns. Share Results passes the first five to your device's share sheet or copies a summary line, and the Clear button above the box empties your input.",
  ],
};

export default seo;
