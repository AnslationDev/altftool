const seo = {
  title: "Punjabi New Year Wishes in Gurmukhi & Roman",
  metaDescription:
    "Vaisakhi, Nanakshahi (1 Chet) and 1 January greetings in Gurmukhi, Roman and English, with the ji honorific applied and real UCS-2 SMS lengths.",
  steps: [
    "Pick the \"Occasion\" — \"Vaisakhi (13 or 14 April)\", \"Nanakshahi new year (1 Chet)\" or \"1 January\" — plus a \"Tone\" and \"Script\".",
    "Set \"Who is it for\" (Elder / teacher adds the ji honorific) and optionally the recipient's name and your name.",
    "Browse the greetings in Gurmukhi, Roman transliteration and English with each one's SMS length, then click \"Copy greeting\".",
  ],
  intro:
    "This generator builds Punjabi new year greetings by joining a customary salutation, a message from a curated bank of Vaisakhi, Nanakshahi new year and 1 January wishes, and your sign-off. Each greeting is given in Gurmukhi, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It is for anyone who wants correct Punjabi wording for elders, friends or business contacts rather than a forwarded image.",
  useCases: [
    "Send a Vaisakhi message to a relative using the ji honorific instead of a bare first name.",
    "Write a Nanakshahi new year greeting on 1 Chet for a gurdwara group or a family WhatsApp thread.",
    "Choose a one-line wish short enough to fit a single 70-character Gurmukhi SMS or a status update.",
    "Share the Roman transliteration with cousins abroad whose phones have no Gurmukhi keyboard.",
  ],
  benefits: [
    [
      "Correct use of ji",
      "The honorific ji is added for anyone senior or formal and dropped for a younger relative, matching normal Punjabi practice.",
    ],
    [
      "Three readable forms",
      "Every greeting is shown in Gurmukhi, Roman transliteration and English, so the meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Gurmukhi is billed as UCS-2, so the tool shows the true 70-character-per-part limit instead of the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Punjabi?",
      "ਨਵੇਂ ਸਾਲ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ (Nave saal diyan lakh lakh vadhaiyan) is the usual full phrase and ਨਵਾਂ ਸਾਲ ਮੁਬਾਰਕ (Nava saal mubarak) is the short form. Lakh lakh vadhaiyan literally means a hundred thousand congratulations.",
    ],
    [
      "When is the Punjabi new year?",
      "It depends on the calendar. The Nanakshahi calendar begins on 1 Chet, which corresponds to 14 March, while Vaisakhi on 13 or 14 April marks the harvest and the founding of the Khalsa in 1699 and is widely kept as a new year celebration.",
    ],
    [
      "Should I add ji to the name in a Punjabi greeting?",
      "Add ji for anyone older than you, a teacher, a customer or anyone you address formally, and leave it out for close friends and someone younger. Dropping ji with an elder reads as blunt, so include it when in doubt.",
    ],
    [
      "Why does a Gurmukhi SMS use more parts than an English one?",
      "Gurmukhi characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
