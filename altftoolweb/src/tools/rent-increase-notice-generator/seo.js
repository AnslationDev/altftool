const seo = {
  intro:
    "This generator turns a rent revision into a dated written notice: it works out the revised monthly rent, the extra outgo per year, the proportionate security deposit and whether the effective date leaves enough notice. The three-month default follows Section 9(2) of the Model Tenancy Act, 2021, which requires a landlord to give written notice three months before the revised rent becomes due, and the deposit is checked against the Section 11(1) ceiling of two months' rent for residential premises and six months for non-residential premises. It is meant for individual landlords, property managers and tenants who want to check the notice they received.",
  useCases: [
    "A landlord renewing an eleven-month tenancy at 8% higher rent and needing a dated notice that reaches the tenant three months before the new rent starts.",
    "A property manager revising rent across several flats and wanting the deposit top-up figure for each tenant in writing.",
    "A tenant who has been handed a rent hike letter and wants to check whether the effective date gives the notice period the agreement promised.",
  ],
  benefits: [
    ["Notice-period check", "Flags the exact number of days short if the effective date arrives sooner than the agreed notice allows."],
    ["Deposit ceiling applied", "Caps the revised deposit at two months' rent for homes and six months for shops, as the Model Tenancy Act sets out."],
    ["Ready to send", "Produces the full letter with subject line, effective date, revised figures and an acknowledgement request."],
  ],
  faqs: [
    [
      "How much notice must a landlord give before increasing rent in India?",
      "Under Section 9(2) of the Model Tenancy Act, 2021, the landlord must give written notice three months before the revised rent becomes due. Your written agreement can specify a longer period, and States that have adopted the Act with changes may vary it, so check the agreement clause first.",
    ],
    [
      "Can the landlord raise the rent in the middle of the agreed term?",
      "Not unless the agreement itself provides for a mid-term revision. Rent is normally revised at renewal or on the escalation date written into the tenancy agreement; otherwise the agreed rent holds for the whole term.",
    ],
    [
      "Does the security deposit have to increase with the rent?",
      "Only if the agreement says so. Where it is topped up, the Model Tenancy Act, 2021, Section 11(1) caps the deposit at two months' rent for residential premises and six months' rent for non-residential premises, so a proportionate increase cannot push it past that ceiling.",
    ],
    [
      "Is a WhatsApp message enough notice of a rent increase?",
      "The requirement is a notice in writing, and a dated letter delivered by hand against acknowledgement, by registered post or by email creates far stronger proof of service. Sending the same text on a messaging app as well does no harm, but keep a postal or email record. This is general information, not legal advice — consult a lawyer for a disputed tenancy.",
    ],
  ],
};

export default seo;
