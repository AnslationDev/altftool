const seo = {
  intro:
    "The Deep Cleaning Time Estimator converts a home's room count, carpet area and condition into person-hours, then divides that work across the crew you have to give an elapsed finish time. It builds the estimate the way professional cleaners quote: fixed per-room deep-clean times (about 120 minutes for a kitchen, 60 for a bathroom, 45 for a bedroom) plus a surface allowance of 18 minutes per 100 sq ft, scaled for soil level, clutter and pets. Use it to decide whether a job is a Saturday or a two-day project, and how many hands it needs.",
  useCases: [
    "Planning a move-out clean where the 1.8× condition multiplier turns a six-hour job into an eleven-hour one",
    "Deciding whether to book two cleaners or three so a 1,800 sq ft flat still finishes inside one eight-hour day",
    "Sanity-checking an agency quote by comparing their crew size and hours against the person-hour total",
  ],
  benefits: [
    ["Person-hours and clock time", "Separates the total work from how long it takes, so crew size becomes a decision, not a guess."],
    ["Honest team maths", "Two cleaners finish in about 53% of the solo time, not 50% — coordination loss is built in."],
    ["Itemised build-up", "Every room, extra and surface allowance appears as its own line you can argue with."],
  ],
  faqs: [
    [
      "How long does it take to deep clean a house?",
      "For a normally soiled 1,000 sq ft flat with two bedrooms, two bathrooms and a kitchen, expect around 10 person-hours — about five and a half hours with two cleaners. A move-out or post-renovation clean of the same home runs roughly 1.8 times longer.",
    ],
    [
      "What is the difference between a deep clean and a regular clean?",
      "A regular clean covers visible surfaces at roughly 500–700 sq ft per cleaner-hour. A deep clean drops to 200–300 sq ft per cleaner-hour because it adds inside-cabinet and inside-appliance work, grout and hard-water descaling, skirting, door tops, fans, switch plates and window tracks.",
    ],
    [
      "How many cleaners do I need?",
      "Divide the person-hour total by the length of day you want, then add one to cover coordination loss. Beyond about four cleaners in a normal flat the crew starts queueing for doorways and water points, so the extra person buys less than a full hour of throughput.",
    ],
    [
      "Do pets add much cleaning time?",
      "Yes, but less than people expect: roughly 6% more time per shedding pet, capped around 18%. The extra work is vacuuming passes on soft furnishings and skirting, not new tasks, which is why it scales the whole job rather than adding a fixed block.",
    ],
  ],
};

export default seo;
