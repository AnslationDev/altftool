const seo = {
  intro:
    "This decision helper ranks the five credential mechanisms available to an HTTP API — a static API key, the OAuth 2.0 client credentials grant (RFC 6749 §4.4), authorization code with PKCE (RFC 7636), the device authorization grant (RFC 8628) and mutual TLS (RFC 8705) — against one specific consumer. It runs two passes: structural gates that rule a mechanism out entirely, such as a public client being unable to hold a secret under RFC 6749 §2.1, then a weighted rubric across delegation, scoping, revocation, blast radius, rotation and integration cost. It is aimed at the person writing the API's authentication section before any code exists.",
  useCases: [
    "Deciding whether a partner integration that reads order data on a schedule needs OAuth or whether a scoped, rotated API key is enough.",
    "Justifying to a review board why a browser single-page app cannot be given a client secret and must use authorization code with PKCE.",
    "Choosing the flow for a smart TV or CLI installer that has no browser, where the device authorization grant replaces the redirect.",
  ],
  benefits: [
    [
      "Rules out before it ranks",
      "Structural impossibilities are separated from preferences, so you never compare an option that cannot work at all.",
    ],
    [
      "Sensitivity changes the weighting",
      "Credential blast radius is weighted 2, 4 or 6 depending on what the API exposes, rather than treated as one fixed rule.",
    ],
    [
      "Every score is shown",
      "All five mechanisms keep a percentage and a per-criterion score, so a runner-up stays visible when the margin is thin.",
    ],
  ],
  faqs: [
    [
      "When is an API key good enough instead of OAuth?",
      "When the caller is your own or a named partner's backend, there is no end user to represent, the key can be scoped and rotated automatically, and the data is not highly sensitive. The moment one end user must be able to revoke access without affecting others, a key cannot express that — revoking it disconnects every user of that integration at once.",
    ],
    [
      "Why can't a single-page app keep a client secret?",
      "Because everything the browser downloads is readable by the user and by anyone who opens developer tools, so a secret shipped in JavaScript is published, not stored. RFC 6749 §2.1 classes such clients as public, and OAuth 2.1 requires PKCE with the S256 challenge method for them instead of a secret.",
    ],
    [
      "What is the difference between the client credentials grant and an API key?",
      "The client credentials grant exchanges a long-lived client secret at a token endpoint for a short-lived access token, typically valid 5 to 60 minutes, and only that token travels on API calls. A static API key is itself the credential on every call, so a leaked key stays valid until a human notices and revokes it.",
    ],
    [
      "Do I still need OAuth if I already use mutual TLS?",
      "They solve different problems and are often combined. Mutual TLS proves which machine is connecting, at the transport layer, before any request body is parsed; OAuth carries authorisation detail such as scopes and end-user consent. RFC 8705 formalises the combination, letting a TLS client certificate authenticate the OAuth client and bind the access token to that certificate.",
    ],
  ],
};

export default seo;
