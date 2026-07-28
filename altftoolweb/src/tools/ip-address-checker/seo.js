const seo = {
  title: "IP Address Checker — Free IPv4 & IPv6 Lookup Tool",
  h1: "IP Address Checker — Validate and Look Up Any IP",
  metaDescription:
    "Check whether an IPv4 or IPv6 address is valid, then see its country, city, ISP, ASN, timezone and map location. Leave the box empty for your own IP.",
  intro:
    "The IP Address Checker validates what you type before it looks anything up: an IPv4 address must be four dot-separated octets each in the 0–255 range, and an IPv6 address must contain colons with at least three colon-separated groups of hex characters. Valid input is then sent to the public ipwho.is JSON API — or, if you leave the field empty, that API reports back whichever public IP your connection is presenting. The response fills in country, region, city, postal code, address type, ISP, ASN, IANA timezone, currency, calling code and coordinates, and the latitude/longitude drives an embedded OpenStreetMap frame with a marker. The request is aborted after 12 seconds, and it goes straight from your browser to ipwho.is rather than through an AltFTool server.",
  useCases: [
    "Confirming a firewall rule or allowlist entry is a syntactically valid IPv4 address before pasting it into a config — every octet is range-checked against 0–255",
    "Identifying which ISP and ASN own an address that keeps appearing in your server or auth logs, alongside the country and city the block is registered to",
    "Checking your own public IP and its apparent location after connecting through a VPN or proxy — leave the field empty and the lookup returns whatever address the internet sees",
  ],
  benefits: [
    [
      "Format validated before the lookup",
      "Malformed input is caught in the browser: IPv4 needs four octets in 0–255, IPv6 needs colons and at least three hex groups, so the Check IP button stays disabled until the format parses.",
    ],
    [
      "Network ownership, not just a map pin",
      "Beyond city and country you get the address type, ISP and ASN — the fields that actually tell you who routes the address and whether it belongs to a datacentre or a consumer ISP.",
    ],
    [
      "Map rendered on the page",
      "Returned coordinates drive an embedded OpenStreetMap view with a marker and a no-referrer policy, plus a link that opens the full map at zoom 10.",
    ],
    [
      "No account and no API key",
      "The lookup runs against the free public ipwho.is endpoint directly from your browser — nothing to sign up for and no key to paste in.",
    ],
  ],
  faqs: [
    [
      "How do I check if an IP address is valid?",
      "Paste it into the box — the format is validated before anything is looked up. IPv4 must be four dot-separated numbers each between 0 and 255, so 192.168.1.1 passes and 192.168.1.256 does not. IPv6 must contain colons and at least three colon-separated groups built only from hex digits, colons and dots. If the format fails, the Check IP button stays disabled and you see 'Enter a valid IPv4 or IPv6 address.'",
    ],
    [
      "What is my public IP address?",
      "Leave the input field empty and press Check IP. With no address supplied the tool requests https://ipwho.is/ , which reports whichever public IP your connection presented — your own, or your VPN's or proxy's if you are behind one. The result appears with a Copy IP button next to it.",
    ],
    [
      "Does an IP lookup show someone's exact location?",
      "No. IP geolocation is approximate. It resolves to the city, region and postal area registered to the network block, not to a street address, and the tool shows coordinates to four decimal places around a rough centre point. Mobile carrier, satellite and VPN addresses can be off by hundreds of kilometres, and an IP identifies a network endpoint rather than a person.",
    ],
    [
      "Is the lookup private — is my IP sent anywhere?",
      "The format check happens in your browser, but the lookup itself is a request to the third-party ipwho.is API, so the address you type — or your own public IP, if you leave the box empty — is sent to that service. The request goes directly from your browser to ipwho.is and never passes through an AltFTool server, and the OpenStreetMap frame is loaded with referrerPolicy set to no-referrer.",
    ],
    [
      "What is an ASN and why is it shown?",
      "An ASN (Autonomous System Number) identifies the network that announces routes for an address block — AS15169 is Google, for example. The Network card shows it beside the ISP name, which is the most reliable way to tell a hosting or cloud network apart from a residential ISP when you are triaging log entries.",
    ],
    [
      "What is the difference between IPv4 and IPv6 here?",
      "IPv4 addresses are 32-bit and written as four decimal octets (8.8.8.8); IPv6 addresses are 128-bit and written as groups of hex digits separated by colons (2001:4860:4860::8888). This checker accepts either, and the 'Address type' field in the results tells you which one the lookup service matched.",
    ],
    [
      "Why did my lookup fail or time out?",
      "The request is aborted after 12 seconds, and you then see 'The lookup took too long. Please try again.' Private and reserved ranges such as 192.168.0.1, 10.0.0.1 or 127.0.0.1 are valid formats but are not routable on the public internet, so the lookup service typically returns no record and the tool reports that the address could not be found.",
    ],
  ],
  steps: [
    "Type an IPv4 or IPv6 address into the field — for example 8.8.8.8 — or leave it empty to check your own public IP.",
    "Press Check IP. The format is validated locally, then the address is sent to the ipwho.is API with a 12-second timeout.",
    "Read the Location, Network and Regional details cards, check the OpenStreetMap embed, then use Copy IP or Open map.",
  ],
};

export default seo;
