const seo = {
  title: "Odia New Year Wishes: Pana Sankranti & SMS",
  metaDescription:
    "Pana Sankranti and 1 January wishes in Odia script, Roman transliteration and English, with correct salutations and 70-character SMS part counts.",
  steps: [
    "Pick the Occasion — 'Pana Sankranti (Odia new year, 14 April)' or '1 January (Inraji nua barsa)' — plus a tone and who the greeting is for.",
    "Choose the Script (Odia script only, Roman transliteration only, or Odia + Roman) and add optional recipient and sender names.",
    "Press 'Copy greeting' for the featured wish, or 'Feature this'/'Copy' on any match — each shows the English meaning, character count and SMS parts.",
  ],
  intro:
    "This generator assembles Odia new year greetings from a customary salutation, a message chosen from a curated bank of Pana Sankranti and 1 January wishes, and your sign-off. Each greeting is shown in Odia script, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It suits anyone who wants correct Odia wording for elders, friends or business contacts rather than a forwarded image.",
  useCases: [
    "Send a Pana Sankranti message to an elder using the sammananiya salutation instead of a bare first name.",
    "Write a business greeting for customers at the start of the Odia year in Baisakha.",
    "Pick a one-line wish short enough to fit a single 70-character Odia SMS or a status update.",
    "Share the Roman transliteration with relatives whose phones have no Odia keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Odia letter usage — sammananiya for a senior, manyabara in formal writing, snehara for a younger relative.",
    ],
    [
      "Three readable forms",
      "Every greeting appears in Odia script, Roman transliteration and English, so the meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Odia is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Odia?",
      "ନୂଆ ବର୍ଷର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା (Nua barsara harddika shubhechha) is the standard phrase, and for the April new year people add ପଣା ସଂକ୍ରାନ୍ତିର ଶୁଭେଚ୍ଛା (Pana Sankrantira shubhechha).",
    ],
    [
      "When is the Odia new year?",
      "The Odia new year is Pana Sankranti, also called Maha Vishuba Sankranti, which falls on 14 April and opens the month of Baisakha. It coincides with Vishu in Kerala, Puthandu in Tamil Nadu and Bohag Bihu in Assam.",
    ],
    [
      "Why is the day called Pana Sankranti?",
      "Pana is the sweetened drink of water, jaggery, curd, ripe fruit and pepper prepared and shared on that day, and Sankranti marks the sun's passage into a new sign. Greetings often refer to the pana itself.",
    ],
    [
      "Why does an Odia SMS use more parts than an English one?",
      "Odia characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
