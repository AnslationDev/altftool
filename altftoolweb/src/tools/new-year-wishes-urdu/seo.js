const seo = {
  intro:
    "This generator builds Urdu new year messages by joining a customary salutation, a greeting from a curated bank of 1 January and Hijri new year wishes, and your sign-off. Each message is shown in Urdu script, in Roman Urdu and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It is for anyone who wants correct Urdu wording for elders, friends or business contacts rather than a forwarded image.",
  useCases: [
    "Send a naya saal mubarak message to an elder using the mohtaram salutation instead of a bare first name.",
    "Write a restrained Hijri new year note for 1 Muharram that does not read as a celebration.",
    "Pick a one-line wish short enough to fit a single 70-character Urdu SMS or a status update.",
    "Share the Roman Urdu version with contacts whose phones have no Urdu keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Urdu letter usage — mohtaram for a senior, janab in formal writing, aziz for a younger relative.",
    ],
    [
      "Urdu and Roman Urdu",
      "Every message appears in Urdu script, in Roman Urdu and in English, so it reads on any keyboard.",
    ],
    [
      "Real SMS length",
      "Urdu script is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Urdu?",
      "نیا سال مبارک ہو (Naya saal mubarak ho) is the everyday phrase, and نئے سال کی دلی مبارکباد (Naye saal ki dili mubarakbaad) is the fuller, more formal version used in cards and business messages.",
    ],
    [
      "Is it appropriate to send celebratory Hijri new year greetings?",
      "Views differ. Muharram is the first month of the Islamic year but is also a month of mourning, especially for Shia Muslims who observe Ashura on 10 Muharram, so many people prefer a sober note wishing peace and mercy over a festive one. If you are unsure of the recipient's practice, keep the wording restrained.",
    ],
    [
      "What is the difference between Urdu script and Roman Urdu?",
      "Urdu script is the Perso-Arabic writing system, usually set in the Nastaliq style and read right to left. Roman Urdu writes the same words with Latin letters, and because there is no single official standard the spellings vary — so treat them as a guide rather than a rule.",
    ],
    [
      "Why does an Urdu SMS use more parts than an English one?",
      "Urdu characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
