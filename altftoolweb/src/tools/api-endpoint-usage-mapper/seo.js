const seo = {
  intro:
    "The API Endpoint Usage Mapper turns pasted access logs, cURL commands, fetch/Axios calls and Express-style route definitions into a normalized endpoint inventory, collapsing concrete IDs (numbers, UUIDs, prefixed keys like ord_91) into :id so /api/users/42 and /api/users/73 count as one endpoint. For each method + path it reports request count, success and error counts, error rate, average, min/max and p95 latency, and a Low/Medium/High risk grade. Backend engineers, SREs and API owners use it to see which routes actually carry traffic before they refactor, version or deprecate anything.",
  useCases: [
    "You inherited a service with 60 declared routes and want to know which ones real traffic touches — paste a day of access log lines and read the request count per normalized path before deprecating anything.",
    "A release went out and latency complaints started; you paste the log slice and sort by slowest p95 to find the one endpoint whose 95th percentile crossed 500 ms.",
    "Before writing an OpenAPI spec for an undocumented internal API, you paste the frontend's fetch and Axios calls plus a cURL scratch file and export the deduplicated method + path list as CSV.",
  ],
  benefits: [
    ["Path normalization, not raw counting", "Numeric IDs, UUIDs and Stripe-style prefixed keys collapse to :id, so thousands of log lines become a handful of real endpoints."],
    ["Mixed input in one paste", "Access logs, cURL, fetch, axios.get and app.get/router.post route definitions are all parsed line by line in the same textarea."],
    ["Risk grading with numbers behind it", "Each endpoint is scored High, Medium or Low from its measured error rate and p95 latency, with a stated reason rather than a colour alone."],
  ],
  faqs: [
    [
      "How does the tool decide an endpoint is high risk?",
      "An endpoint is graded High risk when its error rate reaches 20% or its p95 latency reaches 1000 ms. Medium starts at a 5% error rate or 500 ms p95; anything below both is Low. The thresholds are applied per normalized endpoint, not across the whole sample.",
    ],
    [
      "What log and code formats can I paste?",
      "Anything line-oriented that contains an HTTP method and a URL or path: common access-log lines, cURL commands, fetch() and axios.get/post/put/patch/delete calls, and Express-style app.get or router.post route definitions. Lines with no recognizable URL are counted as unrecognized and shown in the footer.",
    ],
    [
      "How are two requests treated as the same endpoint?",
      "Path segments that look like identifiers are replaced with :id before grouping — pure digits, UUIDs, hex strings of 12 or more characters, and prefixed keys such as ord_91 or cus_a8f2. The key is then the HTTP method plus that normalized path, so GET and DELETE on the same route stay separate rows.",
    ],
    [
      "Where do the latency and status numbers come from?",
      "They are read out of your own text: a trailing number followed by ms becomes the latency sample, and a standalone 3-digit 1xx–5xx code becomes the status. Statuses of 400 and above count as errors. If your log lines carry neither, the endpoint still appears with its request count and the tool notes that status and latency were missing.",
    ],
  ],
};

export default seo;
