const seo = {
  title: "Rent Renewal Notice Generator: 11-Month Term",
  metaDescription:
    "Draft a tenancy renewal intimation with the new term dates, escalated rent, deposit top-up capped at the Model Tenancy Act limit, and a reply deadline.",
  steps: [
    "Set Current term ends on, Date of this notice and Renewed term (months) with the 11 mo preset.",
    "Fill Current monthly rent (INR), Escalation for the new term (%), Deposit currently held (INR), Days to respond and Notice the agreement requires (days).",
    "Read the Revised monthly rent with the new term dates, rent increase and revised security deposit, then press Copy notice.",
  ],
  intro:
    "This generator drafts the renewal intimation for a tenancy: it computes the new term dates, the escalated rent, the deposit differential and the date by which the other side must reply. The renewed term starts the day after the current one ends and runs the number of months you pick, which is why the standard Indian tenancy is eleven months — Section 17(1)(d) of the Registration Act, 1908 makes registration compulsory for a lease from year to year or for a term exceeding one year. Deposits are held to the ceiling in Section 11(1) of the Model Tenancy Act, 2021: two months' rent for residential premises, six for non-residential.",
  useCases: [
    "A landlord proposing an 8% escalation three months before an eleven-month term expires, and needing the top-up deposit figure in writing.",
    "A tenant who wants to renew on the same rent and put the request on record before the notice window in the agreement closes.",
    "Checking whether moving from an 11-month renewal to a 24-month one pushes the agreement into compulsory registration.",
  ],
  benefits: [
    ["Dates that actually line up", "The new term starts the day after the old one ends, with month-end clamping handled."],
    ["Flags a short notice period", "Compares the days before expiry against the notice your agreement requires."],
    ["Caps the deposit", "Holds a proportionate deposit rise to the statutory two- or six-month ceiling."],
  ],
  faqs: [
    [
      "Why are Indian rent agreements always for 11 months?",
      "Because Section 17(1)(d) of the Registration Act, 1908 makes registration compulsory for a lease from year to year, for a term exceeding one year, or reserving a yearly rent. An eleven-month term falls outside that, so the parties avoid registration fees and the stamp duty payable on a registered lease — though the agreement should still be in writing and stamped.",
    ],
    [
      "How much can a landlord raise the rent at renewal?",
      "Central law sets no percentage cap; the increase is whatever the agreement's escalation clause says, or whatever the parties negotiate afresh. In practice Indian residential renewals commonly carry a 5-10% escalation. Where a state's rent control act applies to the premises, the permitted increase is governed by that act instead.",
    ],
    [
      "Is there a limit on the security deposit at renewal?",
      "Under Section 11(1) of the Model Tenancy Act, 2021 the deposit cannot exceed two months' rent for residential premises or six months' rent for non-residential premises. The Act applies only in states that have adopted it, and a few states — Karnataka, for one — had their own deposit norms before it, so check what is in force where the property is.",
    ],
    [
      "How much notice should I give before a renewal?",
      "Follow the notice clause in your existing agreement, which in Indian residential tenancies is usually one to three months. This tool compares the days between your notice date and the expiry date against that requirement and warns you if you are short, because a late notice can leave the tenancy running on the old terms or lapsing into a month-to-month arrangement.",
    ],
  ],
};

export default seo;
