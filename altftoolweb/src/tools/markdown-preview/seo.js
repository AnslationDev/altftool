const seo = {
  title: "Markdown Preview Online — Live HTML Export",
  h1: "Markdown Preview — Live Editor with Instant HTML Output",
  metaDescription:
    "Free live Markdown previewer — type on the left, see rendered HTML on the right, then download a standalone .html file. Runs entirely in your browser.",
  intro:
    "Markdown Preview renders what you type as you type it. The editor pane's text runs through a hand-written parser — a chain of about fifteen regular-expression passes in parseMarkdown(), not a Markdown library — that rewrites headings, bold, italics, links, fenced code blocks, inline code, blockquotes, horizontal rules, task lists and ordered/unordered lists into HTML, then injects the result into the preview pane on every render. It is a client-side React component with no fetch calls and no server round-trip, so nothing you paste is uploaded and the character count above the editor is simply the length of your text. Download HTML wraps the same output in a complete HTML5 document with the stylesheet embedded in a style block, including a prefers-color-scheme dark rule, and saves it as markdown-preview.html through a Blob object URL.",
  useCases: [
    "Check how a README's headings, code fences and task-list checkboxes will render before you commit it.",
    "Draft release notes or a changelog beside the formatted output, then copy the Markdown source back out in one click.",
    "Turn a block of Markdown into a self-contained HTML file, styles included, that opens offline with no external assets.",
  ],
  benefits: [
    [
      "Preview updates on every keystroke",
      "The parser runs synchronously during each React render — no debounce, no build step, no refresh button — so the preview pane is never out of sync with the editor.",
    ],
    [
      "Three layouts, one click",
      "Split shows editor and preview together, Editor gives the textarea the full width for writing, and Preview hides the source so you can read the formatted result on its own.",
    ],
    [
      "Self-contained HTML export",
      "Download HTML produces a single file with the CSS inlined in a style block — typography, code and pre blocks, blockquote rule, link colour and a dark-mode media query — so it renders correctly anywhere.",
    ],
    [
      "Nothing leaves the page",
      "The tool makes no network calls and has no account step; your text lives in React state only, which also means nothing is stored after you close the tab.",
    ],
  ],
  faqs: [
    [
      "Is this Markdown previewer free?",
      "Yes — free, with no signup and no cap on document length. The preview is a client-side React component with no network calls, so the text you paste is never uploaded. The flip side is that nothing is saved either: closing or refreshing the tab clears the editor.",
    ],
    [
      "What Markdown syntax does the live preview support?",
      "Headings from # to ###, bold with ** or __, italics with * or _, links, fenced code blocks opened with three backticks, inline code, blockquotes, horizontal rules written as ---, ordered and unordered lists, and GitHub-style task lists (- [x] and - [ ]) that render as real disabled checkboxes. Pipe tables, nested list indentation, strikethrough and h4–h6 headings are not part of the parser, so they pass through as plain text.",
    ],
    [
      "How do I convert Markdown to HTML and download it?",
      "Press Download HTML. The rendered output is wrapped in a full HTML5 document with the stylesheet embedded in a style tag — body typography, code and pre styling, blockquote border, link colour and a prefers-color-scheme: dark media query — and saved as markdown-preview.html via a Blob object URL. There is no separate CSS file to ship with it.",
    ],
    [
      "Does it syntax-highlight code blocks?",
      "No. Fenced code blocks are rendered as a monospaced pre/code block on a muted background, and the language tag after the opening backticks is matched but not used for colouring. The editor side is a plain monospaced textarea, so there is no token colouring in either pane.",
    ],
    [
      "Can I upload a .md file to preview it?",
      "No — there is no file picker. Open the .md file in any text editor and paste its contents into the editor pane; the tool works on typed or pasted text only. There is no length limit, and the counter above the editor shows the live character count of what you have entered.",
    ],
    [
      "Does the preview render raw HTML written inside the Markdown?",
      "Yes, and unescaped — the parser does not strip or sanitise HTML, so tags you type are injected straight into the preview. That is convenient for your own notes, but it means you should not paste Markdown from a source you do not trust, and the same applies to the HTML file you download.",
    ],
    [
      "Does the tool save my work between visits?",
      "No. The Markdown is held in component state only — there is no localStorage, no account and no autosave — so a refresh resets the editor to the default sample text. Use Copy to take the source, or Download HTML to take the rendered page, before you leave.",
    ],
    [
      "What does the Load Sample button do?",
      "It replaces the editor contents with a Markdown cheat sheet covering text formatting, links, ordered, unordered and task lists, inline code, a JavaScript code block, a blockquote and a horizontal rule. It is the fastest way to see exactly how each piece of syntax is rendered by this parser.",
    ],
  ],
  steps: [
    "Type or paste your Markdown into the editor pane on the left — the preview on the right updates as you type.",
    "Switch between Split, Editor and Preview with the buttons above the panes, or press Load Sample to see the supported syntax rendered.",
    "Press Copy to put the Markdown source on your clipboard, or Download HTML to save the rendered page as markdown-preview.html.",
  ],
};

export default seo;
