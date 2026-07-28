const seo = {
  intro:
    "The Ganesh Chaturthi Wishes Generator produces ready-to-send festival greetings in Marathi, Hindi, English, Gujarati, Kannada and Telugu, personalised with the recipient's name and your sign-off. Each wording is tagged for a specific audience — family and elders, friends, colleagues and clients, or a status caption — so the register matches who is reading it. Every greeting also shows its character count and how many SMS parts it will split into, since Indic scripts are sent as UCS-2 at 70 characters per part rather than the 160 of plain Latin text.",
  useCases: [
    "Send a Marathi greeting to relatives on the morning of sthapana and a shorter English one to your work group the same day.",
    "Write a respectful colleague-and-client message that mentions Ganesha as the lord of wisdom and new beginnings without sounding like a template.",
    "Pick up a one-line caption with a hashtag for a visarjan reel or a WhatsApp status.",
    "Check whether a Devanagari greeting will go out as one SMS or split into two before you send it to a long contact list.",
  ],
  benefits: [
    [
      "Six languages, native script",
      "Marathi, Hindi, English, Gujarati, Kannada and Telugu wordings written in script, not transliterated.",
    ],
    [
      "Audience-matched tone",
      "Family, friends, work and social-caption variants stay separate so a client never gets a meme-style line.",
    ],
    [
      "Send-ready length data",
      "Character count and SMS part count per message, using the 160-character GSM-7 and 70-character UCS-2 limits.",
    ],
  ],
  faqs: [
    [
      "When is Ganesh Chaturthi celebrated?",
      "Ganesh Chaturthi falls on the chaturthi, the fourth tithi of the bright fortnight of Bhadrapada, which lands between late August and mid September. The public utsav runs up to ten days and ends with visarjan on Anant Chaturdashi, so confirm the exact dates in a panchang for that year.",
    ],
    [
      "What does Ganpati Bappa Morya mean?",
      "It is a Marathi devotional call meaning roughly 'Lord Ganesha, come again' — Morya honours the 14th-century devotee Morya Gosavi of Chinchwad. It is usually followed by 'Mangalmurti Morya', and at visarjan by 'Pudhchya Varshi Laukar Ya', asking Bappa to return early next year.",
    ],
    [
      "What should I write in a Ganesh Chaturthi message for clients?",
      "Keep it to two sentences: a blessing that references Ganesha as Vighnaharta, the remover of obstacles, or as the lord of wisdom and new beginnings, followed by a wish for a successful year. Avoid slang, emoji-heavy lines and hashtags in business messages.",
    ],
    [
      "Why do my Hindi and Marathi wishes count as fewer characters per SMS?",
      "Any message containing Devanagari, Gujarati, Kannada or Telugu characters is encoded as UCS-2, which fits 70 characters in a single SMS and 67 per part when concatenated, versus 160 and 153 for the GSM-7 Latin alphabet. WhatsApp and other data apps are not affected by this limit.",
    ],
  ],
};

export default seo;
