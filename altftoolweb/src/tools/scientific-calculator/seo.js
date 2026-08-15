const seo = {
  title: "Scientific Calculator with DEG/RAD Toggle",
  metaDescription:
    "Type whole expressions like sin(30) + 2^5 / sqrt(16) and evaluate with precedence. DEG/RAD toggle, log and ln, 8-decimal results, 20-entry history.",
  steps: [
    "Type the whole expression with the keypad or your keyboard - sin, cos, tan, log, ln, sqrt, pi, e, x^y and brackets - the way it is written.",
    "Set the angle mode with the DEG/RAD button; the active mode shows on the display, so sin(30) returns 0.5 in degrees.",
    "Press '= Evaluate Expression' (or Enter) for the result rounded to 8 decimal places; the Calculation Log keeps your last 20 entries and reloads one on click.",
  ],
  intro:
    "This is an algebraic-entry scientific calculator: you type the whole expression the way it is written — sin(30) + 2^5 / sqrt(16) — and it evaluates the line with standard operator precedence rather than one step at a time. It covers sine, cosine and tangent with a DEG/RAD toggle, base-10 log and natural ln, square root, powers via ^, brackets, and the constants pi and e. Results are rounded to eight decimal places and the last 20 expressions stay on screen so you can check the working.",
  useCases: [
    "You are working through a trigonometry problem set in degrees and need sin(30) to return 0.5, not the radian answer a default calculator gives",
    "You are checking a pH or decibel figure and need log base 10 and natural log side by side without remembering which button on a physical calculator is which",
    "You are mid-way through a multi-step formula and want to see the whole expression on one line so you can spot a misplaced bracket before pressing equals",
  ],
  benefits: [
    ["Whole-expression entry with precedence", "The full line is evaluated at once, so 2 + 3 * 4 gives 14 and you can see exactly what you typed above the answer."],
    ["Degrees or radians, always visible", "The active mode is shown as DEG or RAD on the display itself, which removes the single most common cause of a wrong trig answer."],
    ["Unclosed brackets are completed for you", "If you type sin(45 and press equals, the missing closing parentheses are added automatically instead of throwing an error."],
  ],
  faqs: [
    [
      "Does it work in degrees or radians?",
      "Both — it starts in degrees, and the DEG/RAD button switches modes with the current mode shown on the display. In degree mode the input to sin, cos and tan is multiplied by pi/180 before evaluation, so sin(30) returns 0.5; in radian mode sin(30) returns about -0.98803162.",
    ],
    [
      "Is log base 10 or natural log?",
      "The log key is base 10 and the ln key is natural log, base e. So log(1000) gives 3 and ln(e) gives 1 — the same convention used on standard scientific calculators and in most textbooks.",
    ],
    [
      "How do I enter a power?",
      "Use the ^ key: 2^10 evaluates to 1024, and it works inside a longer expression such as 3 * 2^4 + 1. The caret is translated to the exponentiation operator, so it binds tighter than multiplication as you would expect.",
    ],
    [
      "How precise are the answers?",
      "Answers are rounded to eight decimal places and trailing zeros are dropped, so 1/3 displays as 0.33333333. Underneath, arithmetic uses standard 64-bit floating point, which means results relying on more than about 15 significant digits — or exact decimal money arithmetic — should not be trusted at the last digit.",
    ],
  ],
};

export default seo;
