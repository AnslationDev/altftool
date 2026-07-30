const seo = {
  intro:
    "Most name-meaning pages give you a one-line gloss and no way to check it. This one shows the working. Every entry names the language the name is first attested in, the word it is built on — the Semitic three-consonant root, the Sanskrit verbal root, the Greek or Germanic compound — and the gloss of that word, then lists the forms the same name takes elsewhere: John as Yōḥānān, Ioannes, Yahya, Juan, Giovanni, Ivan and Seán. Where a reconstructed ancestor is well established it is shown with its descendants, so you can see that Sanskrit rājan, Latin rēx and the rīc inside Richard are one inherited word rather than a coincidence, and that Amrita and Greek ambrosia are the same compound built twice. Names whose etymology scholarship genuinely disputes — Mary is the famous case — are labelled disputed and the competing proposals are listed instead of one being picked. The dictionary is offline and fixed: you can search it in Latin script or in Arabic, Hebrew, Greek or Devanagari, and if a name is not in it you are told so plainly rather than being handed an invented meaning.",
  useCases: [
    "Find out what root a family name is built on before naming a child, and see the form it would take in a grandparent's language.",
    "Check whether two names in different languages — Iskandar and Alexander, Yusuf and Joseph, Solomon and Sulayman — really are the same name.",
    "Look up the Arabic or Sanskrit root behind a name and see the other names built from the same three consonants or the same verb.",
  ],
  benefits: [
    [
      "Roots, not just glosses",
      "Each entry shows the actual root word and its meaning, in its own script where that applies, so the gloss can be traced rather than trusted.",
    ],
    [
      "Cross-language forms and cognates",
      "Forms are grouped by language family, and well-established Proto-Indo-European and Proto-Semitic roots are listed with their descendants in other languages.",
    ],
    [
      "It admits what is unknown",
      "Disputed etymologies are marked as disputed, and a name that is not in the dictionary returns nothing at all instead of a fabricated meaning.",
    ],
  ],
  faqs: [
    [
      "How does the search understand Arabic or Devanagari input?",
      "Queries are folded to a comparison key: Latin accents are stripped, Hebrew vowel points and Arabic harakat are removed, and case and punctuation are ignored. So محمّد and محمد both find Muhammad, and राजन् finds Raja, as do the transliterations and every listed cognate form.",
    ],
    [
      "Why do some names say the meaning is disputed?",
      "Because it is. Mary, from Hebrew Miryām, has at least three competing derivations — a link to mar, bitter; a proposed root meaning beloved; and Egyptian mry, beloved — and none is settled. Presenting one as the answer would be inventing certainty that the sources do not have.",
    ],
    [
      "Are two names with the same meaning actually related?",
      "Usually not, and the tool separates the two cases. Theodore, Nathaniel and Bogdan all mean gift of God but come from Greek, Hebrew and Slavic roots independently, and they are listed as unrelated names with the same meaning. Names that really do share an inherited root — Raja, Regina and Richard — are listed separately under that root.",
    ],
    [
      "What does this tool not do?",
      "It makes no network request and queries no name database, so its coverage is limited to the entries curated in it, and it cannot tell you a name's popularity, its regional distribution, or anything about a specific person. Etymology also is not authority: it records where a word came from, not what a name means to the family who chose it.",
    ],
  ],
};

export default seo;
