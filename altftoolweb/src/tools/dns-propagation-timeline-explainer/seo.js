const seo = {
  intro:
    "This explainer computes the worst-case window before a DNS change becomes visible everywhere, using the actual caching rules: resolvers hold the old answer for up to the record's previous TTL (RFC 1035), and 'name does not exist' answers are held for the negative-cache TTL from the zone's SOA record (RFC 2308). It is for developers and site owners planning a migration or launch who want a real timeline instead of the vague '24 to 48 hours' folklore.",
  useCases: [
    "Estimating how long after switching an A record with a 3600-second TTL some visitors may still reach the old server",
    "Understanding why a brand-new subdomain still returns NXDOMAIN for people who tried it before the record existed",
    "Explaining to a stakeholder why a launch checklist says to lower TTLs a day before the cutover",
  ],
  benefits: [
    ["Real rules, not folklore", "The timeline comes from RFC 1035 positive caching and RFC 2308 negative caching, not a generic 48-hour guess."],
    ["New vs changed records", "Shows that new records are governed by the SOA negative TTL, not the record's own TTL."],
    ["Honest caveats", "Lists the non-compliant resolver behaviour and application-level pinning that no TTL can control."],
  ],
  faqs: [
    [
      "How long does DNS propagation actually take?",
      "For a change to an existing record, the worst case is the record's old TTL plus a small client-side allowance — with a 3600-second TTL, essentially everyone sees the new answer within about an hour. The '24 to 48 hours' figure describes rare non-compliant resolvers that ignore TTLs, not normal behaviour.",
    ],
    [
      "Why does my new subdomain still not resolve for some people?",
      "Because resolvers that were asked for the name before the record existed cached the negative 'no such name' answer, and RFC 2308 lets them keep it for min(SOA MINIMUM, SOA TTL) — often 3600 seconds. The new record's own TTL is irrelevant to that wait.",
    ],
    [
      "Does lowering the TTL after making a change speed anything up?",
      "No. Caches that already hold the old answer keep it for the TTL that was attached when they fetched it, so the lower TTL only helps queries made after it was published. That is why TTLs must be lowered at least one old-TTL period before the change.",
    ],
    [
      "Do browsers cache DNS separately from the operating system?",
      "Yes. Chromium-based browsers keep their own host cache for roughly 60 seconds regardless of the DNS TTL, and the OS stub resolver caches answers for their remaining TTL. These small layers explain why one browser can still hit the old address moments after a dig query shows the new one.",
    ],
  ],
};

export default seo;
