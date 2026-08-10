const seo = {
  title: "Digit Span Test: Forward and Reverse Memory Span",
  metaDescription:
    "Adaptive span test from 3 digits: one more after each correct recall, back one after two misses. Graded against Miller's 7±2, with a CSV of every trial.",
  steps: [
    "Pick Digits Forward or Digits Reverse in the Test Mode card, then click the Start Test panel or press Space — the first sequence is 3 items.",
    "Digits appear one at a time under 'Memorise This Sequence' (0.8 seconds each); when 'Your Turn — Recall the Sequence' shows, type them into the box and press Submit Answer or Enter.",
    "Current Span, Best Span, Accuracy and Streak update after each trial and the span grade is read against Miller's 7±2; the CSV button in Attempt History downloads digit-span-test.csv.",
  ],
  intro:
    "The digit span test measures short-term working memory by showing a random string of digits one at a time and asking you to type them back — forward in the order shown, or reverse in the opposite order. This version starts at 3 digits, adds one digit after every correct recall and drops back one (never below 3) after two misses in a row, so your span settles at the longest string you can reliably hold. Results are graded against Miller's classic 7±2 range and charted attempt by attempt, with a CSV export of every trial.",
  useCases: [
    "You want a baseline number before starting a memory-training routine, so you run ten forward trials today and compare the same span in a month",
    "You keep losing phone numbers between hearing them and dialling and want to see whether your span is genuinely below the 5-9 typical band or you are just distracted",
    "A psychology student needs a demo of the forward-versus-reverse gap for a class exercise and exports the attempt log as CSV to chart it",
  ],
  benefits: [
    ["Adaptive staircase, not a fixed list", "The sequence grows by one digit after each success and shrinks after two consecutive misses, converging on your real ceiling instead of a preset length."],
    ["Forward and reverse in one place", "Reverse recall loads the same digits plus a mental reordering step, so the gap between your two spans is visible side by side."],
    ["Per-length accuracy breakdown", "Charts show accuracy at each sequence length and span across attempts, so a single unlucky trial does not define your score."],
  ],
  faqs: [
    [
      "What is a normal digit span score?",
      "Most adults land between 5 and 9 digits forward, the range George Miller described as 7±2. This tool grades 5-6 as average, 7-8 as above average, 9 or more as exceptional, and 3-4 as the lower end of normal.",
    ],
    [
      "How is reverse digit span different from forward?",
      "Reverse asks you to type the digits in the opposite order to how they appeared, which adds a manipulation step on top of storage. Most people score roughly one to two digits lower in reverse than forward, so compare reverse scores only against your own reverse scores.",
    ],
    [
      "How fast are the digits shown?",
      "One digit at a time: a 1-second pause after you start, then each digit held for 0.8 seconds before the next replaces it. The pacing is fixed, so a 7-digit sequence always takes about 5.6 seconds to present and every trial is timed the same way.",
    ],
    [
      "Can I improve my digit span with practice?",
      "Capacity itself is fairly stable, but measured span usually rises with chunking — grouping digits into pairs, dates or phone-number shapes rather than storing nine separate items. Sleep, quiet and undivided attention also move scores; this is a self-test for curiosity and practice, not a clinical assessment, so see a qualified clinician if you are worried about memory changes.",
    ],
  ],
};

export default seo;
