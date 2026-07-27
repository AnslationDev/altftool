const seo = {
  intro:
    "This converter translates IPv4 networks between their three common notations — CIDR blocks (RFC 4632), start–end address ranges and Cisco ACL wildcard masks — in bulk, one entry per line. Arbitrary ranges that do not align to a power-of-two boundary are decomposed into the minimal list of CIDR blocks using the standard greedy alignment algorithm, and non-contiguous wildcard masks are detected and rejected with an explanation. It is built for network and cloud engineers moving allowlists between firewalls, ACLs and cloud security groups that each demand a different format.",
  useCases: [
    "Converting a vendor's published IP ranges given as start–end pairs into the CIDR blocks an AWS security group requires",
    "Turning a /26 subnet into the address 0.0.0.63 wildcard entry a Cisco ACL needs, or the reverse when auditing router configs",
    "Splitting an awkward DHCP-style range like 10.0.0.5–10.0.0.16 into the exact minimal CIDR set (a /32, /31, /29 and /32) for a route filter",
  ],
  benefits: [
    ["Three notations at once", "Every line is shown as a range, as CIDR block(s) and — when exact — as a wildcard entry."],
    ["Minimal CIDR splitting", "Unaligned ranges are decomposed into the fewest possible blocks, never one-per-address."],
    ["Wildcard validation", "Non-contiguous wildcard masks are flagged instead of being silently misconverted."],
  ],
  faqs: [
    [
      "How do I convert an IP range to CIDR notation?",
      "If the range starts on a power-of-two boundary and its length is a power of two, it is a single CIDR: 10.0.0.0–10.0.0.255 is 10.0.0.0/24. Otherwise it must be split: the greedy algorithm repeatedly takes the largest block that starts at the current address and fits the remainder, so 10.0.0.5–10.0.0.16 becomes 10.0.0.5/32, 10.0.0.6/31, 10.0.0.8/29 and 10.0.0.16/32.",
    ],
    [
      "What is the difference between a wildcard mask and a subnet mask?",
      "A wildcard mask is the bitwise inverse of the subnet mask: /24 has subnet mask 255.255.255.0 and wildcard 0.0.0.255. Wildcards are used in Cisco ACLs and OSPF network statements, where 0 bits mean 'must match' and 1 bits mean 'ignore'. Unlike subnet masks, wildcards may legally be non-contiguous, in which case they match a scattered set that no single CIDR can represent.",
    ],
    [
      "Why can't every IP range be written as one CIDR block?",
      "CIDR blocks are always a power-of-two in size and start at a multiple of that size. A range like 10.0.0.5–10.0.0.16 holds 12 addresses starting at an odd offset, so no single prefix covers exactly those addresses — it takes four blocks. This tool always emits the provably minimal set.",
    ],
    [
      "How many IP addresses are in a CIDR block?",
      "2^(32 − prefix): a /24 holds 256 addresses, a /16 holds 65,536 and a /8 holds 16,777,216. That count includes the network and broadcast addresses; usable host counts are two lower on ordinary subnets (see a subnet calculator for /31 and /32 special cases).",
    ],
  ],
};

export default seo;
