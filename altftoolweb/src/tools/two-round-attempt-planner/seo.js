const seo = {
  title: "Two Round Exam Planner: Per-Question Pace",
  metaDescription:
    "Split working time between a full first sweep and a second pass over flagged questions — get the seconds-per-question pace each round demands.",
  steps: [
    "Enter Total questions on the paper, Paper duration (minutes) and an End buffer for OMR transfer and final checks.",
    "Set Round 1's share of working time (%) — the coaching convention is 60-70% — and the percentage of questions you expect to flag for round 2.",
    "Read the seconds-per-question pace for round 1 and for each flagged question in round 2, then click Copy plan.",
  ],
  intro:
    "This planner turns the two-pass attempt strategy used across competitive-exam coaching into concrete numbers: it splits your working time between a fast first sweep of every question and a second pass over the ones you flagged, then tells you the seconds-per-question pace each round demands. Aspirants preparing for SSC, banking, JEE, CAT or any objective paper set the time split and expected flag rate and get a plan they can rehearse in mocks.",
  useCases: [
    "A banking exam aspirant planning a 100-question, 60-minute section with a 65/35 split between sweep and revisit",
    "A JEE candidate deciding how many seconds a first-pass question deserves before it must be flagged and left",
    "A mock-test taker comparing single-pass pace against two-round pace to see how much calmer the first sweep becomes",
  ],
  benefits: [
    ["Concrete per-question budgets", "Each round gets a seconds-per-question figure you can actually rehearse against a stopwatch."],
    ["Flag rate aware", "Round 2 pace is computed over only the flagged subset, not the whole paper."],
    ["Buffer built in", "OMR transfer and final-check minutes are excluded from both rounds so the plan is realistic."],
  ],
  faqs: [
    [
      "What is the two round strategy in competitive exams?",
      "It is a two-pass method: in round 1 you sweep every question quickly, answering only those you are sure of and flagging the rest; in round 2 you return to the flagged questions with the remaining time. It guarantees all easy marks are banked before any time is risked on hard questions.",
    ],
    [
      "How much time should round 1 get?",
      "Coaching convention gives the first sweep roughly 60-70% of working time. On a 180-minute, 100-question paper with a 65% split and a 10-minute buffer, round 1 gets about 110 minutes — roughly 66 seconds per question.",
    ],
    [
      "When should I flag a question instead of solving it?",
      "The moment it exceeds your round 1 per-question budget or you realise it needs more than one read to set up. Flagging is not giving up — flagged questions get a much bigger time budget in round 2, often nearly double the round 1 pace.",
    ],
    [
      "Does the two round method work for descriptive papers?",
      "It is designed for objective papers where questions are independent and quick to re-enter. Descriptive papers are usually better served by a mark-weighted section plan, since long answers cannot be cheaply revisited.",
    ],
  ],
};

export default seo;
