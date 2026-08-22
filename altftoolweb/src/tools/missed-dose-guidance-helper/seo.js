const seo = {
  title: "Missed Dose Checker: Halfway-to-Next-Dose Rule",
  metaDescription:
    "Enter when the dose was due, the time now and how often you take it, to see how late you are against the halfway cut-off and when the next dose is due.",
  steps: [
    "Set \"When the dose was due\" and \"Time right now\", then choose how often you take it — Once a day, Twice a day (BD, every 12 h), TDS, QDS or your own interval.",
    "Pick the Type of medicine; contraceptive pills, anticoagulants, insulin, anti-epileptics and transplant immunosuppressants are routed to their own instructions.",
    "Read how late the dose is against the halfway point, the scheduled doses gone by and the next dose time, then press Copy summary.",
  ],
  intro:
    "This helper applies the half-interval rule that most patient information leaflets print for a missed dose: take it as soon as you remember unless you are more than halfway to the next dose, in which case leave it out and carry on normally — and never take two together. Enter the time the dose was due, the time now and how often you take the medicine, and it shows how late you are, which side of the halfway point that falls on, how many scheduled doses have gone by, and when the next one is due. Medicine types with their own published missed-dose rules, such as contraceptive pills, anticoagulants, insulin and anti-epileptics, are flagged instead of being run through the general rule.",
  useCases: [
    "Realising at 3 pm that the 8 am twice-daily tablet was never taken and needing to know whether to take it or wait",
    "Checking, after a night shift, how many doses of a four-times-a-day antibiotic were missed before ringing the pharmacy",
    "Seeing at a glance that the medicine is one of the classes where the general rule does not apply",
  ],
  benefits: [
    ["The actual cut-off, in hours", "Turns 'nearly time for the next dose' into a specific number for your dosing interval."],
    ["Counts the doses gone by", "Shows when more than one scheduled dose has been missed, which changes the conversation with a pharmacist."],
    ["Flags the exceptions", "Contraceptives, anticoagulants, insulin, seizure medicines and transplant drugs are routed to their own instructions."],
  ],
  faqs: [
    [
      "What should I do if I miss a dose of my medicine?",
      "The standard leaflet rule is to take it as soon as you remember, unless it is nearly time for the next dose — then skip the missed one and carry on with the normal schedule. Never take a double dose to catch up. Your own leaflet overrides this, and some medicines have different instructions entirely.",
    ],
    [
      "How late is too late to take a missed dose?",
      "The usual cut-off is halfway to the next scheduled dose. For a twice-daily medicine taken every 12 hours that is about 6 hours late; for a three-times-a-day medicine every 8 hours it is about 4 hours; for a once-daily medicine it is about 12 hours.",
    ],
    [
      "Can I take two tablets to make up for a missed dose?",
      "No. Doubling up raises the peak blood level and is a common cause of side effects and overdose, and it is explicitly warned against on almost every leaflet. If you have already taken a double dose and feel unwell, contact a doctor, a pharmacist or your local poisons helpline immediately.",
    ],
    [
      "Which medicines have special missed-dose rules?",
      "Contraceptive pills, warfarin and other anticoagulants, insulin and diabetes medicines, anti-epileptics, transplant immunosuppressants, HIV antiretrovirals and weekly bisphosphonates all have product-specific instructions that the general halfway rule does not cover. For these, follow the leaflet or contact the prescribing clinic the same day.",
    ],
  ],
};

export default seo;
