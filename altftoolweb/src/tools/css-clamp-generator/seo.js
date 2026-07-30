const seo = {
  intro:
    "The CSS Clamp Generator assembles a `clamp(min, preferred, max)` declaration from three numbers you supply: a minimum size in px, a preferred size in viewport width units, and a maximum size in px. It is for anyone writing fluid typography or spacing who wants the value to scale with the viewport but never fall below a readable floor or grow past a sensible ceiling. The defaults — 16px, 4vw, 48px — produce `clamp(16px, 4vw, 48px)`, ready to paste into a font-size or padding declaration.",
  useCases: [
    "You want a hero heading that is 48px on a wide desktop but never drops under 16px on a small phone, without writing three separate media queries.",
    "Section padding jumps abruptly at your breakpoints and you want it to grow smoothly with the viewport instead, bounded at both ends.",
    "You are reviewing a design spec that gives a minimum and maximum type size and need the single-line CSS value that expresses it.",
  ],
  benefits: [
    [
      "Three inputs, one valid declaration",
      "You supply the floor, the fluid middle and the ceiling, and the correctly ordered clamp() string comes back — no remembering which argument goes where.",
    ],
    [
      "Bounds echoed back for checking",
      "The result restates your min and max with units attached, so a mistyped digit is visible before the value reaches your stylesheet.",
    ],
    [
      "Replaces a stack of media queries",
      "One clamp() covers the whole viewport range, which removes the breakpoint-by-breakpoint font-size overrides that usually go stale first.",
    ],
  ],
  faqs: [
    [
      "What does CSS clamp() actually do?",
      "It returns the preferred value, but clamped: never smaller than the minimum and never larger than the maximum. Written as `clamp(16px, 4vw, 48px)`, the size is 4% of the viewport width, floored at 16px and capped at 48px.",
    ],
    [
      "At what viewport width does the value stop growing?",
      "Where the preferred value crosses each bound. With 4vw, the 16px floor is reached at a 400px viewport (16 ÷ 0.04) and the 48px ceiling at 1200px (48 ÷ 0.04), so the size is fluid only between those two widths.",
    ],
    [
      "Is it safe to use clamp() for font sizes?",
      "Yes in current browsers, and the minimum bound is what protects accessibility — it stops text shrinking below a legible size on narrow screens. Using a vw-only preferred value does mean the text no longer responds to the user's browser zoom in the same way, so keep the floor generous.",
    ],
    [
      "What units does this generator use?",
      "Pixels for the minimum and maximum, and vw for the preferred value, which is the most common combination for fluid type. clamp() itself accepts any comparable length units, so you can swap px for rem in the output by hand if your project uses rem-based sizing.",
    ],
  ],
};

export default seo;
