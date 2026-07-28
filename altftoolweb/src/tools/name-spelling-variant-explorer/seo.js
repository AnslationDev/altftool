const seo = {
  intro:
    "The Name Spelling Variant Explorer generates the Roman spellings an Indian name can legitimately take, by applying the real transliteration alternations one substitution at a time: aa and a, ee and i, oo and u, ksh and x, sh and s, the h that marks aspiration, the v/b of Bengali and Odia, and the final short a that Sanskritic spellings keep and Hindi ones drop. Each result names the rule that produced it. A second panel reduces any two spellings to a canonical key so you can tell whether Meera and Mira, or Lakshmi and Laxmi, are the same name.",
  useCases: [
    "Work out which alternative spellings of your name may appear on old school, bank or land records.",
    "Search a database or a family tree for every plausible spelling of one ancestor's name.",
    "Settle whether two documents naming Lakshmi and Laxmi, or Ridhi and Riddhi, refer to the same person.",
    "Decide which romanisation to standardise on before applying for a passport or a PAN card.",
  ],
  benefits: [
    ["Rule-traceable", "Every variant lists the substitution that produced it, so nothing is invented."],
    ["Canonical comparison", "Two spellings reduce to a shared key, giving a yes/no answer instead of a guess."],
    ["Implausible forms filtered", "Strings with a doubled h, three repeated letters or an h between consonants are dropped."],
  ],
  faqs: [
    [
      "Are Meera and Mira the same name?",
      "Yes. Both write the same long i sound, one with ee and one with i, and both reduce to the same canonical key here. The same alternation gives Ravee and Ravi, Neeta and Nita, Deepa and Dipa.",
    ],
    [
      "Why is Lakshmi also spelled Laxmi?",
      "The Sanskrit cluster ksh has no single English letter, so it is written either ksh or shortened to x. Laxmi, Lakshmi and Laksmi are the same name, and the same rule gives Saxena and Sakshena, or Laksh and Lax.",
    ],
    [
      "Does the spelling on my documents have to match exactly?",
      "For passports, PAN, Aadhaar and bank KYC in India, yes — the name should be spelled identically across documents, and a mismatch is one of the commonest causes of rejected applications. If your records already differ, correcting them to a single spelling is usually simpler than maintaining both.",
    ],
    [
      "Why do Bengali names write v as b?",
      "Bengali and Odia have no distinct v sound, so Sanskrit v is realised and written as b: Vijay becomes Bijoy, Vishnu becomes Bishnu, Vidya becomes Bidya. This tool shows those as variants but does not treat them as identical in the comparison, because the substitution can also link genuinely different names.",
    ],
  ],
};

export default seo;
