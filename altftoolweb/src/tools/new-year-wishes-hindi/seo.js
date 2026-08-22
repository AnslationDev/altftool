const seo = {
  title: "Hindi New Year Wishes: 1 January & Nav Varsh",
  metaDescription:
    "Devanagari greetings for 1 January and Chaitra Nav Varsh, worded for family, elders, bosses or clients, with Vikram Samvat years and SMS segment counts.",
  intro:
    "This Hindi new year wishes generator writes ready-to-send Devanagari greetings for both new years a Hindi-speaking household keeps — 1 January on the Gregorian calendar and Hindu Nav Varsh on Chaitra shukla pratipada — and works out the matching era years, since Vikram Samvat runs 57 years ahead of the Common Era and Shaka Samvat 78 years behind, both counted from that Chaitra date. Pick the occasion and who the message is for (family, friends, an elder or boss, clients, a status caption, or shayari style), add the recipient's and your own name, and you get correctly worded messages with the प्रिय {नाम} salutation already in place. Because Devanagari text is sent as UCS-2, each message also reports its character count and how many SMS segments it will actually cost.",
  useCases: [
    "It is 31 December and you need one message for the family WhatsApp group and a completely different, more formal one for your manager, both in proper Hindi rather than transliteration.",
    "You run a shop and want a Nav Varsh greeting for customers that mentions Vikram Samvat correctly instead of reusing the January message in April.",
    "You are writing to an elder and want the respectful आशीर्वाद register, not the joke wording you would send a college friend.",
  ],
  benefits: [
    [
      "Knows there are two new years",
      "Keeps separate wording for 1 January and for Chaitra shukla pratipada, including the neem-and-jaggery and संवत्सर references that only belong to the latter.",
    ],
    [
      "Register matches the recipient",
      "Every message is tagged by audience, so the elder and the client never receive the wording written for a status caption.",
    ],
    [
      "Counts the SMS cost of Devanagari",
      "Reports encoding and segment count for each message, because Hindi text drops to a 70-character single SMS rather than 160.",
    ],
  ],
  faqs: [
    [
      "When is the Hindu New Year, and how is it different from 1 January?",
      "Hindu Nav Varsh falls on Chaitra shukla pratipada, the first day of the bright fortnight of Chaitra, which lands in March or April — the same day marked as Gudi Padwa in Maharashtra and Ugadi in the Deccan. 1 January is the Gregorian new year and carries no Samvat change, which is why the two occasions need different wording.",
    ],
    [
      "What Vikram Samvat year is it?",
      "From Chaitra shukla pratipada, the Vikram Samvat year is the Gregorian year plus 57 — so the Chaitra new year of 2026 begins Vikram Samvat 2083. Between January and that Chaitra date the offset is plus 56, because the Samvat year has not yet turned over.",
    ],
    [
      "How does Shaka Samvat relate to the Gregorian year?",
      "Shaka Samvat, the era used by the Indian national calendar, is the Gregorian year minus 78 counted from the same Chaitra new year, so 2026 corresponds to Shaka 1948 from Chaitra onward and 1947 before it.",
    ],
    [
      "Why does a short Hindi message cost more than one SMS?",
      "Devanagari characters fall outside the GSM 03.38 alphabet, so the message is encoded as UCS-2, which fits only 70 characters in a single SMS and 67 per part once it splits — against 160 and 153 for plain Latin text. A two-line Hindi greeting with a name attached routinely runs to two or three segments.",
    ],
  ],
};

export default seo;
