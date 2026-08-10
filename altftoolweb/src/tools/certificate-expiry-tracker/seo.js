const seo = {
  title: "TLS Certificate Expiry Tracker With .ics Reminders",
  metaDescription:
    "Track notAfter dates in your browser: days remaining, renewal deadline at your lead time, worst-first sorting and a certificate-renewals.ics download.",
  steps: [
    "Fill in 'Hostname or certificate name', the 'Expiry date (notAfter)' from your CA dashboard or the browser padlock, an 'Owner (person or team)' and a 'Renewal lead time (days before expiry)' of 0 to 398, then press 'Add certificate'.",
    "The list sorts worst-first — expired, then inside 7 days, then open renewal windows — and lives in your browser's localStorage; 'Clear list' empties it.",
    "Read 'Certificates needing action' out of the total tracked, then press 'Copy report' for the text summary or 'Reminders (.ics)' to download certificate-renewals.ics with an all-day reminder on each renewal date.",
  ],
  intro:
    "This tracker computes the days remaining and the renewal deadline for every TLS certificate you list, flags anything expired or inside its renewal window, and exports RFC 5545 iCalendar reminders. It applies the CA/Browser Forum rule capping public certificates at 398 days of validity and defaults to the 30-day renewal lead time Let's Encrypt recommends. It is built for sysadmins and DevOps teams who track a handful of certificates and want a local list — everything stays in the browser, nothing is uploaded.",
  useCases: [
    "An ops team listing 15 customer-facing domains with owners so the next expiry never surprises them",
    "A freelancer downloading .ics renewal reminders for client sites into Google Calendar or Outlook",
    "An admin triaging which certificates are already inside their 30-day renewal window after coming back from leave",
  ],
  benefits: [
    ["Worst-first triage", "Certificates sort expired first, then those within 7 days, then open renewal windows."],
    ["Calendar export", "One click builds an RFC 5545 .ics file with an all-day reminder on each renewal date."],
    ["Fully local", "The list lives in your browser's localStorage — no account, no server, no data leaving the machine."],
  ],
  faqs: [
    [
      "How long can a TLS certificate be valid?",
      "398 days at most for publicly trusted certificates, a cap the CA/Browser Forum Baseline Requirements have enforced since 1 September 2020. Ballot SC-081, adopted in 2025, schedules further cuts — roughly 200 days in 2026, 100 days in 2027 and 47 days from March 2029 — so renewal automation is becoming essential.",
    ],
    [
      "How many days before expiry should I renew an SSL certificate?",
      "30 days before expiry is the widely used baseline — it is the point at which Let's Encrypt recommends renewing its 90-day certificates. That buffer leaves time for DNS validation problems, CA outages or approval delays without risking an outage.",
    ],
    [
      "What happens when a TLS certificate expires?",
      "Browsers reject the connection outright with an error such as NET::ERR_CERT_DATE_INVALID, and API clients typically fail the TLS handshake, so the site or service is effectively down for anyone who does not click through a warning. Expiry is a hard outage, which is why this tracker ranks expired certificates above every other status.",
    ],
    [
      "Does this tool check my certificates automatically?",
      "No — it is a local, manual tracker. You enter each certificate's expiry date (from your CA dashboard or the browser padlock) and the tool computes days remaining, renewal deadlines and statuses in your browser. For automatic discovery you would pair it with monitoring that queries your endpoints directly.",
    ],
  ],
};

export default seo;
