const seo = {
  title: "Event Planner: Head Count, Sq Ft, Tables and Staff",
  metaDescription:
    "Turns invitations into expected attendance, then floor area at 12 sq ft per banquet guest, round tables, 1 server per 10 plated guests and a budget.",
  steps: [
    "Enter People invited with RSVP acceptance rate (%) and No-show rate among acceptances (%), which together set the expected head count.",
    "Pick Room layout — banquet at 12 sq ft per guest, theatre at 8, classroom at 17, reception at 6 — then Banquet table size and Service style.",
    "Read Expected head count with Floor space needed, banquet tables, servers and the costed budget, then press Copy plan.",
  ],
  intro:
    "The Event Planner converts an invite list into the bookable numbers behind an event: expected head count, floor area, table count, serving staff, food and drink quantities, and a costed budget. It applies standard venue capacity allowances — 12 sq ft per guest for seated banquet rounds, 8 for theatre rows, 17 for classroom seating and 6 for a standing reception — together with the catering ratios of 1 server per 10 plated guests, 1 per 25 for buffet, and 1 bartender per 75 guests. Head count uses the two-stage shrink planners rely on: expected = invited x acceptance rate x (1 - no-show rate).",
  useCases: [
    "Check whether a 2,000 sq ft banquet hall can seat the 133 guests you expect from 200 invitations before you pay the deposit.",
    "Work out how many 60-inch rounds and how many servers a plated wedding dinner for 180 needs.",
    "Price a four-hour corporate reception per head, with a 10% contingency, and see how far it sits above or below the approved budget.",
  ],
  benefits: [
    ["Real capacity allowances", "Space is sized from published per-guest square-footage standards, not a guess."],
    ["Attendance, not invitations", "Applies RSVP acceptance and no-show rates so you cater for who actually arrives."],
    ["Budget with contingency", "Adds a named contingency percentage and shows the variance against your ceiling."],
  ],
  faqs: [
    [
      "How much space do I need per guest at an event?",
      "Allow 12 sq ft per guest for a seated banquet with round tables, 8 sq ft for theatre-style rows, 17 sq ft for classroom seating with tables, and 6 sq ft for a standing reception. So 133 banquet guests need about 1,596 sq ft of clear floor, before stage, bar and buffet areas.",
    ],
    [
      "How many guests fit on a round banquet table?",
      "A 48-inch (4 ft) round seats 6, a 60-inch (5 ft) round seats 8, and a 72-inch (6 ft) round seats 10. For 133 guests on 60-inch rounds you need 17 tables, which gives 136 covers and 3 spare seats.",
    ],
    [
      "How many servers and bartenders does a party need?",
      "Plan 1 server per 10 guests for plated service, 1 per 25 for a buffet or canape reception, and 1 bartender per 75 guests. A 200-guest plated dinner with a bar therefore needs about 20 servers and 3 bartenders.",
    ],
    [
      "What percentage of invited guests actually attend?",
      "Typical acceptance runs 65-80% for a local event, and roughly 5% of people who accept still do not turn up, so the planner defaults to 70% acceptance and a 5% no-show rate. Adjust both to match your own past events — they are the two figures that move every other number on the page.",
    ],
  ],
};

export default seo;
