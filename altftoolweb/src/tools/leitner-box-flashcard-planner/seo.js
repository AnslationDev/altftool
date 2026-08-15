const seo = {
  title: "Leitner Box Flashcard Planner: Daily Load Calendar",
  metaDescription:
    "Set boxes, spacing (doubling, expanding or gentle) and cards per box to get a dated review calendar, per-box load and a cards-per-day figure.",
  steps: [
    "Pick a \"Box schedule\" — Doubling (1, 2, 4, 8, 16), Expanding (1, 3, 7, 14, 30) or Gentle (1, 2, 3, 5, 8, 13) — then set \"Number of boxes\" and \"Start date\".",
    "Type how many cards sit in each box under \"Cards currently in each box\", set \"Cards you check per minute\", and tick \"Stagger box start days\".",
    "Read \"Cards to review per day\" with its minutes estimate and the Per-box load table, expand the Review calendar with the \"Show all … days\" toggle, then press \"Copy result\".",
  ],
  intro:
    "The Leitner system files paper flashcards in numbered boxes: a card you answer correctly moves up one box, a card you miss goes back to box 1, and each box is reviewed on its own fixed interval. This planner turns your box count, spacing schedule and cards-per-box into a dated review calendar, a per-box load table and the long-run daily figure, which is the sum of cards in each box divided by that box's interval. Built for anyone running physical flashcards for language vocabulary, medical terms or competitive-exam facts without an app.",
  useCases: [
    "Size a 5-box vocabulary system before you start, so you know whether 300 cards means 20 minutes a day or an hour.",
    "Compare doubling spacing (1, 2, 4, 8, 16 days) against expanding spacing (1, 3, 7, 14, 30 days) for the same deck.",
    "Stagger the boxes so they do not all fall due on day one, flattening the first-week spike that makes people quit.",
    "Print a four-week calendar showing exactly which boxes to pull out on each date, and stick it on the box lid.",
  ],
  benefits: [
    ["Real workload, not a guess", "Daily card counts come from the interval arithmetic, including the days when nothing is due."],
    ["Dated calendar", "Every study day is shown with its weekday, the boxes due and the minutes it should take."],
    ["Schedule comparison", "Three documented spacing presets — doubling, expanding and Fibonacci — with up to seven boxes."],
  ],
  faqs: [
    [
      "How does the Leitner box system work?",
      "You keep cards in numbered boxes. Review a box on its interval; a card answered correctly moves to the next box up, a card answered wrongly goes straight back to box 1. Because box 1 is reviewed most often and the top box least often, difficult cards come round quickly and easy ones stop wasting your time.",
    ],
    [
      "What intervals should each Leitner box use?",
      "The most common schedule doubles: box 1 daily, box 2 every 2 days, box 3 every 4, box 4 every 8, box 5 every 16. An expanding schedule of 1, 3, 7, 14 and 30 days is also widely used and suits vocabulary you need to hold for months rather than days. Both are offered here, along with Fibonacci spacing of 1, 2, 3, 5, 8 and 13 days.",
    ],
    [
      "How many cards a day will a Leitner system give me?",
      "In the long run it is the sum, over every box, of the cards in that box divided by that box's interval. For 40, 30, 20, 10 and 5 cards on a doubling schedule that is 40 + 15 + 5 + 1.25 + 0.31, roughly 62 cards a day, or about ten minutes at six cards a minute.",
    ],
    [
      "Is the Leitner system as good as an app like Anki?",
      "Algorithmic schedulers adjust the interval per card based on how hard you found it, so they need fewer total reviews for the same retention. Leitner uses one interval per box, which is coarser but needs no device, works on physical cards and is easier to keep going. Both rely on the same spacing effect first measured by Hermann Ebbinghaus.",
    ],
  ],
};

export default seo;
