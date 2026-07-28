const seo = {
  intro:
    "This tool drafts a ready-to-file application under Section 6(1) of the Right to Information Act 2005 addressed to the Central Public Information Officer of a Regional Passport Office, asking for the movement of your own passport file, the despatch and receipt dates of the police verification, and the reason recorded for the delay. It also works out every statutory date that follows: the Section 7(1) reply deadline of 30 days, the Section 6(3) five-day transfer deadline, and the first and second appeal windows under Section 19. It is written for applicants whose passport status has stopped moving and who want a dated, answerable question rather than another grievance ticket.",
  useCases: [
    "Find out which police station received the verification request and whether the report ever came back.",
    "Get the noting sheet of your own file so you can see which desk has held it and for how long.",
    "Force a written reason for pendency when the online status page has shown the same line for weeks.",
    "Establish a paper trail with a fixed reply date before escalating to the First Appellate Authority.",
  ],
  benefits: [
    ["Only answerable questions", "Each query asks for a record or a date the office actually holds, which is harder to refuse than a general request for help."],
    ["Every deadline calculated", "Reply, transfer, first appeal and second appeal dates are worked out from the filing date, not estimated."],
    ["Correct statutory framing", "The draft cites Section 6(2) so no reason need be given, and Section 10(1) so exempt material must be severed rather than used to refuse everything."],
  ],
  faqs: [
    [
      "How long does a passport office have to reply to an RTI?",
      "Thirty days from receipt of the application under Section 7(1) of the Right to Information Act 2005, or 48 hours where the request concerns the life or liberty of a person. If that deadline is missed, Section 7(6) requires the information to be supplied free of charge.",
    ],
    [
      "What is the fee for an RTI application about passport status?",
      "Rs 10 under Rule 3 of the Right to Information Rules 2012, paid by Indian Postal Order, demand draft, court fee stamp or online through the RTI Online portal. A person below the poverty line pays nothing under Section 7(5). Copies cost Rs 2 per A-4 or A-3 page under Rule 4.",
    ],
    [
      "Can I ask for my own police verification report under RTI?",
      "You can ask for it, and the personal information exemption in Section 8(1)(j) is aimed at third-party information rather than your own file, though passport offices sometimes withhold the report itself. Police verification is carried out by the state police, so that part of the request may have to be transferred to them within five days under Section 6(3) — filing a parallel RTI with the district police is often faster.",
    ],
    [
      "What can I do if the passport office does not reply to my RTI?",
      "File a first appeal with the First Appellate Authority of the same office within 30 days of the reply deadline expiring, under Section 19(1). If the appeal is not decided, a second appeal lies to the Central Information Commission within 90 days under Section 19(3), and Section 20(1) allows a penalty of Rs 250 per day of delay up to Rs 25,000 on the CPIO. This is general information, not legal advice.",
    ],
  ],
};

export default seo;
