const seo = {
  title: "Seating Chart Maker: Table Count & Guest Assignments",
  metaDescription:
    "Paste a guest list and get seats per table from table size at 22 in per cover, tables needed, per-table assignments and an NFPA room check.",
  steps: [
    "Paste names into 'Guest list — one per line, optional group after a comma'; the counter under the box reports how many guests were read.",
    "Pick an 'Event type (sets the defaults)' such as Wedding or Conference, a 'Table type' (Round 48, 60 or 72 inch, Rectangular 6 ft or 8 ft, or 'Classroom row, 6 ft desk (one side only)'), a 'Space per guest' allowance of 20, 22 or 24 in, and enter 'Room length (ft)' and 'Room width (ft)'.",
    "Read 'Tables needed' with 'Seats per table', 'How that is worked out', 'Table pitch (centre to centre)' and 'Room occupant load' at 15 sq ft each, scan the 'Table assignments' cards, then press 'Copy plan'.",
  ],
  intro:
    "This seating chart maker turns a guest list into a table plan by calculating capacity from linear table edge rather than guesswork: seats = floor(perimeter ÷ space per guest), using the standard banquet allowance of 22 inches (56 cm) per cover. It then packs guests onto tables largest-group-first so parties stay together, and checks the room against the NFPA 101 occupant-load factor of 15 sq ft per person for assembly use with tables and chairs. It suits wedding planners, event managers and teachers laying out a room.",
  useCases: [
    "Working out that 120 wedding guests on 60-inch rounds need 15 tables at 8 covers each",
    "Deciding between 6 ft and 8 ft rectangular tables for a conference and seeing the seat count change from 8 to 10",
    "Checking whether a 60 ft × 40 ft hall can legally seat the full guest list before booking it",
  ],
  benefits: [
    ["Capacity from real dimensions", "Seat counts are derived from table size and cover width, so they match what rental companies quote."],
    ["Groups stay together", "First-fit-decreasing packing keeps each family or department on one table wherever it fits."],
    ["Room check built in", "Floor area is converted to an occupant load so you know if the venue is big enough."],
  ],
  faqs: [
    [
      "How many people fit at a 60-inch round table?",
      "Eight at the standard banquet allowance of 22 inches per cover, because the circumference is π × 60 = 188.5 inches. Squeeze to 20 inches per cover and you get 9; give a formal 24 inches and it drops to 7. A 72-inch round seats 10 on the same rule.",
    ],
    [
      "How much space do you need per guest at a seated event?",
      "Allow 15 sq ft (1.39 sq m) of net floor area per seated person — that is the NFPA 101 occupant load factor for assembly use with tables and chairs. A 60 ft × 40 ft room is 2,400 sq ft and therefore holds about 160 seated guests before you subtract space for a stage, bar or dance floor.",
    ],
    [
      "How far apart should banquet tables be?",
      "Leave about 60 inches (152 cm) of clear space between the edges of adjacent tables so chairs can be pushed back on both sides and a server can pass between them. For 60-inch rounds that works out to roughly 10 ft centre to centre.",
    ],
    [
      "How many people can sit at an 8-foot rectangular table?",
      "Ten — four along each long side plus one at each end, using 22 inches per cover on a 96 × 30 inch table. Leave the ends empty, as most conference layouts do, and it seats 8. A 6 ft table on the same rule seats 8 with ends or 6 without.",
    ],
  ],
};

export default seo;
