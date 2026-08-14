const seo = {
  title: "Topic Tag Cloud for Notes: Spot Thin Study Areas",
  metaDescription:
    "Paste notes for a term-frequency tag cloud in five size tiers, stopwords removed. Names your dominant topics and the thin ones. Runs in your browser.",
  steps: [
    "Paste your notes into the 'Your notes' textarea, replacing the sample text that loads there.",
    "Set 'Max tags shown' (40 by default, up to 100), 'Min word length' and 'Min occurrences' to control which terms survive the filters.",
    "The cloud renders in five size tiers with each term's count, followed by 'Dominant topics (largest tier)', 'Thin topics (lowest count shown)', total words analysed and distinct topic terms found; Copy list copies the frequency list.",
  ],
  intro:
    "This tool turns any block of study notes into a weighted tag cloud that shows which topics dominate your notes and which are barely covered. It uses classic term-frequency keyword extraction — tokenise, remove English stopwords, count occurrences — and scales each term into five size tiers by linear normalisation between the least and most frequent terms. It is built for students and note-takers who want a fast visual audit of coverage before an exam or a writing project, with all processing done locally in the browser.",
  useCases: [
    "A student pastes a semester of history notes to confirm the syllabus areas that dominate and spot chapters with almost no notes",
    "A UPSC aspirant audits current-affairs notes monthly to see whether economy and polity coverage is balanced",
    "A writer or researcher checks a draft's keyword balance before restructuring sections",
  ],
  benefits: [
    ["Coverage at a glance", "Five size tiers make dominant and thin topics visible in seconds without reading anything."],
    ["Tunable filters", "Control minimum word length, minimum occurrences and how many tags appear."],
    ["Fully private", "Notes are analysed entirely in your browser and never leave your device."],
  ],
  faqs: [
    [
      "How does a tag cloud decide which words are bigger?",
      "By frequency: each term's count is scaled linearly between the smallest and largest counts shown, then bucketed into one of five size tiers. A word in the top tier occurs at or near the maximum frequency in your notes; bottom-tier words sit at the minimum count that passed your filters.",
    ],
    [
      "Why are common words like 'the' and 'and' missing from the cloud?",
      "They are stopwords — function words that carry no topic meaning — and the tool removes them using a standard English stopword list before counting. Bare numbers are also dropped because in notes they are usually page references or years rather than topics.",
    ],
    [
      "Can I use this to find gaps in my study notes?",
      "Yes — the 'thin topics' list names every term sitting at the lowest count shown, which is the fastest signal that a topic you know matters has little written about it. Cross-check that list against your syllabus: a syllabus topic that never appears in the cloud at all is an outright gap.",
    ],
    [
      "Is my text uploaded to a server?",
      "No. The analysis is plain term counting that runs entirely in your browser tab, so the notes never leave your device and there is no size-limited upload to worry about.",
    ],
  ],
};

export default seo;
