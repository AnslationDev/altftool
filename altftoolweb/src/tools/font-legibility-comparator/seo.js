const seo = {
  title: "Font Legibility Comparator: WCAG 1.4.12 Spacing Test",
  metaDescription:
    "Set the same text under two local font stacks, sizes and measures, apply the WCAG 1.4.12 spacing values to view B, and export a settings-only JSON.",
  steps: [
    "Paste your own passage into \"Private reading sample\", capped at 20,000 characters, with the counter below reporting words, paragraphs, detected script groups and characters used.",
    "Adjust View A settings and View B settings independently: Local font stack (System UI sans, Humanist sans fallback, Neutral sans fallback, Reading serif fallback or Monospace fallback), Font size in px, Line height, Letter spacing and Word spacing in em, Line measure in ch, Font weight from 400 Regular to 700 Bold, and Paragraph spacing.",
    "Press \"Apply spacing stress to B\" to push that view to the WCAG test values, \"Swap views\" to compare the other way round, then \"Download settings-only report\" to save font-legibility-comparison.json, which excludes your sample text and your preference.",
  ],
  intro:
    "This comparator renders your own text twice, side by side, under two independent typography settings — font stack, size, weight, line-height, letter-spacing, word-spacing and measure — so you can judge legibility on real content instead of a specimen sheet. A one-click spacing stress applies the WCAG 2.1 Text Spacing (1.4.12) test values to either side: line-height at least 1.5, letter-spacing at least 0.12em, word-spacing at least 0.16em and paragraph spacing at least 2em. It deliberately never declares a winner or a pass — the exported JSON records the two settings and their deltas, and leaves the judgement to you and your readers.",
  useCases: [
    "You are choosing between a 16px/1.6 body setting and 18px/1.5 for a long-form article and want the actual article text set both ways rather than lorem ipsum",
    "A developer asks whether your layout will survive the Text Spacing success criterion, so you apply the stress values to view B and look for clipped or overlapping lines",
    "You suspect your 90-character measure is why people stop reading halfway, and you want to see the same paragraphs at 65 characters next to it before changing the CSS",
  ],
  benefits: [
    ["Compares settings, not just fonts", "Size, weight, line-height, letter-spacing, word-spacing and measure all vary independently per side, so you can isolate which one is doing the work."],
    ["Bakes in the WCAG spacing test", "One button pushes a view to the 1.4.12 test values, which is how you find text that breaks under a reader's own spacing overrides."],
    ["Refuses to fake a verdict", "No readability score is invented and no winner is declared; the report records both configurations and the differences between them for you to act on."],
  ],
  faqs: [
    [
      "What are the WCAG text spacing values it applies?",
      "Success Criterion 1.4.12 Text Spacing: line height at least 1.5 times the font size, spacing after paragraphs at least 2 times the font size, letter spacing at least 0.12em and word spacing at least 0.16em. Content should stay readable with no loss of function when a reader forces those values — they are a robustness test, not a required design.",
    ],
    [
      "Does it tell me which font is more legible?",
      "No, and that is deliberate. Legibility depends on the reader, the language, the screen and the lighting, so the tool shows both settings on your own text and exports the configurations without a score or a winner. Test with the people who will actually read it.",
    ],
    [
      "Which fonts can I compare?",
      "Five local stacks that need no download: system UI sans, a humanist fallback (Verdana, Tahoma), a neutral fallback (Arial, Helvetica), a reading serif (Georgia, Times New Roman) and a monospace stack. No external font is requested, so nothing about your text or session is sent to a font host.",
    ],
    [
      "Is my sample text included in the exported report?",
      "No. The JSON contains the two normalised settings, their numeric deltas and counts of characters, words, paragraphs and scripts detected — but not the text itself and not the side you preferred. Input is capped at 20,000 characters and anything beyond that is flagged as truncated.",
    ],
  ],
};

export default seo;
