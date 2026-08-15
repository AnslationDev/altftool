const seo = {
  title: "Alt Text Policy Generator with WCAG 2.2 Rule Per Type",
  metaDescription:
    "Write a team alt text policy: a rule, sentence pattern and example per image type, each tied to a WCAG criterion, plus the monthly authoring hours.",
  steps: [
    "Fill 'Organisation or team' and 'Who owns the policy', then choose a Conformance target (WCAG 2.2 Level A, AA or AAA) and a Review cadence (Every sprint, Monthly, Quarterly or Annually).",
    "Tick the image kinds under 'Kinds of image to cover' — informative photographs, decorative images, icons and linked images, charts, infographics, images that contain text, CAPTCHA and more — and the surfaces under 'Where the policy applies', then set 'House character limit', 'Images published a month' and 'Seconds it takes you to write one'.",
    "Read 'Rules in the policy' with its coverage percentage, plus 'Success criteria referenced', 'Estimated authoring effort' in hours a month and 'Image types left uncovered'. 'Copy result' copies the whole document shown under 'The policy as markdown'.",
  ],
  intro:
    "This generator produces a written alt text policy: one rule for each kind of image a team publishes, the WCAG success criterion behind it, a sentence pattern, a worked example and the mistake to avoid. The rules implement SC 1.1.1 Non-text Content at Level A and, at Level AA, SC 1.4.5 Images of Text — the level that EN 301 549 in Europe and Section 508 in the United States both point at. Aimed at content, design and engineering teams who keep arguing about alt text case by case instead of writing the rule down once.",
  useCases: [
    "Give a content team one page that settles what to do with decorative banners, product galleries and charts.",
    "Add an alt text section to a design system before an accessibility audit.",
    "Estimate how many hours a month alt text authoring actually costs at your publishing volume.",
    "Brief a new agency or freelancer on the standard their images have to meet.",
  ],
  benefits: [
    ["Rules tied to criteria", "Every rule names the WCAG success criterion it implements, so it survives a review."],
    ["Patterns, not vibes", "Each content type gets a sentence shape and an example an author can copy."],
    ["Exports as markdown", "The whole policy copies out in one click, ready to paste into a handbook or wiki."],
  ],
  faqs: [
    [
      "How long should alt text be?",
      "WCAG sets no character limit. The widely used convention is to keep a short alternative under about 125 characters, because some screen reader and authoring combinations handle longer text awkwardly and because anything longer is usually a complex image that needs a separate long description instead.",
    ],
    [
      "What is the right alt text for a decorative image?",
      "An empty alt attribute — alt=\"\" — so assistive technology skips it entirely. Leaving the attribute off altogether is different and worse: some screen readers then announce the file name. Writing \"decorative image\" is also wrong, because it announces noise rather than skipping it.",
    ],
    [
      "Should alt text start with 'image of'?",
      "No. Screen readers already announce that the element is a graphic, so the prefix repeats information and eats into the useful part of the sentence. Start with the subject of the image instead.",
    ],
    [
      "How do you write alt text for a chart?",
      "Give a short alternative naming the chart type and the single takeaway, then make the underlying numbers available as real text — a data table next to the chart or a description linked from it. Putting every data point into the alt attribute is unusable, and W3C technique G92 expects a long description for complex images.",
    ],
  ],
};

export default seo;
