const seo = {
  title: "IP Geolocation Lookup — IP Location & ISP",
  h1: "IP Geolocation Lookup",
  metaDescription:
    "Look up any IP, domain, or URL: city, coordinates, timezone, ISP, ASN, and hosting signals. Free, no signup, IPv4 and IPv6, plus 12-target bulk lookup.",
  intro:
    "IP Geolocation Lookup resolves an IPv4 address, IPv6 address, domain, or full URL to its recorded location and network owner. A domain is stripped to its hostname and resolved through Google's DNS-over-HTTPS JSON endpoint (an A record first, then AAAA), and the resulting address is then queried live from your browser against IPWho.is, IPinfo, or ipapi.co — Auto mode tries all three in that order and falls through when one fails. Because those calls go directly to third-party APIs, the address you enter is sent to whichever provider answers; AltFTool stores nothing. Private and reserved ranges are detected locally and rejected before any request is made.",
  useCases: [
    "Checking where an unfamiliar IP from a server log or firewall rule geolocates, and which ISP or hosting provider announces it",
    "Confirming which country, ASN, and timezone a domain's current A record resolves to before writing a geo rule or allowlist",
    "Pasting a batch of addresses from an access log to compare city, ISP, and provider side by side in one table",
  ],
  benefits: [
    [
      "Three providers with automatic fallback",
      "Auto mode queries IPWho.is first, then IPinfo, then ipapi.co, so a rate limit or outage at one source doesn't end the lookup. You can also pin a single provider from the dropdown and compare how they differ on the same address.",
    ],
    [
      "IPv4, IPv6, domains, and pasted URLs",
      "Input is normalised before lookup: a URL is reduced to its hostname, IPv4 octets are range- and leading-zero-checked, IPv6 is validated for a single :: compression and at most 8 hextets, and domains are resolved over DNS-over-HTTPS.",
    ],
    [
      "Network signals, not a fraud verdict",
      "Results flag private or reserved ranges, anycast (when the provider reports it), missing coordinates, and hosting or cloud keywords — AWS, Azure, Cloudflare, DigitalOcean, Linode, OVH, Vultr — found in the ISP, org, or domain text.",
    ],
    [
      "Developer-ready output",
      "Every lookup exposes the raw provider JSON plus one-click copy for the IP, coordinates (5 decimal places), ISP, ASN, and IANA timezone, with local time rendered from that timezone via Intl.DateTimeFormat.",
    ],
  ],
  faqs: [
    [
      "How accurate is IP geolocation?",
      "Country level is usually right; city level often isn't. The providers behind this tool map an address to the block's registered or inferred location, so coordinates land on a city centre, a data centre, or a regional hub rather than a street address. Mobile carriers, VPN exits, corporate proxies, and anycast addresses can be off by hundreds of kilometres. Treat the result as an approximation of the network, not of a person.",
    ],
    [
      "Can I find someone's exact address from their IP?",
      "No. An IP maps to a network operator's registered location, not a household, and this tool returns nothing that identifies an individual. The coordinates you see are typically a city centroid or the ISP's registered point. Subscriber-level address data sits with the ISP and is only released under legal process.",
    ],
    [
      "How do I look up the location of a website or domain?",
      "Paste the domain or the full URL — the tool strips it to a hostname, resolves it through Google's DNS-over-HTTPS API (A record, then AAAA), and geolocates the address that comes back. For a site behind Cloudflare or another CDN you'll get the edge node's location rather than the origin server's; the tool marks this with a cloud or hosting signal.",
    ],
    [
      "Is this IP lookup free, and do I need an API key?",
      "It's free, with no signup and no key required. IPWho.is and ipapi.co are both queried without credentials. The optional IPinfo token field exists only for people who already have a token and want token-backed fields — it's held in the page's memory for the session, never saved, and only ever sent to ipinfo.io.",
    ],
    [
      "Why does my IP show the wrong city?",
      "Usually because the database records where your ISP registered the address block, not where you are. Mobile data, satellite links, carrier-grade NAT (100.64.0.0/10), business circuits, and VPN endpoints commonly resolve to a different city or region. Switching between the three providers in the dropdown often shows them disagreeing on the same address for exactly this reason.",
    ],
    [
      "Can I look up multiple IP addresses at once?",
      "Yes — up to 12 per run. Paste addresses or domains into the Bulk Lookup box separated by new lines, commas, or spaces. Duplicates are removed, the first 12 unique entries are queried one after another, and each row reports the resolved IP, location, ISP, which provider answered, and an OK status or the specific error.",
    ],
    [
      "What is an ASN and why does it appear in the results?",
      "An ASN (Autonomous System Number, shown in AS15169 form) identifies the network that announces an IP block on the internet's global routing table. It's a more stable identifier than a city or an ISP's marketing name — addresses in different countries can share one ASN if the same operator runs them — which makes it useful for grouping log entries or telling hosting traffic apart from consumer broadband.",
    ],
    [
      "Does it work with IPv6 and private addresses like 192.168.1.1?",
      "IPv6 works; private addresses are rejected by design. Reserved ranges — 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16, 100.64.0.0/10, ::1, fc00::/7, and fe80::/10 — are identified in your browser and refused with an explanation, because they only exist inside local networks and have no public geolocation to return.",
    ],
  ],
  steps: [
    "Enter an IPv4 or IPv6 address, a domain, or a full URL — or press \"My IP\" to detect your own public address via api.ipify.org.",
    "Leave the provider on Auto (IPWho.is, then IPinfo, then ipapi.co) or pin a single one, then click Lookup.",
    "Read the city, coordinates, timezone, ISP, ASN, and network signals, then copy any field, the map link, or the raw JSON.",
  ],
};

export default seo;
