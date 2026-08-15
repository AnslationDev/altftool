const seo = {
  title: "Medicine Schedule Builder: OD, BD, TDS, QDS or q8h",
  metaDescription:
    "Turns OD, BD, TDS, QDS, HS or a strict q4h-q12h interval into dated dose times for the whole course, with total doses and tablets to stock.",
  steps: [
    "Enter 'Medicine name', 'Dose per intake' and 'Tablets / ml per dose', then set the 'Start date' and 'Course length (days)'.",
    "Choose 'How often' — Once a day (OD / QD) through Four times a day (QDS / QID), At bedtime (HS), Only when needed (PRN) or Every 4/6/8/12 hours — plus 'First dose of the day' and 'Food instruction'.",
    "Read 'Doses in the whole course' with 'Times each day' and 'Units to have in stock', scan the 'Every dose' table, then press 'Copy result'.",
  ],
  intro:
    "The Medicine Schedule Builder converts a prescription frequency into a dated dose timetable: pick OD, BD, TDS, QDS, HS, PRN or a strict q4h/q6h/q8h/q12h interval and it lays out every dose time across the whole course, with the total dose count and how many tablets or millilitres to keep in stock. The abbreviations are the standard Latin ones on Indian and UK prescriptions — TDS is ter die sumendum, three times a day — and the tool keeps the important distinction between three times a day, spread over waking hours, and every eight hours, which runs round the clock. It is an organiser for people managing a course or a parent's repeat prescription, not medical advice.",
  useCases: [
    "Lay out a 5-day antibiotic course as 15 dated doses so nobody loses count halfway through.",
    "Work out how many tablets to buy before a two-week trip on a twice-daily medicine.",
    "Print a fridge timetable for an elderly parent taking four medicines at different times.",
  ],
  benefits: [
    ["Real prescription codes", "OD, BD, TDS, QDS, HS, PRN and hourly intervals, each with its usual clinical spacing."],
    ["Refill count included", "Total doses multiplied by units per dose tells you exactly how much to have in stock."],
    ["Private by design", "Names, doses and dates stay in the browser; nothing is sent anywhere."],
  ],
  faqs: [
    [
      "What does TDS mean on a prescription?",
      "Ter die sumendum — three times a day. It is usually spread across waking hours, around 08:00, 14:00 and 20:00, unlike 'every 8 hours' (q8h), which is a strict interval that includes a night dose. BD is twice a day, QDS four times, OD once and HS at bedtime.",
    ],
    [
      "Is 'three times a day' the same as 'every 8 hours'?",
      "No, and the difference matters for antibiotics. Three times a day spaces doses over the waking day, so gaps are roughly 6-6-12 hours; every 8 hours keeps a constant gap and will require a dose during the night. If your label says q8h, set the interval option rather than TDS.",
    ],
    [
      "How many tablets will I need for the whole course?",
      "Doses per day × days × tablets per dose. A TDS course for 5 days at one tablet a dose is 3 × 5 × 1 = 15 tablets; the tool prints that figure so you can check a strip has enough before you start.",
    ],
    [
      "Does this give medical advice or check interactions?",
      "No. It only arranges the timing you enter and does no interaction, dose-limit or contraindication checking of any kind. Follow the label on your own prescription, and ask a pharmacist or doctor if it disagrees with anything shown here.",
    ],
  ],
};

export default seo;
