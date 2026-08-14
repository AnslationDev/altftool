const seo = {
  title: "Phishing URL X-Ray: Check a Link Without Opening It",
  metaDescription:
    "Paste a suspicious link and see it decoded, not opened: punycode via RFC 3492, mixed-script labels, the real registrable domain, and unwrapped redirects.",
  steps: [
    "Paste the address into \"The link\", or tap a sample such as \"Punycode homograph\" or \"Credentials before the host\".",
    "Read \"Findings\" with its High / Medium / Low counts and \"How the address breaks down\" — the registrable domain shown apart from the subdomain, and any numeric host converted back to its dotted quad.",
    "Check the \"Host labels\" table for each label as written, as displayed, its writing systems and its confusable skeleton, then press \"Copy findings\".",
  ],
  intro:
    "Paste a link you were sent and this pulls the address apart character by character without ever loading it. Punycode labels — anything starting xn-- — are decoded with the actual RFC 3492 algorithm, so you see the Unicode name a browser would display. Each label is checked for mixed writing systems, the trick behind homograph attacks, where one Cyrillic letter inside a Latin word produces a completely different domain that looks identical. Confusable characters are folded to a skeleton and compared against well-known brand names, the registrable domain is separated from the subdomains anybody can invent, decimal, hexadecimal and octal IP notations are converted back to dotted quads, and redirect parameters are unwrapped through percent- and base64-encoding to show where the link actually ends up. It runs on the text alone: no request is made to the address, so reading a hostile link does not register as a click.",
  useCases: [
    "A delivery or bank message arrives with a link. Paste it here first to see whether the brand name is in the real domain or only in a subdomain in front of someone else's.",
    "A colleague forwards a login page that looks right. Decode the punycode and check whether any label mixes Latin with Cyrillic or Greek characters before anyone types a password into it.",
    "A long tracking URL on a domain you do recognise: unwrap the redirect parameter to find out which site it hands you to, including when the destination is base64-encoded to hide it.",
  ],
  benefits: [
    [
      "Real punycode decoding, not pattern matching",
      "xn--pypal-4ve is decoded to the name a browser shows, so a domain built out of lookalike characters stops being invisible. The decoder is the RFC 3492 algorithm, verified against the standard round-trip.",
    ],
    [
      "Separates the real domain from the theatre",
      "paypal.com.secure-login.tk belongs to whoever registered secure-login.tk. The registrable domain is extracted and shown on its own, because that is the only part of a hostname that says who owns the link.",
    ],
    [
      "Nothing is fetched, nothing is logged",
      "The address is treated as a string in your browser. It is never opened, resolved, shortened, expanded or sent to a service — which is why it is safe to paste a link that came from a message you do not trust.",
    ],
  ],
  faqs: [
    [
      "What is a punycode or homograph domain?",
      "Domain names can contain non-ASCII characters, which are transmitted in an ASCII encoding called punycode with an xn-- prefix. Browsers may display the decoded Unicode form instead. Because a Cyrillic а and a Latin a render identically, someone can register a name that is visually indistinguishable from a brand but is a different domain entirely. This tool decodes the punycode and reports which writing systems each label uses, so the substitution becomes visible.",
    ],
    [
      "Why does it say the real domain is not the one I can see?",
      "Only the label immediately before the public suffix identifies the owner. In login.microsoft.com.account-check.xyz the owner registered account-check.xyz and then added whatever subdomains they liked in front. On a phone the address bar truncates, so the part you can read is exactly the part the sender chose for you to read.",
    ],
    [
      "Does a clean result mean the link is safe?",
      "No. Every check here reads the characters in the address. There is no blocklist, no reputation service, no WHOIS age lookup and no following of the redirect chain, because those all require a network request and this tool makes none. A freshly registered domain with an ordinary-looking name produces no findings at all. Treat a clean result as \"nothing structurally deceptive\" and still reach the real site through a bookmark before you sign in.",
    ],
    [
      "Is 2130706433 really a web address?",
      "Yes — it is 127.0.0.1 written as a single decimal integer, and browsers accept it. So do the hexadecimal form 0x7f000001, the octal form 0177.0.0.1 and short forms like 127.1. These notations have no legitimate use in a link sent to a person; they exist to stop the destination being recognised. Any of them is converted back to the dotted quad here.",
    ],
  ],
};

export default seo;
