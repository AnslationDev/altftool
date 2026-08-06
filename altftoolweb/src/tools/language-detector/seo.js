const seo = {
  intro:
    "The Language Detector identifies what language a piece of text is written in by combining two signals: Unicode script detection across 19 script blocks (Latin, Cyrillic, Arabic, Devanagari, Chinese, Hangul, Tamil, Thai and more) and per-language character-frequency profiles that separate the 14 Latin-script languages it distinguishes. It returns up to five ranked candidates with a confidence score for each, a breakdown of which scripts appear and in what proportion, and character statistics — total characters, words, letters and unique characters. When more than one script is present it flags the text as possibly mixed-language rather than forcing a single answer.",
  useCases: [
    "A support ticket or form submission arrives with no language field and you need to know which team to route it to before you can reply.",
    "You have a spreadsheet column of user-generated comments and want to spot-check whether an entry is Spanish or Portuguese — the two share most letters, so you want to see the confidence gap rather than a single label.",
    "You received a filename or a snippet in an unfamiliar script and just need to know whether it is Bengali, Gujarati, Odia or Kannada before you look for a translator.",
  ],
  benefits: [
    ["Script detection shown separately", "You see the actual proportion of each Unicode script in the text, which is what tells you a paragraph is 80% Devanagari with Latin brand names mixed in."],
    ["Ranked candidates, not one guess", "Up to five languages come back with confidence scores, so a close call between Spanish and Portuguese is visible instead of hidden."],
    ["Mixed-language input handled", "Text containing two or more scripts is flagged as mixed rather than collapsed into whichever script happens to have more characters."],
  ],
  faqs: [
    [
      "How does the language detection work?",
      "Two passes. First, every character is matched against 19 Unicode script blocks, and a dominant non-Latin script maps straight to a language — Hangul to Korean, Thai to Thai, Hiragana or Katakana to Japanese. Second, Latin-script text is scored against character profiles for 14 languages, weighting distinctive letters like ñ, ß, ğ, ł and ă more heavily than shared ones.",
    ],
    [
      "How much text does it need to be accurate?",
      "The more the better — a full sentence is far more reliable than a couple of words. Frequency-based detection has little to work with in short strings, and a Latin-script phrase with no accented characters can score similarly across English, Dutch and Indonesian. Confidence scores reflect the relative fit of candidates, not a statistical certainty.",
    ],
    [
      "Can it tell Hindi from Marathi, or Urdu from Arabic?",
      "Not reliably, because those pairs share a script. Devanagari text is reported as Hindi, and Arabic-script text — including Urdu, which is written in the same Arabic script — is always reported as Arabic, since detection works at the script-block level and has no way to distinguish languages that share a writing system. Script-block classification is deterministic for the ranges this tool covers, but the inferred language is only a heuristic — especially for shared scripts.",
    ],
    [
      "Is my text sent anywhere?",
      "No. Detection runs entirely in your browser using built-in script ranges and character profiles, with no API call, so pasting a private message or a customer email does not transmit it.",
    ],
  ],
};

export default seo;
