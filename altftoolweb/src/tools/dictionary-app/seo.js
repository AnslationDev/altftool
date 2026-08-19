const seo = {
  title: "English Dictionary with US/UK Audio & Quizzes",
  metaDescription:
    "Definitions by part of speech with synonyms, antonyms and examples, spoken in en-US or en-GB and translatable into Hindi, Spanish or French.",
  intro:
    "The Dictionary App looks up an English word and returns its definitions by part of speech, phonetic spelling, example sentences, synonyms and antonyms in a single search, then lets you translate any definition into Hindi, Spanish or French and hear the word spoken in a US or UK voice. Words you save go into your own collections, feed a multiple-choice quiz built from their real definitions, and count toward a daily streak. It is for learners building vocabulary rather than people who just need one meaning and a tab close.",
  useCases: [
    "You hit an unfamiliar word while reading, look it up, save it to a 'Reading' collection, and get quizzed on it later instead of forgetting it by the next page.",
    "You are preparing for an English exam and want to hear the difference between the US and UK pronunciation of a word, slowed down, before you say it out loud.",
    "You understand the English definition only halfway, so you translate that specific definition into Hindi to check you have it right rather than guessing.",
  ],
  benefits: [
    ["Definitions, synonyms and antonyms together", "One search pulls the dictionary entry plus related-word data, so you do not open three tabs to place a word among its neighbours."],
    ["Quizzes built from real definitions", "Wrong answers are drawn from the word's own other senses and your saved words, which makes the multiple choice test comprehension rather than pattern-matching."],
    ["Spoken both ways, at two speeds", "Speech synthesis reads the word in an en-US or en-GB voice, with a slow mode at half rate for syllable-by-syllable practice."],
  ],
  steps: [
    "Type an English word into the Search for a word... box on the Dictionary tab. From two characters on, a Suggestions list drops down that you can walk with the arrow keys and choose with Enter, and an empty box instead offers your last eight Recent searches with a Clear all link.",
    "Press Search — the button reads Searching... while the lookup runs — or just hit Enter. The entry comes back headed by the word, its phonetic spelling and an Easy, Medium or Hard badge, and the US, UK, Slow and Listen buttons speak it in the accent and speed you select.",
    "Definitions are grouped by part of speech with See more revealing the rest, and the Hindi, Spanish and French chips under any single definition translate just that line in place; Learn this word saves the entry, the button switching to Saved!, and the saved word then appears under My Vocab and feeds the Quiz tab, while Refresh clears the result and empties the search box.",
  ],
  faqs: [
    [
      "Can I hear how a word is pronounced?",
      "Yes — the tool speaks the word using your browser's speech synthesis and lets you choose an American (en-US) or British (en-GB) voice, plus a slow mode that halves the speaking rate. Phonetic spelling is shown alongside where the dictionary entry provides it.",
    ],
    [
      "Which languages can it translate definitions into?",
      "Three: Hindi, Spanish and French. Translation is applied to a specific definition on demand rather than to the whole entry, so you see the English and the translation side by side.",
    ],
    [
      "How does the daily streak work?",
      "Your streak increases by one each day you visit — returning the day after your last visit continues it, and a gap of more than a day resets the count to 1 while your best streak is kept. A word of the day is drawn from a rotating list of about 95 words so you do not see the same one twice in a row.",
    ],
    [
      "Are my saved words stored anywhere online?",
      "No — collections, saved words and streak data live in your browser's local storage on this device, and recent lookups are cached in session storage, up to 50 words, to avoid repeat requests. Only the word you search is sent to the public dictionary and word-relation services.",
    ],
  ],
};

export default seo;
