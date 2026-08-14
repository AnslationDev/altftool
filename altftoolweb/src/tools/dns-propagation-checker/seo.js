const seo = {
  title: "DNS Propagation Checker: Google vs Cloudflare",
  metaDescription:
    "Query a domain's A record through Google Public DNS and Cloudflare over DNS-over-HTTPS at once, so a stale local or ISP cache cannot mislead you.",
  steps: [
    "Type the domain into the Lookup field, which is prefilled with altftool.com.",
    "Press Get current result to query Google Public DNS and Cloudflare over DNS-over-HTTPS at the same time.",
    "Compare the two rows under Current result - each resolver's response status and the A-record answers it returned - with the fetch timestamp above them.",
  ],
  intro:
    "The DNS Propagation Checker queries a domain through two independent public resolvers — Google Public DNS and Cloudflare — over DNS-over-HTTPS and puts their answers side by side, along with each resolver's response status and the remaining TTL on the record. Because it asks resolvers that are separate from the one your own machine uses, it shows whether a record change has reached the wider internet or is still cached somewhere. It defaults to the A record and is aimed at anyone who has just edited DNS and is waiting for it to take effect.",
  useCases: [
    "You repointed a site's A record to a new host an hour ago and want to see whether Google and Cloudflare are both returning the new IP or one is still serving the old one.",
    "A colleague says the site loads for them but not for you, and you need to establish whether that is a stale cached record rather than a server outage.",
    "You added a verification TXT or an MX record for a mail provider and want independent confirmation it is visible before clicking verify.",
  ],
  benefits: [
    [
      "Two independent resolvers, not just yours",
      "Answers come from Google Public DNS and Cloudflare directly, so a stale entry in your ISP resolver or local cache cannot mislead you.",
    ],
    [
      "TTL shown with the answer",
      "Each row reports the remaining time-to-live, which tells you how much longer a cached copy of the old record can still be handed out.",
    ],
    [
      "Failures reported per resolver",
      "If one resolver times out or errors, its row says so instead of the whole lookup failing, so you can still read the other result.",
    ],
  ],
  faqs: [
    [
      "How long does DNS propagation take?",
      "It is governed by the TTL on the record, not by a fixed global timer. A record with a 300-second TTL can be picked up within five minutes, while a 24-hour (86,400-second) TTL means some caches keep serving the old value for a full day. Lowering the TTL before a planned change shortens the wait.",
    ],
    [
      "Why do the two resolvers show different answers?",
      "Because each caches independently. One resolver may still be inside the old record's TTL while the other has already refreshed. A mismatch normally means the change is mid-flight; if it persists well past the TTL, check the record at the authoritative nameserver.",
    ],
    [
      "What does TTL mean in a DNS record?",
      "Time-to-live is how many seconds a resolver may cache the answer before asking again. A TTL of 3,600 means a cached record can be reused for one hour, so an edit made now may not be visible everywhere until that hour has passed.",
    ],
    [
      "Does this check my own computer's DNS?",
      "No. It queries the public resolvers over HTTPS, so it deliberately bypasses your machine, router and ISP caches. If the tool shows the new record but your browser does not, flush your local DNS cache and retry.",
    ],
  ],
};

export default seo;
