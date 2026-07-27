const seo = {
  intro:
    "Percent-encoding is the RFC 3986 rule that any character outside the unreserved set — A-Z, a-z, 0-9, hyphen, period, underscore and tilde — must be written as a % followed by two hex digits of its UTF-8 bytes before it can travel inside a URL. This tool escapes and unescapes text under four different rule sets (component, strict RFC 3986, whole-URL, and form body), and breaks any URL you paste into its scheme, host, path and decoded query parameters. It is for developers debugging redirects, callback URLs, tracking links and signed requests.",
  useCases: [
    "Encode a redirect_uri before putting it inside another URL's query string, so the nested ? and & do not break the outer link",
    "Find out why a UTM value arrives as caf%25C3%25A9 instead of café — the classic double-encoding bug",
    "Decode a webhook URL to read what a partner actually sent in each query parameter",
  ],
  benefits: [
    ["Four rule sets, one page", "encodeURIComponent, strict RFC 3986, encodeURI and form-body encoding, so you can match the system you are talking to."],
    ["Double-encoding detection", "%25 followed by two hex digits is flagged, because that means the string was escaped twice."],
    ["Query parameters unpacked", "Paste a whole URL and see every parameter with its raw and decoded value in a table."],
  ],
  faqs: [
    [
      "What is the difference between encodeURI and encodeURIComponent?",
      "encodeURIComponent escapes the delimiters : / ? # [ ] @ & = + $ , as well as spaces, so it is the right choice for a single query value or path segment. encodeURI leaves those delimiters intact because it assumes you are passing a complete URL that still needs to work. Encoding a whole URL with encodeURIComponent gives you an unusable string; encoding a query value with encodeURI leaves & and = in place and breaks the parameter.",
    ],
    [
      "Why does encodeURIComponent leave ! ' ( ) and * unescaped?",
      "Because those five characters were unreserved under the older RFC 2396 that JavaScript's function was written against, and RFC 3986 later dropped them from the unreserved set. Most servers cope, but signature schemes such as OAuth 1.0a and AWS SigV4 require them escaped — that is what the strict RFC 3986 mode on this page does.",
    ],
    [
      "When does a space become + instead of %20?",
      "Only in application/x-www-form-urlencoded data — HTML form submissions and the query string produced by URLSearchParams. Everywhere else in a URI, including the path and fragment, a space is %20 and a + is a literal plus sign. Decoding a path with the form rules will silently turn real plus signs into spaces.",
    ],
    [
      "What does %25 mean and why do I keep seeing it?",
      "%25 is the escaped form of the percent sign itself, because % starts every escape sequence and cannot appear raw. Seeing %2520 in a URL means the string was encoded twice: %20 became %2520 on the second pass. Decoding once leaves %20, decoding twice gets you the original space.",
    ],
  ],
};

export default seo;
