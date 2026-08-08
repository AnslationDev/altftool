const seo = {
  title: "Tab Order Checker: Replay Focus from Static HTML",
  metaDescription:
    "Paste up to 500 KB of HTML and step through the estimated tab stops with Tab and Shift+Tab; positive tabindex and unnamed stops are flagged.",
  steps: [
    "Paste markup into the Static HTML source box or use Open file for an .html, .htm or .txt file up to 500 KB — Load safe example fills it with a sample.",
    "Press Estimate focus order, then walk the sequence with the Tab and Shift+Tab buttons or click any entry in Estimated sequence.",
    "Read the Tab stops, Positive tabindex, Unnamed and Nodes parsed counters alongside the Structural cues list, then use Download counts-only summary to save keyboard-focus-order-summary.json.",
  ],
  intro:
    "Keyboard Focus-Order Replay reads pasted static HTML without executing it and estimates the sequential focus order a browser would produce, then lets you step through the resulting tab stops forward and with Shift+Tab. It applies the HTML rule that elements with a positive tabindex come first in ascending order, followed by every tabindex=0 or natively focusable element in document order, and it resolves each stop's accessible name the way the browser would. It is for accessibility engineers and front-end developers auditing a template's tab sequence before they open a browser.",
  useCases: [
    "A code review adds tabindex=\"3\" to a form field and you want to see exactly where that pulls it in the tab sequence relative to everything else.",
    "You are checking a template's markup for tab stops that have no accessible name — an icon button with no aria-label or text — before it reaches QA.",
    "A modal's markup uses aria-hidden on a container and you want to find focusable controls trapped inside it, which is a known screen-reader failure.",
  ],
  benefits: [
    ["Implements the real ordering rule", "Positive tabindex values are sorted ascending ahead of the document-order group, with DOM position breaking ties, exactly as the sequential focus navigation order is defined."],
    ["Names resolved by precedence", "Each stop shows its name and where it came from: aria-labelledby, then aria-label, then a native label, then text content, then alt or value, then title."],
    ["States its own limits", "The output lists what static source cannot settle — CSS visibility, shadow DOM, iframes, scripting, dialogs and programmatic focus — instead of implying a clean run means conformance."],
  ],
  faqs: [
    [
      "Which elements count as tab stops?",
      "Buttons, selects, textareas, iframes, non-hidden inputs, a and area elements that have an href, summary elements, audio and video with controls, contenteditable regions, and anything with tabindex of 0 or higher. Elements inside a hidden, inert or disabled ancestor, and disabled form controls, are excluded.",
    ],
    [
      "Why is a positive tabindex flagged?",
      "Because a positive value moves that element ahead of every tabindex=0 and natively focusable element on the page, no matter where it sits in the markup, which makes the order fragile as soon as anyone adds or moves content. The conventional guidance is to use only 0 and -1 and control order through the DOM.",
    ],
    [
      "Does this prove my page is keyboard accessible?",
      "No. It is a static source estimate, not a browser focus trace, and it cannot judge whether the order preserves meaning or whether composite widgets using arrow keys and aria-activedescendant work. A result with zero cues does not establish WCAG conformance — replay in the rendered interface and test with real keyboard users.",
    ],
    [
      "How large a document can I paste?",
      "Up to 500,000 characters and 12,000 elements; beyond either limit the result is marked truncated so you know the tail was not analysed. Script, style and template contents are stripped before parsing and nothing in the source is ever executed.",
    ],
  ],
};

export default seo;
