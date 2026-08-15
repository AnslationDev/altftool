const seo = {
  title: "nginx log_format Builder with JSON & Sample Preview",
  metaDescription:
    "Pick nginx variables in order and get the log_format and access_log directives plus a realistic sample line — combined-style or JSON via escape=json.",
  steps: [
    "Set a Format name and an Output style — 'Plain line (combined-style)' or 'JSON object per line', which always uses escape=json.",
    "Tick variables such as $request_time and $upstream_response_time (click order sets column order), or press Load nginx's \"combined\" variable set.",
    "Copy the log_format directive, access_log line and sample log entry with Copy directives, then declare log_format in your http block.",
  ],
  intro:
    "This builder composes a custom nginx log_format directive from a catalogue of 30 real nginx variables — request timing, upstream response time, TLS details, request IDs and the classic combined-format fields — and previews a realistic sample log line before you deploy it. It supports both plain combined-style lines and one-JSON-object-per-line output using log_format's escape=json parameter from ngx_http_log_module.",
  useCases: [
    "An engineer adding $request_time and $upstream_response_time to the combined format to find slow endpoints without new tooling",
    "A team switching nginx access logs to JSON lines so Loki, Elasticsearch or CloudWatch can parse fields without grok patterns",
    "Debugging which upstream served a request by logging $upstream_addr and $upstream_status alongside $request_id",
  ],
  benefits: [
    ["Sample line preview", "Every change re-renders a realistic example log entry, so you see the exact shape before touching production."],
    ["Correct escaping", "JSON output always emits escape=json (nginx 1.11.8+), keeping quotes in user agents from breaking your parser."],
    ["Combined-set shortcut", "One click loads the exact eight variables of nginx's built-in combined format as a starting point."],
  ],
  faqs: [
    [
      "What is the default nginx access log format?",
      "The predefined \"combined\" format: $remote_addr - $remote_user [$time_local] \"$request\" $status $body_bytes_sent \"$http_referer\" \"$http_user_agent\". You cannot redefine the name combined, so custom formats need their own name declared with log_format in the http block.",
    ],
    [
      "How do I make nginx log in JSON format?",
      "Declare a log_format with escape=json whose template is a JSON object, e.g. log_format json_logs escape=json '{\"remote_addr\":\"$remote_addr\",...}';, then reference it from access_log. The escape=json parameter, available since nginx 1.11.8, escapes quotes and control characters so every line stays valid JSON.",
    ],
    [
      "How do I log request processing time in nginx?",
      "Add $request_time to your log_format — it records the full time nginx spent on the request in seconds with millisecond resolution. Log $upstream_response_time next to it to separate backend latency from client transfer time; a large gap between the two usually means slow clients.",
    ],
    [
      "Where should the log_format directive go in nginx config?",
      "log_format is only valid in the http block and must be defined before (or at a higher level than) the access_log directives that use it. access_log itself can then appear in http, server or location blocks to apply the format at different scopes.",
    ],
  ],
};

export default seo;
