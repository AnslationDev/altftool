const seo = {
  intro:
    "This planner converts commute time into a concrete weekly study output: weekly commute minutes are split between audio lectures and flashcard reviews, and the flashcard share is turned into real card counts at a typical spaced-repetition pace of about 12 seconds per review. It is built for working aspirants whose only reliable daily slots are the train, metro or bus — showing that a 45-minute-each-way commute is roughly 30 hours of study time per month.",
  useCases: [
    "A bank-exam aspirant with a 50-minute train commute plans 60% audio current-affairs and 30% vocabulary flashcards, keeping 10% buffer",
    "A metro commuter with 15-minute legs sees audio flagged as impractical and moves the whole split to flashcards",
    "A weekend-batch student calculates whether commute-only revision can cover a 500-card backlog before the next mock",
  ],
  benefits: [
    ["Real card counts", "Flashcard minutes become cards per day at ~12 s per review, not vague 'revision time'."],
    ["Fragmentation check", "Legs under 10 minutes get a cards-first recommendation — audio needs longer unbroken stretches."],
    ["Honest buffer", "Unallocated share is kept visible as buffer instead of pretending every minute is usable."],
  ],
  faqs: [
    [
      "How much study time does a daily commute actually add up to?",
      "Multiply one-way minutes by trips and days: 45 minutes each way, twice a day, five days a week is 450 minutes — 7.5 hours weekly and about 32 hours per average month (using 4.35 weeks per month). That is comparable to a weekend batch's contact hours, which is why commute study compounds.",
    ],
    [
      "How many flashcards can I review during my commute?",
      "At the typical spaced-repetition pace of 10-20 seconds per card (this planner uses 12 s), 30 minutes of focused review clears roughly 150 cards. Enter your own split and the planner computes cards per day and per week from your actual commute.",
    ],
    [
      "Is it better to listen to lectures or do flashcards on a commute?",
      "It depends on leg length: audio lectures need an unbroken stretch — under about 10 minutes per leg the attention-settling cost eats the session, so flashcards, which work in 30-second bursts, win on short hops. On longer train legs a mixed split (lectures out, flashcards back) uses both attention states.",
    ],
    [
      "Should I study while driving or riding a two-wheeler?",
      "No — not even audio lectures that demand active recall. This planner is meant for passengers on trains, buses and metros; while driving, attention belongs entirely to the road, and even passive audio is worth skipping in heavy traffic.",
    ],
  ],
};

export default seo;
