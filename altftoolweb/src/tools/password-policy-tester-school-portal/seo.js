const seo = {
  title: "School Password Checker: 8 Rules + Passphrase",
  metaDescription:
    "Checks a school login password against eight plain-language rules — no name, no birth year, no keyboard runs — and builds a 4-word passphrase.",
  steps: [
    "Type an idea into the 'Password idea' box, then fill 'Your name', 'School login name', 'School name' and 'Year you were born' so personal words get caught.",
    "Read the 'Safety score' out of 100, then work down 'Every check, explained' and fix each of the eight rules badged 'Fix this' rather than 'Good'.",
    "Set Words to 3, 4, 5 or 6 and press 'New passphrase', use 'Test this one above' to score the phrase, or press 'Copy result' to keep the report.",
  ],
  intro:
    "School Portal Password Policy Tester checks a student login password against the threat that actually applies: a classmate who already knows the student's name, birth year, username and school. It tests eight plain-language rules — at least 8 characters, at least one number or symbol, no personal words, no birth year, not a famous password, no keyboard runs, no long repeats, and short enough to fit the login box — and estimates guessing time using the smallest of a character model, a repeat-collapsed model and a known-word model. It also builds a random four-word passphrase from a published 128-word list, so the strength shown assumes an attacker already has that list.",
  useCases: [
    "Help a child choose a first school password without a lecture about entropy.",
    "Show a class why Name plus birth year is the easiest password in the room to guess.",
    "Give a form tutor a shared, offline way to check password ideas during an IT lesson.",
    "Swap a memorised single word for a four-word passphrase that is easier to recall and far harder to guess.",
  ],
  benefits: [
    ["Written for students", "Every rule is explained in one sentence, with the reason it matters at school rather than in a data centre."],
    ["Honest maths", "Uses the cheapest of three ways to describe the password, so a long run of one letter or a list word cannot inflate the score."],
    ["Nothing is sent", "It all runs in the browser, so no password idea leaves the device."],
  ],
  faqs: [
    [
      "How long should a school password be?",
      "At least 8 characters, which is the minimum NIST SP 800-63B sets for a password a person chooses, and 14 or more if you can. Length helps far more than adding symbols: four ordinary words joined with hyphens is longer, easier to remember, and harder to guess than one word with a number stuck on the end.",
    ],
    [
      "Why can't I use my name or my birthday in a password?",
      "Because the person most likely to try your password already knows them. Names and birthdays appear on class lists, sports sheets and social media, so a password built from them is guessable by hand in a few tries — long before any software is involved.",
    ],
    [
      "Is a passphrase like mango-rocket-tiger-pebble really safe?",
      "For a school login that locks after a few wrong attempts, yes. Four words drawn at random from a 128-word list give about 28 bits of entropy, and with a two-digit ending roughly 40 bits, which is centuries of guessing at a rate-limited login page. It is not enough if a password file ever leaks, which is why the same phrase should never be reused for email or banking.",
    ],
    [
      "What should a student do if someone else knows their school password?",
      "Change it straight away and tell a teacher or the school IT helpdesk, even if nothing bad has happened yet — messages sent from a hijacked account are the school's problem to sort out, not the student's to hide. Then check that the same password is not in use anywhere else, and change it there too.",
    ],
  ],
};

export default seo;
