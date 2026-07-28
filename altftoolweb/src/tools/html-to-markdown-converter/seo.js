const seo = {
  title: "HTML to Markdown Converter — Free, Tables & Code",
  h1: "HTML to Markdown Converter",
  metaDescription:
    "Paste HTML or upload an .html file and get clean Markdown — GFM tables, fenced code with language tags, front matter. Free — runs in your browser.",
  intro:
    "The HTML to Markdown Converter runs Turndown 7 with the turndown-plugin-gfm extension entirely in your browser — nothing is uploaded and no account is needed. Your markup is first parsed by the browser's native DOMParser and cleaned: script, noscript, iframe, object, embed, style and stylesheet-link elements are removed, HTML comments are deleted in a TreeWalker pass, and every on* event-handler attribute is stripped (class, style and id go too, unless you turn that toggle off). Turndown then walks the cleaned DOM and writes Markdown — GFM pipe tables for &lt;table&gt;, and a custom rule that reads the language-* class off a &lt;pre&gt;&lt;code&gt; pair so fenced blocks keep their language tag. Conversion re-runs 250 ms after any edit, and the preview tab renders the result with react-markdown and remark-gfm.",
  useCases: [
    "Move article or CMS-exported HTML into a Markdown docs site or static-site generator, with YAML front matter added on the way out.",
    "Turn a scraped or saved web page into a clean README or documentation page without hand-rebuilding its tables and code blocks.",
    "Strip rich-text HTML from an email, Google Doc or WYSIWYG editor down to plain Markdown for notes, issue trackers or LLM prompts.",
  ],
  benefits: [
    [
      "Tables and code survive the conversion",
      "The turndown-plugin-gfm extension writes &lt;table&gt; markup as GitHub-flavored pipe tables, and a custom rule pulls the language name out of class=\"language-js\" so fenced blocks come out as ```js rather than untagged.",
    ],
    [
      "Sanitised before it converts",
      "Scripts, noscript, iframes, objects, embeds, stylesheets, HTML comments and every on* event-handler attribute are removed from the parsed DOM first. You can inspect exactly what was kept in the Clean HTML tab.",
    ],
    [
      "The output style is yours",
      "Choose ATX or Setext headings, inline or reference links, -, * or + bullets, ``` or ~~~ fences, hard line breaks on or off, and whether links and images are kept or flattened to text.",
    ],
    [
      "Nothing leaves your device",
      "Parsing, conversion, preview and the .md download all run client-side — uploaded files are read with the File API and the download is built from a local Blob. There is no server round-trip, no signup and no usage limit.",
    ],
  ],
  faqs: [
    [
      "How do I convert HTML to Markdown?",
      "Paste your HTML into the input box, or upload an .html, .htm or .txt file. Conversion runs automatically 250 ms after you stop typing, so the Markdown appears without pressing anything — then copy it or click Download .md. There is also a Convert Now button if you want to force a re-run.",
    ],
    [
      "Does it keep HTML tables as Markdown tables?",
      "Yes. The GitHub tables toggle is on by default and applies turndown-plugin-gfm, which converts &lt;table&gt; into a GFM pipe table with a header separator row. Turn that toggle off and the plugin is not loaded, so table markup collapses to its plain text content — leave it on unless you specifically want that.",
    ],
    [
      "Is my HTML uploaded to a server?",
      "No. The DOMParser clean-up pass and the Turndown conversion both run in your browser, uploaded files are read locally with the File API's text() method, and the .md download is generated from an in-memory Blob. Your markup never reaches AltFTool's servers.",
    ],
    [
      "Can I paste a whole HTML page with doctype, head and scripts?",
      "Yes. The parser keeps only the &lt;body&gt; content, so the doctype, &lt;head&gt;, meta tags and inline &lt;style&gt; blocks never reach the Markdown at all. Scripts, iframes and embeds are removed on top of that, and event-handler attributes like onclick are always stripped.",
    ],
    [
      "Will fenced code blocks keep their language?",
      "Yes, when the source uses the standard highlight convention. The converter matches class=\"language-xxx\" on a &lt;code&gt; element inside &lt;pre&gt; and writes that name after the opening fence, so &lt;code class=\"language-js\"&gt; becomes ```js. If no language class is present, you get a plain fence with the code intact.",
    ],
    [
      "Can it add front matter for Hugo, Jekyll or Astro?",
      "Yes — switch on Add front matter and the output is prefixed with a YAML block containing a title taken from the document's first &lt;h1&gt;, a description field, and today's date formatted as YYYY-MM-DD. The preview tab hides the block so you can still read the rendered document.",
    ],
    [
      "Is there a file size limit or a signup?",
      "No limit is enforced and no account is required — the only ceiling is your browser's memory, since everything is processed in the page. Uploads accept .html, .htm and .txt, and the downloaded file is named after the file you uploaded, with a .md extension.",
    ],
    [
      "Can I convert Markdown back into HTML here?",
      "No — this converter is one-directional, HTML in and Markdown out. AltFTool has a separate Markdown to HTML converter for the reverse trip; this page's Preview tab only renders the Markdown for reading, it does not export HTML.",
    ],
  ],
  steps: [
    "Paste HTML into the input box, upload an .html file, or click Load Sample to try it with a realistic document.",
    "Adjust the conversion settings — heading style, bullet marker, code fence, GFM tables, front matter, cleanup toggles — and the Markdown regenerates automatically.",
    "Check the result in the Markdown, Preview or Clean HTML tab, then copy it to your clipboard or download it as a .md file.",
  ],
};

export default seo;
