const seo = {
  intro:
    "Retirement Wishes Generator writes farewell messages for a colleague, manager, teacher or parent and fills in the exact length of service from the date of joining and the last working day. It also derives the superannuation date from the date of birth using the Fundamental Rule 56(a) pattern: retirement falls on the last day of the month in which the person attains the retirement age, and on the last day of the preceding month if they were born on the first. Wording is available in English, Hinglish, Hindi, Marathi, Bengali and Tamil in heartfelt, formal, light-hearted or poetic tones.",
  useCases: [
    "Write the farewell note for a colleague's send-off card and quote their exact years of service.",
    "Check whether someone born on 1 July retires on 30 June or 31 July before printing the invitation.",
    "Draft a formal superannuation message to a senior that reads well in an official email.",
    "Send a warm retirement message to a parent or family elder in Hindi, Marathi, Bengali or Tamil.",
  ],
  benefits: [
    [
      "Service length, calculated properly",
      "Years, months and days are counted on the calendar rather than by dividing days by 365.",
    ],
    [
      "The end-of-month rule handled",
      "Born on the first of a month? The retirement date moves back to the last day of the previous month, as the rule requires.",
    ],
    [
      "Tone that suits the reader",
      "A manager gets a formal close, a teammate gets a warm one, and family gets something that is not office language at all.",
    ],
  ],
  faqs: [
    [
      "What is the retirement age for Central Government employees in India?",
      "Sixty years for most civil posts under Fundamental Rule 56(a). Many State Government cadres and PSUs use 58 or 60, university teachers often 65, and private contracts commonly specify 58, 60 or 62 — all four options are selectable here.",
    ],
    [
      "If my date of birth is the first of the month, when do I retire?",
      "On the last day of the previous month. Someone born on 1 July 1966 attains 60 on 1 July 2026 and therefore retires on 30 June 2026, whereas someone born on 15 July 1966 retires on 31 July 2026. This is the proviso to FR 56(a).",
    ],
    [
      "How do I calculate years of service for a farewell message?",
      "Count calendar-wise from the date of joining to the last working day, not by dividing total days by 365. Joining on 16 August 1990 and retiring on 31 July 2026 is 35 years, 11 months and 15 days — 13,133 days — so the card should say 35 years, not 36.",
    ],
    [
      "What should a retirement message to a boss say?",
      "Three things: congratulate them, name one specific thing their work or mentoring changed, and wish them health for what comes next. Keep it formal, avoid inside jokes that a wider audience will read on a card, and do not mention pending work or a successor.",
    ],
  ],
};

export default seo;
