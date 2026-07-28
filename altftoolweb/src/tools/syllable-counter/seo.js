const seo = {
  intro:
    "A syllable counter tells you how many beats a word, a line or a whole passage has. This one applies the rule set of Greg Fast's Lingua::EN::Syllable — count the vowel runs, drop the silent final e except after \"-le\", ignore a leading y, then apply the published correction patterns for spellings like \"-cious\", \"-ion\" and \"-ism\" — and checks a list of common irregulars first. From those counts it also computes the two formulas that need them: Flesch Reading Ease (Flesch, 1948) and Flesch–Kincaid Grade Level (Kincaid et al., 1975). It is for poets writing to a metre, teachers checking reading level, and copywriters trimming a headline.",
  useCases: [
    "Check that a haiku really is 5–7–5 before you publish it — the tool counts each line separately and says so.",
    "Test whether a landing page reads at 8th-grade level by watching the Flesch Reading Ease score cross 60.",
    "Fit a lyric or a jingle to a fixed number of beats per line without counting on your fingers.",
  ],
  benefits: [
    ["Line-by-line, not just a total", "Every line gets its own word and syllable count, which is what verse and lyrics actually need."],
    ["Readability comes free", "Flesch Reading Ease and Flesch–Kincaid Grade are computed from the same counts, with Flesch's own difficulty bands."],
    ["Nothing leaves your browser", "The whole count runs locally, so unpublished drafts stay on your machine."],
  ],
  faqs: [
    [
      "How do you count syllables in a word?",
      "Count the groups of vowel letters, then correct for the silent letters English keeps. \"Beautiful\" has vowel runs eau-i-u, giving 3, but the -ful ending adds one, so 4. The main corrections are: a final e is usually silent (\"make\" is 1), except after a consonant plus l (\"table\" is 2); a leading y is a consonant; and endings like -cious, -tion and -ion collapse two vowel runs into one.",
    ],
    [
      "How accurate is an automatic syllable count?",
      "About nine words in ten for ordinary English prose. Rule-based counters have no way to know that \"read\" and \"read\" sound different, or that \"business\" is two syllables rather than three, so a list of known irregulars is checked first. Names, loanwords and technical terms are where it is most likely to be off by one.",
    ],
    [
      "What is a good Flesch Reading Ease score?",
      "60 to 70 is Flesch's \"standard\" band, roughly 8th to 9th grade, and it is what most general-audience writing aims for. Above 90 is very easy, below 30 is very confusing. The score is 206.835 − 1.015 × (words per sentence) − 84.6 × (syllables per word), so shorter sentences and shorter words both push it up.",
    ],
    [
      "How many syllables should a haiku have?",
      "Five, seven and five, for seventeen in total. That count is a convention borrowed from the Japanese on, which are not quite the same unit as English syllables — which is why many modern English haiku deliberately run shorter. Paste three lines here and each line's count is shown separately.",
    ],
  ],
};

export default seo;
