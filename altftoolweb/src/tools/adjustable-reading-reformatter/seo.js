const seo = {
  intro:
    "The Adjustable Reading Reformatter takes any text you paste and re-renders it live with five controls you set yourself: font size from 14 to 42 px, line height from 1.2 to 2.4, letter spacing from 0 to 0.18em, line width from 32 to 90 characters, and left, centred or justified alignment. It is for readers with dyslexia, low vision, ADHD or simple screen fatigue who already know that default web typography does not suit them and want to find the settings that do. The text never leaves your device — the preview is styled entirely in the browser, and nothing is uploaded or stored.",
  useCases: [
    "You are about to read a long article set in small, tightly packed type, and want to paste it into a wider-spaced view before you start",
    "You suspect narrower lines help you, so you drop the measure from 90 characters down towards 45 and see whether you stop losing your place",
    "You are choosing accessible defaults for a document or site and want to eyeball your own copy at 1.5 line height and 0.12em letter spacing before committing",
  ],
  benefits: [
    ["Five independent dimensions, one live preview", "Size, line height, letter spacing, measure and alignment all update the same block of your own text as you drag."],
    ["Ranges that reach real accessibility targets", "The sliders extend past the WCAG 2.1 text-spacing values, so you can test 1.5 line height and 0.12em tracking rather than guess at them."],
    ["Your own text, not a lorem sample", "Comfort depends on the actual words, language and punctuation you read, so the preview reformats whatever you paste in."],
  ],
  faqs: [
    [
      "What line height should I use for comfortable reading?",
      "Start at 1.5 times the font size — that is the line-height value named in WCAG 2.1 Success Criterion 1.4.12 Text Spacing, and the slider covers 1.2 to 2.4 so you can go further. Readers who lose their place mid-paragraph often settle noticeably above 1.5.",
    ],
    [
      "How wide should a line of text be?",
      "Typographic convention puts a comfortable measure at roughly 45 to 75 characters per line, and the width slider runs from 32 to 90ch so you can bracket that range. Shorter lines mean more return sweeps; longer lines make it easier to land on the wrong line coming back.",
    ],
    [
      "Does increasing letter spacing actually help dyslexic readers?",
      "Extra spacing is a widely used adjustment and it costs nothing to test, which is why the control exists — the letter-spacing slider goes from 0 to 0.18em, comfortably past the 0.12em figure WCAG 2.1 uses. Whether it helps you is individual, so change one control at a time and read a few paragraphs before deciding. This is a reading-comfort aid, not an assessment or treatment for dyslexia.",
    ],
    [
      "Should I use justified text?",
      "Usually no. Justified alignment stretches word spacing to force flush edges, which creates uneven gaps and the vertical 'rivers' that many readers with dyslexia or low vision find disruptive; left-aligned with a ragged right edge keeps spacing uniform. The option is here so you can compare the two on your own text.",
    ],
  ],
};

export default seo;
