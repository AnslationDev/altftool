const seo = {
  title: "Map API Endpoint Usage from Logs, cURL and fetch",
  metaDescription:
    "Paste access logs, cURL, fetch or Express routes: IDs collapse to :id and each endpoint gets request counts, error rate, p95 and a risk grade.",
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
  steps: [
    "Paste into the Request Data box — its placeholder reads \"Paste access logs, cURL commands, fetch calls, or Axios requests…\" and it wants one request, log line, or code statement per line. Sample loads the built-in example log and Clear empties the box; the strip underneath counts the lines and flags how many were unrecognized.",
    "Analysis runs live as you type, so there is no run button: the tiles across the top give Requests, Endpoints, Methods and Errors, and Mapped Endpoints lists one card per method plus normalized path with a Low, Medium or High risk badge, the request count, the ok and error counts and the error rate. Narrow the list with the Filter paths… box, the All methods and All risks dropdowns, the Errors only toggle and the sort menu (Most requests, Highest error rate, Slowest p95, Path A–Z), and click View details for error rate, average, p95 and min–max latency, the status-code counts and recommendations.",
    "Use Copy Summary to copy one \"METHOD path — N requests\" line per visible endpoint (the button then reads Copied), JSON to download api-endpoint-usage.json, or Export CSV to download api-endpoint-usage.csv with a column each for method, normalized_path, requests, successful, errors, error_rate_percent, unknown_status, the four latency figures, risk, status_distribution and recommendations. All three buttons stay disabled until at least one endpoint is visible.",
  ],
};

export default seo;
