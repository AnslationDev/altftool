const seo = {
  title: "Malayalam Word of the Day with Meaning & Streak",
  metaDescription:
    "One Malayalam word per date in script with ISO 15919 transliteration, meaning and example sentence. 40-word deck, browser-local revision streak.",
  steps: [
    "Pick a date in the Date field (it defaults to today) — the 40-word deck's card for that date shows the Malayalam script word, its ISO 15919 transliteration, meaning and example sentence.",
    "Press \"Mark as revised\" to log the day — the Revision streak panel counts current streak, longest streak and days revised in your browser's local storage.",
    "Click \"Copy card\" to copy the card as text ending in \"Card N of 40\", or search the deck by script, transliteration or meaning.",
  ],
  intro:
    "Malayalam Word of the Day gives one Malayalam word for each calendar date, showing the മലയാളം script form, an ISO 15919 transliteration, the meaning and an example sentence with an English translation. Because the word is derived from the date rather than picked at random, two people studying on the same day always land on the same card. A browser-local streak counter records the consecutive days you actually revised.",
  useCases: [
    "Build a daily five-minute Malayalam habit without signing up for a course or an app.",
    "Teach a child living outside Kerala a word a day with the script, sound and a sentence together.",
    "Pick up practical vocabulary — veḷḷaṁ, bhakṣaṇaṁ, vaḻi, samayaṁ — before a trip to Kochi or Kozhikode.",
    "Search the deck by English meaning when you remember the idea but not the Malayalam word.",
  ],
  benefits: [
    ["Date-locked rotation", "The same date always yields the same word, so study partners stay in sync."],
    ["Script and Roman together", "Every card pairs the Malayalam spelling with a Roman reading, including chillu letters like ൻ and ൽ."],
    ["Full sentence, not a gloss", "Each word arrives inside a natural sentence with its own transliteration and translation."],
  ],
  faqs: [
    [
      "How many words does the Malayalam deck contain?",
      "There are 40 words in the rotation, so the cycle repeats every 40 days. The search and browse list exposes all of them immediately if you do not want to wait for a card to come round.",
    ],
    [
      "What do the dots and lines in the transliteration mean?",
      "They follow ISO 15919: a macron marks a long vowel (ā, ī, ū, ē, ō), an under-dot marks a retroflex consonant (ṭ, ḍ, ṇ, ḷ, ḻ), ṟ is the hard alveolar r of കാറ്റ്, and ṁ stands for the anusvara that ends words like പുസ്തകം.",
    ],
    [
      "Why do some words end in ൻ, ൽ or ൾ?",
      "Those are chillu letters — consonants written without an inherent vowel at the end of a word, as in ചന്ദ്രൻ (candran) and കടൽ (kaṭal). They are a normal part of modern Malayalam spelling, not a typo.",
    ],
    [
      "Is my streak stored on a server?",
      "No. Days you mark as revised are saved in your own browser's local storage, so nothing is uploaded and clearing site data or changing device resets the count.",
    ],
  ],
};

export default seo;
