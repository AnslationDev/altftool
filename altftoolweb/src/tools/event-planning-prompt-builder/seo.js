const seo = {
  intro:
    "Event Planning Prompt Builder converts an agenda written as durations into a clock-accurate run of show, then sizes the room, crew, check-in desks and catering lines from the headcount using standard event planning allowances — roughly 8 sq ft per person theatre style, 13 sq ft banquet, 18 sq ft classroom, plus a 25% allowance for stage, aisles and back of house. It also applies the common operational ratios of one check-in station per 100 attendees and one crew member per 50. The result is a single logistics prompt that carries real numbers instead of a vague description of the event.",
  useCases: [
    "Checking whether a seven-segment conference agenda actually finishes before the venue's hard stop.",
    "Sizing a room for 300 people theatre style before asking a venue whether their ballroom fits.",
    "Working out how many buffet lines a 400-guest lunch needs so the break does not overrun.",
    "Producing a cue-by-cue run of show for a launch where two speakers arrive the same morning.",
  ],
  benefits: [
    ["Real clock times", "Durations are laid on an actual clock, including agendas that run past midnight."],
    ["Sized from headcount", "Floor area, crew, check-in desks and service staff all derive from the attendance you enter."],
    ["Queue maths included", "Buffet lines and the minutes needed to serve everyone are calculated, not guessed."],
  ],
  faqs: [
    [
      "How much space do you need per person at an event?",
      "Theatre seating needs roughly 8 square feet (0.74 sq m) per person, banquet rounds about 13 sq ft (1.2 sq m), classroom style about 18 sq ft (1.67 sq m) and a standing reception about 7 sq ft (0.65 sq m). Add around 25 percent on top for stage, aisles, registration and back of house — those allowances are for seats only, and none of them is a legal occupancy figure.",
    ],
    [
      "How many registration desks does an event need?",
      "Plan one check-in station per 100 attendees as a starting point, then add capacity if most people arrive in the same fifteen-minute window. Pre-printed badges or QR check-in roughly halve the time per person, which is usually cheaper than adding another desk.",
    ],
    [
      "How many buffet lines for 300 guests?",
      "One double-sided buffet line serves roughly 100 guests an hour, so 300 guests need three lines to be fed inside an hour, or more if the break is shorter. Lines placed away from walls so guests can serve from both sides roughly double throughput compared with a line against a wall.",
    ],
    [
      "What is a run of show?",
      "A run of show is the minute-by-minute schedule of an event with clock times, segment names, owners and cues, used by the crew rather than the audience. It differs from an agenda because it includes what happens between segments — the handovers, AV changes and set moves that are where events usually lose time.",
    ],
  ],
};

export default seo;
