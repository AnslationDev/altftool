const seo = {
  intro:
    "This generator assembles Kannada new year greetings from a customary salutation, a message chosen from a curated bank of Yugadi and 1 January wishes, and your sign-off. Each greeting is shown in Kannada script, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It suits anyone who wants correct Kannada wording for elders, friends or business contacts instead of a forwarded image.",
  useCases: [
    "Send a Yugadi message to a senior relative using the aadaraneeya ... avare form of address.",
    "Write a business greeting for customers at the start of the new samvatsara.",
    "Pick a one-line wish short enough to fit a single 70-character Kannada SMS or a status update.",
    "Share the Roman transliteration with friends whose phones have no Kannada keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Kannada usage — aadaraneeya with avare for a senior, manya in formal writing, preetiya for family.",
    ],
    [
      "Three readable forms",
      "Every greeting appears in Kannada script, Roman transliteration and English, so the meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Kannada is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Kannada?",
      "ಹೊಸ ವರ್ಷದ ಶುಭಾಶಯಗಳು (Hosa varshada shubhashayagalu) is the general phrase, and ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು (Yugadi habbada shubhashayagalu) is used for the Yugadi festival itself.",
    ],
    [
      "When is Yugadi celebrated?",
      "Yugadi falls on Chaitra Shukla Pratipada, the first day of the bright fortnight of Chaitra in the Hindu lunisolar calendar, which lands in late March or early April. Maharashtra observes the same day as Gudhi Padwa.",
    ],
    [
      "Why do Yugadi wishes mention bevu-bella?",
      "Bevu-bella is the mixture of bitter neem flowers and sweet jaggery eaten on Yugadi morning. It stands for accepting both sorrow and joy in the year ahead, which is why greetings often refer to it.",
    ],
    [
      "Why does a Kannada SMS use more parts than an English one?",
      "Kannada characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
