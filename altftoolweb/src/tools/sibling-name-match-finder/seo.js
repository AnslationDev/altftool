const seo = {
  title: "Sibling Name Match Finder: Names Scored",
  metaDescription:
    "Enter your older child's name and get sibling names scored on origin, syllables, ending and length, with confusable spellings removed.",
  steps: [
    "Type the name your older child already has into 'Older child's name' — the field opens with Aarav.",
    "Choose 'New baby's gender', then a 'Match style' of same starting letter, different starting letter or same language of origin, and set 'How many suggestions'.",
    "Read the ranked cards, each showing its score out of 100, meaning, origin, letters and syllables plus the factors it matched on, then press 'Copy shortlist'.",
  ],
  intro:
    "The Sibling Name Match Finder ranks names against a child you have already named, scoring each candidate out of 100 on six factors: shared language of origin (25), matching syllable count (20), distinctness (20), same final letter (15), same starting letter (10) and similar length (10). Names whose spelling overlaps the existing name by more than 80 percent are dropped from the results instead of scoring highly, because a sibset should be matched, not confusable. Covers Sanskrit, Tamil, Arabic, Punjabi, Hebrew, English, Latin and Persian names with meanings.",
  useCases: [
    "Find a girl's name that sits naturally beside an older brother called Aarav or Vihaan without rhyming with it.",
    "Keep a third name in the same register as the first two — same origin, same syllable count, different sound.",
    "Deliberately break an alliterative pattern by filtering to names with a different starting letter.",
    "Check the meaning and origin of a name you are already considering before adding it to the sibset.",
  ],
  benefits: [
    ["Scored, not guessed", "Each suggestion shows its score and the exact factors it matched on."],
    ["Confusable names removed", "Candidates within 20 percent spelling distance of the existing name are excluded outright."],
    ["Eight naming traditions", "Sanskrit, Tamil, Arabic, Punjabi, Hebrew, English, Latin and Persian names, each with a meaning."],
  ],
  faqs: [
    [
      "How do you pick a sibling name that matches?",
      "Match the register rather than the letters: keep the same cultural source, a similar syllable count and a similar length, and change the sound. Aarav and Anvi work as a sibset; Aarav and Aarava do not, because the two will be confused for years.",
    ],
    [
      "Should siblings' names start with the same letter?",
      "There is no rule, and shared initials create practical friction — mixed-up post, school records and monogrammed items. If you want the pattern, use the same-initial filter here; if you have two matching initials already and want to break the run, use the different-initial filter.",
    ],
    [
      "How different should sibling names be?",
      "Enough that they cannot be misheard when called across a room. This tool treats names whose spellings overlap by more than 80 percent as confusing and excludes them, and awards only half the distinctness points between 60 and 80 percent overlap.",
    ],
    [
      "Does the tool work with a name that is not in its library?",
      "Yes, but partially. Syllable count, ending, starting letter, length and distinctness are all computed from the name you type, so scoring still works — only the 25-point origin factor is skipped, and the result panel says so.",
    ],
  ],
};

export default seo;
