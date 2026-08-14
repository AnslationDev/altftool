const seo = {
  title: "Document Attestation Tracker: Validity & Expiry Dates",
  metaDescription:
    "Add up to 20 documents with attestation date and validity in months; each gets an expiry date, a day count and a valid, expiring-soon or expired flag.",
  intro:
    "The Document Attestation Tracker records which documents have been attested, by which authority and on what date, then adds the validity period you set — six months by default — to give each one an expiry date and a live day count. It sorts every entry into pending, valid, expiring within 30 days, or expired, and surfaces the single most urgent item to deal with next. It is for anyone assembling an attested paperwork set for an embassy, employer or university, where one stale copy holds up the whole file.",
  useCases: [
    "You are collecting degree certificates, a police clearance certificate and an experience letter for a Gulf work visa, and need to know which attestation will go stale before your submission date.",
    "An HR onboarding pack requires attested copies dated within the last six months, and you want to see at a glance which of eight documents already fall outside that window.",
    "A university application deadline is seven weeks away and you need to spot the attestations that will tip into the 30-day warning band before you post the file.",
  ],
  benefits: [
    [
      "Validity is per document, not one global rule",
      "Each entry carries its own validity in months, from 1 up to 120, or blank for a one-time attestation with no expiry — because different authorities set different windows.",
    ],
    [
      "Month arithmetic that does not overflow",
      "Adding months clamps to the end of the target month, so 31 August plus six months gives 28 or 29 February rather than rolling into March.",
    ],
    [
      "Tells you what to do first",
      "The next action picks the most overdue expired document, then the soonest to expire, then the first still unattested — rather than leaving you to scan the table.",
    ],
  ],
  faqs: [
    [
      "How long is an attested document valid?",
      "There is no single statutory expiry — validity is set by whoever is asking for the document. Six months is the most common institutional convention for attested copies and police clearance certificates, which is the default here, but you should change it to whatever the receiving authority states. Confirm the requirement with that authority before relying on a date.",
    ],
    [
      "When does a document get the expiring-soon flag?",
      "When 30 or fewer days remain before its expiry date. That buffer is set to cover typical re-attestation turnaround, so you start the renewal before the copy becomes unusable.",
    ],
    [
      "How is the expiry date calculated?",
      "Attestation date plus the validity you entered, in whole calendar months, with end-of-month clamping. An attestation on 15 March with a six-month validity expires on 15 September; one on 31 August expires on the last day of February.",
    ],
    [
      "Can I track a document with no expiry?",
      "Yes — leave the validity field blank and it is recorded as valid indefinitely with no countdown. Up to 20 documents can be tracked in one list, and dates are entered as yyyy-mm-dd.",
    ],
  ],
};

export default seo;
