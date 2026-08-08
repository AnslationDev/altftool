const seo = {
  title: "CAA Record Generator: RFC 8659 issue, issuewild, iodef",
  metaDescription:
    "Build RFC 8659 CAA records — issue, issuewild and iodef tags with the flags octet — to limit which CAs may issue TLS certificates for your domain.",
  steps: [
    "Enter the Domain and TTL (seconds), then tick the certificate authorities allowed to issue — Let's Encrypt, DigiCert, Sectigo, Google Trust Services and others are listed with their identifiers.",
    "Set Wildcard certificates (issuewild) to \"Same CAs as normal certificates\", \"Different CA list for wildcards\" or \"Forbid wildcard issuance entirely\", add an address under Violation reports to (iodef, optional), and tick the issuer-critical flag (128) if you want it.",
    "The CAA record set panel shows the zone-file lines and how many records to publish, with warning notes underneath; press Copy records to take the zone lines, or Reset to restore the defaults.",
  ],
  intro:
    "This generator builds CAA (Certification Authority Authorization) records as defined by RFC 8659 — DNS records that name the certificate authorities permitted to issue TLS certificates for a domain, using the issue, issuewild and iodef tags with the correct flags octet. Public CAs have been required to check CAA before every issuance since 8 September 2017 under the CA/Browser Forum Baseline Requirements, so a correct record set meaningfully reduces mis-issuance risk. It is for site owners, security teams and anyone completing a security questionnaire that asks for CAA.",
  useCases: [
    "Locking issuance to Let's Encrypt on a domain that only ever uses certbot-issued certificates",
    "Allowing normal certificates from one CA while forbidding wildcard issuance entirely with issuewild \";\"",
    "Publishing an iodef address so CAs report attempted policy violations to your security team",
  ],
  benefits: [
    ["RFC 8659 syntax exact", "Flags octet, tag names and quoted values come out in valid zone-file form every time."],
    ["Known CA identifiers built in", "Pick Let's Encrypt, DigiCert, Sectigo, Google Trust Services and other registered identifiers without looking them up."],
    ["Renewal-breaking mistakes flagged", "Warns when a record set would block all issuance and explains subdomain inheritance."],
  ],
  faqs: [
    [
      "What does a CAA record do?",
      "A CAA record lists which certificate authorities may issue TLS certificates for your domain; any CA not named must refuse the request. Since 8 September 2017, all publicly trusted CAs are required by the CA/Browser Forum Baseline Requirements to check CAA before issuing, so the restriction is enforced industry-wide.",
    ],
    [
      "Do CAA records apply to subdomains?",
      "Yes. RFC 8659 has the CA walk up the DNS tree from the requested name and apply the closest CAA record set it finds, so records on example.com govern shop.example.com unless that subdomain publishes its own CAA records.",
    ],
    [
      "What happens if I have no CAA record at all?",
      "Any publicly trusted CA may issue for your domain, subject to its normal domain-control validation. CAA is opt-in: an empty record set imposes no restriction, which is why adding one for just the CAs you use is a cheap security win.",
    ],
    [
      "Can a wrong CAA record break my HTTPS certificate renewal?",
      "Yes — if your CA is not listed, its next validation attempt fails and the renewal is refused, though existing certificates keep working until they expire. Before publishing, confirm the identifier your CA documents (for example ZeroSSL certificates are covered by sectigo.com), and remember the record is cached for its TTL after you fix it.",
    ],
  ],
};

export default seo;
