const seo = {
  title: "URL Escape / Unescape — Free RFC 3986 Encoder",
  h1: "URL Escape / Unescape",
  metaDescription:
    "Escape and unescape URLs in four modes: encodeURIComponent, strict RFC 3986, encodeURI, form-body. Flags double-encoding. Free, runs in your browser.",
  intro:
    "URL Escape / Unescape percent-encodes and decodes text using the browser's own encodeURIComponent, encodeURI and decodeURIComponent, plus a strict RFC 3986 mode that additionally escapes ! ' ( ) and * as uppercase-hex UTF-8 bytes via TextEncoder, and a form-body mode that writes spaces as + the way application/x-www-form-urlencoded does. Decoding reports the exact position of any broken % escape and flags %25xx sequences, which mean the string was encoded twice. Paste a whole URL and it is split with the RFC 3986 Appendix B reference expression into scheme, host, path and fragment, with every query parameter listed raw and decoded. All of it is plain string work inside your browser tab — nothing you paste is uploaded.",
  useCases: [
    "Encode a redirect_uri or return URL before nesting it inside another link's query string, so its ? and & do not break the outer URL",
    "Work out why a UTM value arrives as caf%25C3%25A9 instead of café — the double-encoding case the decoder flags for you",
    "Escape a parameter for an OAuth 1.0a or AWS SigV4 signature base string, where ! ' ( ) and * must be percent-encoded",
  ],
  benefits: [
    [
      "Four encoding rule sets",
      "Component (encodeURIComponent), strict RFC 3986, whole-URL (encodeURI) and x-www-form-urlencoded — pick the one that matches the system you are sending to instead of guessing.",
    ],
    [
      "Double-encoding and broken escapes caught",
      "Unescape mode reports \"Yes — decode again\" when it finds %25 followed by two hex digits, and names the 1-based position of any % that is not followed by two hex digits.",
    ],
    [
      "Whole URLs unpacked",
      "Paste a full URL and see its scheme, host and path alongside a table of every query parameter with both its raw and its decoded value.",
    ],
    [
      "Nothing leaves the page",
      "Encoding, decoding and URL parsing are all JavaScript string operations in your browser — no upload, no account, no usage limit, with a 100,000-character cap per input so a pasted document cannot freeze the tab.",
    ],
  ],
  faqs: [
    [
      "What does it mean to escape and unescape a URL?",
      "Escaping (percent-encoding) rewrites any character outside the RFC 3986 unreserved set — A-Z, a-z, 0-9, hyphen, period, underscore and tilde — as a % followed by two hex digits of its UTF-8 bytes, so a space becomes %20 and é becomes %C3%A9. Unescaping is the reverse: each %XX pair is turned back into the character it stands for. You escape data before it goes into a URL and unescape it when you read it back out.",
    ],
    [
      "What is the difference between encodeURI and encodeURIComponent?",
      "encodeURIComponent escapes the delimiters : / ? # [ ] @ & = + $ , along with spaces, so it is the right choice for a single query value or path segment — that is this page's Component mode. encodeURI leaves those delimiters intact because it assumes you are passing a complete URL that still has to work, which is the Whole URL mode. Encoding a full URL with encodeURIComponent produces an unusable string; encoding a query value with encodeURI leaves & and = in place and breaks the parameter.",
    ],
    [
      "Why does encodeURIComponent leave ! ' ( ) and * unescaped?",
      "Because those five characters counted as unreserved under the older RFC 2396 that JavaScript's function was written against, and RFC 3986 later dropped them from the unreserved set. Most servers cope, but signature schemes such as OAuth 1.0a and AWS SigV4 require them escaped — that is exactly what the Strict RFC 3986 mode here does, encoding each one to its UTF-8 bytes with uppercase hex.",
    ],
    [
      "When does a space become + instead of %20?",
      "Only in application/x-www-form-urlencoded data — HTML form submissions and query strings built by URLSearchParams. Everywhere else in a URI, including the path and fragment, a space is %20 and a + is a literal plus sign. Use the Form body mode for form data; decoding a path with form rules would silently turn real plus signs into spaces.",
    ],
    [
      "What does %2520 mean in a URL?",
      "It means the string was percent-encoded twice. A space becomes %20 on the first pass, then that % is itself escaped to %25 on the second, giving %2520. Unescape mode detects this pattern and shows \"Yes — decode again\": one pass gets you back to %20, a second pass gets you the original space.",
    ],
    [
      "Why does my URL fail to decode?",
      "There are two causes and the tool names which one you hit. Either a % is not followed by two hex digits — the error points at the 1-based position of the bad escape, and a literal percent sign has to be written %25 — or the escapes are not valid UTF-8, for example a %C3 with no continuation byte after it.",
    ],
    [
      "Can I decode a whole URL and see its query parameters?",
      "Yes. Paste any URL into either box and it is split with the RFC 3986 Appendix B reference expression into scheme, host, path, query and fragment, then each parameter is listed with its key, decoded value and raw form. Parameters are decoded with form rules, so a + inside a value reads as a space.",
    ],
    [
      "Is the URL escape / unescape tool free, and is my data uploaded?",
      "Yes, it is free with no signup and no usage limit, and nothing you paste is uploaded. Every operation — escaping, unescaping and URL parsing — runs as JavaScript in your own browser with no server request; the only constraint is 100,000 characters per input.",
    ],
  ],
  steps: [
    "Choose Escape or Unescape, then paste your text or encoded URL into the box.",
    "Pick the rule set — Component, Strict RFC 3986, Whole URL or Form body — to match where the string is going.",
    "Read the result with its escape count, size growth and double-encoding flag, then click Copy result (or Swap to run it back the other way).",
  ],
};

export default seo;
