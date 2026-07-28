const seo = {
  intro:
    "This tool breaks an English word into syllables and marks which one carries the primary stress, so a long word like in-for-MA-tion can be said in the right rhythm. Splitting follows the standard phonics rules — one vowel nucleus per syllable, a silent final e joins the syllable before it, VC-CV splits between two consonants while V-CV splits before one, and a final consonant plus le is its own syllable. Stress comes from the suffix rules taught in pronunciation courses, and every word is labelled as rule-based or an estimate so you know when to check a dictionary.",
  useCases: [
    "Work out where to put the stress in exam vocabulary such as photography, electricity and communicate before a speaking test.",
    "Prepare a word list for a phonics or spelling lesson with the syllable breaks already marked.",
    "Check whether a two-syllable word is stressed on the first or the second syllable depending on whether it is a noun or a verb.",
    "Count syllables for a haiku, limerick or rap line without saying each word out loud.",
  ],
  benefits: [
    ["Stress, not just splitting", "Marks the stressed syllable in capitals and in a dot-and-mark form like ˈin·for·ma·tion."],
    ["Names the rule", "Every answer says which suffix rule fired, so you can apply it to the next word yourself."],
    ["Honest about limits", "Words with no stress-fixing suffix are labelled estimates instead of being presented as fact."],
  ],
  faqs: [
    [
      "How do you know how many syllables a word has?",
      "Count the vowel sounds, not the vowel letters: each syllable has exactly one. A silent final e adds no syllable (make is one syllable), and two vowel letters usually make one sound (boat, rain) unless they are a hiatus pair like the i and o in ra-di-o.",
    ],
    [
      "Which syllable is stressed in English words?",
      "It depends mainly on the ending. Words ending in -tion, -sion, -ic, -ial and -ious stress the syllable immediately before the ending (in-for-MA-tion, e-LEC-tric). Words ending in -ity, -ify, -ate, -logy and -graphy stress the third syllable from the end (u-ni-VER-si-ty, bi-O-lo-gy). Endings like -ee, -eer, -ese and -esque take the stress themselves (en-gi-NEER, Jap-a-NESE).",
    ],
    [
      "Why does the same word change stress as a noun and a verb?",
      "Around 150 English word pairs shift stress with word class: a REC-ord but to re-CORD, a PRES-ent but to pre-SENT, an OB-ject but to ob-JECT. Nouns and adjectives usually take the first syllable, verbs the second, which is why this tool asks for the part of speech.",
    ],
    [
      "Are these syllable breaks the same as a dictionary's?",
      "Not always. Dictionaries break words after the stressed vowel (pho·tog·ra·phy), while phonics teaching splits before a single consonant (pho-to-gra-phy). Both put the stress on the same vowel sound, which is what matters when you say the word. Treat any result labelled an estimate as a starting point, and confirm it with a dictionary recording.",
    ],
  ],
};

export default seo;
