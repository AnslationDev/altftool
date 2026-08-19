const seo = {
  title: "API Tester: 7 HTTP Methods, Auth, Collections",
  metaDescription:
    "GET to OPTIONS with Bearer or Basic auth, {{variable}} substitution, and status, time, size and headers on every response. Collections stay local.",
  intro:
    "API Tester is a browser-based REST client that builds and sends a request across all seven HTTP methods — GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS — then shows the status code, round-trip time in milliseconds, response size and full response headers. It supports query params, custom headers, a raw JSON body, Bearer and Basic auth, and {{variable}} placeholders that are substituted into the URL, headers and body before sending. Requests go straight from your browser to the target API, and saved collections, environment variables and the last 50 requests are kept in local storage on your own machine.",
  useCases: [
    "A backend teammate sends you a new endpoint and a token over chat and you need to confirm it returns 200 with the expected JSON before wiring it into the app — paste the URL, set Bearer auth, hit Send.",
    "You are reproducing a bug that only appears on PATCH with a specific payload, so you save the request into a collection and re-fire it after every deploy while watching the status badge and response time.",
    "You are testing the same route against staging and production by keeping a {{base}} variable in the environment tab and swapping its value instead of editing the URL each time.",
  ],
  benefits: [
    ["Collections and history that persist", "Saved requests, environment variables and the 50 most recent calls stay in your browser's local storage between sessions — no account, no sync."],
    ["Variables everywhere, not just the URL", "{{name}} placeholders are expanded in the URL, every header value and the request body at send time, so one change switches environments."],
    ["Response detail beyond the body", "Every send reports status and status text, elapsed milliseconds, payload size in B/KB/MB, and the complete response header list, with JSON pretty-printing toggleable."],
  ],
  faqs: [
    [
      "Why does my request fail with a network error when the API works in Postman?",
      "Almost always CORS. The request is made by your browser with fetch(), so the target API must return permissive Access-Control-Allow-Origin headers; desktop clients like Postman are not bound by that rule. There is no AltFTool proxy in between: credentials bypass AltFTool and travel directly from your browser to the target API you entered.",
    ],
    [
      "Do I need to set Content-Type myself when posting JSON?",
      "No. If the method is not GET or HEAD, the body is non-empty and you have not set a Content-Type header yourself, the tool adds Content-Type: application/json automatically. Set the header explicitly if you are sending form-encoded or plain-text bodies.",
    ],
    [
      "How much request history is kept, and where?",
      "The 50 most recent requests are kept, newest first, in your browser's local storage along with saved collections and environment variables. AltFTool does not receive or sync that saved history; request details are transmitted to the target API when you send them. Clearing site data or using the Clear history button removes the local copy permanently.",
    ],
    [
      "How is Basic auth sent?",
      "Choosing Basic Auth and filling in a username and password sends an Authorization: Basic header whose value is the base64 encoding of username:password. Bearer Token mode sends Authorization: Bearer followed by your token, after any {{variables}} in it are substituted.",
    ],
  ],
};

export default seo;
