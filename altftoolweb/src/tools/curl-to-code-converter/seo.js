const seo = {
  intro:
    "This converter reads a curl command line and rewrites the same HTTP request as JavaScript fetch, Axios, or Python requests code. It tokenises the command the way a POSIX shell does — single quotes literal, double quotes with escapes, backslash line continuations — then applies curl's own defaults: GET unless -X says otherwise or a body makes it POST, application/x-www-form-urlencoded when -d is used without a Content-Type, and no redirect following unless -L is present. It is for developers porting an API example from documentation into real code.",
  useCases: [
    "Turn the curl snippet in an API's quickstart into the fetch call your front end actually needs",
    "Copy a request as cURL from the browser network tab and replay it from a Python script",
    "Convert a POST with a JSON body into Axios without hand-transcribing headers and losing one",
  ],
  benefits: [
    ["Real shell tokenising", "Quoted headers, escaped quotes inside JSON bodies and multi-line commands all parse correctly."],
    ["curl's defaults preserved", "Method inference, the form Content-Type and redirect behaviour match what curl would actually do."],
    ["Three targets from one paste", "fetch, Axios and Python requests, with Basic auth and JSON bodies rendered idiomatically in each."],
  ],
  faqs: [
    [
      "Why does curl send a POST when I only used -d?",
      "Because -d/--data implies POST. curl's default method is GET, but supplying a request body with -d switches it to POST unless you override it with -X. It also sets Content-Type: application/x-www-form-urlencoded when you have not set one yourself — which is why an API expecting JSON rejects the request until you add -H 'Content-Type: application/json'.",
    ],
    [
      "Does curl follow redirects by default?",
      "No. curl stops at the 3xx response and prints nothing unless you pass -L/--location. Both fetch and Python requests do follow redirects by default, so the generated code sets redirect and allow_redirects explicitly to keep the behaviour identical to the command you pasted.",
    ],
    [
      "How is -u username:password converted?",
      "Into HTTP Basic authentication. Python requests takes it as auth=(\"user\", \"pass\"), Axios as an auth object, and fetch as an Authorization header built with btoa(\"user:pass\") — Basic auth is just base64 of user:password, which is encoding, not encryption, so it must only travel over HTTPS.",
    ],
    [
      "Can it convert file uploads?",
      "No. -F/--form multipart uploads are rejected rather than converted, because the file-handling differs substantially between FormData in the browser, form-data in Node and the files= argument in requests, and a generated guess would be wrong more often than right.",
    ],
  ],
};

export default seo;
