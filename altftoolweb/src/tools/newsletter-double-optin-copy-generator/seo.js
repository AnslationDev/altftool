const seo = {
  intro:
    "Double opt-in is the pattern where an address only joins a mailing list after its owner clicks a link in a confirmation email, and that click is the evidence that turns a form submission into provable consent. This generator writes the four pieces of copy the flow needs - the consent line on the form, the post-signup screen, the confirmation email and the welcome email - plus the consent record to store, since UK/EU GDPR Art. 7(1) puts the burden of demonstrating consent on the sender. It also checks your subject and preheader against the lengths mail clients show and projects how many signups a confirmed-subscriber target will take.",
  useCases: [
    "Replace a vague 'subscribe for updates' checkbox with wording that states the content, the frequency and the number of emails a year.",
    "Work out that a 5,000-confirmed-subscriber target needs about 7,693 signups when 65% of people confirm.",
    "Check that a confirmation subject line is not clipped on a phone before it goes into your email platform.",
    "Hand a developer the exact list of fields to log so the consent record survives a complaint.",
  ],
  benefits: [
    [
      "Proof, not just process",
      "The consent record block lists the timestamps, IPs and exact wording that make a consent claim verifiable.",
    ],
    [
      "Specific promises",
      "Frequency is converted to emails per year and written into the copy, which is what 'informed' consent actually requires.",
    ],
    [
      "Funnel maths included",
      "Confirmed subscribers, unconfirmed leftovers and the signups still needed are calculated from your own confirmation rate.",
    ],
  ],
  faqs: [
    [
      "What is double opt-in and do I need it?",
      "Double opt-in means the address is added only after the recipient clicks a confirmation link, so you hold evidence the owner of the address asked for the mail. It is not explicitly mandated by name in most laws, but GDPR Art. 7(1) requires you to be able to demonstrate consent, and a confirmation click with a timestamp is the cleanest way to do that. It also strips out typos and bot signups before they hit your deliverability.",
    ],
    [
      "How long should a confirmation link stay valid?",
      "48 to 72 hours is the usual compromise. Shorter than 24 hours loses anyone who signs up in the evening and reads email the next day; much longer and a stale link sitting in an inbox becomes a way in. State the window in the email so the reader knows there is a deadline.",
    ],
    [
      "What has to appear in a marketing email by law?",
      "Under CAN-SPAM (15 U.S.C. 7704) commercial email to US recipients must carry a valid physical postal address, must not use deceptive headers or subject lines, must identify itself as an advertisement where relevant, and must honour opt-out requests within 10 business days. Canada's CASL uses the same 10-business-day figure. GDPR and PECR in the UK and EU add the consent and record-keeping requirements on top.",
    ],
    [
      "Can I require someone to subscribe before downloading a free guide?",
      "You can ask, but you should not make the download conditional on staying subscribed. GDPR Art. 7(4) says consent is not freely given where performance of a service is made conditional on consent that is not necessary for it, so gate the guide behind the email address if you must, then treat the newsletter as a separate, unticked, genuinely optional choice.",
    ],
  ],
};

export default seo;
