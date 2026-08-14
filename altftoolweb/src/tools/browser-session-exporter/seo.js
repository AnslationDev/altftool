const seo = {
  title: "Tab List to Markdown, HTML or JSON Link Exporter",
  metaDescription:
    "Pulls every http and https link out of pasted text, drops duplicates, and exports a Markdown bullet list, an HTML anchor list or a JSON array.",
  intro:
    "Browser Session Exporter pulls every http and https link out of a block of pasted text — a tab list, a bookmark export, a chat log, a research dump — removes duplicates, and rewrites the result as a Markdown link list, an HTML <ul> of anchors, or a JSON array. It names each link from the label written before the URL on the same line, and falls back to the bare hostname with www. stripped when there is no label. The extracted list, the formatted code and the copy or download button are all there in one pass, so a messy paste becomes a tidy index without hand-editing.",
  useCases: [
    "You have 30 tabs open at the end of a research session, copy the tab list out, and want a Markdown bullet list of links to drop straight into your notes.",
    "Someone sent you a long Slack thread full of reference URLs and you need a deduplicated JSON array of {url, title, domain} to feed into a script.",
    "You exported browser bookmarks as text and want a plain HTML unordered list of anchors to paste into an internal wiki page or a resources section.",
  ],
  benefits: [
    ["Reads links out of any surrounding text", "It scans for http and https patterns anywhere in the paste, so you do not have to clean the text into one-URL-per-line first."],
    ["Keeps your labels instead of showing raw URLs", "Text sitting before a URL on the same line becomes the link title when it is under 50 characters, so \"NextJS Guide: https://…\" exports as a named link, not a bare address."],
    ["One paste, three output shapes", "The same parsed list renders as Markdown, HTML list markup, or structured JSON, so notes, web pages and scripts are all served from one run."],
  ],
  faqs: [
    [
      "How do I turn a list of open browser tabs into a Markdown list of links?",
      "Copy the tab titles and URLs into the input box and choose the Markdown output — each unique link comes back as a `- [Title](URL)` bullet. Any text preceding a URL on the same line becomes the title.",
    ],
    [
      "Does it remove duplicate URLs?",
      "Yes. Identical URLs are collapsed to a single entry before formatting, and the counter above the extracted list shows how many unique links were found. Note that two addresses differing only by a trailing slash or a tracking parameter count as separate links.",
    ],
    [
      "What formats can I export to?",
      "Three: a Markdown bullet list, an HTML unordered list of anchor tags with target=\"_blank\", and a JSON array where every entry carries url, title and domain. Each can be copied to the clipboard or downloaded as a .md, .html or .json file.",
    ],
    [
      "Why did it say no links were found?",
      "The parser only matches addresses beginning with http:// or https://, so bare hostnames like example.com, ftp:// links, and file paths are skipped. Add the scheme to the front of those lines and run it again.",
    ],
  ],
};

export default seo;
