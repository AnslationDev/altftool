const seo = {
  title: "Gym Marketing Prompt Pack: Seven Message Types",
  metaDescription:
    "Build AI prompts for gym offers, class copy, check-ins and win-backs carrying the real channel limit: 160 SMS, 1024 WhatsApp, 2200 Instagram.",
  steps: [
    "Fill Gym or studio name and City or locality, then answer \"Who is this message for?\" and \"What is being sold or described?\".",
    "Enter \"Package price (INR, 0 if not quoting one)\" and \"Package length (days)\", then choose a Message type — Membership offer, Class description, Member check-in, Lapsed member win-back, Free trial follow-up, Referral request or Social caption — and a Channel.",
    "The panel reports \"Copy limit for this channel\" (160 for SMS, 1024 for a WhatsApp template, 2200 for an Instagram caption), plus Offer cost per day and Monthly equivalent baked into the prompt; press Copy result.",
  ],
  intro:
    "Gym Marketing Prompt Pack builds a structured AI prompt — role, context, task, hard constraints and output format — for the seven messages a gym actually sends: membership offers, class descriptions, member check-ins, win-backs, trial follow-ups, referral asks and social captions. Each prompt carries the real character limit of the channel you picked (160 for an SMS segment, 1024 for a WhatsApp template body, 2200 for an Instagram caption) and the true per-day and per-month cost of the package, so the copy that comes back cannot invent a price or overrun the field.",
  useCases: [
    "Turn a 12,000-rupee three-month membership into a WhatsApp offer that quotes the honest 4,058-rupee monthly equivalent instead of a vague 'affordable plans'.",
    "Write a class description that tells the wrong person not to book, cutting no-shows in a beginners' session.",
    "Draft a lapsed-member message that acknowledges life got busy, offers one easy way back, and includes a clean opt-out line.",
    "Produce three SMS variants that all fit inside a single 160-character segment so you are not billed for two.",
  ],
  benefits: [
    [
      "Real channel limits, not guesses",
      "The 160, 1024 and 2200 character figures come from the GSM alphabet spec and the platforms' own published limits.",
    ],
    [
      "Price maths done before the prompt runs",
      "Per-day and monthly-equivalent figures are computed from your price and package length, so the model is told the numbers rather than asked to derive them.",
    ],
    [
      "Guardrails built into the prompt",
      "Every prompt bans invented testimonials, health claims and hype vocabulary, which is where fitness copy usually goes wrong.",
    ],
  ],
  faqs: [
    [
      "How many characters can a marketing SMS be?",
      "160 characters per segment when the message uses only the GSM 7-bit default alphabet defined in 3GPP TS 23.038. A single emoji or Devanagari character switches the encoding to UCS-2 and drops the segment size to 70 characters, so the same message can suddenly cost two or three segments.",
    ],
    [
      "What is the character limit on a WhatsApp template message?",
      "The WhatsApp Business Platform allows 1024 characters in a message template body. Templates also have to be submitted and approved before you can send them, so write the copy with the approval reviewer in mind, not just the reader.",
    ],
    [
      "Should a gym offer be advertised per month or as a total?",
      "Show both and let the reader pick. A 12,000-rupee package over 90 days is about 133 rupees a day or 4,058 rupees a month, and the monthly figure usually lands better against the price of a competitor's monthly plan while the total keeps you honest about the commitment.",
    ],
    [
      "Can I use these prompts for messages to Indian mobile numbers?",
      "The prompts only generate copy. Sending promotional SMS to Indian numbers additionally requires DLT registration of your sender ID and template with the telecom operator, and consent handling under the applicable regulations. Check your compliance obligations before your first campaign.",
    ],
  ],
};

export default seo;
