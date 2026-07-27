const seo = {
  intro:
    "This planner assigns MX record preference values using the RFC 5321 rule that sending servers try the lowest preference first and load-balance across equal values. It covers three real setups — a single provider, a primary with a backup MX, and a three-phase provider migration — and validates that every target is a hostname rather than an IP or CNAME, as RFC 2181 requires. It is for admins moving mail providers or adding failover without bouncing messages.",
  useCases: [
    "Adding a backup MX at preference 20 behind a primary at 10 so mail queues elsewhere during an outage",
    "Planning a three-phase migration from an on-premise mail server to a hosted provider without dropping messages mid-cutover",
    "Sanity-checking an inherited zone where MX targets point at IP addresses or share conflicting preference values",
  ],
  benefits: [
    ["RFC 5321 ordering applied", "Lowest-preference-first and equal-value load balancing drive every tier the planner emits."],
    ["Migration phased safely", "Three explicit phases keep both providers accepting mail while DNS caches expire."],
    ["Illegal targets rejected", "IP-address MX targets are blocked — RFC 5321 requires a hostname with A/AAAA records."],
  ],
  faqs: [
    [
      "What does the priority number in an MX record mean?",
      "It is a preference value from 0 to 65535, and sending mail servers must try the record with the LOWEST value first (RFC 5321 section 5.1). Records sharing the same value are tried in random order, which spreads load across those servers.",
    ],
    [
      "Can an MX record point to an IP address?",
      "No. RFC 5321 requires the MX target to be a hostname that resolves via A or AAAA records, and RFC 2181 section 10.3 additionally forbids the target from being a CNAME. Publish an A record for the mail host and point the MX at that name.",
    ],
    [
      "How do I switch email providers without losing mail?",
      "Add the new provider's servers at a higher preference first and verify they accept mail for your domain, then swap so the new provider holds the lowest preference with the old one kept as a temporary backup, and finally remove the old records once their TTL has expired and the old queue is empty. Lower the MX TTL at least one full old-TTL period before the swap.",
    ],
    [
      "Do I actually need a backup MX record?",
      "Usually not: RFC 5321 requires senders to queue and retry undeliverable mail, typically for at least 4-5 days, so a short outage loses nothing. A backup MX only helps if it enforces the same recipient validation and spam filtering as the primary — otherwise spammers deliberately target it as the weakest door.",
    ],
  ],
};

export default seo;
