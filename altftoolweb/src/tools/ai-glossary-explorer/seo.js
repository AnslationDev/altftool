const seo = {
  intro:
    "AI Glossary Explorer is a searchable, plain-English glossary of 63 artificial intelligence and machine learning terms, grouped into eight areas from foundations and deep learning through to evaluation, safety and deployment. Each entry gives a one-sentence definition that stands on its own, two or three sentences of detail, a concrete example rather than a restatement, and links to the terms worth reading next. A built-in multiple-choice quiz turns the same entries into self-testing, and every filter and lookup runs in the browser.",
  useCases: [
    "Look up a term from a paper or a vendor deck and see how it connects to the three concepts around it.",
    "Filter to beginner-level entries to build a shared vocabulary before a team's first machine learning project.",
    "Check the difference between terms people use interchangeably, such as algorithm and model, or precision and accuracy.",
    "Quiz yourself on definitions before an interview or an exam, one question at a time.",
  ],
  benefits: [
    ["Definitions that stand alone", "Each entry's first sentence is written to be quotable on its own, without needing the paragraph around it."],
    ["Concrete examples", "Every term carries a real instance — a file size, a score, a sentence — instead of a second abstract definition."],
    ["Cross-referenced", "Related terms and reverse links let you walk from attention to transformers to context windows in three clicks."],
  ],
  faqs: [
    [
      "What is the difference between AI and machine learning?",
      "Artificial intelligence is the broad field of building systems that do tasks associated with intelligence, including hand-written rule systems. Machine learning is the subset in which the system derives its rules from data rather than being told them, and it is what nearly all current AI products use.",
    ],
    [
      "What is the difference between an algorithm and a model?",
      "The algorithm is the procedure that learns — gradient descent, for example — while the model is the trained artefact it produces, a set of parameters saved to a file. The algorithm runs once during training; the model runs every time someone makes a request.",
    ],
    [
      "What does overfitting mean in machine learning?",
      "Overfitting is when a model learns the noise in its training data rather than the pattern, so it scores well on data it has seen and much worse on data it has not. The signature is a large gap between training and validation scores, such as 99% against 71%, and the usual remedies are more data, regularisation and early stopping.",
    ],
    [
      "Why do large language models hallucinate?",
      "Because they are trained to produce a plausible continuation, not a true one, and nothing in the mechanism distinguishes a remembered fact from a well-formed guess. Retrieval-augmented generation, citation requirements and a low sampling temperature reduce the rate, but no current method eliminates it, so outputs still need checking.",
    ],
  ],
};

export default seo;
