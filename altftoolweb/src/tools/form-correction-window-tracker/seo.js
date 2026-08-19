const seo = {
  title: "Form Correction Window Tracker: NTA, SSC, IBPS",
  metaDescription:
    "See which fields NTA, SSC, RRB or IBPS actually let you edit, the ₹200/₹500 SSC correction charge, and the days left in the window.",
  steps: [
    "Select the body conducting the exam — NTA, SSC, RRB, IBPS or a state commission — then enter the dates the window opens and closes and how many corrections you have already made.",
    "Tick what you need to fix from the 15 fields, from name spelling and category to the registered mobile number, and flag whether the change moves you into a higher fee band.",
    "Read the days left, how many requested changes are not editable for that body, and the charge for the next correction, then press \"Copy plan\".",
  ],
  intro:
    "This tracker counts down an exam form correction window and, more usefully, tells you in advance which of the changes you want that body will actually allow. Correction windows are narrow and unequal: SSC charges ₹200 for a first correction and ₹500 for a second and permits no third, NTA opens a short window in which the registered mobile number and email address stay locked because they are the login channel, and IBPS normally opens no edit facility at all. It also flags the fee-band rule — a change that raises your fee has to be paid for inside the window, and a change that lowers it earns no refund.",
  useCases: [
    "Finding out before the window opens that the mobile number you mistyped on an NTA form cannot be corrected there, so the fix has to come another way.",
    "Deciding whether a second SSC correction is worth ₹500, given it is the last one you will be allowed.",
    "Drafting the exact corrected spellings and uploads while the window is still a few days away, rather than composing them at the deadline.",
  ],
  benefits: [
    ["Locked fields named up front", "Each requested change is marked editable or not for that particular body."],
    ["Correction charge by attempt", "Shows what the next correction costs, and when you have run out of attempts."],
    ["Fee-band trap flagged", "Category and disability changes can move your fee band, with the difference payable inside the window."],
  ],
  faqs: [
    [
      "How much does an SSC correction cost?",
      "₹200 for the first correction and ₹500 for the second, payable inside the correction window and not refundable. SSC allows no third correction, so treat the second one as final. The charge falls due even for a trivial change such as a spelling.",
    ],
    [
      "Can I change my mobile number or email in the NTA correction window?",
      "No. The registered mobile number and email address are the login and one-time-password channel for the application, so NTA keeps them locked. Most other particulars — name spelling, parents' names, photograph, signature, category, exam city — are usually available, but the fields on offer are listed afresh in each correction notice.",
    ],
    [
      "What happens if I change my category during correction?",
      "If the new category attracts a higher fee, the difference has to be paid inside the window or the correction does not take effect. If it attracts a lower fee, nothing is refunded, and several bodies refuse a downward change altogether. Have the certificate that supports the new category in hand before you make the change.",
    ],
    [
      "Does IBPS have a correction window?",
      "Normally no. IBPS treats the submitted application as final, which is why its own instructions tell candidates to use the preview screen carefully before paying. If a genuine error has been made, the only route is the candidate grievance channel, and it seldom results in a change.",
    ],
  ],
};

export default seo;
