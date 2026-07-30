const seo = {
  intro:
    "This guide turns the TRAI Telecom Commercial Communications Customer Preference Regulations, 2018 into three things you can act on: the exact command to send to 1909 for a full or category-wise Do Not Disturb preference, a reading of what number series a nuisance call came from, and a check on whether you are still inside the three-day window for complaining about an unsolicited communication. The seven preference categories run from banking and insurance through to tourism and leisure, and a registered preference must take effect within seven days.",
  useCases: [
    "Blocking real estate and insurance calls while still allowing messages about health services.",
    "Working out whether a caller on a 140-series number is a registered telemarketer you can complain about.",
    "Checking on Wednesday whether a spam SMS received on Sunday is still inside the complaint window.",
    "Explaining to a family member why their bank's OTP messages keep arriving even after full DND.",
  ],
  benefits: [
    [
      "Builds the exact command",
      "Turns your chosen categories into the string to send to 1909, sorted and de-duplicated.",
    ],
    [
      "Reads the number series",
      "Separates 140-series promotional traffic, 1600-series service calls and ordinary mobile numbers.",
    ],
    [
      "Times the complaint window",
      "Counts the days since the message arrived against the three-day limit and dates the deadline.",
    ],
  ],
  faqs: [
    [
      "How do I register for Do Not Disturb in India?",
      "Send your preference command by SMS to 1909, call 1909, or set it in your operator's app or the TRAI DND app. The fully blocked option stops promotional communication in every category; a partial preference blocks only the categories you pick from the seven listed in the regulations. Registration is free and the access provider must give effect to it within seven days.",
    ],
    [
      "How long do I have to complain about a spam call or SMS?",
      "Three days from receiving it. Register the complaint through 1909 or your operator's app with the sender's number, the date and the time, and the text of the message where there is one. After the window closes, that particular message can no longer form the basis of a complaint, though it remains useful as supporting evidence for a pattern.",
    ],
    [
      "Why do I still get spam calls after registering DND?",
      "A preference binds registered telemarketers, which make promotional voice calls from the 140 series. Marketing from an ordinary ten-digit mobile number comes from an unregistered telemarketer and is a breach whatever your preference says — the remedy there is to complain about the specific number, since repeated complaints can lead to disconnection. Service messages such as one-time passwords and delivery alerts are never blocked, and consent you gave a business through its own signup can override a category preference until you revoke it.",
    ],
    [
      "What is the difference between DND and reporting on Sanchar Saathi?",
      "DND is about unwanted marketing. The Chakshu facility on sancharsaathi.gov.in is for suspected fraud communication — a fake KYC alert, a lottery win, a job offer that asks for money. If the message is trying to defraud you rather than sell to you, report it there, and call the cyber crime helpline 1930 if money has already moved.",
    ],
  ],
};

export default seo;
