const seo = {
  title: "IP Address Finder: IANA Block, Subnet",
  metaDescription:
    "Classify an IPv4 or IPv6 address against the IANA special-purpose registries, get its subnet boundaries and reverse-DNS name. Geolocation is opt-in.",
  steps: [
    "Type an IPv4 or IPv6 address such as 8.8.8.8 or 2001:4860:4860::8888, and set the IPv4 subnet prefix length.",
    "The registry block, routability, decimal, hexadecimal and binary forms and the reverse-DNS pointer are worked out offline; press 'Look up details' or 'Use my IP' to add ISP and location.",
    "Read the subnet CIDR, mask, broadcast, host range and usable host count, then press Copy result.",
  ],
  intro:
    "The IP Address Finder tells you what an IPv4 or IPv6 address actually is: which IANA special-purpose block it belongs to, whether it can be routed on the public internet, its subnet boundaries at any prefix length, and its reverse-DNS pointer name. Classification runs entirely in your browser against the IANA registries (RFC 1918 private space, RFC 6598 carrier-grade NAT, RFC 3927 link-local, RFC 4193 unique local and the rest), so no address leaves the page unless you press the lookup button. It is built for network engineers, support teams and developers who need to say quickly whether an address in a log line is a customer, a VPN, or their own LAN.",
  useCases: [
    "Decide whether an address in a server log is a real visitor or an internal 10.0.0.0/8 or 192.168.0.0/16 host.",
    "Work out the network, broadcast and usable host range for a /26 before splitting an office VLAN.",
    "Look up the ISP, ASN and country behind an address that is hammering an API endpoint.",
  ],
  benefits: [
    ["Registry-accurate", "Matches against the IANA special-purpose tables, not a guessed regular expression."],
    ["Offline by default", "Parsing, subnetting and reverse-DNS naming happen locally; the geolocation call is opt-in."],
    ["IPv4 and IPv6", "Handles :: compression, IPv4-mapped addresses and ip6.arpa pointer names."],
  ],
  faqs: [
    [
      "Which IP ranges are private?",
      "Three IPv4 ranges are private under RFC 1918: 10.0.0.0/8, 172.16.0.0/12 (that is 172.16.0.0 to 172.31.255.255) and 192.168.0.0/16. In IPv6 the equivalent is the unique local range fc00::/7. None of them are routed on the public internet.",
    ],
    [
      "How many usable hosts are in a /24?",
      "254. A /24 holds 2^(32−24) = 256 addresses, and two are reserved — the network address and the broadcast address. The subtraction stops at /30; RFC 3021 lets a /31 use both of its 2 addresses for point-to-point links.",
    ],
    [
      "Why does my IP look like 100.64.x.x?",
      "That is carrier-grade NAT shared address space, reserved by RFC 6598 as 100.64.0.0/10. Mobile and some fixed-line ISPs put customers behind it, so many subscribers share one public address and geolocation points at the carrier rather than you.",
    ],
    [
      "How accurate is IP geolocation?",
      "City-level at best, and often wrong. Databases map an address to where the block is registered or where the operator peers, so a VPN, a mobile network or a corporate proxy can place you hundreds of kilometres away. Never treat an IP location as proof of a person's whereabouts.",
    ],
  ],
};

export default seo;
