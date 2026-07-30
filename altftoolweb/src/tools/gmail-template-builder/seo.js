const seo = {
  intro:
    "Gmail Template Builder is a drag-and-drop email composer that outputs table-based HTML with inline styles — a 600px-wide centred layout, MSO table hints and a max-width: 600px media query — which is the structure email clients like Gmail and Outlook actually render reliably. You stack nine block types (text, header, image, logo, button, divider, signature, social links and footer), edit padding, colour, size and alignment per block, then export the finished HTML or the layout as JSON. It is for marketers and developers who need a campaign or transactional template that survives Gmail's HTML stripping without hand-writing nested tables.",
  useCases: [
    "You need a product announcement email that does not collapse in Gmail's mobile app, so you build it visually and export HTML that is already table-based with a 600px shell.",
    "You are setting up a transactional template in your sending platform and want a clean starting block structure — logo, header, body text, CTA button, signature, footer — rather than editing someone else's theme.",
    "You are iterating on a layout with a colleague and want to move the CTA above the image, undo it if it reads worse, and check both the desktop and mobile preview before exporting.",
  ],
  benefits: [
    [
      "Exports email-safe HTML, not web HTML",
      "Every block becomes a table row with inline styles, plus mso-table-lspace/rspace resets and bicubic image handling, because Gmail and Outlook strip most stylesheet rules.",
    ],
    [
      "Undo, redo and autosave while you experiment",
      "Each change is pushed onto a history stack you can step back through, and the current layout is written to your browser so a refresh does not lose the template.",
    ],
    [
      "Buttons built to stay clickable",
      "The CTA block renders as a padded anchor with its own background, border-radius and inline padding, which is the pattern that keeps buttons tappable where CSS buttons fail.",
    ],
  ],
  faqs: [
    [
      "What HTML width does it export, and is it responsive?",
      "A centred 600px-max-width table — the long-standing safe width for email — inside a full-width body, with a media query at max-width: 600px that lets the outer table and full-width images stretch to 100% on phones. Images also carry max-width: 100% and height: auto inline so they scale even where the media query is ignored.",
    ],
    [
      "Which blocks can I add to a template?",
      "Nine: text, header, image, logo, button, divider, signature, social media links and footer. Each one arrives with sensible defaults — for example the button ships at 12px vertical and 24px horizontal padding with a 5px radius — and every padding, colour, font size and alignment value is editable in the side panel.",
    ],
    [
      "Is my template saved if I close the tab?",
      "Yes. The block list is written to your browser's local storage on every change and reloaded when you return, and nothing is uploaded to a server. Clearing the template or clearing site data removes it, so export the HTML or JSON if you need a permanent copy.",
    ],
    [
      "Can I export the layout to reuse it elsewhere?",
      "Two ways: the HTML export gives you the complete document with doctype, head styles and inline-styled table body ready to paste into a sending platform, and the JSON export gives you the raw block array with every style property so you can version it or feed it into your own tooling.",
    ],
  ],
};

export default seo;
