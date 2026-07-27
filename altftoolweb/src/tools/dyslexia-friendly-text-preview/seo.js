const seo = {
  intro:
    "Dyslexia Friendly Text Preview applies typographic settings to a live paragraph and checks them against two published standards: WCAG 2.2 success criterion 1.4.12 Text Spacing, which names 1.5× line height, 0.12 em letter spacing, 0.16 em word spacing and 2× paragraph spacing, and the British Dyslexia Association style guide, which asks for 12–14 pt body text, 60–70 characters a line, left alignment and bold rather than italics. It also scores the text itself with Flesch Reading Ease and the Flesch-Kincaid grade level, and hands back the settings as a CSS block.",
  useCases: [
    "Check a body-copy style meets the WCAG 1.4.12 spacing values before an accessibility audit.",
    "Find the column width that gives 60–70 characters a line at your chosen font size.",
    "Show a client the difference justified text makes to the gaps between words.",
    "Test whether a paragraph reads at plain-English level before publishing it.",
  ],
  benefits: [
    ["Two real standards", "Every check cites either WCAG 1.4.12 or the British Dyslexia Association style guide, with the number it is testing."],
    ["Live and immediate", "The paragraph re-renders as you move each control, so the trade-off between measure and font size is visible."],
    ["Copyable CSS", "The current settings come out as a ready-to-paste rule with font stack, spacing and max-width."],
  ],
  faqs: [
    [
      "What line height is best for dyslexic readers?",
      "At least 1.5 times the font size. That is both the WCAG 1.4.12 Text Spacing value and the British Dyslexia Association recommendation, and it gives the eye enough vertical separation to find the start of the next line without re-reading the current one.",
    ],
    [
      "What are the WCAG text spacing values?",
      "Success criterion 1.4.12 lists four: line height at least 1.5× the font size, space after a paragraph at least 2× the font size, letter spacing at least 0.12 em and word spacing at least 0.16 em. The criterion requires that content stay readable when a reader applies these, so a page must not clip or overlap text when they are forced on.",
    ],
    [
      "Is there a special dyslexia font?",
      "Fonts marketed for dyslexia have not shown a consistent reading-speed advantage in controlled studies. What does help is a plain sans-serif with clearly distinct letterforms, generous spacing and adequate size — which is why the BDA guide names ordinary faces such as Verdana, Tahoma, Trebuchet MS, Arial and Century Gothic.",
    ],
    [
      "Why avoid justified text?",
      "Justification stretches the spaces between words to make both edges straight, which creates uneven gaps and vertical white 'rivers' running down the column. Those gaps make it harder to track along a line. Left-aligned text with a ragged right edge keeps word spacing constant.",
    ],
  ],
};

export default seo;
