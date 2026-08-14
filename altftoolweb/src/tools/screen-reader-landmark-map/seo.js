const seo = {
  title: "Screen-Reader Landmark Map: ARIA Roles + Headings",
  metaDescription:
    "Paste HTML and get the eight ARIA landmark roles with their accessible names, headings nested under each, and cues for missing main or skipped levels.",
  steps: [
    "Paste markup into the HTML source box, or press Open file for an HTML or TXT file up to 500 KB; \"Load safe example\" fills the box with a sample document.",
    "Press \"Build landmark map\" — the source is tokenised as text with script, style and template contents stripped, never rendered or executed.",
    "Read the Nodes parsed, Landmarks, Headings, Main landmarks and Review cues counts alongside the landmark list and heading outline, then press \"Download counts-only summary\" to save screen-reader-landmark-summary.json.",
  ],
  intro:
    "The Screen-Reader Landmark Map parses pasted HTML as inert text and returns the ARIA landmark and heading outline a screen-reader user would navigate, covering the eight landmark roles — banner, complementary, contentinfo, form, main, navigation, region and search — resolved from both explicit role attributes and implicit HTML elements. It reports each landmark's accessible name and where that name came from (aria-label, aria-labelledby or title), nests headings under the landmark that contains them, and raises review cues for a missing or duplicated main, skipped heading levels, empty headings and repeated unlabelled landmarks. It is for developers and accessibility reviewers who want to check document structure without opening a screen reader.",
  useCases: [
    "A developer who just converted a page from div soup to semantic HTML and wants to confirm there is exactly one main landmark and that the nav and aside actually register as landmarks.",
    "An accessibility reviewer checking whether a page's h1–h6 order flows without jumping from level 2 straight to level 4, which is one of the cues the outline flags.",
    "Someone with two <nav> elements — a primary menu and a footer menu — checking whether each has a distinct aria-label, since unlabelled repeats are indistinguishable in a landmark list.",
  ],
  benefits: [
    [
      "Applies the naming rules, not just the tag names",
      "form and region only count as landmarks once they have an accessible name, and header/footer only map to banner/contentinfo when they are not nested inside article, aside, main, nav or section.",
    ],
    [
      "Landmarks and headings in one sequence",
      "Headings are attributed to their containing landmark and shown in document order at their nesting depth, so you see the outline the way rotor navigation exposes it.",
    ],
    [
      "Nothing is executed",
      "The HTML is tokenized as text with script, style and template contents stripped, so no markup from a page under review ever runs, loads or renders.",
    ],
  ],
  faqs: [
    [
      "Which ARIA landmark roles does this map recognise?",
      "Eight: banner, complementary, contentinfo, form, main, navigation, region and search. They are picked up from an explicit role attribute or from the implicit role of main, nav, aside, search, header, footer, form and section elements, with header and footer only mapping to banner and contentinfo when they sit outside sectioning content.",
    ],
    [
      "How many main landmarks should a page have?",
      "Exactly one. The map raises a review cue when it finds none, and another when it finds more than one, noting the count so you can confirm only a single main is exposed at a time — for example in a single-page app where an inactive view is still in the DOM.",
    ],
    [
      "Why does my <section> not show up as a landmark?",
      "A section only exposes the region role once it has an accessible name, and the same rule applies to form. Add aria-label or aria-labelledby; without one the element is flagged as an unnamed landmark candidate rather than counted, because an unnamed region adds nothing to a landmark list.",
    ],
    [
      "Does a clean landmark map mean the page is accessible?",
      "No. This is a static structural read of the markup only — CSS visibility, focus order, dynamic content, computed accessible names and real screen-reader behaviour are all outside it, and elements with aria-hidden=\"true\" are skipped. Treat it as a first-pass outline check and follow it with testing in an actual screen reader before claiming WCAG conformance.",
    ],
  ],
};

export default seo;
