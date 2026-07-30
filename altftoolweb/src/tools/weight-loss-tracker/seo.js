const seo = {
  title: "Free Online Weight Loss Tool & Progress Tracker",
  h1: "Online Weight Loss Tool & Progress Tracker",
  metaDescription:
    "Free online weight loss tool — log weigh-ins against a target, see percent-to-goal and a 10-entry chart. No signup, nothing leaves your browser.",
  intro:
    "The Weight Loss Tracker logs each weigh-in with its own date and an optional note, then derives four figures from the log: current weight, target, weight lost so far (first entry minus latest), and distance remaining. Progress is a straight ratio — (start − current) ÷ (start − target) × 100 — shown as a percentage and a bar capped at 100%. Your ten most recent entries are sorted by date and drawn as a CSS bar chart scaled to your own range, with a dashed line marking the target weight. It is a client-side React component with no network calls, no account and no signup; entries live in the page for the current session, so note milestone numbers elsewhere before you close the tab.",
  useCases: [
    "Logging a weekly weigh-in and seeing what percentage of the way to your goal weight you actually are",
    "Checking whether the last ten weigh-ins are trending down or flattening out, without building a spreadsheet",
    "Working out start, current, lost and remaining in one place before copying the numbers into your own log",
  ],
  benefits: [
    [
      "Percent-to-goal, not just a number",
      "Progress is measured against your own start and target — (start − current) ÷ (start − target) — and displayed as both a percentage and a bar capped at 100%.",
    ],
    [
      "A chart scaled to your range",
      "The ten most recent entries are plotted on an axis padded two units past your highest and lowest weights, with a dashed goal line, so a 0.4 kg change is still visible.",
    ],
    [
      "Entry-by-entry change",
      "Every logged weigh-in shows the difference from the one before it, green when down and red when up, alongside the date and whatever note you added.",
    ],
    [
      "No account, no upload",
      "There are no network calls in the tool: no signup, no email, and your weights are never sent to a server.",
    ],
  ],
  faqs: [
    [
      "Is this weight loss tracker free?",
      "Yes — free, with no signup, no account and no limit on how many entries you can add. The page makes no network calls, so nothing you type is uploaded.",
    ],
    [
      "Does the weight loss tracker save my entries if I close the tab?",
      "No. Entries are held in the page for the current session only — there is no account and no browser storage behind it — so reloading or closing the tab clears the log. Write down your start, current and target weights if you want history that lasts.",
    ],
    [
      "How is the progress percentage worked out?",
      "It is the share of your total goal you have already covered: (starting weight − current weight) ÷ (starting weight − target weight) × 100. Start at 90 kg, target 80 kg, currently 85 kg, and that reads 50%. The figure is capped at 100% once you reach or pass the target.",
    ],
    [
      "Can I track weight loss in pounds instead of kg?",
      "Yes — choose kg or lbs when you set your goal. The toggle changes the unit label on every figure but does not convert the numbers, so enter all your weigh-ins in the same unit you picked.",
    ],
    [
      "How often should I weigh in?",
      "Whichever cadence you will actually keep — daily and weekly both work, because every entry carries its own date. Bodyweight moves a kilo or two day to day with food, salt and hydration, so the shape of the chart across several entries says more than any single reading.",
    ],
    [
      "Why does the chart only show ten weigh-ins?",
      "By design — the bar chart plots your ten most recent entries, sorted by date, so recent movement stays readable rather than compressing into a flat line. Older entries remain in the Recent Entries list with their dates, notes and change-from-previous figures.",
    ],
    [
      "What does the tracker count as my starting weight?",
      "The first entry you added. \"Lost So Far\" is that first weight minus your most recent one, so add weigh-ins in the order they happened — the stat cards follow entry order, while the chart re-sorts by the date on each entry.",
    ],
    [
      "Can I use it without setting a goal weight?",
      "Yes. Weight, date and notes are logged either way, and you still get the chart and the change from each previous entry. Target weight, \"To Goal\", the progress percentage and the dashed goal line on the chart only appear once you set a target.",
    ],
  ],
  steps: [
    "Enter your target weight, pick kg or lbs, and press Set.",
    "Tap + Add Weight Entry, type your weight, adjust the date if you are back-filling, and add an optional note.",
    "Watch the four stat cards, the progress bar and the ten-entry chart update with every weigh-in you log.",
  ],
};

export default seo;
