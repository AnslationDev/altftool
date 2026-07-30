const seo = {
  intro:
    "Lucky Day Predictor turns your birth date into a luck score from 0 to 99 for today, by reducing your date of birth to two single-digit numerology values and combining them with the current day-of-year number. The score lands in one of five bands — Unlucky (0-20), Neutral (21-40), Favorable (41-60), Lucky (61-80) or Very Lucky (81-100) — each with a short piece of advice and a lucky colour. It is entertainment built on deterministic arithmetic, not astronomy or prediction: the same birth date returns the same score all day and a different one tomorrow.",
  useCases: [
    "You and a group chat compare scores each morning as a running joke, and you want everyone reading the same rule rather than a random number generator.",
    "You are deciding whether today is the day to send a slightly nervy message or just leave it until tomorrow, and want a coin-flip with more personality.",
    "You are curious what your birth date reduces to in single-digit numerology and want the arithmetic shown rather than an app that just asserts a number.",
  ],
  benefits: [
    [
      "Stable for the whole day",
      "The score is derived from the calendar day, not a random draw, so refreshing does not hand you a better answer — it rolls over at midnight.",
    ],
    [
      "Shows the numbers behind the score",
      "Your numerology digit and life-path digit are displayed alongside the result, so you can see what fed the calculation.",
    ],
    [
      "Banded with advice, not just a percentage",
      "Each of the five bands carries specific guidance — stay routine at the low end, take a chance at the high end — so the number means something.",
    ],
  ],
  faqs: [
    [
      "How is the luck score calculated?",
      "The day-of-year number is multiplied by two values derived from your birth date, and the result is taken modulo 100, giving a score of 0 to 99. Because the day number changes daily, your score changes daily while your birth-date values stay fixed.",
    ],
    [
      "What counts as a lucky day here?",
      "A score of 61 or above. 61-80 is Lucky and 81-100 is Very Lucky, while 41-60 is Favorable, 21-40 Neutral and 0-20 Unlucky. Roughly two days in five land at 61 or above over the course of a year.",
    ],
    [
      "How is my numerology number worked out?",
      "Every digit of your birth date is added together and the total is reduced by repeated digit-summing until it is a single digit from 1 to 9. This is a simplified variant — traditional numerology preserves master numbers 11, 22 and 33 rather than reducing them.",
    ],
    [
      "Does this actually predict anything?",
      "No. It is a fun, deterministic calculation with no predictive power, and it should never be used for decisions about money, health, relationships or travel. If you find yourself planning real choices around the score, that is the moment to ignore it.",
    ],
  ],
};

export default seo;
