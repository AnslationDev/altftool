const seo = {
  title: "DMARC Record Generator — RFC 7489 TXT Builder",
  metaDescription:
    "Build the _dmarc TXT record with p, sp, pct, rua/ruf, alignment and fo tags validated to RFC 7489, plus rollout warnings before you enforce.",
  steps: [
    "Enter your Domain and set Policy (p), Subdomain policy (sp), Percentage sampled (pct, 0-100) and the rua/ruf report addresses.",
    "Choose DKIM alignment (adkim), SPF alignment (aspf) and tick any Failure reporting options (fo) — the record rebuilds as you type.",
    "Copy record puts the _dmarc host name and quoted v=DMARC1 value on the clipboard, with a per-tag breakdown and rollout warnings below.",
  ],
  intro:
    "This generator builds the DMARC TXT record defined by RFC 7489 — the v=DMARC1 policy string published at _dmarc.yourdomain — with every tag validated: policy (p), subdomain policy (sp), sampling percentage (pct 0-100), aggregate and forensic report addresses (rua/ruf), SPF and DKIM alignment modes (aspf/adkim) and failure options (fo). It is for domain owners and email admins rolling out DMARC enforcement or fixing a record their mail provider flagged as invalid.",
  useCases: [
    "Publishing a first p=none monitoring record with an aggregate report address before any enforcement",
    "Tightening an existing policy to quarantine with pct=25 to sample a quarter of failing mail during rollout",
    "Generating a p=reject record with strict DKIM alignment for a domain that sends no marketing mail through third parties",
  ],
  benefits: [
    ["Every tag validated", "pct bounds, report address syntax, alignment values and policy names are checked against RFC 7489 before output."],
    ["Rollout warnings built in", "Flags risky combinations like p=reject with no reporting address or pct used with p=none."],
    ["External reporting caught", "Warns when reports go to another domain, which requires the RFC 7489 external destination verification record."],
  ],
  faqs: [
    [
      "What is a DMARC record and where do I publish it?",
      "A DMARC record is a TXT record published at the name _dmarc.yourdomain.com that starts with v=DMARC1 and tells receiving mail servers what to do with messages that fail SPF and DKIM alignment. It is defined by RFC 7489 and requires SPF and/or DKIM to already be in place.",
    ],
    [
      "What is the difference between p=none, p=quarantine and p=reject?",
      "p=none asks receivers to deliver failing mail normally and only send you reports; p=quarantine asks them to treat failures as suspicious, typically filing them to spam; p=reject asks them to refuse the message outright. The standard rollout path is none, then quarantine, then reject as reports confirm legitimate mail is aligned.",
    ],
    [
      "What does pct mean in a DMARC record?",
      "pct is the percentage of failing messages, from 0 to 100, that the quarantine or reject policy is applied to — the rest are treated one level softer. The default is 100, and pct has no effect under p=none since there is no enforcement to sample.",
    ],
    [
      "Can DMARC reports be sent to a different domain than my own?",
      "Yes, but RFC 7489 section 7.1 requires the receiving domain to authorize it by publishing a verification TXT record at yourdomain._report._dmarc.reportingdomain.com. Without that record, many receivers will refuse to send reports to the external address.",
    ],
  ],
};

export default seo;
