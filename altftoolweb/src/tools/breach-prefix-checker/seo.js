const seo = {
  intro:
    "This tool prepares a k-anonymity breach lookup without ever handling your password outside the page. It computes the SHA-1 digest of the candidate in JavaScript, splits it into the 5-character prefix that the Pwned Passwords range endpoint expects and the 35-character suffix that must never leave your machine, and hands you the exact request to run. It makes no network call itself: you run the request, paste the SUFFIX:COUNT response back, and the match is performed here in the browser. That is the whole point of the k-anonymity design — the service answers a question about a bucket of 2^140 possible digests, not about your password.",
  useCases: [
    "You want to check a password you actually use, and you are not willing to type it into a site that will hash it server-side — so you take the prefix, curl the range endpoint yourself, and match the suffix locally",
    "You are auditing an exported credential list during an incident and need the prefixes for every entry, plus a count of how many distinct range requests that really costs you",
    "You are implementing a breach check in your own signup flow and want to see the prefix, suffix, endpoint and Add-Padding header laid out before you write the client",
  ],
  benefits: [
    [
      "The password never leaves the page",
      "SHA-1 is implemented in plain JavaScript here — no upload, no API call, no telemetry, and nothing written to storage or the URL.",
    ],
    [
      "Shows the privacy maths, not a slogan",
      "Five hex characters is exactly 20 of the digest's 160 bits, narrowing you to one of 1,048,576 buckets; the remaining 140 bits stay local.",
    ],
    [
      "Completes the match locally",
      "Paste the range response and the page counts real entries, padding entries and malformed lines, then reports whether your suffix is present and with what count.",
    ],
  ],
  faqs: [
    [
      "Does this tool check the breach database for me?",
      "No, and that is deliberate. It performs steps one, two and four of the k-anonymity flow — hashing, splitting and matching — and leaves step three, the HTTPS request, to you. Making the call from this page would mean your browser's IP and the prefix arriving together from a site you did not choose, which is exactly the linkage the design is meant to avoid.",
    ],
    [
      "Why SHA-1 when SHA-1 is broken?",
      "SHA-1's weakness is collision resistance, which matters for signatures. Here it is used only as a lookup key into a corpus that is itself indexed by SHA-1, so the algorithm is fixed by the endpoint rather than chosen for security. Nothing about the check depends on SHA-1 being collision-resistant.",
    ],
    [
      "What does the Add-Padding header do?",
      "It asks the endpoint to return extra filler entries with a count of zero, so every response is a similar size. Without it, an observer measuring only the response length could learn something about how many hashes share your prefix. This page recognises those zero-count rows and never treats one as a match.",
    ],
    [
      "My password was not in the response — is it safe?",
      "It means that exact string is absent from that corpus, which is a much narrower statement than 'safe'. A password can be trivially guessable and still never have appeared in a published breach. Absence from the corpus removes one specific risk — credential stuffing with a known-leaked string — and says nothing about length, uniqueness or reuse.",
    ],
  ],
};

export default seo;
