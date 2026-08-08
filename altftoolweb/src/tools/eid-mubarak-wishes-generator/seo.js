const seo = {
  title: "Eid Mubarak Wishes in Urdu, Hindi and 10 More",
  metaDescription:
    "Eid greetings written in 12 languages and four tones, with Roman transliteration and an SMS check: 160 GSM-7 characters, or 70 once the script is UCS-2.",
  steps: [
    "Pick one of 12 languages, a tone of Formal, Warm, Short or Devotional, and whether it is Eid al-Fitr or Eid al-Adha.",
    "Add their name and your name, then tick “Add the Roman transliteration line” or “Add a crescent emoji”.",
    "Check the Message length panel for the encoding and SMS parts, then press Copy greeting.",
  ],
  intro:
    "This generator writes an Eid greeting in the script your reader actually uses — Urdu, Arabic, Hindi, Bengali, Tamil, Telugu, Malayalam, Marathi, Gujarati, Punjabi, Kannada or English — in one of four tones, with a Roman transliteration line and the sender's and recipient's names in place. It also scores the finished message against the real SMS rules from 3GPP TS 23.038, so you can see whether it goes out as one 160-character GSM-7 message or as several 70-character UCS-2 parts. Useful for anyone sending Eid wishes to a mixed contact list of family, friends, clients and colleagues.",
  useCases: [
    "Send the same Eid greeting to a Hyderabad family group in Urdu and to a Kochi colleague in Malayalam without machine-translating either.",
    "Write a formal Eid message for a client or a senior that avoids the jokey tone of a friends-and-family greeting.",
    "Check whether a bulk Eid SMS to customers will bill as one part or three before you send it to ten thousand numbers.",
    "Get a Roman transliteration so a reader who speaks the language but does not read the script can still follow the greeting.",
  ],
  benefits: [
    [
      "Written, not translated",
      "Each greeting is composed in its own language, so idioms like sewaiyan and barkat land naturally instead of reading like output from a translator.",
    ],
    [
      "Real SMS cost check",
      "Non-Latin scripts and emoji force UCS-2 encoding, which cuts a single SMS from 160 characters to 70 — the counter shows this before you send.",
    ],
    [
      "Four tones on tap",
      "Formal, warm, short and devotional versions of the same greeting sit side by side, so you can pick the one that fits the contact.",
    ],
  ],
  faqs: [
    [
      "What does Eid Mubarak mean?",
      "It means 'blessed Eid' — mubarak is Arabic for blessed. It is the standard greeting for both Eid al-Fitr and Eid al-Adha, so you do not need a different phrase for each. Common replies include 'Khair Mubarak' and 'Eid Mubarak to you too'.",
    ],
    [
      "Why does the date of Eid change every year?",
      "Because the Islamic calendar is lunar. A Hijri year runs about 354 days, roughly 11 days shorter than the Gregorian year, so Eid al-Fitr on 1 Shawwal and Eid al-Adha on 10 Dhu al-Hijjah move about 10 to 11 days earlier each Gregorian year. The final date in any country depends on the local moon sighting.",
    ],
    [
      "How many characters can an Eid SMS in Hindi or Urdu hold?",
      "70 characters in a single message, and 67 per part once it splits, because non-Latin scripts are sent using UCS-2 encoding. Plain English text using only the GSM-7 alphabet gets 160 characters single and 153 per part. Adding one emoji to an English message pushes the whole message to UCS-2.",
    ],
    [
      "Is Eid Mubarak the right greeting for Bakrid?",
      "Yes. Bakrid is the common name in India for Eid al-Adha, and 'Eid Mubarak' or 'Eid al-Adha Mubarak' both work. Eid al-Adha falls on 10 Dhu al-Hijjah, during the days of Hajj, and is followed by the three days of Tashriq.",
    ],
  ],
};

export default seo;
