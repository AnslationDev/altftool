const seo = {
  title: "Marathi New Year Wishes – Gudhi Padwa Greetings & SMS",
  metaDescription:
    "Gudhi Padwa and 1 January greetings in Devanagari and Roman script with English meaning, plus each message's real SMS length and parts.",
  steps: [
    "Choose the Occasion — Gudhi Padwa (Marathi new year) or 1 January (Ingraji navvarsha) — with a Tone, who it is for, and optional recipient and sender names.",
    "Pick a Script: Devanagari only, Roman transliteration only, or Devanagari + Roman.",
    "Read the greeting with its English meaning and SMS parts count, then click Copy greeting — or Feature this on any match in the list below.",
  ],
  intro:
    "This generator builds Marathi new year greetings by joining a customary salutation, a message from a curated bank of Gudhi Padwa and 1 January wishes, and your sign-off. Each greeting is shown in Devanagari, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It suits anyone who wants correct Marathi wording for elders, friends or business contacts rather than a forwarded image.",
  useCases: [
    "Send a Gudhi Padwa message to a teacher or senior using the आदरणीय salutation instead of a first name.",
    "Write a business greeting for customers on the first day of Chaitra wishing the firm bharbharat.",
    "Choose a one-line wish short enough to fit a single 70-character Devanagari SMS or a status update.",
    "Share the Roman transliteration with relatives whose phones have no Marathi keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Marathi letter usage — aadaraniya for a senior, manyavar in formal writing, chiranjiv for a younger relative.",
    ],
    [
      "Three readable forms",
      "Every greeting appears in Devanagari, Roman transliteration and English, so meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Devanagari is billed as UCS-2, so the tool shows the true 70-character-per-part limit instead of the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you wish someone Happy New Year in Marathi?",
      "नववर्षाच्या हार्दिक शुभेच्छा (Navvarshachya hardik shubhechha) is the general phrase, and गुढीपाडव्याच्या हार्दिक शुभेच्छा is used specifically for Gudhi Padwa. For the January new year Marathi speakers often add इंग्रजी (Ingraji) to make the distinction clear.",
    ],
    [
      "When is Gudhi Padwa?",
      "Gudhi Padwa falls on Chaitra Shukla Pratipada, the first day of the bright fortnight of Chaitra in the Hindu lunisolar calendar, which lands in late March or early April. It marks the Marathi new year and the same day is observed as Ugadi in Karnataka, Telangana and Andhra Pradesh.",
    ],
    [
      "Why do Gudhi Padwa wishes mention neem and jaggery?",
      "A prasad of tender neem leaves with jaggery is eaten on the day, symbolising that a year holds both bitterness and sweetness. Greetings often use that image to wish someone a balanced year.",
    ],
    [
      "Why does a Marathi SMS use more parts than an English one?",
      "Devanagari characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts fall to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
