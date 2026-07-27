const seo = {
  intro:
    "This generator turns a file's exact bytes into the W3C Subresource Integrity metadata a browser checks before it runs a script or applies a stylesheet: a base64 SHA-256, SHA-384 or SHA-512 digest written as algorithm-digest inside an integrity attribute. It also assembles the matching script or link tag, including the crossorigin=\"anonymous\" attribute a cross-origin resource needs before the check can run at all. Hashing happens in the page with the Web Crypto API, so no file is uploaded anywhere.",
  useCases: [
    "Pinning a CDN-hosted JavaScript library so a compromised or swapped file on that CDN is refused rather than executed.",
    "Publishing two hashes during a planned asset change, then confirming which one the browser will actually enforce.",
    "Checking whether an integrity attribute copied from documentation is well-formed before shipping it in a release.",
  ],
  benefits: [
    [
      "Nothing leaves the tab",
      "The digest is computed locally with SubtleCrypto, so unreleased build output never travels to a server.",
    ],
    [
      "Tag, not just a hash",
      "The output is the complete script or link element with the CORS attribute in place, which is where most SRI setups go wrong.",
    ],
    [
      "Explains what the browser enforces",
      "When several expressions are present the strongest-algorithm rule is applied and the ignored ones are named.",
    ],
  ],
  faqs: [
    [
      "Which hash algorithm should I use for SRI?",
      "SHA-384 is the practical default and what most CDN snippets publish. The specification permits exactly three: sha256, sha384 and sha512 — md5 and sha1 are not valid SRI algorithms and browsers ignore expressions that use them.",
    ],
    [
      "Why does my subresource integrity check fail on a CDN file?",
      "The most common cause is a missing crossorigin=\"anonymous\" attribute: without CORS the response is opaque, the browser cannot read the body to hash it, and the resource is blocked. The next most common cause is hashing a different build of the file than the one served, since any byte difference — a changed minifier, a trailing newline, a source-map comment — changes the digest.",
    ],
    [
      "Can I put more than one hash in the integrity attribute?",
      "Yes, separated by whitespace, and the resource loads if the body matches any one of them. But the browser first discards every expression that is not the strongest algorithm listed, so mixing sha256 and sha384 means only the sha384 values are ever compared.",
    ],
    [
      "Does SRI replace HTTPS?",
      "No. Integrity metadata detects a modified response body but does nothing about the request path itself; over plain http an active attacker can rewrite the HTML and delete the integrity attribute before the browser ever sees it. Serve both the page and the subresource over https and treat SRI as defence against a compromised third-party host.",
    ],
  ],
};

export default seo;
