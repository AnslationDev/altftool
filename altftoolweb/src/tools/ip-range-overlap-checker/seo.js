const seo = {
  intro:
    "This checker tests every pair of IPv4 networks you paste — CIDR blocks, start–end ranges or single addresses — for overlap using the interval-intersection rule (two ranges overlap when each starts at or before the other ends). Each conflict is reported with its exact intersecting range, its size in addresses, and whether the relationship is identical, containment or partial overlap. It is built for engineers validating address plans before VPC peering, site-to-site VPNs, mergers or new subnet allocations.",
  useCases: [
    "Verifying a proposed AWS VPC CIDR does not collide with any existing VPC or on-premises range before requesting peering",
    "Checking two companies' RFC 1918 address plans for conflicts during an IT merger, where 10.0.0.0/16 on both sides is the classic blocker",
    "Auditing a firewall rule set by pasting its source ranges and spotting which entries shadow each other",
  ],
  benefits: [
    ["Mixed formats", "CIDR blocks, dash-separated ranges and single IPs can be compared against each other in one run."],
    ["Exact intersections", "Every conflict shows the precise overlapping range and address count, not just a yes/no."],
    ["Relationship classified", "Results distinguish identical blocks, full containment and partial overlap — each needs a different fix."],
  ],
  faqs: [
    [
      "How do I check if two CIDR blocks overlap?",
      "Convert each block to its first and last address, then test whether each range starts at or before the other ends: A.start <= B.end AND B.start <= A.end. For example 10.0.0.0/24 (10.0.0.0–10.0.0.255) and 10.0.0.128/25 (10.0.0.128–10.0.0.255) overlap, and the /24 fully contains the /25.",
    ],
    [
      "Why can't I peer two VPCs with overlapping CIDR ranges?",
      "Routing becomes ambiguous: a packet to 10.0.1.5 cannot be attributed to one side when both networks claim 10.0.0.0/16. AWS, Azure and GCP all reject peering connections between VPCs with overlapping address space, so the fix is re-addressing one side or inserting NAT.",
    ],
    [
      "Do adjacent subnets like 10.0.0.0/24 and 10.0.1.0/24 overlap?",
      "No. 10.0.0.0/24 ends at 10.0.0.255 and 10.0.1.0/24 starts at 10.0.1.0, so they touch but share no addresses. Adjacency is actually desirable — two adjacent /24s that align on a /23 boundary can later be summarised as one 10.0.0.0/23 route.",
    ],
    [
      "What is the difference between partial overlap and containment?",
      "Containment means one range holds every address of the other (10.0.0.0/16 contains 10.0.5.0/24) — often intentional in hierarchical plans but fatal for peering. Partial overlap means each range has addresses the other lacks, which is almost always an allocation mistake. This tool labels each conflicting pair accordingly.",
    ],
  ],
};

export default seo;
