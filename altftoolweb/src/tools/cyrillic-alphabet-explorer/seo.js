const seo = {
  title: "Cyrillic Alphabet Explorer: 33 Letters, ICAO",
  metaDescription:
    "All 33 Russian letters with names, sounds and Latin lookalikes, plus a transliterator using ICAO passport romanisation or reversible ISO 9:1995.",
  steps: [
    "Paste Russian into the 'Cyrillic text' box, which opens with Москва, Санкт-Петербург, Чайковский, Юлия already in it.",
    "Pick the 'Romanisation standard': 'ICAO passport (Russian passports since 2013)', which avoids diacritics, or 'ISO 9:1995 System A (scholarly)', which maps one Latin letter per Cyrillic letter and is fully reversible.",
    "The 'Romanised' line rewrites as you type — Юлия comes out Iuliia under the passport standard — with counts for Cyrillic letters in the text, letters that look and sound Latin and the share already readable, and 'Copy result' takes the pair. Below, 'The alphabet' filters the letters by All 33, Vowels, Consonants or Signs.",
  ],
  intro:
    "The modern Russian alphabet has 33 Cyrillic letters — 10 vowels, 21 consonants and two silent signs — and this explorer gives each one its Russian name, its sound and its romanised form. It transliterates any Cyrillic text two ways: the ICAO Doc 9303 standard used on Russian passports, which uses no diacritics, and ISO 9:1995, which maps one Latin letter to one Cyrillic letter and is fully reversible. It also flags the eighteen letters whose shapes are borrowed from or resemble Latin ones, which is where most beginners go wrong.",
  useCases: [
    "Check how a Russian name will be spelt on a passport or airline ticket before booking — Юлия becomes Iuliia, not Yulia.",
    "Read a Moscow metro sign by recognising that В is v, Н is n, Р is r and С is s.",
    "Convert a Russian citation into ISO 9 for a bibliography that needs a reversible romanisation.",
    "Learn the alphabet in stages by filtering to vowels, consonants or the two silent signs.",
  ],
  benefits: [
    ["Two real standards, not one guess", "ICAO passport romanisation and ISO 9 give very different spellings; both are implemented exactly."],
    ["False friends called out", "Every letter that borrows a Latin shape carries a note explaining what it actually sounds like."],
    ["Progress you can see", "Any pasted text is scored for how much of it you could already read from familiar letter shapes."],
  ],
  faqs: [
    [
      "How many letters are in the Russian alphabet?",
      "33: ten vowels (а, е, ё, и, о, у, ы, э, ю, я), twenty-one consonants, and two signs (ъ and ь) that make no sound of their own. The soft sign softens the consonant before it and the hard sign blocks that softening.",
    ],
    [
      "Why is my Russian name spelt differently on my passport?",
      "Since 2013 Russian passports use the ICAO Doc 9303 romanisation, which writes я as ia, ю as iu, й as i and drops the soft sign entirely. That turns Юлия into Iuliia and Дмитрий into Dmitrii, even where an English speaker would expect Yulia and Dmitry.",
    ],
    [
      "Which Cyrillic letters look like Latin letters but sound different?",
      "The main traps are В (v, not b), Н (n, not h), Р (r, not p), С (s, not c), У (oo, not y) and Х (a rasped kh, not x). Recognising just these six removes most of the confusion when reading street signs.",
    ],
    [
      "What is the difference between ISO 9 and passport transliteration?",
      "ISO 9:1995 uses one Latin letter per Cyrillic letter with diacritics — ж is ž, щ is ŝ — so the original spelling can always be reconstructed. Passport romanisation avoids diacritics entirely, writing ж as zh and щ as shch, which is readable but not reversible.",
    ],
  ],
};

export default seo;
