const seo = {
  intro:
    "This tool turns a JSON object into a correctly percent-encoded URL query string, following RFC 3986's rule that everything outside the unreserved set (letters, digits, hyphen, dot, underscore, tilde) must be escaped when used as data. Developers building API calls, webhooks or tracking URLs choose how arrays and nested objects are flattened — repeated keys, brackets, indices, comma, space or pipe delimited — and whether a space becomes %20 or a form-urlencoded plus sign.",
  useCases: [
    "An API developer building a request with array filters who needs to match the server's expected format — a=1&a=2 versus a[]=1&a[]=2 versus a=1,2",
    "An engineer debugging why an ampersand or unicode character inside a search value breaks a query string, and needing the properly escaped version",
    "Someone signing OAuth 1.0a requests who needs strict RFC 3986 encoding where ! ' ( ) * become %21 %27 %28 %29 %2A",
  ],
  benefits: [
    ["Six array styles", "Repeat, brackets, indices, comma, space and pipe formats matching qs, PHP, Rails and OpenAPI 3 conventions."],
    ["Strict mode for signatures", "Optionally encodes the five characters encodeURIComponent leaves alone, as OAuth 1.0a signing requires."],
    ["Length warnings", "Flags query strings over the 2,083-character IE limit and nginx's 8 KB default request line buffer."],
  ],
  faqs: [
    [
      "Which characters must be percent-encoded in a URL query string?",
      "Everything except the RFC 3986 unreserved set — letters, digits and - . _ ~ — must be encoded when it appears as data. Reserved delimiters like & = ? # and any non-ASCII character are escaped as the percent-encoded bytes of their UTF-8 form, so an ampersand becomes %26 and é becomes %C3%A9.",
    ],
    [
      "Should a space be encoded as %20 or + in a URL?",
      "%20 is the RFC 3986 percent-encoding and is always safe in a URL; + means a space only in application/x-www-form-urlencoded data, the format HTML forms submit. If the server decodes with strict URL rules, a + arrives as a literal plus sign — so use %20 unless you know the endpoint expects form encoding.",
    ],
    [
      "How do I pass an array in a query string?",
      "There is no standard — the server decides. The most portable form is repeating the key (tags=new&tags=sale), which Express, Go, Rails and most Java frameworks parse natively; PHP needs empty brackets (tags[]=new), and OpenAPI 3 also defines comma, space and pipe delimited styles for scalar lists.",
    ],
    [
      "Is there a maximum length for a URL query string?",
      "The HTTP specification sets no limit, but implementations do: Internet Explorer capped URLs at 2,083 characters, nginx's default request-line buffer is 8 KB, and many CDNs reject longer requests with a 414 error. If your query approaches those sizes, send the data in a POST body instead.",
    ],
  ],
};

export default seo;
