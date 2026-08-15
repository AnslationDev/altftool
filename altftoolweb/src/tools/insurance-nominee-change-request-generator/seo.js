const seo = {
  title: "Nominee Change Request Letter for Insurance Policy",
  metaDescription:
    "Drafts a section 39 nomination change letter, refuses shares that do not total 100%, and demands an appointee when a nominee is under 18.",
  steps: [
    "Enter Policyholder name, Policy number, Insurer, Branch or servicing office, Sum assured (INR) and the Nominee currently on record.",
    "Add each new nominee's Full name, Relationship, Date of birth and Share (%), pressing Add nominee for extra rows, and name an Appointee if any is a minor.",
    "Once \"Shares allocated\" reads 100%, press Copy letter to take the finished section 39 request.",
  ],
  intro:
    "A nomination change request is the written instruction that asks an insurer to cancel the nominee currently on a policy and register new ones, with each nominee's share stated as a percentage. This generator writes that letter under section 39 of the Insurance Act, 1938, checks the shares add to exactly 100%, converts each share into a rupee amount from the sum assured, works out each nominee's age on the letter date, and flags where section 39(2) requires an appointee because a nominee is under 18. For policyholders updating a nomination after marriage, a birth, a divorce or the death of the existing nominee.",
  useCases: [
    "Move a nomination from a parent to a spouse and children after marriage, with a 60/25/15 split.",
    "Catch that three shares add to 99% before the form is posted and rejected.",
    "Name an appointee because two nominees are minors, and note the dates they turn 18 for a later review.",
    "See the actual rupee amount each nominee would receive from a 1 crore sum assured.",
  ],
  benefits: [
    [
      "Shares checked against 100%",
      "The letter will not generate until the percentages total exactly 100, which is the commonest reason a nomination form is returned.",
    ],
    [
      "Minors handled properly",
      "Ages are computed on the letter date and an appointee is demanded where section 39(2) requires one.",
    ],
    [
      "Beneficial nominee status shown",
      "Parents, spouse and children are marked as beneficial nominees under s.39(7); other relatives are flagged as holding the money for the legal heirs.",
    ],
  ],
  faqs: [
    [
      "How do I change the nominee on my insurance policy?",
      "Write to the insurer's policy servicing office with the policy number, the existing nominee, the new nominee or nominees with their relationship, date of birth and share percentage, and ask for a written endorsement confirming the change. Section 39(6) of the Insurance Act, 1938 lets you change a nomination any time before maturity, but the change only binds the insurer once it has notice of it and has registered it - so keep the acknowledgement.",
    ],
    [
      "Do nominee percentages have to add up to 100?",
      "Yes, exactly 100%. An insurer cannot pay out a claim on shares that total 97% or 103%, so a form that does not balance is returned unregistered - and if the policyholder has died in the meantime, the old nomination is what stands.",
    ],
    [
      "What happens if the nominee is a minor?",
      "Section 39(2) of the Insurance Act, 1938 requires the policyholder to appoint an appointee to receive the money during the nominee's minority. Majority is 18 under the Indian Majority Act, 1875, so note the date each minor nominee turns 18 and update the nomination to drop the appointee at that point.",
    ],
    [
      "Is a nominee the same as a legal heir?",
      "Not necessarily. Since the 2015 amendment, section 39(7) makes a parent, spouse, child, or spouse and children a 'beneficial nominee' who is entitled to the proceeds. Any other nominee - a sibling, a friend, a grandchild - receives the money but holds it for the legal heirs under succession law. If you want a specific person to keep the money, a nomination alone may not achieve it; take advice and make a will.",
    ],
  ],
};

export default seo;
