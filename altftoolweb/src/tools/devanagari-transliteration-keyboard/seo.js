const seo = {
  title: "Roman Hindi to Devanagari Converter, Both Directions",
  metaDescription:
    "Rule-based conversion between Roman Hindi and Devanagari, with a keep-or-strip punctuation toggle and a count of the characters the rules changed.",
  steps: [
    "Choose a direction with the Roman → Devanagari or Devanagari → Roman tab, then type or paste into Source phrase — or load the Namaste Bharat or नमस्ते भारत preset.",
    "Leave Preserve punctuation ticked to Keep spaces, digits, and punctuation, or untick it to strip everything except letters, combining marks and whitespace before conversion.",
    "The Result panel shows the converted phrase with Input characters, Output characters and Rule substitutions; Copy puts it on the clipboard and Download saves devanagari-transliteration-keyboard.txt.",
  ],
  intro:
    "The Devanagari Transliteration Keyboard converts text between Roman Hindi and Devanagari script using rule-based local mapping — a dictionary of common Hindi spellings in the Roman-to-Devanagari direction, and a character-by-character vowel, consonant, matra and anusvara map in the Devanagari-to-Roman direction. You can keep or strip spaces, digits and punctuation, and it reports the input length, output length and how many characters the rules changed. It is a quick script converter for short phrases, not a full Hindi input method, so names, conjuncts, schwa deletion and regional spellings will need manual correction.",
  useCases: [
    "Someone sends you a WhatsApp message typed in Roman Hindi and you want it back in Devanagari before pasting it into a document that should be in script.",
    "You have a Devanagari phrase — a shop name, a caption, a place name — and need a readable Roman spelling for a slide, a URL slug or a colleague who cannot read the script.",
    "You are writing a bilingual form label and want to check how a short greeting like namaste renders in Devanagari without installing a Hindi keyboard layout.",
  ],
  benefits: [
    ["Works in both directions", "Roman to Devanagari for common Hindi spellings, and Devanagari to Roman with a full vowel, matra, anusvara and visarga map."],
    ["Punctuation you can keep or drop", "One toggle decides whether spaces, digits and punctuation survive the conversion, so you can produce clean script text or a faithful copy."],
    ["Shows how much it changed", "Reports input characters, output characters and the number of rule substitutions, so you can see at a glance how much of the text the rules actually touched."],
  ],
  faqs: [
    [
      "Does it transliterate any Hindi word I type?",
      "Not in the Roman-to-Devanagari direction — that side works from a dictionary of common Hindi spellings such as namaste, dhanyavaad, shukriya, mera, naam and city names, and leaves unrecognised words as you typed them. The Devanagari-to-Roman direction is character-based and handles arbitrary text.",
    ],
    [
      "Why does my name come out wrong?",
      "Proper nouns are the weakest case for rule-based transliteration because Hindi spellings of names vary and the rules cannot know which one you mean. Expect to correct names, conjunct clusters and regional spellings by hand.",
    ],
    [
      "Can I keep the punctuation and numbers in my text?",
      "Yes — leave the 'Keep spaces, digits, and punctuation' toggle on and they pass through untouched. Turn it off and everything except letters, combining marks and whitespace is stripped before conversion.",
    ],
    [
      "Is this a Hindi typing keyboard?",
      "No — it converts text you paste or type rather than acting as a system input method, and it handles short phrases better than long passages. For everyday Hindi typing, use your operating system's Devanagari input; use this when you need a quick one-off conversion in either direction.",
    ],
  ],
};

export default seo;
