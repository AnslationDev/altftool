const seo = {
  intro:
    "WCAG Quick Auditor tokenises pasted HTML as inert text and runs 19 deterministic structural checks against it — missing lang, empty or skipped headings, images without alt, unlabelled form fields, unnamed buttons and links, duplicate IDs, untitled iframes, tables without headers, missing or duplicated main landmarks, and positive tabindex values. Nothing is rendered, no script runs, and no URL is fetched, so it reports what the markup says rather than what the page does. It is for developers and content editors who want the obvious markup failures caught before a real accessibility review.",
  useCases: [
    "You are reviewing a pull request that adds a form and want to confirm every input has an associated label rather than just a placeholder",
    "A CMS-authored page landed with h2s nested under h4s, and you need to see exactly which headings skip a level before rewriting the outline",
    "Someone pasted a third-party embed into a template and you want to check whether the iframe carries a title and whether it introduced a duplicate id",
  ],
  benefits: [
    [
      "Accessible-name resolution, not attribute spotting",
      "A button counts as named if it has visible text, an aria-label, an aria-labelledby target, a title, or a native default like Submit — so it does not flag controls that are already labelled indirectly.",
    ],
    [
      "Errors separated from judgement calls",
      "Findings are split into error severity for deterministic failures like a missing alt attribute and warning severity for heuristics like a missing h1 that a human has to decide on.",
    ],
    [
      "A shareable report that leaks nothing",
      "The exported summary contains counts and generic rule names only — no source HTML, text content, attributes, IDs, URLs, snippets, or line locations.",
    ],
  ],
  faqs: [
    [
      "Does passing this audit mean my page is WCAG compliant?",
      "No. It runs 19 structural markup checks and cannot test colour contrast, CSS, layout, zoom and reflow, focus visibility, keyboard behaviour, dynamic states, media, timing, or how a screen reader actually announces the page. Automated checks typically catch only a minority of real accessibility barriers, so treat a clear result as a starting point and follow it with manual and assistive-technology testing.",
    ],
    [
      "What counts as an error versus a warning?",
      "Errors are checks with a definite answer in the markup — no lang attribute, an img with no alt, a form field with no accessible name, a duplicate id, an iframe with an empty title, a data table with cells but no header cells, a positive tabindex, or more than one main landmark. Warnings are heuristics needing human judgement, such as no h1, a skipped heading level, a table with no caption, or a personal-data field with no autocomplete cue.",
    ],
    [
      "How much HTML can I paste in?",
      "Up to 750,000 characters; anything beyond that is truncated and the result says so. Each finding lists up to 8 example locations, while the count reflects every match.",
    ],
    [
      "Why is an empty alt attribute sometimes fine and sometimes flagged?",
      "An empty alt correctly marks a purely decorative image, so it is not an error on its own — it is only flagged when the same element also carries role=\"img\", because that combination tells assistive technology the image is meaningful while giving it no name. Pick one: drop the role for decoration, or write real alt text.",
    ],
  ],
};

export default seo;
