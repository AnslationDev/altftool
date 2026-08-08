const seo = {
  title: "Email Alias Planner: Plus Tags, Catch-All, Relays",
  metaDescription:
    "Compare five alias schemes for your provider, generate one address per service, and validate each against the RFC 64- and 254-character limits.",
  steps: [
    "Pick your Mail provider — Gmail / Google Workspace, iCloud Mail, Outlook.com / Hotmail, Proton Mail, Fastmail or Yahoo Mail — enter the mailbox everything should land in, and tick what the scheme has to do.",
    "Read the ranked table of five strategies with its Fit, Hides real address, Can be switched off and Strippable columns, then set Strategy to generate for and a Tag naming scheme.",
    "List your services one per line and read the generated addresses with Longest address and Headroom before the 254-character limit; Copy all takes the whole set, or Copy an individual alias.",
  ],
  intro:
    "This planner picks an email aliasing strategy from your actual constraints — provider, budget, whether you own a domain, whether you need to reply — then generates the per-service addresses and validates them against the limits mail servers enforce: 64 characters for the local part (RFC 5321) and 254 for the whole address. It compares five workable approaches: a forwarding alias service, a catch-all on your own domain, subdomain addressing, RFC 5233 plus tagging, and Gmail's dot variations. The point of a unique address per service is attribution: when spam arrives at an address only one company ever had, you know exactly who leaked or sold it.",
  useCases: [
    "Work out whether plus tagging is enough for you or whether a forwarding relay is worth the extra step.",
    "Generate a consistent alias for every account you already hold, so a future breach notice tells you which signup it came from.",
    "Find an alias scheme that still works on the signup forms that reject a plus sign in the email field.",
    "Check that a long service name plus a long mailbox name will not blow past the 64-character local-part limit.",
  ],
  benefits: [
    ["Matched to your provider", "Gmail, iCloud, Outlook, Proton, Fastmail and Yahoo differ on what they support, and the ranking reflects that."],
    ["Validated against the RFCs", "Every generated address is checked for local-part length, total length, dot-atom syntax and duplicates."],
    ["Honest about the weak spots", "Plus tags and Gmail dots are marked as strippable, because anyone can normalise them back to your real mailbox."],
  ],
  faqs: [
    [
      "Does Gmail support plus addressing?",
      "Yes. Gmail routes anything sent to you+tag@gmail.com to you@gmail.com, and it also ignores every dot in the local part, so first.last@gmail.com and firstlast@gmail.com are the same mailbox. iCloud, Outlook.com, Proton and Fastmail also honour plus tagging; Yahoo does not.",
    ],
    [
      "Is a plus alias actually private?",
      "No. A plus tag identifies who leaked your address but does not hide it — deleting everything between the plus and the at-sign recovers your real mailbox, and list brokers routinely do exactly that. If the site must never learn your real address, use a forwarding alias service or a catch-all on a domain you own.",
    ],
    [
      "What is the maximum length of an email address?",
      "The local part before the @ is capped at 64 octets and the whole address at 254 characters, from RFC 5321 and erratum 1690 to RFC 3696. Many web forms enforce shorter limits of their own, so keep aliases well under those numbers.",
    ],
    [
      "Should I use a disposable address for my bank?",
      "No. Use a stable address you control for banking, tax, government and anything with account recovery attached, because losing access to a relay or letting a domain lapse can lock you out permanently. Save aliases for shopping, newsletters, forums and trials.",
    ],
  ],
};

export default seo;
