const seo = {
  title: "Line Height Calculator: Font Size, Measure, WCAG",
  metaDescription:
    "Get a line height from font size and column width, with characters per line, the 45-75 measure band, a baseline-grid value and a WCAG 1.5 check.",
  steps: [
    "Enter 'Font size (px)' and 'Measure / column width (px)', then pick a Text role.",
    "Set 'Average character width (× font size)' — about 0.5 for a typical sans — and the 'Baseline grid unit (px)'.",
    "Read the recommended ratio, characters per line against the 45-75 band, the snapped baseline value and the WCAG 1.4.8 line spacing verdict, then press 'Copy CSS'.",
  ],
  intro:
    "Line Height Calculator recommends leading from the two things that actually determine it: the font size and how wide the column is. It converts the column width into characters per line (measure ÷ average glyph advance), then adjusts a role-appropriate base ratio upward for long lines and downward for large type, because longer lines need more leading to guide the eye back and larger type already carries a bigger gap. It also reports whether the measure sits inside the 45-75 character band and whether the result clears the 1.5 line spacing WCAG 2.x SC 1.4.8 asks for in body text.",
  useCases: [
    "Set body copy at 16px in a 640px column and find out the measure is too wide before the article ships.",
    "Snap a line height to a 4px baseline grid so text aligns with the rest of the spacing scale.",
    "Pick display-type leading for a 64px hero headline without defaulting to the same 1.5 as body text.",
    "Check whether a caption at 12px still meets the WCAG line spacing minimum for blocks of text.",
  ],
  benefits: [
    [
      "Measure-aware, not a fixed number",
      "Leading rises with characters per line instead of applying the same 1.5 to every column width.",
    ],
    [
      "Baseline grid version included",
      "The result is also snapped to your grid unit, with the effective ratio that produces.",
    ],
    [
      "Accessibility flagged",
      "Body text below the 1.5 WCAG line spacing minimum is called out rather than quietly shipped.",
    ],
  ],
  faqs: [
    [
      "What is a good line height for body text?",
      "Around 1.5 for a comfortable measure, rising toward 1.7 for long lines and falling toward 1.4 for narrow columns. WCAG 2.x SC 1.4.8 sets 1.5 as the minimum line spacing within paragraphs for the AAA level, so 1.5 is a sensible floor for running text.",
    ],
    [
      "How many characters should there be per line?",
      "45 to 75 characters is the long-standing range for a single column of running text, with about 66 as the ideal. Below 45 the eye jumps lines too often; above 75 it struggles to find the start of the next line, which is exactly when extra leading helps.",
    ],
    [
      "Should line-height use a number or a pixel value?",
      "Use a unitless number for body text so it scales with the font size and inherits sensibly into nested elements. Use a pixel value only when you are locking text to a baseline grid, and be aware it will not adapt if the font size changes.",
    ],
    [
      "Do headings need the same line height as body text?",
      "No. Headings and display type are usually set between 1.0 and 1.25 because the leading gap grows with the font size, so the same 1.5 ratio would leave a large headline looking loose and disconnected.",
    ],
  ],
};

export default seo;
