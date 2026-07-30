const seo = {
  intro:
    "Domain Expiry Radar looks up a domain in the RDAP registry system and reports its registration, expiration and last-changed dates alongside its EPP status codes and registrar handle. Enter a domain name and the tool queries the RDAP bootstrap service, pulls the registry's own event records, and lays them out as plain rows. It is built for anyone who needs the authoritative expiry date from the registry rather than a scraped or cached WHOIS copy.",
  useCases: [
    "You inherited a company's domain portfolio with no renewal calendar and need to know which names expire first before one of them lapses.",
    "A client's site went dark and you want to check whether the domain simply expired or whether the registry has flagged it with a hold or lock status.",
    "You are about to buy a domain from a broker and want to confirm the real registry expiration date and registrar against what the seller claims.",
  ],
  benefits: [
    [
      "Registry data, not scraped WHOIS",
      "Queries RDAP, the structured JSON protocol that registries maintain themselves, so dates come straight from the source of record.",
    ],
    [
      "Status codes surfaced, not hidden",
      "Shows the domain's EPP status strings such as clientTransferProhibited or redemptionPeriod, which explain why a transfer or renewal is blocked.",
    ],
    [
      "Every field labelled honestly",
      "Registries that omit an event or registrar entry are reported as \"Not supplied\" rather than filled in with a guess.",
    ],
  ],
  faqs: [
    [
      "What happens after a domain expires?",
      "For generic TLDs the domain usually enters an auto-renew grace period, then a 30-day Redemption Grace Period during which only the original registrant can restore it, typically for a redemption fee. After that it goes to a roughly five-day pending-delete window and is released. Exact windows are set by the registry and registrar, so check your registrar's own policy.",
    ],
    [
      "Why does the expiration date here differ from my registrar's dashboard?",
      "The date shown comes from the registry's RDAP record, which is the authoritative one. Registrars sometimes display a slightly earlier internal renewal deadline so they can process the renewal before the registry cut-off, and some ccTLD registries do not publish an expiration event at all.",
    ],
    [
      "Is RDAP the same thing as WHOIS?",
      "RDAP is the standardised replacement for WHOIS. It returns structured JSON instead of free-form text, supports internationalised data properly, and is the protocol ICANN now requires gTLD registries and registrars to run, which is why its fields parse reliably where WHOIS text does not.",
    ],
    [
      "Does this tool monitor my domain and alert me before it expires?",
      "No, it performs an on-demand lookup each time you request a current result. Use the expiration date it returns to set your own calendar reminder, and enable auto-renew at your registrar if you want protection that does not depend on you checking.",
    ],
  ],
};

export default seo;
