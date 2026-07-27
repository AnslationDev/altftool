const seo = {
  intro:
    "The Button Minimum Size Spec Generator computes the real rendered box of a button from its font size, line height, padding, border and icon, then checks that box against four target-size rules: WCAG 2.2 SC 2.5.8 (24 by 24 CSS pixels, Level AA), WCAG 2.1 SC 2.5.5 (44 by 44, Level AAA), the Apple Human Interface Guidelines 44 by 44 pt tap target, and Material Design's 48 by 48 dp touch target. It also models the SC 2.5.8 spacing exception, which lets an undersized target conform when adjacent targets are far enough apart, and reports the exact padding needed to clear whichever standard you are aiming at.",
  useCases: [
    "Check whether a 16px label with 8px vertical padding actually reaches the 44 pixel AAA target, or falls six pixels short.",
    "Find the vertical padding that turns a compact table-row button into a 48dp Material touch target.",
    "Confirm that a row of small icon buttons still conforms at AA through the SC 2.5.8 spacing exception rather than by size.",
    "Produce a CSS rule with min-height, min-width and padding that a developer can paste straight into a component.",
  ],
  benefits: [
    ["Box model, not guesswork", "Adds line-height times font-size to padding and border on both edges, the way the browser does."],
    ["Models the spacing exception", "Applies the real SC 2.5.8 test - a 24 pixel circle on each target's bounding box must not intersect its neighbour's."],
    ["Tells you the padding", "Reports the exact per-edge padding needed to reach 24, 44 or 48 pixels rather than leaving you to solve for it."],
  ],
  faqs: [
    [
      "What is the minimum button size for accessibility?",
      "24 by 24 CSS pixels under WCAG 2.2 SC 2.5.8 at Level AA, and 44 by 44 under WCAG 2.1 SC 2.5.5 at Level AAA. Apple's Human Interface Guidelines ask for 44 by 44 pt and Material Design for 48 by 48 dp, so 48 is the practical target if you want to satisfy all four.",
    ],
    [
      "What is the WCAG 2.5.8 spacing exception?",
      "An undersized target still conforms if a 24 CSS pixel diameter circle centred on its bounding box does not intersect the circle of any adjacent target. For two equal targets in a row that reduces to a simple test: target size plus the gap between them must be at least 24 pixels.",
    ],
    [
      "How do I calculate a button's height from its CSS?",
      "With the standard border-box model: line-height multiplied by font-size, plus the top and bottom padding, plus the top and bottom border. A 16px label at line-height 1.25 with 8px padding and a 1px border is 20 + 16 + 2 = 38 pixels tall, which misses the 44 pixel AAA target by six.",
    ],
    [
      "Does the button label width matter for target size?",
      "Yes - the target-size rules apply to both dimensions, so a tall but very narrow button can still fail. Width here is estimated from an average glyph advance, which varies by typeface, so measure the real string when the width is close to the threshold.",
    ],
  ],
};

export default seo;
