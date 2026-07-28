const seo = {
  intro:
    "This generator composes Bengali new year greetings by joining a customary salutation, a greeting from a curated bank of Poila Boishakh and 1 January messages, and your sign-off. Every greeting comes with a Roman transliteration, a plain English meaning and its billable SMS length calculated under the 3GPP 140-byte payload rule. It is aimed at anyone who wants correct Bengali wording for family, elders or business contacts without hunting through image galleries.",
  useCases: [
    "Send a Poila Boishakh message to parents or in-laws using the শ্রদ্ধেয় salutation instead of a casual first name.",
    "Write a halkhata greeting for customers when a shop opens its new account book on the first of Boishakh.",
    "Pick a short one-line wish that fits a single 70-character Bengali SMS or a WhatsApp status.",
    "Get the Roman transliteration so relatives whose phones have no Bengali keyboard can still read the message.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Bengali usage — shroddheyo for elders, mananiyo in formal letters, sneher for a younger relative.",
    ],
    [
      "Three readable forms",
      "Each greeting is shown in Bengali script, Roman transliteration and English, so nothing is lost when you forward it.",
    ],
    [
      "Real SMS length",
      "Bengali text is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Bengali?",
      "শুভ নববর্ষ, transliterated as Shubho Nabobarsho, is the standard greeting. For the January new year Bengalis often say ইংরেজি নববর্ষের শুভেচ্ছা (Ingreji nabobarsher shubhechha) to distinguish it from Poila Boishakh.",
    ],
    [
      "When is Poila Boishakh celebrated?",
      "Poila Boishakh, the first day of the month of Boishakh in the Bengali calendar, falls on 14 or 15 April. West Bengal generally observes it on 15 April and Bangladesh on 14 April, because the two follow slightly different reformed calendars.",
    ],
    [
      "Why does a Bengali SMS cost more parts than an English one?",
      "Bengali characters are not in the GSM 7-bit alphabet, so the message is sent in UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 versus 160 characters in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
    [
      "What is halkhata and why does it appear in new year wishes?",
      "Halkhata is the fresh ledger that Bengali traders open on Poila Boishakh, inviting customers to clear old dues and start new accounts. Business greetings on that day usually wish the shop shribriddhi, meaning growth and prosperity.",
    ],
  ],
};

export default seo;
