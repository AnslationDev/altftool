const seo = {
  title: "HTTP Status Code Explainer: 404, 429, 502 & More",
  steps: [
    "Type a number into the Enter HTTP Status Code (e.g., 404) box, or click a quick code such as 200, 301, 403 or 503.",
    "Press Explain, or pick a card from the grid of common codes — 204, 307, 409, 418, 429 and 502 among them.",
    "The panel names the code and its short title, such as 404 — Not Found, with a 4xx Client Error class badge and a plain-language explanation.",
  ],
  intro:
    "This explainer looks up any HTTP response status code and tells you what it means, which of the five RFC 9110 classes it belongs to — 1xx informational, 2xx success, 3xx redirection, 4xx client error, 5xx server error — and, for the common failures, what usually fixes it. Type a number such as 404 or click one of the quick codes like 200, 301, 403 or 503, and the panel explains the code in plain language. It is aimed at developers, QA testers and site owners staring at a status line in a browser devtools panel, a server log or an API response.",
  useCases: [
    "Your API integration is returning 409 and you need to know whether the fix belongs on your side or the server's before you file a bug",
    "A crawl report lists a mix of 301, 302 and 307 responses and you need to decide which redirects should be made permanent",
    "Your monitoring is alerting on 502 and 504 from the same endpoint and you want to tell an upstream failure apart from an upstream timeout",
  ],
  benefits: [
    ["Class first, then detail", "Every code is labelled with its 1xx–5xx family, so you immediately know whether to look at your request or at the server."],
    ["Fixes, not just definitions", "Common failure codes come with concrete next steps — respect Retry-After and back off exponentially for 429, check upstream health or raise the timeout for 504."],
    ["Any code, not just a fixed list", "Enter any number and the class is still derived from its range, so an unusual or vendor-specific code is not a dead end."],
  ],
  faqs: [
    [
      "What do the HTTP status code ranges mean?",
      "There are five classes, decided by the first digit: 1xx informational (the request was received and processing continues), 2xx success, 3xx redirection, 4xx client error (the request was faulty), and 5xx server error (the request was fine but the server failed). Anything outside 100–599 is not a valid HTTP status.",
    ],
    [
      "What is the difference between 301, 302 and 307?",
      "301 Moved Permanently says the resource has a new URI and callers should update their links; 302 Found and 307 Temporary Redirect both say the move is temporary and the original URI should keep being used. The practical distinction is that 307 preserves the original request method and body, whereas 302 is widely implemented as switching a POST to a GET.",
    ],
    [
      "What should I do when I get a 429?",
      "Back off and retry later, using exponential backoff and honouring the Retry-After header if the response includes one. 429 Too Many Requests means you exceeded a rate limit in a given window, so retrying immediately usually extends the block rather than clearing it.",
    ],
    [
      "Is 418 I'm a Teapot a real status code?",
      "It is a real registered code but a deliberate joke, originating in the 1998 Hyper Text Coffee Pot Control Protocol April Fools RFC. It means the server refuses to brew coffee because it is a teapot; no production API should return it, and there is nothing to fix if you see it.",
    ],
  ],
};

export default seo;
