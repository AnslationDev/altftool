const seo = {
  title: "Crush Percentage Quiz – Names + How They Act",
  metaDescription:
    "A fun crush test scoring 15–99% from your two names plus four questions about how they act — who texts first, one-on-one plans — with a copyable report.",
  intro:
    "Crush Percentage is an entertainment quiz that combines a deterministic hash of the two names with a four-question read on how your crush actually behaves around you, producing a single score between 15% and 99%. It is for anyone trying to make sense of mixed signals — who texts first, whether they remember small things, whether one-on-one plans ever get suggested. The result comes with a verdict band and a short list of suggested next steps you can copy or download as a text report.",
  useCases: [
    "You and a friend are arguing over whether your crush is flirting or just friendly, and you want a structured set of questions to walk through instead of re-reading the same chat screenshots.",
    "They always reply but never start the conversation, and you want to see how much that single pattern shifts the score compared to everything else going well.",
    "You want a light, shareable result to send to a group chat — a percentage, a verdict, and a copyable report — without handing your names to any server.",
  ],
  benefits: [
    [
      "Behaviour actually moves the number",
      "The four quiz answers carry weights from -10 to +20, so who initiates and whether they suggest one-on-one plans changes the result far more than the names do.",
    ],
    [
      "Same names always give the same base",
      "The name score is a sorted, order-independent hash, so 'Ravi & Meera' and 'Meera & Ravi' return the identical base and re-running it never quietly changes the answer.",
    ],
    [
      "Ends with something to do",
      "Each verdict band comes with three concrete suggested actions matched to the score, rather than a bare percentage and nothing else.",
    ],
  ],
  faqs: [
    [
      "How is the crush percentage calculated?",
      "The score is a deterministic name hash producing a base between 15 and 99, plus the summed weights of your four quiz answers, clamped back into the 15–99 range. Answer weights run from -10 (they rarely make eye contact) to +20 (they initiate texts, or they have suggested one-on-one plans several times).",
    ],
    [
      "What does my score mean?",
      "There are four bands: 85% and above is 'Mutual Chemistry', 70–84% is 'Secret Admirer', 50–69% is 'Potential Spark', and anything under 50% reads as friendly or casual rather than romantic. The band determines both the written analysis and the suggested next steps.",
    ],
    [
      "Is the crush percentage accurate?",
      "No — this is a quiz built for fun, not a prediction. Half the score comes from a hash of two text strings, which has no bearing on real feelings; the interaction questions are the only part reflecting anything real, and even those are a rough self-report.",
    ],
    [
      "Do my names or answers get sent anywhere?",
      "No. The hash and the quiz scoring both run in your browser, and nothing is uploaded, so the only copy of the report is the one you choose to copy or download as a .txt file.",
    ],
  ],
};

export default seo;
