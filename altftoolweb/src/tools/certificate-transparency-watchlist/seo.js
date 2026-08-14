const seo = {
  title: "Certificate Transparency Watchlist and Lookalikes",
  metaDescription:
    "Build crt.sh queries and squatting variants for domains you own, then classify pasted certificate names with punycode decoding and skeleton folding.",
  steps: [
    "Enter the domains you own, one per line, into 'Domains you own (one per line)' and tick 'Include TLD swaps' to add the same label under .net, .co, .app and other common suffixes.",
    "Run the crt.sh strings listed under 'Queries to run', then paste the results into 'Certificate names from your CT search (one per line)' — a CN= prefix, a *. wildcard, a URL, a trailing dot or a tab-separated crt.sh row are all handled.",
    "'Findings' sorts each name into suspicious, review, invalid, unrelated or owned and names the rule that fired; press 'Copy findings' for the text, or 'Copy names' for the generated lookalike list.",
  ],
  intro:
    "This tool does the two halves of certificate transparency monitoring that can honestly be done in a browser. First it turns the domains you own into a watchlist: the crt.sh search strings for the exact name, every subdomain and the label anywhere, plus the lookalike names worth watching for, generated with the documented squatting techniques — omission, duplication, transposition, QWERTY slip, ASCII homoglyph, hyphenation, TLD swap and combosquat. Second, it classifies the certificate names you paste back from that search: xn-- labels are decoded with the RFC 3492 punycode algorithm, labels are folded to a confusable skeleton, and edit distance is measured against a fixed budget. It does not query a CT log, because that needs a live index — and it says so rather than pretending.",
  useCases: [
    "You are setting up CT monitoring for a brand and need the list of lookalike names to load into your monitor, generated systematically rather than guessed",
    "A crt.sh search for your domain returned a few hundred names and you want to triage them — which are your own subdomains, which are wildcards you should account for, and which are somebody else's",
    "A phishing report came in with a domain that looks like yours, and you want to see exactly which mechanism it uses: a homoglyph, a transposition, a TLD swap, or your brand parked to the left of somebody else's registrable domain",
  ],
  benefits: [
    [
      "Real punycode, not a substring check",
      "xn-- labels are decoded with the full RFC 3492 algorithm and judged by what they render as, so a Cyrillic homograph is caught rather than filed as an unfamiliar ASCII string.",
    ],
    [
      "Every verdict names its rule",
      "Skeleton match, edit distance with the budget shown, brand-left-of-the-registrable-domain, combosquat, TLD swap — you see which test fired and can overrule it.",
    ],
    [
      "Systematic variant generation",
      "The lookalike list is produced by applying each documented squatting technique to every character position, so it is complete for those techniques and identical every time you run it.",
    ],
  ],
  faqs: [
    [
      "Does this search Certificate Transparency logs?",
      "No. CT search requires a live index such as crt.sh, Censys or a monitor you run, and this page makes no network request. It builds the queries for you to run and then analyses the names you paste back. Everything it claims to do — variant generation, punycode decoding, confusable folding, distance scoring — is genuinely local.",
    ],
    [
      "What is the registrable domain and why does it matter so much?",
      "It is the label immediately to the left of the public suffix: in yourbrand.com.attacker.net that is attacker.net, not yourbrand.com. Browsers and TLS both anchor on the right-hand side, so a name that begins with your brand can belong entirely to somebody else. The tool anchors on the same place, which is why it flags that pattern as impersonation rather than treating it as yours.",
    ],
    [
      "What is a skeleton comparison?",
      "Each label is reduced to a canonical form: Unicode is decomposed and combining marks dropped, confusable code points from Cyrillic, Greek and the Latin extensions are folded onto one Latin representative, and multi-character lookalikes such as rn for m are collapsed. Two labels that reduce to the same skeleton render alike even though their bytes differ, which is exactly the condition a homograph attack needs.",
    ],
    [
      "Should I register every name the watchlist generates?",
      "Almost certainly not — the list is for monitoring, not for buying. Defensive registration is expensive and the variant space is large. The useful move is to feed the names to a CT monitor so you find out when somebody else gets a certificate for one, which is the moment a lookalike domain becomes an active phishing site rather than a parked one.",
    ],
  ],
};

export default seo;
