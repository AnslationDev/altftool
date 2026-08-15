const seo = {
  title: "UI Spacing Checker: Tailwind Classes on the 4px Grid",
  metaDescription:
    "Paste JSX, HTML or CSS and every p, m and gap class converts at 4px a step, with each value listed by pixel size, line and on or off scale.",
  steps: [
    "Paste your JSX, HTML or CSS into the 'Code snippet' box — the sample it loads with mixes p-5, mt-3 and an inline marginTop of 18px.",
    "Tailwind p, m, gap, space-x/y and directional classes such as pt and px are multiplied by 4 to get pixels, and Npx values inside margin, padding and gap declarations are read as written.",
    "The Values, Off scale and Unique sizes counters update live, and the Spacing inventory lists every value with its pixel size, line number and whether it is on the 4px scale or off it.",
  ],
  intro:
    "The UI Spacing Consistency Checker scans a pasted JSX, HTML or CSS snippet, converts every Tailwind spacing utility to pixels using Tailwind's default step of 1 unit = 4px, and flags any value that is not a multiple of 4. It reads padding, margin and gap classes — p, m, gap, space-x/y and every directional variant such as pt, pb, px, ml — plus any hardcoded N px value in a style block. You get a full inventory with each value's pixel size, a count of off-scale values, and how many distinct sizes the snippet uses.",
  useCases: [
    "A component came back from a handoff with inline styles like marginTop: 18px and you want to know which numbers do not land on the design system's 4px grid before you merge it.",
    "Your buttons look subtly different across three screens, so you paste all three snippets and check how many unique spacing sizes are actually in play.",
    "You are reviewing a pull request from a contributor unfamiliar with the token scale and need a fast, objective list of the spacing values they introduced.",
  ],
  benefits: [
    [
      "Classes and raw pixels together",
      "Tailwind utilities are resolved to their pixel value and compared against inline N px styles in the same inventory, so mixed conventions surface side by side.",
    ],
    [
      "Unique-size count",
      "It reports how many distinct spacing sizes a snippet uses, which is the number that exposes drift even when every value happens to be on the grid.",
    ],
    [
      "Per-value verdict",
      "Every extracted value is listed with its pixel size and marked on or off the 4px scale, so you know exactly which line to change.",
    ],
  ],
  faqs: [
    [
      "How does the checker turn a Tailwind class into pixels?",
      "It multiplies the numeric suffix by 4, because Tailwind's default spacing scale sets 1 unit to 0.25rem, which is 4px at the default 16px root font size. So p-5 is reported as 20px and gap-4 as 16px.",
    ],
    [
      "Why is 4px used as the base step?",
      "A 4px base is the common denominator in most design systems — Material, Tailwind's default scale and the 8-point grid all divide cleanly by it — so any value that is not a multiple of 4 is usually an ad-hoc number rather than a token. The check is arithmetic, not stylistic: it simply reports whether each value divides by 4.",
    ],
    [
      "Does it flag half-step classes like p-1.5?",
      "Yes. A half step resolves to 6px, which is not a multiple of 4, so it appears as off scale even though it is a valid Tailwind class. Treat those entries as deliberate exceptions to review rather than automatic errors.",
    ],
    [
      "What should I do with the off-scale values it finds?",
      "Round each one to the nearest 4px step and replace it with the shared spacing utility rather than an inline style — 18px becomes 16px or 20px, and 12px 20px padding becomes px-5 py-3. Fewer unique sizes across a codebase is the goal, not just divisibility.",
    ],
  ],
};

export default seo;
