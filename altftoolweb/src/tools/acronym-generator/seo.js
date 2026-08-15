const seo = {
  title: "Acronym Generator: Phrase to Initials",
  metaDescription:
    "Takes the first letter of every word in your phrase, or expands letters into a backronym from a tech, business, creative or health word list.",
  intro:
    "The Acronym Generator works in both directions: give it a phrase and it takes the first letter of every whitespace-separated word and uppercases them into an acronym, or give it a set of letters and it builds a backronym by matching each letter to a word from one of four themed vocabularies — tech, business, creative or health. It is aimed at anyone naming a project, product, team or process who needs the initials and the expansion to line up. Results are deterministic, so the same letters and theme always return the same expansion, and the copy button hands you the finished 'ACRONYM: expanded words' string.",
  useCases: [
    "You have settled on a project name like 'Advanced Network Technology Solutions' and want to see the initials before you put them on a slide",
    "Leadership has already chosen the letters for an internal programme and you need a plausible expansion to fit them, themed to business or tech language",
    "You are checking whether a proposed department name produces an acronym that is pronounceable rather than an awkward six-letter string",
  ],
  benefits: [
    ["Works from either end", "Phrase to initials and letters to expansion are both first-class modes, so you can start from whichever half you already have."],
    ["Themed vocabularies, not random words", "Four curated word sets keep an expansion in a consistent register instead of mixing clinical and creative language in one name."],
    ["Repeatable output", "The letter-to-word match is a fixed lookup, not a random draw, so the same input and theme give you the same result every time you show it to a colleague."],
  ],
  faqs: [
    [
      "How does it decide which letters go into the acronym?",
      "It splits your phrase on whitespace and takes the first character of every word, uppercased. That includes small words like 'of', 'and' and 'the', so if you want them left out, delete them from the phrase before generating.",
    ],
    [
      "What themes can I expand my letters into?",
      "Four: tech, business, creative and health, holding 14 to 15 curated words each — tech offers Artificial, Intelligence, Network, Digital, Cloud, Quantum and similar, while health offers Vital, Holistic, Clinical, Therapeutic and so on. Each letter is matched against the chosen list only, so switching themes changes the whole expansion.",
    ],
    [
      "Why did one of my letters come back with a dash instead of a word?",
      "Because no word in the selected theme starts with that letter. Each list covers roughly a dozen distinct initials, so letters such as K, X and Z usually have no match — try another theme, or type your own word into that slot after copying the result.",
    ],
    [
      "What is the difference between an acronym, an initialism and a backronym?",
      "An acronym is read as a word (NASA, RADAR), an initialism is spelled out letter by letter (FBI, HTML), and a backronym is an expansion invented after the letters were chosen — which is exactly what the Letters to Phrase mode produces. This tool builds the string of initials either way; whether it is pronounceable is your call.",
    ],
  ],
};

export default seo;
