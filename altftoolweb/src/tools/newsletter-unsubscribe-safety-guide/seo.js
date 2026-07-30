const seo = {
  intro:
    "This guide scores how likely a message is to be unsolicited, then names the safest way out: your mail client's built-in unsubscribe button, the account's own notification settings, the link in the body, or reporting it as spam without touching anything. The built-in button comes from the List-Unsubscribe header defined in RFC 2369, and RFC 8058 one-click means your provider sends the request directly, so no page loads in your browser and no tracking pixel fires. It also works out the date the sender is required to stop, using CAN-SPAM's 10 business days, CASL's 10 business days, the GDPR one-month response window and the two-day processing rule bulk senders to Gmail and Yahoo have had to meet since February 2024.",
  useCases: [
    "Work out whether a message from a brand you half-remember is a real list you joined or a purchased one.",
    "Check the unsubscribe link's real host before clicking, and know what a mismatch means.",
    "Prove a sender is past its legal deadline before escalating to a regulator.",
    "Decide what to do when mail arrives at an alias you only ever gave to a different company.",
  ],
  benefits: [
    ["A concrete route, not a warning", "Each verdict comes with numbered steps for the specific action to take."],
    ["Deadline dates, not vague promises", "Business-day and calendar-day rules are counted out to an actual date."],
    ["Explains the one-click mechanism", "Why the client's own button leaks less than the link inside the message body."],
  ],
  faqs: [
    [
      "Is it safe to click unsubscribe in a spam email?",
      "No. On mail you never signed up for, the unsubscribe link is a delivery confirmation: the click proves a person reads the address, which raises its value on a resale list. Report the message as spam instead — that trains your filter and never contacts the sender.",
    ],
    [
      "How long does a company have to stop emailing me after I unsubscribe?",
      "Under CAN-SPAM in the United States and CASL in Canada it is 10 business days, and the unsubscribe mechanism itself must keep working for at least 30 days (CAN-SPAM) or 60 days (CASL) after the message was sent. Bulk senders to Gmail and Yahoo have had to process one-click unsubscribes within two days since February 2024, and under GDPR a rights request must be answered within one month.",
    ],
    [
      "What is one-click unsubscribe?",
      "It is the RFC 8058 mechanism: the message carries a List-Unsubscribe header with an HTTPS endpoint and a List-Unsubscribe-Post header, so your mail provider can send a single POST on your behalf. Nothing opens in your browser, which is why the button at the top of the message is safer than the link in the body.",
    ],
    [
      "Should I reply asking to be removed?",
      "Never reply to unsolicited mail. A reply is the strongest possible confirmation that the address is live and monitored, and the reply-to address on spam is frequently a different account set up to harvest exactly those responses.",
    ],
  ],
};

export default seo;
