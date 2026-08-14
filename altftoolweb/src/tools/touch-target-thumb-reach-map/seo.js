const seo = {
  title: "WCAG 2.2 Touch Target Size & Thumb Reach Checker",
  metaDescription:
    "Check tap-target rectangles against the WCAG 2.2 24×24 px minimum and 44×44 px enhanced sizes, test the spacing exception, and map thumb reach zones.",
  steps: [
    "Paste your tap targets into Target JSON or CSV using the label, x, y, width, height and optional exception fields, or press Load safe example.",
    "Set Width (CSS px), Height (CSS px) and Thumb origin to the right or left hand, then press Analyze geometry.",
    "Read each target's 44 px enhanced, 24 px minimum, spacing-candidate or below-minimum status and its near, middle or far reach zone, then choose Download counts-only summary for touch-target-summary.json.",
  ],
  intro:
    "The Touch-Target Thumb-Reach Map checks a list of tap-target rectangles against the WCAG 2.2 target-size geometry — 24 × 24 CSS px for Target Size (Minimum, AA) and 44 × 44 CSS px for Target Size (Enhanced, AAA) — and plots each one into a near, middle or far one-handed reach zone. You paste targets as JSON or CSV with x, y, width, height and an optional exception, set the viewport size and thumb hand, and get a per-target status plus a visual map. It is built for designers and front-end engineers who want the geometry settled before an accessibility audit does it for them.",
  useCases: [
    "You exported the bounding boxes of every button on a 390 × 844 mobile screen and need to know which ones fall under 24 × 24 CSS px before the design goes to build.",
    "An auditor flagged a row of 18 px icon buttons; you want to see whether the 24 px spacing circles around them overlap neighbouring targets or whether they are a genuine spacing-exception candidate.",
    "You are deciding where the primary CTA belongs on a tall phone layout and want to check whether it lands in the near-thumb zone for a right-handed grip rather than the far corner.",
  ],
  benefits: [
    [
      "Both size thresholds, separately",
      "Targets are sorted into 44 px enhanced, 24 px minimum, spacing candidate, below minimum and exception-review buckets instead of one pass/fail.",
    ],
    [
      "Spacing geometry, not just box size",
      "Undersized targets are tested with a 24 CSS px circle against neighbouring rectangles, which is how the spacing exception is actually reasoned about.",
    ],
    [
      "Reach mapped to your viewport",
      "The reach zone is computed per target from the bottom-corner thumb origin for the exact viewport width and height you enter, not a generic phone diagram.",
    ],
  ],
  faqs: [
    [
      "What is the minimum touch target size for WCAG?",
      "WCAG 2.2 Success Criterion 2.5.8 Target Size (Minimum) is Level AA and asks for at least 24 × 24 CSS pixels, with exceptions for spacing, equivalent controls, inline targets, user-agent defaults and essential presentation. The stricter 2.5.5 Target Size (Enhanced) is Level AAA and asks for 44 × 44 CSS pixels, and this tool reports both thresholds separately.",
    ],
    [
      "How does the spacing exception work for small buttons?",
      "A target smaller than 24 × 24 CSS px can still satisfy the minimum if a 24 CSS px diameter circle centred on it does not intersect the circle or rectangle of any other target. That is exactly the geometry checked here, so an undersized target comes back as either a spacing candidate or below minimum depending on whether its circle collides.",
    ],
    [
      "Does a clean result mean the interface is WCAG conformant?",
      "No — the check is limited to the flat CSS-pixel rectangles you supply. Transformed, clipped, irregular, overlapping, dynamic or visually obscured targets can behave differently on a real page, and any exception you mark still needs manual evidence, so treat the output as a geometry screen rather than a conformance statement.",
    ],
    [
      "How is the thumb reach zone calculated?",
      "Each target's centre is measured from the bottom-left or bottom-right corner of your viewport, and that distance is divided by the viewport diagonal: up to 0.4 is near, up to 0.72 is middle, and anything beyond is far. It is a geometric heuristic for layout discussions, not an ergonomic standard — real reach varies with grip, device, hand size, posture and mobility.",
    ],
  ],
};

export default seo;
