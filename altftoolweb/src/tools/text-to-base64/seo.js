const seo = {
  intro:
    "Base64 is the RFC 4648 encoding that rewrites arbitrary bytes as 64 printable characters so they survive channels that only accept text — email bodies, JSON fields, data URIs and HTTP headers. This tool UTF-8 encodes what you type, converts it with either the standard alphabet (A–Z a–z 0–9 + /) or the URL-safe alphabet (- and _ instead), and decodes in the other direction. It runs entirely in the browser, so nothing is uploaded.",
  useCases: [
    "Turn a small SVG or config snippet into a data: URI you can paste straight into CSS or HTML",
    "Decode the payload segment of a JWT, which uses base64url without padding, to read its claims",
    "Build an HTTP Basic auth header by encoding user:password before sending it in a test request",
  ],
  benefits: [
    ["Both RFC 4648 alphabets", "Standard +/ for MIME and data URIs, URL-safe -_ for tokens and query strings."],
    ["Padding and wrapping control", "Drop the = padding for JWT-style output, or wrap at 76 characters for MIME."],
    ["Nothing leaves the browser", "Encoding and decoding happen locally, so secrets are never sent to a server."],
  ],
  faqs: [
    [
      "How much bigger does Base64 make my data?",
      "About 33% bigger: every 3 bytes of input become 4 output characters, plus up to 2 padding characters. So 3,000 bytes encode to 4,000 characters, and a 1 MB file becomes roughly 1.37 MB once you include line breaks.",
    ],
    [
      "What is the difference between Base64 and base64url?",
      "Only two characters. Standard Base64 (RFC 4648 §4) uses + and / for values 62 and 63; base64url (§5) uses - and _ instead, because + and / have to be percent-escaped inside URLs and filenames. base64url also usually drops the trailing = padding, which is why JWT segments end without it.",
    ],
    [
      "Is Base64 encryption?",
      "No. Base64 is a reversible encoding with no key, so anyone can decode it in a second — exactly what this page does. Use it to make bytes transport-safe, never to hide a password, token or personal data.",
    ],
    [
      "Why does my Base64 string fail to decode?",
      "Almost always length or alphabet. A valid Base64 body's length modulo 4 can be 0, 2 or 3 — never 1, so a single leftover character means the string was truncated. The other common causes are a stray character outside the 64-symbol alphabet, mixing +/ with -_, or padding that appears somewhere other than the very end.",
    ],
  ],
};

export default seo;
