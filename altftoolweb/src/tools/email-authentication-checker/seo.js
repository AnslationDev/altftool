const seo = {
  title: "SPF, DKIM, DMARC & MX Record Checker for a Domain",
  metaDescription:
    "Check a domain's live SPF, DKIM, DMARC and MX records over DNS-over-HTTPS: pass, warn or fail on each, 12 DKIM selectors probed, and the text to fix it.",
  steps: [
    "Type the domain into Domain (or email address) — a full email address is accepted — and leave DKIM selector (optional) on auto-detect unless your provider names one.",
    "Press Check domain. SPF, DKIM, DMARC and MX are queried live over DNS-over-HTTPS against Google's resolver, with 12 common DKIM selectors probed in parallel.",
    "Read the score weighted SPF 30%, DKIM 30%, DMARC 30% and MX 10%, then expand any Pass, Warning or Fail card for the record text and its Fix line.",
  ],
  intro:
    "Email Authentication Checker looks up a domain's live SPF, DKIM, DMARC and MX records over DNS-over-HTTPS and grades each one pass, warn or fail against fixed published rules — one v=spf1 record only, the RFC 7208 limit of 10 DNS-lookup mechanisms, a DMARC policy at _dmarc.<domain>, and a DKIM key of at least 2048 bits. It rolls the four verdicts into a single score weighted SPF 30%, DKIM 30%, DMARC 30% and MX 10%, and gives the exact record text to publish for anything that fails. It is for anyone who has just set up sending on a domain, or whose mail is landing in spam, and needs to know whether authentication is the reason.",
  useCases: [
    "Your campaign suddenly started hitting Gmail's spam folder and you need to confirm whether the domain publishes a DMARC record at all before blaming the content.",
    "You added a second sending platform and want to check you have not ended up with two v=spf1 records, which makes SPF permerror and effectively fail.",
    "You are onboarding a client domain and do not know which DKIM selector their provider uses, so you need the common Google, Microsoft 365, Mailchimp and SendGrid selectors probed automatically.",
  ],
  benefits: [
    [
      "Live DNS, not a cached database",
      "Every verdict comes from a fresh DNS-over-HTTPS query against Google's resolver with Cloudflare as fallback, so a record you published minutes ago shows up.",
    ],
    [
      "Twelve DKIM selectors probed in parallel",
      "Google, selector1/selector2, k1/k2, s1/s2, default, dkim, mail, zoho and mx are all checked at once, so you can find a key without knowing the provider's selector.",
    ],
    [
      "Every verdict traces to a record property",
      "Nothing is an opaque score: a warn or fail names the specific cause — '+all', 'pct=' below 100, a missing rua address, a revoked empty p= key — and gives the fix.",
    ],
  ],
  faqs: [
    [
      "How many DNS lookups can an SPF record have?",
      "Ten. RFC 7208 caps the mechanisms that trigger DNS lookups — include, a, mx, ptr, exists and redirect — at 10 per evaluation, and exceeding it causes a permanent error that receivers treat as an SPF failure. The checker counts them and warns from 8 upward so you can flatten includes before you cross the line.",
    ],
    [
      "What DMARC policy should I publish?",
      "Start at p=none with a rua= reporting address to gather data, then move to p=quarantine and finally p=reject once the aggregate reports show only your legitimate senders passing. A record left at p=none is graded as a warning here because failing mail is still delivered, and pct= below 100 applies the policy to only that share of failing messages.",
    ],
    [
      "Why can't the tool find my DKIM record?",
      "Because DKIM keys have no fixed location — they sit at <selector>._domainkey.<domain>, and the selector is chosen by your sending provider. If none of the 12 common selectors return a key, open your provider's DNS setup page, copy the selector it lists, and re-run the check with that selector entered.",
    ],
    [
      "Do I need all of SPF, DKIM and DMARC?",
      "Yes for any meaningful volume: DMARC only passes when SPF or DKIM passes and its domain aligns, and the major mailbox providers now require authenticated, DMARC-covered mail from bulk senders. MX records matter separately — without them the domain cannot receive replies or bounce notifications, which is why they carry 10% of the score here.",
    ],
  ],
};

export default seo;
