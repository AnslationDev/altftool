const seo = {
  title: "JEE Doubt Prompt Builder for Step-by-Step AI Help",
  metaDescription:
    "Turn a JEE physics, chemistry or maths doubt into a step-by-step teaching prompt, with JEE Main's 2.4 min per question and +4/−1 guessing maths alongside.",
  steps: [
    "Pick Subject and Level, then paste the problem into \"The question / doubt\" and fill \"Your attempt so far (needed for answer-mismatch doubts)\".",
    "Under \"What exactly is confusing?\" choose one of the five doubt types — the concept itself, which method to use, stuck mid-solution, my answer does not match, or too slow at this type.",
    "The Generated prompt appears with a Copy prompt button, beside \"Time one question earns\" (2.4 min) and the +4/−1 expected-marks-per-guess table.",
  ],
  intro:
    "This builder frames a JEE physics, chemistry or maths doubt as a step-by-step teaching prompt: it names your exact confusion (concept, method choice, stuck mid-solution, answer mismatch or speed), applies a subject-specific solving framework, and forbids skipped steps. Alongside, it shows the JEE Main arithmetic that shapes practice — 2.4 minutes per question and the +4/−1 marking scheme under which even a blind four-option guess carries +0.25 expected marks. Built for JEE Main and Advanced aspirants using AI as a doubt-solving tutor.",
  useCases: [
    "An aspirant stuck mid-solution on a rotational mechanics problem who wants the error located at the exact step, not a fresh full solution",
    "A student whose integral evaluates to a different answer than the key, framing an answer-mismatch prompt with both attempts included",
    "A dropper drilling organic chemistry who wants every mechanism shown with electron movement and the standard NCERT exception flagged",
  ],
  benefits: [
    ["Subject-true frameworks", "Physics gets free-body diagrams and dimensional checks; maths gets domain-first rigour; chemistry gets mechanisms and exceptions."],
    ["Confusion-targeted asks", "Five doubt types produce five different prompts — a concept gap and a speed problem need opposite explanations."],
    ["Exam arithmetic included", "Time per question and the full guessing expected-value table under +4/−1 marking, computed, not asserted."],
  ],
  faqs: [
    [
      "How should I ask AI to solve a JEE doubt step by step?",
      "State the subject and level, paste the full question, name what exactly confuses you, and demand one step per line with every formula named before use. Adding your own attempt matters most — it turns a generic solution into a diagnosis of your specific error.",
    ],
    [
      "Is it worth guessing in JEE Main with negative marking?",
      "Statistically yes, once you can eliminate anything: under +4/−1 with four options, a blind guess averages +0.25 marks, one elimination raises it to about +0.67, and two eliminations to +1.5. These are long-run averages though — on a single question a wrong guess still costs a mark.",
    ],
    [
      "How much time do I get per question in JEE Main?",
      "2.4 minutes on average — 75 questions in 180 minutes. Strong candidates bank time on their best subject and spend it on multi-step numericals, but any single question crossing 4-5 minutes is usually a signal to mark it and move on.",
    ],
    [
      "Can I trust AI solutions for JEE physics and maths problems?",
      "Treat them as a tutor's first draft, not an answer key: language models make sign errors, drop constants and occasionally invent formulas. Verify each step against NCERT or your standard text, and prefer prompts that force symbol-first algebra and a dimensional check, which make errors easier to catch.",
    ],
  ],
};

export default seo;
