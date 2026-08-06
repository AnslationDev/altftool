const seo = {
  intro:
    "This is a WYSIWYG rich text editor built on TipTap that shows the semantic HTML it produces in a live pane below the writing area, so you can format visually and copy the markup out. It covers bold, italic, underline and strikethrough, H1–H3 headings, bullet and ordered lists, blockquotes, code blocks, four text alignments, links and images by URL. A read-only toggle hides the toolbar and renders the same content as it would appear once published.",
  useCases: [
    "Drafting a CMS or product-description field visually and copying the resulting HTML straight into a database column or a template.",
    "Checking what markup a formatting choice actually produces — whether that heading became an <h2> or just bold text — before it ships into a page.",
    "Pasting messy copy from a document, restyling it with headings and lists, and taking away clean structured HTML instead of inline styles.",
  ],
  benefits: [
    ["Markup visible while you type", "The HTML output pane updates on every keystroke, so formatting and the tags it generates are never out of sync."],
    ["Semantic tags, not styled spans", "TipTap's schema emits real heading, list, blockquote and code-block elements, which is what parsers and screen readers need."],
    ["Read-only preview built in", "One toggle drops the toolbar and shows the document as a reader would see it, without leaving the page or exporting first."],
  ],
  faqs: [
    [
      "What formatting does this editor support?",
      "Bold, italic, underline, strikethrough, headings H1 through H3, bullet and ordered lists, blockquotes, code blocks, left/center/right/justify alignment, links and images. Links and images are added by URL through a prompt rather than by file upload.",
    ],
    [
      "How do I get the HTML out?",
      "It is already there — the HTML Output panel below the editor shows the full markup for whatever is in the document and updates live as you type, so you select and copy from that block. There is no separate export step or conversion pass.",
    ],
    [
      "Can I upload an image file?",
      "No, images are inserted by URL only. Paste the address of an image that is already hosted somewhere and it is embedded as an <img> tag in the output; there is no file picker and nothing is uploaded anywhere.",
    ],
    [
      "What is read-only mode for?",
      "It hides the toolbar and locks editing so you can see the document exactly as a reader would, which is the quickest way to check spacing, heading hierarchy and list rendering before you copy the HTML. Toggle it back to Edit Mode and the full toolbar returns with your content intact.",
    ],
  ],
};

export default seo;
