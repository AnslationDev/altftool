const seo = {
  title: "Malayalam Birthday Wishes with Romanisation",
  metaDescription:
    "Pick the relationship and tone for a Malayalam birthday message in the familiar, polite or formal form, with romanisation, English and SMS length.",
  steps: [
    "Set 'Who is it for?' (Friend, Elder brother and the rest), pick a 'Tone' and 'How many messages', and optionally fill 'Their name (optional)' and 'Sign it from (optional)'.",
    "Leave 'Politeness' on 'Automatic (match the relationship)' or force one of the three registers — 'നീ — familiar', 'നിങ്ങൾ — respectful' or 'താങ്കൾ — formal honorific' — and press 'Other wordings' to reshuffle the pool written for that pairing.",
    "Tick 'Romanised' and 'English meaning' to show them under each message, check the 'Pronoun used', 'Opening line', 'Sign-off', 'Wordings available' and 'SMS length' rows, then press 'Copy all'.",
  ],
  intro:
    "Malayalam Birthday Wishes Generator writes a complete Malayalam birthday message — opening line, wish and sign-off — from the relationship you pick and the tone you want. Malayalam separates നീ from നിങ്ങൾ, and adds താങ്കൾ for formal writing; the pronoun changes the possessive (നിന്റെ, നിങ്ങളുടെ, താങ്കളുടെ) and the dative (നിനക്ക്, നിങ്ങൾക്ക്, താങ്കൾക്ക്), so each wording is stored twice rather than patched, and the register is set automatically from the relationship. Wordings written for a parent, a partner, a child, a teacher or a manager are only offered to that relationship, so two people never get the same sentence with a different name pasted in. Every message comes with romanised Malayalam, an English meaning, and the number of SMS parts it needs.",
  useCases: [
    "Send a manager, a teacher or an older relative a wish in the നിങ്ങൾ or താങ്കൾ form without accidentally sounding over-familiar.",
    "Write something light for a close friend or a younger sibling in the നീ form that still reads like natural Malayalam.",
    "Get a romanisation and an English gloss so you can check what you are sending before you send it, even if you cannot read the script.",
  ],
  benefits: [
    [
      "നീ, നിങ്ങൾ and താങ്കൾ handled properly",
      "All three registers are written out in full, so the possessive and dative forms agree instead of being word-swapped.",
    ],
    [
      "Romanisation and English on every line",
      "Each message ships with a transliteration and a plain-English meaning, so nothing goes out unread.",
    ],
    [
      "Wordings that match the relationship",
      "A message for a parent, a partner, a child or a manager is written for that person, not reused from a single template.",
    ],
  ],
  faqs: [
    [
      "How do you say happy birthday in Malayalam?",
      "The two everyday forms are ജന്മദിനാശംസകൾ (janmadināśaṁsakaḷ), literally 'birthday wishes', and പിറന്നാൾ ആശംസകൾ (piṟannāḷ āśaṁsakaḷ), which uses the more homely word പിറന്നാൾ for a birthday. For a warmer version, put ഹൃദയം നിറഞ്ഞ (hr̥dayaṁ niṟañña, 'heartfelt') in front.",
    ],
    [
      "Should I use നീ, നിങ്ങൾ or താങ്കൾ?",
      "നീ (nī) is the familiar form for friends, a partner, younger siblings and children. നിങ്ങൾ (niṅṅaḷ) is the ordinary polite form for parents, elder siblings, colleagues and anyone older. താങ്കൾ (tāṅkaḷ) is the formal honorific used in written and ceremonial Malayalam — managers, teachers, clients and public messages. Getting this wrong is the most common mistake in a Malayalam greeting, so the tool picks a default from the relationship and lets you override it.",
    ],
    [
      "Do Malayalam verbs change with the pronoun?",
      "No. Unlike Hindi, Malayalam verbs do not inflect for person or number, so ആകട്ടെ ('may it be') is the same whoever you are addressing. The register lives entirely in the pronoun and its case forms, which is why only those parts differ between the versions here.",
    ],
    [
      "Why does a Malayalam message cost more than one SMS?",
      "Malayalam falls outside the GSM 03.38 7-bit alphabet, so the message is encoded as UCS-2. That drops the limit from 160 characters to 70 in a single SMS, and to 67 per part once the message is split, under 3GPP TS 23.038. WhatsApp and other data messaging apps are unaffected.",
    ],
  ],
};

export default seo;
