const seo = {
  intro:
    "A NaNoWriMo pace calculator compares your running word count against the par line for a 50,000-word, 30-day challenge — 1,667 words a day — and works out what you now need daily to finish on time. It reports how many words ahead or behind par you are, converts that gap into days, and projects where your current average will actually land you by the last day. The same arithmetic works for any goal and any number of days, so Camp-style 25,000-word months and 31-day variants are handled too.",
  useCases: [
    "Check on day 10 with 15,000 words written that you are 1,667 words — exactly one day — behind par.",
    "See that finishing from 15,000 words needs 1,750 a day for the remaining 20 days, not the 1,667 you started with.",
    "Find out whether your current average of 1,500 a day will reach 50,000 before the month ends, or land you on 45,000.",
    "Recalculate the par line for a 25,000-word half-challenge or a 31-day version of the same format.",
  ],
  benefits: [
    ["Gap shown in days, not just words", "Being 1,667 words behind is one day behind — a more useful number than the raw shortfall."],
    ["Honest projection", "Extends your actual average to the last day and names the finishing total it produces."],
    ["Any goal, any length", "Works for 25,000 in 30 days, 50,000 in 31, or any custom target up to 500,000 words."],
  ],
  faqs: [
    [
      "How many words a day is NaNoWriMo?",
      "1,667 words a day. Fifty thousand divided by thirty days is 1,666.67, and the figure is rounded up so that hitting it every day lands you on 50,010 — ten words clear of the target rather than ten short.",
    ],
    [
      "What should my word count be on day 15?",
      "Twenty-five thousand words, exactly halfway. Par at the end of day n is n × 50,000 ÷ 30, so day 10 is 16,667, day 20 is 33,333 and day 25 is 41,667.",
    ],
    [
      "I am behind — how many words a day do I need now?",
      "Take the words you still owe and divide by the days left, rounding up. From 15,000 words on day 10 you have 35,000 words and 20 days remaining, which is 1,750 a day — only 83 more than par, which is why catching up early is far easier than catching up late.",
    ],
    [
      "Is NaNoWriMo still running?",
      "The nonprofit that ran the official event announced its closure in 2025, but the format is public and writing groups, forums and local communities continue to run 50,000-word months independently. This calculator is not affiliated with any organisation and works for whatever goal and date range you set.",
    ],
  ],
};

export default seo;
