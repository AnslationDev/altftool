const seo = {
  intro:
    "Sick Leave Email Generator writes the short note a manager actually needs when you are ill: the dates you are off, the day you expect to be back, and who is covering your work. It calculates the return date as the next working day after your last day off, skipping weekends, and scores the finished email against a 45-110 word target — long enough to answer the obvious questions, short enough to read on a phone. Symptom detail is never generated, because in most workplaces you are not obliged to describe a medical condition to your line manager.",
  useCases: [
    "Send a same-morning note saying you are out sick today, with the cover named and nothing else.",
    "Cover a Thursday-to-Friday absence and have the return date come out as the following Monday automatically.",
    "Flag the one deliverable that cannot slip, so your manager knows what to reassign and what can wait.",
    "Check that a note you have already drafted is not over-explaining before you send it.",
  ],
  benefits: [
    ["Return date worked out for you", "The next working day after your last day off is calculated, so a Friday absence returns on Monday, not Saturday."],
    ["Length verdict", "The word count is judged against a 45-110 word target and tells you when the note has started justifying itself."],
    ["No symptom detail", "The email states that you are unwell and stops there — the facts a manager needs, without medical disclosure."],
  ],
  faqs: [
    [
      "What should a sick leave email say?",
      "Three things: the dates you will be away, the day you expect to be back, and who is covering your work. Anything beyond that — symptoms, apologies, explanations — makes the email longer without making it more useful. Aim for roughly 45 to 110 words.",
    ],
    [
      "Do I have to say what illness I have?",
      "In most workplaces, no. You need to say that you are unwell and unable to work; medical detail belongs on a certificate given to HR if one is required, not in a message to your line manager. Check your own employer's policy, as some regulated roles differ.",
    ],
    [
      "When should I send a sick leave email?",
      "As early as you reasonably can on the first morning, ideally before your working day starts, so cover can be arranged. If your workplace has a call-in requirement, follow that first and send the email as the written record.",
    ],
    [
      "Do I need a medical certificate for one day off sick?",
      "That depends on your employer's policy and the state Shops and Establishments Act that applies — many employers ask for a certificate only from the third consecutive day. Mention a certificate in the email only if you are actually attaching one.",
    ],
  ],
};

export default seo;
