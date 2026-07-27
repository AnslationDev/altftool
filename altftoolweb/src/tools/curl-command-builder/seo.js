const seo = {
  intro:
    "This builder turns a described HTTP request into a working curl command line, handling method selection, headers, authentication, JSON and multipart bodies, proxies, timeouts and output redirection. Arguments are wrapped in POSIX single quotes and query values are percent-encoded, so ampersands and spaces cannot be mangled by the shell. It also flags the classic traps: -X POST alongside -d, secrets left in shell history, and -s hiding the error you needed to see.",
  useCases: [
    "Reproducing an API call from documentation before writing the equivalent client code",
    "Building a scripted health check with --connect-timeout, --max-time and --retry set explicitly",
    "Uploading a file as multipart/form-data with -F and confirming the field names are right",
  ],
  benefits: [
    ["Shell-safe by default", "Every argument is quoted, so JSON braces, ampersands and spaces survive the shell untouched."],
    ["Explains the flags", "Each option in the output is listed with what it actually does, not just what it is called."],
    ["Catches silent mistakes", "Warns about redirects dropping the Authorization header, bodies on GET, and -k defeating TLS."],
  ],
  faqs: [
    [
      "How do I send JSON with curl?",
      "Add -H 'Content-Type: application/json' and pass the payload with -d, for example curl -H 'Content-Type: application/json' -d '{\"name\":\"Ada\"}' https://api.example.com/users. curl 7.82 and newer can shorten this to --json, which sets both the Content-Type and Accept headers.",
    ],
    [
      "Do I need -X POST when I use -d?",
      "No. Passing -d makes curl switch to POST on its own, and adding -X POST forces the method to stay POST even after a 301 or 302 redirect, which can send the body somewhere you did not intend.",
    ],
    [
      "Why does my authenticated request fail after a redirect?",
      "With -L curl removes the Authorization header when the redirect points at a different host, as a credential-leak protection. Call the final URL directly, or add --location-trusted only if you fully trust every host in the chain.",
    ],
    [
      "How do I make curl fail a shell script on an HTTP error?",
      "Add -f (--fail). Without it curl exits 0 even on a 500 because the transfer itself succeeded; -f suppresses the error body and returns exit code 22 instead. Pair it with -sS so the progress meter is hidden but real errors still print.",
    ],
  ],
};

export default seo;
