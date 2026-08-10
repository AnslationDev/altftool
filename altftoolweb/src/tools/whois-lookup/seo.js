const seo = {
  intro:
    "WHOIS Lookup shows who a domain is registered with, when it was created, when it expires and what state the registry has it in. It queries RDAP — the Registration Data Access Protocol defined in RFC 9082 and RFC 9083, which ICANN made mandatory for gTLD registries and registrars and which replaced port-43 WHOIS — through the public rdap.org bootstrap redirector, which follows IANA's published TLD-to-RDAP-server mapping (RFC 9224), then translates the raw JSON, including every EPP status code, into plain English. Useful for developers, domain buyers and anyone checking a domain before trusting it.",
  useCases: [
    "Checking how old a domain is before trusting an email or invoice that came from it — a domain registered last week is a red flag.",
    "Confirming that clientTransferProhibited is set on your own domain so it cannot be moved without your registrar's involvement.",
    "Finding the registrar's abuse contact address to report a phishing site hosted on a domain.",
  ],
  benefits: [
    ["Status codes explained", "Every EPP code, from clientHold to redemptionPeriod, is shown with what it actually means for the domain."],
    ["Age and expiry maths", "Registration and expiry timestamps are turned into domain age in days and days remaining, all in UTC."],
    ["Straight from the registry", "The query goes to the authoritative RDAP server for the TLD via the public rdap.org bootstrap redirector, which follows IANA's published TLD-to-RDAP-server mapping (RFC 9224) — it only issues a redirect and never touches or relays the actual registration data."],
  ],
  faqs: [
    [
      "What is the difference between WHOIS and RDAP?",
      "WHOIS is unstructured text served on TCP port 43; RDAP serves the same registration data as JSON over HTTPS with defined field names, standardised in RFC 9082 and RFC 9083. ICANN required all gTLD registries and registrars to run RDAP, and it is the only one of the two a web browser can query directly.",
    ],
    [
      "Why is the registrant's name and email hidden?",
      "Since the GDPR came into force in 2018, registries and registrars redact personal contact details from public registration records. You will normally see the registrar, the dates, the nameservers and the status codes, plus a registrar abuse contact, but not the registrant's name or address.",
    ],
    [
      "What does clientTransferProhibited mean?",
      "It means your registrar has locked the domain so it cannot be transferred to another registrar until the lock is lifted. It is a normal anti-hijacking setting and should be on for domains you care about, not a sign of a problem.",
    ],
    [
      "What happens when a domain expires?",
      "For gTLDs the domain typically stops resolving, then enters a 30-day redemption period during which only the original registrant can restore it, usually for a fee, followed by a 5-day pendingDelete window before it is released for anyone to register. Those windows show up as the redemptionPeriod and pendingDelete status codes.",
    ],
  ],
};

export default seo;
