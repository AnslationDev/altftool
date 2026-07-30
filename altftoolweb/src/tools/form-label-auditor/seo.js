const seo = {
  intro:
    "This auditor reads pasted HTML as inert text — script, style and template blocks are stripped and nothing is executed — and works out, for every form control in it, where its accessible name would come from. It follows the usual precedence of aria-labelledby, then aria-label, then an associated or wrapping label, then native text or value, then title, and flags controls that end up with nothing, plus broken aria-labelledby and aria-describedby references, duplicate IDs, labels pointing at controls that do not exist, radio and checkbox groups in a fieldset with no legend, and visible label text missing from the computed name. Findings are cues for you to check, not a conformance result.",
  useCases: [
    "A checkout form ships next week and you want to know which of its 30 inputs rely on a placeholder alone before a screen-reader user finds out",
    "An automated scan flagged a duplicate ID somewhere in a long template and you want to see which control it collides with and which label is now pointing at the wrong field",
    "You inherited a page whose aria-labelledby attributes were copied between components, and you need to know which of those references no longer resolve to anything",
  ],
  benefits: [
    ["Names the source, not just the gap", "Each control reports which mechanism supplies its name — aria-labelledby, aria-label, label, native value or title — so you can see when a name is coming from somewhere fragile."],
    ["Separates errors from things to review", "Missing names, broken labelledby references and duplicate IDs are errors; multiple labels, missing legends and label-in-name mismatches are review cues you judge in context."],
    ["Never executes what you paste", "The HTML is tokenised as text and script, style and template contents are removed first, so pasting production markup runs none of it."],
  ],
  faqs: [
    [
      "Does a placeholder count as a label?",
      "No. A control whose only text is a placeholder is flagged as an error, because the placeholder disappears the moment the user types and is not a reliable accessible name. Pair every input with a real label element or an aria-label.",
    ],
    [
      "In what order does it decide a control's name?",
      "aria-labelledby first, then aria-label, then a label associated by for or wrapping the control, then native text or value — button text, the alt of an image input, the value of a button, submit or reset input — and finally title. If none of those produce text, the control is reported as unnamed.",
    ],
    [
      "What is the visible-label-not-in-name cue about?",
      "It fires when a control has visible label text that does not appear inside its computed accessible name — the mismatch behind WCAG Success Criterion 2.5.3 Label in Name, which breaks voice-control users who say what they can see. Comparison ignores case, punctuation and spacing.",
    ],
    [
      "If it reports zero issues, is my form accessible?",
      "No. A clean result does not establish WCAG conformance. The name computation here is a bounded heuristic rather than a full implementation of the browser's accessible name algorithm, and it cannot see CSS, visual proximity, dynamic DOM, shadow DOM or what assistive technology actually announces — test with a screen reader and, for anything you must certify, an accessibility specialist. Input is capped at 500,000 characters and 12,000 nodes, and truncation is reported.",
    ],
  ],
};

export default seo;
