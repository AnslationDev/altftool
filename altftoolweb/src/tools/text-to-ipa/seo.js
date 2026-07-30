const seo = {
  intro:
    "Paste English text and this tool transcribes it into the International Phonetic Alphabet, matching each word against a built-in dictionary of roughly 450 common words in General American pronunciation and falling back to a letter-pattern estimate for anything outside it. Every word is shown individually with its transcription and labelled as a dictionary match or an estimate, and a counter tells you how many of each the passage produced. A speech button reads the original text aloud through your browser's en-US voice so you can hear it alongside the symbols.",
  useCases: [
    "You are learning English and want to see how a sentence you wrote breaks down into vowel and consonant symbols before saying it out loud",
    "You are teaching a phonetics or ESL class and need a worked IPA transcription of a short passage to put on a handout",
    "You are checking which symbol represents the 'th' in a word — the voiced ð of 'this' or the voiceless θ of 'think' — while marking up a script",
  ],
  benefits: [
    ["Tells you what it is sure about", "Each word is flagged as a dictionary match or an estimate, and the totals are shown, so you know exactly which parts of a transcription to double-check."],
    ["Word-by-word, not just a wall of symbols", "The per-word breakdown pairs every original word with its transcription, which is what you need for study rather than one continuous IPA string."],
    ["Hear it as well as read it", "Browser speech synthesis reads the text back in a US English voice at 90 percent speed so the symbols and the sound arrive together."],
  ],
  faqs: [
    [
      "Which accent is the transcription based on?",
      "General American, with the dictionary written as a General American and Received Pronunciation hybrid where the two agree. That means rhotic forms — 'her' is transcribed with an r, as hɜr — so British RP users should expect differences in exactly those r-coloured vowels.",
    ],
    [
      "What happens with a word that is not in the dictionary?",
      "It is transcribed by rule and marked as estimated in amber. The fallback maps digraphs like ch to tʃ, sh to ʃ, th to θ and ph to f, applies simple vowel rules, and drops a final silent e — good enough to read, but not a substitute for a full pronouncing dictionary on unusual or borrowed words.",
    ],
    [
      "Does it show stress marks?",
      "No. The transcriptions give the segments only, without the primary stress mark ˈ or the secondary mark ˌ that a full dictionary entry would carry. For multi-syllable words you will need to add stress yourself from a reference source.",
    ],
    [
      "Can I save the transcription?",
      "Yes — copy the full IPA string to the clipboard, or download it as ipa-transcription.txt. Punctuation and spacing from your original text are preserved in that output, so the transcription lines up with the sentence you pasted.",
    ],
  ],
};

export default seo;
