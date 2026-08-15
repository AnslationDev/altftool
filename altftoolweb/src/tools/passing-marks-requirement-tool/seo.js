const seo = {
  title: "Passing Marks Calculator: External vs Aggregate",
  metaDescription:
    "Applies both university minima at once, the external-paper floor and the internal-plus-external aggregate floor, and shows which one sets your target.",
  steps: [
    "Enter Internal marks scored and Internal maximum, then the External paper maximum — the defaults sit at 18 out of 30 internals against a 70-mark end-semester paper.",
    "Set External-only pass minimum (%), commonly 35–40 and settable to 0 if your scheme has no separate external floor, and Aggregate pass minimum (%), commonly 40–50 of internal plus external together.",
    "External marks you need reports the higher of the two requirements out of the paper total, with Needed by external-only rule, Needed by aggregate rule, the Binding rule and Headroom above the requirement listed below it; Copy result copies that breakdown.",
  ],
  intro:
    "This tool computes the minimum external (end-semester) marks you need to pass a subject, applying the two floors most university ordinances impose simultaneously: a minimum percentage in the external paper alone (commonly 35–40%) and a minimum in the subject aggregate of internal plus external (commonly 40–50%). It takes your internal score, applies both rules — required = max(ceil(external%×external max), ceil(aggregate%×total max − internal)) — and shows which rule binds. Built for students sizing up a paper after internals are declared.",
  useCases: [
    "A student with 18/30 internals checking how many marks out of the 70-mark external paper actually secure a pass",
    "A repeater with very low internals testing whether the subject is even passable, or the aggregate rule demands more than the paper carries",
    "A topper-turned-strategist confirming that only the 35% external floor binds for them, freeing revision time for weaker subjects",
  ],
  benefits: [
    ["Both pass rules applied", "The external-only floor and the aggregate floor are computed separately and the higher one is your real target."],
    ["Shows the binding rule", "See whether the external minimum or the aggregate minimum is what actually sets your requirement."],
    ["Honest about impossibility", "If the requirement exceeds the paper's maximum, the tool says the subject cannot be passed with that internal score."],
  ],
  faqs: [
    [
      "How many marks are needed to pass a university exam?",
      "Typically you must clear two minima at once: around 35–40% of the external paper by itself, and around 40–50% of the subject total (internal + external combined). Your requirement is whichever rule demands more external marks — for example, with 18/30 internals, a 70-mark paper, a 35% external floor and a 40% aggregate floor, you need max(25, 40−18) = 25 marks.",
    ],
    [
      "Do internal marks count towards passing?",
      "Yes — internals count in the aggregate minimum, so a strong internal score lowers the external marks the aggregate rule demands. But they cannot substitute for the separate external-only floor: even with full internals you must still score the external minimum (commonly 35–40% of that paper) in the exam itself.",
    ],
    [
      "Can I fail even after scoring the passing percentage overall?",
      "Yes, if you miss the external-only minimum. Universities apply the floors independently, so scoring 40% overall while getting less than the required 35% in the end-semester paper alone is still a fail in most schemes — this tool shows that external floor as a separate line.",
    ],
    [
      "What if the marks I need are more than the paper's maximum?",
      "Then the subject cannot be passed in that attempt with your current internal score, which can genuinely happen when internals are very low and the aggregate rule is strict. Your options are scheme-specific — grace marks, internal re-assessment, or reappearing — so read your university's ordinance or meet the exam cell rather than relying on the arithmetic alone.",
    ],
  ],
};

export default seo;
