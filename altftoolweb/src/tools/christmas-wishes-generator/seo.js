const seo = {
  title: "Merry Christmas in 30 Languages + SMS Check",
  metaDescription:
    "Write a Christmas greeting in 30 languages in a warm, formal or short tone, with transliteration and whether it sends as one 160-character SMS.",
  steps: [
    "Choose a Language from the thirty listed and a Tone, then type Their name (optional) and Your name (optional) so the greeting is written with the names in place.",
    "Tick \"Add the transliteration line for non-Latin scripts\" if the script is not Latin, and note that \"Add a tree emoji (this forces UCS-2 encoding)\" cuts the SMS allowance.",
    "Message length reports the character count, the GSM-7 or UCS-2 Encoding and the SMS parts; Copy greeting copies the text, \"Other tones\" shows the same greeting in every tone, and the Year box lists Advent Sunday, Twelfth Night, Epiphany and Julian-calendar Christmas.",
  ],
  intro:
    "This generator writes a Christmas greeting in thirty languages — from Spanish, French and German to Greek, Russian, Thai, Japanese, Korean, Hindi, Tamil and Malayalam — in a warm, formal or short tone, with the sender's and recipient's names in place and a transliteration line for non-Latin scripts. It scores the finished message against the SMS rules in 3GPP TS 23.038, so you can see whether it sends as one 160-character GSM-7 message or splits into 70-character UCS-2 parts. It also works out the Christmas calendar for any year: Advent Sunday, Twelfth Night, Epiphany, and the Julian-calendar date kept by Orthodox churches.",
  useCases: [
    "Send a client in Milan a formal Buon Natale and a friend in Manila a warm Maligayang Pasko without machine-translating either.",
    "Check whether a bulk Christmas SMS to customers will bill as one part or three before it goes out.",
    "Find out when Advent Sunday falls in a given year so a church or school calendar can be planned around it.",
    "Write a gift-tag-length greeting in Japanese or Korean without guessing at the polite form.",
  ],
  benefits: [
    [
      "Thirty languages, written not translated",
      "Each greeting uses the phrase native speakers actually send, including the polite plural where the language has one.",
    ],
    [
      "Formal and warm side by side",
      "The same greeting appears in every tone at once, so a card for a client and a message for a cousin can be picked from one screen.",
    ],
    [
      "Real calendar arithmetic",
      "Advent Sunday is computed as the fourth Sunday before Christmas Day, and the Julian offset from the century rule, not from a lookup table.",
    ],
  ],
  faqs: [
    [
      "When is Advent Sunday?",
      "It is the fourth Sunday before Christmas Day, which always falls between 27 November and 3 December. For example it is 30 November in 2025 and 29 November in 2026. Enter any year above and the tool works it out from the weekday of 24 December.",
    ],
    [
      "Why do some churches celebrate Christmas on 7 January?",
      "Because they keep the Julian calendar, on which Christmas is still 25 December — that date currently lands on 7 January in the Gregorian calendar. The gap is 13 days for the years 1900 to 2099 and becomes 14 days from 2100, following the rule that the offset for a century c equals c minus c divided by four, minus two.",
    ],
    [
      "How do you say Merry Christmas in other languages?",
      "Feliz Navidad in Spanish, Joyeux Noël in French, Frohe Weihnachten in German, Buon Natale in Italian, God jul in Swedish and Norwegian, Wesołych Świąt in Polish, Καλά Χριστούγεννα in Greek, メリークリスマス in Japanese, 圣诞快乐 in Chinese and Maligayang Pasko in Filipino. All thirty are listed above with a transliteration where the script is not Latin.",
    ],
    [
      "How long can a Christmas SMS be?",
      "160 characters if the whole message stays inside the GSM-7 alphabet, and 153 per part once it splits. Greek, Russian, Thai, Japanese, Korean or any Indian script forces UCS-2 encoding, which cuts that to 70 characters single and 67 per part — and a single emoji does the same to an English message.",
    ],
  ],
};

export default seo;
