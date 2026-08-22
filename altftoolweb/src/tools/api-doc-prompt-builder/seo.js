const seo = {
  title: "API Doc Prompt Builder: OpenAPI 3.1 & Markdown",
  metaDescription:
    "Paste METHOD /path lines and get a doc prompt with every path parameter, RFC 9110 error cases and TODO(verify) markers instead of invented fields.",
  steps: [
    "Enter the API name and optional Base URL, then list your routes in 'Endpoints - one per line, METHOD /path with {param} or :param'.",
    "Choose Authentication (None / public, Bearer token (JWT/OAuth2), API key, HTTP Basic or Session cookie) and an Output format - OpenAPI 3.1 (YAML), Markdown reference or README quickstart - and add any Extra instruction.",
    "Check the 'Endpoints to document' count, then press Copy prompt to take the text under Generated prompt, which seeds RFC 9110 error statuses and TODO(verify) markers for anything the model cannot derive.",
  ],
  intro:
    "The API Doc Prompt Builder parses a plain endpoint list — one 'METHOD /path' per line, with {curly} or :colon path parameters — validates every method against RFC 9110, and generates a documentation prompt for OpenAPI 3.1 YAML, a Markdown reference or a README quickstart. It is built for backend developers who want AI-drafted docs that cover every parameter, realistic request/response examples, an RFC-correct error table (400, 401, 403, 404, 409, 422, 429, 500) and TODO(verify) markers wherever the model would otherwise have to guess.",
  useCases: [
    "A backend developer pastes six REST endpoints and gets a prompt that produces a Markdown reference with a parameters table and error table per endpoint.",
    "A platform team generates an OpenAPI 3.1 skeleton for an internal service, with securitySchemes matching their bearer-token auth and operationIds for every path.",
    "A maintainer preparing a public launch produces a README quickstart with one curl example per endpoint, ordered by the likeliest first call.",
  ],
  benefits: [
    [
      "Endpoint list in, structure out",
      "The tool extracts path parameters from {id} or :id placeholders and writes them into the prompt, so no documented endpoint can silently drop a parameter.",
    ],
    [
      "RFC-grounded error cases",
      "The prompt seeds each endpoint with the applicable statuses and RFC 9110 reason phrases — including 422 for validation failures and 429 for rate limits — plus a single shared error-body shape.",
    ],
    [
      "No invented details",
      "Field names, constraints and rate limits the model cannot derive from your list must be marked TODO(verify): instead of fabricated, so the draft is safe to hand to a reviewer.",
    ],
  ],
  faqs: [
    [
      "What should good API documentation include for each endpoint?",
      "Five things: a one-sentence purpose, every parameter with location, type, required flag and example, a realistic request and success response with the correct status code, the error cases with their status codes, and a note on idempotency and retry behaviour. The generated prompt demands all five for every endpoint in your list.",
    ],
    [
      "Which HTTP status codes should an API document for errors?",
      "At minimum the applicable ones from: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Content, 429 Too Many Requests and 500 Internal Server Error — reason phrases per RFC 9110 (429 comes from RFC 6585). The tool writes this list into the prompt with a one-line trigger condition for each.",
    ],
    [
      "Should I document my API in OpenAPI or Markdown?",
      "Use OpenAPI 3.1 when tooling matters — client generation, validation, hosted reference UIs — and Markdown when humans read the docs in a repo or wiki. A README quickstart with curl examples suits small public APIs. This tool generates a format-specific prompt for any of the three from the same endpoint list.",
    ],
    [
      "Which HTTP methods are idempotent?",
      "Per RFC 9110, GET, HEAD, PUT, DELETE, OPTIONS and TRACE are idempotent — repeating the request has the same effect as sending it once — while POST and PATCH are not guaranteed to be. The generated prompt asks the documentation to state this per endpoint and describe what retrying each non-idempotent call does.",
    ],
  ],
};

export default seo;
