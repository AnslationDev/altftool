const seo = {
  intro:
    "The Hidden Talent Finder turns your name and birth month into one of ten joke talents — Snack Alchemist, Chaos Coordinator, Human Lie Detector and friends — using a fixed character hash of your name added to the month number and taken modulo ten. It is entertainment, not a personality assessment: the result is a deterministic lookup, so the same name and month always land on the same talent. Good for a group chat, a party icebreaker or a slow afternoon.",
  useCases: [
    "You need a five-second icebreaker for a team call and want everyone to post their result in the chat.",
    "A friend swears they would get Vibe Curator and you want to settle it by actually running their name.",
    "You are making a birthday post and want a silly label to caption it with.",
  ],
  benefits: [
    ["Same input, same answer", "The name hash is deterministic, so your result never changes and friends can reproduce it exactly."],
    ["Two fields, no sign-up", "Just a name and a birth month — no quiz, no questionnaire, no email."],
    ["Written to be shared", "Each of the ten talents comes with a one-line description built for screenshots rather than a vague trait word."],
  ],
  faqs: [
    [
      "How does it decide my hidden talent?",
      "It hashes your name character by character, adds your birth month number, takes the absolute value and divides by ten, then uses the remainder to pick from a list of ten talents. There is no astrology, numerology or data lookup involved — it is arithmetic on the letters you typed.",
    ],
    [
      "Will I get the same talent every time?",
      "Yes, as long as you type the name and month identically. Change a letter, add a surname or pick a different month and the hash shifts, which usually lands you on a different one of the ten.",
    ],
    [
      "How many results are there?",
      "Ten, including Professional Cloud Whisperer, Master of Unintentional Origami, Animal Magnet and Accidental Comedian. Because there are only ten, two people with different names will often share a result — that is the maths, not a hidden connection.",
    ],
    [
      "Is this an actual personality test?",
      "No. It is a novelty generator with no psychological basis and no relationship to validated instruments; nothing about your name or birth month predicts your abilities. Treat it purely as a joke, and use a proper assessment if you want real insight into strengths or aptitudes.",
    ],
  ],
};

export default seo;
