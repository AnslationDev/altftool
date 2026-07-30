const seo = {
  title: "cURL Converter — cURL to fetch, Axios, Python",
  h1: "cURL Converter — cURL to fetch, Axios & Python",
  metaDescription:
    "Paste a curl command and get working fetch, Axios, or Python requests code. Parses -X, -H, -d, -u and -L the way curl does. Nothing leaves your browser.",
  intro:
    "This cURL converter rewrites a curl command line as working HTTP code in three targets: JavaScript fetch, Axios, and Python requests. It runs a POSIX-style shell tokenizer over the command first — single quotes fully literal, double quotes with backslash escapes, backslash line continuations — then parses curl's flags and applies curl's own documented defaults: GET unless -X says otherwise or -d supplies a body (which makes it POST), repeated -d values joined with &, and application/x-www-form-urlencoded when -d runs without a Content-Type. Parsing and code generation are plain JavaScript executing in the page with no network request, so the tokens and API keys inside a pasted command never leave your device.",
  useCases: [
    "Turning the curl snippet in an API's quickstart docs into the fetch call your front end actually needs",
    "Replaying a request copied out of Chrome DevTools with \"Copy as cURL\" from a Python script",
    "Converting a POST with a JSON body into Axios without hand-transcribing every header and dropping one",
  ],
  benefits: [
    [
      "Real shell parsing, not regex",
      "Quoted headers, escaped quotes inside a JSON body, and multi-line commands with trailing backslashes all tokenize correctly before a line of code is generated.",
    ],
    [
      "curl's defaults preserved",
      "Method inference, the form Content-Type that -d adds, and redirect behaviour match what curl would actually do — Axios gets maxRedirects: 0 and requests gets allow_redirects=False unless the command carries -L.",
    ],
    [
      "Three targets from one paste",
      "fetch, Axios, and Python requests, with -u Basic auth rendered idiomatically in each: a btoa() Authorization header for fetch, an auth object for Axios, an auth tuple for requests.",
    ],
    [
      "Nothing is uploaded",
      "Conversion happens in the page itself, so a command containing a bearer token or API key is never sent to a server.",
    ],
  ],
  faqs: [
    [
      "How do I convert a curl command to code?",
      "Paste the command into the box and pick a target — JavaScript fetch, Axios, or Python requests. The converter tokenizes the command the way a shell would, reads curl's flags (-X, -H, -d, --data-raw, --data-urlencode, -u, -b, -A, -e, -L, -k, --compressed and more), and prints copy-ready code. A summary above the output shows the detected method, URL, header count, body type, Content-Type, and whether Basic auth was found, so you can sanity-check the parse before copying. It's free, needs no signup, and runs entirely in your browser.",
    ],
    [
      "Can this curl converter turn curl into Python requests?",
      "Yes — Python requests is one of the three output targets. A JSON body becomes a Python dict passed as json=payload, with true/false/null rewritten to True/False/None; any other body becomes data=payload; -u becomes an auth=(\"user\", \"pass\") tuple; -k adds verify=False; and allow_redirects=False is included unless the command has -L. The generated snippet ends with raise_for_status() so a failed request doesn't pass silently.",
    ],
    [
      "Why does curl send a POST when I only used -d?",
      "Because -d/--data implies POST. curl's default method is GET, but supplying a body with -d switches it to POST unless you override it with -X. -d also sets Content-Type: application/x-www-form-urlencoded when you haven't set one yourself — which is why an API expecting JSON rejects the request until you add -H 'Content-Type: application/json'. Repeated -d flags are joined with & rather than replacing each other, and the converter reproduces all of this.",
    ],
    [
      "Does curl follow redirects by default?",
      "No — curl stops at the 3xx response unless you pass -L/--location. The generated Axios and Python code mirrors that with maxRedirects: 0 and allow_redirects=False when -L is absent. Browser fetch is the one exception: it follows redirects by default and its \"manual\" mode won't hand you the redirected response, so the fetch output only adds redirect: \"follow\" when the command actually had -L.",
    ],
    [
      "How is -u username:password converted?",
      "Into HTTP Basic authentication, one way per target: Python requests takes auth=(\"user\", \"pass\"), Axios takes an auth object with username and password fields, and fetch gets an Authorization header built as \"Basic \" + btoa(\"user:pass\"). Basic auth is only base64 of user:password — encoding, not encryption — so it should only ever travel over HTTPS.",
    ],
    [
      "Can it convert curl file uploads with -F?",
      "No. Commands using -F/--form are rejected with an explanatory message instead of being converted, because multipart file handling differs too much between FormData in the browser, the form-data package in Node, and the files= argument in requests for a generated guess to be reliable. Every other body flag — -d, --data-raw, --data-binary, --data-ascii, --data-urlencode — converts normally.",
    ],
    [
      "What happens to curl flags that have no code equivalent?",
      "They're listed under the result as skipped, so you can see exactly what was dropped — -o/--output, -m/--max-time, -x/--proxy, --connect-timeout, and anything the parser doesn't recognise. Pure CLI switches like -s/--silent, -S/--show-error, -v/--verbose and -f/--fail are accepted and simply produce no code, since they shape curl's terminal output rather than the HTTP request itself. -k/--insecure is carried across where it can be: verify=False in Python, and a comment in the fetch output noting that a browser can't skip TLS verification.",
    ],
    [
      "Is this curl converter free, and is my command uploaded anywhere?",
      "It's free with no signup, and nothing is uploaded. The tokenizer, the curl parser, and all three code printers are JavaScript running in the page, so a command containing an Authorization header, cookie, or API key stays on your machine. Even so, swap any real key for an environment variable before you commit the generated code.",
    ],
  ],
  steps: [
    "Paste your curl command into the box — multi-line commands with trailing backslashes work as-is.",
    "Choose the target: JavaScript fetch, Axios, or Python requests.",
    "Check the detected method, headers, and Content-Type in the summary, then copy the generated code.",
  ],
};

export default seo;
