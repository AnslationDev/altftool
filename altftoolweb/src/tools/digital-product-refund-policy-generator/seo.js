const seo = {
  title: "No-Refund Policy Generator for Digital Products",
  metaDescription:
    "Writes a 12-section digital refund policy with the Article 16(m) checkout waiver, and keeps faulty, undeliverable and misdescribed refunds in.",
  intro:
    "Digital Product Refund Policy Generator writes a twelve-section no-return policy for ebooks, courses, licence keys, templates and memberships, built around the one clause that makes it enforceable: the express checkout waiver. Under Article 16(m) of the EU Consumer Rights Directive and regulation 37 of the UK Consumer Contracts Regulations 2013, a seller can disapply the 14-day cancellation right for digital content only where the buyer gave prior express consent to immediate delivery and acknowledged losing that right. The generator flags a missing waiver, and refuses to let you quietly drop the refunds — faulty files, failed delivery, not as described — that consumer law does not allow a seller to switch off.",
  useCases: [
    "Publish a refund policy for a Gumroad or Lemon Squeezy shop selling templates to EU buyers.",
    "Replace a bare 'all sales final' line that a payment processor has flagged as a chargeback risk.",
    "Write the subscription clause for a membership site that stops renewals but does not refund the current period.",
    "Document a 72-hour window for reporting broken download links before a course launch.",
  ],
  benefits: [
    [
      "Waiver clause handled",
      "Generates the express-consent wording that makes a no-refund policy stand up in the EU and UK.",
    ],
    [
      "Mandatory refunds protected",
      "Faulty, undeliverable and misdescribed content stay refundable, and the tool warns if you uncheck them.",
    ],
    [
      "Chargeback-aware",
      "Includes a contact-first clause and an app-store carve-out, the two clauses disputes usually turn on.",
    ],
  ],
  faqs: [
    [
      "Can I say 'no refunds' on digital products?",
      "Only up to a point. In the EU and UK you can disapply the 14-day cancellation right for digital content, but only if the buyer expressly consented to immediate delivery and acknowledged losing that right at checkout. Even then you must still refund content that is faulty, undeliverable or not as described.",
    ],
    [
      "What is the digital content waiver at checkout?",
      "It is a tick box, separate from your terms acceptance, in which the buyer asks for immediate access and confirms they understand this ends their change-of-mind cancellation right. Article 16(m) of Directive 2011/83/EU and regulation 37 of the UK Consumer Contracts Regulations 2013 both require it, and you should keep a record of it with the order.",
    ],
    [
      "Do I have to refund a course a customer has already watched?",
      "Not for a change of mind, if the waiver was captured. You do have to refund if the course is materially different from what you advertised, if large parts are missing or broken, or if access never worked — those obligations survive any no-refund clause.",
    ],
    [
      "What about sales through an app store or marketplace?",
      "Their refund rules apply to those transactions and the buyer has to request the refund from them, because they took the payment. Say this explicitly in your policy so buyers do not email you about a purchase you cannot reverse.",
    ],
  ],
};

export default seo;
