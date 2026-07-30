const seo = {
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
