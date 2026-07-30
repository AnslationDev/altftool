const seo = {
  intro:
    "Timeline Builder turns a list of dated events into an alternating left-right visual timeline, with each entry carrying a date, title, description and one of eight preset colours. It is for anyone who needs a roadmap, project history or event schedule they can show to other people rather than describe in a paragraph. A summary bar counts the events, shows the earliest-to-latest date range, and flags how many titles read as milestones.",
  useCases: [
    "Building a project roadmap for a kickoff deck — kickoff, prototype, beta, feature freeze, GA — and needing it to look like a timeline rather than five bullet points.",
    "Laying out a company or product history for an About page, colour-coding funding rounds in one colour and product launches in another so the two threads are visually separable.",
    "Drafting a run-of-show for an event, then copying it out as numbered plain text to paste into the brief you are sending the crew.",
  ],
  benefits: [
    [
      "Manual order, not forced date sorting",
      "Up and down arrows control the sequence, so same-day events, undated placeholders and deliberate narrative order all survive instead of being re-sorted underneath you.",
    ],
    [
      "Colour as a second dimension",
      "Eight preset swatches let you group entries by workstream or type, and the colour carries through to the dot, the date chip and the list.",
    ],
    [
      "Two export shapes",
      "Copy gives numbered plain text with long-form dates for pasting into a doc; JSON download gives the raw event array for feeding another tool or reloading later.",
    ],
  ],
  faqs: [
    [
      "Does the timeline save if I close the tab?",
      "No. Events live in the page's memory only, so a refresh or a closed tab clears them back to the sample timeline. Download the JSON before you leave if you want to keep the work.",
    ],
    [
      "How does it decide what counts as a milestone?",
      "The milestone counter matches titles containing milestone, launch, release, go-live, complete or done, case-insensitively. It is a rough signal for the summary bar, so rename an entry if you want it counted or excluded.",
    ],
    [
      "Are events sorted by date automatically?",
      "No — they stay in the order you add them, and you reorder with the arrow buttons. The date range in the summary is computed independently by sorting the dates, so it shows the true earliest and latest even when the list order differs.",
    ],
    [
      "Can I export the timeline as an image or PDF?",
      "Not directly; the exports are plain text and JSON. To get a picture, use your browser's print-to-PDF or a screenshot of the timeline panel, which is laid out to alternate sides on desktop and stack on a single line on mobile.",
    ],
  ],
};

export default seo;
