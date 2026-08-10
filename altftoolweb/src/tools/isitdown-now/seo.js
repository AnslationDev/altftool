const seo = {
  title: "Is It Down Now? Check if a Site Is Down for Everyone",
  metaDescription:
    "Requests your URL from ALTFTool's server and reports the HTTP status code, response time in ms and final URL after redirects — down for all, or just you.",
  steps: [
    "Type the site's domain into the Lookup field — the https:// prefix is added for you, and private, local or reserved addresses are refused.",
    "Press 'Get current result' to request the URL from ALTFTool's server instead of your own connection.",
    "Read the Current result panel: the HTTP status code, the measured response time in milliseconds and the final URL after up to four redirects, with an updated timestamp and source.",
  ],
  intro:
    "IsItDown Now checks whether a website is unreachable for everyone or only on your own connection, by requesting the URL from ALTFTool's server and reporting the HTTP status code, the round-trip time in milliseconds and the final URL after redirects. Enter a domain such as example.com — the https:// prefix is added for you — and an independent second opinion comes back in seconds. It is for anyone staring at a failed page and trying to work out whether to report an outage or fix their own network.",
  useCases: [
    "A site times out for you and you need to know whether it is genuinely down before emailing the vendor or restarting your router.",
    "You have just changed DNS or deployed a redirect and want to see the final URL and status code an outside client actually lands on.",
    "A colleague says a service works fine for them, and you want a neutral third check from a different network before escalating.",
  ],
  benefits: [
    [
      "A view from outside your network",
      "The request originates from ALTFTool's server, so a result that succeeds while your browser fails points at your ISP, DNS or local firewall rather than the site.",
    ],
    [
      "Status, latency and redirect chain",
      "Returns the raw HTTP status code, the measured response time in milliseconds and the final URL after following up to four redirects, rather than a bare up/down badge.",
    ],
    [
      "Refuses unsafe targets",
      "Private, local and reserved addresses are blocked, as are embedded credentials and custom ports, so the checker cannot be pointed at internal infrastructure.",
    ],
  ],
  faqs: [
    [
      "How do I tell if a website is down for everyone or just me?",
      "Run the check here: if the server gets an HTTP response and yours does not, the site is up and the problem is on your side — DNS, ISP, VPN or a local firewall. If the request fails from the server too, the outage is at the site or its network.",
    ],
    [
      "What do the results mean?",
      "A status in the 200s means the page loaded normally, 301 or 302 means a redirect was followed to the final URL shown, 403 or 404 means the server answered but refused or could not find that path, and 5xx means the site's own server errored. Any of these confirms the host is reachable, even when the page itself is broken.",
    ],
    [
      "Does a slow response mean the site is down?",
      "No. The response time shown is measured from ALTFTool's server region and a request is abandoned only after 9 seconds, so a figure of a few hundred milliseconds is healthy and a few thousand means slow but alive. Distance between the server and the site accounts for part of that number.",
    ],
    [
      "Does it check from multiple countries?",
      "No. The check comes from a single ALTFTool server region, not from every global network, so a site blocked or misrouted only in a particular country may still report as responding here. Use a multi-region monitor when you need geographic coverage.",
    ],
  ],
};

export default seo;
