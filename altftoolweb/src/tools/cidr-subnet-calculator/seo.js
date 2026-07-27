const seo = {
  intro:
    "This calculator expands any IPv4 CIDR block (RFC 4632) into its full subnet breakdown: network and broadcast addresses, first and last usable host, subnet mask, wildcard mask, and host count using 2^(32−prefix) − 2. It handles the special cases generic tools get wrong — /31 point-to-point links with two usable addresses per RFC 3021, /32 host routes, and /0 — and labels the block as RFC 1918 private, loopback, link-local, CGN, multicast or public. Built for network engineers, cloud architects and anyone carving up a VPC.",
  useCases: [
    "Checking which subnet 192.168.1.130 belongs to in a /26 scheme and what its usable range is before assigning static IPs",
    "Planning AWS or Azure VPC address space by confirming how many hosts a /20 really provides (4,094 usable)",
    "Writing a Cisco ACL and needing the wildcard mask (0.0.0.63) that corresponds to a /26 subnet mask",
  ],
  benefits: [
    ["Special prefixes correct", "/31 returns 2 usable hosts per RFC 3021 and /32 returns a host route, instead of the naive minus-two formula going negative."],
    ["Wildcard masks included", "Every result shows the ACL-style inverse mask alongside the dotted netmask."],
    ["Range classification", "The block is identified as RFC 1918 private, loopback, link-local, carrier-grade NAT, multicast or public."],
  ],
  faqs: [
    [
      "How many usable hosts are in a /24, /26 or /30 subnet?",
      "A /24 has 254 usable hosts, a /26 has 62, and a /30 has 2. The formula is 2^(32−prefix) − 2, subtracting the network and broadcast addresses. So /24 gives 256 − 2 = 254 and /26 gives 64 − 2 = 62.",
    ],
    [
      "Why does a /31 subnet have 2 usable hosts instead of 0?",
      "RFC 3021 defines /31 for point-to-point links: with only two addresses in the block, both are assigned to the link endpoints and no broadcast address exists. The classic minus-two rule would give zero, which is why /31 is treated specially by this calculator and by modern router operating systems.",
    ],
    [
      "What is a wildcard mask and how does it relate to the subnet mask?",
      "A wildcard mask is the bitwise inverse of the subnet mask, used in Cisco ACLs and OSPF network statements. For a /26 the subnet mask is 255.255.255.192 and the wildcard is 0.0.0.63 — 0 bits mean 'must match' and 1 bits mean 'don't care'.",
    ],
    [
      "How do I find the network and broadcast address of an IP in CIDR notation?",
      "AND the address with the subnet mask to get the network address, then OR the network with the inverted mask to get the broadcast. For 192.168.1.130/26: the mask is 255.255.255.192, the network is 192.168.1.128 and the broadcast is 192.168.1.191, leaving 129–190 usable.",
    ],
  ],
};

export default seo;
