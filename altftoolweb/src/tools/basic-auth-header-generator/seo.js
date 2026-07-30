const seo = {
  intro:
    "The Basic Auth Header Generator builds the HTTP Authorization header defined in RFC 7617: it joins your username and password with a single colon, Base64-encodes that string, and prefixes it with the word Basic. You get a ready-to-paste value in the form Basic dXNlcjpwYXNz, plus a realm field for the matching WWW-Authenticate challenge on the server side. It is for developers wiring up a cURL call, an API client, a webhook, or a CI job against an endpoint that expects HTTP Basic authentication.",
  useCases: [
    "You are testing an internal API with Postman or cURL and need the exact Authorization header value rather than letting the client build it for you.",
    "A CI pipeline or webhook config takes a raw header string, so you need the encoded credential to paste into a secret variable.",
    "You are reading a captured request, want to confirm which account a Basic header refers to, and need to reproduce the same encoding to compare.",
  ],
  benefits: [
    [
      "Produces the complete header value",
      "The output is the full Basic <token> string, not just the Base64 blob, so it drops straight into an Authorization header with nothing left to assemble.",
    ],
    [
      "The colon rule is handled for you",
      "Only the first colon separates username from password, which is exactly why a password containing a colon still works and a username containing one cannot.",
    ],
    [
      "Realm alongside the credential",
      "The realm you enter is shown next to the header so you can set the server's WWW-Authenticate challenge and the client's credential from one place.",
    ],
  ],
  faqs: [
    [
      "How is a Basic auth header built?",
      "Take username:password as a single string, Base64-encode it, and send it as Authorization: Basic <encoded>. That is the whole scheme, defined in RFC 7617, which replaced the Basic definition in RFC 2617.",
    ],
    [
      "Is Basic authentication secure?",
      "Not on its own. Base64 is an encoding, not encryption — anyone who sees the header can decode the password in one step — so Basic auth must only be used over HTTPS, and the credential should be treated as a secret at rest too.",
    ],
    [
      "What if my username contains a colon?",
      "It cannot. The colon is the delimiter, and the server splits on the first one, so a colon in the username makes the credential unparseable. A colon anywhere in the password is fine because everything after the first colon is the password.",
    ],
    [
      "What is the realm for?",
      "The realm is the protected-space label the server sends back in its 401 challenge, as in WWW-Authenticate: Basic realm=\"Restricted Area\". It is not part of the Authorization header the client sends — browsers use it to label the login prompt and to decide which stored credential applies.",
    ],
  ],
};

export default seo;
