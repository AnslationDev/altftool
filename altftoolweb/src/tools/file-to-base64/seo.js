const seo = {
  title: "File to Base64 Converter with Data URL & CSS",
  metaDescription:
    "Encode a local file (up to 32 MB) to Base64 or a full data: URL in your browser — nothing uploads — with HTML, CSS, Markdown and JSON snippets.",
  steps: [
    "Drag a file into the drop zone or pick one under \"Choose a file to encode\" — up to 32 MB, read in this tab with the browser File API.",
    "Toggle \"Include the data: URL prefix\", \"URL-safe alphabet (- and _)\", \"Keep = padding\" and \"Wrap at 76 characters\" to shape the encoding.",
    "Switch the Output tab between Data URL, HTML, CSS, Markdown and JSON, then press Copy output — it always copies the whole string, not just the 4,000-character preview.",
  ],
  intro:
    "File to Base64 converts any local file into a Base64 string or a complete data: URL, using the RFC 4648 alphabet where every 3 bytes become 4 characters. It is for developers embedding small assets — icons, fonts, test fixtures — directly into HTML, CSS, JSON or an API payload without a separate file request. The file is read in your browser with the File API, so nothing is uploaded, and the tool also reports the exact size increase (a constant 4/3, about 33.3%) before you commit to inlining.",
  useCases: [
    "Inline a 2 KB SVG or favicon into a stylesheet as background-image: url(\"data:image/svg+xml;base64,…\").",
    "Paste a small PNG into a JSON request body for an API that accepts Base64 image fields.",
    "Produce a URL-safe Base64 string for a query parameter or filename, where + and / would break.",
  ],
  benefits: [
    ["Exact size maths", "Shows encoded length as 4 x ceil(bytes / 3) and the resulting percentage overhead."],
    ["Four paste-ready formats", "Emits the data URL plus HTML, CSS, Markdown and JSON snippets around it."],
    ["Standard or URL-safe", "Switch between the standard alphabet and the - / _ variant, with or without = padding."],
  ],
  faqs: [
    [
      "How much bigger does Base64 make a file?",
      "Exactly 4 characters for every 3 bytes, so about 33.3% larger — a 1,024-byte file becomes 1,368 Base64 characters. Add roughly 20-30 more characters for the data: URL prefix, and more again if you wrap lines at 76 characters.",
    ],
    [
      "What is a data URL and when should I use one?",
      "A data URL is data:<mime>;base64,<payload> (RFC 2397) and embeds the file directly in your markup. Use it for assets under about 10 KB — icons, small fonts, one-pixel images — where saving a round trip beats the 33% size penalty and the loss of separate caching.",
    ],
    [
      "Is my file uploaded to a server?",
      "No. The file is read into memory in your browser tab with the File API and encoded in JavaScript there. No network request is made, which is why the tool also works offline once the page has loaded.",
    ],
    [
      "What is URL-safe Base64?",
      "It is the RFC 4648 §5 variant that replaces + with - and / with _, so the string can sit inside a URL, a filename or a JWT without escaping. Padding = characters are usually dropped too; this tool lets you toggle both.",
    ],
  ],
};

export default seo;
