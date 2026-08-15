const seo = {
  title: "Focus Reading Mask: Highlight One Line, Dim",
  metaDescription:
    "Paste text and read one line at a time: the active line is highlighted, the rest fade to 40% opacity. Step through with Previous and Next line buttons.",
  steps: [
    "Paste or edit your text in the 'Text, one focus line per row' box — each newline becomes one focus row.",
    "Step through with the 'Previous line' and 'Next line' buttons while the counter reads 'Line X of Y'.",
    "Read the active line highlighted on a filled background at full contrast while every other line stays visible but faded to 40% opacity.",
  ],
  intro:
    "A focus reading mask shows one line of text at full contrast and dims every other line, so your eye has a single place to land. This one splits whatever you paste on its line breaks — one row per line — renders the active row bold on a filled background and drops the rest to 40% opacity, and moves the highlight with Previous line and Next line buttons while a counter reads Line 3 of 12. It is a reading aid for anyone who loses their place mid-paragraph, not a diagnostic or a medical device.",
  useCases: [
    "You are proofreading a script or a list of steps and keep skipping a row, so you want the page to show you exactly which line you are on before you move down",
    "A reader who finds dense paragraphs hard to track wants the same text broken into single lines with everything else quieted, without installing a browser extension",
    "You are rehearsing lines, a speech or a set of talking points and want to advance one line at a time instead of scrolling and re-finding your position",
  ],
  benefits: [
    ["Splits on your own line breaks", "Each newline becomes one focus row, so you control exactly how much text sits inside a single highlight."],
    ["Dims rather than hides", "Surrounding lines stay on screen at reduced opacity, so you keep the context and can still see what comes next."],
    ["Advances by button, not by hover", "Previous and Next are real buttons that take keyboard focus, so stepping through does not depend on holding a mouse steady."],
  ],
  faqs: [
    [
      "How do I control how much text is highlighted at once?",
      "Break the text where you want the mask to stop — the highlight is exactly one line of your input, split on newlines. Paste a paragraph as a single line and the whole paragraph lights up; press Enter after each sentence or clause and the mask steps through them one at a time.",
    ],
    [
      "Are the other lines hidden or just faded?",
      "Faded. Non-active rows render at 40% opacity in the muted text colour, so they remain readable if you glance at them. Nothing is removed from the page, which means you can still scan ahead or check the line you just left.",
    ],
    [
      "Does the text I paste get uploaded anywhere?",
      "No. The text lives in the page's own state while you use it and is never sent to a server, so private drafts, medical notes or unpublished scripts stay on your machine.",
    ],
    [
      "Can this help with dyslexia or visual tracking difficulty?",
      "Line masking is a commonly used reading support, and many people find that isolating one line reduces the skipping and re-reading that comes with tracking difficulty. It is an informational aid only — it does not assess or diagnose anything, so speak to a specialist teacher, optometrist or clinician about a formal assessment.",
    ],
  ],
};

export default seo;
