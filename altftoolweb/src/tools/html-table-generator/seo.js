const seo = {
  title: "HTML Table Generator — Semantic Markup + CSS Themes",
  metaDescription:
    "Build a table up to 10x10 with real thead/tbody markup, editable cells and zebra, minimal, dark or teal CSS — copy it or download custom-table.html.",
  steps: [
    "Set Rows and Columns (1-10 each), drag Cell Padding (4-24px) and Border Width (0-5px), and pick a Design Theme Preset like Classic Zebra Stripe.",
    "Type your data straight into the Table Editor's cell inputs — the first row is always emitted as thead/th and the rest as tbody/td.",
    "Click Copy Source for the markup plus .custom-table CSS, or Download file to save a standalone custom-table.html.",
  ],
  intro:
    "This generator builds a semantic HTML table — the first row emitted as <thead><th> and the rest as <tbody><td> — from a grid you type into directly, then hands you the markup and a matching CSS block. Choose from 1 to 10 rows and 1 to 10 columns, set cell padding from 4px to 24px and border width from 0 to 5px, pick a zebra, minimal, dark or teal theme, and copy the result or download it as a complete .html file. It suits anyone who needs correct table markup without hand-typing every <tr> and <td>.",
  useCases: [
    "You are writing documentation or a knowledge-base article in raw HTML and need a clean pricing table with a real thead instead of a screenshot",
    "You are building an HTML email or landing page and want a striped table whose CSS is a single self-contained block you can paste into a <style> tag",
    "You have a small dataset in front of you and want to type it into a live grid and get valid markup out, rather than reformatting a spreadsheet export",
  ],
  benefits: [
    ["Real table semantics, not divs", "Row one becomes thead/th and everything below becomes tbody/td, so screen readers and browsers treat the header as a header."],
    ["Edit in the preview itself", "Cells are editable in place and the markup regenerates as you type, so what you see in the preview is exactly what gets copied."],
    ["Markup and CSS stay in sync", "Padding, border width and theme changes are written into the .custom-table rules that ship with the copy, so the pasted table looks the same on your page."],
  ],
  faqs: [
    [
      "How many rows and columns can I generate?",
      "Up to 10 rows by 10 columns, with a minimum of 1 each. Resizing preserves what you already typed — existing cells keep their content and only the newly added positions are filled with placeholder text like Header 3 or Cell 2-1.",
    ],
    [
      "What CSS does the generated table use?",
      "A single .custom-table class with border-collapse: collapse and width: 100%. Padding is whatever you set between 4px and 24px, borders between 0 and 5px, and the zebra and teal themes add a tr:nth-child(even) background so alternating rows are shaded without extra classes on the markup.",
    ],
    [
      "Is the first row always the header?",
      "Yes. The first row is always emitted inside <thead> as <th> cells and every remaining row inside <tbody> as <td>. If you do not want a header, delete the th tags after copying, or set rows to 1 more than your data and treat the top row as labels.",
    ],
    [
      "What is the difference between copying and downloading?",
      "Copy gives you the table markup plus the CSS rules as two commented sections to paste into an existing page. Download writes a complete standalone file, custom-table.html, with a full doctype, an inline <style> block and the table in the body, so it opens correctly on its own.",
    ],
  ],
};

export default seo;
