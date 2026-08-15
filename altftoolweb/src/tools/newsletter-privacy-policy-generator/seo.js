const seo = {
  title: "Newsletter Privacy Policy Generator: CAN-SPAM",
  metaDescription:
    "Assembles the subscriber notice — consent proof, tracking pixel, unsubscribe — and dates the 10-business-day opt-out and the CASL 60-day link.",
  steps: [
    "Enter the Newsletter name, Published by, Physical postal address, Contact for privacy requests and Email service provider, then pick How subscribers join.",
    "Tick What the list does, which adds the sections those practices make necessary, and enter the Subscription date and Unsubscribe request received.",
    "Read Notice completeness with the opt-out deadline, the CASL 60-day and CAN-SPAM 30-day mechanism dates and implied-consent expiry, then press Copy notice.",
  ],
  intro:
    "A newsletter privacy policy is the subscriber-facing notice that records three separate things: how consent to email was obtained and can be proved, what the tracking pixel and wrapped links inside each message collect, and what happens to an address after someone unsubscribes. This generator assembles that notice and works out the deadlines the law attaches to it — the 10 business days both CAN-SPAM and CASL allow for actioning an opt-out, the 60 days a CASL unsubscribe link must stay live, and the 24-month or 6-month expiry of implied consent under Canadian law.",
  useCases: [
    "Publish a subscriber notice that names the tracking pixel instead of leaving it undisclosed, which is the most commonly enforced failing in email marketing.",
    "Work out the exact date implied consent from a customer's purchase runs out under Canada's Anti-Spam Legislation.",
    "Set a sunset rule for subscribers who have not opened anything in a year, so the list stops holding addresses past their purpose.",
    "Check whether switching from single to double opt-in is worth it, given who carries the burden of proving consent.",
  ],
  benefits: [
    [
      "Deadlines from your dates",
      "Opt-out, unsubscribe-link validity and implied-consent expiry are calculated, with business days counted properly.",
    ],
    [
      "Pixels described honestly",
      "Open and click tracking are set out as what they are, and tied to the consent rule that actually covers them.",
    ],
    [
      "Consent evidence built in",
      "The notice records the date, form wording and IP kept as proof, because the sender carries that burden.",
    ],
  ],
  faqs: [
    [
      "How quickly must an unsubscribe request be honoured?",
      "Within 10 business days under the CAN-SPAM Act at 15 U.S.C. section 7704(a)(4), and without delay and in any event within 10 business days under Canada's Anti-Spam Legislation. The opt-out mechanism itself must keep working for at least 30 days after the message was sent under CAN-SPAM, and at least 60 days under CASL, so a link that dies with the campaign is a breach even if the request was actioned.",
    ],
    [
      "Is double opt-in legally required for a newsletter?",
      "No law names double opt-in, but Article 7(1) of the GDPR puts the burden of proving consent on the sender, and a confirmation click is the evidence supervisory authorities expect. Single opt-in also lets anyone add someone else's address to your list, which turns a complaint into a problem you cannot rebut.",
    ],
    [
      "How long does implied consent last under CASL?",
      "Twenty-four months from a purchase, contract or other transaction, and six months from an inquiry. Express consent does not expire on a timer and lasts until it is withdrawn, so the practical rule is to convert implied consent to express consent before the clock runs out.",
    ],
    [
      "Does an email tracking pixel need consent?",
      "For subscribers in the EU and UK, yes. Article 5(3) of the ePrivacy Directive covers storing or reading information on a person's device, and loading a tracking pixel reads information from theirs, so it is treated the same way as a cookie rather than being covered by the consent to receive the email. Disclose it in the notice and let people opt out of tracking separately where you can.",
    ],
  ],
};

export default seo;
