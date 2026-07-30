const seo = {
  intro:
    "The IPA to Text Helper takes an International Phonetic Alphabet transcription and returns the English word or words it spells, matching the cleaned input against a built-in dictionary of roughly 430 common-word transcriptions. Slashes, brackets and spaces are stripped before lookup, homophones come back together — /tu/ returns both 'to' and 'two' — and each candidate can be read aloud with your browser's speech synthesis. It is for language learners, linguistics students and dictionary readers who have the pronunciation and need the spelling.",
  useCases: [
    "A dictionary entry or textbook gives /ˈhɛloʊ/ and you want to confirm which English word that transcription actually spells.",
    "You are marking a phonetics exercise and need to check whether a student's transcription resolves to the word they intended or to a homophone like 'their' versus 'there'.",
    "You copied a transcription from a subtitle or pronunciation guide, are unsure whether it is even IPA, and want the input validated before you go looking for the word.",
  ],
  benefits: [
    [
      "All homophones, not just one guess",
      "A transcription that maps to several spellings returns every candidate — /baɪ/ gives 'by' and 'buy', /fɔr/ gives 'for' and 'four' — so you can pick by context.",
    ],
    [
      "Tells you when the input is not IPA",
      "A validity check flags input where fewer than 40% of the characters are recognised phonetic symbols, so a typo in ordinary letters is caught rather than silently returning nothing.",
    ],
    [
      "Hear each candidate",
      "Every returned word can be spoken through the browser's speech synthesis at a slowed 0.9 rate in en-US, so you can check the match by ear.",
    ],
  ],
  faqs: [
    [
      "How do I convert IPA back into English words?",
      "Paste the transcription and the tool looks it up against its dictionary of common English pronunciations, returning every word that matches. Enclosing slashes or square brackets, spaces and parentheses are removed automatically, so /hɛloʊ/, [hɛloʊ] and hɛloʊ all resolve the same way.",
    ],
    [
      "Why does my transcription return no result?",
      "Because the lookup is an exact match against a focused set of around 430 common-word transcriptions — a rare word, a different dialect's vowel, or a stress or length mark placed differently will not match. Try the same word without stress marks, or in the General American vowels the dictionary uses.",
    ],
    [
      "How does it know my input is not valid IPA?",
      "It scans the input against its set of recognised IPA symbols, including two-character sequences and the diacritics ˈ, ˌ and ː, and warns you when under 40% of the characters are valid phonetic symbols. That threshold tolerates the occasional stray character while still catching plain English typed by mistake.",
    ],
    [
      "Which accent do the transcriptions use?",
      "General American, which is why 'not' appears as /nɑt/ and 'her' as /hɜr/ rather than in Received Pronunciation forms. Transcriptions written for British English will often fail to match on the vowel even when the word is in the dictionary.",
    ],
  ],
};

export default seo;
