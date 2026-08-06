const seo = {
  intro:
    "Base64 is the RFC 4648 encoding that rewrites arbitrary bytes as 64 printable characters so they survive channels that only accept text — email bodies, JSON fields, data URIs and HTTP headers. This tool UTF-8 encodes what you type and converts it with the standard alphabet (A–Z a–z 0–9 + /), always = padded and emitted as one unbroken line, while Base64 -> Text decodes in the other direction. Two more one-click actions sit beside them, Text -> Hex and Text Stats, and everything runs in the browser, so nothing is uploaded.",
  useCases: [
    "Encode a small SVG or config snippet with Text -> Base64, then paste the result after your own data:image/svg+xml;base64, prefix in CSS or HTML",
    "Decode a Base64 blob you found in a log line or a config file with Base64 -> Text, then press Use output to push the decoded string back into the input box for a second pass",
    "Build an HTTP Basic auth header by encoding user:password before sending it in a test request",
  ],
  benefits: [
    ["Four conversions, one click each", "Text -> Base64, Base64 -> Text, Text -> Hex and Text Stats all rerun as you type, with a live character count above both panels."],
    ["Copy, download or keep the run", "Copy puts the output on the clipboard, Download saves it as text-to-base64-textToBase64.txt (slug plus active action), and Save run keeps the six most recent input and output snapshots in this browser."],
    ["Nothing leaves the browser", "Encoding and decoding happen locally, so secrets are never sent to a server."],
  ],
  faqs: [
    [
      "How much bigger does Base64 make my data?",
      "About 33% bigger: every 3 bytes of input become 4 output characters, plus up to 2 padding characters. So 3,000 bytes encode to 4,000 characters. This page emits the result as a single unbroken line and never inserts MIME line breaks, so the character count above the output panel is exactly that 4/3 ratio plus padding.",
    ],
    [
      "What is the difference between Base64 and base64url?",
      "Only two characters. Standard Base64 (RFC 4648 §4) uses + and / for values 62 and 63; base64url (§5) uses - and _ instead, because + and / have to be percent-escaped inside URLs and filenames. base64url also usually drops the trailing = padding, which is why JWT segments end without it. Text -> Base64 on this page always emits the standard alphabet with padding — for the URL-safe form, use the Base64 URL Encoder or Base64 URL Converter tools.",
    ],
    [
      "Is Base64 encryption?",
      "No. Base64 is a reversible encoding with no key, so anyone can decode it in a second — exactly what this page does. Use it to make bytes transport-safe, never to hide a password, token or personal data.",
    ],
    [
      "Why does my Base64 string fail to decode?",
      "Almost always the alphabet. Base64 -> Text trims the string and strips a leading data: prefix, then hands it to the browser's decoder without translating URL-safe characters, so a token containing - or _ fails here even though it is valid base64url. A stray character outside the 64-symbol alphabet, or a truncated body whose length modulo 4 is 1, fails the same way. The output panel then shows Error: followed by the browser's own message, and the panel heading switches to Needs attention.",
    ],
  ],
};

export default seo;
