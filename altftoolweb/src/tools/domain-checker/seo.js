const seo = {
  title: "Domain Availability Checker — Free Instant DNS Check",
  h1: "Domain Availability Checker",
  metaDescription:
    "Check if a domain name is taken — free, no signup. Queries Cloudflare's DNS-over-HTTPS resolver for NS then A records and reports available or taken.",
  intro:
    "The Domain Checker tells you whether a domain name is already in use by querying Cloudflare's public DNS-over-HTTPS resolver straight from your browser — a request to cloudflare-dns.com/dns-query with the application/dns-json header, with no AltFTool backend and no API key in between. It asks for the domain's NS records first: an NXDOMAIN reply (DNS status 3) means nothing is delegated for that name, so the tool reports it available, while a NOERROR reply carrying nameserver answers means the domain is taken. If the NS lookup comes back inconclusive it repeats the query for A records, and if that is still ambiguous it defaults to \"taken\" rather than show a false \"available\". Because it reads DNS rather than the registry, it answers in one round trip but is an indicator of delegation, not a registry-authoritative registration record.",
  useCases: [
    "Testing a shortlist of startup, product or side-project names one at a time before you take the winner to a registrar",
    "Confirming that a domain someone quoted you is actually live in DNS rather than just claimed",
    "Sanity-checking a domain you registered recently to see whether its nameservers have been delegated yet",
  ],
  benefits: [
    [
      "No API key, no quota",
      "The lookup runs from your browser against Cloudflare's public DoH endpoint, so there is no shared backend key to exhaust and no daily search cap to hit.",
    ],
    [
      "Checks NS before A",
      "Nameserver records reveal delegation even when a domain has no website or mail set up, catching registered names that an A-record-only check would report as free.",
    ],
    [
      "Conservative when uncertain",
      "If neither the NS nor the fallback A query returns a clean NXDOMAIN or a populated answer section, the result shown is \"taken\" — never a false \"available\".",
    ],
    [
      "Pasted URLs are cleaned up",
      "Enter https://www.example.com/pricing and it checks example.com; the protocol, the www prefix and everything after the first slash are stripped before the query.",
    ],
  ],
  faqs: [
    [
      "How do I check if a domain name is already taken?",
      "Type the domain into the box and press Check Domain or Enter. The tool asks Cloudflare's DNS resolver for that name's NS records — if the resolver answers NXDOMAIN, no nameservers exist for it and you get a green \"Domain Available\"; if nameservers come back, you get a red \"Domain Taken\". A fallback A-record query runs when the first result is inconclusive.",
    ],
    [
      "Does this domain checker use WHOIS?",
      "No. It is a DNS check, not a WHOIS or RDAP registry lookup. It reads whether the name is delegated in the DNS through Cloudflare's DNS-over-HTTPS API, which is faster and has no rate limit, but it does not return registrar, registration date, expiry or owner details.",
    ],
    [
      "Why does it say a domain is available when it's actually registered?",
      "Because a registered domain with no nameservers delegated returns NXDOMAIN, exactly like an unregistered one. That happens with names parked without DNS, domains registered minutes ago that have not propagated, and names sitting in a redemption or expiry state. Always confirm at a registrar's checkout before assuming a name is free.",
    ],
    [
      "Is the domain checker free and do I need an account?",
      "Yes, it's free, and there is no signup, login or API key. The page calls Cloudflare's public resolver directly from your browser, so there is nothing to register for and no per-user limit.",
    ],
    [
      "Which domain extensions can I check?",
      "Any TLD that resolves in the public DNS — .com, .net, .org, .io, .co, .ai, country codes like .in or .uk, and newer extensions all work. The input has to be a full domain with a dot and an extension of at least two letters, so \"example\" alone is rejected while \"example.com\" is accepted.",
    ],
    [
      "Is my domain search stored or tracked?",
      "The domain you type is sent over HTTPS to Cloudflare's public DNS resolver, which is what performs the lookup, so it is not a fully offline check. Nothing is sent to an AltFTool server and no search history is written on this page — the entire check is the one encrypted DNS query.",
    ],
    [
      "Can I check several domains at once?",
      "No — the tool checks one domain per search. After a result appears, use \"Check Another Domain\" to clear the field and run the next name. There is no bulk upload, no cross-TLD comparison and no automatic alternative-name generator.",
    ],
    [
      "Can I register the domain through this tool?",
      "No. It only reports availability. Once a name looks free, register it at a domain registrar; the registry there is the authoritative source and will confirm whether the name is genuinely unregistered and what it costs.",
    ],
  ],
  steps: [
    "Type or paste the domain you want to check, such as google.com or myidea.io. A full URL is fine — https://, www. and any path after the first slash are stripped automatically, and the name is lowercased before it is validated.",
    "Press Check Domain or hit Enter. The tool sends a DNS-over-HTTPS query to cloudflare-dns.com for the domain's NS records, then repeats the query for A records if the first response is inconclusive.",
    "Read the result. Green \"Domain Available\" means the resolver returned NXDOMAIN and no nameservers are delegated for that name; red \"Domain Taken\" means the domain resolves. Click Check Another Domain to reset and search the next name.",
  ],
};

export default seo;
