const seo = {
  intro:
    "Redirect and tracking links routinely carry their real destination — and often the recipient's email address — inside a base64 or hex blob. This tool tokenises a link three ways, tries it raw and percent-decoded, decodes anything that turns out to be readable UTF-8 text under RFC 4648 base64 or base64url, and keeps going when a result is itself encoded, up to four layers. It is the practical way to see where a shortened or wrapped link leads without requesting it, because everything is decoded locally in your browser.",
  useCases: [
    "A link in an email wraps its destination in a long random-looking string and you want the real target before deciding whether to click.",
    "Checking whether a marketing or phishing link has your email address encoded in it, which would tell the sender exactly who opened it.",
    "Unwrapping a double-encoded parameter where the first decode produces another base64 string.",
    "Reading a hex or base64 payload from a log entry or a security alert.",
  ],
  benefits: [
    ["Nothing is fetched", "The link is treated as text and never requested, so a live phishing URL can be inspected without touching the attacker's server."],
    ["Follows multiple layers", "When a decode produces another encoded string the tool decodes again, reporting how deep the wrapping went."],
    ["Own implementation", "Base64 and UTF-8 are decoded by code written for this page rather than a browser API, so the same input gives the same output everywhere."],
  ],
  faqs: [
    [
      "How do I decode a base64 string in a URL?",
      "Paste the whole link and it is scanned automatically, or switch to single-string mode and paste just the blob. Note that links usually use base64url, the RFC 4648 section 5 variant that replaces + and / with - and _ and often drops the = padding, which is why a plain base64 decoder sometimes rejects it.",
    ],
    [
      "What is the difference between base64 and base64url?",
      "They encode identically but use different characters for values 62 and 63: standard base64 uses + and /, while base64url uses - and _ so the result survives inside a path or query string without percent-encoding. base64url also commonly omits the trailing = padding.",
    ],
    [
      "Why is my email address inside a link I was sent?",
      "Many mailing platforms encode the recipient identifier into the click URL so the open can be attributed to you, and phishing kits do the same so the fake sign-in page can pre-fill your address and look personalised. If a decoded blob is your own address, treat forwarding that link as forwarding your identity.",
    ],
    [
      "The blob did not decode — does that mean the link is safe?",
      "No. A string can be random, encrypted, compressed or simply an opaque database id, and none of those decode to text. A failed decode says nothing about the link; judge it on the host instead — the part immediately before the first single slash.",
    ],
  ],
};

export default seo;
