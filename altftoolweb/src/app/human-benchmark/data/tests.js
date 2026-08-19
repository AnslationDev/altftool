/**
 * The eight tests on /human-benchmark, in one place.
 *
 * Both consumers read this list: components/HumanBenchmark.jsx builds its cards
 * and score table from it, and components/TestGuides.jsx renders the
 * server-side explainer plus the JSON-LD emitted by layout.jsx. One list means
 * the visible sections, the ItemList and the FAQ answers can never describe a
 * different set of tests from the one the app actually runs.
 *
 * Why this matters for search: eight distinct queries ("reaction time test",
 * "typing test", "chimp test", …) all land on this single URL, so each test
 * needs its own heading, its own answer-first sentence and its own anchor.
 *
 * Every number in `answer` and `mechanics` is read off the component that
 * implements the test (components/tests/*.jsx). There are deliberately no
 * averages, percentiles, rankings or player counts here: this app measures your
 * own attempts and stores them in your browser, so it has no population data to
 * report.
 *
 * `icon` is a lucide-react export name resolved by the client dashboard; the
 * server-rendered guide uses no icons, so it costs no client JavaScript.
 */
export const BENCHMARK_TESTS = [
  {
    id: "reaction_time",
    name: "Reaction Time",
    anchor: "reaction-time-test",
    icon: "Zap",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    desc: "Click when the screen turns green.",
    unit: "ms",
    lowerBetter: true,
    measures: "Visual reaction speed",
    question: "What is the reaction time test?",
    answer:
      "The reaction time test measures how quickly you click after the screen turns green. It runs five trials and your score is the average of those five clicks in milliseconds, so a lower number is better.",
    mechanics:
      "Each trial waits a random 1.5 to 3.5 seconds before turning green, and clicking before the colour changes cancels that trial so you retry it.",
    scoring: "Average of 5 trials, in milliseconds. Lower wins.",
  },
  {
    id: "visual_memory",
    name: "Visual Memory",
    anchor: "visual-memory-test",
    icon: "Eye",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    desc: "Memorize and recall flashing squares.",
    unit: "lvl",
    lowerBetter: false,
    measures: "Spatial working memory",
    question: "What is the visual memory test?",
    answer:
      "The visual memory test flashes a pattern of squares on a grid and asks you to click exactly those squares from memory. Your score is the highest level you reach before you lose all three lives.",
    mechanics:
      "Level 1 flashes three squares on a 4x4 grid for 1.2 seconds; every level adds one more square, and the grid grows every two levels up to 10x10.",
    scoring: "Highest level reached. Higher wins.",
  },
  {
    id: "number_memory",
    name: "Number Memory",
    anchor: "number-memory-test",
    icon: "Hash",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    desc: "Remember increasingly long numbers.",
    unit: "lvl",
    lowerBetter: false,
    measures: "Digit span",
    question: "What is the number memory test?",
    answer:
      "The number memory test shows a number for about a second and asks you to type it back from memory. Each level adds one more digit and a single wrong answer ends the run, so your score is the level you reached.",
    mechanics:
      "Level 1 shows a 2-digit number and level N shows N+1 digits; the number stays on screen for 0.8 to 1.5 seconds, growing with its length.",
    scoring: "Level reached, which equals the digits you held. Higher wins.",
  },
  {
    id: "verbal_memory",
    name: "Verbal Memory",
    anchor: "verbal-memory-test",
    icon: "MessageSquare",
    color: "text-green-400",
    bg: "bg-green-400/10",
    desc: "Identify words you have seen before.",
    unit: "pts",
    lowerBetter: false,
    measures: "Word recognition memory",
    question: "What is the verbal memory test?",
    answer:
      "The verbal memory test shows one word at a time and asks whether that word has already appeared in this session. You answer SEEN or NEW, and your score is how many correct answers you give before three mistakes.",
    mechanics:
      "Words are drawn from a fixed list of about 290 common English words that is shuffled at the start of every run, so words repeat often enough to be worth remembering.",
    scoring: "Correct answers before 3 mistakes. Higher wins.",
  },
  {
    id: "typing_test",
    name: "Typing Test",
    anchor: "typing-test",
    icon: "Keyboard",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    desc: "Type a paragraph as fast and accurately as you can.",
    unit: "WPM",
    lowerBetter: false,
    measures: "Typing speed and accuracy",
    question: "What is the typing test?",
    answer:
      "The typing test measures how fast and how accurately you retype a short paragraph. Your score is adjusted words per minute: raw WPM multiplied by your character accuracy, so mistakes cost you speed.",
    mechanics:
      "One of seven paragraphs is chosen at random, the timer starts on your first keystroke, and every five characters counts as one word.",
    scoring: "Adjusted WPM (words per minute x accuracy). Higher wins.",
  },
  {
    id: "aim_trainer",
    name: "Aim Trainer",
    anchor: "aim-trainer-test",
    icon: "Crosshair",
    color: "text-red-400",
    bg: "bg-red-400/10",
    desc: "Click targets as quickly as possible.",
    unit: "ms",
    lowerBetter: true,
    measures: "Pointing speed",
    question: "What is the aim trainer test?",
    answer:
      "The aim trainer puts a circular target at a random spot and times how long you take to click it, thirty targets in a row. Your score is the average milliseconds per target, so a lower number is better.",
    mechanics:
      "The next target appears the instant you hit the current one, and a click outside the target is ignored rather than penalised, so the score is pure speed.",
    scoring: "Average time per target, in milliseconds. Lower wins.",
  },
  {
    id: "chimp_test",
    name: "Chimp Test",
    anchor: "chimp-test",
    icon: "Grid2x2",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    desc: "Click numbers in order before they vanish.",
    unit: "N",
    lowerBetter: false,
    measures: "Short-term spatial recall",
    question: "What is the chimp test?",
    answer:
      "The chimp test scatters numbers across a grid, hides them, and asks you to click their squares in ascending order from memory. Your score is the largest count of numbers, N, that you clear.",
    mechanics:
      "The grid is 4 columns by 8 rows, the run starts at N = 4 and adds one number each round, the numbers stay visible for N x 0.3 seconds, and one wrong square ends the run.",
    scoring: "Highest N cleared. Higher wins.",
  },
  {
    id: "sequence_memory",
    name: "Sequence Memory",
    anchor: "sequence-memory-test",
    icon: "LayoutGrid",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    desc: "Repeat the flashing square sequence.",
    unit: "seq",
    lowerBetter: false,
    measures: "Ordered recall",
    question: "What is the sequence memory test?",
    answer:
      "The sequence memory test flashes squares on a 3x3 grid one after another and asks you to repeat the pattern in the same order. Each round adds one more step and a single wrong click ends the run.",
    mechanics:
      "Every square lights for half a second with a short gap between flashes, and your score is the length of the longest sequence you repeated correctly.",
    scoring: "Longest sequence repeated. Higher wins.",
  },
];

/** FAQPage entries — the exact strings TestGuides.jsx puts on the page. */
export const BENCHMARK_TEST_FAQS = BENCHMARK_TESTS.map((test) => ({
  question: test.question,
  answer: `${test.answer} ${test.mechanics}`,
}));
