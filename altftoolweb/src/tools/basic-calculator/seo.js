const seo = {
  title: "Basic Calculator That Respects Order",
  metaDescription:
    "Type a whole expression like 12 + 7 * 3: it evaluates with correct precedence, rounds to 8 decimal places, and keeps your last 20 results in a log.",
  intro:
    "This Basic Calculator lets you type a whole expression across the display — for example 12 + 7 * 3 — and evaluates it with standard operator precedence, so multiplication and division resolve before addition and subtraction rather than left to right the way a cheap pocket calculator does. Results are rounded to 8 decimal places to suppress binary floating-point noise, and the last 20 calculations stay in a log you can click to reload. It is for anyone doing quick arithmetic in a browser tab who wants to see the full expression, correct it, and check what they entered.",
  useCases: [
    "You are checking an invoice line and want to enter 4 * 250 + 18 as one expression instead of running three separate steps.",
    "You mistyped a digit halfway through a long sum and need backspace on the expression rather than starting over with AC.",
    "You worked out a figure two calculations ago and want to click it in the log to bring it back into the display.",
  ],
  benefits: [
    [
      "Precedence is respected",
      "2 + 3 * 4 returns 14, not 20, because the whole expression is evaluated at once instead of each operator being applied as you press it.",
    ],
    [
      "Floating-point noise is trimmed",
      "Results are rounded to 8 decimal places and trailing zeros dropped, so 0.1 + 0.2 comes back as 0.3 rather than 0.30000000000000004.",
    ],
    [
      "Full keyboard control",
      "Digits and the decimal point, + - * /, Enter or = to evaluate, Backspace to delete, and Escape or C to clear all work without touching the mouse.",
    ],
  ],
  faqs: [
    [
      "Does it follow order of operations?",
      "Yes. The entire expression on the display is evaluated together, so multiplication and division bind tighter than addition and subtraction — 2 + 3 * 4 gives 14.",
    ],
    [
      "How many past calculations does it remember?",
      "The 20 most recent, newest first. Clicking any entry loads its result back into the display. The log lives in the page only, so refreshing or closing the tab clears it.",
    ],
    [
      "Why does it show Error?",
      "Because the expression could not be evaluated or the result is not a finite number — an incomplete expression, or a division by zero, which returns Infinity. Press AC to clear and start again.",
    ],
    [
      "What does the +/- button do?",
      "It toggles the minus sign on the front of whatever is currently in the display. It negates the whole entry, so use it before typing an operator rather than to subtract mid-expression.",
    ],
  ],
};

export default seo;
