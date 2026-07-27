const seo = {
  intro:
    "This explorer is a searchable reference of standard HTTP request and response headers, showing each header's direction, meaning, defining specification and a real example value. Semantics follow RFC 9110 (HTTP Semantics), RFC 9111 (Caching), RFC 6265 (Cookies) and the WHATWG Fetch Standard for CORS. It is built for backend and frontend developers who need to confirm what a header does — and which side sends it — without digging through the RFC text.",
  useCases: [
    "Debugging a CORS failure by checking exactly which Access-Control-* headers the server must return for a preflight OPTIONS request",
    "Choosing the right Cache-Control directives and validators (ETag vs Last-Modified) for a CDN-fronted API",
    "Reviewing security headers (HSTS, CSP, X-Content-Type-Options, COOP/COEP) before a production launch",
  ],
  benefits: [
    ["Direction shown", "Every header is labelled request, response or both, so you know which side of the wire sends it."],
    ["Spec citations", "Each entry names the defining RFC or standard section, e.g. Cache-Control in RFC 9111 §5.2."],
    ["Real examples", "Copy-ready example values, including multi-attribute headers like Set-Cookie and CSP."],
  ],
  faqs: [
    [
      "What is the difference between a request header and a response header?",
      "A request header is sent by the client to the server (like Accept, Authorization or Cookie), while a response header travels the other way (like Set-Cookie, Location or Cache-Control on a response). Some headers, such as Content-Type and Content-Length, describe the message body and legitimately appear in both directions.",
    ],
    [
      "Which headers do I need for CORS to work?",
      "At minimum the server must return Access-Control-Allow-Origin matching the requesting Origin. Preflighted requests (non-simple methods or headers) also need Access-Control-Allow-Methods and Access-Control-Allow-Headers on the OPTIONS response, plus Access-Control-Allow-Credentials: true when cookies are involved — and in that case the allowed origin cannot be the * wildcard.",
    ],
    [
      "What is the difference between ETag and Last-Modified?",
      "Both are cache validators, but ETag is an opaque fingerprint of the exact representation while Last-Modified is a timestamp with one-second resolution. ETag is the stronger validator: it detects changes within the same second and content that varies without a date change, which is why RFC 9110 recommends servers send both and clients prefer If-None-Match over If-Modified-Since.",
    ],
    [
      "Why is the Referer header misspelled?",
      "The misspelling of \"referrer\" was in the original HTTP specification (RFC 1945, 1996) and was kept for compatibility ever since, so the header name is officially Referer. The newer Referrer-Policy header, defined much later, uses the correct spelling.",
    ],
  ],
};

export default seo;
