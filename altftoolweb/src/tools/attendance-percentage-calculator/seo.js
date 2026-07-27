const seo = {
  "intro": "Attendance Percentage Calculator works out what percentage of classes you have actually attended, then answers the question that matters: how many classes in a row you must attend to climb back to the required percentage, or how many you can miss while staying above it. Add the number of classes left in the term and it also projects your best and worst possible end-of-semester attendance. Built for school and college students facing a 75% or 80% minimum attendance rule.",
  "useCases": [
    "Find out how many lectures in a row you need to attend to get back above a 75% detention cut-off.",
    "Check how many classes you can safely skip for a trip, wedding or interview without dropping below the rule.",
    "See whether the required percentage is still mathematically reachable with the classes left in the semester."
  ],
  "benefits": [
    [
      "Answers both directions",
      "Shows classes needed when you are short and classes you can skip when you are safe."
    ],
    [
      "End-of-term projection",
      "Enter classes remaining to see your best case, worst case and how many you may still miss."
    ],
    [
      "Warns when it is out of reach",
      "If attending every remaining class still falls short of the target, the tool says so instead of showing a fake number."
    ]
  ],
  "faqs": [
    [
      "How is attendance percentage calculated?",
      "Attendance percentage = (classes attended / classes held) x 100. Only classes actually conducted count in the denominator, so a cancelled lecture affects neither side."
    ],
    [
      "How many classes must I attend to raise my attendance to 75%?",
      "Solve (attended + n) / (held + n) = 0.75 for n, which gives n = (0.75 x held - attended) / 0.25. The tool rounds this up to a whole class, because you cannot attend a fraction of one."
    ],
    [
      "Why does my attendance rise so slowly after a long absence?",
      "Each new class adds one to both the numerator and the denominator, so recovery gets harder the more classes have already been held. Missing early in a term is far easier to fix than missing late."
    ],
    [
      "Do medical leave and duty leave count as attended?",
      "That depends entirely on your institution's rules — some grant condonation or count duty leave as present, others do not. This is an informational estimate; confirm the treatment of your leave with your department before relying on it."
    ]
  ]
};

export default seo;
