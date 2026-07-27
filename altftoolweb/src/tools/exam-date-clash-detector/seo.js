const seo = {
  intro:
    "This detector runs a standard interval-overlap check (two ranges clash when each starts on or before the other ends) across every exam you have applied for, flagging both same-day clashes and tight gaps with fewer free days than travel and revision need. It is for aspirants juggling multiple recruitment cycles — SSC, banking, railways, state PSCs — whose exams are announced independently and collide without warning.",
  useCases: [
    "An aspirant with SSC CGL and IBPS PO applications checks whether the announced shift windows overlap before paying for train tickets",
    "A candidate allotted an RRB date two days after a state PSC prelims sees the pair flagged and plans travel in advance",
    "A final-year student mapping five entrance exams into one timeline to decide which ones are realistically attendable",
  ],
  benefits: [
    ["True overlap maths", "Interval overlap on full date windows, not just a same-date string match."],
    ["Tight-gap warnings", "Pairs with 2 or fewer days between them are flagged — one free day is not enough for travel plus revision."],
    ["Sorted timeline", "All exams laid out chronologically so the crunch weeks are obvious at a glance."],
  ],
  faqs: [
    [
      "What counts as an exam date clash?",
      "A hard clash is any shared day between two exams' date ranges — the detector uses the interval test 'A starts on or before B ends, and B starts on or before A ends'. For computer-based exams with multi-day shift windows, an overlapping window is a potential clash until your exact shift is allotted on the admit card.",
    ],
    [
      "What can I do if two government exams fall on the same day?",
      "Usually you must choose one, because recruitment bodies rarely reschedule for individual clashes; a few (mainly university and some state exams) entertain representation if you write to them well before admit cards are issued. Spotting the clash early — before spending on travel and forfeiting other prep — is exactly why a combined calendar matters.",
    ],
    [
      "How many free days should I keep between two exams?",
      "This tool defaults to flagging gaps of 2 days or fewer, since a 2-day gap leaves only one fully free day — typically consumed by travel between cities. Keep at least 2-3 free days when the exams are in different cities or have different syllabi.",
    ],
    [
      "Should I enter the whole shift window or just my exam day?",
      "Enter the full announced window until your admit card fixes the exact date, then edit the entry down to the single allotted day. That way potential clashes surface while you can still plan around them.",
    ],
  ],
};

export default seo;
