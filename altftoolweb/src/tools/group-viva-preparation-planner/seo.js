const seo = {
  title: "Group Viva Planner: Fair Round-Robin Question Rota",
  metaDescription:
    "Builds a round-robin viva practice rota where nobody questions themselves and everyone asks and answers equally, with per-round and total session timings.",
  steps: [
    "List names in 'Group members (one per line, in seating order, max 16)'.",
    "Set 'Rotation rounds', 'Questions each asker puts per round', 'Minutes to answer one question' and 'Feedback minutes per question (0 for none)' — the plan recomputes as you type.",
    "Read the 'Total session time', the per-member ask/answer counts and 'Rounds for full pairing coverage', plus the 'Round-by-round rotation' table of who asks whom; 'Copy plan' copies the whole schedule.",
  ],
  intro:
    "This planner builds a round-robin questioning rota for group viva practice: with n members, the asking offset shifts every round, so nobody questions themselves, each member asks and answers the same number of questions, and after n − 1 rounds everyone has questioned everyone else exactly once. It is made for university students preparing for viva voce, oral defences and lab vivas in a study group, and it returns the full round-by-round schedule plus total and per-round timings.",
  useCases: [
    "A four-person final-year group rehearsing project viva questions in three rotating rounds before submission week",
    "A study circle preparing for a physiology lab viva that wants each member to answer aloud under a fixed per-question time",
    "A supervisor or peer mentor setting up a fair mock-viva evening where no student ends up only asking or only answering",
  ],
  benefits: [
    ["Fair by construction", "Every member asks and answers exactly rounds × questions-per-round questions — no seating luck."],
    ["Full coverage marker", "Shows how many rounds it takes (group size minus one) until everyone has questioned everyone else."],
    ["Realistic timing", "Per-round and total minutes from your answer time and optional feedback time per question."],
  ],
  faqs: [
    [
      "How do you organise a group viva practice session fairly?",
      "Use a round-robin rotation: seat the group in a fixed order and in each round have member i question the member a fixed offset ahead, shifting the offset by one every round. That guarantees each person asks and answers the same number of questions and never questions themselves, which is exactly the schedule this planner prints.",
    ],
    [
      "How many rounds until everyone has questioned everyone else?",
      "Group size minus one. In a group of five, five minus one is four rounds gives full pairing coverage — every member has asked every other member exactly once. The planner flags when your chosen number of rounds reaches that threshold.",
    ],
    [
      "How long should a mock viva answer be?",
      "Two to four minutes per question is a common target for oral-exam practice: long enough to structure an answer (definition, explanation, example) and short enough to keep a group session moving. A four-person group doing three rounds of two questions at three minutes each, plus one feedback minute, needs 96 minutes in total.",
    ],
    [
      "Is answering aloud really better than re-reading notes?",
      "Yes — retrieval practice, recalling answers without notes, is one of the most consistently supported study techniques in cognitive-psychology research, and a viva rota forces spoken retrieval under time. This tool schedules the practice; the questions themselves should come from your syllabus, past vivas and your supervisor's guidance.",
    ],
  ],
};

export default seo;
