const seo = {
  intro:
    "The Memory Span Calculator measures your short-term memory span with an adaptive sequence test: it shows a sequence one item at a time, asks you to type it back, then lengthens the sequence by one item after a correct answer and shortens it after repeated errors. Four modes are available — digits forward, digits reverse, random letters and coloured squares — and your span is reported against Miller's classic 7±2 range. Students, cognitive-psychology learners and anyone curious about their working memory get a running span chart, per-length accuracy and a CSV export of every attempt.",
  useCases: [
    "You keep forgetting phone numbers between hearing and dialling them, and want to know whether your digit span is actually below the typical 5-9 range or whether you are just distracted.",
    "You are studying working memory for a psychology course and need a hands-on demonstration of the difference between forward and backward digit span on the same person.",
    "You want to see whether your span drops after a bad night's sleep, so you run the same mode on two mornings and compare the exported CSV.",
  ],
  benefits: [
    ["Adaptive, not fixed length", "The sequence grows by one item after every correct recall and steps back down after repeated misses, so it converges on your actual ceiling instead of a preset length."],
    ["Forward and backward in one place", "Digits reverse scores your answer against the reversed sequence, isolating the manipulation load that plain forward recall does not test."],
    ["Every attempt is kept", "Span-per-attempt and accuracy-by-length charts plus a CSV export let you see the length at which you start failing, not just a single headline number."],
  ],
  faqs: [
    [
      "What is a normal memory span?",
      "Most adults land between 5 and 9 items, the range George Miller described as 7 plus or minus 2. This tool grades 5-6 as average, 7-8 as above average and 9 or more as exceptional; anything under 5 is at the low end of the normal distribution rather than automatically a problem.",
    ],
    [
      "How fast is each item shown?",
      "Each item appears for 800 milliseconds, after a 1-second pause before the sequence starts. That pacing is deliberate — it is fast enough to discourage writing items down or rehearsing them aloud item by item.",
    ],
    [
      "Why is my reverse digit span lower than my forward span?",
      "Reverse span is normally about one item shorter, because you must hold the sequence and mentally reverse it at the same time. Forward span mostly measures storage; backward span adds manipulation, which is why clinicians treat the two as separate measures.",
    ],
    [
      "Is this a clinical memory test?",
      "No. It is an informal, self-administered version of a digit-span task for curiosity and practice, with no normed scoring, no supervision and no control over distractions. Persistent memory difficulties that affect daily life should be discussed with a doctor rather than diagnosed from a browser test.",
    ],
  ],
};

export default seo;
