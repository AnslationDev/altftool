const seo = {
  title: "Baisakhi Wishes in Gurmukhi with SMS Segments",
  metaDescription:
    "Write a Vaisakhi greeting in Gurmukhi, Roman and English, see the GSM-7 or UCS-2 segment count, and get the Khalsa anniversary for any year.",
  steps: [
    "Choose a greeting style and add the recipient and sender names.",
    "Tick Gurmukhi, Roman transliteration and English, plus the wheat and drum emoji, to build the lines you want.",
    "Read the SMS encoding and segment count, and the Khalsa anniversary for your chosen year and Vaisakhi date, then press Copy text.",
  ],
  intro:
    "The Baisakhi Wishes Generator composes a Vaisakhi greeting in Gurmukhi, Roman transliteration and English at once, in one of four styles, and scores the finished message against the SMS rules in 3GPP TS 23.038 so you know how many texts it will cost to send. It also works out the Khalsa anniversary for any year — simply that year minus 1699, the Vaisakhi on which Guru Gobind Singh founded the Khalsa at Anandpur Sahib. It is for anyone sending Vaisakhi greetings to family, sangat, staff or clients who wants the Gurmukhi right and the length predictable.",
  useCases: [
    "You want to send the Sikh salutation in Gurmukhi to relatives on WhatsApp but cannot type Gurmukhi on your phone keyboard.",
    "Your business is sending a Vaisakhi SMS to a customer list and you need to know before you send whether the Gurmukhi line makes it one message or three.",
    "You are making a Vaisakhi card or a status post and need the correct Khalsa Sajna Diwas anniversary number for this year.",
  ],
  benefits: [
    [
      "Three scripts in one message",
      "Gurmukhi, Roman transliteration in brackets and plain English can all be switched on together, so a mixed family group can each read the line they know.",
    ],
    [
      "Real SMS segment counting, not a character count",
      "Any Gurmukhi in the text forces UCS-2 encoding, so the tool switches from the 160-character GSM-7 budget to the 70-character UCS-2 one and shows the actual segment count.",
    ],
    [
      "The Khalsa anniversary is computed, not typed",
      "Enter the year and it returns the Vaisakhi date, its weekday, and the anniversary of the 1699 founding along with the five Panj Pyare.",
    ],
  ],
  faqs: [
    [
      "What date is Baisakhi?",
      "Vaisakhi falls on 13 or 14 April in the Gregorian calendar, as the first day of the month of Vaisakh. The generator lets you pick which of those two dates applies for the year you are writing about and returns the weekday it lands on.",
    ],
    [
      "How many years of the Khalsa is it this Vaisakhi?",
      "Subtract 1699 from the year — that is the Khalsa Sajna Diwas anniversary, counted from the Vaisakhi in 1699 when Guru Gobind Singh founded the Khalsa at Anandpur Sahib and initiated the five Panj Pyare. The tool does this for any year from 1699 to 2200.",
    ],
    [
      "Why does my Gurmukhi message count as more than one SMS?",
      "Gurmukhi characters are outside the GSM-7 alphabet, so the message is sent as UCS-2: 70 characters for a single SMS and 67 per part once it splits. A Roman or English-only greeting stays in GSM-7 and gets 160 characters single, 153 per part.",
    ],
    [
      "What is the traditional Baisakhi greeting?",
      "The common Punjabi greeting is Vaisakhi diyan lakh lakh vadhaiyan, and the Sikh salutation is Waheguru ji ka Khalsa, Waheguru ji ki Fateh. Both are available here in Gurmukhi with Roman transliteration, alongside warm-harvest, formal and short-caption styles.",
    ],
  ],
};

export default seo;
