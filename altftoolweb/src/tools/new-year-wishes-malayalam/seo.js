const seo = {
  intro:
    "This generator builds Malayalam new year greetings by joining a customary salutation, a message from a curated bank of Vishu, Chingam 1 and 1 January wishes, and your sign-off. Each greeting is shown in Malayalam script, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It is for anyone who wants correct Malayalam wording for elders, friends or business contacts rather than a forwarded image.",
  useCases: [
    "Send a Vishu message to a senior relative using the bahumanappetta salutation instead of a bare name.",
    "Greet colleagues on Chingam 1, the start of the Kollavarsham year, which Kerala also keeps as Farmers' Day.",
    "Pick a one-line wish short enough to fit a single 70-character Malayalam SMS or a status update.",
    "Share the Roman transliteration with relatives abroad whose phones have no Malayalam keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Malayalam usage — bahumanappetta for a senior, manya in formal writing, priyappetta for family.",
    ],
    [
      "Three readable forms",
      "Every greeting appears in Malayalam script, Roman transliteration and English, so the meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Malayalam is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Malayalam?",
      "പുതുവത്സരാശംസകൾ (Puthuvatsaraashamsakal) is the standard phrase for the January new year, while വിഷു ആശംസകൾ (Vishu aashamsakal) is used for Vishu in April.",
    ],
    [
      "When is the Malayalam new year?",
      "There are two. Vishu falls on Medam 1, which is 14 or 15 April and marks the astronomical new year, while the Malayalam Kollavarsham calendar year begins on Chingam 1, around 16 or 17 August.",
    ],
    [
      "What are Vishukkani and Vishukkaineettam?",
      "Vishukkani is the arrangement of rice, fruit, gold, a mirror and kanikkonna flowers that is the first sight on Vishu morning, and Vishukkaineettam is the small money handsel elders give the young. Greetings for the day usually refer to one or the other.",
    ],
    [
      "Why does a Malayalam SMS use more parts than an English one?",
      "Malayalam characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
