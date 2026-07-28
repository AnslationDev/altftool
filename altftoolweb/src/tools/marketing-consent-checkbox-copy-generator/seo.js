const seo = {
  intro:
    "The Marketing Consent Checkbox Copy Generator writes the checkbox labels, helper text and unsubscribe wording for a signup form, producing one unticked box per channel so consent stays specific as GDPR Art. 4(11) and Recital 32 require. It names the send frequency in the label, calculates how many messages a year that actually promises, and flags the three patterns that invalidate consent: pre-ticked boxes, bundled channels, and a marketing tick made mandatory contrary to Art. 7(4). Written for growth and product teams who need copy their legal reviewer will pass.",
  useCases: [
    "Replace a single 'I agree to receive marketing' box with separate email, SMS and WhatsApp checkboxes before a signup form goes live in the EU.",
    "Add the frequency promise to a newsletter opt-in so subscribers know they are agreeing to twelve emails a year rather than an unbounded stream.",
    "Prepare the consent wording and DLT-aware unsubscribe lines for an Indian SMS campaign governed by the TRAI TCCCP Regulations, 2018.",
  ],
  benefits: [
    ["Granular by default", "Generates one checkbox per channel, which is what makes consent specific rather than bundled."],
    ["Promise you can keep", "Turns the chosen frequency into a stated number of messages per year, so the label matches your actual sending plan."],
    ["Channel-correct opt-outs", "Produces the right stop instruction per channel, including reply STOP, 1909 preference changes and OS-level push settings."],
  ],
  faqs: [
    [
      "Can a marketing consent checkbox be pre-ticked?",
      "No. Recital 32 of the GDPR states that silence, pre-ticked boxes and inactivity do not constitute consent, and the Court of Justice confirmed it in C-673/17 (Planet49). Every box must start empty and be ticked by a deliberate action from the user. India's DPDP Act, 2023 s.6 applies the same clear-affirmative-action standard.",
    ],
    [
      "Do I need a separate checkbox for email and SMS?",
      "Yes, where consent is your legal basis. Consent must be specific to each purpose and channel, so a person has to be able to accept email without also accepting texts or calls. Regulators including the ICO treat a single box covering multiple channels as bundled consent that fails the specificity test in GDPR Art. 4(11).",
    ],
    [
      "Can I make marketing consent mandatory to create an account?",
      "No. GDPR Art. 7(4) says consent is not freely given where performance of a contract is made conditional on consent to processing that is not necessary for that contract. Marketing is almost never necessary to deliver a signup or a purchase, so requiring the tick invalidates the consent you collect. Service messages such as order confirmations and security alerts do not need consent and can continue either way.",
    ],
    [
      "How quickly must an unsubscribe request be honoured?",
      "Under GDPR Art. 21(3) an objection to direct marketing must be acted on immediately, with no grace period. In the United States, CAN-SPAM allows up to 10 business days from receipt of an opt-out, and in India TRAI preference changes take effect within 7 days. This is informational guidance rather than legal advice; check with counsel for your markets.",
    ],
  ],
};

export default seo;
