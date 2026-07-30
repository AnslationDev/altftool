const seo = {
  title: "Free Form Builder — Drag, Drop, Export HTML",
  h1: "Form Builder",
  metaDescription:
    "Build a form by dragging 16 field types, add regex and length validation, then export clean HTML, React JSX, or JSON — free, in your browser, no signup.",
  intro:
    "The Form Builder assembles a form from 16 field types using the browser's native HTML5 drag-and-drop API (dataTransfer), then exports it as plain HTML, a React JSX component, or a JSON schema. Everything runs client-side — the tool makes no network requests at all. Your layout autosaves to localStorage under a single formData key, and the Share button compresses the entire form definition with lz-string and packs it into the link itself as ?data=…, so the form travels in the URL rather than through a server.",
  useCases: [
    "Mocking up a contact, login, feedback, survey, or job-application form from a preset and reshaping the fields",
    "Generating the HTML or React JSX for a form you'll paste into your own project",
    "Sending a working, fillable form to a colleague or client as a single link, with no hosting or account involved",
  ],
  benefits: [
    [
      "16 field types, dragged into order",
      "Text, email, number, phone, URL, password, textarea, dropdown, radio, checkbox, date, time, date & time, file upload, range slider, and color picker — added by drag or click, reordered by dragging, with undo and redo on every change.",
    ],
    [
      "Real validation, not just labels",
      "Set required, min length, max length, and a custom regex pattern per field. Email, URL, phone, and number min/max are checked automatically as you type in the preview.",
    ],
    [
      "Three export formats plus download",
      "Copy the form as HTML, as a React JSX component, or as a JSON schema — or download a complete standalone .html file that opens straight in a browser.",
    ],
    [
      "Nothing leaves your device",
      "There is no backend and no upload. Work autosaves to your own browser's localStorage, and share links carry the form inside the URL as lz-string-compressed data.",
    ],
  ],
  faqs: [
    [
      "Is there a free online form builder with no signup?",
      "Yes — this one is free and needs no account. It runs entirely in your browser: the tool makes no network requests, and your form is stored in your own browser's localStorage rather than on a server.",
    ],
    [
      "How do I export a form to HTML?",
      "Click Export and choose HTML from the dropdown to copy the markup, or click Download to save a full .html file. The downloaded page is self-contained apart from one Tailwind Play CDN script tag it loads for styling, and its built-in submit handler reads the values with FormData and shows them back as JSON.",
    ],
    [
      "Can this form builder collect responses?",
      "No. It builds and exports forms; it does not host them or store submissions. Submitting in preview shows your entered values as JSON, and the downloaded HTML does the same — to actually receive responses, point the exported form at your own endpoint or form service.",
    ],
    [
      "What field types can I add?",
      "Sixteen: text, email, number, phone, URL, password, textarea, dropdown, radio buttons, checkboxes, date, time, date & time, file upload, range slider, and color picker. Any field can be duplicated, dragged to a new position, or deleted.",
    ],
    [
      "How do I share a form I built?",
      "Click Share. The form definition is compressed with lz-string and appended to the page URL as ?data=…, then copied to your clipboard (or passed to your device's native share sheet). Anyone who opens that link gets the fillable form — the whole form lives in the URL, so it works without any hosting.",
    ],
    [
      "Does it save my work if I close the tab?",
      "Yes. Every edit writes the fields, title, and description to localStorage under the key formData, and the builder restores them on your next visit in that same browser. Clearing site data, using private browsing, or switching browsers or devices loses the saved form.",
    ],
    [
      "Is the Generate Form box actually AI?",
      "No — it's keyword matching, not a model. Your description is scanned for terms like job, contact, signup, login, feedback, or survey and the matching starter set of fields is dropped in; anything else gets a default Name, Email, and Message layout. You edit from there.",
    ],
    [
      "What does the Form Quality percentage mean?",
      "It's a 0-100 score computed locally from three parts: the share of fields marked required (30 points), the share carrying validation — required, min or max length, a regex pattern, or an email/URL type (40 points), and the share that have both a label and a placeholder (30 points).",
    ],
  ],
  steps: [
    "Pick a template or describe your form, then drag field types in from the Add Field panel.",
    "Click any field to set required, min/max length, or a custom regex pattern, and check it against the live preview.",
    "Export as HTML, React JSX, or JSON — or download the standalone .html file or copy a share link.",
  ],
};

export default seo;
