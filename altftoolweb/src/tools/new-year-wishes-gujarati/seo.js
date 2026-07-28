const seo = {
  intro:
    "This generator assembles Gujarati new year greetings from a customary salutation, a message chosen from a curated bank of Bestu Varas and 1 January wishes, and your sign-off. Each greeting appears in Gujarati script, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It is for anyone who wants correct Gujarati wording for elders, friends or business contacts instead of a forwarded image.",
  useCases: [
    "Send a Bestu Varas message the morning after Diwali using Saal Mubarak or Nutan Varshabhinandan.",
    "Write a Chopda Pujan greeting for customers when the firm opens its new account books.",
    "Pick a one-line wish short enough to fit a single 70-character Gujarati SMS or a status update.",
    "Share the Roman transliteration with relatives whose phones have no Gujarati keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Gujarati letter usage — aadarniya for a senior, mananiya in formal writing, vahala for a younger relative.",
    ],
    [
      "Three readable forms",
      "Every greeting is shown in Gujarati script, Roman transliteration and English, so meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Gujarati is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Gujarati?",
      "નૂતન વર્ષાભિનંદન (Nutan Varshabhinandan) and સાલ મુબારક (Saal Mubarak) are both standard. Nutan Varshabhinandan is the more formal of the two and is what you would put on a card or a business message.",
    ],
    [
      "When is the Gujarati new year?",
      "The Gujarati new year, Bestu Varas, falls on Kartak Sud Ekam — the first day of the bright fortnight of Kartak, which is the day after Diwali in October or November. The Gujarati Vikram Samvat calendar therefore starts about ten weeks before 1 January.",
    ],
    [
      "What is Chopda Pujan?",
      "Chopda Pujan is the worship of the account books that Gujarati traders perform on Diwali, closing the old ledgers and opening new ones for the coming year. Business new year greetings usually refer to it and wish the firm shrivruddhi, meaning prosperity.",
    ],
    [
      "Why does a Gujarati SMS use more parts than an English one?",
      "Gujarati characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
