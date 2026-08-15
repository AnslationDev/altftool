const seo = {
  title: "Domain Expiry Planner: Grace, Redemption & Drop",
  metaDescription:
    "Turn one expiry date into a dated gTLD timeline: registrar grace, 30-day redemption, 5-day pending delete, drop date, ERRP reminders and transfer locks.",
  steps: [
    "Enter the domain, its \"Registry expiry date\", the registrar renewal grace days and your renewal and redemption fees.",
    "Tick which safeguards are already true — auto-renew, the clientTransferProhibited lock, a monitored registrant email and two-factor on the account.",
    "Read the days-until-drop figure, lifecycle timeline and risk score out of 100, then click \"Copy plan\" for a dated action list.",
  ],
  intro:
    "Domain Expiry and Renewal Planner turns one expiry date into the full gTLD lifecycle: the registrar's renewal grace, the 30-day redemption grace period, the 5-day pending delete window, and the day the name drops to the public. It also dates the ERRP reminder emails your registrar is required to send, the 60-day inter-registrar transfer lock, and the last safe date to start a transfer. Built for anyone responsible for a domain that a business, its email or its certificates depend on.",
  useCases: [
    "Work out exactly how many days remain before an expired domain stops being recoverable at the normal renewal price.",
    "Check whether a newly registered or newly transferred domain is still inside its 60-day transfer lock before promising a migration date.",
    "Plan a registrar move so the transfer clears well before expiry rather than colliding with it.",
    "Hand a colleague a dated timeline and action list for a domain that has already expired and gone dark.",
  ],
  benefits: [
    ["Every window dated", "Grace, redemption, pending delete and drop are calculated from your own expiry date and registrar grace period."],
    ["Explains why the site dies early", "ERRP requires DNS resolution to be interrupted after expiry, so the outage starts before the name is at risk."],
    ["Names the real failure modes", "Auto-renew off, a stale registrant email and a registrar account without two-factor cause more losses than forgetting the date."],
  ],
  faqs: [
    [
      "How long after a domain expires can I still get it back?",
      "For a gTLD, the registrar's post-expiry renewal grace comes first — anything from 0 to 45 days, set by the registrar — then a 30-day Redemption Grace Period where recovery requires a restore and a redemption fee, then 5 days of Pending Delete where nothing can be restored. After that the name is released and anyone can register it.",
    ],
    [
      "Why did my website go down before the domain actually expired from the registry?",
      "Because the Expired Registration Recovery Policy requires the registrar to interrupt DNS resolution for an expired name rather than let it keep working silently. Most registrars redirect the name to a renewal notice page within about a week of expiry, so the site and any email on that domain stop long before the name is genuinely at risk.",
    ],
    [
      "Why can I not transfer my domain to another registrar?",
      "The ICANN Transfer Policy blocks an inter-registrar transfer within 60 days of the initial registration and within 60 days of a completed transfer. A change of registrant can also trigger a 60-day lock depending on your registrar and the current version of the policy. Separately, the registrar lock status clientTransferProhibited has to be cleared and an authorisation code obtained before a transfer will start at all.",
    ],
    [
      "Is it cheaper to renew for several years at once?",
      "The per-year price is rarely much lower, but the risk is. Every renewal cycle is another chance for an expired card, a bounced reminder or a departed colleague to cost you the name, and a redemption fee is typically several times a normal renewal. Multi-year registration plus working auto-renew and a monitored shared mailbox removes most of that exposure. This is informational only — confirm the actual fees and grace periods with your own registrar.",
    ],
  ],
};

export default seo;
