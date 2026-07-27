const seo = {
  intro:
    "This generator produces syntactically valid DNS records — A, AAAA, CNAME, TXT, SRV and ALIAS — in RFC 1035 zone-file format, validating every field before it emits a line. It checks IPv4 and IPv6 address syntax, the 63-character label and 255-character name limits, the RFC 2181 TTL range, RFC 2782 SRV structure, and blocks illegal patterns like a CNAME at the zone apex. It is for developers and admins who edit zones by hand or paste records into a hosting panel.",
  useCases: [
    "Writing an A and AAAA pair for a new subdomain before pasting them into a BIND zone file or DNS panel",
    "Splitting a long DKIM or site-verification TXT value into valid 255-character quoted strings automatically",
    "Building an RFC 2782 SRV record for SIP or XMPP with priority, weight, port and target in the right order",
  ],
  benefits: [
    ["Real validation, not templating", "IPv4 octets, IPv6 compression, label lengths, TTL bounds and SRV numeric ranges are all checked."],
    ["Standards rules enforced", "Rejects CNAME at the apex (RFC 2181) and CNAMEs pointing at IP addresses before they break your zone."],
    ["Long TXT handled", "Values over 255 characters are chunked into multiple quoted strings exactly as RFC 1035 requires."],
  ],
  faqs: [
    [
      "Why can't I put a CNAME record on my root domain?",
      "Because RFC 2181 says a name holding a CNAME may hold no other data, and the zone apex must always hold SOA and NS records, a CNAME at the root is illegal. Use your provider's ALIAS, ANAME or CNAME-flattening feature instead — those answer as normal A/AAAA records while following a hostname target.",
    ],
    [
      "What is the maximum length of a TXT record?",
      "Each character-string inside a TXT record is limited to 255 octets by RFC 1035, but one TXT record can carry multiple strings that resolvers concatenate. Long values such as DKIM public keys are therefore split into several quoted 255-character chunks within the same record.",
    ],
    [
      "What do priority, weight and port mean in an SRV record?",
      "Per RFC 2782, clients contact the target with the lowest priority value first; among targets sharing a priority, the weight sets the proportion of traffic each receives; and the port tells the client which port the service listens on. All three are written in that order before the target hostname.",
    ],
    [
      "What is the difference between an ALIAS record and a CNAME?",
      "A CNAME is a standard DNS type that redirects one name to another but cannot exist at the zone apex, while ALIAS (also called ANAME or CNAME flattening) is a provider-side feature that follows a hostname target and answers with its A/AAAA addresses, so it works at the apex. ALIAS is not defined in any RFC, so its syntax varies by DNS host.",
    ],
  ],
};

export default seo;
