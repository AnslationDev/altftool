const seo = {
  intro:
    "A subnet calculator turns an IPv4 address and a prefix length into the four numbers a network actually runs on: the network address, the broadcast address, the first and last usable host, and how many hosts fit. It applies the CIDR rules of RFC 4632 — network = address AND mask, broadcast = network OR the wildcard — plus the RFC 3021 exception that makes a /31 point-to-point link carry two usable addresses instead of none. It is for network engineers sizing a VLAN, cloud users choosing a VPC CIDR, and anyone studying for CCNA who wants to check their working.",
  useCases: [
    "Check whether a proposed VPC subnet is large enough: a /24 gives 254 usable hosts, a /26 gives 62, and a /28 gives only 14.",
    "Split an allocated 192.168.1.0/24 into four /26 blocks and read off each block's network, broadcast and host range before writing the DHCP scopes.",
    "Confirm that a router-to-router link configured as a /31 is legal and gives both ends a usable address under RFC 3021.",
  ],
  benefits: [
    ["Handles the /31 and /32 edge cases", "It applies the RFC 3021 point-to-point rule and the single-host route rule instead of reporting a nonsensical zero or negative host count."],
    ["Shows the binary", "The address, netmask and network address are printed in binary so you can see exactly where the prefix boundary falls."],
    ["Names the block", "RFC 1918 private space, RFC 6598 carrier NAT, RFC 3927 link-local and the RFC 5737 documentation ranges are identified by name and reference."],
  ],
  faqs: [
    [
      "How many usable hosts are in a /24?",
      "254. A /24 leaves 8 host bits, so it spans 2^8 = 256 addresses, and two of those are not assignable: the all-zeros address is the network address and the all-ones address is the directed broadcast. The same subtraction gives 126 for a /25, 62 for a /26, 30 for a /27 and 14 for a /28.",
    ],
    [
      "Why does a /31 show 2 usable hosts instead of 0?",
      "Because RFC 3021 removed the network and broadcast reservation for point-to-point links. A /31 has only two addresses, and subtracting two would leave none, so the standard says both are assignable — one per end of the link. That is why /31s are the normal choice for router-to-router links and save two addresses each compared with a /30.",
    ],
    [
      "What is a wildcard mask and how is it different from a netmask?",
      "A wildcard mask is the bitwise inverse of the netmask: for a /24 the netmask is 255.255.255.0 and the wildcard is 0.0.0.255. Cisco ACLs and OSPF network statements take the wildcard form, where a 0 bit means \"must match\" and a 1 bit means \"ignore\", which is the opposite of a netmask.",
    ],
    [
      "Which IPv4 ranges are private?",
      "Three, defined in RFC 1918: 10.0.0.0/8 (16,777,216 addresses), 172.16.0.0/12 (1,048,576 addresses) and 192.168.0.0/16 (65,536 addresses). Two more ranges are often mistaken for private: 100.64.0.0/10 is carrier-grade NAT space from RFC 6598, and 169.254.0.0/16 is link-local from RFC 3927, assigned automatically when DHCP fails.",
    ],
  ],
};

export default seo;
