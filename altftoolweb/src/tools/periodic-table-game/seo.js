const seo = {
  title: "Periodic Table Game: 118 Elements, 10 Questions",
  metaDescription:
    "Ten questions on a clickable 118-element table: find the cell, name the symbol, name the atomic number. Easy to hard, optional 30/60/120s timer.",
  steps: [
    "In \"Quiz Settings\" choose a Quiz Mode of Find Element, Symbol Challenge or Atomic Number, a Difficulty of Easy (common elements), Medium (main group) or Hard (all 118 elements), and a Timer of No timer, 30s, 60s or 120s.",
    "Press \"Start Quiz\" and answer 10 questions: click the right cell on the 118-element grid in Find Element mode, or pick one of four element buttons otherwise. \"Hint\" spends one of your three hints, and \"End Quiz\" stops the round early.",
    "The finish screen reports Score, Correct, Accuracy and Best Streak — each right answer adds 10 points plus 2 per current streak — then \"Play Again\" reruns the same setup or \"New Settings\" reopens Quiz Settings.",
  ],
  intro:
    "Periodic Table Game is a 10-question chemistry quiz played on a full 118-element table, with three question types: find an element's cell by name, name the element from its symbol, and name the element from its atomic number. Easy draws from 20 everyday elements such as carbon, iron and gold, medium covers the eight main families, and hard opens the whole table including lanthanides and actinides. An optional 30, 60 or 120-second timer turns it into a speed round, and your best streak is remembered between visits.",
  useCases: [
    "Drilling symbol-to-name recall before a chemistry test, where confusing Na for nitrogen or K for potassium costs marks",
    "Learning where the transition metals actually sit by clicking the grid instead of reading a diagram",
    "Racing a classmate on the 60-second hard setting to see who can identify more elements by atomic number",
  ],
  benefits: [
    ["You click the real table", "Find-element questions are answered on the actual 118-cell layout, so you learn positions, groups and periods rather than just names."],
    ["Difficulty changes the pool, not the wording", "Easy restricts questions to 20 common elements; hard includes the lanthanide and actinide rows most quizzes skip."],
    ["Streak-weighted scoring", "Each correct answer scores 10 points plus 2 per current streak, so consecutive answers are worth more than scattered ones."],
  ],
  faqs: [
    [
      "How many questions are in one game?",
      "Ten per round, drawn at random from the pool your difficulty selects. With no timer you can take as long as you like on each; with a timer set, the whole round shares the 30, 60 or 120-second budget.",
    ],
    [
      "How is the score calculated?",
      "10 points for a correct answer plus 2 points for every answer already in your current streak — so the fifth correct answer in a row is worth 18. A wrong answer resets the streak but not the score, and your all-time best streak is saved locally.",
    ],
    [
      "Which elements come up on easy mode?",
      "Twenty common ones: hydrogen, helium, carbon, nitrogen, oxygen, neon, sodium, magnesium, aluminium, silicon, sulfur, chlorine, argon, potassium, calcium, iron, copper, zinc, silver and gold. Medium expands to all main-group and transition families, and hard adds lanthanides and actinides.",
    ],
    [
      "Why do element symbols not match their English names?",
      "Eleven symbols come from Latin or German names rather than English — sodium is Na from natrium, potassium K from kalium, iron Fe from ferrum, lead Pb from plumbum, gold Au from aurum and tungsten W from wolfram. These are the ones the symbol round is most useful for drilling.",
    ],
  ],
};

export default seo;
