const seo = {
  title: "DNS TTL Planner: Lower, Cut Over, Restore",
  metaDescription:
    "Turns your current TTL into a cutover schedule: lower it one doubled TTL period ahead, see when the change is visible, and restore the steady TTL.",
  steps: [
    "Enter Current TTL on the record (seconds) — it opens at 86400 — plus the Temporary migration TTL (seconds), defaulted to 300, and the TTL to restore afterwards (seconds).",
    "The headline Lower the TTL this long before cutover appears immediately, computed as one old-TTL period doubled for safety, with rows for Lead time before cutover, Visible after cutover and Total low-TTL window.",
    "Work down the timestamped step list and the rollback note beneath it, then check the Steady-state TTLs by record type table (A / AAAA, CNAME, MX, TXT, NS, CAA with a suggested value, typical range and reason). Copy plan copies the schedule; Reset restores 86400 / 300 / 3600.",
  ],
  intro:
    "This planner turns the DNS caching rule of RFC 1035 — resolvers keep an answer for the TTL attached when they fetched it — into a concrete migration schedule: when to lower the TTL before a cutover, when the change becomes fully visible afterwards, and when to restore the steady-state TTL. It also recommends steady-state TTLs per record type (A/AAAA, CNAME, MX, TXT, NS, CAA). It is for engineers planning a server move, provider switch or load-balancer swap who want the timing computed rather than guessed.",
  useCases: [
    "Scheduling when to drop a 86400-second TTL to 300 before repointing a website to a new host",
    "Producing a written cutover timeline for a change-management ticket, including the fast-rollback window",
    "Reviewing a zone's TTLs and aligning A, MX and NS records with sensible steady-state values",
  ],
  benefits: [
    ["Lead time computed, not guessed", "The lower-before-cutover interval is derived from your actual current TTL with a stated safety factor."],
    ["Rollback window included", "Shows how fast an undo propagates while the low TTL is live — the main reason to lower it at all."],
    ["Restore step enforced", "The plan ends by raising the TTL back, avoiding the silent query-load cost of permanently low TTLs."],
  ],
  faqs: [
    [
      "How long before a DNS cutover should I lower the TTL?",
      "At least one full current-TTL period before the change, because caches that fetched just before the lowering keep the old TTL that long; doubling that lead time is standard safety practice. With a 24-hour TTL, that means lowering it around 48 hours before the cutover.",
    ],
    [
      "What is a good TTL for DNS records in normal operation?",
      "Common practice is 300-3600 seconds for A/AAAA and CNAME records that might be repointed, 3600-86400 for MX and TXT, and 86400 or more for NS records. Short TTLs buy agility at the cost of more queries and slightly slower lookups; long TTLs do the opposite.",
    ],
    [
      "Why not just leave the TTL at 60 seconds all the time?",
      "Every cache expiry forces a fresh recursive lookup, so a permanently tiny TTL multiplies query volume to your DNS provider and adds resolver latency for users, while some resolvers clamp very low TTLs upward anyway. Lower the TTL for planned changes, then restore it.",
    ],
    [
      "Does raising a TTL propagate as slowly as lowering one?",
      "No — raising is instant in effect: caches holding the short-TTL copy expire quickly and the next fetch carries the new long TTL. Only lowering needs lead time, because you must wait out caches that still hold the old, longer TTL.",
    ],
  ],
};

export default seo;
