const seo = {
  title: "Lorem Ipsum Generator: Paragraphs, Sentences",
  metaDescription:
    "Generate up to 50 deterministic paragraphs, sentences or words of placeholder Latin — identical settings always return identical text for stable mockups.",
  steps: [
    "Choose the Output type — Paragraphs, Sentences or Words — and set Count to any number from 1 to 50.",
    "Toggle 'Start with classic lorem ipsum' on to open with the recognisable first line, or off for neutral filler.",
    "The preview regenerates deterministically as you change settings; click 'Copy output' to paste the identical block into design and code.",
  ],
  intro:
    "Lorem Ipsum Generator produces placeholder Latin copy in three shapes — paragraphs, sentences or bare words — up to 50 units at a time, with every paragraph built from 4 sentences running 10 to 17 words each. Output is deterministic: the same type and count always returns the same text, so a mockup regenerated tomorrow does not silently reflow. Designers, front-end developers and content modellers get realistic text volume for a layout without shipping real copy into a draft by accident.",
  useCases: [
    "You are building a blog template and need three paragraphs of consistent length to check line-height, measure and the height of the card before any real article exists.",
    "A CMS field has a 200-character limit and you want a word-mode block you can trim to test how the design behaves right at the truncation boundary.",
    "You are handing a Figma frame to a developer and want the same placeholder text in the design and the code, so re-running with identical settings has to give byte-identical output.",
  ],
  benefits: [
    [
      "Repeatable output",
      "Text is generated from the index rather than a random seed, so the same settings reproduce the same block every time — no diff noise when you regenerate.",
    ],
    [
      "Varied sentence lengths",
      "Sentences cycle through 10 to 17 words instead of all landing at one length, which is what makes a paragraph wrap like real prose.",
    ],
    [
      "Classic opener is optional",
      "Toggle the familiar 'Lorem ipsum dolor sit amet' first line on when a reviewer needs to instantly recognise the text as placeholder, off when you want it to read as neutral filler.",
    ],
  ],
  faqs: [
    [
      "How much placeholder text can I generate at once?",
      "Up to 50 units of the selected type — so 50 paragraphs, 50 sentences or 50 words. At the paragraph setting that is 200 sentences, since each paragraph is assembled from exactly 4.",
    ],
    [
      "Is the output the same every time?",
      "Yes. Each sentence is built by stepping through a fixed 30-word Latin bank using its position as the seed, so identical settings always produce identical text. That makes it safe to paste the same placeholder into both a design file and a code branch.",
    ],
    [
      "How many words are in a lorem ipsum paragraph?",
      "Roughly 40 to 68 words here — 4 sentences of 10 to 17 words each. Turning on the classic opener adds 8 more words to the first paragraph only.",
    ],
    [
      "Why use lorem ipsum instead of real text in a design?",
      "Because meaningless text stops reviewers from editing the copy instead of judging the layout, and it removes the risk of unfinished draft wording reaching production. Use it for spacing, rhythm and overflow checks, then swap in real copy before any readability or SEO review.",
    ],
  ],
};

export default seo;
