const seo = {
  title: "Birthday Analyzer — Zodiac, Age & Live Countdown",
  h1: "Birthday Analyzer",
  metaDescription:
    "Enter a date of birth for exact age, zodiac signs, birthstone, generation and a live birthday countdown. Free, and the date never leaves your browser.",
  intro:
    "The Birthday Analyzer turns one date of birth into a full profile: your exact age in years, months and days, total time lived down to the second, nine insight cards (Western zodiac, Chinese zodiac, birthstone, birth flower, element, season, generation, lucky numbers, lucky colours) and a live countdown to your next birthday. Every figure is computed in your browser with plain JavaScript Date arithmetic — no library, no API call, no upload. Age is calendar-accurate: when the day-of-month goes negative the calculation borrows the real length of the previous month instead of assuming 30 days, so leap years and short months come out right. A one-second interval re-runs the whole calculation, so the countdown and the seconds-lived counters tick in real time while the page is open.",
  useCases: [
    "Finding out exactly how old you are today — years, months and days, plus total weeks, days, hours, minutes and seconds lived",
    "Looking up a zodiac sign, birthstone, birth flower and generation from one birth date instead of four separate searches",
    "Counting down to a birthday for party planning or gift ordering, and checking which weekday you were born on",
  ],
  benefits: [
    [
      "One date, the whole picture",
      "A single date entry produces your exact age, total time lived, next and previous birthday dates, nine insight cards and a 14-step milestone tracker from age 1 to 100 — no extra clicks or tabs.",
    ],
    [
      "Counters that actually tick",
      "The full calculation re-runs on a one-second interval, so the days/hours/minutes/seconds countdown to your next birthday and your seconds-lived total update live without reloading the page.",
    ],
    [
      "Calendar-accurate age maths",
      "Months and days are worked out against real calendar lengths — the day count borrows from the actual previous month — so leap years and 28- to 31-day months don't skew the result.",
    ],
    [
      "Your birth date stays on your device",
      "All maths runs client-side on the browser's built-in Date object. The tool makes no network request and writes nothing to storage, so the date you enter is never uploaded, saved or shared.",
    ],
  ],
  faqs: [
    [
      "What does a birthday analyser tell you?",
      "Nine things at once, from a single date of birth: Western zodiac sign (with its element and symbol), Chinese zodiac animal, birthstone, birth flower and its meaning, season, generation, six lucky numbers and three lucky colours. Alongside that you get your exact age, total days/weeks/hours/minutes/seconds lived, the weekday you were born on, your previous and next birthday dates, and a milestone tracker. The lucky numbers and colours come from fixed lookup tables and are there for fun, not prediction.",
    ],
    [
      "How do I find out my exact age in days, hours and minutes?",
      "Enter your date of birth and press Analyze — the tool subtracts your birth date from the current timestamp in milliseconds and converts it into total days, weeks, hours, minutes and seconds, all shown together. Total months use the 30.44-day average month length, while the headline years/months/days figure uses real calendar months instead.",
    ],
    [
      "What day of the week was I born on?",
      "The tool tells you directly — it reads the weekday from your birth date and displays it as \"You were born on a Tuesday\" (or whichever day applies), right next to your next-birthday countdown. It also shows the full formatted date of your next birthday, so you can see which weekday that one falls on.",
    ],
    [
      "How does the birthday analyser work out my zodiac sign?",
      "It compares your birth month and day against the twelve standard tropical date ranges — Aries 21 Mar to 19 Apr, Taurus 20 Apr to 20 May, and so on, with Capricorn wrapping across the year end from 22 Dec to 19 Jan. Along with the sign it returns the ruling element (Fire, Earth, Air or Water) and the sign's symbol, such as \"The Ram\" for Aries.",
    ],
    [
      "How is the Chinese zodiac animal calculated?",
      "By placing your birth year on the standard twelve-year cycle, one animal per year, anchored to 1924 as a Rat year. This works for any accepted birth year (1900 onward), not just a fixed table range. Note that the cycle is keyed to the calendar year, not the lunar new year — if you were born in January or early February, the traditional animal may be the previous year's.",
    ],
    [
      "What generation am I based on my birth year?",
      "The tool assigns it from your birth year using these bands: 2026 onward Generation Beta, 2013 to 2025 Generation Alpha, 1997 to 2012 Generation Z, 1981 to 1996 Millennials, 1965 to 1980 Generation X, 1946 to 1964 Baby Boomers, 1928 to 1945 Silent Generation, and 1900 to 1927 Greatest Generation.",
    ],
    [
      "Are the heartbeat, breath and sleep numbers real measurements?",
      "No — they are estimates from fixed average rates, not data about you. Heartbeats assume 72 beats per minute, breaths assume 16 per minute, and sleep assumes 8 hours a day, each multiplied by the number of days you have lived. They are a scale-of-a-lifetime illustration, not a health metric.",
    ],
    [
      "Is the birthday analyser free, and is my birth date stored anywhere?",
      "Yes it is free, with no signup and no usage limit — and no, your birth date is never stored. Every calculation runs locally in your browser using JavaScript's Date object; the tool makes no server request and writes nothing to local storage, so the date disappears as soon as you close the tab. You can enter any past date from 1900 onward; future dates are rejected.",
    ],
  ],
  steps: [
    "Pick your date of birth in the date field — it is capped at today, and any year from 1900 onward is accepted.",
    "Press Analyze. Your exact age, total time lived, birthday insights, life analytics and milestones all appear at once.",
    "Leave the page open — the countdown to your next birthday and the seconds-lived counters refresh every second.",
  ],
};

export default seo;
