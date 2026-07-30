const seo = {
  intro:
    "The Media Query Generator builds a ready-to-paste CSS `@media` rule from a min width and a max width in pixels. Enter either bound, or both, and it emits `(min-width: Npx)`, `(max-width: Npx)`, or the two joined with `and`; entering 0 for a field leaves that bound out, and leaving both at 0 produces `@media all`. It is for anyone writing responsive CSS by hand who wants the bracket and condition syntax right the first time.",
  useCases: [
    "You are adding a tablet-only rule and need a query bounded on both sides, so you set a min of 768 and a max of 1023 and copy the combined condition rather than assembling it from memory.",
    "You are converting a design handoff that lists a single breakpoint into mobile-first CSS and want the min-width-only form, with the max field left at 0.",
    "You are teaching someone why `@media (min-width: 768px) and (max-width: 1023px)` needs the `and` and repeated parentheses, and want a generator that shows the exact string.",
  ],
  benefits: [
    ["Both bounds or just one", "A 0 in either field drops that condition entirely, so the same form produces min-only, max-only or ranged queries."],
    ["Correct joining syntax", "Two conditions are combined with `and` and each keeps its own parentheses, which is where hand-written queries most often break."],
    ["Shows the bare condition too", "Alongside the full `@media` block it returns just the condition string, ready to drop into a container query or a JavaScript matchMedia call."],
  ],
  faqs: [
    [
      "What are the common CSS breakpoints?",
      "There is no standard set in the CSS specification, but the widely copied Bootstrap scale is 576px, 768px, 992px, 1200px and 1400px, while Tailwind uses 640px, 768px, 1024px, 1280px and 1536px. Pick the widths where your own layout actually breaks rather than inheriting a framework's numbers.",
    ],
    [
      "Should I use min-width or max-width?",
      "Prefer min-width for a mobile-first stylesheet: the base rules describe the narrow layout and each min-width query layers on enhancements as the viewport grows. max-width queries suit desktop-first codebases, where the base styles target large screens and each query strips things back.",
    ],
    [
      "How do I avoid two breakpoints overlapping?",
      "Make the max-width one pixel below the next min-width — 767 paired with 768, not 768 and 768 — because a query written as `(max-width: 768px)` still matches at exactly 768px and both rules would apply. Frameworks that support fractional widths use 767.98px for the same reason.",
    ],
    [
      "Does the generated query work in every browser?",
      "Yes — `min-width` and `max-width` media features are part of CSS Media Queries Level 3 and have been supported in every major browser for well over a decade. The newer range syntax such as `(width >= 768px)` is more concise but has a shorter support history, which is why this tool emits the traditional form.",
    ],
  ],
};

export default seo;
