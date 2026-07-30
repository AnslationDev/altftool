const seo = {
  intro:
    "Paste a full email header block and this page parses it the way a receiving mail server writes it: the Received trace chain in RFC 5321 order, the Authentication-Results field defined in RFC 8601, Received-SPF from RFC 7208, and every tag of every DKIM-Signature from RFC 6376. It then recomputes DMARC identifier alignment (RFC 7489 section 3.1) locally, comparing the From domain against the SPF envelope domain and the DKIM d= domain, so a forged Authentication-Results line claiming a pass on an unrelated domain does not slip through. Hop delays are the real differences between the timestamps in the headers, and RFC 2047 encoded subjects are decoded so you can read what was actually sent. Everything happens in the browser — no header is uploaded.",
  useCases: [
    "A finance team forwards you an invoice email that 'looks like' a supplier — check whether the From display name hides a different address and whether Reply-To points somewhere else entirely.",
    "Your own campaign lands in spam: confirm DKIM actually signs the From field, that SPF passes on a domain aligned with From, and that DMARC would therefore evaluate to pass.",
    "A message arrived hours late and you need to see which hop held it — the per-hop delays come straight from the Received timestamps, so the queue that stalled is obvious.",
  ],
  benefits: [
    [
      "Alignment is recomputed, not trusted",
      "A pasted Authentication-Results line is just text. SPF and DKIM alignment against the From domain is calculated here, and a disagreement with the reported DMARC verdict is called out.",
    ],
    [
      "Quote-aware From parsing",
      "A display name of \"Support <help@bank.example>\" wrapped in quotes is the standard spoof. The address parser ignores angle brackets inside quotes, so it reads the real mailbox and flags the mismatch.",
    ],
    [
      "Honest about its limits",
      "DKIM cannot be verified without the body and a DNS lookup, and SPF records cannot be fetched. The page says which verdicts came from the receiving server and which it worked out itself.",
    ],
  ],
  faqs: [
    [
      "Where do I get the raw headers?",
      "In Gmail, open the message, choose the three-dot menu and pick 'Show original'. In Outlook on the web use the three-dot menu, then 'View' and 'View message source'. In Apple Mail it is View, Message, Raw Source. Paste everything from the first field down to the blank line — the body is not needed and is ignored if you include it.",
    ],
    [
      "Why does an email pass SPF, DKIM and DMARC and still turn out to be a phish?",
      "Because those three checks answer 'did the domain that sent this authorise it', not 'is this domain the one you think it is'. An attacker who registers billing-notice.net can publish perfect SPF and DKIM for it and pass DMARC every time. The tell is elsewhere: a display name containing someone else's address, a Reply-To on a third domain, or a signing domain that has nothing to do with the brand in the subject. This page flags all three.",
    ],
    [
      "What is identifier alignment, and why does it matter more than the pass or fail?",
      "SPF checks the envelope sender (MAIL FROM), which the recipient never sees; DKIM checks the d= domain in the signature. DMARC only counts a pass if one of those domains matches the From header the reader actually looks at — exactly for a strict match, or on the shared organizational domain for a relaxed one. An SPF pass on a bounce domain unrelated to the From address is worth nothing to DMARC, so this page shows the alignment beside every result.",
    ],
    [
      "Does this verify the DKIM signature or fetch the SPF record?",
      "No, and it says so. Verifying DKIM needs the message body plus the public key from the signer's DNS, and evaluating SPF needs a DNS query against the sending IP — both are network operations, and this tool makes no network requests. What it does instead is read every signature tag, tell you which headers were signed, name the DNS record you would query, and re-derive alignment from the text you pasted.",
    ],
  ],
};

export default seo;
