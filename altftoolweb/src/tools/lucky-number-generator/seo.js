const seo = {
  title: "Lucky Number Generator — Lottery & Numerology",
  h1: "Lucky Number Generator",
  metaDescription:
    "Free lucky number generator: random draws, lottery tickets, daily zodiac numbers, numerology from your birth date, custom ranges. Runs in your browser.",
  intro:
    "The Lucky Number Generator draws numbers five different ways, all computed in your browser's JavaScript with no server call and no upload. Random and Custom modes build the entire range as an array and run a Fisher–Yates shuffle over it, taking the first N — which is why a unique draw can never repeat a number — or fall back to independent Math.random() picks when you allow repeats. Lottery mode applies that same shuffle separately to a main pool and an extra Power/Star pool, sorts each set low to high, and repeats it for up to 10 tickets in one press. Horoscope and Numerology modes are deterministic rather than random: horoscope numbers come from the day of the year multiplied by your sign's position in the zodiac, taken modulo 49 (and modulo 26 for the power number), while numerology reduces the digits of your birth date to single-digit life path, destiny, soul urge and personality numbers.",
  useCases: [
    "Filling a lottery slip — the default is a EuroMillions-style 5 from 1–50 plus 2 from 1–12, and you can retype the pools for any format, such as 5 from 1–69 plus one Power Ball from 1–26.",
    "Drawing a number for a raffle, giveaway, seat allocation or classroom game, with your own min and max, up to 50 numbers, and optional repeats or zero.",
    "Reading the life path, soul urge and personality numbers for a birth date, or a daily set of numbers for a zodiac sign, without doing the digit sums by hand.",
  ],
  benefits: [
    [
      "Five modes on one page",
      "Random, Lottery, Horoscope, Numerology and fully Custom draws, switched with one button and no page reload.",
    ],
    [
      "Real ticket formats",
      "Set the main pool, the extra Power/Star pool and how many to pick from each — up to 20 main numbers, 10 extras and 10 sets per generation, every set sorted low to high.",
    ],
    [
      "No duplicates unless you ask for them",
      "Unique draws shuffle the whole range and take the top of the deck, so a number cannot appear twice; tick Allow repeats to permit it.",
    ],
    [
      "Kept on your device",
      "The last 50 generations and up to 20 saved favourites are written to your browser's localStorage. No account, no signup, and the tool makes no network requests.",
    ],
  ],
  faqs: [
    [
      "How do I generate lucky numbers for the lottery?",
      "Open Lottery mode and type your draw's format: the main pool range and how many to pick, then the extra Power/Star pool and its count. It opens on 5 numbers from 1–50 plus 2 from 1–12, and you can change every field — 5 from 1–69 with a single extra from 1–26 matches a Powerball slip. Set Number of Sets up to 10 to get several tickets at once; each set is drawn without duplicates and sorted ascending.",
    ],
    [
      "What are today's lucky numbers for my star sign?",
      "Choose your sign in Horoscope mode and press Generate: you get five numbers between 1 and 49 plus one power number between 1 and 26. They are derived from the current day of the year and your sign's index in the zodiac, so everyone with the same sign sees the same set, and it changes at midnight in your device's time zone. It is entertainment — no astrological data feed or forecast is involved.",
    ],
    [
      "How do I find my lucky numbers from my date of birth?",
      "Enter your birth date in Numerology mode. The tool adds the digit sums of your day, month and year and reduces them to a single digit for the life path and destiny numbers, reduces day plus month for the soul urge, and the year alone for the personality number. It then derives three more values from your date written as YYYYMMDD, removes duplicates and returns six numbers between 1 and 99, sorted low to high. A birth date of 1 January 1990, for example, gives a life path of 3. Master numbers are not preserved — the reduction loop runs until the result is a single digit, so 11 becomes 2 and 22 becomes 4.",
    ],
    [
      "Do lucky numbers improve your chances of winning?",
      "No. In a fair draw every combination has exactly the same probability, so a generated set is no more likely to win than one you pick yourself. The only thing machine picks change is the pattern: hand-chosen tickets cluster in 1–31 because people use birthdays, which affects how a prize would be shared, not the odds of hitting it.",
    ],
    [
      "How many numbers can I generate at once?",
      "Up to 50 in Random and Custom mode, in any range you type. Lottery mode allows up to 20 main numbers and 10 extras per set, with up to 10 sets per press — a maximum of 300 numbers in one go. One limit to know: if you ask for more unique numbers than the range contains, such as 10 unique numbers from 1–5, nothing is generated. Widen the range or allow repeats.",
    ],
    [
      "Are the numbers truly random?",
      "They come from JavaScript's built-in Math.random(), which is a pseudorandom generator seeded by your browser — fine for games, raffles and lottery picks, but not cryptographically secure, so don't use it to generate passwords, tokens or anything that needs unpredictable randomness. Horoscope and Numerology modes are not random at all: they are formulas, so the same sign on the same day, or the same birth date, always returns the same numbers.",
    ],
    [
      "Where are my saved numbers stored?",
      "In your own browser, under the localStorage keys luckyNumbers_saved and luckyNumbers_history — 20 favourites and the 50 most recent generations. Nothing is sent to a server and nothing syncs between devices or browsers, so clearing site data or using a different browser starts you fresh. Clear All wipes the history, and the trash icon removes a single saved set. Identical combinations are only saved once.",
    ],
    [
      "Is the Lucky Number Generator free?",
      "Yes — free, with no account, no signup and no limit on how many times you generate. Copy puts the current set on your clipboard as plain text via your browser's clipboard API, and the heart button keeps it in the Saved tab.",
    ],
  ],
  steps: [
    "Pick a mode — Random, Lottery, Horoscope, Numerology or Custom — from the buttons at the top.",
    "Set that mode's inputs: min, max and count; the main and extra lottery pools plus number of sets; your zodiac sign; or your birth date.",
    "Press Generate Lucky Numbers, then Copy to put the set on your clipboard or the heart to keep it in the Saved tab.",
  ],
};

export default seo;
