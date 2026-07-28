const seo = {
  title: "Love Calculator — Free Name Compatibility Test",
  h1: "Love Calculator",
  metaDescription:
    "Free love calculator: type two names for an instant compatibility score from 15% to 99%, plus chemistry, trust and communication ratings. No signup.",
  intro:
    "The Love Calculator turns two names into a compatibility percentage using a 32-bit polynomial rolling hash. It trims and lowercases both names, sorts them alphabetically, joins them with \"&\", hashes that string with the classic shift-and-subtract multiplier of 31, then maps the result to a score between 15% and 99%. Because it is a hash rather than a random number, the same pair of names always returns the same score and the order you type them in makes no difference. Everything runs in your browser with no API call — and the number reflects the letters in the names, not anything about a real relationship, so treat it as entertainment.",
  useCases: [
    "Settling a playful \"how compatible are we\" question with a partner, crush or friend",
    "Generating a shareable love-percentage result for a card, a story post or a group chat",
    "Seeing how a name-based love calculator actually produces its number, since the same name pair always returns the same score",
  ],
  benefits: [
    [
      "Same names, same result — always",
      "The percentage comes from a hash of the two names, not a random draw, so \"Alex & Sam\" returns the identical score every time you check it, on any browser or device.",
    ],
    [
      "Name order is ignored",
      "Both names are trimmed, lowercased and sorted alphabetically before hashing, so entering them in either order — with or without stray spaces or capitals — gives exactly the same result.",
    ],
    [
      "Runs entirely in your browser",
      "The calculation is plain JavaScript on the page. The tool makes no network request and stores nothing, so the two names you type never leave your device.",
    ],
    [
      "Copy or download the report",
      "One click copies a formatted compatibility report to your clipboard; another saves it as love-compatibility-report.txt with the date, both names, the overall score and all four sub-scores.",
    ],
  ],
  faqs: [
    [
      "How does a love calculator work?",
      "This one hashes the two names. It trims and lowercases both, sorts them alphabetically, joins them with \"&\", then runs a 32-bit polynomial rolling hash (multiplier 31 — the shift-and-subtract form used in Java's String.hashCode) over the combined string. The absolute value is taken modulo 85 and shifted up by 15, producing a score between 15% and 99%. There is no randomness and no data about real couples anywhere in the calculation.",
    ],
    [
      "Is the love calculator accurate?",
      "No — it is entertainment, not measurement, and it cannot predict a relationship. The percentage is a mathematical function of the letters in the two names, so it says nothing about the people behind them. Changing \"Katie\" to \"Kate\" or adding a surname produces a completely different score, which is the clearest sign the number is for fun.",
    ],
    [
      "Why do I get the same love percentage every time?",
      "Because the result is deterministic, not random. The same pair of names always hashes to the same value, so re-running the calculation later, in a different browser, or on another device returns the identical percentage. Nothing is cached — the math simply produces the same answer.",
    ],
    [
      "Does it matter which name goes first?",
      "No. The two names are sorted alphabetically before they are hashed, so \"Sam & Alex\" and \"Alex & Sam\" score exactly the same. Capitalisation and leading or trailing spaces are also ignored, since both names are lowercased and trimmed first.",
    ],
    [
      "What is a good score on the love calculator?",
      "The tool labels 85% and above \"Perfect Match\", 70–84% \"Strong Connection\", 50–69% \"Good Potential\", and anything below 50% \"Work in Progress\". Scores are capped to the 15%–99% range, so a literal 0% or 100% is not a possible output.",
    ],
    [
      "What do the chemistry, trust, communication and fun scores mean?",
      "They are four sub-scores derived from the main percentage, not separate measurements. Each multiplies the overall score by a different prime — 7 for chemistry, 13 for trust, 17 for communication, 23 for fun — then takes the result modulo 31 and adds 69, so every sub-score falls between 69% and 99%.",
    ],
    [
      "What is the L-O-V-E-S letter table?",
      "It is a letter count of the two names combined. The tool joins both names, lowercases them, and counts how many times L, O, V, E and S each appear, plus a total. It mirrors the pen-and-paper \"LOVES\" tally and is shown alongside the score — it does not feed into the compatibility percentage.",
    ],
    [
      "Is the love calculator free, and are the names I enter saved?",
      "Yes, it is completely free with no signup or usage limit, and no, nothing is saved. The whole calculation happens in JavaScript inside your browser tab — the tool sends no request to any server and writes nothing to storage, so both names stay on your device.",
    ],
  ],
  steps: [
    "Type the first name and the second name into the two fields.",
    "Press Calculate Compatibility — the name pair is hashed in your browser and the result appears after a short animation of about 1.5 seconds.",
    "Read the overall percentage, the four sub-scores and the L-O-V-E-S letter table, then copy the report or download it as a .txt file.",
  ],
};

export default seo;
