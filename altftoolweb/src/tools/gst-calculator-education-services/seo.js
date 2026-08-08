const seo = {
  title: "Education GST Calculator: Exempt or 18% on SAC 9992",
  metaDescription:
    "Pick the supply — school fees, coaching, online course, school bus — to see if entry 66, 69 or 80 exempts it, or get 18% split into CGST/SGST or IGST.",
  steps: [
    "Choose \"What is being supplied?\" from the 16 scenarios, such as \"Coaching classes for JEE, NEET, UPSC, CA or school subjects\" or \"Transport of students or staff supplied to a school (up to higher secondary)\".",
    "Enter the \"Fee or invoice amount (INR)\", set \"Amount is\" to \"GST exclusive (add tax on top)\" or \"GST inclusive (extract tax from it)\", and pick the \"Place of supply\" — \"Within the same state — CGST + SGST\" or \"Across states — IGST\".",
    "\"Total GST payable\" reads either \"Exempt supply — no GST is charged\" or \"Taxable at 18% under SAC 9992\", with Taxable value, CGST @ 9% and SGST / UTGST @ 9% (or IGST @ 18%), Invoice total and the notification entry the verdict rests on.",
  ],
  intro:
    "This calculator decides whether an education, coaching or training supply is exempt under entry 66, 69 or 80 of Notification No. 12/2017-Central Tax (Rate), and where it is taxable, computes the 18% GST on SAC heading 9992 with the CGST/SGST or IGST split. The dividing line is the definition of 'educational institution' in clause 2(y) of that notification: schools, and institutions awarding a qualification recognised by law, are exempt; coaching centres and online course sellers are not. It is aimed at school and college accounts teams, coaching institutes and freelance trainers issuing invoices.",
  useCases: [
    "A coaching institute pricing a Rs 50,000 course and needing the GST-inclusive fee to advertise",
    "A school bursar checking whether a housekeeping contractor may charge GST on a bill to the school",
    "A college finance office confirming that transport and catering supplied to it are taxable even though the same services to a school are exempt",
  ],
  benefits: [
    ["Exemption entry cited", "Every result names the notification entry or SAC heading it rests on."],
    ["Inclusive and exclusive", "Add 18% on top of a fee or extract the tax from an advertised all-in price."],
    ["School vs college split", "Handles the rule that support services are exempt only up to higher secondary level."],
  ],
  faqs: [
    [
      "Is GST applicable on coaching classes?",
      "Yes — coaching classes are taxable at 18% under SAC 9992. A coaching centre is not an 'educational institution' under clause 2(y) of Notification 12/2017 because it does not itself award a qualification recognised by law, so the entry 66 exemption does not reach it.",
    ],
    [
      "Are school and college fees exempt from GST?",
      "Yes. Entry 66(a) of Notification 12/2017-CT(R) exempts services supplied by an educational institution to its students, faculty and staff, which covers pre-school through higher secondary fees and fees for degree courses whose qualification is recognised by law.",
    ],
    [
      "Is GST charged on a school bus or canteen contract?",
      "Not when the recipient institution provides education up to higher secondary or equivalent — entry 66(b) exempts transport, catering, security, cleaning and housekeeping supplied to such institutions. The same contract with a college or university is taxable at 18%.",
    ],
    [
      "Do I need GST registration for private tuition?",
      "Only once your aggregate turnover crosses the section 22 threshold, which is Rs 20 lakh for a supplier of services in most states and Rs 10 lakh in the specified special category states. Below that you can supply without registering, though voluntary registration is allowed. Confirm your own position with a GST practitioner.",
    ],
  ],
};

export default seo;
