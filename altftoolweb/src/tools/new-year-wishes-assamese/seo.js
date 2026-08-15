const seo = {
  title: "Assamese New Year Wishes - Bihu Greetings with SMS Count",
  metaDescription:
    "Bohag Bihu and 1 January greetings in Assamese script with Roman transliteration, English meaning and exact SMS parts under the 70-character UCS-2 rule.",
  steps: [
    "Choose the Occasion - 'Bohag Bihu / Rongali Bihu (Assamese new year)' or '1 January (Natun bosor)' - plus Tone, Who is it for and Script (Assamese, Roman or both), with optional recipient and sender names.",
    "Pick a greeting from All matching greetings using 'Feature this' - each shows the message, its English meaning and its character and SMS-part counts.",
    "Check the featured greeting's SMS alphabet and billable parts (Assamese script bills as UCS-2 at 70 characters per part) and click Copy greeting.",
  ],
  intro:
    "This generator builds Assamese new year greetings by joining a customary salutation, a message from a curated bank of Bohag Bihu and 1 January wishes, and your sign-off. Each greeting is shown in Assamese script, in Roman transliteration and in English, with its billable SMS length worked out under the 3GPP 140-byte payload rule. It is for anyone who wants correct Assamese wording for elders, friends or business contacts rather than a forwarded image.",
  useCases: [
    "Send a Rongali Bihu message to an elder using the xroddheyo salutation instead of a bare first name.",
    "Write a business greeting for customers at the start of Bohag, the first Assamese month.",
    "Pick a one-line wish short enough to fit a single 70-character Assamese SMS or a status update.",
    "Share the Roman transliteration with friends whose phones have no Assamese keyboard.",
  ],
  benefits: [
    [
      "Correct honorifics",
      "Salutations follow normal Assamese letter usage — xroddheyo for a senior, mananiyo in formal writing, xnehor for a younger relative.",
    ],
    [
      "Three readable forms",
      "Every greeting appears in Assamese script, Roman transliteration and English, so the meaning survives forwarding.",
    ],
    [
      "Real SMS length",
      "Assamese is billed as UCS-2, so the tool shows the true 70-character-per-part limit rather than the 160 people assume.",
    ],
  ],
  faqs: [
    [
      "How do you say Happy New Year in Assamese?",
      "নতুন বছৰৰ আন্তৰিক শুভেচ্ছা (Natun bosoror antorik xubhessa) is the standard phrase, and around mid-April people pair it with ৰঙালী বিহুৰ শুভেচ্ছা (Rongali Bihur xubhessa).",
    ],
    [
      "When is the Assamese new year?",
      "The Assamese new year begins on the first day of Bohag, which falls on 14 or 15 April and opens Rongali Bihu, the spring festival. Assam keeps two other Bihus as well — Magh or Bhogali Bihu in January and Kati or Kongali Bihu in October.",
    ],
    [
      "Is the Assamese script the same as Bengali?",
      "They share most letters but not all. Assamese uses ৰ for the ra sound and ৱ for wa, where Bengali uses র and ব with a diacritic, so text typed in one is not automatically correct in the other.",
    ],
    [
      "Why does an Assamese SMS use more parts than an English one?",
      "Assamese characters are outside the GSM 7-bit alphabet, so the message is sent as UCS-2. One SMS carries 140 bytes, which is 70 UTF-16 characters in UCS-2 against 160 in GSM-7, and concatenated parts drop to 67 and 153 respectively.",
    ],
  ],
};

export default seo;
