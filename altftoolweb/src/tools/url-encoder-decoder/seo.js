const seo = {
  title: "URL Encoder Decoder — Encode, Decode & Inspect URLs",
  h1: "URL Encoder and Decoder",
  metaDescription:
    "Percent-encode and decode URLs, and dump any query string to JSON with the URL API. Free, runs in your browser, nothing is uploaded or stored.",
  intro:
    "The URL Encoder and Decoder runs three modes over whatever you paste. Encode calls JavaScript's built-in encodeURIComponent, which percent-escapes everything except A–Z, a–z, 0–9 and - _ . ! ~ * ' ( ) — so a space becomes %20, an ampersand %26 and a slash %2F. Decode calls decodeURIComponent to reverse it. Query JSON parses the input with the browser's URL and URLSearchParams API and prints every parameter as 2-space-indented JSON, while a table underneath lists each key, its decoded value and its encoded form. All three run on browser built-ins on your own device; no URL you paste is ever sent to a server.",
  useCases: [
    "Escaping a search term or redirect target before it goes into a query parameter, so spaces, ampersands and slashes don't break the link",
    "Reading a %-mangled URL out of a server log, an email tracking link or an OAuth redirect_uri to see where it actually points",
    "Dumping the UTM and campaign parameters of a long marketing URL to indented JSON to check exactly what is being tracked",
  ],
  benefits: [
    [
      "Component encoding, done correctly",
      "Encode mode uses encodeURIComponent, which escapes : / ? & = # along with spaces — the encoding a value needs before it can sit safely inside a query parameter.",
    ],
    [
      "A query inspector, not just a text box",
      "Query JSON returns the whole query string as indented JSON, and the table below it breaks out every parameter into key, decoded value and encoded value with a live parameter count.",
    ],
    [
      "One-click round trips",
      "Use output pushes the result back into the input box and flips encode to decode, so you can confirm a string survives the trip unchanged. Copy and a .txt download are one click away.",
    ],
    [
      "Nothing leaves the page",
      "Encoding, decoding and query parsing all run on browser built-ins — encodeURIComponent, decodeURIComponent and the URL API. No upload, no server call, no stored history.",
    ],
  ],
  faqs: [
    [
      "How do I encode a URL online?",
      "Paste the text into the input box and choose Encode. The tool runs encodeURIComponent on it, so https://example.com/a b comes back as https%3A%2F%2Fexample.com%2Fa%20b. Copy the result, download it as a .txt file, or hit Use output to feed it straight back in for a decode check.",
    ],
    [
      "What does %20 mean in a URL?",
      "%20 is a space. Percent-encoding writes a character as % followed by its byte value in hexadecimal, and the space character is 0x20. Paste any string with %20 into Decode mode and you get the readable text back — %26 is &, %3F is ?, %2F is /.",
    ],
    [
      "Why does encoding my whole URL turn https:// into https%3A%2F%2F?",
      "Because Encode mode uses encodeURIComponent, which is designed for a single value inside a URL rather than a complete address, and it treats : and / as characters that need escaping. That output is correct when you're embedding one URL inside another — a redirect_uri or a ?url= parameter. If you only want the parameter value escaped, paste just that value instead of the full address.",
    ],
    [
      "Why does my encoded URL fail to decode?",
      "Decode mode shows \"Input could not be processed for this mode\" when the string contains a % that isn't followed by two valid hex digits — decodeURIComponent throws a URIError on sequences like 100% off or a truncated %E2%. A literal percent sign has to be written as %25 before it can be decoded.",
    ],
    [
      "How do I see all the parameters in a long URL?",
      "Switch to Query JSON. Anything containing a ? is parsed as a full URL; a bare string like utm_source=news&utm_medium=email is parsed as a query string on its own. You get 2-space-indented JSON of every key and value, and the inspector table below shows the same parameters with their re-encoded values. Note that the JSON keeps only the last occurrence of a repeated key, while the table lists every one.",
    ],
    [
      "Does a plus sign mean a space when decoding?",
      "It depends on the mode, and this catches people out. Query JSON uses URLSearchParams, which follows form-encoding rules and reads + as a space. Decode mode uses decodeURIComponent, which leaves + exactly as it is. If a value looks wrong in Decode, try it in Query JSON.",
    ],
    [
      "What characters does this tool encode?",
      "Everything except the 66 characters encodeURIComponent leaves alone: A–Z, a–z, 0–9 and - _ . ! ~ * ' ( ). Anything else becomes one or more %XX pairs based on its UTF-8 bytes, so é encodes to %C3%A9 and an emoji expands to four pairs. Character counts for both the input and the output are shown above each box.",
    ],
    [
      "Is this URL encoder free, and are my URLs uploaded anywhere?",
      "It's free with no signup, and nothing is uploaded. Every mode runs in your browser on native JavaScript functions — encodeURIComponent, decodeURIComponent and the URL API — with no network requests in the tool at all. The download button builds the .txt file locally from a Blob, so even that stays on your device.",
    ],
  ],
  steps: [
    "Paste the URL, encoded text or query string into the input box. The Sample button loads a test URL containing spaces and an ampersand if you want something to try first.",
    "Pick a mode: Encode percent-escapes the text, Decode turns %20 and %26 back into readable characters, and Query JSON lists every parameter as indented JSON. Output updates as you type.",
    "Copy the result, download it as altftool-url-output.txt, or press Use output to send it back into the input and flip between encode and decode for a round-trip check.",
  ],
};

export default seo;
